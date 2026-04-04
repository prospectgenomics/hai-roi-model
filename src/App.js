import { useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PROSPECT GENOMICS — Genomic Surveillance Value Analysis (Sales Tool)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  teal:"#1a6b5e", teal2:"#228574", teal3:"#2da08c",
  tealPale:"#e6f2ef", tealXp:"#f2faf8",
  green:"#16a34a", amber:"#d97706", red:"#dc2626", redPale:"#fef2f2",
  txt:"#0f1117", txt2:"#4b5563", txt3:"#9ca3af",
  bg:"#f6f8fa", s0:"#ffffff", border:"#e1e5ea", border2:"#c9d0da",
};
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";
const FONT_DISPLAY = "'Instrument Serif', Georgia, serif";

// ─────────────────────────────────────────────────────────────────────────────
// BENCHMARK HOSPITALS
// ─────────────────────────────────────────────────────────────────────────────
const HOSPITAL_SIZES = [
  {id:"small",   label:"Small",   beds:"< 100 beds",   totalRevenueMn:60,  medicareRevenuePct:0.28, admissionsPerYear:4000,  patientDaysPerYear:22000,  surgicalProcedures:900,   cultureVolumes:{mrsa:20, cdi:13,cre:3, abx:2, mssa:15 }, hais:{clabsi:6, cauti:28, cdi:13,mrsa:6, vae:8, ssi:28 }},
  {id:"medium",  label:"Medium",  beds:"100–299 beds", totalRevenueMn:175, medicareRevenuePct:0.23, admissionsPerYear:14000, patientDaysPerYear:75000,  surgicalProcedures:3500,  cultureVolumes:{mrsa:68, cdi:43,cre:10,abx:8, mssa:50 }, hais:{clabsi:18,cauti:78, cdi:43,mrsa:18,vae:22,ssi:98 }},
  {id:"large",   label:"Large",   beds:"300–499 beds", totalRevenueMn:400, medicareRevenuePct:0.21, admissionsPerYear:32000, patientDaysPerYear:160000, surgicalProcedures:8500,  cultureVolumes:{mrsa:145,cdi:91,cre:24,abx:20,mssa:110}, hais:{clabsi:35,cauti:150,cdi:91,mrsa:38,vae:44,ssi:220}},
  {id:"academic",label:"Academic",beds:"500+ beds",    totalRevenueMn:800, medicareRevenuePct:0.19, admissionsPerYear:60000, patientDaysPerYear:310000, surgicalProcedures:18000, cultureVolumes:{mrsa:280,cdi:177,cre:55,abx:50,mssa:215}, hais:{clabsi:62,cauti:280,cdi:177,mrsa:75,vae:84,ssi:440}},
];

// ─────────────────────────────────────────────────────────────────────────────
// HAI COST BASIS — AHRQ 2017, inflated to 2024 USD (+29% CPI Medical Care)
// ─────────────────────────────────────────────────────────────────────────────
const CPI = 1.29;
const HAI_COSTS = {
  clabsi: Math.round(48108 * CPI),
  cauti:  Math.round(13793 * CPI),
  cdi:    Math.round(17000 * CPI),
  mrsa:   Math.round(42000 * CPI),
  vae:    Math.round(32000 * CPI),
  ssi:    Math.round(21000 * CPI),
};
// Fraction of each HAI type attributable to cross-transmission (genomically detectable)
const TRANS_FRAC = {clabsi:0.45, cauti:0.32, cdi:0.38, mrsa:0.42, vae:0.38, ssi:0.42};

// ─────────────────────────────────────────────────────────────────────────────
// SURVEILLANCE PROGRAM LEVELS
// ─────────────────────────────────────────────────────────────────────────────
const PROGRAMS = [
  {
    id:"m1", name:"Full Genomic Surveillance", color:C.teal,
    detectionRate:0.90, interventionLagCases:1.5, envMultiplier:1.25, valueType:"immediate",
    lagLabel:"1–2 cases",
    description:"Clinical and environmental samples sequenced continuously. Real-time transmission maps and immediate cluster alerts across the entire facility.",
  },
  {
    id:"m2", name:"Active Surveillance", color:C.teal2,
    detectionRate:0.73, interventionLagCases:2.5, envMultiplier:1.0, valueType:"immediate",
    lagLabel:"2–3 cases",
    description:"Every positive clinical culture sequenced as reported. Real-time genomic cluster detection from clinical specimens with automated alerting.",
  },
  {
    id:"m3", name:"Triggered Monitoring", color:C.amber,
    detectionRate:0.40, interventionLagCases:5.0, envMultiplier:1.0, valueType:"delayed",
    lagLabel:"4–6 cases",
    description:"Sequencing requested when your infection prevention team suspects a cluster. Genomic investigation available on demand, no standing infrastructure.",
  },
  {
    id:"m4", name:"Outbreak Response", color:"#78716c",
    detectionRate:0.20, interventionLagCases:8.0, envMultiplier:1.0, valueType:"future",
    lagLabel:"Outbreak declared",
    description:"Sequencing deployed after an outbreak is formally declared. Primary value is identifying persistent reservoirs to prevent future recurrence.",
  },
];

// Plain-English infection labels
const INFECTION_FULL  = {clabsi:"Central line bloodstream infections", cauti:"Catheter-associated urinary tract infections", cdi:"C. difficile infections", mrsa:"MRSA bloodstream infections", vae:"Ventilator-associated events", ssi:"Surgical site infections"};
const INFECTION_LABEL = {clabsi:"Central line", cauti:"Catheter UTI", cdi:"C. difficile", mrsa:"MRSA bacteremia", vae:"Ventilator events", ssi:"Surgical site"};

// Fixed model parameters (not exposed in sales UI)
const AVG_CLUSTER      = 5;
const P_FRAC           = 0.75;  // cluster interruption rate
const M4_RESERVOIR     = 0.55;  // M4 reservoir identification rate
const HACRP_EXPOSURE   = 0.40;  // fraction of max penalty at baseline

// ─────────────────────────────────────────────────────────────────────────────
// MATH
// ─────────────────────────────────────────────────────────────────────────────
function calcSeqs(hosp, prog, incSSI) {
  const total = Object.values(hosp.cultureVolumes).reduce((a,b)=>a+b,0);
  let s = prog.id==="m1"?Math.round(total*prog.envMultiplier)
        : prog.id==="m2"?total
        : prog.id==="m3"?Math.round(total*0.30)
        : Math.round(total*0.12);
  if (incSSI) {
    const ssi = Math.round((hosp.surgicalProcedures||0)*0.15*0.026);
    s += prog.id==="m1"||prog.id==="m2"?ssi:prog.id==="m3"?Math.round(ssi*0.35):Math.round(ssi*0.15);
  }
  return s;
}

function calcPrevented(hosp, prog, incSSI) {
  const lag   = Math.min(prog.interventionLagCases / AVG_CLUSTER, 0.85);
  const types = incSSI?["clabsi","cauti","cdi","mrsa","vae","ssi"]:["clabsi","cauti","cdi","mrsa","vae"];
  let total=0; const byType={};
  for (const t of types) {
    const annual = hosp.hais[t]||0;
    const val = prog.valueType==="future"
      ? annual * TRANS_FRAC[t] * P_FRAC * M4_RESERVOIR * (AVG_CLUSTER/Math.max(annual,1))
      : annual * TRANS_FRAC[t] * P_FRAC * prog.detectionRate * (1-lag);
    byType[t]=Math.round(val*10)/10;
    total+=val;
  }
  return {total, byType};
}

function calcCosts(byType) {
  let total=0; const breakdown={};
  for (const [t,n] of Object.entries(byType)) { breakdown[t]=n*(HAI_COSTS[t]||0); total+=breakdown[t]; }
  return {total, breakdown};
}

function calcHACRP(hosp, totalHAIs, prevented) {
  const mr  = hosp.totalRevenueMn*1e6*hosp.medicareRevenuePct;
  const max = mr*0.01;
  const base= max*HACRP_EXPOSURE;
  const rf  = Math.min(prevented/Math.max(totalHAIs,1), 0.85);
  return {maxPenalty:max, baselineExposure:base, saved:base*rf};
}

function runAll(hosp, incSSI) {
  const types   = incSSI?["clabsi","cauti","cdi","mrsa","vae","ssi"]:["clabsi","cauti","cdi","mrsa","vae"];
  const totalHAIs = types.reduce((a,t)=>a+(hosp.hais[t]||0),0);
  const out={};
  for (const prog of PROGRAMS) {
    const prev  = calcPrevented(hosp, prog, incSSI);
    const cost  = calcCosts(prev.byType);
    const hacrp = calcHACRP(hosp, totalHAIs, prev.total);
    out[prog.id]={seqs:calcSeqs(hosp,prog,incSSI), prev, cost, hacrp, totalValue:cost.total+hacrp.saved};
  }
  return {results:out, totalHAIs};
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fm  = n => n>=1e6?`$${(n/1e6).toFixed(1)}M`:n>=1e3?`$${(n/1e3).toFixed(0)}K`:`$${Math.round(n).toLocaleString()}`;
const fn  = n => n>=10?Math.round(n):Math.round(n*10)/10;
const pct = v => `${Math.round(v*100)}%`;

// ─────────────────────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function SInput({label, value, onChange, min=0, max}) {
  return (
    <div style={{marginBottom:8}}>
      <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2,fontWeight:600}}>{label}</div>
      <input type="number" min={min} max={max} value={value===0?"":value}
        onChange={e=>{const v=parseInt(e.target.value)||0; onChange(max!=null?Math.max(min,Math.min(max,v)):Math.max(min,v));}}
        onFocus={e=>e.target.select()}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,padding:"5px 7px",color:C.txt,fontFamily:FONT_BODY,fontSize:13,outline:"none",boxSizing:"border-box"}}
        onMouseOver={e=>e.target.style.borderColor=C.teal3}
        onMouseOut={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
}

function Toggle({on, onClick, label, note}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
      <button onClick={onClick} style={{width:34,height:18,borderRadius:9,cursor:"pointer",background:on?C.teal:C.border2,border:"none",position:"relative",flexShrink:0,transition:"background 0.15s"}}>
        <div style={{width:12,height:12,borderRadius:"50%",background:C.s0,position:"absolute",top:3,left:on?19:3,transition:"left 0.12s"}}/>
      </button>
      <div>
        <div style={{fontSize:12,color:on?C.teal:C.txt3,fontWeight:600}}>{label}</div>
        {note&&<div style={{fontSize:10,color:C.txt3,lineHeight:1.3}}>{note}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAM CARD
// ─────────────────────────────────────────────────────────────────────────────
function ProgramCard({prog, result, showPricing, subFee}) {
  const {prev, cost, hacrp, totalValue} = result;
  const net     = totalValue - subFee;
  const roi     = subFee>0 ? totalValue/subFee : null;
  const positive= net>=0;

  return (
    <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <div style={{height:4,background:prog.color}}/>

      {/* Name + description */}
      <div style={{padding:"14px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:prog.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>
          {prog.name}
        </div>
        <div style={{fontSize:11,color:C.txt3,lineHeight:1.5,marginBottom:12}}>
          {prog.description}
        </div>
        {/* Headline value */}
        <div style={{background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,padding:"9px 12px",textAlign:"center"}}>
          <div style={{fontSize:9,color:C.teal2,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>Annual value to hospital</div>
          <div style={{fontSize:24,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums"}}>{fm(totalValue)}</div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{padding:"10px 16px 12px",flex:1}}>
        {[
          ["Infections prevented per year", fn(prev.total)+(prog.valueType==="future"?" *":"")],
          ["Direct cost savings",           fm(cost.total)],
          ["Medicare quality savings",      fm(hacrp.saved)],
          ["Cluster detected by",           prog.lagLabel],
        ].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.txt3,paddingRight:8}}>{k}</div>
            <div style={{fontSize:12,fontWeight:700,color:C.txt,fontVariantNumeric:"tabular-nums",flexShrink:0}}>{v}</div>
          </div>
        ))}

        {/* Pricing — revealed on toggle */}
        {showPricing&&subFee>0&&(
          <div style={{marginTop:10,padding:"10px 12px",background:positive?C.tealXp:C.redPale,border:`1px solid ${positive?C.tealPale:"#fecaca"}`,borderRadius:8}}>
            {[
              ["Program investment",   fm(subFee)+"/yr"],
              ["Net annual value",     (net>=0?"+":"")+fm(net)],
              ["Return on investment", roi!=null?roi.toFixed(1)+"×":"—"],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                <div style={{fontSize:10,color:positive?C.teal:C.red}}>{k}</div>
                <div style={{fontSize:13,fontWeight:700,color:positive?C.teal:C.red,fontVariantNumeric:"tabular-nums"}}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {prog.valueType==="future"&&(
          <div style={{marginTop:8,fontSize:9,color:C.txt3,lineHeight:1.4}}>
            * Outbreak Response prevents recurrence, not active transmission. Value reflects reservoir identification and faster future responses.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETECTION ADVANTAGE
// ─────────────────────────────────────────────────────────────────────────────
function DetectionAdvantage() {
  const rows = [
    {label:"Without genomics",          cases:"8+ cases", pct:100, color:C.border2, labelColor:C.txt3,  desc:"Cluster recognized only after an outbreak is declared — most transmissions have already occurred"},
    {label:"Outbreak Response",         cases:"8+ cases", pct:100, color:"#a8a29e",  labelColor:"#78716c", desc:"Sequencing begins at outbreak declaration — same detection window as conventional surveillance"},
    {label:"Triggered Monitoring",      cases:"4–6 cases",pct:60,  color:C.amber,   labelColor:C.amber,  desc:"IP team suspects a cluster and triggers genomic investigation"},
    {label:"Active Surveillance",       cases:"2–3 cases",pct:30,  color:C.teal2,   labelColor:C.teal2,  desc:"Automated genomic alert before the cluster has spread widely"},
    {label:"Full Genomic Surveillance", cases:"1–2 cases",pct:15,  color:C.teal,    labelColor:C.teal,   desc:"Real-time detection — often identifying the index case before secondary transmissions"},
  ];
  return (
    <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"22px 24px"}}>
      <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700,marginBottom:4}}>The detection advantage</div>
      <div style={{fontSize:20,fontWeight:700,fontFamily:FONT_DISPLAY,color:C.txt,marginBottom:6,lineHeight:1.2}}>
        How early can your team stop a transmission cluster?
      </div>
      <div style={{fontSize:12,color:C.txt2,lineHeight:1.6,marginBottom:20,maxWidth:680}}>
        In a typical cluster of 5 cases, the surveillance program determines how many infections have already happened before your IP team can intervene. Each case you catch earlier is a patient protected and a cost avoided.
      </div>
      <div style={{overflowX:"auto"}}>
        {rows.map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:14,marginBottom:9}}>
            <div style={{width:200,fontSize:11,color:r.labelColor,fontWeight:i===0?400:600,flexShrink:0,lineHeight:1.3}}>{r.label}</div>
            <div style={{flex:1,minWidth:120,height:22,background:C.bg,borderRadius:5,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${r.pct}%`,background:r.color,borderRadius:5,opacity:i===0?0.35:0.75,transition:"width 0.3s"}}/>
            </div>
            <div style={{width:80,fontSize:12,fontWeight:700,color:r.labelColor,fontVariantNumeric:"tabular-nums",flexShrink:0}}>{r.cases}</div>
            <div style={{width:300,fontSize:10,color:C.txt3,lineHeight:1.4,flexShrink:0}}>{r.desc}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:14,padding:"10px 14px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,fontSize:11,color:C.txt2,lineHeight:1.5}}>
        <strong style={{color:C.teal}}>Why this matters:</strong> Every case that occurs before your team intervenes represents an infection that could have been prevented. The bar shows the fraction of a typical 5-case cluster that has already occurred at each detection point.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INFECTION BREAKDOWN TABLE
// ─────────────────────────────────────────────────────────────────────────────
function InfectionTable({results, hosp, incSSI}) {
  const types = incSSI?["clabsi","cauti","cdi","mrsa","vae","ssi"]:["clabsi","cauti","cdi","mrsa","vae"];
  return (
    <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:2}}>Infections by type</div>
        <div style={{fontSize:12,color:C.txt3}}>Annual cases and how many each program level can prevent</div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`2px solid ${C.border}`}}>
              <th style={{padding:"9px 18px",textAlign:"left",color:C.txt3,fontWeight:600,textTransform:"uppercase",fontSize:10,letterSpacing:"0.05em",minWidth:200}}>Infection type</th>
              <th style={{padding:"9px 12px",textAlign:"right",color:C.txt3,fontWeight:600,textTransform:"uppercase",fontSize:10,letterSpacing:"0.05em"}}>Cases/yr</th>
              <th style={{padding:"9px 12px",textAlign:"right",color:C.txt3,fontWeight:600,textTransform:"uppercase",fontSize:10,letterSpacing:"0.05em"}}>Cost per case</th>
              {PROGRAMS.map(p=>(
                <th key={p.id} style={{padding:"9px 12px",textAlign:"right",color:p.color,fontWeight:700,fontSize:10,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>
                  {p.name.split(" ").slice(0,2).join(" ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.map((t,i)=>(
              <tr key={t} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>
                <td style={{padding:"9px 18px",color:C.txt,fontWeight:600}}>{INFECTION_FULL[t]}</td>
                <td style={{padding:"9px 12px",textAlign:"right",color:C.txt2,fontVariantNumeric:"tabular-nums"}}>{hosp.hais[t]||0}</td>
                <td style={{padding:"9px 12px",textAlign:"right",color:C.txt2,fontVariantNumeric:"tabular-nums"}}>{fm(HAI_COSTS[t])}</td>
                {PROGRAMS.map(p=>{
                  const n=results[p.id]?.prev?.byType?.[t]??0;
                  return (
                    <td key={p.id} style={{padding:"9px 12px",textAlign:"right",color:n>0?p.color:C.border2,fontWeight:n>0?700:400,fontVariantNumeric:"tabular-nums"}}>
                      {n>0?fn(n):"—"}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Total row */}
            <tr style={{borderTop:`2px solid ${C.border2}`,background:C.tealXp}}>
              <td style={{padding:"9px 18px",color:C.teal,fontWeight:700}} colSpan={3}>Total infections prevented per year</td>
              {PROGRAMS.map(p=>(
                <td key={p.id} style={{padding:"9px 12px",textAlign:"right",color:p.color,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>
                  {fn(results[p.id]?.prev?.total??0)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [hospital,     setHospital]    = useState({...HOSPITAL_SIZES[1]});
  const [benchIdx,     setBenchIdx]    = useState(1);
  const [incSSI,       setIncSSI]      = useState(false);
  const [showPricing,  setShowPricing] = useState(false);
  const [subFee,       setSubFee]      = useState(100000);
  const [showRevenue,  setShowRevenue] = useState(false);

  const setField = (path,val) => {
    setBenchIdx(null);
    setHospital(prev=>{
      const next={...prev};
      if (path.includes(".")){const [a,b]=path.split("."); next[a]={...next[a],[b]:val};}
      else next[path]=val;
      return next;
    });
  };
  const applyBench = i => { setBenchIdx(i); setHospital({...HOSPITAL_SIZES[i]}); };

  const {results, totalHAIs} = useMemo(()=>runAll(hospital,incSSI),[hospital,incSSI]);
  const medRev = hospital.totalRevenueMn*1e6*hospital.medicareRevenuePct;

  const benchLabel = benchIdx!=null ? HOSPITAL_SIZES[benchIdx].label : "Custom";

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT_BODY,color:C.txt}}>

      {/* ── HEADER ── */}
      <div style={{background:C.s0,borderBottom:`1px solid ${C.border}`,padding:"11px 24px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1260,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,background:C.teal,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:C.s0,fontSize:15,fontWeight:800}}>P</span>
            </div>
            <div>
              <div style={{fontSize:10,color:C.teal,fontWeight:700,letterSpacing:"0.04em"}}>Prospect Genomics</div>
              <div style={{fontSize:15,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY,lineHeight:1.1}}>Genomic Surveillance Value Analysis</div>
            </div>
          </div>
          <div style={{fontSize:11,color:C.txt3,textAlign:"right"}}>
            <div>prospectgenomics.bio</div>
            <div>shawn@prospectgenomics.bio</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1260,margin:"0 auto",padding:"20px 24px 60px",display:"flex",gap:20,alignItems:"flex-start"}}>

        {/* ── SIDEBAR ── */}
        <div style={{width:282,flexShrink:0,background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,position:"sticky",top:58,maxHeight:"calc(100vh - 74px)",overflowY:"auto"}}>

          {/* Hospital name */}
          <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,marginBottom:5}}>Hospital name</div>
            <input type="text" value={hospital.name||""} onChange={e=>setField("name",e.target.value)}
              placeholder="Enter hospital name..."
              style={{width:"100%",background:C.bg,border:`1px solid ${C.teal}`,borderRadius:6,padding:"7px 10px",color:C.txt,fontFamily:FONT_BODY,fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"}}/>
          </div>

          {/* Benchmark size */}
          <div style={{padding:"10px 14px 12px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,marginBottom:7}}>Hospital size</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {HOSPITAL_SIZES.map((h,i)=>(
                <button key={h.id} onClick={()=>applyBench(i)}
                  style={{padding:"8px 9px",borderRadius:7,cursor:"pointer",border:`1px solid ${benchIdx===i?C.teal:C.border}`,background:benchIdx===i?C.tealXp:C.bg,color:benchIdx===i?C.teal:C.txt2,fontFamily:FONT_BODY,fontSize:11,fontWeight:benchIdx===i?700:500,textAlign:"left"}}>
                  <div style={{fontFamily:FONT_DISPLAY,fontSize:12,marginBottom:1}}>{h.label}</div>
                  <div style={{fontSize:9,opacity:0.7}}>{h.beds}</div>
                </button>
              ))}
            </div>
            {benchIdx===null&&<div style={{marginTop:5,fontSize:9,color:C.amber}}>Custom data</div>}
          </div>

          {/* HAI counts */}
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,marginBottom:2}}>Annual reported infections</div>
            <div style={{fontSize:10,color:C.txt3,marginBottom:8,lineHeight:1.4}}>Edit to match this hospital's data</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {["clabsi","cauti","cdi","mrsa","vae"].map(t=>(
                <SInput key={t} label={INFECTION_LABEL[t]} value={hospital.hais[t]||0} onChange={v=>setField(`hais.${t}`,v)}/>
              ))}
            </div>
            <div style={{marginTop:4}}>
              <Toggle on={incSSI} onClick={()=>setIncSSI(!incSSI)} label={incSSI?"Surgical site infections included":"Add surgical site infections"}/>
              {incSSI&&<SInput label="Surgical site infections" value={hospital.hais.ssi||0} onChange={v=>setField("hais.ssi",v)}/>}
            </div>
          </div>

          {/* Medicare revenue — collapsible */}
          <div style={{borderBottom:`1px solid ${C.border}`}}>
            <button onClick={()=>setShowRevenue(!showRevenue)}
              style={{width:"100%",padding:"9px 14px",background:"transparent",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:FONT_BODY}}>
              <span style={{fontSize:9,fontWeight:700,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Medicare revenue (penalty calculation)</span>
              <span style={{fontSize:9,color:C.txt3}}>{showRevenue?"▲":"▼"}</span>
            </button>
            {showRevenue&&(
              <div style={{padding:"0 14px 12px"}}>
                <SInput label="Total hospital revenue ($M)" value={hospital.totalRevenueMn} onChange={v=>setField("totalRevenueMn",v)} min={1}/>
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5,fontWeight:600}}>Medicare as % of revenue</div>
                  <input type="range" min={0.10} max={0.45} step={0.01} value={hospital.medicareRevenuePct}
                    onChange={e=>setField("medicareRevenuePct",parseFloat(e.target.value))}
                    style={{width:"100%",accentColor:C.teal,height:4}}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.txt3,marginTop:2}}>
                    <span>10%</span>
                    <span style={{fontWeight:700,color:C.teal}}>{pct(hospital.medicareRevenuePct)}</span>
                    <span>45%</span>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"8px 10px",background:C.tealXp,borderRadius:7}}>
                  {[["Medicare revenue",fm(medRev)],["Max penalty (1%)",fm(medRev*0.01)]].map(([k,v])=>(
                    <div key={k}>
                      <div style={{fontSize:9,color:C.teal,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:1}}>{k}</div>
                      <div style={{fontSize:12,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Investment toggle */}
          <div style={{padding:"12px 14px"}}>
            <Toggle on={showPricing} onClick={()=>setShowPricing(!showPricing)}
              label="Show investment & ROI"
              note="Reveal program cost and return on investment"/>
            {showPricing&&(
              <div style={{marginTop:6}}>
                <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4,fontWeight:600}}>Annual subscription</div>
                <input type="number" min={25000} max={500000} step={5000} value={subFee}
                  onChange={e=>setSubFee(parseInt(e.target.value)||100000)}
                  onFocus={e=>e.target.select()}
                  style={{width:"100%",background:C.bg,border:`1px solid ${C.teal}`,borderRadius:5,padding:"6px 9px",color:C.teal,fontFamily:FONT_BODY,fontSize:15,fontWeight:700,outline:"none",boxSizing:"border-box"}}/>
                <input type="range" min={25000} max={500000} step={5000} value={subFee}
                  onChange={e=>setSubFee(parseInt(e.target.value))}
                  style={{width:"100%",accentColor:C.teal,height:4,marginTop:6}}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.txt3,marginTop:2}}>
                  <span>$25K</span>
                  <span style={{fontWeight:700,color:C.teal}}>${(subFee/1000).toFixed(0)}K/yr</span>
                  <span>$500K</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{flex:1,minWidth:0}}>

          {/* Hero block */}
          <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"22px 26px",marginBottom:18}}>
            <div style={{fontSize:11,color:C.txt3,marginBottom:6}}>
              {benchLabel} hospital · {totalHAIs} annual infections · {hospital.admissionsPerYear?.toLocaleString()} admissions/yr
            </div>
            <div style={{fontSize:30,fontWeight:700,fontFamily:FONT_DISPLAY,color:C.txt,marginBottom:10,lineHeight:1.2}}>
              {hospital.name||"Your hospital"} could generate{" "}
              <span style={{color:C.teal}}>{fm(results.m1.totalValue)}</span> per year
              <span style={{fontSize:16,color:C.txt3,fontFamily:FONT_BODY,fontWeight:400}}> with genomic surveillance</span>
            </div>
            <div style={{fontSize:13,color:C.txt2,lineHeight:1.6,marginBottom:18,maxWidth:700}}>
              Whole-genome sequencing identifies transmission clusters earlier — stopping infections before they spread.
              The value below reflects avoided infection costs and Medicare quality penalty protection,
              from a hospital financial perspective.
            </div>

            {/* Value summary row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {PROGRAMS.map(p=>{
                const v=results[p.id].totalValue;
                const net=v-subFee;
                return (
                  <div key={p.id} style={{textAlign:"center",padding:"12px 8px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:9,color:p.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5,lineHeight:1.3}}>{p.name}</div>
                    <div style={{fontSize:20,fontWeight:700,color:p.color,fontVariantNumeric:"tabular-nums"}}>{fm(v)}</div>
                    <div style={{fontSize:9,color:C.txt3,marginTop:2}}>annual value</div>
                    {showPricing&&subFee>0&&(
                      <div style={{fontSize:10,fontWeight:700,color:net>=0?C.green:C.red,marginTop:4,fontVariantNumeric:"tabular-nums"}}>
                        {net>=0?"ROI "+results[p.id].totalValue/subFee<10?(results[p.id].totalValue/subFee).toFixed(1)+"×":Math.round(results[p.id].totalValue/subFee)+"×":"Below cost"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Program cards 2×2 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
            {PROGRAMS.map(p=>(
              <ProgramCard key={p.id} prog={p} result={results[p.id]} showPricing={showPricing} subFee={subFee}/>
            ))}
          </div>

          {/* Detection advantage */}
          <div style={{marginBottom:18}}>
            <DetectionAdvantage/>
          </div>

          {/* Infection breakdown */}
          <div style={{marginBottom:18}}>
            <InfectionTable results={results} hosp={hospital} incSSI={incSSI}/>
          </div>

          {/* About this analysis */}
          <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 22px",marginBottom:18}}>
            <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:10}}>About this analysis</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18,fontSize:11,color:C.txt2,lineHeight:1.6}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:C.txt,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Methodology</div>
                Decision-analytic cost-benefit model following CHEERS 2022. Hospital financial perspective only. 2024 USD, 1-year time horizon.
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:C.txt,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Cost basis</div>
                Infection costs from AHRQ 2017 national meta-analysis, adjusted for medical inflation (+29% since 2015). Total attributable costs shown.
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:C.txt,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Key assumptions</div>
                75% of detected clusters successfully interrupted. Transmission fraction per infection type from published genomic surveillance studies.
              </div>
            </div>
            <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`,fontSize:10,color:C.txt3,lineHeight:1.5}}>
              Estimates are directional — for planning and conversation purposes, not audited financial projections.
              Medicare quality penalty calculation assumes ~40% baseline exposure to the CMS Hospital-Acquired Condition Reduction Program (HACRP).
              Full technical model with probabilistic sensitivity analysis: <strong style={{color:C.teal}}>prospectgenomics.github.io/hai-roi-model</strong>.
              Prospect Genomics has a commercial interest in the described service.
            </div>
          </div>

          {/* Footer */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.txt3}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:22,height:22,background:C.teal,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:C.s0,fontSize:12,fontWeight:800}}>P</span>
              </div>
              <span style={{fontWeight:600,color:C.txt2}}>Prospect Genomics</span>
            </div>
            <div style={{textAlign:"right"}}>
              <div>Shawn Hawken, Co-Founder &amp; CEO</div>
              <div>shawn@prospectgenomics.bio · prospectgenomics.bio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

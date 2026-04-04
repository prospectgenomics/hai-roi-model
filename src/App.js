import { useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PROSPECT GENOMICS — HAI Prevention Value Calculator
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  teal:      "#1a6b5e",
  teal2:     "#228574",
  teal3:     "#2da08c",
  tealPale:  "#e6f2ef",
  tealXp:    "#f2faf8",
  tealDeep:  "#0f4039",
  green:     "#16a34a",
  amber:     "#d97706",
  red:       "#dc2626",
  redPale:   "#fef2f2",
  txt:       "#0f1117",
  txt2:      "#4b5563",
  txt3:      "#9ca3af",
  bg:        "#f6f8fa",
  s0:        "#ffffff",
  border:    "#e1e5ea",
  border2:   "#c9d0da",
};
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";
const FONT_DISPLAY = "'Instrument Serif', Georgia, serif";
const FONT_MONO    = "'DM Mono', 'SF Mono', monospace"; // Tag badges only

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCES
// ─────────────────────────────────────────────────────────────────────────────
const REFS = {
  R1:  { id:"R1",  tag:"AHRQ 2017",           url:"https://www.ahrq.gov/hai/pfp/haccost2017-results.html",                              title:"Estimating the Additional Hospital Inpatient Cost and Mortality Associated with Selected Hospital-Acquired Conditions", org:"AHRQ", year:2017, note:"Meta-analysis: CLABSI $48,108 (7 studies); CAUTI $13,793; avg infectious HAC $31,000. Hospital perspective, 2015 USD." },
  R2:  { id:"R2",  tag:"Zimlichman 2013",      url:"https://pubmed.ncbi.nlm.nih.gov/23999228/",                                         title:"Health Care–Associated Infections: A Meta-analysis of Costs and Financial Impact on the US Health Care System", org:"JAMA Internal Medicine", year:2013, note:"CLABSI $45,814/case; SSI $20,785/case; total annual HAI cost $9.8B." },
  R3:  { id:"R3",  tag:"Forrester 2022",       url:"https://pubmed.ncbi.nlm.nih.gov/33881808/",                                         title:"Cost of Health Care-Associated Infections in the United States", org:"J Patient Saf / Stanford", year:2022, note:"2016 HCUP-NIS: $7.2–14.9B total annual HAI cost." },
  R4:  { id:"R4",  tag:"Zhang 2024",           url:"https://doi.org/10.1017/ice.2023.160",                                              title:"A 7-year analysis of attributable costs of HAIs in a network of community hospitals", org:"ICHE / SHEA", year:2024, note:"45 community hospitals: ~$1M/hospital/yr attributable HAI cost." },
  R5:  { id:"R5",  tag:"Anderson 2023",        url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10679173/",                                title:"Impact of HAIs on Costs and LOS 2019–2023", org:"OFID / IDSA", year:2023, note:"COVID-era HAI costs 178% higher 2019–2022." },
  R6:  { id:"R6",  tag:"CDC NHSN 2024",        url:"https://www.cdc.gov/healthcare-associated-infections/php/data/progress-report.html", title:"2024 National and State HAI Progress Report", org:"CDC/NHSN", year:2024, note:"1-in-31 hospital patients has an HAI on any given day." },
  R7:  { id:"R7",  tag:"Anderson 2012 DICON",  url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC3977691/",                                title:"Assessing the Relative Burden of HAIs in a Network of Community Hospitals", org:"ICHE", year:2012, note:"SSI 38%, CAUTI 26%, CDI 22%, CLABSI 12%, VAP 2%." },
  R8:  { id:"R8",  tag:"Ohishi 2021",          url:"https://www.spandidos-publications.com/10.3892/wasj.2021.131",                      title:"Blood culture at 63 Japanese healthcare facilities", org:"World Academy of Sciences Journal", year:2021, note:"≥200-bed hospitals: 21.5 blood cx sets/1,000 pt-days; positivity 15.4%." },
  R9:  { id:"R9",  tag:"Thaden 2018 EID",      url:"https://wwwnc.cdc.gov/eid/article/24/3/17-0961_article",                           title:"Artificial Differences in C. difficile Infection Rates Associated with Disparity in Testing", org:"Emerging Infectious Diseases (CDC)", year:2018, note:"Community hospitals: HO-CDI 0.57/1,000 pt-days." },
  R10: { id:"R10", tag:"Kadri 2024 OFID",      url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11505019/",                                title:"Organism-specific Trends in CRE Infections, 2012–2022", org:"OFID / IDSA", year:2024, note:"CRKP rate 2.44/10,000 hospitalizations in 2022." },
  R11: { id:"R11", tag:"Snitkin 2014",         url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4217156/",                                title:"Rising Rates of CRE in Community Hospitals", org:"ICHE", year:2014, note:"CRE detected in 64% of 25 community hospitals; rate increased >5-fold 2008–2012." },
  R12: { id:"R12", tag:"Thom 2024 EIP",        url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC12125674/",                                title:"Trends in Incidence of MRSA Bacteremia, Six EIP Sites, 2005–2022", org:"OFID / IDSA", year:2024, note:"Population-based active surveillance. HO-MRSA benchmark incidence rates." },
  R13: { id:"R13", tag:"Bhargava 2021 CID",    url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8315036/",                                title:"MRSA Transmission in ICUs: WGS of Patients, Environments, and HCWs", org:"Clinical Infectious Diseases / IDSA", year:2021, note:"WGS of 413 MRSA isolates in 4 ICUs. Identified inter-ICU clusters invisible to conventional surveillance." },
  R14: { id:"R14", tag:"Martin 2024 ICHE",     url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11149034/",                                title:"Impact of DcCP on WGS-defined MRSA HAIs", org:"ICHE / SHEA", year:2024, note:"MRSA HAI rate 4.22/10,000 pt-days. WGS-defined transmission quantified separately from endogenous HAI." },
  R15: { id:"R15", tag:"Haaber 2022 CID",      url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC9612791/",                                title:"Genomic Epidemiology Suggests Community Origins of HA-USA300 MRSA", org:"CID / IDSA", year:2022, note:"~18.9% of S. aureus acquisitions had WGS-supported patient-to-patient transmission evidence." },
  R16: { id:"R16", tag:"CMS HACRP",            url:"https://www.cms.gov/medicare/quality/value-based-programs/hospital-acquired-conditions", title:"Hospital-Acquired Condition Reduction Program", org:"CMS", year:2024, note:"1% Medicare FFS reduction for worst-performing quartile on composite HAC score." },
  R17: { id:"R17", tag:"Definitive HC 2023",   url:"https://www.definitivehc.com/blog/revenue-trends-at-u.s.-hospitals",                title:"Hospital Revenue and Expense Trends in U.S.", org:"Definitive Healthcare / Medicare Cost Report", year:2023, note:"Medicare ~19–28% of revenue by hospital size." },
  R18: { id:"R18", tag:"Kavanagh 2016 ARIC",   url:"https://aricjournal.biomedcentral.com/articles/10.1186/s13756-017-0193-0",           title:"The incidence of MRSA infections in the US", org:"Antimicrobial Resistance & Infection Control (BMC)", year:2016, note:"MRSA SIR ~0.988 vs 2010–11 baseline by end of 2015." },
  R19: { id:"R19", tag:"Toth 2022 CIDR",       url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC9394219/",                                title:"Modeling transmission of pathogens in healthcare settings", org:"Current Infectious Disease Reports", year:2022, note:"Contact precautions reduce MRSA transmission ~47%. WGS genomic surveillance likely cost-effective." },
  R20: { id:"R20", tag:"Shenoy 2024 CIDR",     url:"https://link.springer.com/article/10.1007/s11908-024-00836-w",                     title:"Whole Genome Sequencing Applications in Hospital Epidemiology and Infection Prevention", org:"Current Infectious Disease Reports", year:2024, note:"WGS identified 5 additional transmissions vs. spa-typing alone." },
  R21: { id:"R21", tag:"CHEERS 2022 (ISPOR)",  url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10297740/",                                title:"Consolidated Health Economic Evaluation Reporting Standards 2022 (CHEERS 2022) Statement", org:"Value in Health / ISPOR", year:2022, note:"28-item international standard for health economic evaluations." },
  R22: { id:"R22", tag:"ISPOR-SMDM 2012",      url:"https://www.valueinhealthjournal.com/article/S1098-3015(12)01652-X/fulltext",        title:"Modeling Good Research Practices—Overview", org:"Value in Health / ISPOR", year:2012, note:"Best practices for decision-analytic models." },
  R23: { id:"R23", tag:"Dunn 2018 (inflation)", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC5785315/",                                title:"Adjusting Health Expenditures for Inflation", org:"Health Services Research (Wiley)", year:2018, note:"Use CPI Medical Care Services index for adjusting hospital cost studies." },
  R24: { id:"R24", tag:"HCUP SB313 2024",      url:"https://hcup-us.ahrq.gov/reports/statbriefs/sb313-prevalence-burden-HAIs-2016-2021.pdf", title:"Prevalence and Burden of Healthcare-Associated Infections, 2016–2021", org:"AHRQ / HCUP Statistical Brief #313", year:2024, note:"Most recent HCUP national HAI cost data." },
  R25: { id:"R25", tag:"Graves 2007",          url:"https://pubmed.ncbi.nlm.nih.gov/17376185/",                                         title:"Excess morbidity, mortality, and cost from hospital-acquired infection", org:"Infection Control & Hospital Epidemiology", year:2007, note:"Variable (avoidable) costs ~60–70% of total attributable HAI cost." },
  R26: { id:"R26", tag:"KFF/Peterson 2024",    url:"https://www.healthsystemtracker.org/brief/how-does-medical-inflation-compare-to-inflation-in-the-rest-of-the-economy/", title:"How Does Medical Inflation Compare to Inflation in the Rest of the Economy?", org:"Peterson-KFF Health System Tracker", year:2024, note:"Hospital services CPI rose ~54% since 2009. Source for 2015→2024 adjustment factor." },
  R27: { id:"R27", tag:"AHRQ HACCOST method",  url:"https://www.ahrq.gov/hai/pfp/haccost2017.html",                                    title:"Methods: Estimating Additional Hospital Inpatient Cost and Mortality Associated with HACs", org:"AHRQ", year:2017, note:"AHRQ methodology: incremental hospital perspective costs in 2015 USD." },
  R28: { id:"R28", tag:"Ramsey 2015 ISPOR",    url:"https://pubmed.ncbi.nlm.nih.gov/25773551/",                                         title:"Cost-Effectiveness Analysis Alongside Clinical Trials II—ISPOR Good Research Practices", org:"Value in Health / ISPOR", year:2015, note:"Incremental analysis required; uncertainty must be characterized." },
};

// ─────────────────────────────────────────────────────────────────────────────
// BENCHMARK DATA
// ─────────────────────────────────────────────────────────────────────────────
const HOSPITAL_SIZES = [
  { id:"small",    label:"Small",    beds:"<100 beds",    totalRevenueMn:60,  medicareRevenuePct:0.28, admissionsPerYear:4000,  patientDaysPerYear:22000,  cultureVolumes:{ mrsa:20,  cdi:13,  cre:3,  abx:2,  mssa:15  }, hais:{ clabsi:6,  cauti:28,  cdi:13, mrsa:6,  vae:8,  ssi:28  }, surgicalProcedures:900   },
  { id:"medium",   label:"Medium",   beds:"100–299 beds", totalRevenueMn:175, medicareRevenuePct:0.23, admissionsPerYear:14000, patientDaysPerYear:75000,  cultureVolumes:{ mrsa:68,  cdi:43,  cre:10, abx:8,  mssa:50  }, hais:{ clabsi:18, cauti:78,  cdi:43, mrsa:18, vae:22, ssi:98  }, surgicalProcedures:3500  },
  { id:"large",    label:"Large",    beds:"300–499 beds", totalRevenueMn:400, medicareRevenuePct:0.21, admissionsPerYear:32000, patientDaysPerYear:160000, cultureVolumes:{ mrsa:145, cdi:91,  cre:24, abx:20, mssa:110 }, hais:{ clabsi:35, cauti:150, cdi:91, mrsa:38, vae:44, ssi:220 }, surgicalProcedures:8500  },
  { id:"academic", label:"Academic", beds:"500+ beds",    totalRevenueMn:800, medicareRevenuePct:0.19, admissionsPerYear:60000, patientDaysPerYear:310000, cultureVolumes:{ mrsa:280, cdi:177, cre:55, abx:50, mssa:215 }, hais:{ clabsi:62, cauti:280, cdi:177,mrsa:75, vae:84, ssi:440 }, surgicalProcedures:18000 },
];

const CPI_2015_TO_2024  = 1.29;
const VARIABLE_FRAC     = 0.65;
const HAI_COSTS_TOTAL   = {
  clabsi: Math.round(48108 * CPI_2015_TO_2024),
  cauti:  Math.round(13793 * CPI_2015_TO_2024),
  cdi:    Math.round(17000 * CPI_2015_TO_2024),
  mrsa:   Math.round(42000 * CPI_2015_TO_2024),
  vae:    Math.round(32000 * CPI_2015_TO_2024),
  ssi:    Math.round(21000 * CPI_2015_TO_2024),
};
const HAI_COSTS_VARIABLE = Object.fromEntries(
  Object.entries(HAI_COSTS_TOTAL).map(([k,v]) => [k, Math.round(v * VARIABLE_FRAC)])
);

const TRANS_FRAC     = { clabsi:0.45, cauti:0.32, cdi:0.38, mrsa:0.42, vae:0.38, ssi:0.42 };
const HAI_LABELS     = { clabsi:"CLABSI", cauti:"CAUTI", cdi:"CDI (HO)", mrsa:"MRSA Bacteremia", vae:"VAE", ssi:"SSI" };
const CULTURE_LABELS = { mrsa:"MRSA isolates/yr", cdi:"CDI positive tests/yr", cre:"CRE isolates/yr", abx:"Acinetobacter isolates/yr", mssa:"MSSA blood cx/yr" };
const AVG_CLUSTER_SIZE = 5;

const TAT_STEPS = [
  {label:"12 hours", hours:12},
  {label:"1 day",    hours:24},
  {label:"2 days",   hours:48},
  {label:"3 days",   hours:72},
  {label:"5 days",   hours:120},
  {label:"1 week",   hours:168},
  {label:"2 weeks",  hours:336},
  {label:"1 month",  hours:720},
  {label:"3 months", hours:2160},
];
const TAT_DEFAULT_IDX = 3;

const MODELS = [
  { id:"m1", label:"M1", name:"Full Surveillance",    color:C.teal,    detectionRate:0.90, interventionLagCases:1.5, envMultiplier:1.25, valueType:"immediate", desc:"All positive cultures sequenced in real time with environmental sampling triggered by confirmed infection." },
  { id:"m2", label:"M2", name:"Prospective Clinical", color:C.teal2,   detectionRate:0.73, interventionLagCases:2.5, envMultiplier:1.0,  valueType:"immediate", desc:"Every positive clinical culture sequenced as reported. Real-time phylogenetic context from clinical specimens only." },
  { id:"m3", label:"M3", name:"Semi-Prospective",     color:C.amber,   detectionRate:0.40, interventionLagCases:5.0, envMultiplier:1.0,  valueType:"delayed",   desc:"Sequencing triggered when IP suspects a cluster. No prior phylogenetic context available." },
  { id:"m4", label:"M4", name:"Retrospective Only",   color:"#78716c", detectionRate:0.20, interventionLagCases:8.0, envMultiplier:1.0,  valueType:"future",    desc:"Outbreak declared before sequencing begins. Value is reservoir identification and future response speed." },
];

// ─────────────────────────────────────────────────────────────────────────────
// MATH
// ─────────────────────────────────────────────────────────────────────────────
function calcSeqs(hosp, model, incSSI) {
  const total = Object.values(hosp.cultureVolumes).reduce((a,b)=>a+b,0);
  let s = model.id==="m1" ? Math.round(total*model.envMultiplier)
        : model.id==="m2" ? total
        : model.id==="m3" ? Math.round(total*0.30)
        : Math.round(total*0.12);
  if (incSSI) {
    const ssiCases = Math.round((hosp.surgicalProcedures||0)*0.15*0.026);
    s += model.id==="m1"||model.id==="m2" ? ssiCases : model.id==="m3" ? Math.round(ssiCases*0.35) : Math.round(ssiCases*0.15);
  }
  return s;
}

function calcPrevented(hosp, model, pFrac, incSSI, tatIdx) {
  const tatHours     = TAT_STEPS[tatIdx].hours;
  const tatScale     = (model.id==="m1"||model.id==="m2") ? tatHours/72 : 1;
  const effectiveLag = model.interventionLagCases * tatScale;
  const lagFrac      = Math.min(effectiveLag / AVG_CLUSTER_SIZE, 0.85);
  const types = incSSI ? ["clabsi","cauti","cdi","mrsa","vae","ssi"] : ["clabsi","cauti","cdi","mrsa","vae"];
  let total=0; const byType={};
  for (const t of types) {
    const annual = hosp.hais[t] || 0;
    let val;
    if (model.valueType==="future") {
      val = annual * TRANS_FRAC[t] * pFrac * 0.55 * (AVG_CLUSTER_SIZE / Math.max(annual,1));
    } else {
      val = annual * TRANS_FRAC[t] * pFrac * model.detectionRate * (1 - lagFrac);
    }
    byType[t] = Math.round(val*10)/10;
    total += val;
  }
  return {total, byType};
}

function calcCosts(byType, costTable) {
  const tbl = costTable || HAI_COSTS_TOTAL;
  let total=0; const breakdown={};
  for (const [t,n] of Object.entries(byType)) { breakdown[t]=n*tbl[t]; total+=breakdown[t]; }
  return {total, breakdown};
}

function calcHACRP(hosp, totalHAIs, prevented) {
  const mr   = hosp.totalRevenueMn*1e6*hosp.medicareRevenuePct;
  const maxP = mr*0.01;
  const base = maxP*0.40;
  const rf   = Math.min(prevented/Math.max(totalHAIs,1), 0.85);
  return { maxPenalty:maxP, baselineExposure:base, reducedExposure:base*(1-rf), saved:base*rf };
}

function runAll(hosp, pFrac, subFee, adHocPrice, incSSI, useVar, tatIdx) {
  const totalHAIs = Object.entries(hosp.hais).reduce((a,[k,v])=>k!=="ssi"||incSSI?a+v:a,0);
  const costTable = useVar ? HAI_COSTS_VARIABLE : HAI_COSTS_TOTAL;
  const out={};
  for (const model of MODELS) {
    const seqs         = calcSeqs(hosp,model,incSSI);
    const prevented    = calcPrevented(hosp,model,pFrac,incSSI,tatIdx);
    const cost         = calcCosts(prevented.byType, costTable);
    const hacrp        = calcHACRP(hosp,totalHAIs,prevented.total);
    const benefit      = cost.total + hacrp.saved;
    const progSub      = subFee;
    const progAdHoc    = seqs * adHocPrice;
    out[model.id] = {
      seqs, haIsPrevented:prevented, costAvoided:cost, hacrp,
      programCostSub:   progSub,
      programCostAdHoc: progAdHoc,
      netValueSub:      benefit - progSub,
      netValueAdHoc:    benefit - progAdHoc,
      costPerHAISub:    prevented.total>0.5 ? progSub/prevented.total   : 0,
      costPerHAIAdHoc:  prevented.total>0.5 ? progAdHoc/prevented.total : 0,
      seqsPerHAI:       prevented.total>0.5 ? seqs/prevented.total      : 0,
    };
  }
  return {data:out, totalHAIs};
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fm  = n => n>=1e6?`$${(n/1e6).toFixed(1)}M`:n>=1e3?`$${(n/1e3).toFixed(0)}K`:`$${Math.round(n).toLocaleString()}`;
const fn  = n => n>=1e3?`${(n/1e3).toFixed(1)}K`:`${Math.round(n*10)/10}`;
const pct = v => `${Math.round(v*100)}%`;

// ─────────────────────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Slider({label, value, min, max, step, onChange, format, hint}) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:11,color:C.txt3,letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:600}}>{label}</span>
        <span style={{fontSize:13,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums"}}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(parseFloat(e.target.value))}
        style={{width:"100%",accentColor:C.teal,cursor:"pointer",height:4}}/>
      {hint && <div style={{fontSize:11,color:C.txt3,marginTop:4,lineHeight:1.4}}>{hint}</div>}
    </div>
  );
}

function SInput({label, value, onChange, float=false, min=0}) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3,fontWeight:600}}>{label}</div>
      <input type="number" min={min} value={value===0?"":value}
        onChange={e=>{const v=float?(parseFloat(e.target.value)||0):(parseInt(e.target.value)||0); onChange(Math.max(min,v));}}
        onFocus={e=>e.target.select()}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,padding:"6px 8px",color:C.txt,fontFamily:FONT_BODY,fontSize:13,outline:"none",boxSizing:"border-box"}}
        onMouseOver={e=>e.target.style.borderColor=C.teal3}
        onMouseOut={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
}

function Tag({text, color=C.teal}) {
  return <span style={{display:"inline-block",padding:"1px 7px",fontSize:10,fontFamily:FONT_MONO,background:`${color}18`,border:`1px solid ${color}33`,borderRadius:4,color,fontWeight:600,letterSpacing:"0.05em"}}>{text}</span>;
}

function TATpicker({tatIdx, setTatIdx}) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <span style={{fontSize:11,color:C.txt3,letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:600}}>Sequencing Turnaround Time</span>
        <span style={{fontSize:13,fontWeight:700,color:C.teal}}>{TAT_STEPS[tatIdx].label}</span>
      </div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
        {TAT_STEPS.map((s,i) => (
          <button key={i} onClick={()=>setTatIdx(i)}
            style={{padding:"4px 7px",fontSize:10,borderRadius:4,cursor:"pointer",fontWeight:600,fontFamily:FONT_BODY,
              border:`1px solid ${i===tatIdx?C.teal:C.border}`,
              background:i===tatIdx?C.teal:"transparent",
              color:i===tatIdx?C.s0:C.txt3}}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{fontSize:10,color:C.txt3,marginTop:5}}>Affects M1 & M2 only. Reference: 3 days (R13, R19).</div>
    </div>
  );
}

function Toggle({on, onClick, labelOn, labelOff, note}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
      <button onClick={onClick} style={{width:36,height:20,borderRadius:10,cursor:"pointer",background:on?C.teal:C.border2,border:"none",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
        <div style={{width:14,height:14,borderRadius:"50%",background:C.s0,position:"absolute",top:3,left:on?19:3,transition:"left 0.15s"}}/>
      </button>
      <div>
        <div style={{fontSize:12,color:on?C.teal:C.txt3,fontWeight:600}}>{on?labelOn:labelOff}</div>
        {note && <div style={{fontSize:10,color:C.txt3}}>{note}</div>}
      </div>
    </div>
  );
}

function SecHeader({title, open, onToggle, count}) {
  return (
    <button onClick={onToggle} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 16px",background:"transparent",border:"none",borderTop:`1px solid ${C.border}`,cursor:"pointer",textAlign:"left",fontFamily:FONT_BODY}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:11,fontWeight:700,color:C.txt,textTransform:"uppercase",letterSpacing:"0.06em"}}>{title}</span>
        {count!=null && <span style={{fontSize:10,color:C.txt3,background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"1px 7px"}}>{count}</span>}
      </div>
      <span style={{fontSize:10,color:C.txt3}}>{open?"▲":"▼"}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
function ModelOverview() {
  const eqParts = [
    {label:"HAIs prevented",   sub:"Clusters detected earlier",     color:C.teal},
    {op:"×"},
    {label:"Cost per HAI",     sub:"Total attributable · 2024 USD", color:C.teal},
    {op:"+"},
    {label:"HACRP savings",    sub:"Medicare penalty reduction",     color:C.teal},
    {op:"−"},
    {label:"Cost to hospital", sub:"Subscription or per-sample",    color:C.txt2},
    {op:"="},
    {label:"Net annual value", sub:"Hospital perspective · 1 year", color:C.green},
  ];
  return (
    <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,padding:"22px 24px",marginBottom:20}}>
      <div style={{fontSize:11,color:C.teal,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700,marginBottom:6}}>How this model works</div>
      <div style={{fontSize:18,fontWeight:700,fontFamily:FONT_DISPLAY,color:C.txt,marginBottom:16,lineHeight:1.3}}>
        One-year cost-benefit analysis of WGS surveillance for infection prevention
      </div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:0,background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,padding:"14px 16px",marginBottom:20}}>
        {eqParts.map((item,i) =>
          item.op ? (
            <div key={i} style={{fontSize:18,color:C.txt3,fontWeight:300,padding:"0 8px"}}>{item.op}</div>
          ) : (
            <div key={i} style={{textAlign:"center",padding:"4px 8px"}}>
              <div style={{fontSize:12,fontWeight:700,color:item.color,whiteSpace:"nowrap"}}>{item.label}</div>
              <div style={{fontSize:10,color:C.txt3,marginTop:2,lineHeight:1.4}}>{item.sub}</div>
            </div>
          )
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:C.teal,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Included</div>
          {["NHSN HAIs: CLABSI, CAUTI, CDI, MRSA bacteremia, VAE (SSI optional)",
            "Attributable costs from WGS-detected cross-transmission clusters",
            "HACRP Medicare penalty exposure reduction (1% of Medicare FFS)",
            "Cost to hospital: flat subscription or per-sample ad hoc"].map((t,i) => (
            <div key={i} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:C.teal,marginTop:6,flexShrink:0}}/>
              <div style={{fontSize:12,color:C.txt2,lineHeight:1.5}}>{t}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:C.txt3,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Not included</div>
          {["Costs of non-genomic IP interventions (OR closures, cohorting)",
            "Value of ruling out transmission — prevents unnecessary interventions",
            "Societal costs, readmissions, litigation, or long-term morbidity",
            "NTM, Candida auris, or non-NHSN pathogen outbreaks"].map((t,i) => (
            <div key={i} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:C.border2,marginTop:6,flexShrink:0}}/>
              <div style={{fontSize:12,color:C.txt3,lineHeight:1.5}}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL CARD
// ─────────────────────────────────────────────────────────────────────────────
function ModelCard({model, data, pricingMode}) {
  const netValue    = pricingMode==="sub" ? data.netValueSub    : data.netValueAdHoc;
  const programCost = pricingMode==="sub" ? data.programCostSub : data.programCostAdHoc;
  const costPerHAI  = pricingMode==="sub" ? data.costPerHAISub  : data.costPerHAIAdHoc;
  const {haIsPrevented, costAvoided, hacrp, seqs} = data;
  const positive = netValue > 0;
  const rows = [
    ["Sequences/yr",     fn(seqs)],
    ["Cost to hospital", fm(programCost)],
    ["HAIs prevented",   fn(haIsPrevented.total)+(model.valueType==="future"?" *":"")],
    ["Cost avoided",     fm(costAvoided.total)],
    ["HACRP savings",    fm(hacrp.saved)],
    ["Cost/HAI prev.",   haIsPrevented.total>0.5 ? fm(costPerHAI) : "—"],
  ];
  return (
    <div style={{background:C.s0,border:`1px solid ${positive?C.border:C.border2}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{height:3,background:model.color}}/>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:model.color,letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>{model.label} · {model.name}</div>
        <div style={{background:positive?C.tealXp:C.redPale,border:`1px solid ${positive?C.tealPale:"#fecaca"}`,borderRadius:6,padding:"7px 12px",textAlign:"center"}}>
          <div style={{fontSize:11,color:positive?C.teal2:C.red,marginBottom:1}}>Net annual value</div>
          <div style={{fontSize:20,fontWeight:700,color:positive?C.teal:C.red,fontVariantNumeric:"tabular-nums"}}>
            {positive?"+":""}{fm(netValue)}
          </div>
        </div>
      </div>
      <div style={{padding:"0 16px 14px"}}>
        {rows.map(([k,v]) => (
          <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.txt3,fontWeight:500}}>{k}</div>
            <div style={{fontSize:13,fontWeight:700,color:C.txt,fontVariantNumeric:"tabular-nums"}}>{v}</div>
          </div>
        ))}
      </div>
      {model.valueType==="future" && (
        <div style={{padding:"0 16px 12px",fontSize:10,color:C.txt3,lineHeight:1.4}}>
          * Future prevention via reservoir ID — current outbreak not preventable
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREAKDOWN TABLE
// ─────────────────────────────────────────────────────────────────────────────
function BreakdownTable({models, allData, incSSI, costTable}) {
  const types   = incSSI ? ["clabsi","cauti","cdi","mrsa","vae","ssi"] : ["clabsi","cauti","cdi","mrsa","vae"];
  const srcRefs = {clabsi:"R1,R2",cauti:"R1",cdi:"R3,R4,R9",mrsa:"R2,R12,R14",vae:"R1",ssi:"R2,R7"};
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${C.border}`}}>
            {["HAI Type","Avg Cost per Case (2024$)","Trans. Frac.","Sources"].map((h,i) => (
              <th key={h} style={{textAlign:i>0&&i<3?"right":"left",padding:"10px 14px",color:C.txt3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",fontSize:10}}>{h}</th>
            ))}
            {models.map(m => (
              <th key={m.id} style={{padding:"10px 14px",color:m.color,fontWeight:700,textTransform:"uppercase",fontSize:10,textAlign:"right"}}>{m.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map((t,i) => (
            <tr key={t} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>
              <td style={{padding:"10px 14px",color:C.txt,fontWeight:600,fontSize:13}}>{HAI_LABELS[t]}</td>
              <td style={{padding:"10px 14px",color:C.txt2,fontVariantNumeric:"tabular-nums",textAlign:"right",fontSize:13}}>{fm(costTable[t])}</td>
              <td style={{padding:"10px 14px",color:C.txt3,fontVariantNumeric:"tabular-nums",textAlign:"right",fontSize:13}}>{Math.round(TRANS_FRAC[t]*100)}%</td>
              <td style={{padding:"10px 14px"}}><Tag text={srcRefs[t]} color={C.teal}/></td>
              {models.map(m => {
                const n = allData[m.id]?.haIsPrevented?.byType?.[t] ?? 0;
                return <td key={m.id} style={{padding:"10px 14px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:n>0?m.color:C.border2,fontWeight:n>0?700:400,fontSize:13}}>{n>0?fn(n):"—"}</td>;
              })}
            </tr>
          ))}
          <tr style={{borderTop:`2px solid ${C.border2}`,background:C.tealXp}}>
            <td style={{padding:"10px 14px",color:C.teal,fontWeight:700,fontSize:13}} colSpan={4}>Total cost avoided</td>
            {models.map(m => (
              <td key={m.id} style={{padding:"10px 14px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:m.color,fontWeight:700,fontSize:13}}>{fm(allData[m.id]?.costAvoided?.total??0)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLOTS
// ─────────────────────────────────────────────────────────────────────────────
function NetValueChart({allData, pricingMode}) {
  const rows = MODELS.map(m => {
    const d = allData[m.id];
    const netValue = pricingMode==="sub" ? d.netValueSub : d.netValueAdHoc;
    const benefit  = d.costAvoided.total + d.hacrp.saved;
    const cost     = pricingMode==="sub" ? d.programCostSub : d.programCostAdHoc;
    return {model:m, netValue, benefit, cost};
  });
  const maxBenefit = Math.max(...rows.map(r => r.benefit), 1);
  const pctOf = v => `${Math.min(100, Math.round(Math.max(0,v)/maxBenefit*100))}%`;
  return (
    <div>
      <div style={{display:"flex",gap:20,marginBottom:14,fontSize:12,color:C.txt3}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:14,height:8,background:C.tealPale,borderRadius:2,border:`1px solid ${C.tealPale}`}}/>
          <span>Total benefit (cost avoided + HACRP)</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:14,height:8,background:C.teal,borderRadius:2}}/>
          <span>Net value after cost to hospital</span>
        </div>
      </div>
      {rows.map(({model, netValue, benefit, cost}) => (
        <div key={model.id} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{width:36,flexShrink:0}}>
              <div style={{fontSize:11,fontWeight:700,color:model.color}}>{model.label}</div>
            </div>
            <div style={{flex:1,position:"relative",height:32}}>
              <div style={{position:"absolute",top:0,left:0,height:"100%",width:pctOf(benefit),background:C.tealPale,borderRadius:5}}/>
              <div style={{position:"absolute",top:0,left:0,height:"100%",width:pctOf(netValue),background:netValue>0?model.color:C.red,borderRadius:5,opacity:0.85}}/>
            </div>
            <div style={{width:90,textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:700,color:netValue>0?model.color:C.red,fontVariantNumeric:"tabular-nums"}}>
                {netValue>0?"+":""}{fm(netValue)}
              </div>
              <div style={{fontSize:10,color:C.txt3}}>of {fm(benefit)} benefit</div>
            </div>
          </div>
          <div style={{paddingLeft:46,fontSize:11,color:C.txt3}}>
            {model.name} · {fn(allData[model.id].seqs)} seqs · Cost to hospital: {fm(cost)}
          </div>
        </div>
      ))}
    </div>
  );
}

function SensitivityChart({hospital, subFee, adHocPrice, incSSI, useVar, tatIdx, pricingMode, currentPFrac}) {
  const seriesData = useMemo(() => {
    const pts = 21;
    return MODELS.map(m => ({
      model: m,
      points: Array.from({length:pts}, (_,i) => {
        const pf = i / (pts-1);
        const {data} = runAll(hospital, pf, subFee, adHocPrice, incSSI, useVar, tatIdx);
        return pricingMode==="sub" ? data[m.id].netValueSub : data[m.id].netValueAdHoc;
      }),
    }));
  }, [hospital, subFee, adHocPrice, incSSI, useVar, tatIdx, pricingMode]);

  const W=580, H=260, PL=68, PR=24, PT=20, PB=46;
  const allVals = seriesData.flatMap(s => s.points);
  const minV = Math.min(0, ...allVals);
  const maxV = Math.max(...allVals, 1);
  const rangeV = maxV - minV;
  const xOf = i => PL + (i/20) * (W - PL - PR);
  const yOf = v => PT + (1-(v-minV)/rangeV) * (H - PT - PB);
  const zeroY = yOf(0);
  const curIdx = Math.round(currentPFrac / 0.05);
  const curX = xOf(curIdx);

  const yTickVals = [0, 0.25, 0.5, 0.75, 1.0].map(r => minV + r * rangeV);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block",overflow:"visible"}}>
        {/* Grid lines */}
        {yTickVals.map((v,i) => (
          <line key={i} x1={PL} y1={yOf(v)} x2={W-PR} y2={yOf(v)} stroke={C.border} strokeWidth="1"/>
        ))}
        {/* Zero line */}
        {minV < 0 && <line x1={PL} y1={zeroY} x2={W-PR} y2={zeroY} stroke={C.border2} strokeWidth="1.5" strokeDasharray="4 3"/>}
        {/* Current pFrac indicator */}
        <line x1={curX} y1={PT} x2={curX} y2={H-PB} stroke={C.teal} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6"/>
        <text x={curX+4} y={PT+11} fontSize="9" fill={C.teal} fontFamily={FONT_BODY}>{Math.round(currentPFrac*100)}%</text>
        {/* Series lines */}
        {seriesData.map(({model, points}) => (
          <polyline key={model.id}
            points={points.map((v,i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ")}
            fill="none" stroke={model.color} strokeWidth="2" strokeLinejoin="round"/>
        ))}
        {/* X axis ticks */}
        {[0,0.25,0.5,0.75,1.0].map(v => (
          <g key={v}>
            <line x1={xOf(v/0.05)} y1={H-PB} x2={xOf(v/0.05)} y2={H-PB+4} stroke={C.border2}/>
            <text x={xOf(v/0.05)} y={H-PB+14} textAnchor="middle" fontSize="11" fill={C.txt3} fontFamily={FONT_BODY}>{Math.round(v*100)}%</text>
          </g>
        ))}
        <text x={PL+(W-PL-PR)/2} y={H-4} textAnchor="middle" fontSize="10" fill={C.txt3} fontFamily={FONT_BODY}>Cluster interruption rate (pFrac)</text>
        {/* Y axis ticks */}
        {yTickVals.map((v,i) => (
          <text key={i} x={PL-5} y={yOf(v)+4} textAnchor="end" fontSize="10" fill={C.txt3} fontFamily={FONT_BODY}>
            {v>=1e6?`$${(v/1e6).toFixed(1)}M`:v>=1e3?`$${(v/1e3).toFixed(0)}K`:`$${Math.round(v)}`}
          </text>
        ))}
        {/* Legend */}
        {MODELS.map((m,i) => (
          <g key={m.id} transform={`translate(${PL + i*130}, ${H-PB+28})`}>
            <line x1="0" y1="5" x2="16" y2="5" stroke={m.color} strokeWidth="2"/>
            <circle cx="8" cy="5" r="3" fill={m.color}/>
            <text x="20" y="9" fontSize="10" fill={C.txt2} fontFamily={FONT_BODY}>{m.label} {m.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION TAB
// ─────────────────────────────────────────────────────────────────────────────
function DocumentationTab({useVar}) {
  const [openRef, setOpenRef]   = useState(null);
  const [docSec,  setDocSec]    = useState("assumptions");
  const activeCosts = useVar ? HAI_COSTS_VARIABLE : HAI_COSTS_TOTAL;

  const assumptions = [
    {cat:"HAI Attributable Costs (2024 USD)", items:[
      {label:"CLABSI",value:`$${Math.round(48108*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(48108*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"AHRQ 2017 meta-analysis (7 studies); inflated 2015→2024 via CPI Medical Care Services (+29%). Default uses total costs.",refs:["R1","R23","R25","R26"],conf:"High"},
      {label:"CAUTI",value:`$${Math.round(13793*CPI_2015_TO_2024).toLocaleString()} total`,basis:"AHRQ 2017 meta-analysis.",refs:["R1","R23","R25"],conf:"High"},
      {label:"CDI (hospital-onset)",value:`$${Math.round(17000*CPI_2015_TO_2024).toLocaleString()} total`,basis:"Forrester 2022 HCUP-NIS; Zhang 2024 community network. AHRQ range $15K–$20K (2015 USD).",refs:["R3","R4","R23","R25"],conf:"Moderate"},
      {label:"MRSA bacteremia",value:`$${Math.round(42000*CPI_2015_TO_2024).toLocaleString()} total`,basis:"Zimlichman 2013 + MRSA premium ~$13K over non-MRSA BSI.",refs:["R2","R23","R25"],conf:"Moderate"},
      {label:"VAE",value:`$${Math.round(32000*CPI_2015_TO_2024).toLocaleString()} total`,basis:"AHRQ 2017 range for VAP/VAE.",refs:["R1","R23","R25"],conf:"Moderate"},
      {label:"SSI",value:`$${Math.round(21000*CPI_2015_TO_2024).toLocaleString()} total`,basis:"Zimlichman 2013 meta-analysis.",refs:["R2","R23","R25"],conf:"High"},
    ]},
    {cat:"WGS Prevention Efficacy", items:[
      {label:"Transmissible fraction by HAI type",value:"CLABSI 45%, CAUTI 32%, CDI 38%, MRSA 42%, VAE 38%, SSI 42%",basis:"Fraction of reported HAIs attributable to detectable cross-transmission. Martin 2024 ICHE: WGS-attributed vs. total MRSA HAI. Haaber 2022: ~18.9% patient-to-patient WGS evidence.",refs:["R14","R15","R20"],conf:"Moderate"},
      {label:"Cluster interruption rate (pFrac, default 75%)",value:"75% of WGS-identified clusters successfully interrupted by IP",basis:"Contact precautions reduce MRSA transmission ~47% (Toth 2022). WGS-guided active intervention likely achieves 60–85%. Applied as direct multiplier: pFrac × TRANS_FRAC[t] × detectionRate × (1−lagFrac).",refs:["R19","R14"],conf:"Moderate"},
      {label:"Intervention lag",value:"Lag fraction = effective lag cases / avg cluster size (5)",basis:"Fixed cluster size of 5 from Bhargava 2021 ICU data. TAT scales lag for M1 & M2 proportionally (reference: 3 days).",refs:["R13","R19"],conf:"Moderate"},
    ]},
    {cat:"HACRP & Hospital Revenue", items:[
      {label:"1% Medicare FFS penalty",value:"Worst-performing quartile on composite HAC score",basis:"CMS HACRP federal regulation.",refs:["R16"],conf:"High — federal regulation"},
      {label:"Medicare revenue fraction",value:"19–28% of total net revenue by hospital size",basis:"Definitive Healthcare Medicare Cost Report analysis (2023).",refs:["R17"],conf:"High"},
      {label:"HACRP exposure model",value:"40% baseline exposure × max penalty × HAI reduction fraction",basis:"~25% of hospitals penalized annually; 40% at risk. Savings = base × rf (no haircut). Conservative and defensible.",refs:["R16","R17"],conf:"Moderate"},
    ]},
    {cat:"Pricing & Cost Perspective", items:[
      {label:"Ad hoc pricing",value:"$175–500/sample. Default $300. 50% margin floor at $175.",basis:"Hospital pays Prospect Genomics per WGS sample for ad hoc requests. $175 = minimum at 50% margin. Typical contract: $250–350/sample.",refs:[],conf:"Prospect internal"},
      {label:"Subscription pricing",value:"Flat annual fee (default $100K). Includes analysis, software, support.",basis:"Flat subscription regardless of volume. Hospital's breakeven vs. ad hoc = subscription fee ÷ price/sample.",refs:[],conf:"Prospect internal"},
      {label:"Cost perspective",value:"Total attributable costs (default). Variable (65%) available for conservative bound.",basis:"Total costs = full financial burden avoided. Variable (Graves 2007) = avoidable costs when fixed overhead persists.",refs:["R25","R27","R28"],conf:"High"},
    ]},
  ];

  const Row = (cells) => cells;
  const Tbl = ({rows, hdrs}) => (
    <div style={{overflowX:"auto",marginBottom:16}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{borderBottom:`2px solid ${C.border}`}}>{hdrs.map(h=><th key={h} style={{padding:"8px 12px",color:C.txt3,textTransform:"uppercase",fontSize:10,textAlign:"left",fontWeight:600,letterSpacing:"0.05em"}}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>{r.map((c,j)=><td key={j} style={{padding:"8px 12px",color:j===0?C.txt:C.txt2,fontSize:12,lineHeight:1.5,fontVariantNumeric:j>0?"tabular-nums":"normal"}}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );

  return (
    <div>
      {/* Sub-nav */}
      <div style={{display:"flex",gap:4,marginBottom:20,background:C.bg,padding:"4px",borderRadius:8,border:`1px solid ${C.border}`,width:"fit-content"}}>
        {[["assumptions","Assumptions"],["methods","Methods & Formula"],["references","References"]].map(([id,label]) => (
          <button key={id} onClick={()=>setDocSec(id)} style={{padding:"7px 16px",borderRadius:6,cursor:"pointer",background:docSec===id?C.s0:"transparent",border:docSec===id?`1px solid ${C.border}`:"1px solid transparent",color:docSec===id?C.txt:C.txt3,fontFamily:FONT_BODY,fontSize:12,fontWeight:docSec===id?600:500}}>
            {label}
          </button>
        ))}
      </div>

      {docSec==="assumptions" && (
        <div>
          {assumptions.map(s => (
            <div key={s.cat} style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,color:C.teal,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12,paddingBottom:8,borderBottom:`2px solid ${C.tealPale}`}}>{s.cat}</div>
              {s.items.map(item => (
                <div key={item.label} style={{marginBottom:10,padding:"14px 16px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{fontSize:13,color:C.txt,fontWeight:700,flex:1}}>{item.label}</div>
                    <div style={{fontSize:11,color:C.teal,fontWeight:600,marginLeft:16,textAlign:"right"}}>{item.value}</div>
                  </div>
                  <div style={{fontSize:12,color:C.txt2,marginBottom:8,lineHeight:1.6}}>{item.basis}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    {item.refs.map(r => (
                      <button key={r} onClick={()=>setOpenRef(openRef===r?null:r)}
                        style={{padding:"2px 8px",fontSize:10,borderRadius:4,cursor:"pointer",border:`1px solid ${openRef===r?C.teal:C.border}`,background:openRef===r?C.tealXp:C.bg,color:openRef===r?C.teal:C.txt3,fontFamily:FONT_MONO,fontWeight:600}}>
                        {REFS[r]?.tag||r}
                      </button>
                    ))}
                    {item.conf && <span style={{fontSize:10,color:C.txt3,marginLeft:"auto"}}>Confidence: {item.conf}</span>}
                  </div>
                  {item.refs.includes(openRef) && REFS[openRef] && (
                    <div style={{marginTop:10,padding:"12px 14px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:6}}>
                      <div style={{fontSize:11,color:C.teal,fontWeight:700,marginBottom:3}}>[{REFS[openRef].id}] {REFS[openRef].tag} · {REFS[openRef].org} ({REFS[openRef].year})</div>
                      <div style={{fontSize:11,color:C.txt2,marginBottom:4}}>{REFS[openRef].title}</div>
                      <div style={{fontSize:10,color:C.txt2,marginBottom:6,lineHeight:1.5}}>{REFS[openRef].note}</div>
                      <a href={REFS[openRef].url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.teal2,wordBreak:"break-all"}}>{REFS[openRef].url}</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div style={{padding:"14px 16px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:12,color:"#92400e",lineHeight:1.6}}>
            <strong>Key limitations:</strong> HACRP modeled continuously (real threshold is binary). CDI volume depends heavily on lab test method. CRE at small hospitals is sporadic. Detection rates are from outbreak literature, not prospective RCTs. HAI costs inflated from 2015; actual current costs may be higher (Anderson 2023, R5).
          </div>
        </div>
      )}

      {docSec==="methods" && (
        <div style={{maxWidth:820}}>
          <div style={{padding:"18px 22px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:10,marginBottom:24}}>
            <Tag text="CHEERS 2022" color={C.teal}/>{" "}<Tag text="ISPOR-SMDM 2012" color={C.teal}/>
            <div style={{fontSize:17,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY,margin:"8px 0 10px"}}>Methods, Formula & Cost Basis</div>
            <p style={{fontSize:13,color:C.txt2,lineHeight:1.7,margin:0}}>
              Static decision-analytic CBA from the <strong>hospital perspective</strong> following CHEERS 2022 <Tag text="R21" color={C.teal}/> and ISPOR-SMDM best practices <Tag text="R22" color={C.teal}/>. All costs in <strong>2024 USD</strong>. Time horizon: <strong>1 year</strong>. No discounting required.
            </p>
          </div>

          <div style={{marginBottom:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.teal,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>1 · Model Type & Structure</div>
            <Tbl rows={[
              Row(["Model type","Static decision-analytic CBA"]),
              Row(["Perspective","Hospital (institutional) — direct inpatient costs only"]),
              Row(["Time horizon","1 year (no discounting required)"]),
              Row(["Currency","2024 USD"]),
              Row(["Inflation","CPI Medical Care Services index, 2015→2024 (+29%)"]),
              Row(["Cost concept",useVar?"Variable (avoidable) costs — active":"Total attributable costs — active (default)"]),
              Row(["Sensitivity","One-way deterministic via user-controlled inputs and sliders"]),
              Row(["Comparators","4 WGS surveillance intensity levels vs. implicit no-WGS baseline"]),
            ]} hdrs={["Parameter","Value / Approach"]}/>
          </div>

          <div style={{marginBottom:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.teal,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>2 · Prevention Formula</div>
            <div style={{padding:"14px 16px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,fontSize:13,color:C.txt,marginBottom:12,lineHeight:1.7}}>
              <strong>HAIs_prevented</strong> = annual_HAIs × TRANS_FRAC[type] × pFrac × detectionRate × (1 − lagFrac)
            </div>
            <p style={{fontSize:13,color:C.txt2,lineHeight:1.7,marginBottom:12}}>
              <strong>TRANS_FRAC[t]:</strong> fraction of reported HAIs attributable to WGS-detectable cross-transmission (varies by type).<br/>
              <strong>pFrac (cluster interruption rate):</strong> fraction of WGS-identified clusters successfully disrupted by IP — default 75%, range 0–100%.<br/>
              <strong>detectionRate:</strong> probability WGS identifies the cluster given the surveillance model intensity.<br/>
              <strong>lagFrac:</strong> fraction of cluster already infected before intervention. lagFrac = min(effectiveLag / 5, 0.85). For M1/M2, effectiveLag = interventionLagCases × (tatHours/72).
            </p>
            <Tbl rows={[
              Row(["M1 Full Surveillance","90%","1.5 × TAT_scale / 5","Real-time with environmental layer","R13, R19, R20"]),
              Row(["M2 Prospective Clinical","73%","2.5 × TAT_scale / 5","Real-time clinical only","R13"]),
              Row(["M3 Semi-Prospective","40%","5.0 / 5 = 85% cap","Suspicion-triggered; no prior context","R19"]),
              Row(["M4 Retrospective","20%","8.0 / 5 → capped","Forensic; future prevention value only","R19"]),
            ]} hdrs={["Model","Detection Rate","Lag Fraction","Rationale","Sources"]}/>
          </div>

          <div style={{marginBottom:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.teal,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>3 · HAI Cost Basis (2024 USD)</div>
            <Tbl rows={[
              Row(["CLABSI",`$48,108 × 1.29`,`$${Math.round(48108*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.clabsi.toLocaleString()}`,"R1, R27"]),
              Row(["CAUTI", `$13,793 × 1.29`,`$${Math.round(13793*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.cauti.toLocaleString()}`,"R1, R27"]),
              Row(["CDI",   `$17,000 × 1.29`,`$${Math.round(17000*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.cdi.toLocaleString()}`,"R3, R4"]),
              Row(["MRSA",  `$42,000 × 1.29`,`$${Math.round(42000*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.mrsa.toLocaleString()}`,"R2"]),
              Row(["VAE",   `$32,000 × 1.29`,`$${Math.round(32000*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.vae.toLocaleString()}`,"R1"]),
              Row(["SSI",   `$21,000 × 1.29`,`$${Math.round(21000*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.ssi.toLocaleString()}`,"R2, R7"]),
            ]} hdrs={["HAI Type","Base (2015 USD) × CPI","Total 2024$","Active","Sources"]}/>
          </div>

          <div style={{marginBottom:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.teal,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>4 · Net Value Formula</div>
            <div style={{padding:"14px 16px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,fontSize:13,color:C.txt,lineHeight:1.7}}>
              <strong>Net Value</strong> = (HAIs_prevented × costPerHAI + HACRP_savings) − cost_to_hospital<br/>
              <strong>HACRP_savings</strong> = baselineExposure × (prevented / totalHAIs); baselineExposure = maxPenalty × 0.40<br/>
              <strong>Cost to hospital</strong> = subscription fee (flat) OR ad hoc price × sequences/yr
            </div>
          </div>

          <div style={{padding:"14px 16px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:12,color:"#78350f",lineHeight:1.6}}>
            <strong>Disclosure:</strong> Developed by Prospect Genomics. Parameters derived from peer-reviewed literature. Not independently peer-reviewed. Results are directional estimates, not precise financial projections.
          </div>
        </div>
      )}

      {docSec==="references" && (
        <div>
          {Object.values(REFS).map(ref => (
            <div key={ref.id} style={{marginBottom:8,padding:"12px 14px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:7}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:10,color:C.teal,fontFamily:FONT_MONO,fontWeight:700,flexShrink:0,minWidth:28}}>[{ref.id}]</span>
                <div>
                  <div style={{fontSize:12,color:C.txt,marginBottom:2,fontWeight:700}}>{ref.tag} · <span style={{color:C.txt2,fontWeight:400}}>{ref.org} ({ref.year})</span></div>
                  <div style={{fontSize:12,color:C.txt2,marginBottom:3}}>{ref.title}</div>
                  <div style={{fontSize:11,color:C.txt3,marginBottom:5,lineHeight:1.4}}>{ref.note}</div>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.teal2,wordBreak:"break-all",textDecoration:"none"}}>{ref.url}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [hospital,    setHospital]    = useState({...HOSPITAL_SIZES[1]});
  const [benchIdx,    setBenchIdx]    = useState(1);
  const [pFrac,       setPFrac]       = useState(0.75);
  const [subFee,      setSubFee]      = useState(100000);
  const [adHocPrice,  setAdHocPrice]  = useState(300);
  const [tatIdx,      setTatIdx]      = useState(TAT_DEFAULT_IDX);
  const [incSSI,      setIncSSI]      = useState(false);
  const [useVar,      setUseVar]      = useState(false);
  const [tab,         setTab]         = useState("overview");
  const [pricingMode, setPricingMode] = useState("sub");
  const [openSec,     setOpenSec]     = useState({profile:true, hais:true, cultures:false, assumptions:true});

  const setField = (path, val) => {
    setBenchIdx(null);
    setHospital(prev => {
      const next = {...prev};
      if (path.includes(".")) { const [a,b]=path.split("."); next[a]={...next[a],[b]:val}; }
      else next[path]=val;
      return next;
    });
  };

  const applyBench = (i) => {
    setBenchIdx(i);
    setHospital({...HOSPITAL_SIZES[i]});
  };

  const toggleSec = k => setOpenSec(s=>({...s,[k]:!s[k]}));

  const {data:allData, totalHAIs} = useMemo(
    ()=>runAll(hospital,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx),
    [hospital,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx]
  );
  const costTable = useVar ? HAI_COSTS_VARIABLE : HAI_COSTS_TOTAL;
  const medRev    = hospital.totalRevenueMn*1e6*hospital.medicareRevenuePct;

  const TABS = [
    ["overview",  "Overview"],
    ["breakdown", "HAI Breakdown"],
    ["pricing",   "Subscription vs. Ad Hoc"],
    ["plots",     "Plots"],
    ["docs",      "Documentation"],
  ];

  const card = {background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,padding:"20px 22px"};

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT_BODY,color:C.txt}}>
      {/* Header */}
      <div style={{background:C.s0,borderBottom:`1px solid ${C.border}`,padding:"12px 24px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:28,height:28,background:C.teal,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:C.s0,fontSize:15,fontWeight:800}}>P</span>
            </div>
            <div>
              <div style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:"0.01em"}}>Prospect Genomics</div>
              <div style={{fontSize:17,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY,lineHeight:1.1}}>HAI Prevention Value Calculator</div>
            </div>
          </div>
          <div style={{fontSize:12,color:C.txt3}}>prospectgenomics.bio</div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 24px 60px",display:"flex",gap:20,alignItems:"flex-start"}}>

        {/* ── SIDEBAR ── */}
        <div style={{width:296,flexShrink:0,background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,position:"sticky",top:62,maxHeight:"calc(100vh - 80px)",overflowY:"auto"}}>

          {/* Benchmark quick-fill */}
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,fontWeight:700,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Benchmark Hospital</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {HOSPITAL_SIZES.map((h,i) => (
                <button key={h.id} onClick={()=>applyBench(i)}
                  style={{padding:"8px 10px",borderRadius:7,cursor:"pointer",border:`1px solid ${benchIdx===i?C.teal:C.border}`,background:benchIdx===i?C.tealXp:C.bg,color:benchIdx===i?C.teal:C.txt2,fontFamily:FONT_BODY,fontSize:12,fontWeight:benchIdx===i?700:500,textAlign:"left",transition:"all 0.1s"}}>
                  <div style={{fontSize:13,marginBottom:1,fontFamily:FONT_DISPLAY}}>{h.label}</div>
                  <div style={{fontSize:10,opacity:0.7}}>{h.beds}</div>
                </button>
              ))}
            </div>
            {benchIdx===null && <div style={{marginTop:6,fontSize:10,color:C.amber}}>Custom data</div>}
          </div>

          {/* Hospital Profile */}
          <SecHeader title="Hospital Profile" open={openSec.profile} onToggle={()=>toggleSec("profile")}/>
          {openSec.profile && (
            <div style={{padding:"12px 16px"}}>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3,fontWeight:600}}>Hospital Name</div>
                <input type="text" value={hospital.name||""} onChange={e=>setField("name",e.target.value)} placeholder="e.g. Valley Medical Center"
                  style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,padding:"6px 8px",color:C.txt,fontFamily:FONT_BODY,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <SInput label="Total Revenue ($M)" value={hospital.totalRevenueMn} onChange={v=>setField("totalRevenueMn",v)} min={1}/>
              <Slider label="Medicare Revenue %" value={hospital.medicareRevenuePct} min={0.10} max={0.45} step={0.01}
                onChange={v=>setField("medicareRevenuePct",v)} format={pct}
                hint="Typical 19–28% for acute care (R17)"/>
              <SInput label="Admissions/yr" value={hospital.admissionsPerYear} onChange={v=>setField("admissionsPerYear",v)}/>
              <SInput label="Patient-days/yr" value={hospital.patientDaysPerYear} onChange={v=>setField("patientDaysPerYear",v)}/>
              <SInput label="Surgical procedures/yr" value={hospital.surgicalProcedures||0} onChange={v=>setField("surgicalProcedures",v)}/>
              <div style={{padding:"10px 12px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:7,marginTop:4}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["Medicare rev.",fm(medRev)],["Max HACRP",fm(medRev*0.01)],["HAIs/yr",totalHAIs],["Seqs (M1)",fn(allData.m1.seqs)]].map(([k,v])=>(
                    <div key={k}>
                      <div style={{fontSize:9,color:C.teal,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:1}}>{k}</div>
                      <div style={{fontSize:13,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HAI Counts */}
          <SecHeader title="HAI Counts" open={openSec.hais} onToggle={()=>toggleSec("hais")} count={Object.keys(HAI_LABELS).filter(t=>t!=="ssi"||incSSI).length}/>
          {openSec.hais && (
            <div style={{padding:"12px 16px"}}>
              <div style={{fontSize:11,color:C.txt3,marginBottom:10,lineHeight:1.5}}>Annual NHSN-reported events. Edit individual values or use benchmark fill above.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {["clabsi","cauti","cdi","mrsa","vae","ssi"].map(t => (
                  <SInput key={t} label={HAI_LABELS[t]} value={hospital.hais[t]||0} onChange={v=>setField(`hais.${t}`,v)}/>
                ))}
              </div>
            </div>
          )}

          {/* Culture Volumes */}
          <SecHeader title="Culture Volumes" open={openSec.cultures} onToggle={()=>toggleSec("cultures")}/>
          {openSec.cultures && (
            <div style={{padding:"12px 16px"}}>
              <div style={{fontSize:11,color:C.txt3,marginBottom:10,lineHeight:1.5}}>Annual positive culture counts — the sequencing denominator.</div>
              {Object.entries(CULTURE_LABELS).map(([key,label]) => (
                <SInput key={key} label={label} value={hospital.cultureVolumes[key]||0} onChange={v=>setField(`cultureVolumes.${key}`,v)}/>
              ))}
              <div style={{fontSize:10,color:C.txt3,lineHeight:1.4,padding:"8px 10px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:6}}>
                CDI note: NAAT-only labs may generate 50–100% more positives than toxin+NAAT institutions.
              </div>
            </div>
          )}

          {/* Model Assumptions */}
          <SecHeader title="Model Assumptions" open={openSec.assumptions} onToggle={()=>toggleSec("assumptions")}/>
          {openSec.assumptions && (
            <div style={{padding:"12px 16px 16px"}}>
              <Slider label="Cluster Interruption Rate" value={pFrac} min={0} max={1.0} step={0.05}
                onChange={setPFrac} format={pct} hint="% of WGS-identified clusters IP disrupts. Range 0–100% (literature: 47–85%, R19)."/>
              <TATpicker tatIdx={tatIdx} setTatIdx={setTatIdx}/>
              <Slider label="Annual Subscription Fee" value={subFee} min={25000} max={300000} step={5000}
                onChange={setSubFee} format={v=>`$${(v/1000).toFixed(0)}K/yr`}
                hint="Flat fee to hospital — includes sequencing, analysis, software, support."/>
              <Slider label="Ad Hoc Price / Sample" value={adHocPrice} min={175} max={500} step={5}
                onChange={setAdHocPrice} format={v=>`$${v}/sample`}
                hint="Per-sample cost to hospital. Floor $175 (50% margin). Typical: $250–350."/>
              <Toggle on={incSSI} onClick={()=>setIncSSI(!incSSI)} labelOn="SSI Included" labelOff="SSI Excluded" note="Include wound culture isolates in sequencing volume"/>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:4}}>
                <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,marginBottom:8}}>Cost Perspective</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[["total","Total costs","Full attributable"],["variable","Variable costs","Conservative · 65%"]].map(([val,label,note]) => {
                    const active = (!useVar&&val==="total")||(useVar&&val==="variable");
                    return (
                      <button key={val} onClick={()=>setUseVar(val==="variable")}
                        style={{padding:"8px 10px",borderRadius:6,cursor:"pointer",border:`1px solid ${active?C.teal:C.border}`,background:active?C.tealXp:C.bg,color:active?C.teal:C.txt2,fontFamily:FONT_BODY,fontSize:11,fontWeight:600,textAlign:"left",transition:"all 0.1s"}}>
                        <div style={{marginBottom:1}}>{label}</div>
                        <div style={{fontSize:9,opacity:0.7,fontWeight:400}}>{note}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{flex:1,minWidth:0}}>

          {/* Tabs */}
          <div style={{display:"flex",gap:3,marginBottom:18,flexWrap:"wrap",background:C.s0,padding:"5px",borderRadius:8,border:`1px solid ${C.border}`,width:"fit-content"}}>
            {TABS.map(([id,label]) => (
              <button key={id} onClick={()=>setTab(id)}
                style={{padding:"8px 16px",borderRadius:6,cursor:"pointer",background:tab===id?C.teal:"transparent",border:"none",color:tab===id?C.s0:C.txt3,fontFamily:FONT_BODY,fontSize:13,fontWeight:tab===id?600:500,transition:"all 0.12s"}}>
                {label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab==="overview" && (
            <div>
              <ModelOverview/>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
                <span style={{fontSize:11,color:C.txt3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Pricing mode</span>
                {[["sub",`Subscription · ${fm(subFee)}/yr flat`],["adhoc",`Ad hoc · $${adHocPrice}/sample`]].map(([mode,label]) => (
                  <button key={mode} onClick={()=>setPricingMode(mode)}
                    style={{padding:"6px 16px",borderRadius:6,cursor:"pointer",border:`1px solid ${pricingMode===mode?C.teal:C.border}`,background:pricingMode===mode?C.tealXp:C.s0,color:pricingMode===mode?C.teal:C.txt3,fontFamily:FONT_BODY,fontSize:12,fontWeight:pricingMode===mode?700:500,transition:"all 0.1s"}}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {MODELS.map(m => <ModelCard key={m.id} model={m} data={allData[m.id]} pricingMode={pricingMode}/>)}
              </div>
            </div>
          )}

          {/* ── BREAKDOWN ── */}
          {tab==="breakdown" && (
            <div>
              <div style={{...card,marginBottom:16,padding:0,overflow:"hidden"}}>
                <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.txt}}>HAIs prevented per year{incSSI?" · SSI included":""}</div>
                  <div style={{fontSize:11,color:C.txt3}}>Cost type: {useVar?"Variable (65%)":"Total attributable"} · Edit HAI counts in sidebar</div>
                </div>
                <BreakdownTable models={MODELS} allData={allData} incSSI={incSSI} costTable={costTable}/>
              </div>
              <div style={card}>
                <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:16}}>HACRP Penalty Exposure · Max {fm(medRev*0.01)}/yr</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                  {MODELS.map(m => {
                    const d = allData[m.id].hacrp;
                    return (
                      <div key={m.id}>
                        <div style={{fontSize:11,color:m.color,marginBottom:10,fontWeight:700}}>{m.label} · {m.name}</div>
                        {[["Baseline exposure",fm(d.baselineExposure),C.txt2],["After program",fm(d.reducedExposure),m.color],["HACRP savings","+"+fm(d.saved),C.green]].map(([k,v,clr]) => (
                          <div key={k} style={{marginBottom:8}}>
                            <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>{k}</div>
                            <div style={{fontSize:14,color:clr,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {tab==="pricing" && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <div style={card}>
                  <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:14}}>Subscription Pricing</div>
                  <div style={{fontSize:24,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums",marginBottom:4}}>${(subFee/1000).toFixed(0)}K/yr</div>
                  <div style={{fontSize:12,color:C.txt3,marginBottom:16}}>Flat annual fee · all models included · adjust in sidebar</div>
                  <div style={{fontSize:12,color:C.txt2,lineHeight:1.6}}>Includes all sequencing, analysis, continuous monitoring, IP support, and access to the Prospect platform — regardless of sample volume.</div>
                </div>
                <div style={card}>
                  <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:14}}>Ad Hoc Pricing</div>
                  <div style={{fontSize:24,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums",marginBottom:4}}>${adHocPrice}/sample</div>
                  <div style={{fontSize:12,color:C.txt3,marginBottom:16}}>Per-sample · adjust in sidebar · floor $175</div>
                  <div style={{fontSize:12,color:C.txt2,lineHeight:1.6}}>Cost to hospital per WGS sample. No software platform or ongoing support. Breakeven vs. subscription at {Math.round(subFee/adHocPrice).toLocaleString()} samples/yr.</div>
                </div>
              </div>

              <div style={{...card,marginBottom:16,padding:0,overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.txt}}>Cost to Hospital by Model — {hospital.name||"Your Hospital"}</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead>
                      <tr style={{borderBottom:`2px solid ${C.border}`}}>
                        {["Model","Seqs/yr","Subscription","Ad hoc cost","Sub net value","Ad hoc net value","Better option"].map((h,i)=>(
                          <th key={h} style={{padding:"10px 14px",textAlign:i===0?"left":"right",color:C.txt3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",fontSize:10}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MODELS.map((m,i) => {
                        const d = allData[m.id];
                        const subBetter = d.netValueSub >= d.netValueAdHoc;
                        return (
                          <tr key={m.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>
                            <td style={{padding:"10px 14px",fontWeight:700,color:m.color}}>{m.label} · {m.name}</td>
                            <td style={{padding:"10px 14px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:C.txt2}}>{fn(d.seqs)}</td>
                            <td style={{padding:"10px 14px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:C.txt2}}>{fm(d.programCostSub)}</td>
                            <td style={{padding:"10px 14px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:C.txt2}}>{fm(d.programCostAdHoc)}</td>
                            <td style={{padding:"10px 14px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:d.netValueSub>0?C.teal:C.red,fontWeight:700}}>{d.netValueSub>0?"+":""}{fm(d.netValueSub)}</td>
                            <td style={{padding:"10px 14px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:d.netValueAdHoc>0?C.teal:C.red,fontWeight:700}}>{d.netValueAdHoc>0?"+":""}{fm(d.netValueAdHoc)}</td>
                            <td style={{padding:"10px 14px",textAlign:"right"}}>
                              <span style={{fontSize:11,fontWeight:700,color:subBetter?C.teal:C.amber,background:subBetter?C.tealXp:"#fef3c7",border:`1px solid ${subBetter?C.tealPale:"#fde68a"}`,borderRadius:5,padding:"3px 9px"}}>
                                {subBetter?"Subscription":"Ad hoc"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={card}>
                <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:12}}>Crossover Analysis</div>
                <div style={{fontSize:13,color:C.txt2,marginBottom:16,lineHeight:1.6}}>
                  Subscription beats ad hoc when <strong style={{color:C.teal}}>seqs/yr &gt; {Math.round(subFee/adHocPrice).toLocaleString()}</strong> (${(subFee/1000).toFixed(0)}K ÷ ${adHocPrice}/sample). Note: subscription also includes analysis platform and IP support not available ad hoc.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {MODELS.map(m => {
                    const d         = allData[m.id];
                    const crossover = Math.round(subFee/adHocPrice);
                    const subWins   = d.seqs >= crossover;
                    const delta     = d.netValueSub - d.netValueAdHoc;
                    return (
                      <div key={m.id} style={{background:subWins?C.tealXp:C.bg,border:`1px solid ${subWins?C.tealPale:C.border}`,borderRadius:8,padding:"14px"}}>
                        <div style={{fontSize:11,color:m.color,fontWeight:700,marginBottom:10}}>{m.label} · {m.name}</div>
                        {[["Seqs/yr",fn(d.seqs)],["Crossover",`${crossover.toLocaleString()} seqs`],["Sub vs. ad hoc",(delta>=0?"+":"")+fm(delta)],["Best option",subWins?"Subscription":"Ad hoc"]].map(([k,v])=>(
                          <div key={k} style={{marginBottom:7}}>
                            <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:1}}>{k}</div>
                            <div style={{fontSize:13,fontWeight:700,color:k==="Best option"?(subWins?C.teal:C.amber):C.txt,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── PLOTS ── */}
          {tab==="plots" && (
            <div>
              <div style={{...card,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:11,color:C.teal,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:4}}>Plot 1</div>
                    <div style={{fontSize:16,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY}}>Net Value by Surveillance Model</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {[["sub","Subscription"],["adhoc","Ad hoc"]].map(([mode,label])=>(
                      <button key={mode} onClick={()=>setPricingMode(mode)}
                        style={{padding:"5px 14px",borderRadius:5,cursor:"pointer",border:`1px solid ${pricingMode===mode?C.teal:C.border}`,background:pricingMode===mode?C.tealXp:C.bg,color:pricingMode===mode?C.teal:C.txt3,fontFamily:FONT_BODY,fontSize:12,fontWeight:pricingMode===mode?700:500}}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <NetValueChart allData={allData} pricingMode={pricingMode}/>
              </div>

              <div style={card}>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,color:C.teal,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:4}}>Plot 2</div>
                  <div style={{fontSize:16,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY}}>Sensitivity: Net Value vs. Cluster Interruption Rate</div>
                  <div style={{fontSize:12,color:C.txt3,marginTop:4}}>
                    Showing {pricingMode==="sub"?"subscription":"ad hoc"} pricing · vertical line = current pFrac ({Math.round(pFrac*100)}%)
                  </div>
                </div>
                <SensitivityChart
                  hospital={hospital} subFee={subFee} adHocPrice={adHocPrice}
                  incSSI={incSSI} useVar={useVar} tatIdx={tatIdx}
                  pricingMode={pricingMode} currentPFrac={pFrac}/>
              </div>
            </div>
          )}

          {/* ── DOCUMENTATION ── */}
          {tab==="docs" && <DocumentationTab useVar={useVar}/>}

        </div>
      </div>
    </div>
  );
}

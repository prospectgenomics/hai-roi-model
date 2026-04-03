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
  greenPale: "#f0fdf4",
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
  sh1:       "0 1px 3px rgba(15,17,23,.07),0 1px 2px rgba(15,17,23,.04)",
  sh2:       "0 4px 20px rgba(15,17,23,.08),0 1px 4px rgba(15,17,23,.05)",
};
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";
const FONT_DISPLAY = "'Instrument Serif', Georgia, serif";
const FONT_MONO    = "'DM Mono', 'SF Mono', monospace";

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

// HAI costs: AHRQ 2017 (2015 USD) × CPI Medical Care Services 2015→2024 (+29%)
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

// Transmissible fraction: % of reported HAIs attributable to cross-transmission (R14, R15)
const TRANS_FRAC = { clabsi:0.45, cauti:0.32, cdi:0.38, mrsa:0.42, vae:0.38, ssi:0.42 };

const HAI_LABELS     = { clabsi:"CLABSI", cauti:"CAUTI", cdi:"CDI (HO)", mrsa:"MRSA Bacteremia", vae:"VAE", ssi:"SSI" };
const CULTURE_LABELS = { mrsa:"MRSA isolates/yr", cdi:"CDI positive tests/yr", cre:"CRE isolates/yr", abx:"Acinetobacter isolates/yr", mssa:"MSSA blood cx/yr" };

const AVG_CLUSTER_SIZE = 5;

// Sequencing turnaround time options
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
const TAT_DEFAULT_IDX = 3; // 3 days = reference TAT

const MODELS = [
  { id:"m1", label:"Model 1", name:"Full Surveillance",    color:C.teal,    detectionRate:0.90, interventionLagCases:1.5, envMultiplier:1.25, valueType:"immediate", desc:"All positive cultures sequenced in real time with environmental sampling triggered by confirmed infection. Continuous phylogenetic context." },
  { id:"m2", label:"Model 2", name:"Prospective Clinical", color:C.teal2,   detectionRate:0.73, interventionLagCases:2.5, envMultiplier:1.0,  valueType:"immediate", desc:"Every positive clinical culture sequenced as reported. Real-time phylogenetic context from clinical specimens only." },
  { id:"m3", label:"Model 3", name:"Semi-Prospective",     color:C.amber,   detectionRate:0.40, interventionLagCases:5.0, envMultiplier:1.0,  valueType:"delayed",   desc:"Sequencing triggered when IP suspects a cluster (2+ cases, same unit). No prior phylogenetic context available." },
  { id:"m4", label:"Model 4", name:"Retrospective Only",   color:"#78716c", detectionRate:0.20, interventionLagCases:8.0, envMultiplier:1.0,  valueType:"future",    desc:"Outbreak declared before sequencing begins. Archived isolates pulled forensically. Value is reservoir identification and future response speed." },
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
  // TAT scales intervention lag for real-time models (M1/M2). Reference = 72h (3 days).
  const tatHours   = TAT_STEPS[tatIdx].hours;
  const tatScale   = (model.id==="m1"||model.id==="m2") ? tatHours/72 : 1;
  const effectiveLag = model.interventionLagCases * tatScale;
  const lagFrac    = Math.min(effectiveLag / AVG_CLUSTER_SIZE, 0.85);
  const types = incSSI ? ["clabsi","cauti","cdi","mrsa","vae","ssi"] : ["clabsi","cauti","cdi","mrsa","vae"];
  let total=0; const byType={};
  for (const t of types) {
    const annual = hosp.hais[t] || 0;
    let val;
    if (model.valueType==="future") {
      // Retrospective: P(reservoir found) × P(future cluster interrupted given ID = pFrac)
      val = annual * TRANS_FRAC[t] * pFrac * 0.55 * (AVG_CLUSTER_SIZE / Math.max(annual,1));
    } else {
      // pFrac = cluster interruption rate (fraction of WGS-identified clusters IP successfully stops)
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
  const base = maxP*0.40; // ~40% of hospitals near penalty threshold annually
  const rf   = Math.min(prevented/Math.max(totalHAIs,1), 0.85);
  return { maxPenalty:maxP, baselineExposure:base, reducedExposure:base*(1-rf), saved:base*rf };
}

function runAll(hosp, pFrac, subFee, adHocPrice, incSSI, useVar, tatIdx) {
  const totalHAIs = Object.entries(hosp.hais).reduce((a,[k,v])=>k!=="ssi"||incSSI?a+v:a,0);
  const costTable = useVar ? HAI_COSTS_VARIABLE : HAI_COSTS_TOTAL;
  const out={};
  for (const model of MODELS) {
    const seqs          = calcSeqs(hosp,model,incSSI);
    const prevented     = calcPrevented(hosp,model,pFrac,incSSI,tatIdx);
    const cost          = calcCosts(prevented.byType, costTable);
    const hacrp         = calcHACRP(hosp,totalHAIs,prevented.total);
    const benefitTotal  = cost.total + hacrp.saved;
    const progSub       = subFee;
    const progAdHoc     = seqs * adHocPrice;
    out[model.id] = {
      seqs,
      haIsPrevented:    prevented,
      costAvoided:      cost,
      hacrp,
      programCostSub:   progSub,
      programCostAdHoc: progAdHoc,
      netValueSub:      benefitTotal - progSub,
      netValueAdHoc:    benefitTotal - progAdHoc,
      costPerHAISub:    prevented.total>0.5 ? progSub/prevented.total    : 0,
      costPerHAIAdHoc:  prevented.total>0.5 ? progAdHoc/prevented.total  : 0,
      seqsPerHAI:       prevented.total>0.5 ? seqs/prevented.total       : 0,
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
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Slider({label, value, min, max, step, onChange, format}) {
  return (
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:12,color:C.txt3,letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:600}}>{label}</span>
        <span style={{fontSize:14,fontWeight:700,color:C.teal,fontFamily:FONT_MONO}}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(parseFloat(e.target.value))}
        style={{width:"100%",accentColor:C.teal,cursor:"pointer",height:4}}/>
    </div>
  );
}

function NumInput({label, value, onChange, hint, min=0}) {
  return (
    <div>
      <div style={{fontSize:12,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4,fontWeight:600}}>{label}</div>
      {hint && <div style={{fontSize:11,color:C.txt3,marginBottom:5,lineHeight:1.5}}>{hint}</div>}
      <input type="number" min={min} value={value===0?"":value}
        onChange={e=>{const v=parseInt(e.target.value)||0; onChange(Math.max(min,v));}}
        onFocus={e=>e.target.select()}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 11px",color:C.txt,fontFamily:FONT_MONO,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color 0.15s"}}
        onMouseOver={e=>e.target.style.borderColor=C.teal3}
        onMouseOut={e=>e.target.style.borderColor=C.border}
      />
    </div>
  );
}

function Tag({text, color=C.teal}) {
  return <span style={{display:"inline-block",padding:"1px 7px",fontSize:10,fontFamily:FONT_MONO,background:`${color}18`,border:`1px solid ${color}33`,borderRadius:4,color,fontWeight:600,letterSpacing:"0.05em"}}>{text}</span>;
}

function TATpicker({tatIdx, setTatIdx}) {
  return (
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:12,color:C.txt3,letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:600}}>Sequencing Turnaround Time</span>
        <span style={{fontSize:14,fontWeight:700,color:C.teal,fontFamily:FONT_MONO}}>{TAT_STEPS[tatIdx].label}</span>
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {TAT_STEPS.map((s,i) => (
          <button key={i} onClick={()=>setTatIdx(i)}
            style={{padding:"5px 9px",fontSize:11,borderRadius:5,cursor:"pointer",fontFamily:FONT_MONO,fontWeight:600,transition:"all 0.1s",
              border:`1px solid ${i===tatIdx?C.teal:C.border}`,
              background:i===tatIdx?C.teal:"transparent",
              color:i===tatIdx?C.s0:C.txt3}}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{fontSize:11,color:C.txt3,marginTop:6,lineHeight:1.5}}>Affects Models 1 & 2 only. Reference: 3 days (R13, R19).</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL OVERVIEW (top of page)
// ─────────────────────────────────────────────────────────────────────────────
function ModelOverview() {
  const eqParts = [
    {label:"HAIs prevented",   sub:"Transmission clusters detected earlier",  color:C.teal},
    {op:"×"},
    {label:"Cost per HAI",     sub:"Total attributable cost (2024 USD)",       color:C.teal},
    {op:"+"},
    {label:"HACRP savings",    sub:"Medicare penalty reduction",               color:C.teal},
    {op:"−"},
    {label:"Program cost",     sub:"Subscription or per-sample",               color:C.txt2},
    {op:"="},
    {label:"Net annual value", sub:"Hospital perspective · 1-year horizon",    color:C.green},
  ];
  const included = [
    "NHSN-defined HAIs: CLABSI, CAUTI, CDI, MRSA bacteremia, VAE (SSI optional)",
    "Direct attributable costs from WGS-detected cross-transmission clusters",
    "HACRP Medicare penalty exposure reduction (1% of Medicare FFS revenue)",
    "Program cost: flat annual subscription or per-sample ad hoc pricing",
  ];
  const excluded = [
    "Costs of non-genomic IP interventions (OR closures, cohorting, enhanced PPE)",
    "Value of ruling out transmission — WGS prevents unnecessary interventions",
    "Societal costs, readmissions, litigation, or long-term morbidity",
    "NTM, Candida auris, or non-NHSN pathogen outbreaks",
  ];
  return (
    <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"28px 32px",marginBottom:24,boxShadow:C.sh1}}>
      <div style={{fontSize:11,color:C.teal,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700,marginBottom:8}}>How this model works</div>
      <div style={{fontSize:20,fontWeight:700,fontFamily:FONT_DISPLAY,color:C.txt,marginBottom:20,lineHeight:1.3}}>
        A one-year cost-benefit analysis of WGS surveillance for hospital infection prevention
      </div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:0,background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:10,padding:"16px 20px",marginBottom:24}}>
        {eqParts.map((item,i) =>
          item.op ? (
            <div key={i} style={{fontSize:20,color:C.txt3,fontWeight:300,padding:"0 10px"}}>{item.op}</div>
          ) : (
            <div key={i} style={{textAlign:"center",padding:"4px 10px"}}>
              <div style={{fontSize:13,fontWeight:700,color:item.color,fontFamily:FONT_MONO,whiteSpace:"nowrap"}}>{item.label}</div>
              <div style={{fontSize:11,color:C.txt3,marginTop:3,lineHeight:1.4}}>{item.sub}</div>
            </div>
          )
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:C.teal,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.07em"}}>Included</div>
          {included.map((t,i) => (
            <div key={i} style={{display:"flex",gap:10,marginBottom:9,alignItems:"flex-start"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:C.teal,marginTop:6,flexShrink:0}}/>
              <div style={{fontSize:13,color:C.txt2,lineHeight:1.6}}>{t}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:C.txt3,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.07em"}}>Not included</div>
          {excluded.map((t,i) => (
            <div key={i} style={{display:"flex",gap:10,marginBottom:9,alignItems:"flex-start"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:C.border2,marginTop:6,flexShrink:0}}/>
              <div style={{fontSize:13,color:C.txt3,lineHeight:1.6}}>{t}</div>
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
  return (
    <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"22px 24px",boxShadow:C.sh1,position:"relative",overflow:"hidden",transition:"box-shadow 0.2s"}}
      onMouseOver={e=>e.currentTarget.style.boxShadow=C.sh2}
      onMouseOut={e=>e.currentTarget.style.boxShadow=C.sh1}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:model.color,borderRadius:"12px 12px 0 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontSize:11,color:model.color,letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:700,marginBottom:4}}>{model.label}</div>
          <div style={{fontSize:17,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY}}>{model.name}</div>
        </div>
        <div style={{background:positive?C.tealXp:C.redPale,border:`1px solid ${positive?C.tealPale:"#fecaca"}`,borderRadius:8,padding:"6px 14px",fontSize:15,fontWeight:700,color:positive?C.teal:C.red,fontFamily:FONT_MONO,whiteSpace:"nowrap"}}>
          {positive?"+":""}{fm(netValue)}
        </div>
      </div>
      <p style={{fontSize:13,color:C.txt3,lineHeight:1.6,marginBottom:16,minHeight:40}}>{model.desc}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 20px",paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        {[
          ["Sequences/yr",     fn(seqs)],
          ["Program cost",     fm(programCost)],
          ["HAIs prevented",   fn(haIsPrevented.total)+(model.valueType==="future"?" *":"")],
          ["Cost avoided",     fm(costAvoided.total)],
          ["HACRP savings",    fm(hacrp.saved)],
          ["Cost/HAI prev.",   haIsPrevented.total>0.5 ? fm(costPerHAI) : "—"],
          ["Seqs/HAI prev.",   haIsPrevented.total>0.5 ? fn(data.seqsPerHAI) : "—"],
          ["Net value",        fm(netValue)],
        ].map(([k,v]) => (
          <div key={k}>
            <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3,fontWeight:500}}>{k}</div>
            <div style={{fontSize:15,fontWeight:700,color:C.txt,fontFamily:FONT_MONO}}>{v}</div>
          </div>
        ))}
      </div>
      {model.valueType==="future" && (
        <div style={{marginTop:12,fontSize:11,color:C.txt3,borderTop:`1px solid ${C.border}`,paddingTop:10,lineHeight:1.5}}>
          * Future prevention via reservoir identification — current outbreak not preventable
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
            {["HAI Type","Cost/Case","Trans. Frac.","Sources"].map((h,i) => (
              <th key={h} style={{textAlign:i>0&&i<3?"right":"left",padding:"11px 16px",color:C.txt3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",fontSize:11}}>{h}</th>
            ))}
            {models.map(m => (
              <th key={m.id} style={{padding:"11px 16px",color:m.color,fontWeight:700,textTransform:"uppercase",fontSize:11,textAlign:"right"}}>{m.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map((t,i) => (
            <tr key={t} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>
              <td style={{padding:"11px 16px",color:C.txt,fontWeight:600}}>{HAI_LABELS[t]}</td>
              <td style={{padding:"11px 16px",color:C.txt2,fontFamily:FONT_MONO,textAlign:"right"}}>{fm(costTable[t])}</td>
              <td style={{padding:"11px 16px",color:C.txt3,fontFamily:FONT_MONO,textAlign:"right"}}>{Math.round(TRANS_FRAC[t]*100)}%</td>
              <td style={{padding:"11px 16px"}}><Tag text={srcRefs[t]} color={C.teal}/></td>
              {models.map(m => {
                const n = allData[m.id]?.haIsPrevented?.byType?.[t] ?? 0;
                return <td key={m.id} style={{padding:"11px 16px",fontFamily:FONT_MONO,textAlign:"right",color:n>0?m.color:C.border2,fontWeight:n>0?700:400}}>{n>0?fn(n):"—"}</td>;
              })}
            </tr>
          ))}
          <tr style={{borderTop:`2px solid ${C.border2}`,background:C.tealXp}}>
            <td style={{padding:"11px 16px",color:C.teal,fontWeight:700}} colSpan={4}>Total cost avoided</td>
            {models.map(m => (
              <td key={m.id} style={{padding:"11px 16px",fontFamily:FONT_MONO,textAlign:"right",color:m.color,fontWeight:700}}>{fm(allData[m.id]?.costAvoided?.total??0)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM HOSPITAL TAB
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY = {name:"",beds:0,totalRevenueMn:0,medicareRevenuePct:0.22,admissionsPerYear:0,patientDaysPerYear:0,cultureVolumes:{mrsa:0,cdi:0,cre:0,abx:0,mssa:0},hais:{clabsi:0,cauti:0,cdi:0,mrsa:0,vae:0,ssi:0},surgicalProcedures:0};

function CustomTab({pFrac, subFee, adHocPrice, pricingMode, incSSI, setIncSSI, useVariableCost, tatIdx}) {
  const [custom,   setCustom]  = useState(EMPTY);
  const [step,     setStep]    = useState(0);
  const [prefill,  setPrefill] = useState(null);

  const set = (path, val) => setCustom(prev => {
    const next = {...prev};
    if (path.includes(".")) { const [a,b]=path.split("."); next[a]={...next[a],[b]:val}; }
    else next[path]=val;
    return next;
  });

  const applyPrefill = (idx) => { setCustom({...HOSPITAL_SIZES[idx],name:`${HOSPITAL_SIZES[idx].label} Hospital (benchmark)`}); setPrefill(idx); };

  const totalHAIs = Object.entries(custom.hais).reduce((a,[k,v])=>k!=="ssi"||incSSI?a+v:a,0);
  const {data:allData} = useMemo(()=>runAll(custom,pFrac,subFee,adHocPrice,incSSI,useVariableCost,tatIdx),[custom,pFrac,subFee,adHocPrice,incSSI,useVariableCost,tatIdx]);
  const medRev  = custom.totalRevenueMn*1e6*custom.medicareRevenuePct;
  const hasData = custom.totalRevenueMn>0 || totalHAIs>0;
  const STEPS   = ["Identity","Financials","HAI Counts","Culture Volumes","Results"];

  const stepBtn = (label) => ({
    padding:"9px 24px",background:C.teal,border:"none",borderRadius:8,
    color:C.s0,fontFamily:FONT_BODY,fontSize:13,fontWeight:600,cursor:"pointer"
  });

  return (
    <div>
      {/* Step nav */}
      <div style={{display:"flex",gap:0,marginBottom:20,background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",boxShadow:C.sh1}}>
        {STEPS.map((s,i) => (
          <button key={s} onClick={()=>setStep(i)} style={{flex:1,padding:"11px 8px",cursor:"pointer",background:step===i?C.tealXp:"transparent",border:"none",borderRight:i<STEPS.length-1?`1px solid ${C.border}`:"none",color:step===i?C.teal:i<step?C.teal2:C.txt3,fontFamily:FONT_BODY,fontSize:11,fontWeight:step===i?700:500,letterSpacing:"0.04em",textTransform:"uppercase",transition:"all 0.15s"}}>
            <span style={{display:"block",fontSize:10,marginBottom:2,color:step===i?C.teal:C.border2,fontFamily:FONT_MONO}}>{i+1}</span>{s}
          </button>
        ))}
      </div>

      {/* Prefill */}
      {step<4 && (
        <div style={{marginBottom:20,padding:"14px 18px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8}}>
          <div style={{fontSize:12,color:C.teal,fontWeight:700,marginBottom:10}}>Quick-start: prefill from benchmark</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {HOSPITAL_SIZES.map((h,i) => (
              <button key={h.id} onClick={()=>applyPrefill(i)} style={{padding:"6px 16px",fontSize:12,fontWeight:600,borderRadius:6,cursor:"pointer",border:`1px solid ${prefill===i?C.teal:C.border2}`,background:prefill===i?C.teal:C.s0,color:prefill===i?C.s0:C.txt2,fontFamily:FONT_BODY,transition:"all 0.15s"}}>
                {h.label}
              </button>
            ))}
            {prefill!==null && <button onClick={()=>{setCustom(EMPTY);setPrefill(null);}} style={{padding:"6px 16px",fontSize:12,fontWeight:600,borderRadius:6,cursor:"pointer",border:`1px solid ${C.border}`,background:"transparent",color:C.txt3,fontFamily:FONT_BODY}}>Clear</button>}
          </div>
          <div style={{fontSize:11,color:C.txt3,marginTop:8}}>Prefill loads benchmark values — edit any field to use your actual data.</div>
        </div>
      )}

      {step===0 && (
        <div>
          <p style={{fontSize:13,color:C.txt2,marginBottom:18}}>Enter your hospital's name and basic profile. All fields are optional.</p>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:12,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6,fontWeight:600}}>Hospital Name (optional)</div>
            <input value={custom.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Valley Medical Center"
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 12px",color:C.txt,fontFamily:FONT_BODY,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <NumInput label="Licensed beds" hint="Staffed inpatient beds" value={custom.beds} onChange={v=>set("beds",v)}/>
            <NumInput label="Annual admissions" hint="Total inpatient discharges/year" value={custom.admissionsPerYear} onChange={v=>set("admissionsPerYear",v)}/>
            <NumInput label="Annual patient-days" hint="If unknown: admissions × avg LOS" value={custom.patientDaysPerYear} onChange={v=>set("patientDaysPerYear",v)}/>
            <NumInput label="Annual surgical procedures" hint="Total OR cases/year (for SSI modeling)" value={custom.surgicalProcedures} onChange={v=>set("surgicalProcedures",v)}/>
          </div>
        </div>
      )}

      {step===1 && (
        <div>
          <p style={{fontSize:13,color:C.txt2,marginBottom:18}}>Used to calculate HACRP Medicare penalty exposure. Available from your Medicare Cost Report or CFO.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:16,marginBottom:18}}>
            <NumInput label="Total net patient revenue ($M)" hint="~$60M small, $175M medium, $400M large, $800M+ academic" value={custom.totalRevenueMn} onChange={v=>set("totalRevenueMn",v)}/>
          </div>
          <Slider label="Medicare FFS revenue (% of total)" value={custom.medicareRevenuePct} min={0.10} max={0.45} step={0.01} onChange={v=>set("medicareRevenuePct",v)} format={pct}/>
          <div style={{fontSize:11,color:C.txt3,marginTop:-8,marginBottom:18,lineHeight:1.5}}>Typical range 19–28% for acute care hospitals (Definitive Healthcare 2023, R17)</div>
          {custom.totalRevenueMn>0 && (
            <div style={{padding:"16px 18px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8}}>
              <div style={{fontSize:12,color:C.teal,fontWeight:700,marginBottom:10}}>Derived financials</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
                {[["Total revenue",`$${custom.totalRevenueMn}M`],["Est. Medicare rev.",fm(medRev)],["Max HACRP penalty",fm(medRev*0.01)]].map(([k,v]) => (
                  <div key={k}>
                    <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3}}>{k}</div>
                    <div style={{fontSize:15,fontWeight:700,color:C.teal,fontFamily:FONT_MONO}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step===2 && (
        <div>
          <p style={{fontSize:13,color:C.txt2,marginBottom:6}}>Enter your annual NHSN-reported HAI counts. Pull from your NHSN analysis module or annual IP report.</p>
          <p style={{fontSize:12,color:C.txt3,marginBottom:18}}>Leave at 0 if unknown — benchmark estimates will be used for that type.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {["clabsi","cauti","cdi","mrsa","vae","ssi"].map(t => (
              <NumInput key={t} label={`${HAI_LABELS[t]} events/yr`} hint={`Benchmark (medium): ${HOSPITAL_SIZES[1].hais[t]}/yr`} value={custom.hais[t]} onChange={v=>set(`hais.${t}`,v)}/>
            ))}
          </div>
          <div style={{marginTop:16,display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setIncSSI(!incSSI)} style={{width:42,height:24,borderRadius:12,cursor:"pointer",background:incSSI?C.teal:C.border,border:"none",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:C.s0,position:"absolute",top:3,left:incSSI?21:3,transition:"left 0.2s"}}/>
            </button>
            <div>
              <div style={{fontSize:13,color:incSSI?C.teal:C.txt3,fontWeight:600}}>{incSSI?"SSI included in model":"SSI excluded from model"}</div>
              <div style={{fontSize:11,color:C.txt3}}>Fold wound culture isolates into sequencing volumes</div>
            </div>
          </div>
        </div>
      )}

      {step===3 && (
        <div>
          <p style={{fontSize:13,color:C.txt2,marginBottom:6}}>Annual positive culture counts by organism — the sequencing denominator. Pull from your microbiology lab's annual report or LIS system.</p>
          <p style={{fontSize:12,color:C.txt3,marginBottom:18}}>Leave at 0 to use literature-derived benchmark estimates.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {Object.entries(CULTURE_LABELS).map(([key,label]) => (
              <NumInput key={key} label={label} hint={`Benchmark (medium): ${HOSPITAL_SIZES[1].cultureVolumes[key]}/yr`} value={custom.cultureVolumes[key]} onChange={v=>set(`cultureVolumes.${key}`,v)}/>
            ))}
          </div>
          <div style={{marginTop:14,padding:"13px 16px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:12,color:"#92400e",lineHeight:1.6}}>
            <strong>CDI note:</strong> NAAT-only labs may generate 50–100% more CDI positives than toxin+NAAT two-step institutions (Thaden 2018 EID, R9).
          </div>
        </div>
      )}

      {step===4 && (
        !hasData ? (
          <div style={{padding:"48px 24px",textAlign:"center",background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:C.sh1}}>
            <div style={{fontSize:16,fontWeight:700,fontFamily:FONT_DISPLAY,color:C.txt,marginBottom:10}}>No data entered yet</div>
            <p style={{fontSize:13,color:C.txt2}}>Go back and enter your hospital's data in steps 1–3, or use the quick-start prefill.</p>
            <button onClick={()=>setStep(0)} style={{marginTop:18,...stepBtn("enter")}}>Enter Data</button>
          </div>
        ) : (
          <div>
            <div style={{padding:"16px 20px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,marginBottom:20,boxShadow:C.sh1}}>
              <div style={{fontSize:13,color:C.teal,fontWeight:700,marginBottom:12}}>{custom.name||"Your Hospital"} — Model Inputs</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                {[["Beds",custom.beds||"—"],["Admissions/yr",(custom.admissionsPerYear||0).toLocaleString()],["Patient-days/yr",(custom.patientDaysPerYear||0).toLocaleString()],["Total revenue",custom.totalRevenueMn?`$${custom.totalRevenueMn}M`:"—"],["Medicare rev.",custom.totalRevenueMn?fm(medRev):"—"],["Max HACRP",custom.totalRevenueMn?fm(medRev*0.01):"—"],["HAIs/yr",totalHAIs||"0"],["Cultures/yr",Object.values(custom.cultureVolumes).reduce((a,b)=>a+b,0).toLocaleString()]].map(([k,v]) => (
                  <div key={k}>
                    <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3}}>{k}</div>
                    <div style={{fontSize:15,fontWeight:700,color:C.teal,fontFamily:FONT_MONO}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
              {MODELS.map(m => <ModelCard key={m.id} model={m} data={allData[m.id]} pricingMode={pricingMode}/>)}
            </div>
          </div>
        )
      )}

      <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{padding:"9px 22px",background:step===0?C.bg:C.s0,border:`1px solid ${C.border}`,borderRadius:8,color:step===0?C.txt3:C.txt2,fontFamily:FONT_BODY,fontSize:13,fontWeight:500,cursor:step===0?"default":"pointer"}}>Back</button>
        {step<4
          ? <button onClick={()=>setStep(s=>s+1)} style={stepBtn("next")}>{step===3?"See Results":"Next"}</button>
          : <button onClick={()=>setStep(0)} style={{padding:"9px 22px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,color:C.teal,fontFamily:FONT_BODY,fontSize:13,fontWeight:600,cursor:"pointer"}}>Edit Data</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSUMPTIONS TAB
// ─────────────────────────────────────────────────────────────────────────────
function AssumptionsTab() {
  const [openRef,setOpenRef] = useState(null);
  const sections = [
    {cat:"HAI Attributable Costs (2024 USD)", items:[
      {label:"CLABSI",value:`$${Math.round(48108*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(48108*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"AHRQ 2017 meta-analysis (7 studies); inflated 2015→2024 via CPI Medical Care Services (+29%). Variable cost = 65% of total (Graves 2007). Default uses total costs.",refs:["R1","R23","R25","R26"],conf:"High — AHRQ gold standard"},
      {label:"CAUTI",value:`$${Math.round(13793*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(13793*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"AHRQ 2017 meta-analysis.",refs:["R1","R23","R25"],conf:"High"},
      {label:"CDI (hospital-onset)",value:`$${Math.round(17000*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(17000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"Forrester 2022 HCUP-NIS; Zhang 2024 community network; AHRQ range $15K–$20K (2015 USD).",refs:["R3","R4","R23","R25"],conf:"Moderate — range $15K–$20K"},
      {label:"MRSA bacteremia",value:`$${Math.round(42000*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(42000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"Zimlichman 2013 + MRSA premium ~$13K over non-MRSA BSI.",refs:["R2","R23","R25"],conf:"Moderate"},
      {label:"VAE",value:`$${Math.round(32000*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(32000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"AHRQ 2017 range for VAP/VAE.",refs:["R1","R23","R25"],conf:"Moderate"},
      {label:"SSI",value:`$${Math.round(21000*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(21000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"Zimlichman 2013 meta-analysis.",refs:["R2","R23","R25"],conf:"High"},
    ]},
    {cat:"Culture Volumes (sequencing denominator)", items:[
      {label:"MRSA isolates",value:"~12% of true+ blood cultures + wound/skin",basis:"Derived from Thom 2024 EIP surveillance rates and Martin 2024 ICHE: 4.22 HAI/10,000 pt-days.",refs:["R12","R14"],conf:"Moderate — derived estimate"},
      {label:"CDI positive tests",value:"0.57–0.88/1,000 pt-days by hospital type",basis:"Thaden 2018 EID — prospective multicenter US study, 30 hospitals.",refs:["R9"],conf:"High — US prospective multicenter"},
      {label:"CRE isolates",value:"2.44/10,000 admissions (CRKP 2022)",basis:"Kadri 2024 OFID — PINC AI + BD Insights national database.",refs:["R10"],conf:"High — large US national database"},
      {label:"Blood culture volume",value:"21.5 sets/1,000 pt-days; 15.4% positivity",basis:"Ohishi 2021 — 63 hospitals ≥200 beds.",refs:["R8"],conf:"Moderate — Japan data; US rates comparable"},
    ]},
    {cat:"WGS Prevention Efficacy", items:[
      {label:"Transmissible fraction by HAI type",value:"CLABSI 45%, CAUTI 32%, CDI 38%, MRSA 42%, VAE 38%",basis:"Fraction of reported HAIs attributable to detectable cross-transmission. Martin 2024 ICHE: WGS-attributed vs. total MRSA HAI. Haaber 2022: ~18.9% patient-to-patient WGS evidence.",refs:["R14","R15","R20"],conf:"Moderate — single-center WGS studies"},
      {label:"Cluster interruption rate (default 75%)",value:"75% of WGS-identified transmission clusters are successfully interrupted by IP",basis:"Contact precautions reduce MRSA transmission ~47% (Toth 2022). WGS-guided active intervention likely achieves 60–85%. Applied directly as pFrac × TRANS_FRAC[t] × detectionRate × (1−lagFrac). Range 0–100%.",refs:["R19","R14"],conf:"Moderate — literature-supported range"},
      {label:"Intervention lag (fixed cluster denominator)",value:"Lag fraction = effective lag cases / avg cluster size (5 cases)",basis:"Fixed cluster size of 5 from Bhargava 2021 ICU data and Toth 2022 outbreak modeling. TAT scales lag for Models 1 & 2 proportionally (reference: 3 days).",refs:["R13","R19"],conf:"Moderate — literature-derived"},
    ]},
    {cat:"HACRP & Hospital Revenue", items:[
      {label:"1% Medicare FFS penalty",value:"Worst-performing quartile on composite HAC score",basis:"CMS HACRP federal regulation.",refs:["R16"],conf:"High — federal regulation"},
      {label:"Medicare revenue fraction",value:"19–28% of total net revenue by hospital size",basis:"Definitive Healthcare Medicare Cost Report analysis (2023).",refs:["R17"],conf:"High — cost report data"},
      {label:"HACRP exposure model",value:"40% baseline exposure × max penalty × HAI reduction fraction",basis:"~25% of hospitals penalized annually; 40% modeled at risk. Savings = base × rf (no additional haircut). Conservative but defensible.",refs:["R16","R17"],conf:"Moderate — continuous simplification of binary threshold"},
    ]},
    {cat:"Methodology Standards", items:[
      {label:"Reporting standard",value:"CHEERS 2022 (ISPOR)",basis:"28-item international standard. Hospital perspective; 1-year time horizon; no discounting; one-way sensitivity analysis via user toggles.",refs:["R21"],conf:"High — international standard"},
      {label:"Cost perspective",value:"Default: total attributable costs. Toggle to variable (65% of total) for conservative bound.",basis:"Total costs represent the actual financial burden avoided. Variable (Graves 2007) represents avoidable costs when fixed overhead persists — appropriate for academic peer review.",refs:["R25","R27","R28"],conf:"High — well-established methodology"},
      {label:"Inflation adjustment",value:"CPI Medical Care Services 2015→2024 (+29%)",basis:"Recommended by Dunn 2018 for adjusting hospital cost studies.",refs:["R23","R26","R27"],conf:"High — peer-reviewed methodology"},
    ]},
  ];

  return (
    <div>
      {sections.map(s => (
        <div key={s.cat} style={{marginBottom:28}}>
          <div style={{fontSize:12,fontWeight:700,color:C.teal,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:14,paddingBottom:10,borderBottom:`2px solid ${C.tealPale}`}}>{s.cat}</div>
          {s.items.map(item => (
            <div key={item.label} style={{marginBottom:12,padding:"16px 18px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:8,boxShadow:C.sh1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{fontSize:13,color:C.txt,fontWeight:700,flex:1}}>{item.label}</div>
                <div style={{fontSize:12,color:C.teal,fontFamily:FONT_MONO,fontWeight:600,marginLeft:16,textAlign:"right"}}>{item.value}</div>
              </div>
              <div style={{fontSize:12,color:C.txt2,marginBottom:10,lineHeight:1.65}}>{item.basis}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                {item.refs.map(r => (
                  <button key={r} onClick={()=>setOpenRef(openRef===r?null:r)}
                    style={{padding:"3px 9px",fontSize:11,borderRadius:4,cursor:"pointer",border:`1px solid ${openRef===r?C.teal:C.border}`,background:openRef===r?C.tealXp:C.bg,color:openRef===r?C.teal:C.txt3,fontFamily:FONT_MONO,fontWeight:600}}>
                    {REFS[r]?.tag||r}
                  </button>
                ))}
                <span style={{fontSize:11,color:C.txt3,marginLeft:"auto"}}>Confidence: {item.conf}</span>
              </div>
              {item.refs.includes(openRef) && REFS[openRef] && (
                <div style={{marginTop:12,padding:"13px 16px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:6}}>
                  <div style={{fontSize:12,color:C.teal,fontWeight:700,marginBottom:3}}>[{REFS[openRef].id}] {REFS[openRef].tag} · {REFS[openRef].org} ({REFS[openRef].year})</div>
                  <div style={{fontSize:12,color:C.txt2,marginBottom:5}}>{REFS[openRef].title}</div>
                  <div style={{fontSize:11,color:C.txt2,marginBottom:8,lineHeight:1.6}}>{REFS[openRef].note}</div>
                  <a href={REFS[openRef].url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.teal2,wordBreak:"break-all"}}>{REFS[openRef].url}</a>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      <div style={{marginTop:8,padding:"16px 18px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:12,color:"#92400e",lineHeight:1.7}}>
        <strong>Key limitations:</strong> HACRP modeled continuously (real threshold is binary). CDI volume depends heavily on lab test method. CRE at small hospitals is sporadic. Detection rates are modeled from outbreak literature, not prospective RCTs. HAI cost data inflation-adjusted from 2015 base; actual current costs may be higher (Anderson 2023, R5).
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// METHODS & REFERENCES TAB
// ─────────────────────────────────────────────────────────────────────────────
function MethodsTab({useVariableCost}) {
  const activeCosts = useVariableCost ? HAI_COSTS_VARIABLE : HAI_COSTS_TOTAL;
  const row = (cells) => cells;
  const tbl = (rows, hdrs) => (
    <div style={{overflowX:"auto",marginBottom:20}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{borderBottom:`2px solid ${C.border}`}}>{hdrs.map(h=><th key={h} style={{padding:"9px 13px",color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",fontSize:11,textAlign:"left",fontWeight:600}}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>{r.map((c,j)=><td key={j} style={{padding:"9px 13px",color:j===0?C.txt:C.txt2,fontFamily:j>0?FONT_MONO:FONT_BODY,fontSize:12,lineHeight:1.5}}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
  const sec = (n,title,content) => (
    <div style={{marginBottom:28}}>
      <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:12}}>
        <span style={{fontSize:12,color:C.teal,fontFamily:FONT_MONO,fontWeight:700}}>{n}</span>
        <div style={{fontSize:16,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY}}>{title}</div>
      </div>
      <div style={{paddingLeft:28}}>{content}</div>
    </div>
  );
  const p = (text) => <p style={{fontSize:13,color:C.txt2,lineHeight:1.8,marginBottom:12}}>{text}</p>;

  return (
    <div style={{maxWidth:860}}>
      <div style={{padding:"22px 26px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:12,marginBottom:28}}>
        <Tag text="Model Documentation" color={C.teal}/>
        <div style={{fontSize:20,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY,margin:"10px 0 12px"}}>Methods, Assumptions & References</div>
        <p style={{fontSize:13,color:C.txt2,lineHeight:1.8,margin:0}}>
          Static decision-analytic cost-benefit model from the <strong>hospital (institutional) perspective</strong>, following <strong>CHEERS 2022</strong> <Tag text="R21" color={C.teal}/> and ISPOR-SMDM best practices <Tag text="R22" color={C.teal}/>. All costs in <strong>2024 USD</strong>. Time horizon: <strong>1 year</strong>. Default uses total attributable costs (toggle to variable for conservative bound).
        </p>
      </div>

      {sec("1","Model Type & Structure",
        <>
          {p("Static decision-analytic cost-benefit analysis (CBA). Four surveillance strategies evaluated against an implicit comparator of no systematic WGS. Not a Markov model, discrete event simulation, or dynamic transmission model.")}
          {tbl([
            row(["Model type","Static decision-analytic CBA"]),
            row(["Perspective","Hospital (institutional) — direct inpatient costs only"]),
            row(["Time horizon","1 year (no discounting required)"]),
            row(["Currency","2024 USD"]),
            row(["Inflation adjustment","CPI Medical Care Services index, 2015→2024 (+29%)"]),
            row(["Cost concept",useVariableCost?"Variable (avoidable) costs — active":"Total attributable costs — active (default)"]),
            row(["Sensitivity analysis","One-way deterministic via user-controlled sliders and toggles"]),
            row(["Comparators","4 WGS surveillance intensity levels vs. implicit no-WGS baseline"]),
          ],["Parameter","Value / Approach"])}
        </>
      )}

      {sec("2","HAI Cost Estimation",
        <>
          {p("Base estimates: AHRQ 2017 meta-analysis (R1). Base values in 2015 USD, inflated to 2024 using CPI Medical Care Services index (+29%, Dunn 2018 R23).")}
          {p("Default cost perspective is total attributable costs — representing the actual financial burden avoided when an HAI is prevented. Variable costs (65% of total, Graves 2007 R25) are available as a conservative toggle for academic/peer-review contexts.")}
          {tbl([
            row(["CLABSI",`$48,108 × 1.29 = $${Math.round(48108*CPI_2015_TO_2024).toLocaleString()}`,`$${Math.round(48108*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()}`,`Active: $${activeCosts.clabsi.toLocaleString()}`,"R1, R27"]),
            row(["CAUTI", `$13,793 × 1.29 = $${Math.round(13793*CPI_2015_TO_2024).toLocaleString()}`,`$${Math.round(13793*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()}`,`Active: $${activeCosts.cauti.toLocaleString()}`,"R1, R27"]),
            row(["CDI",   `$17,000 × 1.29 = $${Math.round(17000*CPI_2015_TO_2024).toLocaleString()}`,`$${Math.round(17000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()}`,`Active: $${activeCosts.cdi.toLocaleString()}`,"R3, R4"]),
            row(["MRSA",  `$42,000 × 1.29 = $${Math.round(42000*CPI_2015_TO_2024).toLocaleString()}`,`$${Math.round(42000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()}`,`Active: $${activeCosts.mrsa.toLocaleString()}`,"R2"]),
            row(["VAE",   `$32,000 × 1.29 = $${Math.round(32000*CPI_2015_TO_2024).toLocaleString()}`,`$${Math.round(32000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()}`,`Active: $${activeCosts.vae.toLocaleString()}`,"R1"]),
            row(["SSI",   `$21,000 × 1.29 = $${Math.round(21000*CPI_2015_TO_2024).toLocaleString()}`,`$${Math.round(21000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()}`,`Active: $${activeCosts.ssi.toLocaleString()}`,"R2, R7"]),
          ],["HAI Type","Calculation (base × CPI)","Total 2024$","Variable 2024$ (65%)","Active","Sources"])}
        </>
      )}

      {sec("3","WGS Prevention Efficacy",
        <>
          {p("Core formula: HAIs_prevented = annual_HAIs × TRANS_FRAC[t] × pFrac × detectionRate × (1 − lagFrac)")}
          {p("TRANS_FRAC[t]: fraction of reported HAIs attributable to WGS-detectable cross-transmission. pFrac (cluster interruption rate): fraction of identified clusters successfully disrupted by IP intervention — default 75%, range 0–100% (literature: contact precautions ~47–80%, R19). DetectionRate: probability WGS identifies the cluster given the surveillance model. LagFrac: fraction of cluster already infected before intervention, scaled by TAT for Models 1 & 2.")}
          {tbl([
            row(["Model 1 (Full)","90%","1.5 × TAT_scale / 5","Continuous real-time; environmental layer adds ~25% sequences","R13, R19, R20"]),
            row(["Model 2 (Prospective)","73%","2.5 × TAT_scale / 5","No environmental; real-time clinical only","R13"]),
            row(["Model 3 (Semi-prosp.)","40%","5.0 / 5 = 85% cap","Suspicion lag; no prior phylogenetic context","R19"]),
            row(["Model 4 (Retro.)","20%","8.0 / 5 → capped","Forensic; value is future prevention via reservoir ID","R19"]),
          ],["Model","Detection Rate","Lag Fraction","Rationale","Sources"])}
        </>
      )}

      {sec("4","Scope Limitations",
        <>
          {p("Does not model the value of WGS ruling out transmission — which can prevent unnecessary OR closures, unit cohorting, and enhanced PPE campaigns. This represents additional ROI not captured here.")}
          {p("Excluded: societal costs, readmissions, malpractice, staffing changes from outbreak response, and HAI types outside NHSN tracking (NTM, Candida auris).")}
        </>
      )}

      {sec("5","Uncertainty",
        <>
          {tbl([
            row(["HAI cost estimates","Wide CIs: CLABSI $27K–$69K in AHRQ meta-analysis","High","Toggle total vs. variable costs"]),
            row(["Transmissible fraction","Single-institution WGS studies; may not generalize","High","See TRANS_FRAC values in Assumptions tab"]),
            row(["Cluster interruption rate","No prospective RCTs; contact precaution literature 47–80%","High","pFrac slider 0–100%"]),
            row(["WGS detection rates","No prospective RCTs comparing models directly","High","See Assumptions tab ranges"]),
            row(["Intervention lag / TAT","Fixed cluster size 5 is approximation; TAT varies by lab","Moderate","TAT picker + cluster size 3–8 in literature"]),
            row(["HACRP exposure","Binary threshold simplified to continuous","Moderate","Use as directional, not precise"]),
          ],["Uncertainty Source","Nature","Impact","Mitigation"])}
        </>
      )}

      {sec("6","Complete References (28 sources)",
        <div>
          {Object.values(REFS).map(ref => (
            <div key={ref.id} style={{marginBottom:10,padding:"13px 16px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:8,boxShadow:C.sh1}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:11,color:C.teal,fontFamily:FONT_MONO,fontWeight:700,flexShrink:0,minWidth:32}}>[{ref.id}]</span>
                <div>
                  <div style={{fontSize:12,color:C.txt,marginBottom:3,fontWeight:700}}>{ref.tag} · <span style={{color:C.txt2,fontWeight:400}}>{ref.org} ({ref.year})</span></div>
                  <div style={{fontSize:12,color:C.txt2,marginBottom:5}}>{ref.title}</div>
                  <div style={{fontSize:11,color:C.txt3,marginBottom:6,lineHeight:1.5}}>{ref.note}</div>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.teal2,wordBreak:"break-all",textDecoration:"none"}}>{ref.url}</a>
                </div>
              </div>
            </div>
          ))}
          <div style={{marginTop:16,padding:"16px 18px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:12,color:"#78350f",lineHeight:1.7}}>
            <strong>Disclosure:</strong> This model was developed by Prospect Genomics to support hospital purchasing decisions. Parameters are derived from peer-reviewed literature. The model has not been independently peer-reviewed. Results are directional estimates — not precise financial projections.
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [hIdx,        setHIdx]        = useState(1);
  const [pFrac,       setPFrac]       = useState(0.75);
  const [subFee,      setSubFee]      = useState(100000);
  const [adHocPrice,  setAdHocPrice]  = useState(175);
  const [tatIdx,      setTatIdx]      = useState(TAT_DEFAULT_IDX);
  const [incSSI,      setIncSSI]      = useState(false);
  const [useVar,      setUseVar]      = useState(false);
  const [tab,         setTab]         = useState("overview");
  const [pricingMode, setPricingMode] = useState("sub");

  const hosp = HOSPITAL_SIZES[hIdx];
  const {data:allData, totalHAIs} = useMemo(
    ()=>runAll(hosp,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx),
    [hosp,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx]
  );
  const medRev    = hosp.totalRevenueMn*1e6*hosp.medicareRevenuePct;
  const costTable = useVar ? HAI_COSTS_VARIABLE : HAI_COSTS_TOTAL;

  const TABS = [
    ["overview",    "Model Overview"],
    ["breakdown",   "HAI Breakdown"],
    ["pricing",     "Subscription vs. Ad Hoc"],
    ["custom",      "Your Hospital"],
    ["assumptions", "Assumptions"],
    ["methods",     "Methods & References"],
  ];

  // Shared card style
  const card = {background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"24px",boxShadow:C.sh1};
  const sectionLabel = {fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700,marginBottom:16};

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT_BODY,color:C.txt}}>
      {/* Header */}
      <div style={{background:C.s0,borderBottom:`1px solid ${C.border}`,padding:"16px 24px",position:"sticky",top:0,zIndex:100,boxShadow:C.sh1}}>
        <div style={{maxWidth:1160,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}>
              <div style={{width:28,height:28,background:C.teal,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:C.s0,fontSize:15,fontWeight:800,fontFamily:FONT_BODY}}>P</span>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:C.teal,letterSpacing:"-0.01em"}}>Prospect Genomics</span>
            </div>
            <div style={{fontSize:20,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY,letterSpacing:"-0.01em"}}>HAI Prevention Value Calculator</div>
          </div>
          <div style={{fontSize:12,color:C.txt3,textAlign:"right"}}>prospectgenomics.bio</div>
        </div>
      </div>

      <div style={{maxWidth:1160,margin:"0 auto",padding:"28px 24px 60px"}}>
        <ModelOverview/>

        {/* Controls */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>

          {/* Hospital selector */}
          <div style={card}>
            <div style={sectionLabel}>Benchmark Hospital Profile</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
              {HOSPITAL_SIZES.map((h,i) => (
                <button key={h.id} onClick={()=>setHIdx(i)} style={{padding:"11px 14px",borderRadius:8,cursor:"pointer",border:`1px solid ${i===hIdx?C.teal:C.border}`,background:i===hIdx?C.tealXp:C.bg,color:i===hIdx?C.teal:C.txt2,fontFamily:FONT_BODY,fontSize:13,fontWeight:i===hIdx?700:500,textAlign:"left",transition:"all 0.15s"}}>
                  <div style={{fontSize:14,marginBottom:2,fontFamily:FONT_DISPLAY}}>{h.label}</div>
                  <div style={{fontSize:11,opacity:0.7}}>{h.beds}</div>
                </button>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                ["Total Revenue",      `$${hosp.totalRevenueMn}M`],
                ["Medicare Revenue",   fm(medRev)],
                ["Max HACRP Penalty",  fm(medRev*0.01)],
                ["Admissions/yr",      hosp.admissionsPerYear.toLocaleString()],
                ["Patient-days/yr",    hosp.patientDaysPerYear.toLocaleString()],
                ["HAIs/yr",            totalHAIs+(incSSI?"":" (ex-SSI)")],
              ].map(([k,v]) => (
                <div key={k}>
                  <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3,fontWeight:500}}>{k}</div>
                  <div style={{fontSize:15,fontWeight:700,color:C.teal,fontFamily:FONT_MONO}}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Model assumptions */}
          <div style={card}>
            <div style={sectionLabel}>Global Model Assumptions</div>
            <Slider label="Cluster Interruption Rate" value={pFrac} min={0} max={1.0} step={0.05} onChange={setPFrac} format={pct}/>
            <div style={{fontSize:11,color:C.txt3,marginTop:-10,marginBottom:16,lineHeight:1.5}}>% of WGS-identified clusters IP successfully disrupts. Literature range: 47–85% (R19).</div>
            <Slider label="Annual Subscription Fee" value={subFee} min={25000} max={300000} step={5000} onChange={setSubFee} format={v=>`$${(v/1000).toFixed(0)}K`}/>
            <TATpicker tatIdx={tatIdx} setTatIdx={setTatIdx}/>
            {/* SSI toggle */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <button onClick={()=>setIncSSI(!incSSI)} style={{width:42,height:24,borderRadius:12,cursor:"pointer",background:incSSI?C.teal:C.border,border:"none",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:C.s0,position:"absolute",top:3,left:incSSI?21:3,transition:"left 0.2s"}}/>
              </button>
              <div>
                <div style={{fontSize:13,color:incSSI?C.teal:C.txt3,fontWeight:600}}>{incSSI?"SSI Included":"SSI Excluded"}</div>
                <div style={{fontSize:11,color:C.txt3}}>Include wound culture isolates in sequencing volume</div>
              </div>
            </div>
            {/* Cost perspective */}
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
              <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,marginBottom:10}}>Cost Perspective <Tag text="R21 · R25" color={C.teal3}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["total","Total costs","Full attributable — default"],["variable","Variable costs","Avoidable only · conservative"]].map(([val,label,note]) => {
                  const active = (!useVar&&val==="total")||(useVar&&val==="variable");
                  return (
                    <button key={val} onClick={()=>setUseVar(val==="variable")} style={{padding:"9px 12px",borderRadius:7,cursor:"pointer",border:`1px solid ${active?C.teal:C.border}`,background:active?C.tealXp:C.bg,color:active?C.teal:C.txt2,fontFamily:FONT_BODY,fontSize:12,fontWeight:600,textAlign:"left",transition:"all 0.15s"}}>
                      <div style={{marginBottom:2}}>{label}</div>
                      <div style={{fontSize:10,opacity:0.7,fontWeight:400}}>{note}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:24,flexWrap:"wrap",background:C.s0,padding:"6px",borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.sh1,width:"fit-content"}}>
          {TABS.map(([id,label]) => (
            <button key={id} onClick={()=>setTab(id)} style={{padding:"9px 18px",borderRadius:7,cursor:"pointer",background:tab===id?C.teal:"transparent",border:"none",color:tab===id?C.s0:C.txt3,fontFamily:FONT_BODY,fontSize:13,fontWeight:tab===id?600:500,letterSpacing:"0.01em",transition:"all 0.15s"}}>
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div>
            {/* Pricing mode toggle */}
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:20}}>
              <span style={{fontSize:12,color:C.txt3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Pricing mode</span>
              {[["sub",`Subscription · ${fm(subFee)}/yr flat`],["adhoc",`Ad hoc · $${adHocPrice}/sample`]].map(([mode,label]) => (
                <button key={mode} onClick={()=>setPricingMode(mode)} style={{padding:"7px 18px",borderRadius:7,cursor:"pointer",border:`1px solid ${pricingMode===mode?C.teal:C.border}`,background:pricingMode===mode?C.tealXp:C.s0,color:pricingMode===mode?C.teal:C.txt3,fontFamily:FONT_BODY,fontSize:13,fontWeight:pricingMode===mode?700:500,transition:"all 0.15s"}}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              {MODELS.map(m => <ModelCard key={m.id} model={m} data={allData[m.id]} pricingMode={pricingMode}/>)}
            </div>
          </div>
        )}

        {/* ── BREAKDOWN ── */}
        {tab==="breakdown" && (
          <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:C.sh1,overflow:"hidden"}}>
            <div style={{padding:"18px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:14,fontWeight:700,color:C.txt}}>HAIs prevented per year · {hosp.label} ({hosp.beds}){incSSI?" · SSI included":""}</div>
              <div style={{fontSize:12,color:C.txt3}}>Cost type: {useVar?"Variable (65%)":"Total attributable"}</div>
            </div>
            <BreakdownTable models={MODELS} allData={allData} incSSI={incSSI} costTable={costTable}/>
            <div style={{margin:"0 24px 24px",padding:"18px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10}}>
              <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:16}}>HACRP Penalty Exposure · Max {fm(medRev*0.01)}/yr · Sources: R16, R17</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20}}>
                {MODELS.map(m => {
                  const d = allData[m.id].hacrp;
                  return (
                    <div key={m.id}>
                      <div style={{fontSize:12,color:m.color,marginBottom:10,fontWeight:700}}>{m.label}</div>
                      {[["Baseline exposure",fm(d.baselineExposure),C.txt2],["After program",fm(d.reducedExposure),m.color],["HACRP savings","+"+fm(d.saved),C.green]].map(([k,v,c]) => (
                        <div key={k} style={{marginBottom:8}}>
                          <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>{k}</div>
                          <div style={{fontSize:15,fontFamily:FONT_MONO,color:c,fontWeight:700}}>{v}</div>
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
            {/* Price controls */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
              <div style={card}>
                <div style={sectionLabel}>Subscription Pricing</div>
                <Slider label="Annual subscription fee" value={subFee} min={25000} max={300000} step={5000} onChange={setSubFee} format={v=>`$${(v/1000).toFixed(0)}K/yr`}/>
                <div style={{fontSize:12,color:C.txt3,lineHeight:1.6}}>Flat annual fee covering all sequencing, analysis, software, and support — regardless of sample volume.</div>
              </div>
              <div style={card}>
                <div style={sectionLabel}>Ad Hoc Pricing</div>
                <Slider label="Ad hoc price per sample" value={adHocPrice} min={150} max={250} step={5} onChange={setAdHocPrice} format={v=>`$${v}/sample`}/>
                <div style={{fontSize:12,color:C.txt3,lineHeight:1.6}}>Per-sample cost for ad hoc sequencing. Typical market range $150–$250. No analysis software or ongoing support included.</div>
              </div>
            </div>

            {/* Comparison table */}
            <div style={{...card,marginBottom:20}}>
              <div style={sectionLabel}>Cost Comparison by Surveillance Model — {hosp.label} Hospital</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{borderBottom:`2px solid ${C.border}`}}>
                      {["Model","Seqs/yr","Sub cost","Ad hoc cost","Sub net value","Ad hoc net value","Better option"].map((h,i) => (
                        <th key={h} style={{padding:"11px 14px",textAlign:i===0?"left":"right",color:C.txt3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",fontSize:11}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODELS.map((m,i) => {
                      const d       = allData[m.id];
                      const subBetter = d.netValueSub >= d.netValueAdHoc;
                      return (
                        <tr key={m.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>
                          <td style={{padding:"11px 14px",fontWeight:700,color:m.color}}>{m.label} · {m.name}</td>
                          <td style={{padding:"11px 14px",fontFamily:FONT_MONO,textAlign:"right",color:C.txt2}}>{fn(d.seqs)}</td>
                          <td style={{padding:"11px 14px",fontFamily:FONT_MONO,textAlign:"right",color:C.txt2}}>{fm(d.programCostSub)}</td>
                          <td style={{padding:"11px 14px",fontFamily:FONT_MONO,textAlign:"right",color:C.txt2}}>{fm(d.programCostAdHoc)}</td>
                          <td style={{padding:"11px 14px",fontFamily:FONT_MONO,textAlign:"right",color:d.netValueSub>0?C.teal:C.red,fontWeight:700}}>{d.netValueSub>0?"+":""}{fm(d.netValueSub)}</td>
                          <td style={{padding:"11px 14px",fontFamily:FONT_MONO,textAlign:"right",color:d.netValueAdHoc>0?C.teal:C.red,fontWeight:700}}>{d.netValueAdHoc>0?"+":""}{fm(d.netValueAdHoc)}</td>
                          <td style={{padding:"11px 14px",textAlign:"right"}}>
                            <span style={{fontSize:12,fontWeight:700,color:subBetter?C.teal:C.amber,background:subBetter?C.tealXp:"#fef3c7",border:`1px solid ${subBetter?C.tealPale:"#fde68a"}`,borderRadius:5,padding:"3px 10px"}}>
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

            {/* Crossover analysis */}
            <div style={card}>
              <div style={sectionLabel}>Crossover Analysis — When Does Subscription Beat Ad Hoc?</div>
              <div style={{fontSize:13,color:C.txt2,marginBottom:20,lineHeight:1.6}}>
                Subscription beats ad hoc when <strong style={{color:C.teal}}>seqs/yr &gt; {Math.round(subFee/adHocPrice).toLocaleString()}</strong> (= ${(subFee/1000).toFixed(0)}K ÷ ${adHocPrice}/sample).
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                {MODELS.map(m => {
                  const d          = allData[m.id];
                  const crossover  = Math.round(subFee/adHocPrice);
                  const subWins    = d.seqs >= crossover;
                  const delta      = d.netValueSub - d.netValueAdHoc;
                  return (
                    <div key={m.id} style={{background:subWins?C.tealXp:C.bg,border:`1px solid ${subWins?C.tealPale:C.border}`,borderRadius:10,padding:"16px"}}>
                      <div style={{fontSize:12,color:m.color,fontWeight:700,marginBottom:10}}>{m.label} · {m.name}</div>
                      {[
                        ["Seqs/yr",          fn(d.seqs)],
                        ["Crossover at",     `${crossover.toLocaleString()} seqs`],
                        ["Sub vs. ad hoc",   (delta>=0?"+":"")+fm(delta)],
                        ["Best option",      subWins?"Subscription":"Ad hoc"],
                      ].map(([k,v]) => (
                        <div key={k} style={{marginBottom:8}}>
                          <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>{k}</div>
                          <div style={{fontSize:14,fontWeight:700,color:k==="Best option"?(subWins?C.teal:C.amber):C.txt,fontFamily:FONT_MONO}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:16,padding:"14px 16px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,fontSize:12,color:C.teal2,lineHeight:1.7}}>
                <strong>Note:</strong> Subscription includes analysis software, continuous monitoring, and IP support — not available with ad hoc sequencing. The value of these services is not captured in the cost comparison above.
              </div>
            </div>
          </div>
        )}

        {tab==="custom"      && <CustomTab pFrac={pFrac} subFee={subFee} adHocPrice={adHocPrice} pricingMode={pricingMode} incSSI={incSSI} setIncSSI={setIncSSI} useVariableCost={useVar} tatIdx={tatIdx}/>}
        {tab==="assumptions" && <AssumptionsTab/>}
        {tab==="methods"     && <MethodsTab useVariableCost={useVar}/>}
      </div>
    </div>
  );
}

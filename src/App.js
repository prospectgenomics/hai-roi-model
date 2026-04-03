import { useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PROSPECT GENOMICS — HAI Prevention Value Calculator
// Brand system sourced from prospectgenomics.bio computed styles
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
  sh1:       "0 1px 3px rgba(15,17,23,.07),0 1px 2px rgba(15,17,23,.04)",
  sh2:       "0 4px 20px rgba(15,17,23,.08),0 1px 4px rgba(15,17,23,.05)",
  sh3:       "0 16px 56px rgba(15,17,23,.12),0 2px 8px rgba(15,17,23,.06)",
};
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";
const FONT_DISPLAY = "'Instrument Serif', Georgia, serif";
const FONT_MONO    = "'DM Mono', 'SF Mono', monospace";

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCES  (28 sources — peer-reviewed / professional orgs preferred)
// ─────────────────────────────────────────────────────────────────────────────
const REFS = {
  R1:  { id:"R1",  tag:"AHRQ 2017",          url:"https://www.ahrq.gov/hai/pfp/haccost2017-results.html",                              title:"Estimating the Additional Hospital Inpatient Cost and Mortality Associated with Selected Hospital-Acquired Conditions", org:"AHRQ", year:2017, note:"Meta-analysis: CLABSI $48,108 (7 studies); CAUTI $13,793; avg infectious HAC $31,000. Hospital perspective, 2015 USD, cost-to-charge ratios applied." },
  R2:  { id:"R2",  tag:"Zimlichman 2013",     url:"https://pubmed.ncbi.nlm.nih.gov/23999228/",                                         title:"Health Care–Associated Infections: A Meta-analysis of Costs and Financial Impact on the US Health Care System", org:"JAMA Internal Medicine", year:2013, note:"CLABSI $45,814/case; SSI $20,785/case; total annual HAI cost $9.8B (95% CI $8.3–$11.5B). SSI accounts for 33.7% of total costs." },
  R3:  { id:"R3",  tag:"Forrester 2022",      url:"https://pubmed.ncbi.nlm.nih.gov/33881808/",                                         title:"Cost of Health Care-Associated Infections in the United States", org:"J Patient Saf / Stanford", year:2022, note:"2016 HCUP-NIS: $7.2–14.9B total annual HAI cost. CDI (56%) and SSI (31%) dominate by frequency." },
  R4:  { id:"R4",  tag:"Zhang 2024",          url:"https://doi.org/10.1017/ice.2023.160",                                              title:"A 7-year analysis of attributable costs of HAIs in a network of community hospitals", org:"ICHE / SHEA", year:2024, note:"45 community hospitals 2016–2022: ~$1M/hospital/yr attributable HAI cost. CDI rate 0.34/1,000 pt-days." },
  R5:  { id:"R5",  tag:"Anderson 2023",       url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10679173/",                                title:"Impact of HAIs on Costs and LOS 2019–2023", org:"OFID / IDSA", year:2023, note:"Excess labor cost: CLABSI $43,975 (+13.4 days); CAUTI $31,253 (+8.9 days). COVID-era costs 178% higher 2019–2022." },
  R6:  { id:"R6",  tag:"CDC NHSN 2024",       url:"https://www.cdc.gov/healthcare-associated-infections/php/data/progress-report.html", title:"2024 National and State HAI Progress Report", org:"CDC/NHSN", year:2024, note:"1-in-31 hospital patients has an HAI on any given day. SSI colon rate ~2.6/100 procedures. Most current national SIR data." },
  R7:  { id:"R7",  tag:"Anderson 2012 DICON", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC3977691/",                                title:"Assessing the Relative Burden of HAIs in a Network of Community Hospitals", org:"ICHE", year:2012, note:"15 community hospitals (median 186 beds): SSI 38%, CAUTI 26%, CDI 22%, CLABSI 12%, VAP 2%. CLABSI 1.1/1,000 CL-days." },
  R8:  { id:"R8",  tag:"Ohishi 2021",         url:"https://www.spandidos-publications.com/10.3892/wasj.2021.131",                      title:"Blood culture at 63 Japanese healthcare facilities", org:"World Academy of Sciences Journal", year:2021, note:"≥200-bed hospitals: 21.5 blood cx sets/1,000 pt-days; positivity 15.4%; contamination 3.1%." },
  R9:  { id:"R9",  tag:"Thaden 2018 EID",     url:"https://wwwnc.cdc.gov/eid/article/24/3/17-0961_article",                           title:"Artificial Differences in C. difficile Infection Rates Associated with Disparity in Testing", org:"Emerging Infectious Diseases (CDC)", year:2018, note:"Community hospitals: HO-CDI 0.57/1,000 pt-days. NAAT adoption → 50–100% increase in reported rates. US prospective multicenter." },
  R10: { id:"R10", tag:"Kadri 2024 OFID",     url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11505019/",                                title:"Organism-specific Trends in CRE Infections, 2012–2022", org:"OFID / IDSA", year:2024, note:"~12,700 CRE infections nationally in 2020. CRKP rate 2.44/10,000 hospitalizations in 2022. PINC AI + BD Insights databases." },
  R11: { id:"R11", tag:"Snitkin 2014",        url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4217156/",                                title:"Rising Rates of CRE in Community Hospitals, Southeastern US", org:"ICHE", year:2014, note:"CRE detected in 64% of 25 community hospitals; rate increased >5-fold 2008–2012. Sporadic at smaller hospitals; cluster-prone." },
  R12: { id:"R12", tag:"Thom 2024 EIP",       url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC12125674/",                                title:"Trends in Incidence of MRSA Bacteremia, Six EIP Sites, 2005–2022", org:"OFID / IDSA", year:2024, note:"Population-based active surveillance. HO-MRSA stable 2014–2019, increased during COVID. Benchmark for HO-MRSA incidence rates." },
  R13: { id:"R13", tag:"Bhargava 2021 CID",   url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8315036/",                                title:"MRSA Transmission in ICUs: WGS of Patients, Environments, and HCWs", org:"Clinical Infectious Diseases / IDSA", year:2021, note:"WGS of 413 MRSA isolates in 4 ICUs. Identified inter-ICU clusters invisible to conventional surveillance. Supports WGS value." },
  R14: { id:"R14", tag:"Martin 2024 ICHE",    url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11149034/",                                title:"Impact of DcCP on WGS-defined MRSA HAIs", org:"ICHE / SHEA", year:2024, note:"MRSA HAI rate 4.22/10,000 pt-days pre-intervention. WGS-defined transmission events (7 pre, 11 post) quantified separately from endogenous HAI." },
  R15: { id:"R15", tag:"Haaber 2022 CID",     url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC9612791/",                                title:"Genomic Epidemiology Suggests Community Origins of HA-USA300 MRSA", org:"CID / IDSA", year:2022, note:"WGS on 1,020 MRSA isolates. ~18.9% of S. aureus acquisitions had WGS-supported patient-to-patient transmission evidence." },
  R16: { id:"R16", tag:"CMS HACRP",           url:"https://www.cms.gov/medicare/quality/value-based-programs/hospital-acquired-conditions", title:"Hospital-Acquired Condition Reduction Program", org:"CMS", year:2024, note:"1% Medicare FFS reduction for worst-performing quartile on CLABSI, CAUTI, SSI, MRSA, CDI composite HAC score." },
  R17: { id:"R17", tag:"Definitive HC 2023",  url:"https://www.definitivehc.com/blog/revenue-trends-at-u.s.-hospitals",                title:"Hospital Revenue and Expense Trends in U.S.", org:"Definitive Healthcare / Medicare Cost Report", year:2023, note:"≤25 beds avg $38M revenue; >250 beds $956M (2023). Medicare ~19–28% of revenue by hospital size." },
  R18: { id:"R18", tag:"Kavanagh 2016 ARIC",  url:"https://aricjournal.biomedcentral.com/articles/10.1186/s13756-017-0193-0",           title:"The incidence of MRSA infections in the US", org:"Antimicrobial Resistance & Infection Control (BMC)", year:2016, note:"Review of NHSN MRSA epidemiology. MRSA SIR ~0.988 vs 2010–11 baseline by end of 2015." },
  R19: { id:"R19", tag:"Toth 2022 CIDR",      url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC9394219/",                                title:"Modeling transmission of pathogens in healthcare settings", org:"Current Infectious Disease Reports", year:2022, note:"Contact precautions reduce MRSA transmission ~47%. WGS genomic surveillance likely cost-effective based on MRSA acquisition modeling." },
  R20: { id:"R20", tag:"Shenoy 2024 CIDR",    url:"https://link.springer.com/article/10.1007/s11908-024-00836-w",                     title:"Whole Genome Sequencing Applications in Hospital Epidemiology and Infection Prevention", org:"Current Infectious Disease Reports", year:2024, note:"WGS identified 5 additional transmissions and corrected 3 false positives vs. spa-typing alone. ~18.9% of acquisitions patient-to-patient." },
  R21: { id:"R21", tag:"CHEERS 2022 (ISPOR)", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10297740/",                                title:"Consolidated Health Economic Evaluation Reporting Standards 2022 (CHEERS 2022) Statement", org:"Value in Health / ISPOR", year:2022, note:"28-item international standard for health economic evaluations. Requires: explicit perspective, discount rate, uncertainty characterization, comparator description, and transparent assumptions." },
  R22: { id:"R22", tag:"ISPOR-SMDM 2012",     url:"https://www.valueinhealthjournal.com/article/S1098-3015(12)01652-X/fulltext",        title:"Modeling Good Research Practices—Overview: ISPOR-SMDM Modeling Good Research Practices Task Force", org:"Value in Health / ISPOR", year:2012, note:"Best practices for decision-analytic models. Requires probabilistic sensitivity analysis, structural uncertainty reporting, transparent documentation of all assumptions." },
  R23: { id:"R23", tag:"Dunn 2018 (inflation)",url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC5785315/",                                title:"Adjusting Health Expenditures for Inflation: A Review of Measures for Health Services Research in the United States", org:"Health Services Research (Wiley)", year:2018, note:"Best practice: use CPI Medical Care Services index (not CPI-U) for adjusting hospital cost studies. PCE health index also acceptable." },
  R24: { id:"R24", tag:"HCUP SB313 2024",     url:"https://hcup-us.ahrq.gov/reports/statbriefs/sb313-prevalence-burden-HAIs-2016-2021.pdf", title:"Prevalence and Burden of Healthcare-Associated Infections, 2016–2021", org:"AHRQ / HCUP Statistical Brief #313", year:2024, note:"Most recent HCUP national HAI cost data (2020 base year). Stays with HAI had higher median cost and longer LOS vs. stays without HAI, 2016–2021." },
  R25: { id:"R25", tag:"Graves 2007",         url:"https://pubmed.ncbi.nlm.nih.gov/17376185/",                                         title:"Excess morbidity, mortality, and cost from hospital-acquired infection in an Australian hospital", org:"Infection Control & Hospital Epidemiology", year:2007, note:"Variable (avoidable) costs ~60–70% of total attributable HAI cost. Fixed overhead persists even when infections are prevented. Variable cost is the correct denominator for prevention ROI." },
  R26: { id:"R26", tag:"KFF/Peterson 2024",   url:"https://www.healthsystemtracker.org/brief/how-does-medical-inflation-compare-to-inflation-in-the-rest-of-the-economy/", title:"How Does Medical Inflation Compare to Inflation in the Rest of the Economy?", org:"Peterson-KFF Health System Tracker", year:2024, note:"Hospital services CPI rose ~54% since 2009 (June 2024). Medical care CPI +3.3% June 2024 YoY. Source for 2015→2024 CPI Medical Care adjustment factor." },
  R27: { id:"R27", tag:"AHRQ HACCOST method", url:"https://www.ahrq.gov/hai/pfp/haccost2017.html",                                    title:"Methods: Estimating Additional Hospital Inpatient Cost and Mortality Associated with HACs", org:"AHRQ", year:2017, note:"AHRQ methodology: incremental hospital perspective costs in 2015 USD. Excludes readmission costs and societal/indirect costs. Charges converted via cost-to-charge ratios." },
  R28: { id:"R28", tag:"Ramsey 2015 ISPOR",   url:"https://pubmed.ncbi.nlm.nih.gov/25773551/",                                         title:"Cost-Effectiveness Analysis Alongside Clinical Trials II—ISPOR Good Research Practices Task Force", org:"Value in Health / ISPOR", year:2015, note:"Incremental analysis required; uncertainty must be characterized; hospital vs. payer/societal perspective must be clearly delineated. One-way sensitivity analyses with plausible ranges required." },
};

// ─────────────────────────────────────────────────────────────────────────────
// BENCHMARK DATA  (derived from NHSN + peer-reviewed literature)
// ─────────────────────────────────────────────────────────────────────────────
const HOSPITAL_SIZES = [
  { id:"small",    label:"Small",    beds:"<100 beds",    totalRevenueMn:60,  medicareRevenuePct:0.28, admissionsPerYear:4000,  patientDaysPerYear:22000,  cultureVolumes:{ mrsa:20,  cdi:13,  cre:3,  abx:2,  mssa:15  }, hais:{ clabsi:6,  cauti:28,  cdi:13, mrsa:6,  vae:8,  ssi:28  }, surgicalProcedures:900   },
  { id:"medium",   label:"Medium",   beds:"100–299 beds", totalRevenueMn:175, medicareRevenuePct:0.23, admissionsPerYear:14000, patientDaysPerYear:75000,  cultureVolumes:{ mrsa:68,  cdi:43,  cre:10, abx:8,  mssa:50  }, hais:{ clabsi:18, cauti:78,  cdi:43, mrsa:18, vae:22, ssi:98  }, surgicalProcedures:3500  },
  { id:"large",    label:"Large",    beds:"300–499 beds", totalRevenueMn:400, medicareRevenuePct:0.21, admissionsPerYear:32000, patientDaysPerYear:160000, cultureVolumes:{ mrsa:145, cdi:91,  cre:24, abx:20, mssa:110 }, hais:{ clabsi:35, cauti:150, cdi:91, mrsa:38, vae:44, ssi:220 }, surgicalProcedures:8500  },
  { id:"academic", label:"Academic", beds:"500+ beds",    totalRevenueMn:800, medicareRevenuePct:0.19, admissionsPerYear:60000, patientDaysPerYear:310000, cultureVolumes:{ mrsa:280, cdi:177, cre:55, abx:50, mssa:215 }, hais:{ clabsi:62, cauti:280, cdi:177,mrsa:75, vae:84, ssi:440 }, surgicalProcedures:18000 },
];

// HAI costs: AHRQ 2017 (2015 USD) × CPI Medical Care Services 2015→2024 (+29%)
// Per Dunn 2018 (R23) and KFF/Peterson 2024 (R26)
const CPI_2015_TO_2024  = 1.29;
const VARIABLE_FRAC     = 0.65; // Graves 2007 (R25): variable costs ~60–70% of total
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

// Average HAI cluster size from outbreak literature (R13, R19)
const AVG_CLUSTER_SIZE = 5;

const MODELS = [
  { id:"m1", label:"Model 1", name:"Full Surveillance",    color:C.teal,   detectionRate:0.90, interventionLagCases:1.5, envMultiplier:1.25, valueType:"immediate", desc:"All positive cultures sequenced in real time with environmental sampling triggered by confirmed infection. Continuous phylogenetic context." },
  { id:"m2", label:"Model 2", name:"Prospective Clinical", color:C.teal2,  detectionRate:0.73, interventionLagCases:2.5, envMultiplier:1.0,  valueType:"immediate", desc:"Every positive clinical culture sequenced as reported. Real-time phylogenetic context from clinical specimens only." },
  { id:"m3", label:"Model 3", name:"Semi-Prospective",     color:C.amber,  detectionRate:0.40, interventionLagCases:5.0, envMultiplier:1.0,  valueType:"delayed",   desc:"Sequencing triggered when IP suspects a cluster (2+ cases, same unit). No prior phylogenetic context available." },
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

function calcPrevented(hosp, model, pFrac, incSSI, tatDays) {
  const types = incSSI ? ["clabsi","cauti","cdi","mrsa","vae","ssi"] : ["clabsi","cauti","cdi","mrsa","vae"];
  // TAT scales lag for real-time models only (M1/M2). Reference TAT = 3 days.
  const tatScale = (model.id==="m1"||model.id==="m2") ? tatDays/3 : 1;
  const effectiveLag = model.interventionLagCases * tatScale;
  // Lag fraction relative to avg cluster size (R13, R19) — NOT annual incidence
  const lagFrac = Math.min(effectiveLag / AVG_CLUSTER_SIZE, 0.85);
  let total=0; const byType={};
  for (const t of types) {
    const annual = hosp.hais[t] || 0;
    const transmissible = annual * TRANS_FRAC[t] * (pFrac/0.35);
    let val;
    if (model.valueType==="future") {
      // Model 4: current outbreak not preventable — value is future prevention
      // P(reservoir found) × P(next outbreak if unaddressed) × avg cluster size / annual base
      val = transmissible * 0.35 * 0.55 * (AVG_CLUSTER_SIZE / Math.max(annual,1));
    } else {
      val = transmissible * model.detectionRate * (1 - lagFrac);
    }
    byType[t] = Math.round(val*10)/10;
    total += val;
  }
  return {total, byType};
}

function calcCosts(byType, costTable) {
  const tbl = costTable || HAI_COSTS_VARIABLE;
  let total=0; const breakdown={};
  for (const [t,n] of Object.entries(byType)) { breakdown[t]=n*tbl[t]; total+=breakdown[t]; }
  return {total, breakdown};
}

function calcHACRP(hosp, totalHAIs, prevented) {
  const mr = hosp.totalRevenueMn*1e6*hosp.medicareRevenuePct;
  const maxP = mr*0.01;
  const base = maxP*0.40;
  const rf = Math.min(prevented/Math.max(totalHAIs,1), 0.85);
  return { maxPenalty:maxP, baselineExposure:base, reducedExposure:base*(1-rf*0.6), saved:base*rf*0.6 };
}

function runAll(hosp, pFrac, seqCost, incSSI, useVar, tatDays) {
  const totalHAIs = Object.entries(hosp.hais).reduce((a,[k,v])=>k!=="ssi"||incSSI?a+v:a,0);
  const costTable = useVar ? HAI_COSTS_VARIABLE : HAI_COSTS_TOTAL;
  const out={};
  for (const model of MODELS) {
    const seqs       = calcSeqs(hosp,model,incSSI);
    const prevented  = calcPrevented(hosp,model,pFrac,incSSI,tatDays);
    const cost       = calcCosts(prevented.byType, costTable);
    const hacrp      = calcHACRP(hosp,totalHAIs,prevented.total);
    const prog       = seqs*seqCost;
    const net        = cost.total+hacrp.saved-prog;
    out[model.id]    = { seqs, haIsPrevented:prevented, costAvoided:cost, hacrp,
      programCost:prog, netValue:net,
      costPerHAI:   prevented.total>0.5 ? prog/prevented.total  : 0,
      seqsPerHAI:   prevented.total>0.5 ? seqs/prevented.total  : 0 };
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
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:12,color:C.txt3,letterSpacing:"0.03em",textTransform:"uppercase",fontWeight:500}}>{label}</span>
        <span style={{fontSize:14,fontWeight:600,color:C.teal,fontFamily:FONT_MONO}}>{format(value)}</span>
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
      <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3,fontWeight:500}}>{label}</div>
      {hint && <div style={{fontSize:9,color:C.txt3,marginBottom:4,lineHeight:1.4}}>{hint}</div>}
      <input type="number" min={min} value={value===0?"":value}
        onChange={e=>{const v=parseInt(e.target.value)||0; onChange(Math.max(min,v));}}
        onFocus={e=>e.target.select()}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 10px",color:C.txt,fontFamily:FONT_MONO,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color 0.15s"}}
        onMouseOver={e=>e.target.style.borderColor=C.teal3}
        onMouseOut={e=>e.target.style.borderColor=C.border}
      />
    </div>
  );
}

function Tag({text, color=C.teal}) {
  return <span style={{display:"inline-block",padding:"1px 7px",fontSize:9,fontFamily:FONT_MONO,background:`${color}18`,border:`1px solid ${color}33`,borderRadius:4,color,fontWeight:600,letterSpacing:"0.05em"}}>{text}</span>;
}

function ModelOverview() {
  const eqParts = [
    {label:"HAIs prevented",    sub:"Transmission clusters\ndetected earlier",     color:C.teal},
    {op:"×"},
    {label:"Cost per HAI",      sub:"Variable attributable\ncost (2024 USD)",      color:C.teal},
    {op:"+"},
    {label:"HACRP savings",     sub:"Medicare penalty\nreduction",                 color:C.teal},
    {op:"−"},
    {label:"Sequencing cost",   sub:"Genomes/yr ×\ncost per genome",               color:C.txt2},
    {op:"="},
    {label:"Net annual value",  sub:"Hospital perspective\n1-year horizon",        color:C.green, bold:true},
  ];
  const included = [
    "NHSN-defined HAIs: CLABSI, CAUTI, CDI, MRSA bacteremia, VAE (SSI optional)",
    "Direct attributable costs from cross-transmission clusters detected by WGS",
    "HACRP Medicare penalty exposure reduction (1% of Medicare FFS revenue)",
    "Sequencing program cost across 4 surveillance intensity levels",
  ];
  const excluded = [
    "Costs of non-genomic IP interventions triggered by outbreak suspicion (OR closures, cohorting, PPE)",
    "Value of ruling out transmission — WGS prevents unnecessary interventions (not modeled)",
    "Societal costs, readmissions, litigation, or long-term patient morbidity",
    "Outbreaks involving NTM, Candida auris, or non-NHSN pathogens",
  ];
  return (
    <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:14,padding:"28px 32px",marginBottom:28,boxShadow:C.sh1}}>
      <div style={{fontSize:11,color:C.teal,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,marginBottom:6}}>How this model works</div>
      <div style={{fontSize:21,fontWeight:600,fontFamily:FONT_DISPLAY,fontStyle:"italic",color:C.txt,marginBottom:22,lineHeight:1.3}}>
        A one-year cost-benefit analysis of WGS surveillance<br/>for hospital infection prevention
      </div>
      {/* Equation */}
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:4,background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:10,padding:"16px 20px",marginBottom:24}}>
        {eqParts.map((item,i) =>
          item.op ? (
            <div key={i} style={{fontSize:18,color:C.txt3,fontWeight:300,padding:"0 6px"}}>{item.op}</div>
          ) : (
            <div key={i} style={{textAlign:"center",padding:"4px 12px"}}>
              <div style={{fontSize:13,fontWeight:700,color:item.color,fontFamily:FONT_MONO,whiteSpace:"nowrap"}}>{item.label}</div>
              <div style={{fontSize:10,color:C.txt3,marginTop:2,lineHeight:1.4,whiteSpace:"pre-line"}}>{item.sub}</div>
            </div>
          )
        )}
      </div>
      {/* Included / excluded */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:C.teal,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Included</div>
          {included.map((t,i) => (
            <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:C.teal,marginTop:6,flexShrink:0}}/>
              <div style={{fontSize:13,color:C.txt2,lineHeight:1.6}}>{t}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:C.txt3,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Not included</div>
          {excluded.map((t,i) => (
            <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
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
function ModelCard({model, data, seqCost}) {
  const {haIsPrevented,costAvoided,hacrp,netValue,seqs} = data;
  const green = netValue > 0;
  return (
    <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",boxShadow:C.sh1,position:"relative",overflow:"hidden",transition:"box-shadow 0.2s"}}
      onMouseOver={e=>e.currentTarget.style.boxShadow=C.sh2}
      onMouseOut={e=>e.currentTarget.style.boxShadow=C.sh1}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:model.color,borderRadius:"12px 12px 0 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontSize:11,color:model.color,letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600,marginBottom:3}}>{model.label}</div>
          <div style={{fontSize:17,fontWeight:600,color:C.txt,fontFamily:FONT_DISPLAY}}>{model.name}</div>
        </div>
        <div style={{background:green?C.tealXp:C.redPale,border:`1px solid ${green?C.tealPale:"#fecaca"}`,borderRadius:8,padding:"5px 12px",fontSize:13,fontWeight:700,color:green?C.teal:C.red,fontFamily:FONT_MONO,whiteSpace:"nowrap"}}>
          {green?"+":""}{fm(netValue)}
        </div>
      </div>
      <p style={{fontSize:12,color:C.txt3,lineHeight:1.6,marginBottom:16,minHeight:36}}>{model.desc}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",paddingTop:12,borderTop:`1px solid ${C.border}`}}>
        {[
          ["Sequences/yr",     fn(seqs)],
          ["Program cost",     fm(seqs*seqCost)],
          ["HAIs prevented",   fn(haIsPrevented.total)+(model.valueType==="future"?" *":"")],
          ["Cost avoided",     fm(costAvoided.total)],
          ["HACRP savings",    fm(hacrp.saved)],
          ["Cost/HAI prev.",   haIsPrevented.total>0.5 ? fm(data.costPerHAI)   : "—"],
          ["Seqs/HAI prev.",   haIsPrevented.total>0.5 ? fn(data.seqsPerHAI)   : "—"],
          ["Net value",        fm(netValue)],
        ].map(([k,v]) => (
          <div key={k}>
            <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2,fontWeight:500}}>{k}</div>
            <div style={{fontSize:14,fontWeight:600,color:C.txt,fontFamily:FONT_MONO}}>{v}</div>
          </div>
        ))}
      </div>
      {model.valueType==="future" && (
        <div style={{marginTop:12,fontSize:11,color:C.txt3,fontStyle:"italic",borderTop:`1px solid ${C.border}`,paddingTop:10}}>
          * Reflects future outbreak prevention via reservoir identification; current outbreak not preventable
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREAKDOWN TABLE
// ─────────────────────────────────────────────────────────────────────────────
function BreakdownTable({models, allData, incSSI, costTable}) {
  const types = incSSI ? ["clabsi","cauti","cdi","mrsa","vae","ssi"] : ["clabsi","cauti","cdi","mrsa","vae"];
  const srcRefs = {clabsi:"R1,R2",cauti:"R1",cdi:"R3,R4,R9",mrsa:"R2,R12,R14",vae:"R1",ssi:"R2,R7"};
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${C.border}`}}>
            {["HAI Type","Cost/Case","Trans. Frac.","Sources"].map((h,i) => (
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
              <td style={{padding:"10px 14px",color:C.txt,fontWeight:500}}>{HAI_LABELS[t]}</td>
              <td style={{padding:"10px 14px",color:C.txt2,fontFamily:FONT_MONO,textAlign:"right"}}>{fm(costTable[t])}</td>
              <td style={{padding:"10px 14px",color:C.txt3,fontFamily:FONT_MONO,textAlign:"right"}}>{Math.round(TRANS_FRAC[t]*100)}%</td>
              <td style={{padding:"10px 14px"}}><Tag text={srcRefs[t]} color={C.teal}/></td>
              {models.map(m => {
                const n = allData[m.id]?.haIsPrevented?.byType?.[t] ?? 0;
                return <td key={m.id} style={{padding:"10px 14px",fontFamily:FONT_MONO,textAlign:"right",color:n>0?m.color:C.border2,fontWeight:n>0?600:400}}>{n>0?fn(n):"—"}</td>;
              })}
            </tr>
          ))}
          <tr style={{borderTop:`2px solid ${C.border2}`,background:C.tealXp}}>
            <td style={{padding:"10px 14px",color:C.teal,fontWeight:700}} colSpan={4}>Total cost avoided</td>
            {models.map(m => (
              <td key={m.id} style={{padding:"10px 14px",fontFamily:FONT_MONO,textAlign:"right",color:m.color,fontWeight:700}}>{fm(allData[m.id]?.costAvoided?.total??0)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM HOSPITAL DATA ENTRY TAB
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY = {name:"",beds:0,totalRevenueMn:0,medicareRevenuePct:0.22,admissionsPerYear:0,patientDaysPerYear:0,cultureVolumes:{mrsa:0,cdi:0,cre:0,abx:0,mssa:0},hais:{clabsi:0,cauti:0,cdi:0,mrsa:0,vae:0,ssi:0},surgicalProcedures:0};

function CustomTab({pFrac, seqCost, incSSI, setIncSSI, useVariableCost}) {
  const [custom, setCustom] = useState(EMPTY);
  const [step, setStep]     = useState(0);
  const [prefill, setPrefill] = useState(null);

  const set = (path, val) => setCustom(prev => {
    const next = {...prev};
    if (path.includes(".")) { const [a,b]=path.split("."); next[a]={...next[a],[b]:val}; }
    else next[path]=val;
    return next;
  });

  const applyPrefill = (idx) => { setCustom({...HOSPITAL_SIZES[idx],name:`${HOSPITAL_SIZES[idx].label} Hospital (benchmark)`}); setPrefill(idx); };

  const totalHAIs = Object.entries(custom.hais).reduce((a,[k,v])=>k!=="ssi"||incSSI?a+v:a,0);
  const {data:allData} = useMemo(()=>runAll(custom,pFrac,seqCost,incSSI,useVariableCost),[custom,pFrac,seqCost,incSSI,useVariableCost]);
  const medRev = custom.totalRevenueMn*1e6*custom.medicareRevenuePct;
  const hasData = custom.totalRevenueMn>0 || totalHAIs>0;

  const STEPS = ["Identity","Financials","HAI Counts","Culture Volumes","Results"];

  return (
    <div>
      {/* Step nav */}
      <div style={{display:"flex",gap:0,marginBottom:20,background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",boxShadow:C.sh1}}>
        {STEPS.map((s,i) => (
          <button key={s} onClick={()=>setStep(i)} style={{flex:1,padding:"10px 6px",cursor:"pointer",background:step===i?C.tealXp:"transparent",border:"none",borderRight:i<STEPS.length-1?`1px solid ${C.border}`:"none",color:step===i?C.teal:i<step?C.teal2:C.txt3,fontFamily:FONT_BODY,fontSize:10,fontWeight:step===i?700:500,letterSpacing:"0.03em",textTransform:"uppercase",transition:"all 0.15s"}}>
            <span style={{display:"block",fontSize:9,marginBottom:2,color:step===i?C.teal:C.border2,fontFamily:FONT_MONO}}>{i+1}</span>{s}
          </button>
        ))}
      </div>

      {/* Prefill */}
      {step<4 && (
        <div style={{marginBottom:20,padding:"12px 16px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8}}>
          <div style={{fontSize:11,color:C.teal,fontWeight:600,marginBottom:8}}>Quick-start: prefill from benchmark</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {HOSPITAL_SIZES.map((h,i) => (
              <button key={h.id} onClick={()=>applyPrefill(i)} style={{padding:"5px 14px",fontSize:11,fontWeight:600,borderRadius:6,cursor:"pointer",border:`1px solid ${prefill===i?C.teal:C.border2}`,background:prefill===i?C.teal:C.s0,color:prefill===i?C.s0:C.txt2,fontFamily:FONT_BODY,transition:"all 0.15s"}}>
                {h.label}
              </button>
            ))}
            {prefill!==null && <button onClick={()=>{setCustom(EMPTY);setPrefill(null);}} style={{padding:"5px 14px",fontSize:11,fontWeight:600,borderRadius:6,cursor:"pointer",border:`1px solid ${C.border}`,background:"transparent",color:C.txt3,fontFamily:FONT_BODY}}>Clear</button>}
          </div>
          <div style={{fontSize:10,color:C.txt3,marginTop:6}}>Prefill loads benchmark values — edit any field to use your actual data.</div>
        </div>
      )}

      {step===0 && (
        <div>
          <p style={{fontSize:12,color:C.txt2,marginBottom:16}}>Enter your hospital's name and basic profile. All fields are optional.</p>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5,fontWeight:500}}>Hospital Name (optional)</div>
            <input value={custom.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Valley Medical Center"
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 12px",color:C.txt,fontFamily:FONT_BODY,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <NumInput label="Licensed beds" hint="Set-up and staffed inpatient beds" value={custom.beds} onChange={v=>set("beds",v)}/>
            <NumInput label="Annual admissions" hint="Total inpatient discharges/year" value={custom.admissionsPerYear} onChange={v=>set("admissionsPerYear",v)}/>
            <NumInput label="Annual patient-days" hint="Sum of all inpatient days. If unknown: admissions × avg LOS" value={custom.patientDaysPerYear} onChange={v=>set("patientDaysPerYear",v)}/>
            <NumInput label="Annual surgical procedures" hint="Total OR cases/year (for SSI modeling)" value={custom.surgicalProcedures} onChange={v=>set("surgicalProcedures",v)}/>
          </div>
        </div>
      )}

      {step===1 && (
        <div>
          <p style={{fontSize:12,color:C.txt2,marginBottom:16}}>Used to calculate HACRP Medicare penalty exposure. Available from your Medicare Cost Report or CFO.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <NumInput label="Total net patient revenue ($M)" hint="~$60M small, $175M medium, $400M large, $800M+ academic" value={custom.totalRevenueMn} onChange={v=>set("totalRevenueMn",v)}/>
            <NumInput label="Annual inpatient admissions" value={custom.admissionsPerYear} onChange={v=>set("admissionsPerYear",v)}/>
          </div>
          <Slider label="Medicare FFS revenue (% of total)" value={custom.medicareRevenuePct} min={0.10} max={0.45} step={0.01} onChange={v=>set("medicareRevenuePct",v)} format={pct}/>
          <div style={{fontSize:10,color:C.txt3,marginTop:-10,marginBottom:16}}>Typical range 19–28% for acute care hospitals (Definitive Healthcare 2023, R17)</div>
          {custom.totalRevenueMn>0 && (
            <div style={{padding:"14px 16px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8}}>
              <div style={{fontSize:11,color:C.teal,fontWeight:600,marginBottom:8}}>Derived financials</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {[["Total revenue",`$${custom.totalRevenueMn}M`],["Est. Medicare rev.",fm(medRev)],["Max HACRP penalty",fm(medRev*0.01)]].map(([k,v]) => (
                  <div key={k}><div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>{k}</div><div style={{fontSize:14,fontWeight:700,color:C.teal,fontFamily:FONT_MONO}}>{v}</div></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step===2 && (
        <div>
          <p style={{fontSize:12,color:C.txt2,marginBottom:4}}>Enter your annual NHSN-reported HAI counts. Pull from your NHSN analysis module or annual IP report.</p>
          <p style={{fontSize:11,color:C.txt3,marginBottom:16}}>Leave at 0 if unknown — benchmark estimates will be used for that type.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {["clabsi","cauti","cdi","mrsa","vae","ssi"].map(t => (
              <NumInput key={t} label={`${HAI_LABELS[t]} events/yr`} hint={`Benchmark (medium hospital): ${HOSPITAL_SIZES[1].hais[t]}/yr`} value={custom.hais[t]} onChange={v=>set(`hais.${t}`,v)}/>
            ))}
          </div>
          <div style={{marginTop:14,display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setIncSSI(!incSSI)} style={{width:40,height:22,borderRadius:11,cursor:"pointer",background:incSSI?C.teal:C.border,border:"none",position:"relative",flexShrink:0}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:C.s0,position:"absolute",top:3,left:incSSI?21:3,transition:"left 0.2s"}}/>
            </button>
            <div>
              <div style={{fontSize:11,color:incSSI?C.teal:C.txt3,fontWeight:600}}>{incSSI?"Include SSI in model":"SSI excluded from model"}</div>
              <div style={{fontSize:10,color:C.txt3}}>Toggle to fold wound culture isolates into sequencing volumes</div>
            </div>
          </div>
        </div>
      )}

      {step===3 && (
        <div>
          <p style={{fontSize:12,color:C.txt2,marginBottom:4}}>Annual positive culture counts by organism — the sequencing denominator. Pull from your microbiology lab's annual report or LIS system.</p>
          <p style={{fontSize:11,color:C.txt3,marginBottom:16}}>Leave at 0 to use literature-derived benchmark estimates.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {Object.entries(CULTURE_LABELS).map(([key,label]) => (
              <NumInput key={key} label={label} hint={`Benchmark (medium): ${HOSPITAL_SIZES[1].cultureVolumes[key]}/yr · Sources: R8, R9, R10, R12`} value={custom.cultureVolumes[key]} onChange={v=>set(`cultureVolumes.${key}`,v)}/>
            ))}
          </div>
          <div style={{marginTop:12,padding:"12px 14px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:10,color:"#92400e",lineHeight:1.7}}>
            <strong>CDI note:</strong> NAAT-only labs may generate 50–100% more CDI positives than toxin+NAAT two-step institutions (Thaden 2018 EID, R9). Both are valid to enter; the model sequences all positives.
          </div>
        </div>
      )}

      {step===4 && (
        !hasData ? (
          <div style={{padding:"40px 24px",textAlign:"center",background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:C.sh1}}>
            <div style={{fontSize:40,marginBottom:12}}>📋</div>
            <div style={{fontSize:16,fontWeight:600,fontFamily:FONT_DISPLAY,color:C.txt,marginBottom:8}}>No data entered yet</div>
            <p style={{fontSize:12,color:C.txt2}}>Go back and enter your hospital's data in steps 1–3, or use the quick-start prefill.</p>
            <button onClick={()=>setStep(0)} style={{marginTop:16,padding:"9px 22px",background:C.teal,border:"none",borderRadius:8,color:C.s0,fontFamily:FONT_BODY,fontSize:12,fontWeight:600,cursor:"pointer"}}>← Enter Data</button>
          </div>
        ) : (
          <div>
            <div style={{padding:"14px 16px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,marginBottom:20,boxShadow:C.sh1}}>
              <div style={{fontSize:11,color:C.teal,fontWeight:700,marginBottom:10}}>{custom.name||"Your Hospital"} — Model Inputs</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {[["Beds",custom.beds||"—"],["Admissions/yr",(custom.admissionsPerYear||0).toLocaleString()],["Patient-days/yr",(custom.patientDaysPerYear||0).toLocaleString()],["Total revenue",custom.totalRevenueMn?`$${custom.totalRevenueMn}M`:"—"],["Medicare rev.",custom.totalRevenueMn?fm(medRev):"—"],["Max HACRP",custom.totalRevenueMn?fm(medRev*0.01):"—"],["HAIs/yr",totalHAIs||"0"],["Cultures/yr",Object.values(custom.cultureVolumes).reduce((a,b)=>a+b,0).toLocaleString()]].map(([k,v]) => (
                  <div key={k}><div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>{k}</div><div style={{fontSize:14,fontWeight:600,color:C.teal,fontFamily:FONT_MONO}}>{v}</div></div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              {MODELS.map(m => <ModelCard key={m.id} model={m} data={allData[m.id]} seqCost={seqCost}/>)}
            </div>
          </div>
        )
      )}

      <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{padding:"9px 22px",background:step===0?C.bg:C.s0,border:`1px solid ${C.border}`,borderRadius:8,color:step===0?C.txt3:C.txt2,fontFamily:FONT_BODY,fontSize:12,fontWeight:500,cursor:step===0?"default":"pointer"}}>← Back</button>
        {step<4
          ? <button onClick={()=>setStep(s=>s+1)} style={{padding:"9px 24px",background:C.teal,border:"none",borderRadius:8,color:C.s0,fontFamily:FONT_BODY,fontSize:12,fontWeight:600,cursor:"pointer"}}>{step===3?"See Results →":"Next →"}</button>
          : <button onClick={()=>setStep(0)} style={{padding:"9px 22px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,color:C.teal,fontFamily:FONT_BODY,fontSize:12,fontWeight:600,cursor:"pointer"}}>← Edit Data</button>}
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
      {label:"CLABSI",value:`$${Math.round(48108*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(48108*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"AHRQ 2017 meta-analysis (7 studies); inflated 2015→2024 via CPI Medical Care Services (+29%). Variable cost = 65% of total (Graves 2007).",refs:["R1","R23","R25","R26"],conf:"High — AHRQ gold standard; inflation method peer-reviewed"},
      {label:"CAUTI",value:`$${Math.round(13793*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(13793*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"AHRQ 2017 meta-analysis.",refs:["R1","R23","R25"],conf:"High"},
      {label:"CDI (hospital-onset)",value:`$${Math.round(17000*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(17000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"Forrester 2022 HCUP-NIS; Zhang 2024 community network; AHRQ range $15K–$20K (2015 USD).",refs:["R3","R4","R23","R25"],conf:"Moderate — range $15K–$20K"},
      {label:"MRSA bacteremia",value:`$${Math.round(42000*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(42000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"Zimlichman 2013 + MRSA premium ~$13K over non-MRSA BSI.",refs:["R2","R23","R25"],conf:"Moderate"},
      {label:"VAE",value:`$${Math.round(32000*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(32000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"AHRQ 2017 range for VAP/VAE.",refs:["R1","R23","R25"],conf:"Moderate"},
      {label:"SSI",value:`$${Math.round(21000*CPI_2015_TO_2024).toLocaleString()} total / $${Math.round(21000*CPI_2015_TO_2024*VARIABLE_FRAC).toLocaleString()} variable`,basis:"Zimlichman 2013 meta-analysis.",refs:["R2","R23","R25"],conf:"High"},
    ]},
    {cat:"Culture Volumes (sequencing denominator)", items:[
      {label:"MRSA isolates",value:"~12% of true+ blood cultures + wound/skin",basis:"Derived from Thom 2024 EIP surveillance rates and Martin 2024 ICHE: 4.22 HAI/10,000 pt-days.",refs:["R12","R14"],conf:"Moderate — derived estimate"},
      {label:"CDI positive tests",value:"0.57–0.88/1,000 pt-days by hospital type",basis:"Thaden 2018 EID — prospective multicenter US study, 30 hospitals. NAAT labs generate ~2× more positives.",refs:["R9"],conf:"High — US prospective multicenter"},
      {label:"CRE isolates",value:"2.44/10,000 admissions (CRKP 2022)",basis:"Kadri 2024 OFID — PINC AI + BD Insights national database.",refs:["R10"],conf:"High — large US national database"},
      {label:"Blood culture volume",value:"21.5 sets/1,000 pt-days; 15.4% positivity",basis:"Ohishi 2021 — 63 hospitals ≥200 beds.",refs:["R8"],conf:"Moderate — Japan data; US rates comparable"},
    ]},
    {cat:"Transmissible Fraction & Prevention Efficacy", items:[
      {label:"MRSA transmissible fraction (~42%)",value:"~40–50% of MRSA HAIs are WGS-definable cross-transmission",basis:"Martin 2024 ICHE: WGS-attributed vs. total HAI. Haaber 2022: ~18.9% of S. aureus acquisitions had patient-to-patient WGS evidence.",refs:["R14","R15","R20"],conf:"Moderate — single-center WGS studies"},
      {label:"Intervention lag (fixed cluster denominator)",value:"Lag fraction = lag cases / avg cluster size (5 cases)",basis:"Fixed cluster size of 5 from Bhargava 2021 ICU data and Toth 2022 outbreak modeling. Earlier model version incorrectly scaled by annual HAI rate, artificially suppressing CLABSI/MRSA — corrected in v2.1.",refs:["R13","R19"],conf:"Moderate — literature-derived"},
      {label:"Default preventable fraction",value:"35% (range 15–65%)",basis:"Conservative mid-range across organisms. Toggle to sensitivity-test.",refs:["R14","R15"],conf:"Modeled"},
    ]},
    {cat:"HACRP & Hospital Revenue", items:[
      {label:"1% Medicare FFS penalty",value:"Worst-performing quartile on composite HAC score",basis:"CMS HACRP federal regulation.",refs:["R16"],conf:"High — federal regulation"},
      {label:"Medicare revenue fraction",value:"19–28% of total net revenue by hospital size",basis:"Definitive Healthcare Medicare Cost Report analysis (2023).",refs:["R17"],conf:"High — cost report data"},
      {label:"HACRP continuous exposure model",value:"40% baseline probability × max penalty",basis:"~25% penalized annually; modeled continuously to reflect SIR proximity to threshold. Conservative assumption.",refs:["R16","R17"],conf:"Moderate — simplification of binary threshold"},
    ]},
    {cat:"Methodology Standards", items:[
      {label:"Reporting standard",value:"CHEERS 2022 (ISPOR)",basis:"28-item international standard. Hospital perspective; 1-year time horizon; no discounting; one-way sensitivity analysis via user toggles.",refs:["R21"],conf:"High — international standard"},
      {label:"Modeling best practices",value:"ISPOR-SMDM Task Force 2012",basis:"Deterministic model with uncertainty characterized via sensitivity analysis. PSA not implemented (appropriate for decision-support tool).",refs:["R22"],conf:"High — international standard"},
      {label:"Inflation adjustment",value:"CPI Medical Care Services 2015→2024 (+29%)",basis:"Recommended by Dunn 2018 for adjusting hospital cost studies. General CPI-U is NOT appropriate for medical costs.",refs:["R23","R26","R27"],conf:"High — peer-reviewed methodology"},
      {label:"Variable vs. total costs",value:"Default: variable (65% of total). Toggle to total for upper bound.",basis:"Graves 2007: fixed overhead persists even when infections prevented. Variable cost is the correct denominator for prevention ROI calculations.",refs:["R25","R27","R28"],conf:"High — well-established methodology"},
    ]},
  ];

  return (
    <div>
      {sections.map(s => (
        <div key={s.cat} style={{marginBottom:24}}>
          <div style={{fontSize:12,fontWeight:700,color:C.teal,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:12,paddingBottom:8,borderBottom:`2px solid ${C.tealPale}`}}>{s.cat}</div>
          {s.items.map(item => (
            <div key={item.label} style={{marginBottom:10,padding:"14px 16px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:8,boxShadow:C.sh1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{fontSize:12,color:C.txt,fontWeight:600,flex:1}}>{item.label}</div>
                <div style={{fontSize:11,color:C.teal,fontFamily:FONT_MONO,fontWeight:600,marginLeft:12,textAlign:"right"}}>{item.value}</div>
              </div>
              <div style={{fontSize:11,color:C.txt2,marginBottom:8,lineHeight:1.6}}>{item.basis}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                {item.refs.map(r => (
                  <button key={r} onClick={()=>setOpenRef(openRef===r?null:r)}
                    style={{padding:"2px 8px",fontSize:10,borderRadius:4,cursor:"pointer",border:`1px solid ${openRef===r?C.teal:C.border}`,background:openRef===r?C.tealXp:C.bg,color:openRef===r?C.teal:C.txt3,fontFamily:FONT_MONO,fontWeight:600}}>
                    {REFS[r]?.tag||r}
                  </button>
                ))}
                <span style={{fontSize:10,color:C.txt3,marginLeft:"auto"}}>Confidence: {item.conf}</span>
              </div>
              {item.refs.includes(openRef) && REFS[openRef] && (
                <div style={{marginTop:10,padding:"12px 14px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:6}}>
                  <div style={{fontSize:11,color:C.teal,fontWeight:700,marginBottom:2}}>[{REFS[openRef].id}] {REFS[openRef].tag} · {REFS[openRef].org} ({REFS[openRef].year})</div>
                  <div style={{fontSize:11,color:C.txt2,marginBottom:4,fontStyle:"italic"}}>{REFS[openRef].title}</div>
                  <div style={{fontSize:10,color:C.txt2,marginBottom:6,lineHeight:1.6}}>{REFS[openRef].note}</div>
                  <a href={REFS[openRef].url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.teal2,wordBreak:"break-all"}}>{REFS[openRef].url}</a>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      <div style={{marginTop:8,padding:"14px 16px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:10,color:"#92400e",lineHeight:1.7}}>
        <strong>Key limitations:</strong> HACRP modeled continuously (real threshold is binary). CDI volume depends heavily on lab test method. CRE at small hospitals is sporadic — annual averages mask high year-to-year variance. Detection rates are modeled from outbreak literature, not prospective RCTs. HAI cost data from AHRQ 2017/Zimlichman 2013 (inflation-adjusted); actual current costs may be higher (Anderson 2023 R5 shows 178% increase in labor costs 2019–2022).
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// METHODS & REFERENCES TAB
// ─────────────────────────────────────────────────────────────────────────────
function MethodsTab({useVariableCost}) {
  const activeCosts = useVariableCost ? HAI_COSTS_VARIABLE : HAI_COSTS_TOTAL;
  const row  = (cells) => cells;
  const tbl  = (rows, hdrs) => (
    <div style={{overflowX:"auto",marginBottom:20}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{borderBottom:`2px solid ${C.border}`}}>{hdrs.map(h=><th key={h} style={{padding:"8px 12px",color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",fontSize:9,textAlign:"left",fontWeight:600}}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>{r.map((c,j)=><td key={j} style={{padding:"8px 12px",color:j===0?C.txt:C.txt2,fontFamily:j>0?FONT_MONO:FONT_BODY,fontSize:11,lineHeight:1.5}}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
  const sec  = (n,title,content) => (
    <div style={{marginBottom:28}}>
      <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:10}}>
        <span style={{fontSize:11,color:C.teal,fontFamily:FONT_MONO,fontWeight:700}}>{n}</span>
        <div style={{fontSize:15,fontWeight:600,color:C.txt,fontFamily:FONT_DISPLAY}}>{title}</div>
      </div>
      <div style={{paddingLeft:28}}>{content}</div>
    </div>
  );
  const p = (text) => <p style={{fontSize:12,color:C.txt2,lineHeight:1.8,marginBottom:10}}>{text}</p>;

  return (
    <div style={{maxWidth:860}}>
      <div style={{padding:"20px 24px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:12,marginBottom:28}}>
        <Tag text="Model Documentation" color={C.teal}/>
        <div style={{fontSize:20,fontWeight:600,color:C.txt,fontFamily:FONT_DISPLAY,margin:"8px 0 10px"}}>Methods, Assumptions & References</div>
        <p style={{fontSize:12,color:C.txt2,lineHeight:1.8,margin:0}}>
          This is a static decision-analytic cost-benefit model from the <strong>hospital (institutional) perspective</strong>, following <strong>CHEERS 2022</strong> reporting standards <Tag text="R21" color={C.teal}/> and ISPOR-SMDM modeling best practices <Tag text="R22" color={C.teal}/>. All costs are in <strong>2024 US dollars</strong>. Time horizon: <strong>1 year</strong> (discounting not applied at this horizon). The model estimates net annual financial value of deploying WGS surveillance at four intensity levels vs. an implicit no-WGS comparator.
        </p>
      </div>

      {sec("1","Model Type & Structure",
        <>
          {p("Static decision-analytic cost-benefit analysis (CBA). Four surveillance strategies evaluated against an implicit comparator of no systematic WGS. Not a Markov model, discrete event simulation, or dynamic transmission model. Simpler model structure is appropriate and preferred for hospital-level decision support per ISPOR guidance when it adequately addresses the decision problem.")}
          {tbl([
            row(["Model type","Static decision-analytic CBA"]),
            row(["Perspective","Hospital (institutional) — direct inpatient costs only"]),
            row(["Time horizon","1 year (no discounting required)"]),
            row(["Currency","2024 USD"]),
            row(["Inflation adjustment","CPI Medical Care Services index, 2015→2024 (+29%)"]),
            row(["Cost concept",useVariableCost?"Variable (avoidable) costs [active — best practice for prevention ROI]":"Total attributable costs [active — upper bound]"]),
            row(["Sensitivity analysis","One-way deterministic via user-controlled toggles"]),
            row(["Comparators","4 WGS surveillance intensity levels vs. implicit no-WGS baseline"]),
          ],["Parameter","Value / Approach"])}
        </>
      )}

      {sec("2","HAI Cost Estimation",
        <>
          {p("Base estimates: AHRQ 2017 meta-analysis (R1) — the most rigorous US-focused systematic review of HAI attributable costs. AHRQ methodology (R27) defines costs as incremental hospital perspective costs using cost-to-charge ratios. Base values in 2015 USD.")}
          {p("Inflation adjustment: Per Dunn 2018 (R23), costs adjusted using BLS CPI Medical Care Services index (CPIMEDSL). The 2015→2024 adjustment factor is 1.29. General CPI-U is explicitly NOT used — it is inappropriate for medical cost adjustment.")}
          {p("Variable vs. total: Graves 2007 (R25) established that ~60–70% of total attributable HAI cost is variable (avoidable). Fixed overhead persists even when infections are prevented. Variable cost is the methodologically correct denominator for prevention ROI. Default is variable; toggle to total for the upper bound.")}
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
          {p("Core mechanism: WGS provides phylogenetic context enabling IP teams to identify and interrupt transmission clusters earlier than conventional epidemiology. Key parameters: (a) transmissible fraction — proportion of reported HAIs representing detectable cross-transmission; (b) detection rate by model; (c) intervention lag relative to average cluster size.")}
          {p("Intervention lag fix (v2.1): Earlier versions used annual HAI rate / 10 as cluster size denominator, which incorrectly penalised rare organisms (CLABSI: 18/yr → denominator 1.8, lag fraction clamped to 80%). v2.1 uses a fixed average cluster size of 5 cases from outbreak literature (R13, R19), making lag organism-agnostic and methodology-consistent.")}
          {tbl([
            row(["Model 1 (Full)","90%","1.5 / 5 = 30%","Continuous real-time context; environmental layer adds ~25% sequences","R13, R19, R20"]),
            row(["Model 2 (Prospective)","73%","2.5 / 5 = 50%","No environmental; ~25% outbreaks involve environmental reservoir","R13"]),
            row(["Model 3 (Semi-prosp.)","40%","5.0 / 5 = 85% cap","Suspicion lag; prior context unavailable","R19"]),
            row(["Model 4 (Retro.)","20%","8.0 / 5 → capped","Forensic only; value is future prevention via reservoir ID","R19"]),
          ],["Model","Detection Rate","Lag Fraction","Rationale","Sources"])}
        </>
      )}

      {sec("4","Scope Limitations",
        <>
          {p("This model estimates the value of HAI prevention for NHSN-defined infections caused by genomically detectable cross-transmission. It does not account for indirect value created when WGS rules OUT transmission — for example, closing an OR or cohorting a unit based on epidemiologic suspicion, when WGS subsequently shows isolates are unrelated (different acquisition events). These unnecessary interventions carry real costs (OR downtime, staffing, patient flow disruption) that WGS can prevent. This represents additional positive ROI not captured in this model.")}
          {p("Additionally excluded: societal costs (lost productivity, long-term morbidity), readmission costs, malpractice, costs of non-genomic infection control interventions, and costs associated with HAI types not tracked by NHSN (e.g., non-ventilator hospital-acquired pneumonia, NTM, Candida auris outbreaks outside formal surveillance).")}
        </>
      )}

      {sec("5","Uncertainty",
        <>
          {tbl([
            row(["HAI cost estimates","Wide CIs: CLABSI $27K–$69K in AHRQ meta-analysis","High","Toggle variable vs. total costs"]),
            row(["Transmissible fraction","Single-institution WGS studies; may not generalize","High","Toggle preventable fraction slider 15–65%"]),
            row(["WGS detection rates","No prospective RCTs comparing models directly","High","See Assumptions tab ranges"]),
            row(["Intervention lag","Fixed cluster size of 5 is an approximation","Moderate","Cluster size 3–8 in literature; 5 is central estimate"]),
            row(["HACRP exposure","Binary threshold simplified to continuous","Moderate","Use as directional, not precise"]),
            row(["Inflation adjustment","CPI Medical Care Services ±3%/yr","Low","Well-established BLS index"]),
          ],["Uncertainty Source","Nature","Impact","Mitigation"])}
          {p("Per ISPOR-SMDM best practices (R22) and CHEERS 2022 (R21), a complete probabilistic sensitivity analysis (PSA) with Monte Carlo simulation would be required for a formal peer-reviewed health economic publication. This tool implements one-way deterministic sensitivity analysis via toggles as a practical alternative for hospital decision support.")}
        </>
      )}

      {sec("6","Complete References (28 sources)",
        <div>
          {Object.values(REFS).map(ref => (
            <div key={ref.id} style={{marginBottom:8,padding:"12px 14px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:8,boxShadow:C.sh1}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:10,color:C.teal,fontFamily:FONT_MONO,fontWeight:700,flexShrink:0,minWidth:30}}>[{ref.id}]</span>
                <div>
                  <div style={{fontSize:11,color:C.txt,marginBottom:2,fontWeight:600}}>{ref.tag} · <span style={{color:C.txt2,fontWeight:400}}>{ref.org} ({ref.year})</span></div>
                  <div style={{fontSize:11,color:C.txt2,marginBottom:4,fontStyle:"italic"}}>{ref.title}</div>
                  <div style={{fontSize:10,color:C.txt3,marginBottom:4,lineHeight:1.5}}>{ref.note}</div>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.teal2,wordBreak:"break-all",textDecoration:"none"}}>{ref.url}</a>
                </div>
              </div>
            </div>
          ))}
          <div style={{marginTop:16,padding:"14px 16px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:11,color:"#78350f",lineHeight:1.7}}>
            <strong>Disclosure:</strong> This model was developed by Prospect Genomics to support hospital purchasing decisions about WGS surveillance programs. Parameter estimates are derived from peer-reviewed literature as documented. The model has not been independently peer-reviewed. Results are directional estimates — not precise financial projections. Prospect Genomics recommends supplementing this model with institution-specific data using the custom data entry tab.
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
  const [hIdx,   setHIdx]   = useState(1);
  const [pFrac,  setPFrac]  = useState(0.35);
  const [seqCost,setSeqCost]= useState(62);
  const [tatDays,setTatDays]= useState(3);
  const [incSSI, setIncSSI] = useState(false);
  const [useVar, setUseVar] = useState(true);
  const [tab,    setTab]    = useState("overview");

  const hosp = HOSPITAL_SIZES[hIdx];
  const {data:allData, totalHAIs} = useMemo(()=>runAll(hosp,pFrac,seqCost,incSSI,useVar,tatDays),[hosp,pFrac,seqCost,incSSI,useVar,tatDays]);
  const medRev   = hosp.totalRevenueMn*1e6*hosp.medicareRevenuePct;
  const costTable= useVar ? HAI_COSTS_VARIABLE : HAI_COSTS_TOTAL;

  const TABS = [
    ["overview",    "Model Overview"],
    ["breakdown",   "HAI Breakdown"],
    ["pricing",     "Pricing Crossover"],
    ["custom",      "Your Hospital"],
    ["assumptions", "Assumptions"],
    ["methods",     "Methods & References"],
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT_BODY,color:C.txt}}>
      {/* Header */}
      <div style={{background:C.s0,borderBottom:`1px solid ${C.border}`,padding:"18px 24px",position:"sticky",top:0,zIndex:100,boxShadow:C.sh1}}>
        <div style={{maxWidth:1160,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
              <div style={{width:28,height:28,background:C.teal,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:C.s0,fontSize:14,fontWeight:700,fontFamily:FONT_DISPLAY,fontStyle:"italic"}}>P</span>
              </div>
              <span style={{fontSize:13,fontWeight:600,color:C.teal,letterSpacing:"-0.01em"}}>Prospect Genomics</span>
            </div>
            <div style={{fontSize:19,fontWeight:600,color:C.txt,fontFamily:FONT_DISPLAY,letterSpacing:"-0.01em",fontStyle:"italic"}}>HAI Prevention Value Calculator</div>
          </div>
          <div style={{fontSize:12,color:C.txt3,textAlign:"right"}}>
            prospectgenomics.bio
          </div>
        </div>
      </div>

      <div style={{maxWidth:1160,margin:"0 auto",padding:"28px 24px 60px"}}>
        <ModelOverview/>

        {/* Controls */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          {/* Hospital selector */}
          <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",boxShadow:C.sh1}}>
            <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:14}}>Benchmark Hospital Profile</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {HOSPITAL_SIZES.map((h,i) => (
                <button key={h.id} onClick={()=>setHIdx(i)} style={{padding:"10px 14px",borderRadius:8,cursor:"pointer",border:`1px solid ${i===hIdx?C.teal:C.border}`,background:i===hIdx?C.tealXp:C.bg,color:i===hIdx?C.teal:C.txt2,fontFamily:FONT_BODY,fontSize:12,fontWeight:i===hIdx?700:500,textAlign:"left",transition:"all 0.15s"}}>
                  <div style={{fontSize:14,marginBottom:2,fontFamily:FONT_DISPLAY,fontStyle:"italic"}}>{h.label}</div>
                  <div style={{fontSize:11,opacity:0.7}}>{h.beds}</div>
                </button>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Total Revenue",`$${hosp.totalRevenueMn}M`],["Medicare Revenue",fm(medRev)],["Max HACRP Penalty",fm(medRev*0.01)],["Admissions/yr",hosp.admissionsPerYear.toLocaleString()],["Patient-days/yr",hosp.patientDaysPerYear.toLocaleString()],["HAIs/yr",totalHAIs+(incSSI?"":" (ex-SSI)")]].map(([k,v]) => (
                <div key={k}>
                  <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2,fontWeight:500}}>{k}</div>
                  <div style={{fontSize:14,fontWeight:600,color:C.teal,fontFamily:FONT_MONO}}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions */}
          <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",boxShadow:C.sh1}}>
            <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:14}}>Global Model Assumptions</div>
            <Slider label="Preventable Fraction (cross-transmission HAIs)" value={pFrac} min={0.15} max={0.65} step={0.01} onChange={setPFrac} format={pct}/>
            <Slider label="Sequencing Cost per Genome" value={seqCost} min={30} max={175} step={5} onChange={setSeqCost} format={v=>`$${v}`}/>
            <Slider label="Sequencing Turnaround Time (days)" value={tatDays} min={1} max={7} step={1} onChange={setTatDays} format={v=>`${v} day${v!==1?"s":""}`}/>
            <div style={{fontSize:11,color:C.txt3,marginTop:-10,marginBottom:14,lineHeight:1.5}}>Affects Models 1 & 2 only — faster TAT means earlier intervention. Reference: 3 days (R13, R19).</div>

            {/* SSI toggle */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <button onClick={()=>setIncSSI(!incSSI)} style={{width:40,height:22,borderRadius:11,cursor:"pointer",background:incSSI?C.teal:C.border,border:"none",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:C.s0,position:"absolute",top:3,left:incSSI?21:3,transition:"left 0.2s"}}/>
              </button>
              <div><div style={{fontSize:12,color:incSSI?C.teal:C.txt3,fontWeight:600}}>{incSSI?"SSI Included":"SSI Excluded"}</div><div style={{fontSize:11,color:C.txt3}}>Wound culture isolates in sequencing volume</div></div>
            </div>

            {/* Cost perspective */}
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14}}>
              <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600,marginBottom:8}}>Cost Perspective <Tag text="CHEERS 2022 · R21" color={C.teal3}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["variable","Variable costs","~65% of total · avoidable · best practice"],["total","Total attributable","Includes fixed overhead · upper bound"]].map(([val,label,note]) => (
                  <button key={val} onClick={()=>setUseVar(val==="variable")} style={{padding:"8px 10px",borderRadius:7,cursor:"pointer",border:`1px solid ${(useVar&&val==="variable")||(!useVar&&val==="total")?C.teal:C.border}`,background:(useVar&&val==="variable")||(!useVar&&val==="total")?C.tealXp:C.bg,color:(useVar&&val==="variable")||(!useVar&&val==="total")?C.teal:C.txt2,fontFamily:FONT_BODY,fontSize:10,fontWeight:600,textAlign:"left",transition:"all 0.15s"}}>
                    <div style={{marginBottom:2}}>{label}</div>
                    <div style={{fontSize:9,opacity:0.7,fontWeight:400}}>{note}</div>
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,color:C.txt3,marginTop:6}}>Costs inflated 2015→2024 via CPI Medical Care Services (+29%). Sources: R23, R26, R27.</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap",background:C.s0,padding:"6px",borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.sh1,width:"fit-content"}}>
          {TABS.map(([id,label]) => (
            <button key={id} onClick={()=>setTab(id)} style={{padding:"8px 16px",borderRadius:7,cursor:"pointer",background:tab===id?C.teal:"transparent",border:"none",color:tab===id?C.s0:C.txt3,fontFamily:FONT_BODY,fontSize:11,fontWeight:tab===id?600:500,letterSpacing:"0.02em",transition:"all 0.15s"}}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab==="overview" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {MODELS.map(m => <ModelCard key={m.id} model={m} data={allData[m.id]} seqCost={seqCost}/>)}
          </div>
        )}

        {/* Breakdown */}
        {tab==="breakdown" && (
          <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:C.sh1,overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:13,fontWeight:600,color:C.txt}}>HAIs prevented per year · {hosp.label} ({hosp.beds}) {incSSI?"· SSI included":""}</div>
              <div style={{fontSize:10,color:C.txt3}}>Cost type: {useVar?"Variable (65% of total)":"Total attributable"}</div>
            </div>
            <div style={{padding:"0 0 4px"}}>
              <BreakdownTable models={MODELS} allData={allData} incSSI={incSSI} costTable={costTable}/>
            </div>
            <div style={{margin:"0 20px 20px",padding:"16px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10}}>
              <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600,marginBottom:12}}>HACRP Penalty Exposure · Max {fm(medRev*0.01)}/yr · Sources: R16, R17</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                {MODELS.map(m => {
                  const d = allData[m.id].hacrp;
                  return (
                    <div key={m.id}>
                      <div style={{fontSize:11,color:m.color,marginBottom:8,fontWeight:700}}>{m.label}</div>
                      {[["Baseline exposure",fm(d.baselineExposure),C.txt2],["After program",fm(d.reducedExposure),m.color],["HACRP savings","+"+fm(d.saved),C.green]].map(([k,v,c]) => (
                        <div key={k} style={{marginBottom:6}}><div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em"}}>{k}</div><div style={{fontSize:14,fontFamily:FONT_MONO,color:c,fontWeight:700}}>{v}</div></div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pricing */}
        {tab==="pricing" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",boxShadow:C.sh1}}>
              <div style={{fontSize:12,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600,marginBottom:16}}>Net Value at Current Settings</div>
              {MODELS.map(m => {
                const d = allData[m.id];
                const tot = d.costAvoided.total + d.hacrp.saved;
                const p2  = tot > 0 ? Math.max(0, Math.min(100, (d.netValue/tot)*100)) : 0;
                return (
                  <div key={m.id} style={{marginBottom:18}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:11,color:m.color,fontWeight:600}}>{m.label} · {m.name}</span>
                      <span style={{fontSize:12,fontFamily:FONT_MONO,color:d.netValue>0?C.teal:C.red,fontWeight:700}}>{d.netValue>0?"+":""}{fm(d.netValue)}</span>
                    </div>
                    <div style={{background:C.bg,borderRadius:4,height:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
                      <div style={{height:"100%",width:`${p2}%`,background:m.color,borderRadius:4,transition:"width 0.4s"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                      <span style={{fontSize:10,color:C.txt3}}>Program: {fm(d.programCost)}</span>
                      <span style={{fontSize:10,color:C.txt3}}>Value: {fm(tot)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",boxShadow:C.sh1}}>
              <div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,marginBottom:4}}>Subscription vs. Ad Hoc</div>
              <div style={{fontSize:10,color:C.txt3,marginBottom:16}}>Ad hoc: $175/genome · Subscription: ~${seqCost}/genome all-in</div>
              {MODELS.map(m => {
                const d = allData[m.id];
                const adHoc = d.seqs * 175;
                return (
                  <div key={m.id} style={{marginBottom:12,padding:"12px 14px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,color:m.color,fontWeight:700,marginBottom:8}}>{m.label} · {m.name}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[["Seqs/yr",fn(d.seqs)],["Ad hoc",fm(adHoc)],["Sub cost",fm(d.programCost)],["Saving",fm(adHoc-d.programCost)],["$/HAI prev.",d.haIsPrevented.total>0.5?fm(d.costPerHAI):"—"],["Seqs/HAI",d.haIsPrevented.total>0.5?fn(d.seqsPerHAI):"—"]].map(([k,v]) => (
                        <div key={k}><div style={{fontSize:11,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:1,fontWeight:500}}>{k}</div><div style={{fontSize:13,fontFamily:FONT_MONO,color:C.txt,fontWeight:600}}>{v}</div></div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{marginTop:12,padding:"12px 14px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,fontSize:10,color:C.teal2,lineHeight:1.7}}>
                <strong>Crossover:</strong> {hosp.label} hospital — subscription beats ad hoc at ≥<strong>{Math.round(allData["m2"].seqs*seqCost/175)}</strong> seqs/yr. Model 2 generates <strong>{allData["m2"].seqs.toLocaleString()}</strong> seqs/yr — well above crossover.
              </div>
            </div>
          </div>
        )}

        {tab==="custom"      && <CustomTab pFrac={pFrac} seqCost={seqCost} incSSI={incSSI} setIncSSI={setIncSSI} useVariableCost={useVar}/>}
        {tab==="assumptions" && <AssumptionsTab/>}
        {tab==="methods"     && <MethodsTab useVariableCost={useVar}/>}
      </div>
    </div>
  );
}

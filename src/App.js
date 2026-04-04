import { useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PROSPECT GENOMICS — HAI Prevention Value Calculator
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  teal:"#1a6b5e", teal2:"#228574", teal3:"#2da08c",
  tealPale:"#e6f2ef", tealXp:"#f2faf8", tealDeep:"#0f4039",
  green:"#16a34a", amber:"#d97706", red:"#dc2626", redPale:"#fef2f2",
  txt:"#0f1117", txt2:"#4b5563", txt3:"#9ca3af",
  bg:"#f6f8fa", s0:"#ffffff", border:"#e1e5ea", border2:"#c9d0da",
};
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";
const FONT_DISPLAY = "'Instrument Serif', Georgia, serif";
const FONT_MONO    = "'DM Mono', 'SF Mono', monospace"; // Tag badges only

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCES
// ─────────────────────────────────────────────────────────────────────────────
const REFS = {
  R1:  {id:"R1",  tag:"AHRQ 2017",          url:"https://www.ahrq.gov/hai/pfp/haccost2017-results.html",                              title:"Estimating the Additional Hospital Inpatient Cost and Mortality Associated with Selected Hospital-Acquired Conditions", org:"AHRQ", year:2017, note:"Meta-analysis: CLABSI $48,108; CAUTI $13,793; MRSA premium ~$13K over non-MRSA BSI. Hospital perspective, 2015 USD."},
  R2:  {id:"R2",  tag:"Zimlichman 2013",     url:"https://pubmed.ncbi.nlm.nih.gov/23999228/",                                         title:"Health Care–Associated Infections: A Meta-analysis of Costs and Financial Impact on the US Health Care System", org:"JAMA Internal Medicine", year:2013, note:"CLABSI $45,814/case; SSI $20,785/case; total annual HAI cost $9.8B."},
  R3:  {id:"R3",  tag:"Forrester 2022",      url:"https://pubmed.ncbi.nlm.nih.gov/33881808/",                                         title:"Cost of Health Care-Associated Infections in the United States", org:"J Patient Saf", year:2022, note:"2016 HCUP-NIS: $7.2–14.9B total annual HAI cost."},
  R4:  {id:"R4",  tag:"Zhang 2024",          url:"https://doi.org/10.1017/ice.2023.160",                                              title:"A 7-year analysis of attributable costs of HAIs in a network of community hospitals", org:"ICHE / SHEA", year:2024, note:"45 community hospitals: ~$1M/hospital/yr attributable HAI cost."},
  R5:  {id:"R5",  tag:"Anderson 2023",       url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10679173/",                                title:"Impact of HAIs on Costs and LOS 2019–2023", org:"OFID / IDSA", year:2023, note:"COVID-era HAI costs 178% higher 2019–2022."},
  R6:  {id:"R6",  tag:"CDC NHSN 2024",       url:"https://www.cdc.gov/healthcare-associated-infections/php/data/progress-report.html",title:"2024 National and State HAI Progress Report", org:"CDC/NHSN", year:2024, note:"1-in-31 hospital patients has an HAI on any given day."},
  R7:  {id:"R7",  tag:"Anderson 2012 DICON", url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC3977691/",                                title:"Assessing the Relative Burden of HAIs in a Network of Community Hospitals", org:"ICHE", year:2012, note:"SSI 38%, CAUTI 26%, CDI 22%, CLABSI 12%, VAP 2%."},
  R8:  {id:"R8",  tag:"Ohishi 2021",         url:"https://www.spandidos-publications.com/10.3892/wasj.2021.131",                      title:"Blood culture at 63 Japanese healthcare facilities", org:"World Academy of Sciences Journal", year:2021, note:"≥200-bed hospitals: 21.5 blood cx sets/1,000 pt-days; positivity 15.4%."},
  R9:  {id:"R9",  tag:"Thaden 2018 EID",     url:"https://wwwnc.cdc.gov/eid/article/24/3/17-0961_article",                           title:"Artificial Differences in C. difficile Infection Rates Associated with Disparity in Testing", org:"Emerging Infectious Diseases (CDC)", year:2018, note:"Community hospitals: HO-CDI 0.57/1,000 pt-days."},
  R10: {id:"R10", tag:"Kadri 2024 OFID",     url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11505019/",                                title:"Organism-specific Trends in CRE Infections, 2012–2022", org:"OFID / IDSA", year:2024, note:"CRKP rate 2.44/10,000 hospitalizations in 2022."},
  R11: {id:"R11", tag:"Snitkin 2014",        url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4217156/",                                title:"Rising Rates of CRE in Community Hospitals", org:"ICHE", year:2014, note:"CRE detected in 64% of 25 community hospitals."},
  R12: {id:"R12", tag:"Thom 2024 EIP",       url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC12125674/",                                title:"Trends in Incidence of MRSA Bacteremia, Six EIP Sites, 2005–2022", org:"OFID / IDSA", year:2024, note:"Population-based active surveillance. HO-MRSA benchmark incidence rates."},
  R13: {id:"R13", tag:"Bhargava 2021 CID",   url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8315036/",                                title:"MRSA Transmission in ICUs: WGS of Patients, Environments, and HCWs", org:"CID / IDSA", year:2021, note:"WGS of 413 MRSA isolates in 4 ICUs. ~55% of retrospective outbreaks identified persistent reservoir."},
  R14: {id:"R14", tag:"Martin 2024 ICHE",    url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC11149034/",                                title:"Impact of DcCP on WGS-defined MRSA HAIs", org:"ICHE / SHEA", year:2024, note:"MRSA HAI rate 4.22/10,000 pt-days. WGS-defined transmission quantified separately from endogenous HAI."},
  R15: {id:"R15", tag:"Haaber 2022 CID",     url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC9612791/",                                title:"Genomic Epidemiology Suggests Community Origins of HA-USA300 MRSA", org:"CID / IDSA", year:2022, note:"~18.9% of S. aureus acquisitions had WGS-supported patient-to-patient transmission evidence."},
  R16: {id:"R16", tag:"CMS HACRP",           url:"https://www.cms.gov/medicare/quality/value-based-programs/hospital-acquired-conditions",title:"Hospital-Acquired Condition Reduction Program", org:"CMS", year:2024, note:"1% Medicare FFS reduction for worst-performing quartile on composite HAC score."},
  R17: {id:"R17", tag:"Definitive HC 2023",  url:"https://www.definitivehc.com/blog/revenue-trends-at-u.s.-hospitals",                title:"Hospital Revenue and Expense Trends in U.S.", org:"Definitive Healthcare", year:2023, note:"Medicare ~19–28% of revenue by hospital size."},
  R18: {id:"R18", tag:"Kavanagh 2016",       url:"https://aricjournal.biomedcentral.com/articles/10.1186/s13756-017-0193-0",           title:"The incidence of MRSA infections in the US", org:"ARIC (BMC)", year:2016, note:"MRSA SIR ~0.988 vs 2010–11 baseline by end of 2015."},
  R19: {id:"R19", tag:"Toth 2022 CIDR",      url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC9394219/",                                title:"Modeling transmission of pathogens in healthcare settings", org:"Current Infectious Disease Reports", year:2022, note:"Contact precautions reduce MRSA transmission ~47%. WGS genomic surveillance likely cost-effective."},
  R20: {id:"R20", tag:"Shenoy 2024 CIDR",    url:"https://link.springer.com/article/10.1007/s11908-024-00836-w",                     title:"Whole Genome Sequencing Applications in Hospital Epidemiology and Infection Prevention", org:"Current Infectious Disease Reports", year:2024, note:"WGS identified 5 additional transmissions vs. spa-typing alone."},
  R21: {id:"R21", tag:"CHEERS 2022",         url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10297740/",                                title:"Consolidated Health Economic Evaluation Reporting Standards 2022 (CHEERS 2022) Statement", org:"Value in Health / ISPOR", year:2022, note:"28-item international standard for health economic evaluations."},
  R22: {id:"R22", tag:"ISPOR-SMDM 2012",     url:"https://www.valueinhealthjournal.com/article/S1098-3015(12)01652-X/fulltext",        title:"Modeling Good Research Practices—Overview", org:"Value in Health / ISPOR", year:2012, note:"Best practices for decision-analytic models."},
  R23: {id:"R23", tag:"Dunn 2018",           url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC5785315/",                                title:"Adjusting Health Expenditures for Inflation", org:"Health Services Research", year:2018, note:"Use CPI Medical Care Services index for adjusting hospital cost studies."},
  R24: {id:"R24", tag:"HCUP SB313 2024",     url:"https://hcup-us.ahrq.gov/reports/statbriefs/sb313-prevalence-burden-HAIs-2016-2021.pdf",title:"Prevalence and Burden of Healthcare-Associated Infections, 2016–2021", org:"AHRQ / HCUP", year:2024, note:"Most recent HCUP national HAI cost data."},
  R25: {id:"R25", tag:"Graves 2007",         url:"https://pubmed.ncbi.nlm.nih.gov/17376185/",                                         title:"Excess morbidity, mortality, and cost from hospital-acquired infection", org:"ICHE", year:2007, note:"Variable (avoidable) costs ~60–70% of total attributable HAI cost."},
  R26: {id:"R26", tag:"KFF/Peterson 2024",   url:"https://www.healthsystemtracker.org/brief/how-does-medical-inflation-compare-to-inflation-in-the-rest-of-the-economy/",title:"How Does Medical Inflation Compare to Inflation in the Rest of the Economy?", org:"Peterson-KFF Health System Tracker", year:2024, note:"Hospital services CPI rose ~54% since 2009."},
  R27: {id:"R27", tag:"AHRQ HACCOST method", url:"https://www.ahrq.gov/hai/pfp/haccost2017.html",                                    title:"Methods: Estimating Additional Hospital Inpatient Cost and Mortality Associated with HACs", org:"AHRQ", year:2017, note:"AHRQ methodology: incremental hospital perspective costs in 2015 USD."},
  R28: {id:"R28", tag:"Ramsey 2015 ISPOR",   url:"https://pubmed.ncbi.nlm.nih.gov/25773551/",                                         title:"Cost-Effectiveness Analysis Alongside Clinical Trials II", org:"Value in Health / ISPOR", year:2015, note:"Incremental analysis required; uncertainty must be characterized."},
};

// ─────────────────────────────────────────────────────────────────────────────
// BENCHMARK DATA
// ─────────────────────────────────────────────────────────────────────────────
const HOSPITAL_SIZES = [
  {id:"small",   label:"Small",   beds:"<100 beds",   totalRevenueMn:60,  medicareRevenuePct:0.28, admissionsPerYear:4000,  patientDaysPerYear:22000,  cultureVolumes:{mrsa:20, cdi:13,cre:3, abx:2, mssa:15 }, hais:{clabsi:6, cauti:28,cdi:13,mrsa:6, vae:8, ssi:28 }, surgicalProcedures:900  },
  {id:"medium",  label:"Medium",  beds:"100–299 beds",totalRevenueMn:175, medicareRevenuePct:0.23, admissionsPerYear:14000, patientDaysPerYear:75000,  cultureVolumes:{mrsa:68, cdi:43,cre:10,abx:8, mssa:50 }, hais:{clabsi:18,cauti:78,cdi:43,mrsa:18,vae:22,ssi:98 }, surgicalProcedures:3500 },
  {id:"large",   label:"Large",   beds:"300–499 beds",totalRevenueMn:400, medicareRevenuePct:0.21, admissionsPerYear:32000, patientDaysPerYear:160000, cultureVolumes:{mrsa:145,cdi:91,cre:24,abx:20,mssa:110}, hais:{clabsi:35,cauti:150,cdi:91,mrsa:38,vae:44,ssi:220}, surgicalProcedures:8500 },
  {id:"academic",label:"Academic",beds:"500+ beds",   totalRevenueMn:800, medicareRevenuePct:0.19, admissionsPerYear:60000, patientDaysPerYear:310000, cultureVolumes:{mrsa:280,cdi:177,cre:55,abx:50,mssa:215}, hais:{clabsi:62,cauti:280,cdi:177,mrsa:75,vae:84,ssi:440}, surgicalProcedures:18000},
];

const CPI_2015_TO_2024 = 1.29;
const VARIABLE_FRAC    = 0.65;
const HAI_COSTS_TOTAL  = {
  clabsi:Math.round(48108*CPI_2015_TO_2024), cauti:Math.round(13793*CPI_2015_TO_2024),
  cdi:Math.round(17000*CPI_2015_TO_2024),   mrsa:Math.round(42000*CPI_2015_TO_2024),
  vae:Math.round(32000*CPI_2015_TO_2024),   ssi:Math.round(21000*CPI_2015_TO_2024),
};
const HAI_COSTS_VARIABLE = Object.fromEntries(
  Object.entries(HAI_COSTS_TOTAL).map(([k,v])=>[k,Math.round(v*VARIABLE_FRAC)])
);

const TRANS_FRAC     = {clabsi:0.45,cauti:0.32,cdi:0.38,mrsa:0.42,vae:0.38,ssi:0.42};
const HAI_LABELS     = {clabsi:"CLABSI",cauti:"CAUTI",cdi:"CDI (HO)",mrsa:"MRSA Bacteremia",vae:"VAE",ssi:"SSI"};
const CULTURE_LABELS = {mrsa:"MRSA isolates/yr",cdi:"CDI positive tests/yr",cre:"CRE isolates/yr",abx:"Acinetobacter isolates/yr",mssa:"MSSA blood cx/yr"};
const AVG_CLUSTER_SIZE = 5;

// HAI-attributable mortality rates (for QALY layer)
const HAI_MORTALITY = {clabsi:0.18,cauti:0.03,cdi:0.07,mrsa:0.25,vae:0.25,ssi:0.03};
const QALY_PER_DEATH = 5; // conservative: remaining life-years × quality weight

const TAT_STEPS = [
  {label:"12 hours",hours:12},{label:"1 day",hours:24},{label:"2 days",hours:48},
  {label:"3 days",hours:72},{label:"5 days",hours:120},{label:"1 week",hours:168},
  {label:"2 weeks",hours:336},{label:"1 month",hours:720},{label:"3 months",hours:2160},
];
const TAT_DEFAULT_IDX = 3;

const MODELS = [
  {id:"m1",label:"M1",name:"Full Surveillance",   color:C.teal,  detectionRate:0.90,interventionLagCases:1.5,envMultiplier:1.25,valueType:"immediate",desc:"All positive cultures sequenced in real time with environmental sampling. Continuous phylogenetic context."},
  {id:"m2",label:"M2",name:"Prospective Clinical",color:C.teal2, detectionRate:0.73,interventionLagCases:2.5,envMultiplier:1.0, valueType:"immediate",desc:"Every positive clinical culture sequenced as reported. Real-time phylogenetic context from clinical specimens only."},
  {id:"m3",label:"M3",name:"Semi-Prospective",    color:C.amber, detectionRate:0.40,interventionLagCases:5.0,envMultiplier:1.0, valueType:"delayed",  desc:"Sequencing triggered when IP suspects a cluster. No prior phylogenetic context available."},
  {id:"m4",label:"M4",name:"Retrospective Only",  color:"#78716c",detectionRate:0.20,interventionLagCases:8.0,envMultiplier:1.0,valueType:"future",   desc:"Outbreak declared before sequencing. Value is reservoir identification and future prevention speed."},
];

// ─────────────────────────────────────────────────────────────────────────────
// MATH
// ─────────────────────────────────────────────────────────────────────────────
function calcSeqs(hosp, model, incSSI) {
  const total = Object.values(hosp.cultureVolumes).reduce((a,b)=>a+b,0);
  let s = model.id==="m1"?Math.round(total*model.envMultiplier)
         :model.id==="m2"?total
         :model.id==="m3"?Math.round(total*0.30)
         :Math.round(total*0.12);
  if (incSSI) {
    const ssi = Math.round((hosp.surgicalProcedures||0)*0.15*0.026);
    s += model.id==="m1"||model.id==="m2"?ssi:model.id==="m3"?Math.round(ssi*0.35):Math.round(ssi*0.15);
  }
  return s;
}

// adv: {avgCluster, m4ReservoirRate, transFrac (override)}
function calcPrevented(hosp, model, pFrac, incSSI, tatIdx, adv={}) {
  const {avgCluster=AVG_CLUSTER_SIZE, m4ReservoirRate=0.55, transFrac=TRANS_FRAC} = adv;
  const tatHours = TAT_STEPS[tatIdx].hours;
  const tatScale = (model.id==="m1"||model.id==="m2") ? tatHours/72 : 1;
  const lag = Math.min(model.interventionLagCases * tatScale / avgCluster, 0.85);
  const types = incSSI?["clabsi","cauti","cdi","mrsa","vae","ssi"]:["clabsi","cauti","cdi","mrsa","vae"];
  let total=0; const byType={};
  for (const t of types) {
    const annual = hosp.hais[t]||0;
    let val;
    if (model.valueType==="future") {
      val = annual * transFrac[t] * pFrac * m4ReservoirRate * (avgCluster/Math.max(annual,1));
    } else {
      val = annual * transFrac[t] * pFrac * model.detectionRate * (1-lag);
    }
    byType[t]=Math.round(val*10)/10; total+=val;
  }
  return {total,byType};
}

function calcCosts(byType, costTable) {
  let total=0; const breakdown={};
  for (const [t,n] of Object.entries(byType)) { breakdown[t]=n*(costTable[t]||0); total+=breakdown[t]; }
  return {total,breakdown};
}

// hacExpFrac: fraction of hospitals near HACRP threshold (~40% baseline)
function calcHACRP(hosp, totalHAIs, prevented, hacExpFrac=0.40) {
  const mr=hosp.totalRevenueMn*1e6*hosp.medicareRevenuePct;
  const maxP=mr*0.01, base=maxP*hacExpFrac;
  const rf=Math.min(prevented/Math.max(totalHAIs,1),0.85);
  return {maxPenalty:maxP,baselineExposure:base,reducedExposure:base*(1-rf),saved:base*rf};
}

// Full model run with conventional comparator
// adv: {convDetRate, avgCluster, hacExpFrac, m4ReservoirRate, detRates, transFrac?, costOverride?}
function runAll(hosp, pFrac, subFee, adHocPrice, incSSI, useVar, tatIdx, adv={}) {
  const {
    convDetRate=0.07, avgCluster=AVG_CLUSTER_SIZE, hacExpFrac=0.40,
    m4ReservoirRate=0.55, detRates={}, transFrac=TRANS_FRAC, costOverride,
  } = adv;
  const totalHAIs = Object.entries(hosp.hais).reduce((a,[k,v])=>k!=="ssi"||incSSI?a+v:a,0);
  const baseCostTable = useVar?HAI_COSTS_VARIABLE:HAI_COSTS_TOTAL;
  const costTable = costOverride||baseCostTable;
  const calcAdv = {avgCluster,m4ReservoirRate,transFrac};

  // Conventional epi baseline (no typing, slow manual investigation)
  const convModel = {id:"conv",detectionRate:convDetRate,interventionLagCases:8,valueType:"immediate"};
  const convPrev  = calcPrevented(hosp,convModel,pFrac,incSSI,tatIdx,calcAdv);
  const convCost  = calcCosts(convPrev.byType,costTable);
  const convHAIAP = calcHACRP(hosp,totalHAIs,convPrev.total,hacExpFrac);
  const convBenefit = convCost.total+convHAIAP.saved;
  const convQALY = Object.entries(convPrev.byType).reduce((a,[t,n])=>a+n*(HAI_MORTALITY[t]||0)*QALY_PER_DEATH,0);

  const out={};
  for (const model of MODELS) {
    const detRate = detRates[model.id]??model.detectionRate;
    const mAdj = {...model,detectionRate:detRate};
    const seqs     = calcSeqs(hosp,model,incSSI);
    const prev     = calcPrevented(hosp,mAdj,pFrac,incSSI,tatIdx,calcAdv);
    const cost     = calcCosts(prev.byType,costTable);
    const hacrp    = calcHACRP(hosp,totalHAIs,prev.total,hacExpFrac);
    const benefit  = cost.total+hacrp.saved;
    const progSub  = subFee, progAH = seqs*adHocPrice;
    const qalyGained = Object.entries(prev.byType).reduce((a,[t,n])=>a+n*(HAI_MORTALITY[t]||0)*QALY_PER_DEATH,0);
    const incrPrev  = Math.max(0,prev.total-convPrev.total);
    const incrBen   = benefit-convBenefit;
    const incrQALY  = Math.max(0,qalyGained-convQALY);
    out[model.id]={
      seqs,haIsPrevented:prev,costAvoided:cost,hacrp,
      programCostSub:progSub,programCostAdHoc:progAH,
      netValueSub:benefit-progSub,netValueAdHoc:benefit-progAH,
      costPerHAISub:prev.total>0.5?progSub/prev.total:0,
      costPerHAIAdHoc:prev.total>0.5?progAH/prev.total:0,
      seqsPerHAI:prev.total>0.5?seqs/prev.total:0,
      incrPrev,incrBen,
      icerSub:incrPrev>0.1?progSub/incrPrev:null,
      icerAdHoc:incrPrev>0.1?progAH/incrPrev:null,
      netIncrSub:incrBen-progSub,netIncrAdHoc:incrBen-progAH,
      qalyGained,incrQALY,
      costPerQALYSub:incrQALY>0.01?progSub/incrQALY:null,
      costPerQALYAdHoc:incrQALY>0.01?progAH/incrQALY:null,
    };
  }
  return {data:out,totalHAIs,convData:{prev:convPrev,cost:convCost,hacrp:convHAIAP}};
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBABILISTIC SENSITIVITY ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
function randn() {
  return Math.sqrt(-2*Math.log(Math.random()+1e-12))*Math.cos(2*Math.PI*Math.random());
}
function gammaSample(shape) {
  if (shape<1) return gammaSample(1+shape)*Math.pow(Math.random()+1e-12,1/shape);
  const d=shape-1/3, c=1/Math.sqrt(9*d);
  for(;;) {
    let x,v;
    do { x=randn(); v=1+c*x; } while(v<=0);
    v=v*v*v;
    const u=Math.random();
    if (u<1-0.0331*(x*x)*(x*x)) return d*v;
    if (Math.log(u)<0.5*x*x+d*(1-v+Math.log(v))) return d*v;
  }
}
function betaSample(a,b) { const g1=gammaSample(a),g2=gammaSample(b); return g1/(g1+g2); }
function clampV(v,lo,hi) { return Math.max(lo,Math.min(hi,v)); }
function sampleBeta(mean,se) {
  const m=clampV(mean,0.05,0.95), v=se*se;
  const a=Math.max(m*(m*(1-m)/v-1),0.5), b=Math.max((1-m)*(m*(1-m)/v-1),0.5);
  return clampV(betaSample(a,b),0.001,0.999);
}
function sampleGamma(mean,se) {
  const shape=(mean/se)*(mean/se), scale=se*se/mean;
  return Math.max(gammaSample(shape)*scale, mean*0.1);
}

function runPSA(hosp, pFrac, subFee, adHocPrice, incSSI, useVar, tatIdx, adv, n=1000) {
  const out = MODELS.reduce((acc,m)=>({...acc,[m.id]:{sub:[],adhoc:[]}}),{});
  for (let i=0;i<n;i++) {
    const sAdv = {
      ...adv,
      transFrac:{
        clabsi:sampleBeta(0.45,0.08),cauti:sampleBeta(0.32,0.06),
        cdi:sampleBeta(0.38,0.08),mrsa:sampleBeta(0.42,0.08),
        vae:sampleBeta(0.38,0.07),ssi:sampleBeta(0.42,0.08),
      },
      costOverride:{
        clabsi:sampleGamma(HAI_COSTS_TOTAL.clabsi,12000),
        cauti: sampleGamma(HAI_COSTS_TOTAL.cauti,3500),
        cdi:   sampleGamma(HAI_COSTS_TOTAL.cdi,4000),
        mrsa:  sampleGamma(HAI_COSTS_TOTAL.mrsa,11000),
        vae:   sampleGamma(HAI_COSTS_TOTAL.vae,7000),
        ssi:   sampleGamma(HAI_COSTS_TOTAL.ssi,4500),
      },
      detRates:{
        m1:sampleBeta(adv.detRates?.m1??0.90,0.05),
        m2:sampleBeta(adv.detRates?.m2??0.73,0.08),
        m3:adv.detRates?.m3??0.40,
        m4:adv.detRates?.m4??0.20,
      },
      hacExpFrac:sampleBeta(adv.hacExpFrac??0.40,0.10),
      convDetRate:sampleBeta(adv.convDetRate??0.07,0.03),
    };
    const sampledPFrac = sampleBeta(pFrac,0.10);
    const {data} = runAll(hosp,sampledPFrac,subFee,adHocPrice,incSSI,useVar,tatIdx,sAdv);
    for (const m of MODELS) {
      out[m.id].sub.push(data[m.id].netValueSub);
      out[m.id].adhoc.push(data[m.id].netValueAdHoc);
    }
  }
  const summarize = arr => {
    const s=[...arr].sort((a,b)=>a-b), N=s.length;
    return {mean:s.reduce((a,b)=>a+b,0)/N, lo:s[Math.floor(N*0.025)], hi:s[Math.floor(N*0.975)], probPos:s.filter(v=>v>0).length/N};
  };
  return MODELS.reduce((acc,m)=>({...acc,[m.id]:{sub:summarize(out[m.id].sub),adhoc:summarize(out[m.id].adhoc)}}),{});
}

function computeTornado(hosp, pFrac, subFee, adHocPrice, incSSI, useVar, tatIdx, adv, modelId, pricingMode) {
  const base = runAll(hosp,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx,adv);
  const baseNet = pricingMode==="sub"?base.data[modelId].netValueSub:base.data[modelId].netValueAdHoc;
  const bct = useVar?HAI_COSTS_VARIABLE:HAI_COSTS_TOTAL;
  const getNet = res => pricingMode==="sub"?res.data[modelId].netValueSub:res.data[modelId].netValueAdHoc;
  const run = a => runAll(hosp,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx,a);
  const params = [
    {label:"Cluster interruption rate (pFrac)",
      loNet:getNet(runAll(hosp,0.47,subFee,adHocPrice,incSSI,useVar,tatIdx,adv)),
      hiNet:getNet(runAll(hosp,0.95,subFee,adHocPrice,incSSI,useVar,tatIdx,adv))},
    {label:"Trans. frac. CLABSI",
      loNet:getNet(run({...adv,transFrac:{...TRANS_FRAC,clabsi:0.30}})),
      hiNet:getNet(run({...adv,transFrac:{...TRANS_FRAC,clabsi:0.60}}))},
    {label:"Trans. frac. MRSA",
      loNet:getNet(run({...adv,transFrac:{...TRANS_FRAC,mrsa:0.27}})),
      hiNet:getNet(run({...adv,transFrac:{...TRANS_FRAC,mrsa:0.57}}))},
    {label:"Trans. frac. CDI",
      loNet:getNet(run({...adv,transFrac:{...TRANS_FRAC,cdi:0.22}})),
      hiNet:getNet(run({...adv,transFrac:{...TRANS_FRAC,cdi:0.54}}))},
    {label:"Cost/case CLABSI",
      loNet:getNet(run({...adv,costOverride:{...bct,clabsi:38000}})),
      hiNet:getNet(run({...adv,costOverride:{...bct,clabsi:89000}}))},
    {label:"Cost/case MRSA",
      loNet:getNet(run({...adv,costOverride:{...bct,mrsa:32000}})),
      hiNet:getNet(run({...adv,costOverride:{...bct,mrsa:76000}}))},
    {label:"HACRP exposure fraction",
      loNet:getNet(run({...adv,hacExpFrac:0.20})),
      hiNet:getNet(run({...adv,hacExpFrac:0.60}))},
    {label:"Conventional detection rate",
      loNet:getNet(run({...adv,convDetRate:0.03})),
      hiNet:getNet(run({...adv,convDetRate:0.15}))},
    {label:"M4 reservoir ID rate",
      loNet:getNet(run({...adv,m4ReservoirRate:0.30})),
      hiNet:getNet(run({...adv,m4ReservoirRate:0.75}))},
  ];
  return params
    .map(p=>({...p,base:baseNet,range:Math.abs(p.hiNet-p.loNet)}))
    .sort((a,b)=>b.range-a.range);
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fm  = n=>n>=1e6?`$${(n/1e6).toFixed(1)}M`:n>=1e3?`$${(n/1e3).toFixed(0)}K`:`$${Math.round(n).toLocaleString()}`;
const fn  = n=>n>=1e3?`${(n/1e3).toFixed(1)}K`:`${Math.round(n*10)/10}`;
const pct = v=>`${Math.round(v*100)}%`;

// ─────────────────────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Slider({label,value,min,max,step,onChange,format,hint}) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:11,color:C.txt3,letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:600}}>{label}</span>
        <span style={{fontSize:12,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums"}}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(parseFloat(e.target.value))}
        style={{width:"100%",accentColor:C.teal,cursor:"pointer",height:4}}/>
      {hint&&<div style={{fontSize:10,color:C.txt3,marginTop:3,lineHeight:1.4}}>{hint}</div>}
    </div>
  );
}

function SInput({label,value,onChange,float=false,min=0,max}) {
  return (
    <div style={{marginBottom:9}}>
      <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2,fontWeight:600}}>{label}</div>
      <input type="number" min={min} max={max} value={value===0?"":value}
        onChange={e=>{const v=float?(parseFloat(e.target.value)||0):(parseInt(e.target.value)||0); onChange(max!=null?clampV(v,min,max):Math.max(min,v));}}
        onFocus={e=>e.target.select()}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,padding:"5px 7px",color:C.txt,fontFamily:FONT_BODY,fontSize:13,outline:"none",boxSizing:"border-box"}}
        onMouseOver={e=>e.target.style.borderColor=C.teal3}
        onMouseOut={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
}

function Tag({text,color=C.teal}) {
  return <span style={{display:"inline-block",padding:"1px 7px",fontSize:10,fontFamily:FONT_MONO,background:`${color}18`,border:`1px solid ${color}33`,borderRadius:4,color,fontWeight:600,letterSpacing:"0.05em"}}>{text}</span>;
}

function TATpicker({tatIdx,setTatIdx}) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:11,color:C.txt3,letterSpacing:"0.05em",textTransform:"uppercase",fontWeight:600}}>Sequencing Turnaround Time</span>
        <span style={{fontSize:12,fontWeight:700,color:C.teal}}>{TAT_STEPS[tatIdx].label}</span>
      </div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
        {TAT_STEPS.map((s,i)=>(
          <button key={i} onClick={()=>setTatIdx(i)}
            style={{padding:"3px 7px",fontSize:10,borderRadius:4,cursor:"pointer",fontWeight:600,fontFamily:FONT_BODY,
              border:`1px solid ${i===tatIdx?C.teal:C.border}`,background:i===tatIdx?C.teal:"transparent",color:i===tatIdx?C.s0:C.txt3}}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{fontSize:10,color:C.txt3,marginTop:4}}>Affects M1 & M2 only. Reference: 3 days.</div>
    </div>
  );
}

function Toggle({on,onClick,labelOn,labelOff,note}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
      <button onClick={onClick} style={{width:34,height:18,borderRadius:9,cursor:"pointer",background:on?C.teal:C.border2,border:"none",position:"relative",flexShrink:0,transition:"background 0.15s"}}>
        <div style={{width:12,height:12,borderRadius:"50%",background:C.s0,position:"absolute",top:3,left:on?19:3,transition:"left 0.12s"}}/>
      </button>
      <div>
        <div style={{fontSize:12,color:on?C.teal:C.txt3,fontWeight:600}}>{on?labelOn:labelOff}</div>
        {note&&<div style={{fontSize:10,color:C.txt3,lineHeight:1.3}}>{note}</div>}
      </div>
    </div>
  );
}

function SecHeader({title,open,onToggle,badge}) {
  return (
    <button onClick={onToggle} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",background:"transparent",border:"none",borderTop:`1px solid ${C.border}`,cursor:"pointer",textAlign:"left",fontFamily:FONT_BODY}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <span style={{fontSize:10,fontWeight:700,color:C.txt,textTransform:"uppercase",letterSpacing:"0.06em"}}>{title}</span>
        {badge&&<span style={{fontSize:9,color:C.txt3,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"1px 6px"}}>{badge}</span>}
      </div>
      <span style={{fontSize:9,color:C.txt3}}>{open?"▲":"▼"}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
function ModelOverview() {
  const eq=[
    {label:"HAIs prevented",sub:"Cross-transmission clusters detected earlier",color:C.teal},{op:"×"},
    {label:"Cost per HAI",sub:"Total attributable · 2024 USD",color:C.teal},{op:"+"},
    {label:"HACRP savings",sub:"Medicare penalty reduction",color:C.teal},{op:"−"},
    {label:"Cost to hospital",sub:"Subscription or per-sample",color:C.txt2},{op:"="},
    {label:"Net annual value",sub:"Hospital perspective · 1 year",color:C.green},
  ];
  return (
    <div style={{background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,padding:"20px 22px",marginBottom:18}}>
      <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700,marginBottom:5}}>How this model works</div>
      <div style={{fontSize:17,fontWeight:700,fontFamily:FONT_DISPLAY,color:C.txt,marginBottom:14,lineHeight:1.3}}>
        Cost-benefit analysis of WGS surveillance vs. conventional epi (no typing)
      </div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,padding:"12px 14px",marginBottom:18}}>
        {eq.map((item,i)=>item.op?(
          <div key={i} style={{fontSize:16,color:C.txt3,fontWeight:300,padding:"0 7px"}}>{item.op}</div>
        ):(
          <div key={i} style={{textAlign:"center",padding:"3px 7px"}}>
            <div style={{fontSize:11,fontWeight:700,color:item.color,whiteSpace:"nowrap"}}>{item.label}</div>
            <div style={{fontSize:9,color:C.txt3,marginTop:2,lineHeight:1.4}}>{item.sub}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div>
          <div style={{fontSize:9,fontWeight:700,color:C.teal,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Included</div>
          {["NHSN HAIs: CLABSI, CAUTI, CDI, MRSA bacteremia, VAE (SSI optional)",
            "Attributable costs from WGS-detected cross-transmission clusters",
            "HACRP Medicare penalty reduction (1% of Medicare FFS revenue)",
            "Incremental cost vs. conventional epi baseline (no typing) · ICER reported"].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
              <div style={{width:3,height:3,borderRadius:"50%",background:C.teal,marginTop:5,flexShrink:0}}/>
              <div style={{fontSize:11,color:C.txt2,lineHeight:1.5}}>{t}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:9,fontWeight:700,color:C.txt3,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Not included</div>
          {["Value of ruling out transmission — prevents unnecessary OR closures & cohorting",
            "Societal costs, readmissions, litigation, or long-term morbidity",
            "NTM, Candida auris, or non-NHSN pathogen outbreaks",
            "Staff time for IP investigation (same under both arms)"].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
              <div style={{width:3,height:3,borderRadius:"50%",background:C.border2,marginTop:5,flexShrink:0}}/>
              <div style={{fontSize:11,color:C.txt3,lineHeight:1.5}}>{t}</div>
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
function ModelCard({model,data,pricingMode,showQALY}) {
  const netValue    = pricingMode==="sub"?data.netValueSub:data.netValueAdHoc;
  const programCost = pricingMode==="sub"?data.programCostSub:data.programCostAdHoc;
  const icer        = pricingMode==="sub"?data.icerSub:data.icerAdHoc;
  const cpqaly      = pricingMode==="sub"?data.costPerQALYSub:data.costPerQALYAdHoc;
  const {haIsPrevented,costAvoided,hacrp,seqs,incrPrev} = data;
  const positive = netValue>0;
  const rows = [
    ["Sequences/yr",    fn(seqs)],
    ["Cost to hospital",fm(programCost)],
    ["HAIs prevented",  fn(haIsPrevented.total)+(model.valueType==="future"?" *":"")],
    ["Incr. vs. conv.", incrPrev>0.1?"+"+fn(incrPrev):"—"],
    ["ICER",            icer!=null?fm(icer)+"/HAI":"—"],
    ["Cost avoided",    fm(costAvoided.total)],
    ["HACRP savings",   fm(hacrp.saved)],
    ...(showQALY?[["Cost/QALY",cpqaly!=null?fm(cpqaly):"—"]]:[] ),
  ];
  return (
    <div style={{background:C.s0,border:`1px solid ${positive?C.border:C.border2}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{height:3,background:model.color}}/>
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:model.color,letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:700,marginBottom:5}}>{model.label} · {model.name}</div>
        <div style={{background:positive?C.tealXp:C.redPale,border:`1px solid ${positive?C.tealPale:"#fecaca"}`,borderRadius:6,padding:"6px 10px",textAlign:"center"}}>
          <div style={{fontSize:10,color:positive?C.teal2:C.red,marginBottom:1}}>Net annual value</div>
          <div style={{fontSize:19,fontWeight:700,color:positive?C.teal:C.red,fontVariantNumeric:"tabular-nums"}}>
            {positive?"+":""}{fm(netValue)}
          </div>
        </div>
      </div>
      <div style={{padding:"0 14px 12px"}}>
        {rows.map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.txt3,fontWeight:500}}>{k}</div>
            <div style={{fontSize:12,fontWeight:700,color:C.txt,fontVariantNumeric:"tabular-nums"}}>{v}</div>
          </div>
        ))}
      </div>
      {model.valueType==="future"&&(
        <div style={{padding:"0 14px 10px",fontSize:9,color:C.txt3,lineHeight:1.4}}>* Future prevention via reservoir ID</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREAKDOWN TABLE
// ─────────────────────────────────────────────────────────────────────────────
function BreakdownTable({models,allData,incSSI,costTable}) {
  const types = incSSI?["clabsi","cauti","cdi","mrsa","vae","ssi"]:["clabsi","cauti","cdi","mrsa","vae"];
  const srcRefs = {clabsi:"R1,R2",cauti:"R1",cdi:"R3,R4,R9",mrsa:"R2,R12,R14",vae:"R1",ssi:"R2,R7"};
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${C.border}`}}>
            {["HAI Type","Avg Cost per Case (2024$)","Trans. Frac.","Sources"].map((h,i)=>(
              <th key={h} style={{textAlign:i>0&&i<3?"right":"left",padding:"9px 13px",color:C.txt3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",fontSize:10}}>{h}</th>
            ))}
            {models.map(m=>(
              <th key={m.id} style={{padding:"9px 13px",color:m.color,fontWeight:700,textTransform:"uppercase",fontSize:10,textAlign:"right"}}>{m.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map((t,i)=>(
            <tr key={t} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>
              <td style={{padding:"9px 13px",color:C.txt,fontWeight:600,fontSize:12}}>{HAI_LABELS[t]}</td>
              <td style={{padding:"9px 13px",color:C.txt2,fontVariantNumeric:"tabular-nums",textAlign:"right",fontSize:12}}>{fm(costTable[t])}</td>
              <td style={{padding:"9px 13px",color:C.txt3,fontVariantNumeric:"tabular-nums",textAlign:"right",fontSize:12}}>{Math.round(TRANS_FRAC[t]*100)}%</td>
              <td style={{padding:"9px 13px"}}><Tag text={srcRefs[t]} color={C.teal}/></td>
              {models.map(m=>{const n=allData[m.id]?.haIsPrevented?.byType?.[t]??0;
                return <td key={m.id} style={{padding:"9px 13px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:n>0?m.color:C.border2,fontWeight:n>0?700:400,fontSize:12}}>{n>0?fn(n):"—"}</td>;})}
            </tr>
          ))}
          <tr style={{borderTop:`2px solid ${C.border2}`,background:C.tealXp}}>
            <td style={{padding:"9px 13px",color:C.teal,fontWeight:700,fontSize:12}} colSpan={4}>Total cost avoided</td>
            {models.map(m=>(
              <td key={m.id} style={{padding:"9px 13px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:m.color,fontWeight:700,fontSize:12}}>{fm(allData[m.id]?.costAvoided?.total??0)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TORNADO CHART
// ─────────────────────────────────────────────────────────────────────────────
function TornadoChart({data}) {
  if (!data||!data.length) return null;
  const baseValue = data[0].base;
  const allVals = data.flatMap(d=>[d.loNet,d.hiNet,baseValue]);
  const gMin=Math.min(...allVals), gMax=Math.max(...allVals);
  const range=gMax-gMin||1;
  const BAR_W=280;
  const toX=v=>((v-gMin)/range)*BAR_W;
  const baseX=toX(baseValue);
  return (
    <div>
      <div style={{display:"flex",gap:12,marginBottom:12,fontSize:11,color:C.txt3}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:8,background:C.teal,borderRadius:2,opacity:0.8}}/><span>Increases net value</span></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:8,background:C.amber,borderRadius:2,opacity:0.8}}/><span>Decreases net value</span></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:1,height:14,background:C.border2}}/><span>Base value ({fm(baseValue)})</span></div>
      </div>
      {data.map((d,i)=>{
        const loX=toX(Math.min(d.loNet,d.hiNet));
        const barW=Math.abs(toX(d.hiNet)-toX(d.loNet));
        const color=d.hiNet>=d.loNet?C.teal:C.amber;
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
            <div style={{width:200,fontSize:11,color:C.txt2,textAlign:"right",flexShrink:0,lineHeight:1.3}}>{d.label}</div>
            <div style={{width:BAR_W,position:"relative",height:22,flexShrink:0,background:C.bg,borderRadius:3}}>
              <div style={{position:"absolute",left:baseX,top:0,width:1,height:"100%",background:C.border2,zIndex:2}}/>
              <div style={{position:"absolute",left:loX,width:Math.max(barW,2),top:3,height:16,background:color,borderRadius:2,opacity:0.8,zIndex:1}}/>
            </div>
            <div style={{fontSize:10,color:C.txt3,whiteSpace:"nowrap",fontVariantNumeric:"tabular-nums"}}>
              {fm(Math.min(d.loNet,d.hiNet))} – {fm(Math.max(d.loNet,d.hiNet))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PSA TAB
// ─────────────────────────────────────────────────────────────────────────────
function PSATab({hospital,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx,adv,pricingMode,setPricingMode}) {
  const [psaResults,setPsaResults] = useState(null);
  const [running,setRunning]       = useState(false);
  const [psaN,setPsaN]             = useState(1000);
  const [tornModel,setTornModel]   = useState("m1");

  const tornadoData = useMemo(()=>
    computeTornado(hospital,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx,adv,tornModel,pricingMode),
    [hospital,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx,adv,tornModel,pricingMode]
  );

  const runClick = () => {
    setRunning(true);
    setTimeout(()=>{
      try {
        const r = runPSA(hospital,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx,adv,psaN);
        setPsaResults({...r,n:psaN,mode:pricingMode});
      } finally { setRunning(false); }
    },10);
  };

  const card = {background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,padding:"20px 22px"};

  return (
    <div>
      {/* Controls row */}
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4,background:C.bg,padding:"3px",borderRadius:7,border:`1px solid ${C.border}`}}>
          {[["sub","Subscription"],["adhoc","Ad hoc"]].map(([m,l])=>(
            <button key={m} onClick={()=>setPricingMode(m)}
              style={{padding:"5px 14px",borderRadius:5,cursor:"pointer",border:`1px solid ${pricingMode===m?C.teal:"transparent"}`,background:pricingMode===m?C.s0:"transparent",color:pricingMode===m?C.teal:C.txt3,fontFamily:FONT_BODY,fontSize:12,fontWeight:pricingMode===m?700:500}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:4,background:C.bg,padding:"3px",borderRadius:7,border:`1px solid ${C.border}`}}>
          {[1000,5000,10000].map(n=>(
            <button key={n} onClick={()=>setPsaN(n)}
              style={{padding:"5px 14px",borderRadius:5,cursor:"pointer",border:`1px solid ${psaN===n?C.teal:"transparent"}`,background:psaN===n?C.s0:"transparent",color:psaN===n?C.teal:C.txt3,fontFamily:FONT_BODY,fontSize:12,fontWeight:psaN===n?700:500}}>
              {n>=1000?`${n/1000}K`:n} iterations
            </button>
          ))}
        </div>
        <button onClick={runClick} disabled={running}
          style={{padding:"7px 22px",background:running?C.border:C.teal,border:"none",borderRadius:7,color:C.s0,fontFamily:FONT_BODY,fontSize:13,fontWeight:700,cursor:running?"not-allowed":"pointer"}}>
          {running?"Running...":"Run PSA"}
        </button>
        {psaResults&&<span style={{fontSize:11,color:C.txt3}}>Last run: n={psaResults.n.toLocaleString()} · {psaResults.mode} pricing</span>}
      </div>

      {/* PSA Results */}
      {psaResults ? (
        <div style={{...card,marginBottom:16}}>
          <div style={{fontSize:11,color:C.teal,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:4}}>PSA Results — {pricingMode==="sub"?"Subscription":"Ad Hoc"} Pricing</div>
          <div style={{fontSize:12,color:C.txt3,marginBottom:16}}>Net annual value: mean ± 95% credible interval · {psaResults.n.toLocaleString()} Monte Carlo iterations · Parameters: pFrac, TRANS_FRAC[6], HAI costs[6], detection rates[2], HACRP exposure, conventional detection rate</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {MODELS.map(m=>{
              const r=psaResults[m.id][pricingMode==="sub"?"sub":"adhoc"];
              const pos=r.probPos>=0.5;
              return (
                <div key={m.id} style={{border:`1px solid ${pos?C.tealPale:C.border}`,borderRadius:8,padding:"14px",background:pos?C.tealXp:C.bg}}>
                  <div style={{fontSize:10,color:m.color,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>{m.label} · {m.name}</div>
                  {[["Mean",fm(r.mean)],["95% CI lo",fm(r.lo)],["95% CI hi",fm(r.hi)]].map(([k,v])=>(
                    <div key={k} style={{marginBottom:6}}>
                      <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:1}}>{k}</div>
                      <div style={{fontSize:13,fontWeight:700,color:C.txt,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                    </div>
                  ))}
                  <div style={{marginTop:10}}>
                    <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>P(net benefit &gt; 0)</div>
                    <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.round(r.probPos*100)}%`,background:pos?C.teal:C.amber,borderRadius:3}}/>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:pos?C.teal:C.amber,marginTop:4,fontVariantNumeric:"tabular-nums"}}>{Math.round(r.probPos*100)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:14,padding:"10px 14px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:7,fontSize:11,color:"#92400e",lineHeight:1.5}}>
            <strong>PSA note:</strong> pFrac sampled as Beta(mean={Math.round(pFrac*100)}%, SE=10%). TRANS_FRAC and HAI costs sampled from Beta/Gamma distributions with SE from literature CIs. Detection rates M1–M2 sampled; M3–M4 held fixed. M4 reservoir ID rate and avg cluster size held at user values.
          </div>
        </div>
      ) : (
        <div style={{...card,marginBottom:16,textAlign:"center",padding:"40px"}}>
          <div style={{fontSize:15,fontWeight:700,fontFamily:FONT_DISPLAY,color:C.txt,marginBottom:8}}>Run Probabilistic Sensitivity Analysis</div>
          <div style={{fontSize:12,color:C.txt3,marginBottom:16,maxWidth:480,margin:"0 auto 16px"}}>
            Monte Carlo simulation sampling uncertainty in 12 key parameters simultaneously. Shows mean ± 95% credible interval and probability of positive net benefit per model.
          </div>
          <button onClick={runClick}
            style={{padding:"9px 28px",background:C.teal,border:"none",borderRadius:7,color:C.s0,fontFamily:FONT_BODY,fontSize:13,fontWeight:700,cursor:"pointer"}}>
            Run {psaN>=1000?`${psaN/1000}K`:psaN} iterations
          </button>
        </div>
      )}

      {/* Tornado diagram */}
      <div style={card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:11,color:C.teal,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:3}}>One-Way Sensitivity — Tornado Diagram</div>
            <div style={{fontSize:12,color:C.txt3}}>Impact of each parameter on net value (all others at base). Updates live.</div>
          </div>
          <div style={{display:"flex",gap:4}}>
            {MODELS.map(m=>(
              <button key={m.id} onClick={()=>setTornModel(m.id)}
                style={{padding:"5px 12px",borderRadius:6,cursor:"pointer",border:`1px solid ${tornModel===m.id?m.color:C.border}`,background:tornModel===m.id?m.color:C.bg,color:tornModel===m.id?C.s0:C.txt2,fontFamily:FONT_BODY,fontSize:11,fontWeight:700}}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <TornadoChart data={tornadoData}/>
        <div style={{marginTop:12,fontSize:10,color:C.txt3,lineHeight:1.5}}>
          Ranges: pFrac [47%–95%] (Toth 2022, R19); TRANS_FRAC literature CI; HAI costs AHRQ 95% CI (R1, R2); HACRP exposure [20%–60%]; conventional detection [3%–15%]; M4 reservoir ID [30%–75%] (Bhargava 2021, R13).
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION TAB
// ─────────────────────────────────────────────────────────────────────────────
function DocumentationTab({useVar}) {
  const [openRef,setOpenRef] = useState(null);
  const [docSec,setDocSec]   = useState("assumptions");
  const activeCosts = useVar?HAI_COSTS_VARIABLE:HAI_COSTS_TOTAL;

  const assumptions = [
    {cat:"HAI Attributable Costs (2024 USD)", items:[
      {label:"CLABSI",value:`$${Math.round(48108*CPI_2015_TO_2024).toLocaleString()} total`,basis:"AHRQ 2017 meta-analysis (7 studies); inflated 2015→2024 via CPI Medical Care Services (+29%). PSA SE: $12,000.",refs:["R1","R23","R25","R26"],conf:"High"},
      {label:"CAUTI",value:`$${Math.round(13793*CPI_2015_TO_2024).toLocaleString()} total`,basis:"AHRQ 2017 meta-analysis. PSA SE: $3,500.",refs:["R1","R23"],conf:"High"},
      {label:"CDI (hospital-onset)",value:`$${Math.round(17000*CPI_2015_TO_2024).toLocaleString()} total`,basis:"Forrester 2022 HCUP-NIS; Zhang 2024 community network. PSA SE: $4,000.",refs:["R3","R4","R23"],conf:"Moderate"},
      {label:"MRSA bacteremia",value:`$${Math.round(42000*CPI_2015_TO_2024).toLocaleString()} total`,basis:"Zimlichman 2013 + MRSA premium over non-MRSA BSI. PSA SE: $11,000.",refs:["R2","R23"],conf:"Moderate"},
      {label:"VAE",value:`$${Math.round(32000*CPI_2015_TO_2024).toLocaleString()} total`,basis:"AHRQ 2017 range for VAP/VAE. PSA SE: $7,000.",refs:["R1","R23"],conf:"Moderate"},
      {label:"SSI",value:`$${Math.round(21000*CPI_2015_TO_2024).toLocaleString()} total`,basis:"Zimlichman 2013 meta-analysis. PSA SE: $4,500.",refs:["R2","R23"],conf:"High"},
    ]},
    {cat:"WGS Prevention Efficacy", items:[
      {label:"Transmissible fraction by HAI type",value:"CLABSI 45%, CAUTI 32%, CDI 38%, MRSA 42%, VAE 38%",basis:"Fraction of reported HAIs attributable to WGS-detectable cross-transmission. PSA: Beta distributions with SE=0.06–0.08. Needs multi-center prospective validation.",refs:["R14","R15","R20"],conf:"Moderate — single-center WGS studies"},
      {label:"Cluster interruption rate (pFrac, default 75%)",value:"75% of WGS-identified clusters successfully interrupted by IP",basis:"Contact precautions reduce MRSA transmission ~47% (Toth 2022). WGS-guided intervention likely higher. PSA mean = user slider value, SE=10%. Direct multiplier: pFrac × TRANS_FRAC × detectionRate × (1−lagFrac). Range 0–100%.",refs:["R19","R14"],conf:"Moderate — no prospective RCT"},
      {label:"Detection rates per model",value:"M1=90%, M2=73%, M3=40%, M4=20% (user-adjustable)",basis:"Expert-derived from outbreak literature. M1/M2 sampled in PSA (SE=5%/8%). M3/M4 held fixed pending empirical data. Peer review target — systematic review needed.",refs:["R13","R19","R20"],conf:"Low-Moderate — modeled, not empirical"},
      {label:"Intervention lag",value:"Lag frac = effectiveLag / avgCluster (user-adjustable, default 5)",basis:"Bhargava 2021: fixed cluster size of 5. TAT scales lag for M1/M2 proportionally. avgCluster adjustable in Advanced panel.",refs:["R13","R19"],conf:"Moderate"},
    ]},
    {cat:"Comparator: Conventional Epi (No Typing)", items:[
      {label:"Conventional detection rate (default 7%)",value:"7% of cross-transmission clusters detected by conventional epi",basis:"Conventional hospital IPC uses clinical signs, manual contact tracing, and epidemiological investigation only — no molecular typing. Literature: 5–15% of genomic clusters detectable by conventional surveillance. PSA SE=3%. User-adjustable 0–20%.",refs:["R19","R20"],conf:"Moderate — derived from WGS comparator studies"},
      {label:"Conventional intervention lag",value:"8 cases (same as M4 — slow manual investigation)",basis:"Conventional surveillance detection is reactive and slow. Fixed at M4 equivalent. Results in lagFrac=0.85 (capped).",refs:["R19"],conf:"Moderate"},
      {label:"Conventional program cost",value:"$0 incremental (IP staff costs identical under both arms)",basis:"Hospitals already employ IP staff for conventional surveillance. The incremental cost of adding WGS is the program cost shown. Staff time assumed equal — conservative (WGS may reduce investigation hours).",refs:[],conf:"Conservative"},
    ]},
    {cat:"HACRP & Hospital Revenue", items:[
      {label:"1% Medicare FFS penalty",value:"Worst-performing quartile on composite HAC score",basis:"CMS HACRP federal regulation. Binary in reality — modeled continuously as an approximation. Directional, not precise.",refs:["R16"],conf:"High — federal regulation; continuous approximation noted"},
      {label:"HACRP baseline exposure fraction (default 40%)",value:"40% of max penalty modeled as baseline exposure",basis:"~25% of hospitals penalized annually; 40% modeled as near-threshold. User-adjustable 0–100%. PSA SE=10%.",refs:["R16","R17"],conf:"Moderate — continuous simplification of binary threshold"},
    ]},
    {cat:"QALY / Mortality Layer (optional toggle)", items:[
      {label:"HAI-attributable mortality rates",value:"CLABSI 18%, MRSA 25%, CDI 7%, VAE 25%, CAUTI 3%, SSI 3%",basis:"Well-documented in literature. Conservative estimates used.",refs:["R1","R2"],conf:"Moderate — study-level variation"},
      {label:"QALYs per death",value:"5 QALYs (conservative)",basis:"Remaining life-years × quality weight. Conservative value for peer review. US cost-effectiveness threshold: $100K–$150K/QALY.",refs:["R28"],conf:"Low — requires patient-level analysis for precision"},
    ]},
  ];

  const Row = (cells) => cells;
  const Tbl = ({rows,hdrs}) => (
    <div style={{overflowX:"auto",marginBottom:14}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{borderBottom:`2px solid ${C.border}`}}>{hdrs.map(h=><th key={h} style={{padding:"7px 11px",color:C.txt3,textTransform:"uppercase",fontSize:10,textAlign:"left",fontWeight:600,letterSpacing:"0.05em"}}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>{r.map((c,j)=><td key={j} style={{padding:"7px 11px",color:j===0?C.txt:C.txt2,fontSize:12,lineHeight:1.5}}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:18,background:C.bg,padding:"3px",borderRadius:8,border:`1px solid ${C.border}`,width:"fit-content"}}>
        {[["assumptions","Assumptions"],["methods","Methods & Formula"],["references","All References"]].map(([id,label])=>(
          <button key={id} onClick={()=>setDocSec(id)}
            style={{padding:"6px 14px",borderRadius:6,cursor:"pointer",background:docSec===id?C.s0:"transparent",border:docSec===id?`1px solid ${C.border}`:"1px solid transparent",color:docSec===id?C.txt:C.txt3,fontFamily:FONT_BODY,fontSize:12,fontWeight:docSec===id?600:500}}>
            {label}
          </button>
        ))}
      </div>

      {docSec==="assumptions" && (
        <div>
          {assumptions.map(s=>(
            <div key={s.cat} style={{marginBottom:22}}>
              <div style={{fontSize:10,fontWeight:700,color:C.teal,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10,paddingBottom:7,borderBottom:`2px solid ${C.tealPale}`}}>{s.cat}</div>
              {s.items.map(item=>(
                <div key={item.label} style={{marginBottom:9,padding:"12px 14px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                    <div style={{fontSize:13,color:C.txt,fontWeight:700,flex:1}}>{item.label}</div>
                    <div style={{fontSize:11,color:C.teal,fontWeight:600,marginLeft:14,textAlign:"right",flexShrink:0}}>{item.value}</div>
                  </div>
                  <div style={{fontSize:12,color:C.txt2,marginBottom:7,lineHeight:1.6}}>{item.basis}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                    {item.refs.map(r=>(
                      <button key={r} onClick={()=>setOpenRef(openRef===r?null:r)}
                        style={{padding:"2px 7px",fontSize:10,borderRadius:4,cursor:"pointer",border:`1px solid ${openRef===r?C.teal:C.border}`,background:openRef===r?C.tealXp:C.bg,color:openRef===r?C.teal:C.txt3,fontFamily:FONT_MONO,fontWeight:600}}>
                        {REFS[r]?.tag||r}
                      </button>
                    ))}
                    {item.conf&&<span style={{fontSize:10,color:C.txt3,marginLeft:"auto"}}>Confidence: {item.conf}</span>}
                  </div>
                  {item.refs.includes(openRef)&&REFS[openRef]&&(
                    <div style={{marginTop:9,padding:"10px 13px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:6}}>
                      <div style={{fontSize:11,color:C.teal,fontWeight:700,marginBottom:2}}>[{REFS[openRef].id}] {REFS[openRef].tag} · {REFS[openRef].org} ({REFS[openRef].year})</div>
                      <div style={{fontSize:11,color:C.txt2,marginBottom:3}}>{REFS[openRef].title}</div>
                      <div style={{fontSize:10,color:C.txt2,marginBottom:5,lineHeight:1.4}}>{REFS[openRef].note}</div>
                      <a href={REFS[openRef].url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.teal2,wordBreak:"break-all"}}>{REFS[openRef].url}</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div style={{padding:"12px 14px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:11,color:"#92400e",lineHeight:1.6}}>
            <strong>Key limitations:</strong> HACRP modeled continuously (real threshold binary). Detection rates expert-derived, not from prospective RCTs. TRANS_FRAC from single-center WGS studies. pFrac (cluster interruption) has no prospective RCT validation. Conventional detection rate based on comparative WGS literature, not direct measurement.
          </div>
        </div>
      )}

      {docSec==="methods" && (
        <div style={{maxWidth:820}}>
          <div style={{padding:"16px 20px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:10,marginBottom:22}}>
            <Tag text="CHEERS 2022" color={C.teal}/>{" "}<Tag text="ISPOR-SMDM 2012" color={C.teal}/>
            <div style={{fontSize:16,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY,margin:"7px 0 8px"}}>Methods, Formula & Cost Basis</div>
            <p style={{fontSize:12,color:C.txt2,lineHeight:1.7,margin:0}}>
              Static decision-analytic cost-benefit analysis from the <strong>hospital perspective</strong> following CHEERS 2022 <Tag text="R21" color={C.teal}/> and ISPOR-SMDM 2012 <Tag text="R22" color={C.teal}/>. Comparator: conventional epi with no molecular typing. All costs 2024 USD. 1-year horizon. No discounting.
            </p>
          </div>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:11,fontWeight:700,color:C.teal,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>1 · Model Structure</div>
            <Tbl rows={[
              Row(["Model type","Static decision-analytic CBA"]),
              Row(["Perspective","Hospital (institutional) — direct inpatient costs only"]),
              Row(["Comparator","Conventional IPC: clinical epi + manual contact tracing, no molecular typing"]),
              Row(["Time horizon","1 year (no discounting required)"]),
              Row(["Currency","2024 USD (CPI Medical Care Services, 2015→2024, +29%)"]),
              Row(["Cost concept",useVar?"Variable (avoidable) costs — active":"Total attributable costs — active (default)"]),
              Row(["Uncertainty","PSA: 12-parameter Monte Carlo; Deterministic: tornado diagram (one-way)"]),
            ]} hdrs={["Parameter","Value"]}/>
          </div>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:11,fontWeight:700,color:C.teal,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>2 · Core Formula</div>
            <div style={{padding:"12px 14px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:8,fontSize:12,color:C.txt,marginBottom:10,lineHeight:1.8}}>
              <strong>HAIs_prevented[m]</strong> = Σ annual_HAI[t] × TRANS_FRAC[t] × pFrac × detRate[m] × (1 − lagFrac[m])<br/>
              <strong>lagFrac[m]</strong> = min(interventionLag[m] × TATscale / avgCluster, 0.85)<br/>
              <strong>Net value[m]</strong> = (HAIs_prev[m] × costPerHAI + HACRP_savings[m]) − cost_to_hospital[m]<br/>
              <strong>ICER[m]</strong> = cost_to_hospital[m] / (HAIs_prev[m] − HAIs_prev[conventional])
            </div>
            <Tbl rows={[
              Row(["M1 Full Surveillance","90% (PSA ±5%)","1.5 × TATscale","Real-time with environmental layer"]),
              Row(["M2 Prospective Clinical","73% (PSA ±8%)","2.5 × TATscale","Real-time clinical only"]),
              Row(["M3 Semi-Prospective","40% (fixed)","5.0","Suspicion-triggered; no prior context"]),
              Row(["M4 Retrospective","20% (fixed)","8.0 → capped","Forensic; uses reservoir ID rate parameter"]),
              Row(["Conventional (comparator)","7% (PSA ±3%)","8.0 → capped","No typing; manual epi only"]),
            ]} hdrs={["Model","Detection Rate","Lag Cases","Notes"]}/>
          </div>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:11,fontWeight:700,color:C.teal,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>3 · HAI Cost Basis (2024 USD)</div>
            <Tbl rows={[
              Row(["CLABSI",`$${Math.round(48108*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.clabsi.toLocaleString()}`,"R1, R27"]),
              Row(["CAUTI", `$${Math.round(13793*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.cauti.toLocaleString()}`,"R1, R27"]),
              Row(["CDI",   `$${Math.round(17000*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.cdi.toLocaleString()}`,"R3, R4"]),
              Row(["MRSA",  `$${Math.round(42000*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.mrsa.toLocaleString()}`,"R2"]),
              Row(["VAE",   `$${Math.round(32000*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.vae.toLocaleString()}`,"R1"]),
              Row(["SSI",   `$${Math.round(21000*CPI_2015_TO_2024).toLocaleString()}`,`$${activeCosts.ssi.toLocaleString()}`,"R2, R7"]),
            ]} hdrs={["HAI Type","Total 2024$","Active","Sources"]}/>
          </div>
          <div style={{padding:"12px 14px",background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,fontSize:11,color:"#78350f",lineHeight:1.5}}>
            <strong>Disclosure:</strong> Developed by Prospect Genomics. Not independently peer-reviewed. Directional estimates — not precise financial projections. COI: authors are employees of the company selling the described service.
          </div>
        </div>
      )}

      {docSec==="references" && (
        <div>
          {Object.values(REFS).map(ref=>(
            <div key={ref.id} style={{marginBottom:7,padding:"10px 13px",background:C.s0,border:`1px solid ${C.border}`,borderRadius:7}}>
              <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                <span style={{fontSize:10,color:C.teal,fontFamily:FONT_MONO,fontWeight:700,flexShrink:0,minWidth:26}}>[{ref.id}]</span>
                <div>
                  <div style={{fontSize:12,color:C.txt,marginBottom:2,fontWeight:700}}>{ref.tag} · <span style={{color:C.txt2,fontWeight:400}}>{ref.org} ({ref.year})</span></div>
                  <div style={{fontSize:11,color:C.txt2,marginBottom:3}}>{ref.title}</div>
                  <div style={{fontSize:10,color:C.txt3,marginBottom:4,lineHeight:1.4}}>{ref.note}</div>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.teal2,wordBreak:"break-all",textDecoration:"none"}}>{ref.url}</a>
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
  const [showQALY,    setShowQALY]    = useState(false);
  const [openSec,     setOpenSec]     = useState({profile:true,hais:true,cultures:false,assumptions:true,advanced:false});

  // Advanced parameters (all user-adjustable)
  const [adv, setAdv] = useState({
    convDetRate:    0.07,
    avgCluster:     5,
    hacExpFrac:     0.40,
    m4ReservoirRate:0.55,
    detRates:{m1:0.90,m2:0.73,m3:0.40,m4:0.20},
  });
  const setAdvField = (k,v)    => setAdv(p=>({...p,[k]:v}));
  const setDetRate  = (m,v)    => setAdv(p=>({...p,detRates:{...p.detRates,[m]:v}}));

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
  const toggleSec  = k => setOpenSec(s=>({...s,[k]:!s[k]}));

  const {data:allData,totalHAIs,convData} = useMemo(
    ()=>runAll(hospital,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx,adv),
    [hospital,pFrac,subFee,adHocPrice,incSSI,useVar,tatIdx,adv]
  );
  const costTable = useVar?HAI_COSTS_VARIABLE:HAI_COSTS_TOTAL;
  const medRev    = hospital.totalRevenueMn*1e6*hospital.medicareRevenuePct;

  const TABS=[
    ["overview","Overview"],["breakdown","HAI Breakdown"],
    ["pricing","Sub vs. Ad Hoc"],["psa","PSA & Sensitivity"],["docs","Documentation"],
  ];
  const card={background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 20px"};

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT_BODY,color:C.txt}}>
      {/* Header */}
      <div style={{background:C.s0,borderBottom:`1px solid ${C.border}`,padding:"11px 22px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1220,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:26,height:26,background:C.teal,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:C.s0,fontSize:14,fontWeight:800}}>P</span>
            </div>
            <div>
              <div style={{fontSize:10,color:C.teal,fontWeight:700}}>Prospect Genomics</div>
              <div style={{fontSize:16,fontWeight:700,color:C.txt,fontFamily:FONT_DISPLAY,lineHeight:1.1}}>HAI Prevention Value Calculator</div>
            </div>
          </div>
          <div style={{fontSize:11,color:C.txt3}}>prospectgenomics.bio</div>
        </div>
      </div>

      <div style={{maxWidth:1220,margin:"0 auto",padding:"18px 22px 60px",display:"flex",gap:18,alignItems:"flex-start"}}>

        {/* ── SIDEBAR ── */}
        <div style={{width:290,flexShrink:0,background:C.s0,border:`1px solid ${C.border}`,borderRadius:10,position:"sticky",top:56,maxHeight:"calc(100vh - 72px)",overflowY:"auto"}}>

          {/* Benchmark quick-fill */}
          <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,fontWeight:700,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:7}}>Benchmark Hospital</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {HOSPITAL_SIZES.map((h,i)=>(
                <button key={h.id} onClick={()=>applyBench(i)}
                  style={{padding:"7px 9px",borderRadius:6,cursor:"pointer",border:`1px solid ${benchIdx===i?C.teal:C.border}`,background:benchIdx===i?C.tealXp:C.bg,color:benchIdx===i?C.teal:C.txt2,fontFamily:FONT_BODY,fontSize:11,fontWeight:benchIdx===i?700:500,textAlign:"left"}}>
                  <div style={{fontFamily:FONT_DISPLAY,fontSize:12,marginBottom:1}}>{h.label}</div>
                  <div style={{fontSize:9,opacity:0.7}}>{h.beds}</div>
                </button>
              ))}
            </div>
            {benchIdx===null&&<div style={{marginTop:5,fontSize:9,color:C.amber}}>Custom data</div>}
          </div>

          {/* Hospital Profile */}
          <SecHeader title="Hospital Profile" open={openSec.profile} onToggle={()=>toggleSec("profile")}/>
          {openSec.profile&&(
            <div style={{padding:"10px 14px"}}>
              <div style={{marginBottom:9}}>
                <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2,fontWeight:600}}>Hospital Name</div>
                <input type="text" value={hospital.name||""} onChange={e=>setField("name",e.target.value)} placeholder="e.g. Valley Medical Center"
                  style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,padding:"5px 7px",color:C.txt,fontFamily:FONT_BODY,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <SInput label="Total Revenue ($M)" value={hospital.totalRevenueMn} onChange={v=>setField("totalRevenueMn",v)} min={1}/>
              <Slider label="Medicare Revenue %" value={hospital.medicareRevenuePct} min={0.10} max={0.45} step={0.01}
                onChange={v=>setField("medicareRevenuePct",v)} format={pct} hint="Typical 19–28% for acute care (R17)"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <SInput label="Admissions/yr" value={hospital.admissionsPerYear} onChange={v=>setField("admissionsPerYear",v)}/>
                <SInput label="Patient-days/yr" value={hospital.patientDaysPerYear} onChange={v=>setField("patientDaysPerYear",v)}/>
                <SInput label="Surgical procedures" value={hospital.surgicalProcedures||0} onChange={v=>setField("surgicalProcedures",v)}/>
              </div>
              <div style={{padding:"8px 10px",background:C.tealXp,border:`1px solid ${C.tealPale}`,borderRadius:7,marginTop:6}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[["Medicare rev.",fm(medRev)],["Max HACRP",fm(medRev*0.01)],["Total HAIs",totalHAIs],["Conv. prev.",fn(convData.prev.total)]].map(([k,v])=>(
                    <div key={k}>
                      <div style={{fontSize:9,color:C.teal,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:1}}>{k}</div>
                      <div style={{fontSize:12,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HAI Counts */}
          <SecHeader title="HAI Counts" open={openSec.hais} onToggle={()=>toggleSec("hais")}/>
          {openSec.hais&&(
            <div style={{padding:"10px 14px"}}>
              <div style={{fontSize:10,color:C.txt3,marginBottom:8,lineHeight:1.4}}>Annual NHSN-reported events. Benchmark fill or enter your data.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {["clabsi","cauti","cdi","mrsa","vae","ssi"].map(t=>(
                  <SInput key={t} label={HAI_LABELS[t]} value={hospital.hais[t]||0} onChange={v=>setField(`hais.${t}`,v)}/>
                ))}
              </div>
            </div>
          )}

          {/* Culture Volumes */}
          <SecHeader title="Culture Volumes" open={openSec.cultures} onToggle={()=>toggleSec("cultures")}/>
          {openSec.cultures&&(
            <div style={{padding:"10px 14px"}}>
              <div style={{fontSize:10,color:C.txt3,marginBottom:8,lineHeight:1.4}}>Annual positive culture counts — sequencing denominator.</div>
              {Object.entries(CULTURE_LABELS).map(([key,label])=>(
                <SInput key={key} label={label} value={hospital.cultureVolumes[key]||0} onChange={v=>setField(`cultureVolumes.${key}`,v)}/>
              ))}
            </div>
          )}

          {/* Model Assumptions */}
          <SecHeader title="Model Assumptions" open={openSec.assumptions} onToggle={()=>toggleSec("assumptions")}/>
          {openSec.assumptions&&(
            <div style={{padding:"10px 14px 14px"}}>
              <Slider label="Cluster Interruption Rate (pFrac)" value={pFrac} min={0} max={1.0} step={0.05}
                onChange={setPFrac} format={pct} hint="% of WGS-identified clusters IP disrupts. Literature: 47–85% (R19). PSA samples around this value."/>
              <TATpicker tatIdx={tatIdx} setTatIdx={setTatIdx}/>
              <Slider label="Annual Subscription Fee" value={subFee} min={25000} max={300000} step={5000}
                onChange={setSubFee} format={v=>`$${(v/1000).toFixed(0)}K/yr`} hint="Flat fee to hospital — sequencing, analysis, software, support."/>
              <Slider label="Ad Hoc Price / Sample" value={adHocPrice} min={175} max={500} step={5}
                onChange={setAdHocPrice} format={v=>`$${v}/sample`} hint="Floor $175 (50% margin). Typical: $250–350."/>
              <Toggle on={incSSI} onClick={()=>setIncSSI(!incSSI)} labelOn="SSI Included" labelOff="SSI Excluded" note="Include wound cultures in sequencing volume"/>
              <Toggle on={showQALY} onClick={()=>setShowQALY(!showQALY)} labelOn="QALY Layer On" labelOff="QALY Layer Off" note="Show cost per QALY on model cards"/>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:4}}>
                <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,marginBottom:7}}>Cost Perspective</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                  {[["total","Total costs","Full attributable"],["variable","Variable costs","65% · conservative"]].map(([val,label,note])=>{
                    const active=(!useVar&&val==="total")||(useVar&&val==="variable");
                    return (
                      <button key={val} onClick={()=>setUseVar(val==="variable")}
                        style={{padding:"7px 9px",borderRadius:6,cursor:"pointer",border:`1px solid ${active?C.teal:C.border}`,background:active?C.tealXp:C.bg,color:active?C.teal:C.txt2,fontFamily:FONT_BODY,fontSize:10,fontWeight:600,textAlign:"left"}}>
                        <div style={{marginBottom:1}}>{label}</div>
                        <div style={{fontSize:9,opacity:0.7,fontWeight:400}}>{note}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Parameters */}
          <SecHeader title="Advanced Parameters" badge="peer review" open={openSec.advanced} onToggle={()=>toggleSec("advanced")}/>
          {openSec.advanced&&(
            <div style={{padding:"10px 14px 14px"}}>
              <div style={{fontSize:10,color:C.txt3,marginBottom:10,lineHeight:1.4}}>Expose all hardcoded assumptions for sensitivity analysis. All parameters appear in tornado diagram.</div>
              <div style={{fontSize:9,fontWeight:700,color:C.txt2,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7,marginTop:4}}>Comparator (Conventional Epi)</div>
              <Slider label="Conventional Detection Rate" value={adv.convDetRate} min={0.01} max={0.20} step={0.01}
                onChange={v=>setAdvField("convDetRate",v)} format={pct} hint="% of transmissible clusters detected by conventional epi (no typing). Default 7%."/>
              <div style={{fontSize:9,fontWeight:700,color:C.txt2,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7,marginTop:4}}>Cluster & Lag Model</div>
              <SInput label="Avg Cluster Size (cases)" value={adv.avgCluster} onChange={v=>setAdvField("avgCluster",Math.max(2,Math.min(12,v)))} min={2} max={12}/>
              <Slider label="M4 Reservoir ID Rate" value={adv.m4ReservoirRate} min={0.10} max={0.90} step={0.05}
                onChange={v=>setAdvField("m4ReservoirRate",v)} format={pct} hint="M4 only: % of retrospective outbreaks where WGS identifies persistent reservoir. Default 55% (Bhargava 2021, R13)."/>
              <div style={{fontSize:9,fontWeight:700,color:C.txt2,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7,marginTop:4}}>HACRP Model</div>
              <Slider label="HACRP Baseline Exposure" value={adv.hacExpFrac} min={0.10} max={0.80} step={0.05}
                onChange={v=>setAdvField("hacExpFrac",v)} format={pct} hint="Fraction of max penalty hospitals are exposed to at baseline. Default 40%. Binary in reality — modeled continuously."/>
              <div style={{fontSize:9,fontWeight:700,color:C.txt2,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7,marginTop:4}}>Detection Rates by Model</div>
              {MODELS.map(m=>(
                <Slider key={m.id} label={`${m.label} Detection Rate`} value={adv.detRates[m.id]} min={0.05} max={1.0} step={0.05}
                  onChange={v=>setDetRate(m.id,v)} format={pct}/>
              ))}
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{flex:1,minWidth:0}}>
          {/* Tab bar */}
          <div style={{display:"flex",gap:3,marginBottom:16,flexWrap:"wrap",background:C.s0,padding:"4px",borderRadius:8,border:`1px solid ${C.border}`,width:"fit-content"}}>
            {TABS.map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)}
                style={{padding:"7px 14px",borderRadius:6,cursor:"pointer",background:tab===id?C.teal:"transparent",border:"none",color:tab===id?C.s0:C.txt3,fontFamily:FONT_BODY,fontSize:12,fontWeight:tab===id?600:500,transition:"all 0.1s"}}>
                {label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab==="overview"&&(
            <div>
              <ModelOverview/>
              <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:10,color:C.txt3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Pricing</span>
                {[["sub",`Subscription · ${fm(subFee)}/yr`],["adhoc",`Ad hoc · $${adHocPrice}/sample`]].map(([mode,label])=>(
                  <button key={mode} onClick={()=>setPricingMode(mode)}
                    style={{padding:"5px 14px",borderRadius:6,cursor:"pointer",border:`1px solid ${pricingMode===mode?C.teal:C.border}`,background:pricingMode===mode?C.tealXp:C.s0,color:pricingMode===mode?C.teal:C.txt3,fontFamily:FONT_BODY,fontSize:12,fontWeight:pricingMode===mode?700:500}}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {MODELS.map(m=><ModelCard key={m.id} model={m} data={allData[m.id]} pricingMode={pricingMode} showQALY={showQALY}/>)}
              </div>
              <div style={{marginTop:14,padding:"12px 16px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11,color:C.txt3}}>
                <strong style={{color:C.txt2}}>Conventional baseline</strong> (no typing): {fn(convData.prev.total)} HAIs prevented/yr · cost to hospital: $0 incremental · HACRP savings: {fm(convData.hacrp.saved)} · <strong>ICER = WGS cost ÷ incremental HAIs prevented vs. conventional</strong>
              </div>
            </div>
          )}

          {/* ── BREAKDOWN ── */}
          {tab==="breakdown"&&(
            <div>
              <div style={{...card,marginBottom:14,padding:0,overflow:"hidden"}}>
                <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.txt}}>HAIs prevented per year{incSSI?" · SSI included":""}</div>
                  <div style={{fontSize:10,color:C.txt3}}>Edit HAI counts in sidebar · {useVar?"Variable (65%)":"Total attributable"} costs</div>
                </div>
                <BreakdownTable models={MODELS} allData={allData} incSSI={incSSI} costTable={costTable}/>
              </div>
              <div style={card}>
                <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:14}}>HACRP Penalty Exposure · Max {fm(medRev*0.01)}/yr</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                  {MODELS.map(m=>{const d=allData[m.id].hacrp; return (
                    <div key={m.id}>
                      <div style={{fontSize:10,color:m.color,marginBottom:9,fontWeight:700}}>{m.label} · {m.name}</div>
                      {[["Baseline",fm(d.baselineExposure),C.txt2],["After WGS",fm(d.reducedExposure),m.color],["Savings","+"+fm(d.saved),C.green]].map(([k,v,c])=>(
                        <div key={k} style={{marginBottom:7}}>
                          <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:1}}>{k}</div>
                          <div style={{fontSize:13,color:c,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  );})}
                </div>
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {tab==="pricing"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div style={card}>
                  <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:12}}>Subscription Pricing</div>
                  <div style={{fontSize:22,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums",marginBottom:4}}>${(subFee/1000).toFixed(0)}K/yr</div>
                  <div style={{fontSize:11,color:C.txt3,marginBottom:12}}>Flat annual fee · adjust in sidebar</div>
                  <div style={{fontSize:12,color:C.txt2,lineHeight:1.6}}>Includes all sequencing, analysis, continuous monitoring, IP support, and Prospect platform access.</div>
                </div>
                <div style={card}>
                  <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:12}}>Ad Hoc Pricing</div>
                  <div style={{fontSize:22,fontWeight:700,color:C.teal,fontVariantNumeric:"tabular-nums",marginBottom:4}}>${adHocPrice}/sample</div>
                  <div style={{fontSize:11,color:C.txt3,marginBottom:12}}>Per-sample · floor $175 · adjust in sidebar</div>
                  <div style={{fontSize:12,color:C.txt2,lineHeight:1.6}}>Breakeven vs. subscription at {Math.round(subFee/adHocPrice).toLocaleString()} samples/yr. No software or IP support included.</div>
                </div>
              </div>
              <div style={{...card,marginBottom:14,padding:0,overflow:"hidden"}}>
                <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.txt}}>Cost to Hospital by Model</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr style={{borderBottom:`2px solid ${C.border}`}}>
                      {["Model","Seqs/yr","Subscription","Ad hoc cost","Sub net value","Ad hoc net value","ICER (Sub)","Better option"].map((h,i)=>(
                        <th key={h} style={{padding:"9px 12px",textAlign:i===0?"left":"right",color:C.txt3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",fontSize:9}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {MODELS.map((m,i)=>{const d=allData[m.id]; const sb=d.netValueSub>=d.netValueAdHoc; return (
                        <tr key={m.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:"transparent"}}>
                          <td style={{padding:"9px 12px",fontWeight:700,color:m.color,fontSize:12}}>{m.label} · {m.name}</td>
                          <td style={{padding:"9px 12px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:C.txt2,fontSize:12}}>{fn(d.seqs)}</td>
                          <td style={{padding:"9px 12px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:C.txt2,fontSize:12}}>{fm(d.programCostSub)}</td>
                          <td style={{padding:"9px 12px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:C.txt2,fontSize:12}}>{fm(d.programCostAdHoc)}</td>
                          <td style={{padding:"9px 12px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:d.netValueSub>0?C.teal:C.red,fontWeight:700,fontSize:12}}>{d.netValueSub>0?"+":""}{fm(d.netValueSub)}</td>
                          <td style={{padding:"9px 12px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:d.netValueAdHoc>0?C.teal:C.red,fontWeight:700,fontSize:12}}>{d.netValueAdHoc>0?"+":""}{fm(d.netValueAdHoc)}</td>
                          <td style={{padding:"9px 12px",fontVariantNumeric:"tabular-nums",textAlign:"right",color:C.txt2,fontSize:12}}>{d.icerSub!=null?fm(d.icerSub)+"/HAI":"—"}</td>
                          <td style={{padding:"9px 12px",textAlign:"right"}}>
                            <span style={{fontSize:10,fontWeight:700,color:sb?C.teal:C.amber,background:sb?C.tealXp:"#fef3c7",border:`1px solid ${sb?C.tealPale:"#fde68a"}`,borderRadius:5,padding:"2px 8px"}}>
                              {sb?"Subscription":"Ad hoc"}
                            </span>
                          </td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={card}>
                <div style={{fontSize:10,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:700,marginBottom:10}}>Crossover Analysis</div>
                <div style={{fontSize:12,color:C.txt2,marginBottom:14,lineHeight:1.6}}>
                  Subscription beats ad hoc when <strong style={{color:C.teal}}>seqs/yr &gt; {Math.round(subFee/adHocPrice).toLocaleString()}</strong> (${(subFee/1000).toFixed(0)}K ÷ ${adHocPrice}/sample). Subscription also includes analysis platform and IP support not available ad hoc.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                  {MODELS.map(m=>{const d=allData[m.id]; const co=Math.round(subFee/adHocPrice); const sw=d.seqs>=co; const delta=d.netValueSub-d.netValueAdHoc; return (
                    <div key={m.id} style={{background:sw?C.tealXp:C.bg,border:`1px solid ${sw?C.tealPale:C.border}`,borderRadius:8,padding:"12px"}}>
                      <div style={{fontSize:10,color:m.color,fontWeight:700,marginBottom:9}}>{m.label} · {m.name}</div>
                      {[["Seqs/yr",fn(d.seqs)],["Crossover",`${co.toLocaleString()} seqs`],["Δ Sub vs AH",(delta>=0?"+":"")+fm(delta)],["Best",sw?"Subscription":"Ad hoc"]].map(([k,v])=>(
                        <div key={k} style={{marginBottom:6}}>
                          <div style={{fontSize:9,color:C.txt3,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:1}}>{k}</div>
                          <div style={{fontSize:12,fontWeight:700,color:k==="Best"?(sw?C.teal:C.amber):C.txt,fontVariantNumeric:"tabular-nums"}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  );})}
                </div>
              </div>
            </div>
          )}

          {/* ── PSA & SENSITIVITY ── */}
          {tab==="psa"&&(
            <PSATab hospital={hospital} pFrac={pFrac} subFee={subFee} adHocPrice={adHocPrice}
              incSSI={incSSI} useVar={useVar} tatIdx={tatIdx} adv={adv}
              pricingMode={pricingMode} setPricingMode={setPricingMode}/>
          )}

          {/* ── DOCUMENTATION ── */}
          {tab==="docs"&&<DocumentationTab useVar={useVar}/>}
        </div>
      </div>
    </div>
  );
}

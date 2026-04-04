# Genomic Surveillance Value Analysis

**Prospect Genomics** — Sales tool for hospital buyer conversations

Live at: **[prospectgenomics.github.io/hai-roi-model](https://prospectgenomics.github.io/hai-roi-model/)**

An interactive value calculator for hospital IP directors, CFOs, and quality leaders evaluating whole-genome sequencing (WGS) surveillance. Designed for use in live conversations — enter the hospital's data during the meeting and leave behind the URL.

---

## What it shows

- **Four surveillance program levels** — from real-time continuous surveillance down to outbreak-response-only — each with a plain-English description
- **Annual value to the hospital** — infections prevented, direct cost savings, and Medicare quality penalty protection
- **Detection advantage** — visual comparison of how early each program level identifies a transmission cluster
- **Investment & ROI** — hidden by default, revealed via toggle when the conversation is ready for it

## How to use it in a meeting

1. Open the URL on your laptop
2. Enter the hospital's name and select their size (or edit HAI counts manually)
3. Walk through the four program levels — the numbers update live
4. When ready to discuss pricing, flip the "Show investment & ROI" toggle and enter the proposed subscription fee
5. Share the URL as a leave-behind

---

## Running locally

```bash
git clone https://github.com/prospectgenomics/hai-roi-model.git
cd hai-roi-model
npm install
npm start
```

Any push to `main` auto-deploys to GitHub Pages via GitHub Actions (~2 min).

---

## Technical methodology

This tool uses the same decision-analytic cost-benefit model as the full technical tool:

- **Cost basis:** AHRQ 2017 meta-analysis, inflated to 2024 USD (+29% CPI Medical Care Services)
- **Perspective:** Hospital financial only — direct inpatient costs
- **Parameters fixed at defaults:** pFrac = 75%, avg cluster size = 5, HACRP baseline exposure = 40%
- **Full technical model** with probabilistic sensitivity analysis, ICER, and tornado diagram: see private repo `hai-roi-model-technical`

---

*© Prospect Genomics · [prospectgenomics.bio](https://prospectgenomics.bio) · shawn@prospectgenomics.bio*

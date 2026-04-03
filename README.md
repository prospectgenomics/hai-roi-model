# HAI Prevention Value Calculator

**Prospect Genomics** — WGS Surveillance ROI Model v2.1

An interactive decision-analytic tool estimating the annual net financial value of whole-genome sequencing (WGS) surveillance programs for hospital infection prevention teams. Built for IP directors, hospital epidemiologists, and CFOs evaluating genomic surveillance investment.

---

## What it does

Compares four WGS surveillance intensity levels across four hospital size tiers:

| Model | Description |
|---|---|
| **Model 1 – Full Surveillance** | All positive cultures + environmental sampling in high-risk units |
| **Model 2 – Prospective Clinical** | All positive clinical cultures sequenced in real time |
| **Model 3 – Semi-Prospective** | Sequencing triggered when IP suspects a cluster |
| **Model 4 – Retrospective Only** | Forensic sequencing after formal outbreak declaration |

Outputs: HAIs prevented per year, cost avoided (variable or total), HACRP Medicare penalty savings, net ROI, sequences/year, cost per HAI prevented.

**Scope note:** The model covers only NHSN-tracked HAIs (CLABSI, CAUTI, CDI, MRSA bacteremia, VAE, SSI) prevented by genomically detecting cross-transmission. It does not model the additional value of WGS ruling *out* transmission — e.g., instituting precautions when transmission is not actually occuring, screening, additional cleaning/device reprocessing, avoiding unnecessary OR closures or unit cohortings when isolates prove unrelated. This represents additional ROI not captured here-- the results of these models should therefore be considered a floor estimate of the ROI genomic epidemiology brings to healthcare IPC.

---

## Methodology highlights

- **Cost basis:** AHRQ 2017 meta-analysis (hospital perspective, incremental costs)
- **Inflation:** CPI Medical Care Services index, 2015→2024 (+29%) per Dunn 2018
- **Default cost type:** Variable/avoidable costs (~65% of total) per Graves 2007 — the correct denominator for prevention ROI
- **Reporting standard:** CHEERS 2022 (ISPOR), ISPOR-SMDM modeling best practices
- **References** — all with live links in the Methods & References tab

---

## Running locally

**Requirements:** Node.js 18 or higher ([download](https://nodejs.org/))

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/hai-roi-model.git
cd hai-roi-model

# 2. Install dependencies
npm install

# 3. Start development server
npm start
# Opens automatically at http://localhost:3000
```

---

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

### One-time setup (5 minutes)

1. **Push this repo to GitHub** under your account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/hai-roi-model.git
   git push -u origin main
   ```

2. **Enable GitHub Pages** in your repo:
   - Go to your repo on GitHub → **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Click **Save**

3. **That's it.** GitHub will automatically build and deploy on every push. Your coworker can access the live app at:
   ```
   https://YOUR_USERNAME.github.io/hai-roi-model/
   ```

### Subsequent updates

Any `git push` to `main` will trigger an automatic redeploy (takes ~2 minutes).

---

## Sharing privately

If you want this visible only to your team, make the repository **private** on GitHub. GitHub Pages will still work for private repos on paid plans. Alternatively, share the built files directly:

```bash
npm run build
# Compress the build/ folder and send it — open index.html in any browser
```

---

## File structure

```
hai-roi-model/
├── src/
│   ├── App.js          # Entire application — all logic, data, and UI
│   └── index.js        # React entry point
├── public/
│   └── index.html      # HTML shell (loads Google Fonts: DM Sans, Instrument Serif)
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions auto-deploy to Pages
├── package.json
└── README.md
```

The entire model lives in `src/App.js`. No external data files or API calls.

---

## Customizing assumptions

All model parameters are constants at the top of `src/App.js`:

| Constant | What it controls |
|---|---|
| `HOSPITAL_SIZES` | Benchmark HAI counts, culture volumes, revenue by bed size |
| `HAI_COSTS_TOTAL` | Per-infection cost estimates (2024 USD, pre-variable-cost adjustment) |
| `TRANS_FRAC` | Transmissible fraction by HAI type |
| `MODELS` | Detection rates and intervention lags per surveillance model |
| `CPI_2015_TO_2024` | Inflation adjustment factor |
| `VARIABLE_FRAC` | Variable cost fraction (default 0.65) |
| `AVG_CLUSTER_SIZE` | Average HAI cluster size used in lag fraction calculation |

---

## Version history

- **v2.1** — Brand redesign (Prospect Genomics colors/fonts). Fixed intervention lag bug (was incorrectly scaling by annual HAI rate instead of fixed cluster size, suppressing CLABSI/MRSA ROI). Added variable vs. total cost toggle. Added scope statement re: non-modeled intervention costs. Added Methods & References tab with full methodology documentation.
- **v2.0** — Added inflation adjustment, CHEERS 2022 compliance, 28 references, custom hospital data entry tab.
- **v1.0** — Initial model with benchmark tiers.

---

*© Prospect Genomics · [prospectgenomics.bio](https://prospectgenomics.bio)*

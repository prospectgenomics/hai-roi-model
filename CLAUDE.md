# CLAUDE.md — HAI Prevention Value Calculator
## Project Brief for Claude Code

This file gives you full context to work on this project without needing prior conversation history.

---

## What this is

A React single-page app hosted on GitHub Pages at:
**https://prospectgenomics.github.io/hai-roi-model/**

It's a decision-analytic cost-benefit model for hospital IP teams evaluating WGS surveillance investment. Built by Prospect Genomics (prospectgenomics.bio). The entire app is one file: `src/App.js` (~900 lines).

---

## Repo structure

```
hai-roi-model/
├── src/
│   ├── App.js          ← ENTIRE APPLICATION — all logic, data, UI, references
│   └── index.js        ← React entry point (do not modify)
├── public/
│   └── index.html      ← loads Google Fonts: DM Sans + Instrument Serif (do not modify)
├── .github/
│   └── workflows/
│       └── deploy.yml  ← auto-deploys to GitHub Pages on every push to main
├── package.json        ← homepage: "." — required for GitHub Pages asset paths
├── CLAUDE.md           ← this file
└── README.md
```

---

## App.js structure (in order)

1. **Brand constants** (`C` object) — all colors from prospectgenomics.bio design system
2. **Font constants** — `FONT_BODY`, `FONT_DISPLAY`, `FONT_MONO`
3. **`REFS` object** — 28 peer-reviewed references, keyed R1–R28
4. **`HOSPITAL_SIZES` array** — 4 benchmark hospital tiers (Small/Medium/Large/Academic)
5. **Cost constants** — `HAI_COSTS_TOTAL`, `HAI_COSTS_VARIABLE`, inflation factors
6. **`TRANS_FRAC`** — transmissible fraction by HAI type
7. **`MODELS` array** — 4 WGS surveillance intensity levels
8. **Math functions** — `calcSeqs`, `calcPrevented`, `calcCosts`, `calcHACRP`, `runAll`
9. **UI components** — `Slider`, `NumInput`, `Tag`, `ScopeNotice`
10. **`ModelCard`** — individual model result card
11. **`BreakdownTable`** — HAI breakdown table (requires `costTable` prop)
12. **`CustomTab`** — 5-step custom hospital data entry wizard
13. **`AssumptionsTab`** — expandable assumptions with reference popups
14. **`MethodsTab`** — full methodology documentation + all 28 references
15. **`App`** — main component, all state, layout, tab routing

---

## Design system (must match prospectgenomics.bio exactly)

```js
// Key colors
C.teal      = "#1a6b5e"   // primary — buttons, accents, links
C.teal2     = "#228574"   // hover states
C.teal3     = "#2da08c"   // lighter accent
C.tealPale  = "#e6f2ef"   // backgrounds for highlight blocks
C.tealXp    = "#f2faf8"   // very light teal bg
C.txt       = "#0f1117"   // primary text
C.txt2      = "#4b5563"   // secondary text
C.txt3      = "#9ca3af"   // muted/label text
C.bg        = "#f6f8fa"   // page background
C.s0        = "#ffffff"   // card background
C.border    = "#e1e5ea"   // card borders
C.green     = "#16a34a"   // positive values
C.red       = "#dc2626"   // negative values / errors
C.amber     = "#d97706"   // warnings

// Fonts
FONT_BODY    = "'DM Sans', system-ui, sans-serif"
FONT_DISPLAY = "'Instrument Serif', Georgia, serif"  // headings, card titles
FONT_MONO    = "'DM Mono', 'SF Mono', monospace"     // numbers, tags, refs
```

---

## Key methodology decisions (do not change without updating references)

- **Cost basis**: AHRQ 2017 meta-analysis (R1) — hospital perspective, 2015 USD
- **Inflation**: CPI Medical Care Services 2015→2024, factor = 1.29 (R23, R26)
- **Variable cost fraction**: 0.65 of total (Graves 2007, R25) — default ON
- **Intervention lag**: Fixed avg cluster size = 5 (R13, R19) — NOT annual HAI rate
  - This was a bug in earlier versions that suppressed CLABSI/MRSA ROI — do not revert
- **Perspective**: Hospital only — no societal, readmission, or indirect costs
- **Time horizon**: 1 year, no discounting
- **Reporting standard**: CHEERS 2022 (R21), ISPOR-SMDM 2012 (R22)

---

## Tabs

| Tab ID | Component | Description |
|--------|-----------|-------------|
| `overview` | inline | 4 ModelCards in 2×2 grid |
| `breakdown` | `BreakdownTable` | HAI breakdown + HACRP table |
| `pricing` | inline | Net value bars + subscription vs. ad hoc |
| `custom` | `CustomTab` | 5-step custom hospital wizard |
| `assumptions` | `AssumptionsTab` | Expandable assumptions with ref popups |
| `methods` | `MethodsTab` | Full methodology + all 28 references |

---

## State (in App component)

```js
hIdx          // 0-3, index into HOSPITAL_SIZES
pFrac         // 0.15–0.65, preventable fraction (default 0.35)
seqCost       // $30–175, cost per genome (default $62)
incSSI        // bool, include SSI in model (default false)
useVar        // bool, use variable costs (default true — best practice)
tab           // string, active tab ID
```

---

## How to add a new HAI type

1. Add to `HAI_COSTS_TOTAL` and `HAI_COSTS_VARIABLE`
2. Add to `TRANS_FRAC`
3. Add to `HAI_LABELS`
4. Add to each entry in `HOSPITAL_SIZES` (both `cultureVolumes` and `hais`)
5. Add source reference to `REFS` if needed
6. Add to the `srcRefs` object in `BreakdownTable`

## How to update a cost assumption

1. Change the base value in `HAI_COSTS_TOTAL` (keep in 2015 USD and apply `CPI_2015_TO_2024`, OR use a 2024 source directly and note it)
2. Update the corresponding entry in `REFS`
3. Update the note in `AssumptionsTab` sections array
4. Update the cost table in `MethodsTab` section 2

## How to add a new reference

Add to the `REFS` object following this pattern:
```js
R29: { id:"R29", tag:"Author Year", url:"https://...", title:"Full title", org:"Journal / Org", year:2024, note:"Key finding and relevance to model." }
```
Then reference it as `<Tag text="R29" color={C.teal}/>` anywhere in the UI.

---

## Deployment

Every `git push` to `main` triggers GitHub Actions → builds React → deploys to Pages.
Build must pass ESLint with `CI=true` (warnings treated as errors).

**Common lint traps:**
- Unused variables (`no-unused-vars`) — if you declare a const, use it or remove it
- The `costTable` variable: it must be passed as a prop to `BreakdownTable` AND used inside it — both sides required

To deploy after changes:
```bash
git add -A
git commit -m "describe your change"
git push
```

---

## Planned future work

- [ ] **PDF export** — "Export Results" button on Overview tab generating a 1-page handout with the 4 model cards, hospital profile, key assumptions, and Prospect Genomics branding. Suggested library: `@react-pdf/renderer` or `jsPDF` + `html2canvas`. Should match the app's visual design.
- [ ] Sensitivity analysis tab (tornado chart showing net value vs. key assumptions)
- [ ] Updated HAI cost inputs if AHRQ releases post-2017 meta-analysis
- [ ] NTM / Candida auris as optional HAI types

---

## Owner

Shawn Hawken, Co-Founder & CEO, Prospect Genomics
shawn@prospectgenomics.bio

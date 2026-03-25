# AyurNexis 3.1

## Current State
- Dark herbal-tech theme (dark greens, gold accents) throughout index.css, App.tsx, and all pages
- Pages: Dashboard, Raw Material Intake, Batch Records, Quality Analysis, Predictions, Reports, Config, User Manual, Formulation Lab
- Dashboard has 4 KPI cards (total batches, pass rate, deviations, avg score), score trend chart, pass/fail pie, supplier performance bar chart, risk assessment list — all backed by backend queries
- Formulation Lab has API drugs from formulationData.ts but does NOT show herbs from pharmacopeiaData.ts in the ingredient picker
- No History page exists
- Dashboard does not surface Formulation Lab data or herb-specific breakdowns

## Requested Changes (Diff)

### Add
- **History Page** (`HistoryPage.tsx`): New sidebar page showing all system activity grouped by category:
  - Categories: Batch Intake, Quality Analysis, Formulations, Predictions, Reports
  - Uses existing backend queries (useAllBatches, useAllAnalyses) for batch/analysis history
  - Formulation sessions stored in localStorage as JSON array
  - Category tabs at top; each tab shows a table/card list with timestamp, material/formulation name, status, category
  - Search/filter bar across all categories
  - Export history as CSV button per category
- **History nav item** in App.tsx sidebar (History icon, page id "history")

### Modify
- **Crystal White Theme** in `index.css`:
  - Background: near-white (oklch(0.97 0.005 90))
  - Card background: oklch(1.0 0 0) / white with subtle border
  - Foreground text: oklch(0.15 0.02 240) (near black)
  - Muted foreground: oklch(0.45 0.015 240)
  - Primary accent: oklch(0.42 0.14 145) (deep herbal green — maintains identity)
  - Gold accent kept as oklch(0.68 0.13 78)
  - Border: oklch(0.88 0.01 240)
  - Input bg: oklch(0.95 0.005 240)
  - glass-card: white background with light shadow
  - sidebar: oklch(0.98 0.005 90) with subtle border
  - scrollbar: light gray tones
  - Update ALL inline styles in App.tsx, Dashboard.tsx to use new crystal white palette
  - Update chart tooltip styles to light theme
  - text-gold, text-success, text-warning, text-danger utility classes updated accordingly

- **Formulation Lab** (`FormulationLab.tsx`): In the ingredient picker drawer, add a "Herbs" tab alongside "APIs" tab. Import `pharmacopeiaData` from `../data/pharmacopeiaData`. Map HerbMonograph entries to a FormulationIngredient-compatible format (name, category: 'herb', description from latin name + source + part). Herbs appear selectable just like API drugs.

- **Dashboard** (`Dashboard.tsx`): Add additional KPI cards and sections:
  - New KPI: "Formulation Sessions" (count from localStorage formulations array, or 0)
  - New KPI: "Material Categories" breakdown (Herbs vs APIs vs Excipients in batch records)
  - New section: "Recent Activity Feed" — last 5 actions across batches + analyses with timestamp, type badge, name
  - New section: "Formulation Lab Summary" — last 3 saved formulations from localStorage with dosage form, method, ingredient count
  - Update chart colors to match crystal white theme (use deep green + gold on white backgrounds)
  - Chart tooltip styles updated for light background

### Remove
- Nothing removed

## Implementation Plan
1. Update `src/frontend/src/index.css` with complete crystal white theme token overhaul
2. Update inline styles in `src/frontend/src/App.tsx` to use crystal white palette
3. Update `src/frontend/src/pages/Dashboard.tsx` — new KPI cards (formulation sessions, material breakdown), recent activity feed, formulation summary section, light-theme chart styles
4. Update `src/frontend/src/pages/FormulationLab.tsx` — import pharmacopeiaData, add Herbs tab in ingredient picker drawer, map herb data to selectable ingredients
5. Create `src/frontend/src/pages/HistoryPage.tsx` — categorized history with tabs, tables, search, CSV export
6. Update `src/frontend/src/App.tsx` — add history page type, nav item with History icon, import HistoryPage, render in switch

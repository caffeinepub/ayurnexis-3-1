# AyurNexis 3.1 — Version 14

## Current State
- FormulationLab (8-step workflow) exists but does NOT save completed formulations to localStorage, so History page shows no formulation records
- Dashboard 6 KPI cards fetch from backend `getDashboardStats()` which returns 0 because no backend data is seeded at startup — all 4 data-backed KPIs show "0"
- `herbExtracts` array in formulationData.ts mixes true herb extracts (Ashwagandha, Curcumin, Reishi, Guduchi, Ginger, Green Tea) with pharmaceutical excipients (MCC PH102, Silicon Dioxide Colloidal, Magnesium Stearate) — all shown under one "Herb Extracts" tab in the drawer
- Certificate preview (step 7) is a simple card with basic text and a divider line — no graphics, no branding assets, no decorative design
- Profile in header is a static avatar showing "A" / "Admin" — not clickable, not editable

## Requested Changes (Diff)

### Add
- 6+ new pure herb extracts to formulationData.ts: Boswellia serrata extract, Bacopa monnieri extract, Holy Basil (Tulsi) extract, Amla (Emblica) extract, Neem leaf extract, Brahmi extract, Triphala extract
- New `pureHerbExtracts` export (true botanical extracts only) and rename the 3 excipients (MCC, SiO2, Mg Stearate) to their appropriate arrays
- Editable Profile modal in App.tsx: clicking the avatar opens a dialog with fields for Name, Designation, Institution, Email — saved to localStorage; avatar shows user initials
- Save formulation to localStorage (`ayurnexis_formulations`) when user reaches step 8 (export step) with all formulation data: name, dosageForm, method, ingredients, ownerName, institution, date, stability score
- Dashboard: compute fallback KPI stats from seedBatches data when backend returns totalBatches === 0, so KPIs always show meaningful real data (20 batches, pass/fail rates, avg quality score, etc.)

### Modify
- FormulationLab drawer: split "Herb Extracts" tab into two sub-tabs or two sections: **Herb Extracts** (botanical standardized extracts only) and **Excipient Extras** (functional excipients like MCC, SiO2, Mg Stearate) — label each ingredient's category badge clearly
- Certificate preview (step 7): redesign with multi-layered decorative border (double gold/green border frame), AyurNexis branded header with leaf/flask icon badge, colored ribbon stripe, watermark text, formulation badge with dosage form icon, signatures section with styled lines, official stamp circle, QA verification badge — premium certificate aesthetic
- Certificate PDF generation: match the premium design — gold border frames, header logo text, colored sections
- Dashboard: use computed fallback stats (from seedBatches) when backend stats are 0 so all 6 KPIs always show data

### Remove
- MCC PH102, Silicon Dioxide (Colloidal), Magnesium Stearate from `herbExtracts` array — move them to their correct excipient arrays or a separate `extraExcipients` array

## Implementation Plan
1. **formulationData.ts** — add `pureHerbExtracts` array with 6+ new herb extracts; move excipients to `extraExcipients`; keep `herbExtracts` as alias pointing to `pureHerbExtracts` for backward compat
2. **FormulationLab.tsx** — import `pureHerbExtracts` and `extraExcipients`; split Herb Extracts drawer tab into 2 sections (Herb Extracts | Excipient Extras); add save-to-localStorage logic when step advances to 8
3. **Dashboard.tsx** — import seedBatches; compute fallback stats from them when `stats.totalBatches === 0`; wire all 6 KPI cards to fallback values
4. **Certificate redesign** — completely redesign step 7 certificate preview with premium decorative styling; update PDF generation to match
5. **App.tsx** — add ProfileModal component (Dialog) with editable fields persisted to localStorage; make header avatar clickable to open it; show user's name initials in avatar

# AyurNexis 3.1

## Current State
- GetFormulationIdea: marketed drugs only show for diseases in static MARKETED_DRUGS map; diseases not in map get empty results even though OpenFDA fallback exists. Novel formulations lack per-ingredient pharmacological effects (static compositions set it to empty string). Full formulation pharmacological effects work but are generic, not disease-specific.
- Dashboard: 6 KPI cards present. KPI 5 (Formulation Sessions) reads from localStorage instead of an integrated source. KPIs need to reflect all connected functions (batch data, formulation history, herb library).
- QualityAnalysis Run New Analysis: result panel has a dark glass-card background but uses oklch() colors at medium luminosity for Quality Score and parameter labels (text-muted-foreground) — making them hard to see or invisible on dark backgrounds. Progress bar `--progress-background` CSS var does not apply in shadcn's Progress component.
- Settings/ConfigPage: saves quality thresholds and analysis weights to localStorage but QualityAnalysis does NOT read these saved values — it uses hardcoded thresholds.
- pdfLib.ts: autoTable only renders first line of wrapped text (splits[0]), row heights too small for content, no page-break detection — long tables overflow the page.

## Requested Changes (Diff)

### Add
- Per-ingredient pharmacological effect in GetFormulationIdea novel formulation table: look up each ingredient name in `pharmacologicalProfiles` and show `therapeuticUses[0]` or `mechanismOfAction` as a short effect note, filtered for relevance to the selected disease
- Full formulation pharmacological effects: aggregate `therapeuticUses` from all ingredients, deduplicated, displayed as a combined paragraph with disease context
- Page-break logic in pdfLib.ts autoTable: before rendering each row, check if `y + bodyRowH > pageHeight - margin.bottom`; if so, call `doc.addPage()` and reset y
- Multiline cell rendering in pdfLib.ts: render all `splits` lines, compute row height dynamically as `max(bodyRowH, splits.length * lineH + pad*2)`

### Modify
- GetFormulationIdea marketed drugs: when `getMarketedDrugsStatic()` returns empty or only generic fallback, immediately show OpenFDA results with proper drug-type-aware filtering. The OpenFDA query should search both brand name and indication fields. Show drugs for any disease typed (not just the preloaded list).
- GetFormulationIdea novel formulations: make DeepSeek prompt explicitly disease-specific; include disease name and indication in ingredient descriptions. For static fallback compositions, look up pharmacological effects from `pharmacologicalProfiles` by ingredient name match.
- Dashboard KPI cards: KPI 1 (Total Batches) from backend/seed data; KPI 2 (QA Compliance Rate) from computed pass rate; KPI 3 (Open Deviations) count from batch data; KPI 4 (Avg Quality Score) from analysis results; KPI 5 (Formulation Sessions) from localStorage `ayurnexis_formulations` length or a live count; KPI 6 (Herb Monographs) from `pharmacopeiaData.length`. Each card subtitle should describe what function/data source it uses.
- QualityAnalysis Run New Analysis: change all text colors inside the dark result panel to use white or light values: `text-white` for labels and values instead of `text-muted-foreground` or medium oklch. Fix Quality Score value color to use higher luminosity (e.g., `oklch(0.85 0.168 145)` for accept green, `oklch(0.78 0.174 24)` for reject red). Fix Progress bar: replace CSS var approach with explicit indicator color via a wrapper div overlay or use the `indicatorClassName` prop of shadcn Progress if available, else use a custom div progress bar.
- Settings ConfigPage: when QualityAnalysis runs, read `ayurnexis_config` from localStorage and apply `thresholds` to the accept/reject logic (moisture, ash, extractiveValue, heavyMetals, microbialCount limits). Apply `analysisSettings.moistureWeight` etc. to compute weighted quality score. Default formulation settings should pre-fill Formulation Lab step 2 dropdowns on load.

### Remove
- Nothing removed

## Implementation Plan
1. **pdfLib.ts** — Fix autoTable: compute dynamic row heights, render all split lines, add page-break logic before each row.
2. **GetFormulationIdea.tsx** — Fix marketed drugs: always trigger OpenFDA fetch for any disease, don't wait for static data. Show results filtered by dosage form match. Fix novel formulations: ensure DeepSeek prompt is disease-specific. For static compositions, map ingredient names to `pharmacologicalProfiles` and populate `pharmacologicalEffect` field per ingredient.
3. **QualityAnalysis.tsx** — Fix all text colors in the Run New Analysis result card: use high-luminosity colors or `text-white` for labels on dark backgrounds. Fix the Progress bar colored fill (use a custom wrapper or `style` on the indicator element directly).
4. **Dashboard.tsx** — Update all 6 KPI card subtitles and data to accurately reflect connected functions. Ensure each KPI description matches its source.
5. **App.tsx (ConfigPage)** — Wire settings load on mount (read existing localStorage on mount to pre-populate). Add note in UI that settings affect QualityAnalysis thresholds and Formulation Lab defaults.
6. **QualityAnalysis.tsx** — Read `ayurnexis_config` localStorage on component mount, use saved thresholds for accept/reject decisions and weighted score calculation.

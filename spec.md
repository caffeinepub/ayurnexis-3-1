# AyurNexis 3.1 — Multi-Module Fix Build

## Current State

The app has four modules that need fixes:

1. **GAMP 5 Validation Document Generator** (`Gamp5Page.tsx`): Exists but generates minimal content. Documents are rendered as raw markdown in `<pre>` tags (asterisks/hashes visible as literal text). Export is HTML renamed as `.doc`/`.xls` — not real Office formats. Content is too brief and non-compliant with GAMP 5 Second Edition structure. Missing document control headers, version history tables, deviation logs, DQ document.

2. **Analysis Results** (`QualityAnalysis.tsx`): 
   - After running analysis in "Run New Analysis" panel, `runResult` is only local state — the analysis cards list never updates, so status appears unchanged.
   - No delete button exists anywhere in the analysis results list.
   - Color issues: hardcoded hex values `#e2e8f0`, `#94a3b8`, `rgba(255,255,255,0.15)` in the Run New Analysis result panel are designed for dark theme but app theme is "crystal white", causing invisible text.

3. **Data Integration**: `Raw Material Batches`, `Analysis Results`, and `Predictions & Risk Intelligence` are disconnected:
   - `QualityAnalysis` runs analysis locally, never saved to backend queries.
   - `Predictions.tsx` uses `SEED_BATCHES` to look up actual numeric parameter values but backend-created batches lack all extended fields.
   - `qualityStatus` on seed batches (Pass/Fail/Under Review) is never synced with computed analysis `status` (Accept/Reject).
   - The Run New Analysis result is never reflected in Predictions or Risk Assessment views.

4. **seedBatches.ts**: All 20 batches use `computeLocalAnalysis` which always scores 100 (all params within limits), but `qualityStatus` on some batches shows "Under Review" and one shows "Fail" — inconsistent with computed scores.

## Requested Changes (Diff)

### Add
- Delete button (trash icon) on each analysis result card in `QualityAnalysis.tsx` — removes from local merged list (since these are seed-computed analyses, use a local `deletedBatchIds` state set stored in localStorage)
- A shared `analysisStore` context/localStorage system so new analyses run in QualityAnalysis flow into Predictions & Risk Intelligence
- GAMP 5: Proper rich HTML document rendering (convert markdown to HTML properly) instead of raw `<pre>` display
- GAMP 5: Full GAMP 5 Second Edition-compliant document templates with all required sections (scope, objectives, regulatory basis, responsibilities, change control, deviation log, signature blocks, version history table)
- GAMP 5: Design Qualification (DQ) document as 7th document type
- GAMP 5: Real `.docx` generation using HTML-to-Word blob with proper OOXML headers (or use the existing approach but with proper Word-compatible HTML including `mso-` styles for correct Word rendering)
- GAMP 5: Traceability Matrix with bidirectional links (URS Req → FS Section → Test Case ID)

### Modify
- `QualityAnalysis.tsx` — `handleRunAnalysis`: after computing result, save it to a `localAnalysisResults` array in localStorage and invalidate/refresh the merged analyses list so the new result appears immediately in the cards below
- `QualityAnalysis.tsx` — Run New Analysis result panel: replace all hardcoded hex dark colors (`#e2e8f0`, `#94a3b8`, `rgba(255,255,255,0.15)`) with proper light-theme colors (dark text on white/light backgrounds)
- `QualityAnalysis.tsx` — add delete handler that adds batchId to `deletedBatchIds` set in localStorage; filter merged analyses to exclude deleted IDs
- `Predictions.tsx` — merge locally-stored new analysis results (from localStorage `localAnalysisResults`) into the displayed analyses, so newly run analyses appear in Risk Intelligence too
- `seedBatches.ts` — fix `qualityStatus` inconsistency: batches 003 (Neem), 007 (Ginger), 011 (Licorice), 017 (Fennel) show "Under Review" and 013 (Punarnava) shows "Fail" — these should have their numeric params adjusted to actually reflect borderline/failing values that justify those statuses; OR the `qualityStatus` should be the authoritative field shown in all views instead of the computed `status`
- `Gamp5Page.tsx` — replace `<pre>` document display with a `<div>` that renders the AI text with proper markdown-to-HTML conversion (handle `## Heading`, `**bold**`, `- list item`, numbered lists, tables)
- `Gamp5Page.tsx` — extend AI prompts to generate fully GAMP 5 Second Edition compliant content: each document must have version history table, document control info, scope, purpose, regulatory references section, responsibilities matrix, and signature block

### Remove
- Nothing removed

## Implementation Plan

1. **Fix seedBatches data**: Adjust numeric params for batches AY-2025-003, 007, 011, 013, 017 so their `qualityStatus` reflects reality (e.g., batch 013 Punarnava has E.coli present — microbialCount should be > 10000 to actually fail; batches with "Under Review" should have borderline params near threshold). This makes Raw Material Batches, Analysis Results and Predictions all consistent.

2. **Add localStorage analysis store**: Create a helper in `seedBatches.ts` or a new `analysisStore.ts` utility:
   - `saveLocalAnalysis(result: AnalysisResult): void` — saves to `localStorage('ayurnexis_local_analyses')`
   - `getLocalAnalyses(): AnalysisResult[]` — reads from localStorage
   - `deleteLocalAnalysis(batchId: string): void` — removes entry
   - `deletedBatchIds: Set<string>` — stored in `localStorage('ayurnexis_deleted_analyses')`

3. **Fix `useAllAnalysesMerged` hook**: Merge localStorage analyses into the return value alongside seed and backend analyses.

4. **Fix `QualityAnalysis.tsx`**:
   - `handleRunAnalysis`: call `saveLocalAnalysis(result)` after computing, then force re-render
   - Add delete button to each analysis card; call `deleteLocalAnalysis` and update local state
   - Fix all dark-theme hardcoded colors in Run New Analysis panel — use `text-gray-800`, `text-gray-600`, `bg-gray-50`, `border-gray-200` classes

5. **Fix `Predictions.tsx`**: Read from `getLocalAnalyses()` and merge with existing `analyses` data so newly run analyses appear in the Risk Intelligence view.

6. **Fix `Gamp5Page.tsx`**:
   - Add a `markdownToHtml(text: string): string` helper that converts `## `, `### `, `**`, `*`, `- `, numbered lists, and `---` dividers to proper HTML
   - Render documents in a styled `<div dangerouslySetInnerHTML>` instead of `<pre>`
   - Extend all 6 AI prompts to include: version history table (markdown table format), document control header (Document No., Version, Effective Date, Status, Owner), scope section, regulatory basis (GAMP 5 §X.X, FDA 21 CFR Part 11, ICH Q10), responsibilities (RACI matrix for QA/IT/Validation), review and approval signature block
   - Add DQ (Design Qualification) as a 7th document with its own AI prompt
   - Fix Word export: use proper OOXML-compatible HTML with `xmlns:o`, `xmlns:w` namespaces so Word opens it correctly with formatting intact
   - Fix Excel export: use proper table HTML with proper Excel namespace
   - Traceability Matrix: add FS Reference column linking each requirement to a Functional Spec section number

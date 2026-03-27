# AyurNexis 3.1

## Current State

- **GetFormulationIdea**: Has a `claimFormulation` call on the "Add to Formulation Lab" button that blocks users with a "claimed by another user" error when compositions are locked. Gemini API powers disease search and novel formulation generation, but search scope and drug data may be limited.
- **FormulationLab**: On prefill from GetFormulationIdea, sets step=3 (ingredients) with dosageForm set but method=null, which can cause issues. Real-Time Analysis has 6 tabs (API Insights, Dynamic Recommendations, Compatibility Matrix, Analytical Data, Full Composition Analytics, AI Reactions). AI Reactions and Full Composition Analytics use Gemini data when available. API Insights and Dynamic Recommendations use static/algorithmic data. Composition Summary shows static KPI cards + per-API dose table without AI-powered narrative or procedure section.
- **geminiService**: Has `searchDiseases`, `getFormulationIdeas`, `analyzeFormulation` functions. `analyzeFormulation` returns full structured JSON including all analytical tabs.

## Requested Changes (Diff)

### Add
- **Composition Summary**: Add AI-generated narrative (via Gemini) explaining the full formulation rationale, pharmacological basis, and expected clinical outcomes.
- **Procedure Section in Composition Summary**: Step-by-step manufacturing procedure (brief, numbered), list of instruments used, list of glassware used — all generated via Gemini based on the dosage form and ingredients.
- **geminiService**: Add `getFormulationSummaryNarrative(ingredients, dosageForm, method)` that returns `{ narrative, procedure: string[], instruments: string[], glassware: string[] }`.
- **geminiService**: Add `getMarketedDrugs(disease, drugType, dosageForm)` that calls Gemini to return a list of real marketed drugs with brand name, generic name, manufacturer, dosage form, and strength.
- Expand `getFormulationIdeas` to generate up to 10 ideas per call with full detail including instruments and glassware.

### Modify
- **GetFormulationIdea — Fix composition lock**: Remove the `claimFormulation` / `isFormulationClaimed` check from the "Add to Formulation Lab" button entirely. The lock should not be applied when browsing ideas — only when a formulation is exported from FormulationLab. Always allow clicking "Add to Formulation Lab" without any claim check.
- **GetFormulationIdea — Real drug data only**: Replace static/fallback marketed drug data with Gemini-powered `getMarketedDrugs`. Remove any "No drugs found" placeholder; if Gemini returns data, show it. If Gemini call is loading, show a spinner.
- **GetFormulationIdea — Full disease search**: Increase disease search results from Gemini to return up to 20 suggestions. Make the search field more open-ended with a placeholder like "Search any disease, condition, or disorder..." Remove any pre-filtering of disease queries.
- **GetFormulationIdea — Novel formulations**: Generate up to 10 compositions per batch via Gemini. Show all available options without limiting based on claim status. Add a "Generate More" button to fetch another batch of 10 (up to 20 total). Remove any "claimed" badge or blocking UI.
- **FormulationLab — Prefill navigation**: When prefillData arrives, set a default method based on dosage form (e.g., Tablet → "Direct Compression", Capsule → "Dry Fill", Syrup → "Solution", etc.) so the user lands on step 3 (ingredients) with both dosageForm and method set. The user sees their pre-populated ingredients and can click Next.
- **FormulationLab — API Insights tab**: Replace static data with Gemini-powered insights. When `geminiAnalysis` is available, show for each API: Gemini-generated mechanism of action, pharmacopeia-referenced dose range, drug interactions from Gemini. Show loading state while Gemini loads.
- **FormulationLab — Dynamic Recommendations tab**: Replace static flags with Gemini `advantages` and `disadvantages` arrays. Show them as green ✓ advantage cards and amber ⚠ disadvantage cards. Keep the compatibility score card at top. Show loading state when geminiLoading is true.
- **FormulationLab — Compatibility Matrix tab**: Already uses Gemini when available. Ensure it always waits for Gemini and shows loading state. When Gemini data is present, add a summary sentence explaining the most critical incompatibilities.
- **FormulationLab — Analytical Data tab**: Currently shows individual ingredient data with static values. Replace with Gemini-sourced individual HPLC peaks, UV absorption, and key parameters per ingredient from `geminiAnalysis.hplcProfile` filtered by ingredient. Show loading state.
- **FormulationLab — Full Composition Analytics tab**: Already Gemini-powered. Ensure all 5 charts (HPLC bar, UV Gaussian curve, FTIR transmittance, DSC thermal, Dissolution line) only show Gemini data (not algorithmic fallback). Show clear loading state with a message "Generating pharmacopeia-compliant predictions…" while waiting.
- **FormulationLab — AI Reactions tab**: Already Gemini-powered. Ensure it always shows Gemini data; never show static fallback. If no data yet, show spinner only (not "no reactions predicted" with empty state).
- **FormulationLab — Composition Summary**: Add a new "AI Analysis" section below the KPI cards with: (1) Gemini narrative paragraph, (2) Step-by-step procedure, (3) Instruments list, (4) Glassware list. Load this when step 5 is first entered.

### Remove
- `claimFormulation` and `isFormulationClaimed` calls from the "Add to Formulation Lab" button in GetFormulationIdea.
- Static/fallback marketed drug data logic (replaced by Gemini).
- Static fallback values in API Insights, Dynamic Recommendations tabs (replaced by Gemini).

## Implementation Plan

1. **geminiService.ts**: Add `getFormulationSummaryNarrative`, `getMarketedDrugs`, expand `getFormulationIdeas` prompt to return 10 items.
2. **GetFormulationIdea.tsx**: 
   - Remove claimFormulation/isFormulationClaimed import and call from the Add button — always call `onAdd(comp)` directly.
   - Replace static marketed drug data with `getMarketedDrugs` Gemini call.
   - Increase disease search limit to 20.
   - Generate up to 10 compositions per batch; add "Generate More" button for another 10.
3. **FormulationLab.tsx**:
   - In prefill effect, add a `setMethod(defaultMethodForDosageForm(prefillData.dosageForm))` before `setStep(3)`, where defaultMethodForDosageForm maps common dosage forms to a default method string.
   - API Insights tab: show Gemini data (mechanism, dose range, DDI from geminiAnalysis) when available, with loading state.
   - Dynamic Recommendations tab: show geminiAnalysis.advantages / disadvantages as cards, with loading state.
   - Full Composition Analytics: remove algorithmic fallback, show Gemini only with explicit loading message.
   - Composition Summary: add AI Analysis section calling `getFormulationSummaryNarrative` on step enter.

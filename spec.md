# AyurNexis 3.1

## Current State
- Get Formulation Idea page uses OpenFDA API for disease search; novel compositions are preloaded static suggestions
- Formulation Lab predictive data (compatibility matrix, stability, HPLC/UV/FTIR/DSC/dissolution) is algorithmic/static
- Dashboard has 6 KPI cards with no live news feed

## Requested Changes (Diff)

### Add
- **Gemini API service** (`src/frontend/src/services/geminiService.ts`): reusable module that calls `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` with the API key `AIzaSyCkAAD9UcBo5KH1edlmz4vs61rAPJpRHQU`. Returns structured JSON parsed from Gemini's response.
- **FDA News Ticker** on Dashboard: a horizontally scrolling news ticker strip at the very top of the Dashboard (above KPI cards). Fetches FDA news from `https://www.fda.gov/news-events/rss-feeds` (or use OpenFDA API endpoint for recent drug events), parses headlines + links, auto-scrolls left continuously. Each headline is clickable and opens the FDA source URL in a new tab. Shows "FDA LIVE" badge. Falls back to preloaded headlines if fetch fails.

### Modify
- **Get Formulation Idea page** (`GetFormulationIdea.tsx`):
  - Disease search: send user's typed query to Gemini API asking it to return a list of matching diseases/conditions as JSON. Replace current OpenFDA autocomplete with Gemini-powered search (any disease, rare or common).
  - Novel formulations: after selecting disease + dosage form + drug type, call Gemini API to generate up to 10 novel formulation compositions. Prompt must request structured JSON with: compositionName, ingredients (name, quantity, role, pharmacologicalEffect), advantages[], disadvantages[], stabilityPrediction, mechanismOfAction, drugInteractions[], clinicalRationale. Show a loading spinner while Gemini responds. Display results in the existing composition card UI.
  
- **Formulation Lab** (`FormulationLab.tsx`):
  - After ingredients are added (Step 2+), call Gemini API to generate:
    1. Compatibility matrix data: for each ingredient pair, return compatible/incompatible/conditional + reason
    2. Stability assessment: physical stability, chemical stability, predicted shelf life, ICH Q1A classification
    3. Advantages & disadvantages of the full composition
    4. Inter-ingredient reactions (specific chemical/pharmacological interactions)
    5. Full Composition Analytics: predicted HPLC peaks (retention time, peak area, constituent), UV λmax, FTIR functional groups + wavenumbers, DSC thermal events, dissolution profile (% at 15/30/45/60/90 min)
  - Replace existing static/algorithmic predictive data with Gemini-generated real data
  - Show a loading state while Gemini processes
  - Cache the Gemini response per ingredient set (memoize by sorted ingredient names) to avoid redundant API calls

### Remove
- Static/algorithmic compatibility pair lookup table (replaced by Gemini)
- Static stability score calculation (replaced by Gemini)

## Implementation Plan
1. Create `src/frontend/src/services/geminiService.ts` with typed helper functions:
   - `searchDiseases(query: string): Promise<string[]>`
   - `getFormulationIdeas(disease: string, dosageForm: string, drugType: string): Promise<FormulationIdea[]>`
   - `analyzeFormulation(ingredients: Ingredient[]): Promise<FormulationAnalysis>`
2. Update `GetFormulationIdea.tsx` to use `searchDiseases()` for autocomplete and `getFormulationIdeas()` for composition suggestions
3. Update `FormulationLab.tsx` to call `analyzeFormulation()` when ingredients change (debounced, 1s), replacing static analysis with Gemini results
4. Add FDA news ticker component to `Dashboard.tsx` at the top, fetch from FDA API (CORS-friendly endpoint), auto-scroll CSS animation

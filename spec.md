# AyurNexis 3.1

## Current State
- FormulationLab uses dynamic CDN jsPDF import (Function('return import(...)')) which may fail in ICP environment
- Label PDF is basic, no pharmacological effects section, no disease indication, limited info
- Formulation Lab Real-Time Analysis tabs do not show per-ingredient pharmacological effects
- GetFormulationIdea: Gemini prompt requests 10 formulations but display is one-at-a-time with navigation; user sees only 4 results with increasing API mg (likely static fallback `generateDynamicCompositions` is running instead of Gemini)
- Novel compositions from Gemini do not include per-ingredient `pharmacologicalEffect` shown prominently
- Marketed drugs API call may be returning limited results; no fallback to show all available forms
- All diseases not covered because search suggests only 20 results

## Requested Changes (Diff)

### Add
- Pharmacological Effects tab/section in FormulationLab Composition Summary showing each ingredient's pharmacological role, mechanism, therapeutic use (from Gemini)
- Per-ingredient pharmacological effects prominently shown in GetFormulationIdea novel composition cards
- Full detailed Drug Label PDF: include brand/generic name, dosage form, all ingredients with quantities, pharmacological effects of composition, indications (diseases), contraindications, storage, manufacturer details, batch/lot number, approval status, score, regulatory note
- Fallback: if jsPDF CDN import fails, use Blob + data URI approach to attempt PDF

### Modify
- **geminiService.ts `getFormulationIdeas`**: Change prompt to request 20 novel formulations, not 10. Add explicit field `pharmacologicalEffects` (full paragraph on mechanism and therapeutic effects of entire composition). Add `indicationsForDisease` field. Remove any implicit restrictions - ask for all clinically relevant formulations.
- **geminiService.ts `getMarketedDrugs`**: Change prompt to ask for ALL available marketed drugs (up to 20), all dosage forms, all manufacturers. No restriction to specific drug type.
- **geminiService.ts `searchDiseases`**: Return 30 results including common conditions, rare diseases, and exact match for typed query.
- **GetFormulationIdea NovelCompositionsStep**: Show all AI-generated formulations (up to 20), paginate with prev/next, show `pharmacologicalEffects` prominently in each card.
- **FormulationLab generateLabelPDF**: Completely rewrite to be a full, detailed, professional drug label PDF (A4 or A5) with all fields: product name, composition table, pharmacological effects paragraph, indications, contraindications, storage conditions, manufacturer, batch, score, approval status, platform certification statement.
- **FormulationLab PDF download buttons**: Wrap all 3 PDF download handlers in try/catch with user-visible error toast if CDN import fails; add alternative download path.
- **FormulationLab Real-Time Analysis**: In the Composition Summary / API Insights tab, add a "Pharmacological Effects" section showing Gemini-generated pharmacological effects for the full composition.

### Remove
- Any static `generateDynamicCompositions` fallback that produces repetitive 4-result lists with increasing API mg — replace with proper Gemini call always
- Any limit/restriction in Gemini prompts that reduces output variety

## Implementation Plan
1. Update `geminiService.ts`:
   - `searchDiseases`: ask for 30 results, explicitly include common conditions
   - `getFormulationIdeas`: request 20 formulations, add `pharmacologicalEffects` and `indicationsForDisease` fields, no restrictions
   - `getMarketedDrugs`: ask for 20 drugs, all dosage forms, remove drug type restriction
   - Add new `getCompositionPharmacology(ingredients, dosageForm)` function that returns a pharmacological effects paragraph for the full composition
2. Update `GetFormulationIdea.tsx`:
   - Always use Gemini results (remove static fallback `generateDynamicCompositions`)
   - Show `pharmacologicalEffects` and `indicationsForDisease` prominently on novel composition cards
   - Show all up to 20 results with navigation
3. Update `FormulationLab.tsx`:
   - Rewrite `generateLabelPDF` for full professional label
   - Add pharmacological effects section to composition summary (call `getCompositionPharmacology`)
   - Fix PDF download reliability (robust error handling)

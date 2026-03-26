# AyurNexis 3.1

## Current State
- Admin password hardcoded as `ayurnexis-admin-2026` in both AccessGate.tsx and AdminDashboard.tsx
- Predictions & Risk Intelligence modal shows tabs (Overview, Pharmacology, Safety, Batch, Parameters) but data is sparse — no mechanism of action, no adverse effects, no therapeutic index, no batch test specifics
- Get Formulation Idea uses fully preloaded static disease-drug data (no live API)
- No formulation uniqueness tracking (any user can see all compositions)
- No claimed formulation history in Admin Panel

## Requested Changes (Diff)

### Add
- Admin token/password changed to `AYURNEXIS-ADMIN-TOKEN-2026` in both AccessGate.tsx and AdminDashboard.tsx
- Rich pharmacological data for each ingredient in Predictions modal: mechanism of action, known adverse effects, therapeutic index (value + classification), specific batch test results per ingredient
- HTTP outcalls via OpenFDA API (`api.fda.gov/drug/label.json?search=indications_and_usage:DISEASE`) called from frontend (since ICP HTTP outcalls is a backend feature requiring canister setup, we will use the OpenFDA public API directly from the frontend via fetch — this is permissible as a client-side call)
- Formulation claim tracking in localStorage: when user selects a composition, it's locked to their userId with a 7-day expiry
- Claimed formulations shown in Admin Panel under each user's history section (disease, dosage form, drug type, composition name, date claimed)

### Modify
- `pharmacologicalProfiles.ts` — add mechanismOfAction, adverseEffects[], therapeuticIndex fields to each profile
- `Predictions.tsx` — PharmacologicalModal tabs now show real data for Pharmacology (mechanism), Safety (adverse effects + therapeutic index), Batch (actual test numbers from seedBatches), Parameters (QA ranges)
- `GetFormulationIdea.tsx` — add live OpenFDA search step before disease selection; fallback to preloaded data if API fails; add claim-tracking logic on composition selection
- `AdminDashboard.tsx` — add "Claimed Formulations" section in user detail panel
- `accessControl.ts` — add claimedFormulations field to UserRegistration, add claimFormulation() and getClaimedFormulations() utils

### Remove
- Old admin password string `ayurnexis-admin-2026` (replaced with new token)

## Implementation Plan
1. Update admin password/token in accessControl.ts, AccessGate.tsx, AdminDashboard.tsx
2. Extend accessControl.ts with formulation claim types and functions
3. Enrich pharmacologicalProfiles.ts with mechanismOfAction, adverseEffects, therapeuticIndex for all ingredients
4. Update Predictions.tsx modal to display the new rich data fields
5. Update GetFormulationIdea.tsx with OpenFDA live search + claim-locking on selection
6. Update AdminDashboard.tsx to show claimed formulations per user

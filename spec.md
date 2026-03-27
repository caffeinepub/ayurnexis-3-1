# AyurNexis 3.1

## Current State
- FormulationLab has a Download PDF button that includes certificate in the PDF, but a standalone certificate download is broken
- No label download button in FormulationLab
- HistoryPage formulation table shows records but no certificate/label re-download
- Dashboard FdaLiveDrugKpi shows 1 item at a time cycling through 10, needs 2 side-by-side
- GetFormulationIdea MarketedDrugsStep only shows drugs for selected drugType, not all drugs for the disease, and doesn't show available dosage forms

## Requested Changes (Diff)

### Add
- FormulationLab: standalone "Download Certificate" button and separate "Download Label" button (in addition to existing PDF report button)
- FormulationLab: drug label generation logic (similar to certificate) included in export
- HistoryPage: for formulation records, add two icon buttons per row: Download Certificate and Download Label (regenerates them from saved formulation data)
- Dashboard FdaLiveDrugKpi: show 2 items side by side (approved on left, recalled/delisted on right), each cycling through their respective last 10 updates every 5 seconds
- GetFormulationIdea MarketedDrugsStep: fetch ALL drugs for the disease regardless of drugType, show available dosage forms as badges on each drug card with text "This dosage form is available" when the selected dosageForm matches

### Modify
- Certificate format: make it more advanced — add watermark/seal graphic element, formulation composition table inside certificate, pharmacopeia compliance badge, QR-like pattern, color-coded approval status section (green=approved, red=not approved), professional multi-section layout
- MarketedDrugsStep: expand OpenFDA fetch to get more results (limit=15), filter/show all regardless of drug type, add dosage form availability tags

### Remove
- Nothing removed

## Implementation Plan
1. **Certificate + Label PDF functions**: Extract `generateCertificatePDF(formulation)` and `generateLabelPDF(formulation)` as standalone async functions that use jsPDF, callable from both FormulationLab steps and HistoryPage
2. **FormulationLab step 7 (certificate preview)**: Add "Download Certificate" and "Download Label" buttons alongside existing PDF button
3. **HistoryPage FormulationTable**: Add Certificate and Label download icon buttons per row; store enough data in SavedFormulation to regenerate (ownerName, institution, designation, formulationName, dosageForm, method, ingredients, stabilityScore, approved status)
4. **Dashboard FdaLiveDrugKpi**: Split display into 2 columns — left shows approved drugs cycling, right shows recalled drugs cycling. Each side independently advances every 5 seconds through its own 10-item list
5. **GetFormulationIdea MarketedDrugsStep**: Remove drugType filter from fetch, fetch all drugs for disease, show dosage form availability badge when drug's route matches selected dosageForm

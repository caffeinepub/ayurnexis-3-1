# AyurNexis 3.1

## Current State
- formulationData.ts has APIs (25+) and excipient categories with 25+ each
- pharmacologicalProfiles.ts has profiles for herbs only
- FormulationLab.tsx uses apiDrugs and excipient arrays as ingredient sources
- QualityAnalysis.tsx displays herb/excipient data with college-level parameters

## Requested Changes (Diff)

### Add
- 9 new herb extract/excipient entries to formulationData.ts for FormulationLab use:
  Ashwagandha root extract, Phytosomal Curcumin extract, Reishi mushroom extract,
  Guduchi stem extract, Ginger root extract, Green tea polyphenol extract,
  Microcrystalline cellulose, Silicon dioxide, Magnesium stearate
  Each with: CAS, active constituents, source, therapeutic category, description, assay limits, storage, solubility, parameters
- Pharmacological effects for ALL raw material ingredients (herbs, APIs):
  mechanism of action, therapeutic uses, modern evidence — shown in QualityAnalysis ingredient detail view

### Modify
- formulationData.ts: add 9 new entries as herbExtracts array
- pharmacologicalProfiles.ts: ensure all herbs have pharmacological effects
- QualityAnalysis.tsx: add pharmacological effects section in ingredient detail
- FormulationLab.tsx: include herbExtracts in ingredient picker

### Remove
- Nothing

## Implementation Plan
1. Add herbExtracts array to formulationData.ts (9 entries, real data)
2. Add pharmacologicalEffects field to existing herb/API data structures
3. Update QualityAnalysis to render pharmacological effects
4. Update FormulationLab to include herb extracts in picker

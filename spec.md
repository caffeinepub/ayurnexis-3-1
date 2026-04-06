# AyurNexis 3.1 — Ingredient Library + Global Search

## Current State
- App has 33 herbs (pharmacopeiaData.ts), ~25 APIs, and ~120 excipients (formulationData.ts)
- No dedicated Library sidebar page exists
- Dashboard search bar exists but does nothing (no search logic wired)
- Formulation Lab has an ingredient selector, but no browse/edit capability
- No external pharmacopeia links per ingredient

## Requested Changes (Diff)

### Add
- **IngredientLibrary.tsx** — new sidebar page (Page type: "library") with:
  - Searchable/filterable catalog of ALL ingredients across 4 categories: Herbs, APIs, Excipients, Herb Extracts
  - Category filter tabs (All / Herbs / APIs / Excipients / Extracts)
  - Search by name, therapeutic use, pharmacopeia source
  - Ingredient cards with: name, category badge, pharmacopeia source, therapeutic use summary
  - Full detail panel (drawer/modal) per ingredient showing all pharmacopeia data and parameters
  - Edit button on each card to update ingredient data inline (saved to localStorage override store)
  - Add Manually form to create new custom ingredients (persisted in localStorage)
  - External link button per ingredient → PubChem (for APIs/extracts), AYUSH/WHO monograph (for herbs), NLM (for excipients)
  - "Add to Formulation Lab" button → navigates to formulation page with ingredient pre-selected
  - 50+ new ingredients added across all 4 categories
- **ingredientLibraryStore.ts** — localStorage-backed store for custom/edited ingredients
- **Global search** wired into existing header search bar in App.tsx:
  - Searches ingredients, batches, formulations (history), analysis results
  - Results shown as a dropdown grouped by section with navigation links
  - Keyboard nav (Esc to close, Enter to navigate)

### Modify
- **App.tsx** — add "library" to Page type, NAV_ITEMS, renderPage switch, pass setPage callback to IngredientLibrary
- **pharmacopeiaData.ts** — add 20+ new herbs
- **formulationData.ts** — add 15+ new APIs and 15+ new excipients
- **Dashboard.tsx header search** — now shows live results dropdown

### Remove
- Nothing removed

## Implementation Plan
1. Add 20+ new herbs to pharmacopeiaData.ts
2. Add 15+ APIs and 15+ excipients to formulationData.ts
3. Create ingredientLibraryStore.ts for custom/edited ingredient persistence
4. Build IngredientLibrary.tsx with card grid, filters, detail panel, edit form, add form, external links
5. Wire "library" page into App.tsx NAV_ITEMS and renderPage
6. Implement global search in App.tsx header — searches ingredients + batches + history, shows dropdown results

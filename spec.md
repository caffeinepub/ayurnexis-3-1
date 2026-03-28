# AyurNexis 3.1

## Current State
- DeepSeek AI is integrated via backend canister HTTP outcalls but responses are empty/fail because Motoko's `extractDeepSeekContent` does O(n²) character-by-character string parsing on large JSON responses, hitting ICP instruction limits
- PDFs (Report, Certificate, Label) use CDN dynamic import for jsPDF which is blocked in production
- History page has no delete button for formulations
- History page certificate/label/report download buttons exist but use same broken CDN approach
- Admin Panel has no user activity/history view

## Requested Changes (Diff)

### Add
- Admin Panel: expandable user activity card (click user to see full history with date/time of all formulations, analyses, batches)
- History: delete button for own formulation records (permanent deletion)
- History: working download buttons for Report, Certificate, and Label per formulation row
- PDF redesign: all 3 PDFs (Report, Certificate, Label) with light-color professional layouts and proper 20mm margins

### Modify
- Backend `callDeepSeek`: return raw HTTP response JSON instead of extracting content in Motoko (avoid O(n²) string parsing that traps on large AI responses)
- Frontend `aiService.ts`: parse the raw DeepSeek JSON response (extract `choices[0].message.content`) in JavaScript
- `pdfLib.ts`: replace CDN dynamic loading with proper npm package import (`import jsPDF from 'jspdf'; import autoTable from 'jspdf-autotable'`)
- HistoryPage: use pdfLib npm approach for all PDF generation
- FormulationLab: use pdfLib npm approach for all PDF generation

### Remove
- Motoko `extractDeepSeekContent`, `textFind`, `textSubstring`, `findUnescapedEnd` helper functions (no longer needed after returning raw JSON)

## Implementation Plan
1. Update `main.mo` — remove all string parsing helpers, return raw response from `callDeepSeek`
2. Update `aiService.ts` — parse `choices[0].message.content` from raw JSON in JavaScript
3. Update `pdfLib.ts` — use npm package imports instead of CDN loading
4. Redesign all 3 PDF generators with light professional layout
5. Add delete functionality to HistoryPage for own formulations (localStorage-based)
6. Fix History PDF download buttons to use npm-based approach
7. Add expandable user activity panel to AdminDashboard (reads formulation history from localStorage keyed by userId)

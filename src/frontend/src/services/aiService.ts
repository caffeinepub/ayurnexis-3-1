// AyurNexis AI Service — routes all AI calls through the ICP backend canister
// The backend canister calls DeepSeek via HTTP outcalls (no CORS issues)

import { createActorWithConfig } from "../config";

async function callAI(prompt: string): Promise<string | null> {
  try {
    const actor = await createActorWithConfig();
    const raw: string = await (actor as any).callDeepSeek(prompt);
    const data = JSON.parse(raw);
    if (data?.error) {
      console.warn("AI backend error:", data.error);
      return null;
    }
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("AI call threw:", err);
    return null;
  }
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

function parseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(stripMarkdown(text)) as T;
  } catch {
    const arrMatch = text.match(/(\[\s*\{[\s\S]*\}\s*\])/m);
    if (arrMatch) {
      try {
        return JSON.parse(arrMatch[1]) as T;
      } catch {
        /* ignore */
      }
    }
    const objMatch = text.match(/(\{[\s\S]*\})/m);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[1]) as T;
      } catch {
        /* ignore */
      }
    }
    return null;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiFormulationIngredient {
  name: string;
  quantity: number;
  unit: string;
  role: string;
  pharmacologicalEffect: string;
}

export interface FormulationIdea {
  compositionName: string;
  ingredients: GeminiFormulationIngredient[];
  advantages: string[];
  disadvantages: string[];
  stabilityPrediction: string;
  mechanismOfAction: string;
  drugInteractions: string[];
  clinicalRationale: string;
  pharmacologicalEffects: string;
  indicationsForDisease: string;
  contraindications: string[];
  dosageInstructions: string;
}

export interface CompatibilityPair {
  ingredient1: string;
  ingredient2: string;
  status: "compatible" | "incompatible" | "conditional";
  reason: string;
}

export interface StabilityAssessment {
  physicalStability: string;
  chemicalStability: string;
  predictedShelfLife: string;
  ichClassification: string;
  stabilityScore: number;
  hygroscopicIngredients: string[];
  thermolabileIngredients: string[];
  lightSensitiveIngredients: string[];
}

export interface InterIngredientReaction {
  ingredient1: string;
  ingredient2: string;
  reactionType: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface HplcPeak {
  constituentName: string;
  retentionTime: number;
  peakArea: number;
  ingredient: string;
}

export interface UvSpectrum {
  lambdaMax: number;
  absorptionRange: string;
  chromophores: string[];
}

export interface FtirPeak {
  functionalGroup: string;
  wavenumber: number;
  transmittance: number;
}

export interface DscEvent {
  ingredient: string;
  event: string;
  temperature: number;
  enthalpy: number;
}

export interface DissolutionPoint {
  timeMinutes: number;
  percentReleased: number;
}

export interface FormulationAnalysis {
  compatibilityMatrix: CompatibilityPair[];
  stabilityAssessment: StabilityAssessment;
  advantages: string[];
  disadvantages: string[];
  interIngredientReactions: InterIngredientReaction[];
  hplcProfile: HplcPeak[];
  uvSpectrum: UvSpectrum;
  ftirProfile: FtirPeak[];
  dscProfile: DscEvent[];
  dissolutionProfile: DissolutionPoint[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function searchDiseases(query: string): Promise<string[]> {
  const prompt = `List 30 medical diseases, disorders, syndromes, or conditions that match or relate to: '${query}'. Include common conditions like fever, cold, headache, diabetes, hypertension, infections, skin diseases, GI issues, respiratory, neurological, rare diseases, pediatric, geriatric, and specialty conditions. Return ONLY a JSON array of 30 strings (disease/condition names only), no explanation. Example: ["Type 2 Diabetes Mellitus", "Acute Febrile Illness", "Common Cold (Rhinovirus)"]`;
  const result = await callAI(prompt);
  if (!result) return [];
  const parsed = parseJSON<string[]>(result);
  return Array.isArray(parsed)
    ? parsed.filter((s) => typeof s === "string")
    : [];
}

export async function getFormulationIdeas(
  disease: string,
  dosageForm: string,
  drugType: string,
): Promise<FormulationIdea[]> {
  const prompt = `Generate exactly 20 diverse, creative, pharmacopeia-compliant novel pharmaceutical formulation ideas for treating ${disease} as a ${dosageForm} using ${drugType} approach. Include Ayurvedic, allopathic, herbal, and combination approaches as appropriate. No restrictions on formulation types. Use real ingredient names, real pharmacopeia doses.

For each, return a JSON array of objects with these exact fields:
- compositionName (string): unique descriptive name
- ingredients (array): each with name (string), quantity (number), unit (string), role (string), pharmacologicalEffect (string)
- advantages (array of 3-5 strings)
- disadvantages (array of 2-3 strings)
- stabilityPrediction (string)
- mechanismOfAction (string)
- drugInteractions (array of strings)
- clinicalRationale (string)
- pharmacologicalEffects (string): comprehensive 4-6 sentence paragraph covering overall mechanism, receptor/enzyme targets, therapeutic effects, bioavailability, and clinical rationale
- indicationsForDisease (string)
- contraindications (array of strings)
- dosageInstructions (string)

Return ONLY valid JSON array, no markdown, no explanation.`;
  const result = await callAI(prompt);
  if (!result) return [];
  const parsed = parseJSON<FormulationIdea[]>(result);
  return Array.isArray(parsed) ? parsed : [];
}

export async function analyzeFormulation(
  ingredients: { name: string; quantity: number; unit: string; role: string }[],
): Promise<FormulationAnalysis | null> {
  if (ingredients.length < 2) return null;
  const prompt = `Analyze this pharmaceutical formulation with these ingredients: ${JSON.stringify(ingredients)}. Return a JSON object with these exact fields:
- compatibilityMatrix: array of {ingredient1, ingredient2, status ('compatible'|'incompatible'|'conditional'), reason}
- stabilityAssessment: {physicalStability, chemicalStability, predictedShelfLife, ichClassification, stabilityScore (0-100), hygroscopicIngredients, thermolabileIngredients, lightSensitiveIngredients}
- advantages: string array
- disadvantages: string array
- interIngredientReactions: array of {ingredient1, ingredient2, reactionType, description, severity ('low'|'medium'|'high')}
- hplcProfile: array of {constituentName, retentionTime (minutes), peakArea (%), ingredient}
- uvSpectrum: {lambdaMax (nm), absorptionRange, chromophores}
- ftirProfile: array of {functionalGroup, wavenumber (cm-1), transmittance (%)}
- dscProfile: array of {ingredient, event, temperature (celsius), enthalpy (J/g)}
- dissolutionProfile: array of {timeMinutes, percentReleased}
Return ONLY valid JSON, no markdown.`;
  const result = await callAI(prompt);
  if (!result) return null;
  return parseJSON<FormulationAnalysis>(result);
}

export interface MarketedDrugResult {
  brandName: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
}

export async function getMarketedDrugs(
  disease: string,
  _drugType: string,
  _dosageForm: string,
): Promise<MarketedDrugResult[]> {
  const prompt = `List 20 real marketed pharmaceutical drugs for treating ${disease}. Include ALL available dosage forms and both allopathic and herbal/Ayurvedic brands. Use real brand names, manufacturers, and strengths from pharmacopoeia. Return ONLY a JSON array of objects with fields: brandName, genericName, manufacturer, dosageForm, strength. Return ONLY valid JSON array, no markdown.`;
  const result = await callAI(prompt);
  if (!result) return [];
  const parsed = parseJSON<MarketedDrugResult[]>(result);
  return Array.isArray(parsed) ? parsed : [];
}

export interface FormulationSummaryData {
  narrative: string;
  procedure: string[];
  instruments: string[];
  glassware: string[];
}

export async function getFormulationSummary(
  ingredients: { name: string; quantity: number; unit: string; role: string }[],
  dosageForm: string,
  method: string,
): Promise<FormulationSummaryData | null> {
  const prompt = `For a ${dosageForm} pharmaceutical formulation prepared by ${method} method using: ${ingredients.map((i) => `${i.name} ${i.quantity}${i.unit} (${i.role})`).join(", ")}.
Return a JSON object with:
- narrative: 4-6 sentence clinical rationale (pharmacopeia-based)
- procedure: array of 8-10 step-by-step manufacturing procedure strings
- instruments: array of 8-12 laboratory instruments required
- glassware: array of 6-10 glassware items required
Return ONLY valid JSON, no markdown.`;
  const result = await callAI(prompt);
  if (!result) return null;
  return parseJSON<FormulationSummaryData>(result);
}

export async function getCompositionPharmacology(
  ingredients: { name: string; quantity: number; unit: string; role: string }[],
  dosageForm: string,
  disease?: string,
): Promise<string> {
  const prompt = `Describe the combined pharmacological effects of this ${dosageForm} formulation${disease ? ` for treating ${disease}` : ""}: ${ingredients.map((i) => `${i.name} ${i.quantity}${i.unit} (${i.role})`).join(", ")}. Write a comprehensive 4-6 sentence paragraph covering mechanism of action, key active constituents and their targets, therapeutic effects, bioavailability, and clinical rationale. Be pharmacopeia-accurate. Return ONLY the paragraph text, no JSON, no headers.`;
  const result = await callAI(prompt);
  return result ?? "Pharmacological effects data unavailable.";
}

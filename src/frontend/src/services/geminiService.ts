// AI Service for AyurNexis 3.1 (powered by Puter.js)

/* global puter */
declare const puter: {
  ai: {
    chat: (
      prompt: string,
      options?: { model?: string; stream?: boolean },
    ) => Promise<
      | { message?: { content?: { text?: string }[] }; toString?: () => string }
      | string
    >;
  };
};

async function callAI(prompt: string): Promise<string | null> {
  try {
    const response = await puter.ai.chat(prompt);
    if (!response) return null;
    if (typeof response === "string") return response;
    // Claude-style response
    const msg = (response as { message?: { content?: { text?: string }[] } })
      .message;
    if (msg?.content?.[0]?.text) return msg.content[0].text;
    // Fallback toString
    if (
      typeof (response as { toString?: () => string }).toString === "function"
    ) {
      return (response as { toString: () => string }).toString();
    }
    return JSON.stringify(response);
  } catch {
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
- ingredients (array): each with name (string), quantity (number), unit (string), role (string), pharmacologicalEffect (string - specific mechanism of this ingredient)
- advantages (array of 3-5 strings)
- disadvantages (array of 2-3 strings)
- stabilityPrediction (string)
- mechanismOfAction (string): 2-3 sentence combined mechanism
- drugInteractions (array of strings)
- clinicalRationale (string): 2-3 sentences
- pharmacologicalEffects (string): comprehensive 4-6 sentence paragraph covering overall mechanism of action, key active constituents and their receptor/enzyme targets, therapeutic effects, bioavailability considerations, and clinical rationale for this specific disease
- indicationsForDisease (string): comma-separated list of all diseases/conditions this formulation is indicated for
- contraindications (array of strings): specific contraindications
- dosageInstructions (string): dosage and administration instructions

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
- compatibilityMatrix: array of {ingredient1 (string), ingredient2 (string), status ('compatible'|'incompatible'|'conditional'), reason (string)}
- stabilityAssessment: {physicalStability (string), chemicalStability (string), predictedShelfLife (string), ichClassification (string), stabilityScore (number 0-100), hygroscopicIngredients (string array), thermolabileIngredients (string array), lightSensitiveIngredients (string array)}
- advantages: string array
- disadvantages: string array
- interIngredientReactions: array of {ingredient1 (string), ingredient2 (string), reactionType (string), description (string), severity ('low'|'medium'|'high')}
- hplcProfile: array of {constituentName (string), retentionTime (number in minutes), peakArea (number as percentage), ingredient (string)}
- uvSpectrum: {lambdaMax (number in nm), absorptionRange (string), chromophores (string array)}
- ftirProfile: array of {functionalGroup (string), wavenumber (number in cm-1), transmittance (number as %)}
- dscProfile: array of {ingredient (string), event (string), temperature (number in celsius), enthalpy (number in J/g)}
- dissolutionProfile: array of {timeMinutes (number), percentReleased (number)}
Return ONLY valid JSON, no markdown.`;
  const result = await callAI(prompt);
  if (!result) return null;
  return parseJSON<FormulationAnalysis>(result);
}

// ─── Marketed Drugs ───────────────────────────────────────────────────────────

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
  const prompt = `List 20 real marketed pharmaceutical drugs for treating ${disease}. Include ALL available dosage forms (tablets, capsules, injections, syrups, creams, patches, suppositories, inhalers, etc.) and both allopathic and herbal/Ayurvedic brands. Use real brand names, manufacturers, and strengths from pharmacopoeia. Return ONLY a JSON array of objects with fields: brandName (string), genericName (string), manufacturer (string), dosageForm (string), strength (string). Example: [{"brandName":"Glucophage","genericName":"Metformin HCl","manufacturer":"Merck","dosageForm":"Tablet","strength":"500 mg"}]. Return ONLY valid JSON array, no markdown.`;
  const result = await callAI(prompt);
  if (!result) return [];
  const parsed = parseJSON<MarketedDrugResult[]>(result);
  return Array.isArray(parsed) ? parsed : [];
}

// ─── Formulation Summary ──────────────────────────────────────────────────────

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
- narrative: a 4-6 sentence clinical rationale for this formulation covering pharmacological mechanisms, therapeutic synergy, and clinical evidence basis (scientific, pharmacopeia-based)
- procedure: array of 8-10 step-by-step manufacturing procedure strings (detailed, numbered context omitted, specific to ${dosageForm} by ${method})
- instruments: array of 8-12 laboratory instruments required (e.g. "Tablet Compression Machine", "Analytical Balance", "Dissolution Apparatus USP Type II")
- glassware: array of 6-10 glassware items required (e.g. "250 mL Beaker", "100 mL Volumetric Flask", "Conical Flask 500 mL")
Return ONLY valid JSON, no markdown.`;
  const result = await callAI(prompt);
  if (!result) return null;
  return parseJSON<FormulationSummaryData>(result);
}

// ─── Composition Pharmacology ─────────────────────────────────────────────────

export async function getCompositionPharmacology(
  ingredients: { name: string; quantity: number; unit: string; role: string }[],
  dosageForm: string,
  disease?: string,
): Promise<string> {
  const prompt = `Describe the combined pharmacological effects of this ${dosageForm} formulation${disease ? ` for treating ${disease}` : ""}: ${ingredients.map((i) => `${i.name} ${i.quantity}${i.unit} (${i.role})`).join(", ")}. Write a comprehensive 4-6 sentence paragraph covering: overall mechanism of action, key active constituents and their targets, therapeutic effects, bioavailability considerations, and clinical rationale. Be specific and pharmacopeia-accurate. Return ONLY the paragraph text, no JSON, no headers.`;
  const result = await callAI(prompt);
  return result ?? "Pharmacological effects data unavailable.";
}

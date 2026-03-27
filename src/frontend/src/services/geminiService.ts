// Gemini API Service for AyurNexis 3.1
const GEMINI_API_KEY = "AIzaSyCkAAD9UcBo5KH1edlmz4vs61rAPJpRHQU";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt: string): Promise<string | null> {
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
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
    // Try extracting JSON from text
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
  const prompt = `List 10 medical diseases or conditions that match or relate to: '${query}'. Return ONLY a JSON array of strings, no explanation. Example: ["Disease 1", "Disease 2"]`;
  const result = await callGemini(prompt);
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
  const prompt = `Generate 5 novel pharmaceutical formulation ideas for treating ${disease} as a ${dosageForm} using ${drugType} approach. For each, return a JSON array of objects with these exact fields: compositionName (string), ingredients (array of objects with name (string), quantity (number), unit (string), role (string), pharmacologicalEffect (string)), advantages (array of strings), disadvantages (array of strings), stabilityPrediction (string), mechanismOfAction (string), drugInteractions (array of strings), clinicalRationale (string). Return ONLY valid JSON array, no markdown, no explanation.`;
  const result = await callGemini(prompt);
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
  const result = await callGemini(prompt);
  if (!result) return null;
  return parseJSON<FormulationAnalysis>(result);
}

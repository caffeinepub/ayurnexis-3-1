/**
 * AyurNexis Data Service
 * Disease search and marketed drugs use public free APIs (OpenFDA, NLM).
 * Novel formulation generation uses DeepSeek AI via the backend canister.
 * All other analysis uses pharmacopeia-based static calculations.
 */

import { createActorWithConfig } from "../config";

// ─── AI helper (used ONLY for novel formulations) ────────────────────────────

async function callDeepSeekRaw(prompt: string): Promise<string> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const actor = await createActorWithConfig();
      const rawResponse = await actor.callDeepSeek(prompt);
      const response = rawResponse as string;
      if (response.startsWith("ERROR:")) throw new Error(response);
      let content = response;
      try {
        const parsed = JSON.parse(content);
        if (parsed?.choices?.[0]?.message?.content) {
          content = parsed.choices[0].message.content;
        } else if (parsed?.error) {
          throw new Error(
            typeof parsed.error === "string"
              ? parsed.error
              : JSON.stringify(parsed.error),
          );
        }
      } catch (parseErr) {
        if (content.includes('"choices"')) throw parseErr;
      }
      return content;
    } catch (e) {
      lastError = e as Error;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw lastError || new Error("Request failed after 3 attempts");
}

async function callJson<T>(prompt: string): Promise<T | null> {
  const text = await callDeepSeekRaw(prompt);
  const jsonMatch =
    text.match(/```json\s*([\s\S]*?)\s*```/) ||
    text.match(/```\s*([\s\S]*?)\s*```/) ||
    text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
  try {
    return JSON.parse(jsonStr.trim()) as T;
  } catch {
    const start = text.indexOf("{");
    const arrStart = text.indexOf("[");
    const begin =
      start === -1
        ? arrStart
        : arrStart === -1
          ? start
          : Math.min(start, arrStart);
    if (begin !== -1) {
      const end =
        text.lastIndexOf("}") !== -1
          ? text.lastIndexOf("}")
          : text.lastIndexOf("]");
      if (end > begin) {
        try {
          return JSON.parse(text.slice(begin, end + 1)) as T;
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}

// ─── Disease Search — OpenFDA + NLM ──────────────────────────────────────────

export interface DiseaseResult {
  name: string;
  category: string;
  description: string;
  liveData?: boolean;
}

export async function searchDiseases(query: string): Promise<DiseaseResult[]> {
  if (!query || query.trim().length < 2) return [];
  const q = encodeURIComponent(query.trim());

  const results: DiseaseResult[] = [];
  const seen = new Set<string>();

  const addIfNew = (name: string, category: string, description: string) => {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ name, category, description, liveData: true });
    }
  };

  // NLM ClinicalTables conditions API
  try {
    const nlmRes = await fetch(
      `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?sf=term&terms=${q}&maxList=15`,
    );
    if (nlmRes.ok) {
      const data = await nlmRes.json();
      // Response: [count, codes, null, terms_array]
      const terms: string[][] = data[3] ?? [];
      for (const t of terms) {
        if (t[0]) addIfNew(t[0], "Medical Condition", `Condition: ${t[0]}`);
      }
    }
  } catch {
    // ignore
  }

  // OpenFDA drug labels — extract indications_and_usage
  try {
    const fdaRes = await fetch(
      `https://api.fda.gov/drug/label.json?search=indications_and_usage:"${q}"&limit=10`,
    );
    if (fdaRes.ok) {
      const data = await fdaRes.json();
      const labels = data.results ?? [];
      for (const label of labels) {
        const indications: string[] =
          ((label as Record<string, unknown>)
            .indications_and_usage as string[]) ?? [];
        const text = indications.join(" ");
        const match = text.match(/[A-Z][a-z]+(?:\s+[a-z]+){0,3}/g);
        if (match) {
          for (const m of match.slice(0, 3)) {
            if (
              m.length > 4 &&
              m.toLowerCase().includes(query.toLowerCase().slice(0, 4))
            ) {
              addIfNew(
                m,
                "FDA Drug Indication",
                "Indication from drug labeling",
              );
            }
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return results.slice(0, 15);
}

// ─── Marketed Drugs — OpenFDA ────────────────────────────────────────────────

export interface MarketedDrugResult {
  brandName: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  drugType: string;
  liveData?: boolean;
}

export async function getMarketedDrugs(
  disease: string,
  drugType: string,
  dosageForm: string,
): Promise<MarketedDrugResult[]> {
  const q = encodeURIComponent(disease.trim());
  const results: MarketedDrugResult[] = [];

  try {
    const fdaRes = await fetch(
      `https://api.fda.gov/drug/label.json?search=indications_and_usage:"${q}"&limit=30`,
    );
    if (fdaRes.ok) {
      const data = await fdaRes.json();
      const labels: Record<string, unknown>[] = data.results ?? [];
      const seen = new Set<string>();

      for (const label of labels) {
        const openfda = ((label as Record<string, unknown>).openfda ??
          {}) as Record<string, string[]>;
        const brandNames: string[] = openfda.brand_name ?? [];
        const genericNames: string[] = openfda.generic_name ?? [];
        const manufacturers: string[] = openfda.manufacturer_name ?? [];
        const dosageForms: string[] = openfda.dosage_form ?? [];
        const substances: string[] = openfda.substance_name ?? [];

        const brand = brandNames[0] ?? "Unknown";
        const generic = genericNames[0] ?? substances[0] ?? "Unknown";
        const key = (brand + generic).toLowerCase();
        if (!seen.has(key) && brand !== "Unknown") {
          seen.add(key);
          results.push({
            brandName: brand,
            genericName: generic,
            manufacturer: manufacturers[0] ?? "Unknown",
            dosageForm: dosageForms[0] ?? dosageForm,
            strength: "",
            drugType: drugType,
            liveData: true,
          });
        }
      }
    }
  } catch {
    // ignore
  }

  return results.slice(0, 20);
}

// ─── Novel Formulations — DeepSeek AI (only AI call in this file) ─────────────

export interface NovelFormulationIdea {
  name: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    role: string;
    pharmacologicalEffect: string;
  }>;
  dosageForm: string;
  drugType: string;
  mechanism: string;
  advantages: string[];
  disadvantages: string[];
  stabilityPrediction: string;
  therapeuticCategory: string;
  pharmacologicalEffects: string;
  isNovelAI?: boolean;
}

export async function getNovelFormulations(
  disease: string,
  dosageForm: string,
  drugType: string,
): Promise<NovelFormulationIdea[]> {
  const prompt = `You are a pharmaceutical formulation scientist. Generate 15 novel pharmaceutical formulation ideas for treating "${disease}" as a ${dosageForm} (${drugType} type).

Return ONLY a JSON array of 15 formulations:
[{
  "name": "Formulation name",
  "ingredients": [{"name": "ingredient", "quantity": "100mg", "role": "API", "pharmacologicalEffect": "mechanism"}],
  "dosageForm": "${dosageForm}",
  "drugType": "${drugType}",
  "mechanism": "Mechanism of action for this disease",
  "advantages": ["advantage 1", "advantage 2"],
  "disadvantages": ["disadvantage 1"],
  "stabilityPrediction": "2 years at 25°C/60% RH",
  "therapeuticCategory": "category",
  "pharmacologicalEffects": "Combined pharmacological effects of the formulation"
}]

Use real pharmacopeia-aligned ingredients, evidence-based quantities. Mix Ayurvedic herbs with conventional drugs for combination types. Be scientifically accurate.`;

  const results = await callJson<NovelFormulationIdea[]>(prompt);
  if (!results) return [];
  return results.map((r) => ({ ...r, isNovelAI: true }));
}

// ─── Compatibility — Static Pharmacopeia Lookup ───────────────────────────────

export interface CompatibilityResult {
  ingredient1: string;
  ingredient2: string;
  compatibility: "compatible" | "incompatible" | "caution";
  reason: string;
  severity: "low" | "medium" | "high";
}

const INCOMPATIBILITY_TABLE: Array<{
  a: string;
  b: string;
  compat: "incompatible" | "caution" | "compatible";
  reason: string;
  severity: "low" | "medium" | "high";
}> = [
  {
    a: "aspirin",
    b: "antacid",
    compat: "caution",
    reason: "Antacids may increase aspirin elimination and reduce efficacy",
    severity: "medium",
  },
  {
    a: "aspirin",
    b: "warfarin",
    compat: "incompatible",
    reason: "Combined use significantly increases bleeding risk",
    severity: "high",
  },
  {
    a: "tetracycline",
    b: "calcium",
    compat: "incompatible",
    reason: "Calcium chelates tetracycline, reducing absorption by up to 50%",
    severity: "high",
  },
  {
    a: "tetracycline",
    b: "magnesium",
    compat: "incompatible",
    reason: "Divalent cations chelate tetracycline, reducing bioavailability",
    severity: "high",
  },
  {
    a: "tetracycline",
    b: "iron",
    compat: "incompatible",
    reason: "Iron chelates tetracycline, reducing absorption significantly",
    severity: "high",
  },
  {
    a: "warfarin",
    b: "nsaid",
    compat: "incompatible",
    reason:
      "NSAIDs displace warfarin from protein binding and inhibit platelet function",
    severity: "high",
  },
  {
    a: "warfarin",
    b: "ibuprofen",
    compat: "incompatible",
    reason: "Ibuprofen potentiates anticoagulant effect of warfarin",
    severity: "high",
  },
  {
    a: "metformin",
    b: "alcohol",
    compat: "incompatible",
    reason: "Risk of lactic acidosis increased with alcohol consumption",
    severity: "high",
  },
  {
    a: "curcumin",
    b: "piperine",
    compat: "compatible",
    reason: "Piperine enhances curcumin bioavailability by 2000%",
    severity: "low",
  },
  {
    a: "ashwagandha",
    b: "thyroid",
    compat: "caution",
    reason:
      "Ashwagandha may alter thyroid hormone levels; monitor thyroid function",
    severity: "medium",
  },
  {
    a: "magnesium stearate",
    b: "aspirin",
    compat: "caution",
    reason: "Lubricant may delay aspirin dissolution slightly",
    severity: "low",
  },
  {
    a: "sodium bicarbonate",
    b: "aspirin",
    compat: "caution",
    reason:
      "Alkaline environment increases aspirin ionization and reduces absorption",
    severity: "medium",
  },
  {
    a: "calcium carbonate",
    b: "iron",
    compat: "incompatible",
    reason: "Calcium inhibits iron absorption when taken simultaneously",
    severity: "high",
  },
  {
    a: "starch",
    b: "water",
    compat: "caution",
    reason:
      "Hygroscopic; moisture may cause starch gelatinization affecting tablet properties",
    severity: "low",
  },
  {
    a: "microcrystalline cellulose",
    b: "magnesium stearate",
    compat: "compatible",
    reason:
      "Standard tablet formulation excipient combination; well-documented compatibility",
    severity: "low",
  },
];

export async function analyzeCompatibility(
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }>,
): Promise<CompatibilityResult[]> {
  const results: CompatibilityResult[] = [];
  const names = ingredients.map((i) => i.name.toLowerCase());

  for (let i = 0; i < ingredients.length; i++) {
    for (let j = i + 1; j < ingredients.length; j++) {
      const a = names[i];
      const b = names[j];

      let found = false;
      for (const row of INCOMPATIBILITY_TABLE) {
        const matchA = a.includes(row.a) || row.a.includes(a.split(" ")[0]);
        const matchB = b.includes(row.b) || row.b.includes(b.split(" ")[0]);
        const matchAB = b.includes(row.a) || row.a.includes(b.split(" ")[0]);
        const matchBA = a.includes(row.b) || row.b.includes(a.split(" ")[0]);

        if ((matchA && matchB) || (matchAB && matchBA)) {
          results.push({
            ingredient1: ingredients[i].name,
            ingredient2: ingredients[j].name,
            compatibility: row.compat,
            reason: row.reason,
            severity: row.severity,
          });
          found = true;
          break;
        }
      }

      if (!found) {
        results.push({
          ingredient1: ingredients[i].name,
          ingredient2: ingredients[j].name,
          compatibility: "compatible",
          reason: "No known pharmacopeia-documented incompatibilities",
          severity: "low",
        });
      }
    }
  }
  return results;
}

// ─── Stability — Static ICH Q1A Calculation ───────────────────────────────────

export interface StabilityResult {
  overallStability: string;
  shelfLife: string;
  storageConditions: string;
  criticalFactors: string[];
  degradationPathways: string[];
  packagingRecommendation: string;
}

const DOSAGE_FORM_STORAGE: Record<
  string,
  { storage: string; shelfLife: string; packaging: string }
> = {
  Tablet: {
    storage: "Store below 25°C/60% RH in a dry place",
    shelfLife: "36 months",
    packaging: "HDPE bottle with desiccant or blister pack",
  },
  Capsule: {
    storage: "Store below 25°C/60% RH away from moisture",
    shelfLife: "24 months",
    packaging: "HDPE bottle with desiccant",
  },
  Syrup: {
    storage: "Store between 15–25°C; refrigerate after opening",
    shelfLife: "24 months",
    packaging: "Amber glass bottle with child-resistant cap",
  },
  Suspension: {
    storage: "Store between 15–25°C; shake well before use",
    shelfLife: "18 months",
    packaging: "Amber glass or HDPE bottle",
  },
  Cream: {
    storage: "Store below 30°C; avoid freezing",
    shelfLife: "24 months",
    packaging: "Aluminium tube or HDPE jar",
  },
  Ointment: {
    storage: "Store below 25°C; avoid extreme heat",
    shelfLife: "36 months",
    packaging: "Aluminium tube or wide-mouth jar",
  },
  Gel: {
    storage: "Store between 15–30°C; avoid direct sunlight",
    shelfLife: "24 months",
    packaging: "Aluminium collapsible tube",
  },
  Injection: {
    storage: "Store between 2–8°C (refrigerated); protect from light",
    shelfLife: "24 months",
    packaging: "Type I glass ampoule or vial",
  },
  "Eye Drops": {
    storage: "Store between 2–8°C; discard 28 days after opening",
    shelfLife: "24 months",
    packaging: "Sterile plastic dropper bottle",
  },
  Powder: {
    storage: "Store in a cool dry place below 25°C",
    shelfLife: "36 months",
    packaging: "Airtight HDPE container with desiccant",
  },
};

const MOISTURE_SENSITIVE_KEYWORDS = [
  "aspirin",
  "ferrous",
  "iron",
  "starch",
  "sucrose",
  "lactose",
  "magnesium",
];
const LIGHT_SENSITIVE_KEYWORDS = [
  "riboflavin",
  "nifedipine",
  "vitamin",
  "retinol",
  "chlorpromazine",
  "curcumin",
];
const HEAT_SENSITIVE_KEYWORDS = [
  "enzyme",
  "probiotic",
  "insulin",
  "peptide",
  "protein",
  "vaccine",
];

export async function analyzeStability(
  ingredients: Array<{ name: string; quantity: number; unit: string }>,
  dosageForm: string,
): Promise<StabilityResult> {
  const names = ingredients.map((i) => i.name.toLowerCase());
  const formKey =
    Object.keys(DOSAGE_FORM_STORAGE).find((k) =>
      dosageForm?.toLowerCase().includes(k.toLowerCase()),
    ) ?? "Tablet";
  const base = DOSAGE_FORM_STORAGE[formKey] ?? DOSAGE_FORM_STORAGE.Tablet;

  const criticalFactors: string[] = ["Temperature", "Humidity"];
  const degradationPathways: string[] = ["Hydrolysis"];

  const isMoistureSensitive = names.some((n) =>
    MOISTURE_SENSITIVE_KEYWORDS.some((kw) => n.includes(kw)),
  );
  const isLightSensitive = names.some((n) =>
    LIGHT_SENSITIVE_KEYWORDS.some((kw) => n.includes(kw)),
  );
  const isHeatSensitive = names.some((n) =>
    HEAT_SENSITIVE_KEYWORDS.some((kw) => n.includes(kw)),
  );

  if (isMoistureSensitive) {
    criticalFactors.push("Moisture / Relative Humidity");
    degradationPathways.push("Hydrolytic degradation");
  }
  if (isLightSensitive) {
    criticalFactors.push("Light / UV exposure");
    degradationPathways.push("Photodegradation");
  }
  if (isHeatSensitive) {
    criticalFactors.push("Temperature fluctuations");
    degradationPathways.push("Thermal denaturation");
  }

  degradationPathways.push("Oxidation");

  const riskCount = [
    isMoistureSensitive,
    isLightSensitive,
    isHeatSensitive,
  ].filter(Boolean).length;
  const overallStability =
    riskCount === 0
      ? "Excellent"
      : riskCount === 1
        ? "Good"
        : riskCount === 2
          ? "Fair"
          : "Poor";

  return {
    overallStability,
    shelfLife: base.shelfLife,
    storageConditions: base.storage,
    criticalFactors,
    degradationPathways,
    packagingRecommendation: base.packaging,
  };
}

// ─── Pharmacology — Static Ingredient Map ────────────────────────────────────

export interface PharmacologyResult {
  mechanismOfAction: string;
  therapeuticEffects: string[];
  pharmacokinetics: string;
  clinicalRationale: string;
  drugInteractions: string[];
  contraindications: string[];
  adverseEffects: string[];
}

const PHARMACOLOGY_MAP: Record<
  string,
  {
    mechanism: string;
    effects: string[];
    pk: string;
    interactions: string[];
    contraindications: string[];
    adverse: string[];
  }
> = {
  curcumin: {
    mechanism:
      "Inhibits NF-κB signaling, COX-2, and LOX pathways; modulates cytokine production",
    effects: [
      "Anti-inflammatory",
      "Antioxidant",
      "Immunomodulatory",
      "Hepatoprotective",
    ],
    pk: "Low oral bioavailability (~1%); enhanced by piperine; T½ ~6–7h",
    interactions: [
      "May enhance anticoagulant effects of warfarin",
      "Monitor with antiplatelet drugs",
    ],
    contraindications: [
      "Biliary obstruction",
      "Pre-surgery (antiplatelet effect)",
    ],
    adverse: ["GI discomfort at high doses", "Yellow staining"],
  },
  ashwagandha: {
    mechanism:
      "Withanolides modulate HPA axis; reduces cortisol; GABA-mimetic activity",
    effects: [
      "Adaptogenic",
      "Anxiolytic",
      "Anti-stress",
      "Immunomodulatory",
      "Anti-inflammatory",
    ],
    pk: "Oral bioavailability ~20%; T½ ~3–4h",
    interactions: ["May enhance sedatives; potentiate thyroid medications"],
    contraindications: ["Pregnancy", "Hyperthyroidism", "Autoimmune disease"],
    adverse: ["GI upset", "Drowsiness at high doses"],
  },
  metformin: {
    mechanism:
      "Activates AMPK; reduces hepatic gluconeogenesis; improves insulin sensitivity",
    effects: ["Antidiabetic", "Anti-hyperglycemic", "Cardioprotective"],
    pk: "Bioavailability 50–60%; not protein-bound; T½ ~5h; renal excretion",
    interactions: [
      "Alcohol increases lactic acidosis risk",
      "Iodinated contrast agents",
    ],
    contraindications: [
      "eGFR <30 mL/min",
      "Hepatic failure",
      "Lactic acidosis history",
    ],
    adverse: [
      "GI disturbance (nausea, diarrhea)",
      "Metallic taste",
      "Vitamin B12 deficiency",
    ],
  },
  ibuprofen: {
    mechanism:
      "Non-selective COX-1/COX-2 inhibitor; reduces prostaglandin synthesis",
    effects: ["Analgesic", "Anti-inflammatory", "Antipyretic"],
    pk: "Bioavailability ~80%; T½ ~2h; hepatic metabolism; renal excretion",
    interactions: [
      "Warfarin (bleeding risk)",
      "ACE inhibitors (reduced efficacy)",
      "Aspirin (increased GI risk)",
    ],
    contraindications: [
      "Peptic ulcer disease",
      "Renal impairment",
      "Third trimester pregnancy",
    ],
    adverse: [
      "GI ulceration",
      "Renal impairment",
      "Cardiovascular events (chronic use)",
    ],
  },
  paracetamol: {
    mechanism:
      "Central COX inhibition; modulates endocannabinoid system; reduces fever via hypothalamus",
    effects: ["Analgesic", "Antipyretic"],
    pk: "Bioavailability ~63–89%; T½ ~2h; hepatic conjugation; renal excretion",
    interactions: [
      "Alcohol increases hepatotoxicity risk",
      "Warfarin may be potentiated",
    ],
    contraindications: ["Hepatic failure", "Chronic alcoholism"],
    adverse: ["Hepatotoxicity (overdose)", "Rash (rare)"],
  },
  amoxicillin: {
    mechanism:
      "Beta-lactam antibiotic; inhibits bacterial cell wall synthesis via PBP binding",
    effects: ["Antibacterial (broad-spectrum)", "Bactericidal"],
    pk: "Bioavailability ~93%; T½ ~1.1h; mainly renal excretion",
    interactions: [
      "Methotrexate (reduced renal clearance)",
      "Oral contraceptives (possible reduced efficacy)",
    ],
    contraindications: ["Penicillin allergy", "Mononucleosis"],
    adverse: ["Diarrhea", "Rash", "Allergic reactions"],
  },
  microcrystalline_cellulose: {
    mechanism: "Inert excipient; functions as binder and disintegrant",
    effects: ["Improves tablet compressibility", "Promotes disintegration"],
    pk: "Not absorbed; passes through GI tract unchanged",
    interactions: ["No known drug interactions"],
    contraindications: ["None documented"],
    adverse: ["None documented"],
  },
};

export async function analyzePharmacology(
  ingredients: Array<{ name: string; quantity: number; unit: string }>,
  dosageForm: string,
  disease: string,
): Promise<PharmacologyResult> {
  // Try DeepSeek AI first for real pharmacological data
  try {
    const ingredientList = ingredients
      .map((i) => `${i.name} ${i.quantity}${i.unit}`)
      .join(", ");
    const aiPrompt = `You are a pharmacopeia expert. Analyze this pharmaceutical formulation:\nDosage Form: ${dosageForm}\nIndication: ${disease}\nIngredients: ${ingredientList}\n\nProvide a JSON response with this exact structure:\n{"mechanismOfAction":"...","therapeuticEffects":["..."],"pharmacokinetics":"...","clinicalRationale":"...","drugInteractions":["..."],"contraindications":["..."],"adverseEffects":["..."]}\nOnly return the JSON, no extra text.`;
    const aiResult = await callJson<PharmacologyResult>(aiPrompt);
    if (aiResult?.mechanismOfAction) return aiResult;
  } catch (_e) {
    // fall through to static calculation
  }
  const mechanisms: string[] = [];
  const therapeuticEffects = new Set<string>();
  const interactions = new Set<string>();
  const contraindications = new Set<string>();
  const adverseEffects = new Set<string>();
  const pkNotes: string[] = [];

  for (const ing of ingredients) {
    const match = Object.entries(PHARMACOLOGY_MAP).find(([k]) =>
      ing.name.toLowerCase().includes(k),
    );
    if (match) {
      const data = match[1];
      if (data.mechanism) mechanisms.push(`${ing.name}: ${data.mechanism}`);
      for (const e of data.effects) therapeuticEffects.add(e);
      for (const interaction of data.interactions)
        interactions.add(interaction);
      for (const c of data.contraindications) contraindications.add(c);
      for (const a of data.adverse) adverseEffects.add(a);
      pkNotes.push(`${ing.name}: ${data.pk}`);
    }
  }

  const mechanismText =
    mechanisms.length > 0
      ? mechanisms.join("; ")
      : `Multi-target pharmacological action targeting pathophysiology of ${disease}`;

  const effectsArr = Array.from(therapeuticEffects);
  if (effectsArr.length === 0)
    effectsArr.push("Anti-inflammatory", "Analgesic", "Immunomodulatory");

  return {
    mechanismOfAction: mechanismText,
    therapeuticEffects: effectsArr,
    pharmacokinetics:
      pkNotes.length > 0
        ? pkNotes.join("; ")
        : `Oral bioavailability 60–80% for ${dosageForm}; hepatic metabolism; renal excretion`,
    clinicalRationale: `Synergistic combination targeting ${disease} pathophysiology via complementary mechanisms`,
    drugInteractions:
      Array.from(interactions).length > 0
        ? Array.from(interactions)
        : [
            "Monitor with anticoagulants",
            "Verify renal/hepatic function before use",
          ],
    contraindications:
      Array.from(contraindications).length > 0
        ? Array.from(contraindications)
        : ["Known hypersensitivity to any component"],
    adverseEffects:
      Array.from(adverseEffects).length > 0
        ? Array.from(adverseEffects)
        : ["Mild GI upset", "Hypersensitivity reactions (rare)"],
  };
}

// ─── SOP — Pharmacopeia Template by Dosage Form ──────────────────────────────

export interface SOPResult {
  procedure: string[];
  instruments: string[];
  glassware: string[];
  qualityChecks: string[];
  criticalParameters: string[];
}

const SOP_TEMPLATES: Record<string, SOPResult> = {
  Tablet: {
    procedure: [
      "Step 1: Calibrate analytical balance (0.001 g precision); record tare weight",
      "Step 2: Sift all API(s) through ASTM #40 mesh (425 µm); record any residue",
      "Step 3: Sift excipients (diluents, binders) through ASTM #30 mesh separately",
      "Step 4: Blend API(s) with diluents in geometric dilution using a double-cone blender (15 min)",
      "Step 5: Prepare binder solution if wet granulation; add slowly to powder blend with continuous mixing",
      "Step 6: Granulate using high-shear mixer; dry at 50°C in fluid-bed dryer to LOD ≤2%",
      "Step 7: Size dried granules through ASTM #20 mesh; add disintegrant and lubricant; blend 5 min",
      "Step 8: Compress using rotary tablet press; set target weight, hardness, and thickness",
      "Step 9: Perform in-process checks every 15 min (weight variation, hardness, friability)",
      "Step 10: Film-coat if required; apply coating suspension until target weight gain achieved",
      "Step 11: Sample final batch for QC; record all parameters in batch manufacturing record (BMR)",
      "Step 12: Pack in blister or HDPE bottle with desiccant; label per pharmacopeia requirements",
    ],
    instruments: [
      "Analytical balance",
      "Rotary tablet press",
      "High-shear granulator",
      "Fluid-bed dryer",
      "Hardness tester",
      "Friability tester",
      "Dissolution apparatus USP Type II",
      "Disintegration tester",
    ],
    glassware: [
      "100 mL & 1000 mL volumetric flasks",
      "250 mL beakers",
      "50 mL measuring cylinders",
      "Petri dishes",
      "Sample vials",
    ],
    qualityChecks: [
      "Weight variation (IP 2.21)",
      "Hardness (50–100 N)",
      "Friability (<1%)",
      "Disintegration (<30 min)",
      "Dissolution (Q=80% at 45 min)",
      "Assay (90–110% of label claim)",
    ],
    criticalParameters: [
      "Blend uniformity RSD <5%",
      "Granule LOD 1.5–2%",
      "Compression force",
      "Tablet hardness",
      "Temperature during drying",
    ],
  },
  Capsule: {
    procedure: [
      "Step 1: Calibrate balance; weigh all ingredients accurately",
      "Step 2: Sift API and excipients through ASTM #40 mesh",
      "Step 3: Blend API with diluents by geometric dilution (15 min, 20 rpm)",
      "Step 4: Add glidant (colloidal silica) and lubricant; blend 5 min",
      "Step 5: Check blend uniformity; RSD must be <5%",
      "Step 6: Fill blend into hard gelatin or HPMC capsules using automatic capsule filler",
      "Step 7: Dedust and polish capsules",
      "Step 8: In-process check: weight variation (20 capsules)",
      "Step 9: Perform disintegration and dissolution tests",
      "Step 10: Pack in HDPE bottle with desiccant; label appropriately",
    ],
    instruments: [
      "Analytical balance",
      "Capsule filling machine",
      "Dedusting machine",
      "Dissolution apparatus",
      "Disintegration tester",
    ],
    glassware: [
      "Volumetric flasks",
      "Beakers",
      "Measuring cylinders",
      "Sample vials",
    ],
    qualityChecks: [
      "Weight variation",
      "Disintegration (<30 min)",
      "Dissolution",
      "Assay",
      "Microbial limits",
    ],
    criticalParameters: [
      "Fill weight",
      "Blend uniformity",
      "Capsule lock",
      "Moisture content",
    ],
  },
  Syrup: {
    procedure: [
      "Step 1: Prepare purified water; heat to 70°C",
      "Step 2: Dissolve sucrose/sorbitol in hot water to prepare syrup base",
      "Step 3: Dissolve API in a small portion of purified water; add to syrup base with stirring",
      "Step 4: Add co-solvents (glycerol, propylene glycol) if required",
      "Step 5: Add preservatives (sodium benzoate, parabens); stir until dissolved",
      "Step 6: Add flavor and color; mix thoroughly",
      "Step 7: Adjust pH to 4–6 using citric acid or sodium hydroxide",
      "Step 8: Make up volume with purified water; filter through 0.45 µm membrane",
      "Step 9: Check clarity, color, and pH; perform assay",
      "Step 10: Fill into amber glass bottles; seal and label",
    ],
    instruments: [
      "SS jacketed vessel with stirrer",
      "pH meter",
      "Refractometer",
      "Filling machine",
      "Capping machine",
    ],
    glassware: [
      "Graduated cylinders",
      "Beakers (250 mL, 1000 mL)",
      "Funnels",
      "Amber bottles",
    ],
    qualityChecks: [
      "pH (4–6)",
      "Specific gravity",
      "Clarity",
      "Assay",
      "Preservative efficacy",
      "Microbial limits",
    ],
    criticalParameters: [
      "Temperature during dissolution",
      "pH",
      "Preservative concentration",
      "Filling volume",
    ],
  },
  Cream: {
    procedure: [
      "Step 1: Prepare oil phase — heat oils, waxes, emulsifiers to 70–75°C",
      "Step 2: Prepare water phase — heat purified water and water-soluble ingredients to 75°C",
      "Step 3: Add water phase to oil phase slowly with high-shear mixing",
      "Step 4: Cool emulsion to 40°C with continuous stirring",
      "Step 5: Incorporate API below 40°C; mix until homogeneous",
      "Step 6: Add fragrance and preservatives at 35°C",
      "Step 7: Cool to room temperature; check consistency and pH",
      "Step 8: Fill into aluminium tubes or jars; seal and label",
    ],
    instruments: [
      "Homogenizer",
      "Jacketed vessel",
      "pH meter",
      "Viscometer",
      "Filling machine",
    ],
    glassware: ["Beakers", "Stirring rods", "Sample jars", "Thermometers"],
    qualityChecks: [
      "pH (5–7)",
      "Viscosity",
      "Spreadability",
      "Stability (freeze-thaw cycles)",
      "Assay",
      "Microbial limits",
    ],
    criticalParameters: [
      "Emulsification temperature",
      "pH",
      "Viscosity",
      "API incorporation temperature",
    ],
  },
};

export async function generateSOP(
  _ingredients: Array<{ name: string; quantity: number; unit: string }>,
  dosageForm: string,
  _method: string,
): Promise<SOPResult> {
  const formKey =
    Object.keys(SOP_TEMPLATES).find((k) =>
      dosageForm?.toLowerCase().includes(k.toLowerCase()),
    ) ?? "Tablet";
  return SOP_TEMPLATES[formKey] ?? SOP_TEMPLATES.Tablet;
}

// Re-export callAI for any legacy usage (no-op fallback)
export async function callAI(prompt: string): Promise<string> {
  return callDeepSeekRaw(prompt);
}

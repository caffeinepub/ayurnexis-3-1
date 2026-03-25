export interface Phytochemical {
  name: string;
  class: string;
  mechanism: string;
}

export interface DrugInteraction {
  drug: string;
  effect: string;
  severity: "Mild" | "Moderate" | "Severe";
}

export interface PharmacologicalProfile {
  herbId: string; // matches herbName (lowercase, spaces to dashes)
  herbName: string;
  latinName: string;
  family: string;
  part: string;
  pharmacopeiaRef: string;
  ayurvedicProperties: {
    rasa: string[];
    guna: string[];
    veerya: string;
    vipaka: string;
    prabhava: string;
    dosha: string;
  };
  therapeuticUses: string[];
  modernEvidence: string[];
  sideEffects: string[];
  contraindications: string[];
  interactions: DrugInteraction[];
  phytochemicals: Phytochemical[];
  dosage: {
    powder: string;
    extract: string;
    decoction: string;
    duration: string;
  };
  riskLevel: "Low" | "Medium" | "High";
  riskNotes: string;
  storage: string;
}

export const pharmacologicalProfiles: PharmacologicalProfile[] = [
  {
    herbId: "ashwagandha",
    herbName: "Ashwagandha",
    latinName: "Withania somnifera",
    family: "Solanaceae",
    part: "Root",
    pharmacopeiaRef: "IP 2022, WHO 2009",
    ayurvedicProperties: {
      rasa: ["Tikta", "Kashaya"],
      guna: ["Laghu", "Snigdha"],
      veerya: "Ushna",
      vipaka: "Madhura",
      prabhava: "Rasayana (rejuvenating)",
      dosha: "Vata-Kapha shamaka",
    },
    therapeuticUses: [
      "Adaptogen — reduces cortisol and serum stress markers",
      "Anxiolytic and anti-depressant effects (comparable to lorazepam in animal models)",
      "Improves thyroid function (T3/T4 modulation)",
      "Enhances male fertility — increases sperm count, motility",
      "Anti-inflammatory via NF-kB pathway inhibition",
      "Neuroprotective in Alzheimer's and Parkinson's models",
      "Immunomodulatory — enhances NK cell and T-cell activity",
      "Anti-arthritic — significant cartilage protection",
      "Anabolic — increases muscle mass and strength",
    ],
    modernEvidence: [
      "RCT (2012, JACN): 300mg/day KSM-66 reduces stress scores by 44%",
      "Meta-analysis (2021, Medicine): Significant reduction in anxiety and serum cortisol",
      "RCT (2015, EJCP): Improves VO2max and endurance in elite athletes",
      "Clinical trial (2019): 600mg/day improves memory and cognitive function",
    ],
    sideEffects: [
      "GI upset, nausea, diarrhea (especially on empty stomach)",
      "Sedation at high doses (>1000mg/day)",
      "Thyroid stimulation — risk in hyperthyroid patients",
      "Rare hepatotoxicity reported (case studies, high doses)",
      "Miscarriage risk — uterine stimulant",
    ],
    contraindications: [
      "Pregnancy (uterotonic)",
      "Hyperthyroidism (may increase T3/T4)",
      "Autoimmune conditions (SLE, RA, MS) without supervision",
      "Surgery — discontinue 2 weeks prior (CNS depressant effect)",
    ],
    interactions: [
      {
        drug: "Thyroid medications (levothyroxine)",
        effect: "Additive thyroid-stimulating effect — monitor TSH",
        severity: "Moderate",
      },
      {
        drug: "Immunosuppressants (cyclosporine)",
        effect: "May reduce drug efficacy via immune potentiation",
        severity: "Moderate",
      },
      {
        drug: "Sedatives/Benzodiazepines",
        effect: "Enhanced CNS depression",
        severity: "Moderate",
      },
      {
        drug: "Anti-diabetic drugs",
        effect: "Additive hypoglycemic effect",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Withanolide A",
        class: "Steroidal lactone",
        mechanism: "NF-kB inhibition, neuroprotection",
      },
      {
        name: "Withaferin A",
        class: "Steroidal lactone",
        mechanism: "Anti-tumor, anti-inflammatory",
      },
      {
        name: "Alkaloids (withanine, somniferine)",
        class: "Alkaloid",
        mechanism: "CNS modulation, sedation",
      },
      {
        name: "Sitoindosides VII-X",
        class: "Glycowithanolide",
        mechanism: "Immunomodulation, anti-stress",
      },
    ],
    dosage: {
      powder: "3–6g/day in divided doses",
      extract: "300–600mg/day (standardized to ≥5% withanolides)",
      decoction: "20–30ml twice daily",
      duration: "8–12 weeks continuous; 4-week wash-out recommended",
    },
    riskLevel: "Low",
    riskNotes:
      "Generally well tolerated. Risk increases at >1g/day or in pregnant/thyroid patients.",
    storage: "Cool, dry place; protect from moisture and light. 25°C max.",
  },
  {
    herbId: "turmeric",
    herbName: "Turmeric",
    latinName: "Curcuma longa",
    family: "Zingiberaceae",
    part: "Rhizome",
    pharmacopeiaRef: "IP 2022, BP 2023, WHO",
    ayurvedicProperties: {
      rasa: ["Tikta", "Katu"],
      guna: ["Laghu", "Ruksha"],
      veerya: "Ushna",
      vipaka: "Katu",
      prabhava: "Vishaghna (anti-toxic)",
      dosha: "Tridosha shamaka",
    },
    therapeuticUses: [
      "Potent anti-inflammatory — COX-2 and NF-kB inhibition",
      "Hepatoprotective and choleretic",
      "Antioxidant — DPPH radical scavenging",
      "Anti-neoplastic properties (colorectal, breast cancer models)",
      "Anti-diabetic — improves insulin sensitivity",
      "Wound healing and antimicrobial",
      "Arthritis management — comparable to ibuprofen in OA",
    ],
    modernEvidence: [
      "Systematic review (2016, Oncotarget): Curcumin modulates 700+ genes",
      "RCT (2014): Curcumin equivalent to ibuprofen for knee OA pain",
      "Meta-analysis (2019, Nutrients): Significant reduction in CRP and IL-6",
    ],
    sideEffects: [
      "GI disturbance at high doses (>8g/day)",
      "Iron absorption inhibition with chronic high-dose use",
      "Gallbladder contractions — avoid in gallstones",
      "Contact dermatitis (topical use)",
    ],
    contraindications: [
      "Gallstones or bile duct obstruction",
      "Bleeding disorders (anti-platelet effect)",
      "Pre-surgery (discontinue 2 weeks before)",
    ],
    interactions: [
      {
        drug: "Warfarin/Anticoagulants",
        effect: "Increased bleeding risk",
        severity: "Severe",
      },
      {
        drug: "NSAIDs",
        effect: "Additive anti-inflammatory — may increase GI bleed risk",
        severity: "Moderate",
      },
      {
        drug: "Chemotherapy (cyclophosphamide)",
        effect: "May reduce drug efficacy",
        severity: "Moderate",
      },
      {
        drug: "Piperine (black pepper)",
        effect: "Increases curcumin bioavailability by 2000%",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Curcumin (60–70%)",
        class: "Polyphenol/Curcuminoid",
        mechanism: "COX-2 inhibition, NF-kB suppression, antioxidant",
      },
      {
        name: "Bisdemethoxycurcumin",
        class: "Curcuminoid",
        mechanism: "Anti-inflammatory, anti-cancer",
      },
      {
        name: "ar-Turmerone",
        class: "Sesquiterpene",
        mechanism: "Neuroregeneration, anti-microbial",
      },
      {
        name: "Zingiberene",
        class: "Sesquiterpene",
        mechanism: "Anti-inflammatory",
      },
    ],
    dosage: {
      powder: "2–4g/day with black pepper",
      extract: "400–600mg/day (95% curcuminoids)",
      decoction: "10–20ml twice daily",
      duration: "Up to 8 weeks; longer with medical supervision",
    },
    riskLevel: "Low",
    riskNotes:
      "Safe at culinary doses. Medicinal doses require caution with anticoagulants.",
    storage: "Airtight container; cool, dark, dry place. Avoid humidity.",
  },
  {
    herbId: "neem",
    herbName: "Neem",
    latinName: "Azadirachta indica",
    family: "Meliaceae",
    part: "Leaf / Bark",
    pharmacopeiaRef: "IP 2022, AYUSH",
    ayurvedicProperties: {
      rasa: ["Tikta", "Kashaya"],
      guna: ["Laghu", "Ruksha"],
      veerya: "Sheeta",
      vipaka: "Katu",
      prabhava: "Krimighna (anti-parasitic)",
      dosha: "Pitta-Kapha shamaka",
    },
    therapeuticUses: [
      "Broad-spectrum antimicrobial — bactericidal against MRSA",
      "Anti-malarial — azadirachtin activity against Plasmodium",
      "Blood glucose regulation in Type 2 DM",
      "Anti-fungal (skin infections, candidiasis)",
      "Anti-inflammatory — skin disorders, psoriasis",
      "Anti-fertility (male contraceptive at high doses)",
      "Hepatoprotective effects",
    ],
    modernEvidence: [
      "Study (2011, AJP): Neem leaf extract reduces FBS by 22% in diabetic rats",
      "In vitro study: Nimbidin inhibits COX-2 and 5-LOX pathways",
    ],
    sideEffects: [
      "Hepatotoxicity with high doses or prolonged use",
      "Anti-fertility — affects sperm motility at high doses",
      "Encephalopathy in infants (neem oil — NEVER use)",
      "Hypoglycemia in combination with anti-diabetic drugs",
    ],
    contraindications: [
      "Pregnancy (abortifacient properties)",
      "Infants and young children (especially neem oil)",
      "Autoimmune disorders",
      "Organ transplant patients",
    ],
    interactions: [
      {
        drug: "Anti-diabetic drugs",
        effect: "Additive hypoglycemic effect",
        severity: "Moderate",
      },
      {
        drug: "Immunosuppressants",
        effect: "Immune stimulation may counter immunosuppression",
        severity: "Moderate",
      },
    ],
    phytochemicals: [
      {
        name: "Azadirachtin",
        class: "Limonoid",
        mechanism: "Anti-parasitic, insecticidal",
      },
      {
        name: "Nimbidin",
        class: "Triterpene",
        mechanism: "Anti-inflammatory, anti-ulcer",
      },
      { name: "Nimbolin A/B", class: "Limonoid", mechanism: "Antimicrobial" },
      {
        name: "Quercetin",
        class: "Flavonoid",
        mechanism: "Antioxidant, anti-inflammatory",
      },
    ],
    dosage: {
      powder: "1–3g/day",
      extract: "250–500mg/day (standardized)",
      decoction: "10–15ml twice daily",
      duration:
        "Maximum 4 weeks continuous use; liver function monitoring for longer courses",
    },
    riskLevel: "Medium",
    riskNotes:
      "Hepatotoxic potential with prolonged use. Monitor liver enzymes. Avoid in pregnancy.",
    storage: "Cool, dry, airtight. Avoid direct sunlight.",
  },
  {
    herbId: "tulsi",
    herbName: "Tulsi",
    latinName: "Ocimum sanctum",
    family: "Lamiaceae",
    part: "Leaf",
    pharmacopeiaRef: "IP 2022, AYUSH",
    ayurvedicProperties: {
      rasa: ["Katu", "Tikta"],
      guna: ["Laghu", "Ruksha"],
      veerya: "Ushna",
      vipaka: "Katu",
      prabhava: "Shwasahara (anti-respiratory)",
      dosha: "Vata-Kapha shamaka",
    },
    therapeuticUses: [
      "Adaptogen — reduces psychological and physiological stress",
      "Respiratory support (bronchitis, asthma, cough)",
      "Anti-bacterial and anti-viral (H1N1, H3N2)",
      "Immunomodulatory — increases CD4/CD8 ratio",
      "Anti-diabetic — insulin sensitizer",
      "Cardioprotective — reduces LDL, increases HDL",
    ],
    modernEvidence: [
      "RCT (2012, JCD): 300mg/day reduces fasting glucose significantly",
      "Study: Ursolic acid in Tulsi inhibits viral neuraminidase",
    ],
    sideEffects: [
      "Anti-fertility effects in males at high doses",
      "Blood thinning at high doses",
      "Hypoglycemia with anti-diabetic drugs",
    ],
    contraindications: [
      "Pregnancy (may cause uterine contractions)",
      "Prior to surgery (anti-platelet effect)",
    ],
    interactions: [
      {
        drug: "Anti-diabetic drugs",
        effect: "Additive hypoglycemia",
        severity: "Moderate",
      },
      {
        drug: "Anticoagulants",
        effect: "Enhanced anti-platelet activity",
        severity: "Moderate",
      },
    ],
    phytochemicals: [
      {
        name: "Eugenol (70–90% VOC)",
        class: "Phenylpropanoid",
        mechanism: "COX inhibition, anti-microbial",
      },
      {
        name: "Ursolic acid",
        class: "Triterpenoid",
        mechanism: "Anti-inflammatory, antiviral",
      },
      {
        name: "Rosmarinic acid",
        class: "Polyphenol",
        mechanism: "Antioxidant, anti-allergy",
      },
      {
        name: "β-caryophyllene",
        class: "Sesquiterpene",
        mechanism: "CB2 receptor agonist, anti-inflammatory",
      },
    ],
    dosage: {
      powder: "2–4g/day",
      extract: "300–500mg/day",
      decoction: "15–20ml twice daily",
      duration: "6–12 weeks; generally well tolerated long-term",
    },
    riskLevel: "Low",
    riskNotes: "Very safe herb. Caution in pregnancy and with anticoagulants.",
    storage: "Airtight container; store below 30°C, away from moisture.",
  },
  {
    herbId: "brahmi",
    herbName: "Brahmi",
    latinName: "Bacopa monnieri",
    family: "Plantaginaceae",
    part: "Whole plant",
    pharmacopeiaRef: "IP 2022, AYUSH",
    ayurvedicProperties: {
      rasa: ["Tikta", "Kashaya", "Madhura"],
      guna: ["Laghu", "Sara"],
      veerya: "Sheeta",
      vipaka: "Madhura",
      prabhava: "Medhya Rasayana (brain tonic)",
      dosha: "Tridosha shamaka",
    },
    therapeuticUses: [
      "Cognitive enhancement — memory, learning, retention",
      "Anxiolytic — reduces anxiety comparable to lorazepam",
      "Neuroprotective in Alzheimer's, epilepsy",
      "Anti-depressant — MAO-B inhibition",
      "Anti-epileptic — GABA modulation",
      "Anti-inflammatory in neurological conditions",
    ],
    modernEvidence: [
      "Meta-analysis (2014, J Ethnopharmacol): Significant improvement in cognitive function",
      "RCT (2008): 300mg/day improves word recall and delayed memory",
      "Study: Bacosides prevent beta-amyloid aggregation",
    ],
    sideEffects: [
      "GI upset, nausea, cramping (take with food)",
      "Fatigue and sedation at high doses",
      "Bradycardia (rare)",
    ],
    contraindications: [
      "Bradycardia or heart block",
      "Hypothyroidism (may suppress thyroid)",
    ],
    interactions: [
      {
        drug: "Anticholinergic drugs",
        effect: "May counteract effects",
        severity: "Mild",
      },
      {
        drug: "Thyroid medications",
        effect: "May reduce T4 levels",
        severity: "Moderate",
      },
      {
        drug: "Sedatives",
        effect: "Additive CNS depression",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Bacoside A",
        class: "Triterpenoid saponin",
        mechanism: "Neuronal repair, antioxidant",
      },
      {
        name: "Bacoside B",
        class: "Triterpenoid saponin",
        mechanism: "Acetylcholine enhancement",
      },
      {
        name: "Brahmine",
        class: "Alkaloid",
        mechanism: "CNS stimulant (mild)",
      },
      {
        name: "Hersaponin",
        class: "Saponin",
        mechanism: "Cardiotonic, anxiolytic",
      },
    ],
    dosage: {
      powder: "3–6g/day",
      extract: "300–450mg/day (20% bacosides)",
      decoction: "20–30ml twice daily",
      duration: "12 weeks minimum for cognitive effects; safe long-term",
    },
    riskLevel: "Low",
    riskNotes: "Well tolerated. GI side effects reduced by taking with meals.",
    storage: "Store below 30°C; protect from humidity and direct light.",
  },
  {
    herbId: "shatavari",
    herbName: "Shatavari",
    latinName: "Asparagus racemosus",
    family: "Asparagaceae",
    part: "Root",
    pharmacopeiaRef: "IP 2022",
    ayurvedicProperties: {
      rasa: ["Madhura", "Tikta"],
      guna: ["Guru", "Snigdha"],
      veerya: "Sheeta",
      vipaka: "Madhura",
      prabhava: "Stanyajanana (galactagogue)",
      dosha: "Pitta-Vata shamaka",
    },
    therapeuticUses: [
      "Female reproductive tonic — PCOD, dysmenorrhoea",
      "Galactagogue — increases milk production",
      "Adaptogen and immunomodulator",
      "Gastroprotective — gastric ulcer healing",
      "Anti-diarrheal",
      "Anti-diabetic via insulin secretion",
    ],
    modernEvidence: [
      "Study (2010): Shatavarin IV increases prolactin in lactating rats",
      "Clinical trial: Reduces menopausal hot flushes significantly",
    ],
    sideEffects: [
      "Allergic reactions (rare) — cross-reactive with asparagus",
      "Weight gain with prolonged use",
      "Fluid retention",
    ],
    contraindications: [
      "Asparagus allergy",
      "Estrogen-sensitive cancers (phytoestrogen activity)",
      "Severe kidney disease (high fluid retention)",
    ],
    interactions: [
      {
        drug: "Diuretics",
        effect: "May reduce diuretic effect",
        severity: "Mild",
      },
      {
        drug: "Immunosuppressants",
        effect: "Immune potentiation may counter drug",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Shatavarin I-IV",
        class: "Steroidal saponin",
        mechanism: "Phytoestrogenic, galactagogue",
      },
      {
        name: "Asparagamine A",
        class: "Polycyclic alkaloid",
        mechanism: "Anti-oxytocic",
      },
      { name: "Racemosol", class: "Stilbenoid", mechanism: "Antioxidant" },
    ],
    dosage: {
      powder: "3–6g/day",
      extract: "500mg–1g/day",
      decoction: "20–30ml twice daily with milk",
      duration: "3–6 months; safe for long-term female health",
    },
    riskLevel: "Low",
    riskNotes: "Safe for most women. Caution in estrogen-sensitive conditions.",
    storage: "Cool, dry, airtight container away from sunlight.",
  },
  {
    herbId: "ginger",
    herbName: "Ginger",
    latinName: "Zingiber officinale",
    family: "Zingiberaceae",
    part: "Rhizome",
    pharmacopeiaRef: "IP 2022, BP 2023, WHO",
    ayurvedicProperties: {
      rasa: ["Katu"],
      guna: ["Laghu", "Snigdha", "Tikshna"],
      veerya: "Ushna",
      vipaka: "Madhura",
      prabhava: "Dipana-Pachana (digestive stimulant)",
      dosha: "Vata-Kapha shamaka",
    },
    therapeuticUses: [
      "Anti-emetic — nausea, vomiting, morning sickness, chemotherapy-induced",
      "Anti-inflammatory — 6-gingerol inhibits COX-2 and 5-LOX",
      "Digestive stimulant — enhances gastric motility",
      "Anti-arthritic — comparable to NSAIDs for OA",
      "Cardioprotective — antiplatelet, reduces LDL",
      "Anti-diabetic — reduces HbA1c",
    ],
    modernEvidence: [
      "Meta-analysis (2014, BJA): Superior to placebo for post-op nausea",
      "RCT: 2g/day reduces muscle pain after exercise by 25%",
    ],
    sideEffects: [
      "Heartburn, GI irritation at high doses (>5g/day)",
      "Anti-platelet effect — bleeding risk",
      "Hypoglycemia with anti-diabetics",
    ],
    contraindications: [
      "Gallstones (may worsen)",
      "Bleeding disorders",
      "Pre-surgery",
    ],
    interactions: [
      {
        drug: "Warfarin",
        effect: "Increased anticoagulant effect — monitor INR",
        severity: "Moderate",
      },
      {
        drug: "Anti-diabetics",
        effect: "Additive glucose-lowering effect",
        severity: "Mild",
      },
      {
        drug: "Cardiac drugs (digoxin)",
        effect: "May alter drug absorption",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "6-Gingerol",
        class: "Phenolic ketone",
        mechanism: "COX-2/5-LOX inhibition, anti-emetic",
      },
      {
        name: "Shogaol (from drying)",
        class: "Phenolic ketone",
        mechanism: "More potent anti-inflammatory than gingerol",
      },
      {
        name: "Zingerone",
        class: "Phenolic compound",
        mechanism: "Anti-diarrheal, antioxidant",
      },
      { name: "Zingiberene", class: "Sesquiterpene", mechanism: "Carminative" },
    ],
    dosage: {
      powder: "2–4g/day",
      extract: "250–500mg/day",
      decoction: "10–20ml twice daily",
      duration: "4–6 weeks; long-term safe at culinary doses",
    },
    riskLevel: "Low",
    riskNotes: "Very safe. Caution at >5g/day and with anticoagulants.",
    storage: "Cool, dry, dark place. Avoid refrigeration for powder.",
  },
  {
    herbId: "haritaki",
    herbName: "Haritaki",
    latinName: "Terminalia chebula",
    family: "Combretaceae",
    part: "Fruit",
    pharmacopeiaRef: "IP 2022",
    ayurvedicProperties: {
      rasa: ["Pancha Rasa (all except salty)"],
      guna: ["Laghu", "Ruksha"],
      veerya: "Ushna",
      vipaka: "Madhura",
      prabhava: "Tridosha shamaka",
      dosha: "Tridosha shamaka",
    },
    therapeuticUses: [
      "Laxative and bowel regulator",
      "Anti-diabetic — alpha-glucosidase inhibition",
      "Hepatoprotective and anti-fibrotic",
      "Anti-microbial — effective against H. pylori",
      "Antioxidant — ORAC value comparable to acai",
      "Anti-aging and Rasayana (rejuvenating)",
    ],
    modernEvidence: [
      "Study: Chebulic acid inhibits alpha-glucosidase in vitro",
      "Animal study: Reduces hepatic fibrosis markers significantly",
    ],
    sideEffects: [
      "Diarrhea or loose stools at high doses",
      "Electrolyte imbalance with prolonged high-dose laxative use",
    ],
    contraindications: [
      "Pregnancy (high doses — laxative effect)",
      "Severe diarrhea or dysentery",
      "Dehydration states",
    ],
    interactions: [
      {
        drug: "Anti-diabetic drugs",
        effect: "Additive hypoglycemic effect",
        severity: "Mild",
      },
      {
        drug: "Laxatives",
        effect: "Additive effect — diarrhea risk",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Chebulic acid",
        class: "Hydrolysable tannin",
        mechanism: "Antioxidant, alpha-glucosidase inhibitor",
      },
      {
        name: "Chebulanin",
        class: "Tannin",
        mechanism: "Anti-bacterial, anti-viral",
      },
      {
        name: "Gallic acid",
        class: "Phenolic acid",
        mechanism: "Antioxidant, anti-tumor",
      },
      {
        name: "Ellagic acid",
        class: "Polyphenol",
        mechanism: "Anti-mutagenic, anti-cancer",
      },
    ],
    dosage: {
      powder: "3–5g/day at bedtime",
      extract: "300–500mg/day",
      decoction: "15–20ml once daily",
      duration: "4–8 weeks; seasonal use recommended in Ayurveda",
    },
    riskLevel: "Low",
    riskNotes: "Safe herb. Reduce dose if loose stools occur.",
    storage: "Dry, airtight container; protect from moisture.",
  },
  {
    herbId: "amalaki",
    herbName: "Amalaki",
    latinName: "Phyllanthus emblica",
    family: "Phyllanthaceae",
    part: "Fruit",
    pharmacopeiaRef: "IP 2022",
    ayurvedicProperties: {
      rasa: ["Pancha Rasa (all except pungent)"],
      guna: ["Guru", "Ruksha"],
      veerya: "Sheeta",
      vipaka: "Madhura",
      prabhava: "Rasayana, Vrishya (aphrodisiac)",
      dosha: "Tridosha shamaka",
    },
    therapeuticUses: [
      "Richest natural source of Vitamin C (20x orange)",
      "Immunomodulatory and anti-aging",
      "Anti-diabetic — reduces HbA1c",
      "Hypolipidemic — reduces LDL, triglycerides",
      "Gastroprotective — H. pylori inhibition",
      "Hair growth promotion",
      "Hepatoprotective",
    ],
    modernEvidence: [
      "RCT (2011): Amla reduces LDL by 26% over 3 months",
      "Study: Emblicanin A/B show stronger antioxidant than curcumin",
    ],
    sideEffects: [
      "Diarrhea at very high doses",
      "Hypoglycemia with anti-diabetics",
    ],
    contraindications: ["Bleeding disorders (anti-platelet)", "Pre-surgery"],
    interactions: [
      {
        drug: "Anti-diabetics",
        effect: "Additive hypoglycemia",
        severity: "Mild",
      },
      {
        drug: "Anticoagulants",
        effect: "Enhanced anti-platelet effect",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Emblicanin A & B",
        class: "Hydrolysable tannin",
        mechanism: "Antioxidant (stronger than Vitamin E)",
      },
      {
        name: "Phyllemblic acid",
        class: "Carboxylic acid",
        mechanism: "Cytotoxic, antioxidant",
      },
      {
        name: "Vitamin C (700mg/100g)",
        class: "Vitamin",
        mechanism: "Immune support, collagen synthesis",
      },
      {
        name: "Pedunculagin",
        class: "Ellagitannin",
        mechanism: "Anti-bacterial, anti-viral",
      },
    ],
    dosage: {
      powder: "3–6g/day",
      extract: "500mg–1g/day",
      decoction: "20–30ml twice daily",
      duration: "Long-term safe; Rasayana use 3–6 months",
    },
    riskLevel: "Low",
    riskNotes: "Excellent safety profile. One of the safest Ayurvedic herbs.",
    storage: "Airtight, cool, dry place. Avoid moisture as tannins degrade.",
  },
  {
    herbId: "bibhitaki",
    herbName: "Bibhitaki",
    latinName: "Terminalia bellirica",
    family: "Combretaceae",
    part: "Fruit",
    pharmacopeiaRef: "IP 2022",
    ayurvedicProperties: {
      rasa: ["Kashaya"],
      guna: ["Laghu", "Ruksha"],
      veerya: "Ushna",
      vipaka: "Madhura",
      prabhava: "Kaphahara (anti-Kapha)",
      dosha: "Kapha-Pitta shamaka",
    },
    therapeuticUses: [
      "Respiratory — bronchitis, asthma, voice disorders",
      "Digestive — laxative, anti-diarrheal",
      "Anti-fungal and anti-bacterial",
      "Anti-diabetic",
      "Anti-inflammatory",
    ],
    modernEvidence: [
      "Study: Gallic acid and ellagic acid in Bibhitaki show strong DPPH scavenging",
    ],
    sideEffects: ["Mild laxative effect", "GI cramping at high doses"],
    contraindications: [
      "Pregnancy (laxative)",
      "Severe constipation with dry constitution",
    ],
    interactions: [
      {
        drug: "Anti-diabetics",
        effect: "Additive hypoglycemia",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Gallic acid",
        class: "Phenolic acid",
        mechanism: "Antioxidant, antimicrobial",
      },
      {
        name: "Ellagic acid",
        class: "Polyphenol",
        mechanism: "Anti-mutagenic",
      },
      { name: "Chebulagic acid", class: "Tannin", mechanism: "Anti-diabetic" },
      {
        name: "β-sitosterol",
        class: "Phytosterol",
        mechanism: "Cholesterol reduction",
      },
    ],
    dosage: {
      powder: "3–5g/day",
      extract: "250–500mg/day",
      decoction: "15–20ml twice daily",
      duration: "4–6 weeks",
    },
    riskLevel: "Low",
    riskNotes: "Safe. Part of Triphala combination.",
    storage: "Airtight, cool, dry container.",
  },
  {
    herbId: "punarnava",
    herbName: "Punarnava",
    latinName: "Boerhavia diffusa",
    family: "Nyctaginaceae",
    part: "Root",
    pharmacopeiaRef: "IP 2022, AYUSH",
    ayurvedicProperties: {
      rasa: ["Madhura", "Tikta", "Kashaya", "Katu"],
      guna: ["Laghu", "Ruksha"],
      veerya: "Ushna (root), Sheeta (aerial)",
      vipaka: "Madhura",
      prabhava: "Mutral (diuretic), Sothahara (anti-edema)",
      dosha: "Tridosha shamaka",
    },
    therapeuticUses: [
      "Diuretic — kidney stone prevention, edema",
      "Hepatoprotective — liver regeneration, hepatitis",
      "Anti-fibrotic — liver and kidney fibrosis",
      "Anti-inflammatory — arthritis, joint pain",
      "Anti-convulsant",
      "Anti-malarial",
    ],
    modernEvidence: [
      "Study: Punarnavoside shows significant hepatoprotective activity",
      "Trial: Reduces creatinine and urea in CKD patients",
    ],
    sideEffects: [
      "Excessive diuresis — electrolyte imbalance",
      "Hypotension at high doses",
    ],
    contraindications: ["Pregnancy (high doses)", "Severe hypotension"],
    interactions: [
      {
        drug: "Diuretics",
        effect: "Additive fluid loss — hypokalemia risk",
        severity: "Moderate",
      },
      {
        drug: "Anti-hypertensives",
        effect: "Enhanced hypotension",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Punarnavoside",
        class: "Rotenoid glycoside",
        mechanism: "Hepatoprotective",
      },
      {
        name: "Boeravinone B/C",
        class: "Rotenoid",
        mechanism: "Anti-fibrinolytic, anti-inflammatory",
      },
      { name: "Punarnavine", class: "Alkaloid", mechanism: "Diuretic" },
      {
        name: "Ursolic acid",
        class: "Triterpenoid",
        mechanism: "Anti-inflammatory",
      },
    ],
    dosage: {
      powder: "3–6g/day",
      extract: "500mg–1g/day",
      decoction: "20–30ml twice daily",
      duration: "6–8 weeks",
    },
    riskLevel: "Low",
    riskNotes:
      "Safe at standard doses. Monitor electrolytes with prolonged use.",
    storage: "Cool, dry, airtight container.",
  },
  {
    herbId: "guduchi",
    herbName: "Guduchi",
    latinName: "Tinospora cordifolia",
    family: "Menispermaceae",
    part: "Stem",
    pharmacopeiaRef: "IP 2022, AYUSH",
    ayurvedicProperties: {
      rasa: ["Tikta", "Kashaya"],
      guna: ["Guru", "Snigdha"],
      veerya: "Ushna",
      vipaka: "Madhura",
      prabhava: "Rasayana, Jwarahara (anti-pyretic)",
      dosha: "Tridosha shamaka",
    },
    therapeuticUses: [
      "Immunomodulator — primary immune cells activation",
      "Anti-pyretic — dengue, malaria, typhoid fever",
      "Anti-diabetic — insulin secretagogue",
      "Hepatoprotective — alcohol-induced liver damage",
      "Anti-arthritic — joint inflammation",
      "Anti-oxidant and anti-aging",
    ],
    modernEvidence: [
      "RCT: Reduces dengue fever duration by 2 days vs control",
      "Study: Tinosporaside activates macrophage phagocytosis",
    ],
    sideEffects: [
      "Hypoglycemia (diabetics)",
      "Auto-immune flare (rare) — potent immune stimulant",
      "GI discomfort at high doses",
    ],
    contraindications: [
      "Autoimmune conditions without monitoring",
      "Pregnancy (high doses)",
    ],
    interactions: [
      {
        drug: "Anti-diabetics",
        effect: "Additive hypoglycemia",
        severity: "Moderate",
      },
      {
        drug: "Immunosuppressants",
        effect: "Counter-effect",
        severity: "Moderate",
      },
    ],
    phytochemicals: [
      { name: "Tinosporin", class: "Diterpene", mechanism: "Immunomodulation" },
      {
        name: "Berberine",
        class: "Isoquinoline alkaloid",
        mechanism: "Anti-diabetic, anti-microbial",
      },
      {
        name: "Cordifolioside A",
        class: "Glycoside",
        mechanism: "Anti-inflammatory",
      },
      {
        name: "Tinosporaside",
        class: "Clerodane diterpene",
        mechanism: "Macrophage activation",
      },
    ],
    dosage: {
      powder: "3–5g/day",
      extract: "300–500mg/day",
      decoction: "20–30ml twice daily",
      duration: "4–8 weeks; safe for seasonal use",
    },
    riskLevel: "Low",
    riskNotes: "Excellent immune herb. Monitor blood glucose in diabetics.",
    storage: "Cool, dry, airtight container.",
  },
  {
    herbId: "triphala",
    herbName: "Triphala",
    latinName: "Terminalia chebula + T. bellirica + P. emblica",
    family: "Combretaceae / Phyllanthaceae",
    part: "Fruit (combination)",
    pharmacopeiaRef: "IP 2022, AYUSH",
    ayurvedicProperties: {
      rasa: ["Pancha Rasa"],
      guna: ["Laghu", "Ruksha"],
      veerya: "Ushna",
      vipaka: "Madhura",
      prabhava: "Tridosha shamaka, Rasayana",
      dosha: "Tridosha shamaka",
    },
    therapeuticUses: [
      "Bowel regulation — constipation and diarrhea",
      "Gut microbiome modulator",
      "Metabolic syndrome management",
      "Eye health (Triphala ghee)",
      "Antioxidant — superior ORAC value",
      "Anti-diabetic and hypolipidemic",
    ],
    modernEvidence: [
      "Study: Triphala inhibits adipogenesis and reduces BMI in obese subjects",
      "Clinical trial: Reduces dental plaque comparable to chlorhexidine",
    ],
    sideEffects: [
      "Diarrhea and cramping at high doses",
      "Dehydration with prolonged laxative use",
    ],
    contraindications: ["Pregnancy", "Diarrhea-predominant IBS"],
    interactions: [
      {
        drug: "Anti-diabetics",
        effect: "Additive hypoglycemia",
        severity: "Mild",
      },
      {
        drug: "Anticoagulants",
        effect: "Enhanced anti-platelet (Amalaki component)",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Chebulic acid (Haritaki)",
        class: "Tannin",
        mechanism: "Anti-diabetic, antioxidant",
      },
      {
        name: "Gallic acid",
        class: "Phenolic acid",
        mechanism: "Antioxidant, anti-tumor",
      },
      {
        name: "Emblicanin A/B (Amalaki)",
        class: "Tannin",
        mechanism: "Vitamin C synergist, antioxidant",
      },
      {
        name: "Ellagic acid (Bibhitaki)",
        class: "Polyphenol",
        mechanism: "Anti-mutagenic",
      },
    ],
    dosage: {
      powder: "3–5g at bedtime with warm water",
      extract: "500mg–1g/day",
      decoction: "20–30ml once daily",
      duration: "Long-term safe; 3–6 month courses typical",
    },
    riskLevel: "Low",
    riskNotes:
      "Classic tridoshic formula. One of the most studied Ayurvedic combinations.",
    storage: "Airtight container; cool, dry, dark place.",
  },
  {
    herbId: "boswellia",
    herbName: "Boswellia",
    latinName: "Boswellia serrata",
    family: "Burseraceae",
    part: "Gum resin",
    pharmacopeiaRef: "IP 2022, WHO 2020",
    ayurvedicProperties: {
      rasa: ["Tikta", "Katu"],
      guna: ["Laghu", "Ruksha"],
      veerya: "Ushna",
      vipaka: "Katu",
      prabhava: "Shothahara (anti-edema), Vedanasthapana",
      dosha: "Vata-Kapha shamaka",
    },
    therapeuticUses: [
      "Anti-inflammatory — 5-LOX inhibition (AKBA mechanism)",
      "Osteoarthritis and Rheumatoid arthritis management",
      "IBD — Crohn's disease, ulcerative colitis",
      "Asthma — reduces leukotrienes",
      "Anti-tumor (brain tumors — glioma)",
      "Analgesic for chronic pain",
    ],
    modernEvidence: [
      "RCT (2003, Phytomedicine): 333mg AKBA reduces OA pain by 65%",
      "Clinical trial: 5-Loxin reduces knee pain in 7 days",
      "Meta-analysis (2020): Significant benefit in IBD vs placebo",
    ],
    sideEffects: [
      "GI upset, nausea at high doses",
      "Skin rash (rare hypersensitivity)",
      "Liver enzyme elevation (rare)",
    ],
    contraindications: [
      "Pregnancy (safety not established)",
      "Resin hypersensitivity",
    ],
    interactions: [
      {
        drug: "NSAIDs",
        effect: "Additive anti-inflammatory — may reduce NSAID dose needed",
        severity: "Mild",
      },
      {
        drug: "Anticoagulants",
        effect: "Possible anti-platelet interaction",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Acetyl-11-keto-β-boswellic acid (AKBA)",
        class: "Triterpenoid acid",
        mechanism: "Selective 5-LOX inhibition",
      },
      {
        name: "β-Boswellic acid",
        class: "Triterpenoid acid",
        mechanism: "NF-kB inhibition",
      },
      {
        name: "Incensole acetate",
        class: "Diterpene",
        mechanism: "Neuroprotective, anxiolytic",
      },
    ],
    dosage: {
      powder: "300–500mg/day (AKBA-enriched extract)",
      extract: "100–400mg/day (30% AKBA)",
      decoction: "Not typically used as decoction",
      duration: "8–12 weeks for chronic conditions",
    },
    riskLevel: "Low",
    riskNotes:
      "Well tolerated. Standardization to AKBA content critical for efficacy.",
    storage: "Cool, dry, airtight container. Resin hygroscopic.",
  },
  {
    herbId: "palmitoylethanolamide",
    herbName: "Palmitoylethanolamide",
    latinName: "N-(2-hydroxyethyl)hexadecanamide (PEA)",
    family: "Endogenous fatty acid amide",
    part: "Synthetic/semi-synthetic",
    pharmacopeiaRef: "EMA 2021, WHO 2022",
    ayurvedicProperties: {
      rasa: ["N/A — non-traditional"],
      guna: ["Snigdha"],
      veerya: "Sheeta",
      vipaka: "N/A",
      prabhava: "Vedanasthapana (analgesic)",
      dosha: "Vata-Pitta shamaka",
    },
    therapeuticUses: [
      "Neuropathic pain — peripheral and central sensitization",
      "Anti-inflammatory via PPAR-α activation",
      "Chronic pain syndromes (fibromyalgia, chronic pelvic pain)",
      "Neuroprotection — Alzheimer's, ALS",
      "Anti-allergy — mast cell stabilization",
      "Post-COVID neuropathy and fatigue",
    ],
    modernEvidence: [
      "Meta-analysis (2017, Pain): PEA reduces neuropathic pain significantly vs placebo",
      "RCT (2021): Ultramicronized PEA reduces COVID-19 fatigue by 40%",
    ],
    sideEffects: [
      "Generally very well tolerated",
      "Mild GI effects (rare)",
      "No known serious adverse effects in clinical trials",
    ],
    contraindications: ["Pregnancy (insufficient data)"],
    interactions: [
      {
        drug: "NSAIDs",
        effect: "Additive analgesic — may allow NSAID dose reduction",
        severity: "Mild",
      },
    ],
    phytochemicals: [
      {
        name: "Palmitoylethanolamide (PEA)",
        class: "Fatty acid amide",
        mechanism: "PPAR-α activation, mast cell stabilization",
      },
    ],
    dosage: {
      powder: "300–1200mg/day in divided doses",
      extract: "600mg/day ultramicronized (better bioavailability)",
      decoction: "Not applicable",
      duration: "4–8 weeks; long-term safe",
    },
    riskLevel: "Low",
    riskNotes:
      "Excellent safety profile. Ultramicronized form preferred for bioavailability.",
    storage: "Cool, dry place; protect from moisture and heat.",
  },
  {
    herbId: "moringa",
    herbName: "Moringa",
    latinName: "Moringa oleifera",
    family: "Moringaceae",
    part: "Leaf",
    pharmacopeiaRef: "WHO 2021, AYUSH",
    ayurvedicProperties: {
      rasa: ["Katu", "Tikta"],
      guna: ["Laghu", "Ruksha", "Tikshna"],
      veerya: "Ushna",
      vipaka: "Katu",
      prabhava: "Shothaghna (anti-edema)",
      dosha: "Kapha-Vata shamaka",
    },
    therapeuticUses: [
      "Malnutrition — extremely high nutrient density",
      "Anti-diabetic — lowers FBS and HbA1c",
      "Hepatoprotective",
      "Anti-hypertensive",
      "Anti-tumor — isothiocyanate activity",
      "Anti-edema and diuretic",
    ],
    modernEvidence: [
      "RCT (2014, Asian Pacific Journal): 8g/day reduces FBS by 28%",
      "Study: Moringin activates Nrf2 pathway — cytoprotective",
    ],
    sideEffects: [
      "GI upset at high doses",
      "Hypoglycemia with anti-diabetics",
      "Uterine contractions (avoid in pregnancy)",
    ],
    contraindications: [
      "Pregnancy (oxytocic effect of root/bark)",
      "Hypothyroidism (may interfere with thyroid function)",
    ],
    interactions: [
      {
        drug: "Anti-hypertensives",
        effect: "Additive hypotension",
        severity: "Mild",
      },
      {
        drug: "Anti-diabetics",
        effect: "Additive hypoglycemia",
        severity: "Moderate",
      },
    ],
    phytochemicals: [
      {
        name: "Isothiocyanates (moringin)",
        class: "Glucosinolate derivative",
        mechanism: "Nrf2 activation, anti-tumor",
      },
      {
        name: "Quercetin-3-glucoside",
        class: "Flavonoid",
        mechanism: "Antioxidant, anti-inflammatory",
      },
      {
        name: "Chlorogenic acid",
        class: "Phenolic acid",
        mechanism: "Anti-diabetic, antioxidant",
      },
    ],
    dosage: {
      powder: "2–6g/day",
      extract: "400–800mg/day",
      decoction: "15–20ml twice daily",
      duration: "4–8 weeks; generally safe long-term",
    },
    riskLevel: "Low",
    riskNotes: "Very safe at leaf doses. Avoid root/bark in pregnancy.",
    storage: "Airtight container; avoid humidity and direct light.",
  },
  {
    herbId: "licorice",
    herbName: "Licorice",
    latinName: "Glycyrrhiza glabra",
    family: "Fabaceae",
    part: "Root",
    pharmacopeiaRef: "IP 2022, BP 2023, WHO",
    ayurvedicProperties: {
      rasa: ["Madhura"],
      guna: ["Guru", "Snigdha"],
      veerya: "Sheeta",
      vipaka: "Madhura",
      prabhava: "Vishaghna, Rasayana",
      dosha: "Vata-Pitta shamaka",
    },
    therapeuticUses: [
      "Anti-ulcer — enhances mucus secretion",
      "Anti-inflammatory — cortisol sparing effect",
      "Anti-viral — active against herpes, hepatitis C",
      "Adrenal support (adrenal insufficiency)",
      "Anti-allergic and anti-asthmatic",
      "Expectorant",
    ],
    modernEvidence: [
      "Study: Glycyrrhizin inhibits SARS-CoV-2 replication in vitro",
      "Meta-analysis: DGL form effective for peptic ulcer without side effects",
    ],
    sideEffects: [
      "Hypertension (glycyrrhizin — mineralocorticoid effect)",
      "Hypokalemia and edema with prolonged use",
      "Pseudohyperaldosteronism",
      "Reduced testosterone (males)",
    ],
    contraindications: [
      "Hypertension",
      "Hypokalemia",
      "Kidney disease",
      "Pregnancy",
      "Liver cirrhosis",
    ],
    interactions: [
      {
        drug: "Antihypertensives",
        effect: "Antagonizes antihypertensive effect",
        severity: "Severe",
      },
      {
        drug: "Diuretics (loop/thiazide)",
        effect: "Additive hypokalemia",
        severity: "Severe",
      },
      {
        drug: "Digoxin",
        effect: "Hypokalemia increases digoxin toxicity",
        severity: "Severe",
      },
      {
        drug: "Corticosteroids",
        effect: "Additive effect — Cushing's risk",
        severity: "Moderate",
      },
    ],
    phytochemicals: [
      {
        name: "Glycyrrhizin",
        class: "Triterpenoid saponin",
        mechanism: "Mineralocorticoid, anti-viral, anti-inflammatory",
      },
      {
        name: "Glycyrrhetinic acid",
        class: "Triterpenoid",
        mechanism: "11β-HSD inhibition (cortisol sparing)",
      },
      {
        name: "Liquiritin",
        class: "Flavanone glycoside",
        mechanism: "Anti-depressant, skin brightening",
      },
      {
        name: "Isoliquiritigenin",
        class: "Chalcone",
        mechanism: "Anti-tumor, anti-inflammatory",
      },
    ],
    dosage: {
      powder: "1–3g/day (max 4 weeks continuous)",
      extract: "150–300mg/day (glycyrrhizin-reduced DGL preferred)",
      decoction: "10–15ml twice daily",
      duration: "Maximum 4–6 weeks; mandatory wash-out period",
    },
    riskLevel: "High",
    riskNotes:
      "Significant cardiovascular risk with prolonged use. Monitor BP and potassium. DGL (deglycyrrhizinated) form safer for GI use.",
    storage: "Airtight, cool, dry. Hygroscopic — minimize moisture exposure.",
  },
];

export function getProfileByHerbName(
  herbName: string,
): PharmacologicalProfile | undefined {
  const normalized = herbName.toLowerCase().trim();
  return pharmacologicalProfiles.find(
    (p) =>
      p.herbName.toLowerCase() === normalized ||
      p.herbId === normalized.replace(/\s+/g, "-"),
  );
}

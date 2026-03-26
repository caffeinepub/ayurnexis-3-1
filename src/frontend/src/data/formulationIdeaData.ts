// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarketedDrug {
  name: string;
  generic: string;
  dose: string;
  manufacturer: string;
  mechanism: string;
}

export interface NovelCompositionIngredient {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  role: string;
}

export interface NovelComposition {
  id: string;
  name: string;
  ingredients: NovelCompositionIngredient[];
  pharmacologicalEffects: string;
  advantages: string[];
  disadvantages: string[];
  stabilityPrediction: string;
  shelfLife: string;
  storageCondition: string;
  drugInteractions: string[];
  dosageForm: string;
}

// ─── Disease List ─────────────────────────────────────────────────────────────

export const DISEASES: string[] = [
  "Diabetes (Type 2)",
  "Diabetes (Type 1)",
  "Hypertension",
  "Asthma",
  "Rheumatoid Arthritis",
  "Osteoarthritis",
  "Anxiety",
  "Depression",
  "GERD (Acid Reflux)",
  "Urinary Tract Infection (UTI)",
  "Malaria",
  "Tuberculosis",
  "Anemia",
  "Migraine",
  "Epilepsy",
  "Hypothyroidism",
  "Hyperthyroidism",
  "Obesity",
  "PCOS",
  "Insomnia",
  "Psoriasis",
  "Irritable Bowel Syndrome (IBS)",
  "Dengue (Supportive)",
  "COPD",
  "Parkinson's Disease",
  "Alzheimer's Disease",
  "Osteoporosis",
  "Gout",
  "Liver Disease (NAFLD)",
  "Chronic Kidney Disease",
  "Sinusitis",
  "Pneumonia",
  "Heart Failure",
  "Atrial Fibrillation",
  "Hyperlipidemia",
  "Celiac Disease",
  "Crohn's Disease",
  "Ulcerative Colitis",
  "Lupus (SLE)",
  "Multiple Sclerosis",
  "Fibromyalgia",
  "Chronic Fatigue Syndrome",
  "Vitamin D Deficiency",
  "Iron Deficiency Anemia",
  "B12 Deficiency",
  "Acne Vulgaris",
  "Eczema (Atopic Dermatitis)",
  "Rosacea",
  "Fungal Infections",
  "Bacterial Conjunctivitis",
  "Allergic Rhinitis",
];

// ─── Marketed Drugs ──────────────────────────────────────────────────────────

export const MARKETED_DRUGS: Record<string, Record<string, MarketedDrug[]>> = {
  "Diabetes (Type 2)": {
    Allopathic: [
      {
        name: "Glucophage",
        generic: "Metformin HCl 500mg",
        dose: "500-2000 mg/day",
        manufacturer: "Merck",
        mechanism:
          "Reduces hepatic glucose output; improves insulin sensitivity via AMPK activation",
      },
      {
        name: "Januvia",
        generic: "Sitagliptin 100mg",
        dose: "100 mg/day",
        manufacturer: "MSD",
        mechanism:
          "DPP-4 inhibitor - increases incretin levels, enhances insulin secretion",
      },
      {
        name: "Jardiance",
        generic: "Empagliflozin 10mg",
        dose: "10-25 mg/day",
        manufacturer: "Boehringer Ingelheim",
        mechanism: "SGLT-2 inhibitor - prevents glucose reabsorption in kidney",
      },
      {
        name: "Amaryl",
        generic: "Glimepiride 2mg",
        dose: "1-4 mg/day",
        manufacturer: "Sanofi",
        mechanism:
          "Sulfonylurea - stimulates pancreatic beta-cell insulin secretion",
      },
      {
        name: "Victoza",
        generic: "Liraglutide 1.2mg",
        dose: "1.2-1.8 mg/day SC",
        manufacturer: "Novo Nordisk",
        mechanism:
          "GLP-1 receptor agonist - enhances glucose-dependent insulin secretion",
      },
    ],
    Herbal: [
      {
        name: "Karela Jamun Juice",
        generic: "Momordica charantia + Syzygium cumini",
        dose: "30 mL twice daily",
        manufacturer: "Baidyanath",
        mechanism:
          "Charantin and polypeptide-p mimic insulin action; reduces glucose absorption",
      },
      {
        name: "Dia-B Tea",
        generic: "Gymnema sylvestre + Fenugreek",
        dose: "2 cups/day",
        manufacturer: "Himalaya",
        mechanism:
          "Gymnemic acids block sweet receptors; fenugreek slows glucose absorption",
      },
      {
        name: "GlucoNorm",
        generic: "Pterocarpus marsupium 250mg",
        dose: "500 mg twice daily",
        manufacturer: "Charak",
        mechanism:
          "Epicatechin regenerates beta cells, improves insulin sensitivity",
      },
    ],
    Ayurvedic: [
      {
        name: "Diabecon",
        generic: "Shilajit + Gurmar + Meshashringi",
        dose: "2 tablets twice daily",
        manufacturer: "Himalaya",
        mechanism:
          "Multi-herbal synergy; reduces glycated hemoglobin, improves beta-cell function",
      },
      {
        name: "Chandraprabha Vati",
        generic: "Classical polyherbal formulation",
        dose: "2 tablets twice daily",
        manufacturer: "Dabur",
        mechanism:
          "Traditional Ayurvedic antidiabetic, improves renal and pancreatic function",
      },
    ],
    Homeopathic: [
      {
        name: "SBL Dibonil Drops",
        generic: "Syzygium jambolanum + Cephalandra indica",
        dose: "10-15 drops thrice daily",
        manufacturer: "SBL",
        mechanism:
          "Homeopathic potencies targeting glucose metabolism and pancreatic function",
      },
    ],
    Combination: [
      {
        name: "Glycomet GP",
        generic: "Metformin 500mg + Glipizide 5mg",
        dose: "1 tablet twice daily",
        manufacturer: "USV",
        mechanism:
          "Dual action: biguanide + sulfonylurea for synergistic glycemic control",
      },
      {
        name: "Janumet",
        generic: "Sitagliptin 50mg + Metformin 500mg",
        dose: "1 tablet twice daily",
        manufacturer: "MSD",
        mechanism:
          "DPP-4 inhibition + hepatic glucose reduction for comprehensive T2DM management",
      },
    ],
  },
  Hypertension: {
    Allopathic: [
      {
        name: "Norvasc",
        generic: "Amlodipine 5mg",
        dose: "5-10 mg/day",
        manufacturer: "Pfizer",
        mechanism:
          "Calcium channel blocker - relaxes vascular smooth muscle, reduces peripheral resistance",
      },
      {
        name: "Cozaar",
        generic: "Losartan 50mg",
        dose: "50-100 mg/day",
        manufacturer: "MSD",
        mechanism:
          "ARB - blocks angiotensin II AT1 receptors, reduces vasoconstriction",
      },
      {
        name: "Tenormin",
        generic: "Atenolol 50mg",
        dose: "50-100 mg/day",
        manufacturer: "AstraZeneca",
        mechanism:
          "Beta-1 selective blocker - reduces heart rate and cardiac output",
      },
      {
        name: "Lasix",
        generic: "Furosemide 40mg",
        dose: "20-80 mg/day",
        manufacturer: "Sanofi",
        mechanism:
          "Loop diuretic - inhibits Na/K/2Cl cotransporter in loop of Henle",
      },
      {
        name: "Lisinopril",
        generic: "Lisinopril 10mg",
        dose: "10-40 mg/day",
        manufacturer: "AstraZeneca",
        mechanism:
          "ACE inhibitor - reduces angiotensin II synthesis, decreases vasoconstriction",
      },
    ],
    Herbal: [
      {
        name: "Serpina",
        generic: "Rauwolfia serpentina 50mg",
        dose: "2 tablets twice daily",
        manufacturer: "Himalaya",
        mechanism:
          "Reserpine depletes catecholamines from sympathetic neurons, reducing BP",
      },
      {
        name: "Arjuna Capsules",
        generic: "Terminalia arjuna 500mg",
        dose: "1 capsule twice daily",
        manufacturer: "Organic India",
        mechanism:
          "Reduces LDL, strengthens cardiac muscle, mild diuretic effect",
      },
    ],
    Ayurvedic: [
      {
        name: "Sarpagandha Ghan Vati",
        generic: "Rauwolfia alkaloids (Classical)",
        dose: "1-2 tablets twice daily",
        manufacturer: "Baidyanath",
        mechanism:
          "Alkaloids reduce sympathetic activity, peripheral resistance",
      },
    ],
    Homeopathic: [
      {
        name: "Passiflora Incarnata Q",
        generic: "Passiflora incarnata mother tincture",
        dose: "10 drops thrice daily",
        manufacturer: "Dr. Reckeweg",
        mechanism:
          "Calming nervous system action reduces anxiety-driven hypertension",
      },
    ],
    Combination: [
      {
        name: "Amlopres-AT",
        generic: "Amlodipine 5mg + Atenolol 50mg",
        dose: "1 tablet daily",
        manufacturer: "Cipla",
        mechanism: "Calcium channel blocker + beta blocker dual mechanism",
      },
      {
        name: "Losar-H",
        generic: "Losartan 50mg + Hydrochlorothiazide 12.5mg",
        dose: "1 tablet daily",
        manufacturer: "Glenmark",
        mechanism:
          "ARB + thiazide diuretic for enhanced antihypertensive effect",
      },
    ],
  },
  Asthma: {
    Allopathic: [
      {
        name: "Ventolin",
        generic: "Salbutamol 100mcg inhaler",
        dose: "100-200mcg PRN",
        manufacturer: "GSK",
        mechanism:
          "Short-acting beta-2 agonist - relaxes bronchial smooth muscle",
      },
      {
        name: "Seretide",
        generic: "Fluticasone/Salmeterol",
        dose: "250/25mcg twice daily",
        manufacturer: "GSK",
        mechanism: "Corticosteroid + long-acting beta-2 agonist combination",
      },
      {
        name: "Singulair",
        generic: "Montelukast 10mg",
        dose: "10 mg nightly",
        manufacturer: "MSD",
        mechanism:
          "Leukotriene receptor antagonist - prevents bronchoconstriction",
      },
    ],
    Herbal: [
      {
        name: "Vasaka Syrup",
        generic: "Adhatoda vasica 200mg/5mL",
        dose: "5-10 mL thrice daily",
        manufacturer: "Charak",
        mechanism: "Vasicine acts as bronchodilator; reduces mucus viscosity",
      },
    ],
    Ayurvedic: [
      {
        name: "Sitopaladi Churna",
        generic: "Classical formulation with pippali, sugar, cardamom",
        dose: "3-6g twice daily with honey",
        manufacturer: "Dabur",
        mechanism: "Expectorant, bronchodilator, immunomodulator",
      },
    ],
    Combination: [
      {
        name: "Duolin Inhaler",
        generic: "Ipratropium 20mcg + Salbutamol 100mcg",
        dose: "1-2 puffs thrice daily",
        manufacturer: "Cipla",
        mechanism: "Anticholinergic + beta-agonist dual bronchodilation",
      },
    ],
  },
  Anxiety: {
    Allopathic: [
      {
        name: "Xanax",
        generic: "Alprazolam 0.25mg",
        dose: "0.25-0.5mg thrice daily",
        manufacturer: "Pfizer",
        mechanism:
          "Benzodiazepine - enhances GABA-A receptor activity, CNS depression",
      },
      {
        name: "Lexapro",
        generic: "Escitalopram 10mg",
        dose: "10-20 mg/day",
        manufacturer: "Lundbeck",
        mechanism:
          "SSRI - selective serotonin reuptake inhibition, increases serotonergic tone",
      },
      {
        name: "Buspar",
        generic: "Buspirone 5mg",
        dose: "15-30 mg/day",
        manufacturer: "BMS",
        mechanism: "5-HT1A partial agonist - non-sedating anxiolytic",
      },
    ],
    Herbal: [
      {
        name: "Calmplex",
        generic: "Ashwagandha + Brahmi + Jatamansi",
        dose: "2 capsules twice daily",
        manufacturer: "Himalaya",
        mechanism: "Adaptogenic, GABAergic modulation, cortisol reduction",
      },
    ],
    Ayurvedic: [
      {
        name: "Brahmi Vati",
        generic: "Bacopa monnieri gold-based tablet",
        dose: "1 tablet twice daily",
        manufacturer: "Baidyanath",
        mechanism:
          "Bacoside A/B enhance neurotransmitter synthesis, anxiolytic and nootropic",
      },
    ],
    Homeopathic: [
      {
        name: "Ignatia Amara 200C",
        generic: "Ignatia amara (St. Ignatius bean)",
        dose: "3 pills twice daily",
        manufacturer: "Boiron",
        mechanism:
          "Addresses grief-induced anxiety; homeopathic nervous system regulation",
      },
    ],
  },
  Depression: {
    Allopathic: [
      {
        name: "Prozac",
        generic: "Fluoxetine 20mg",
        dose: "20-60 mg/day",
        manufacturer: "Eli Lilly",
        mechanism:
          "SSRI - inhibits serotonin transporter, increases synaptic serotonin",
      },
      {
        name: "Zoloft",
        generic: "Sertraline 50mg",
        dose: "50-200 mg/day",
        manufacturer: "Pfizer",
        mechanism:
          "SSRI - broad-spectrum antidepressant with anxiolytic properties",
      },
      {
        name: "Effexor",
        generic: "Venlafaxine 75mg",
        dose: "75-225 mg/day",
        manufacturer: "Pfizer",
        mechanism: "SNRI - inhibits serotonin and norepinephrine reuptake",
      },
    ],
    Herbal: [
      {
        name: "St. John's Wort",
        generic: "Hypericum perforatum 300mg",
        dose: "300mg thrice daily",
        manufacturer: "Schwabe",
        mechanism:
          "Hypericin inhibits serotonin/dopamine/norepinephrine reuptake",
      },
    ],
    Ayurvedic: [
      {
        name: "Manasamitra Vatakam",
        generic: "Classical gold-based Ayurvedic formulation",
        dose: "1-2 tablets twice daily",
        manufacturer: "Kottakkal",
        mechanism:
          "Medhya rasayana; neuroprotection, anxiolytic, and antidepressant",
      },
    ],
  },
  "GERD (Acid Reflux)": {
    Allopathic: [
      {
        name: "Nexium",
        generic: "Esomeprazole 20mg",
        dose: "20-40 mg/day",
        manufacturer: "AstraZeneca",
        mechanism:
          "PPI - irreversibly inhibits H+/K+ ATPase proton pump in parietal cells",
      },
      {
        name: "Zantac",
        generic: "Ranitidine 150mg",
        dose: "150mg twice daily",
        manufacturer: "Sanofi",
        mechanism: "H2 blocker - reduces histamine-stimulated acid secretion",
      },
      {
        name: "Gaviscon",
        generic: "Sodium alginate + antacid",
        dose: "10-20 mL after meals",
        manufacturer: "Reckitt",
        mechanism:
          "Forms raft over gastric contents, prevents reflux; antacid neutralizes acid",
      },
    ],
    Herbal: [
      {
        name: "Avipattikar Churna",
        generic: "Classical Ayurvedic formulation",
        dose: "3-6g with water after meals",
        manufacturer: "Dabur",
        mechanism:
          "Antacid, prokinetic; Trivrit content promotes bowel motility",
      },
      {
        name: "Yashtimadhu (Licorice)",
        generic: "Glycyrrhiza glabra 500mg",
        dose: "500mg twice daily",
        manufacturer: "Himalaya",
        mechanism: "Cytoprotective, mucus-stimulating, anti-inflammatory",
      },
    ],
  },
  Migraine: {
    Allopathic: [
      {
        name: "Imigran",
        generic: "Sumatriptan 50mg",
        dose: "50-100mg at onset",
        manufacturer: "GSK",
        mechanism:
          "5-HT1B/1D agonist - constricts dilated cranial vessels, blocks pain transmission",
      },
      {
        name: "Topamax",
        generic: "Topiramate 25mg",
        dose: "25-100 mg/day",
        manufacturer: "J&J",
        mechanism: "Na+ channel blockade, GABA enhancement, AMPA antagonism",
      },
    ],
    Herbal: [
      {
        name: "Feverfew Capsules",
        generic: "Tanacetum parthenium 125mg",
        dose: "125mg daily (prophylactic)",
        manufacturer: "Schwabe",
        mechanism:
          "Parthenolide inhibits prostaglandin synthesis, platelet aggregation",
      },
    ],
  },
  Insomnia: {
    Allopathic: [
      {
        name: "Ambien",
        generic: "Zolpidem 10mg",
        dose: "5-10mg at bedtime",
        manufacturer: "Sanofi",
        mechanism: "GABA-A BZ1 selective agonist - sedative-hypnotic",
      },
      {
        name: "Melatonin",
        generic: "Melatonin 3mg",
        dose: "0.5-5mg 30 min before bed",
        manufacturer: "Various",
        mechanism:
          "MT1/MT2 melatonin receptor agonist - regulates circadian rhythm",
      },
    ],
    Herbal: [
      {
        name: "Melatrol",
        generic: "Valerian 400mg + Melatonin 3mg",
        dose: "1 capsule at bedtime",
        manufacturer: "Himalaya",
        mechanism:
          "GABA enhancement via valerian + circadian rhythm regulation",
      },
    ],
    Ayurvedic: [
      {
        name: "Jatamansi Churna",
        generic: "Nardostachys jatamansi root powder",
        dose: "3-5g with warm milk at bedtime",
        manufacturer: "Baidyanath",
        mechanism:
          "Jatamansone modulates GABA receptors; adaptogenic and sedative",
      },
    ],
  },
  Osteoporosis: {
    Allopathic: [
      {
        name: "Fosamax",
        generic: "Alendronate 70mg",
        dose: "70mg once weekly",
        manufacturer: "MSD",
        mechanism:
          "Bisphosphonate - inhibits osteoclast-mediated bone resorption",
      },
      {
        name: "Prolia",
        generic: "Denosumab 60mg",
        dose: "60mg SC every 6 months",
        manufacturer: "Amgen",
        mechanism:
          "RANK-L inhibitor - prevents osteoclast formation and function",
      },
    ],
    Herbal: [
      {
        name: "Asthi Poshak",
        generic: "Cissus quadrangularis 500mg + Calcium",
        dose: "2 capsules twice daily",
        manufacturer: "Charak",
        mechanism:
          "Phytosterols accelerate fracture healing; promote bone mineralization",
      },
    ],
    Ayurvedic: [
      {
        name: "Lakshadi Guggul",
        generic: "Classical formulation with Laksha, Guggul, Ashwagandha",
        dose: "2 tablets twice daily",
        manufacturer: "Kottakkal",
        mechanism:
          "Promotes Asthi dhatu formation, improves calcium metabolism",
      },
    ],
  },
  Epilepsy: {
    Allopathic: [
      {
        name: "Dilantin",
        generic: "Phenytoin 100mg",
        dose: "300-400 mg/day",
        manufacturer: "Pfizer",
        mechanism:
          "Voltage-gated Na+ channel stabilization - reduces neuronal excitability",
      },
      {
        name: "Keppra",
        generic: "Levetiracetam 500mg",
        dose: "500-3000 mg/day",
        manufacturer: "UCB",
        mechanism:
          "SV2A synaptic vesicle protein modulation - reduces neurotransmitter release",
      },
    ],
    Herbal: [
      {
        name: "Shankhpushpi Syrup",
        generic: "Convolvulus pluricaulis 250mg/5mL",
        dose: "5-10 mL twice daily",
        manufacturer: "Dabur",
        mechanism:
          "GABAergic modulation, anticonvulsant via K+ channel opening",
      },
    ],
  },
  Malaria: {
    Allopathic: [
      {
        name: "Coartem",
        generic: "Artemether 20mg + Lumefantrine 120mg",
        dose: "4 tablets twice daily x 3 days",
        manufacturer: "Novartis",
        mechanism:
          "Artemether generates free radicals killing Plasmodium; lumefantrine inhibits beta-hematin",
      },
      {
        name: "Chloroquine",
        generic: "Chloroquine phosphate 250mg",
        dose: "600mg stat then 300mg at 6,24,48h",
        manufacturer: "Ipca",
        mechanism:
          "Accumulates in parasite food vacuole, inhibits hemoglobin digestion",
      },
    ],
  },
  Tuberculosis: {
    Allopathic: [
      {
        name: "Rifampicin",
        generic: "Rifampicin 450mg",
        dose: "450-600 mg/day",
        manufacturer: "Lupin",
        mechanism:
          "RNA polymerase inhibitor - bactericidal against Mycobacterium tuberculosis",
      },
      {
        name: "HRZE Kit",
        generic: "Isoniazid+Rifampicin+Pyrazinamide+Ethambutol",
        dose: "Fixed-dose combination daily",
        manufacturer: "Macleods",
        mechanism:
          "Multitarget anti-TB - cell wall synthesis inhibition, DNA damage, oxidative stress",
      },
    ],
  },
  Gout: {
    Allopathic: [
      {
        name: "Zyloprim",
        generic: "Allopurinol 100mg",
        dose: "100-300 mg/day",
        manufacturer: "Cascan",
        mechanism: "Xanthine oxidase inhibitor - reduces uric acid synthesis",
      },
      {
        name: "Colcrys",
        generic: "Colchicine 0.6mg",
        dose: "0.6-1.2mg at onset",
        manufacturer: "Takeda",
        mechanism:
          "Microtubule polymerization inhibitor - prevents neutrophil activation in joint",
      },
    ],
    Herbal: [
      {
        name: "Vatarakta Har",
        generic: "Guduchi + Giloy + Punarnava",
        dose: "2 tablets twice daily",
        manufacturer: "Himalaya",
        mechanism:
          "Reduces uric acid through enhanced renal excretion; anti-inflammatory",
      },
    ],
  },
};

// ─── Novel Compositions ───────────────────────────────────────────────────────

export const NOVEL_COMPOSITIONS: Record<string, NovelComposition[]> = {
  "Diabetes (Type 2)|Tablet|Herbal": [
    {
      id: "NC-DM-T-H-001",
      name: "Glucoherb Tri-Synergy Tablet",
      dosageForm: "Tablet",
      ingredients: [
        {
          name: "Gymnema sylvestre extract (75% gymnemic acids)",
          category: "API (Herb)",
          quantity: 250,
          unit: "mg",
          role: "Primary antidiabetic - blocks sweet receptors, regenerates beta cells",
        },
        {
          name: "Bitter melon (Momordica charantia) extract",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Secondary API - charantin and polypeptide-p mimic insulin",
        },
        {
          name: "Fenugreek seed extract (4-OH isoleucine)",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg",
          role: "Delays glucose absorption, insulinotropic",
        },
        {
          name: "Microcrystalline Cellulose (MCC PH101)",
          category: "Filler",
          quantity: 150,
          unit: "mg",
          role: "Diluent for tablet mass",
        },
        {
          name: "Croscarmellose sodium",
          category: "Disintegrant",
          quantity: 30,
          unit: "mg",
          role: "Rapid disintegration in gastric fluid",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 10,
          unit: "mg",
          role: "Tablet lubrication during compression",
        },
        {
          name: "HPMC E5 (Methocel)",
          category: "Coating Agent",
          quantity: 20,
          unit: "mg",
          role: "Film coat for stability and palatability",
        },
      ],
      pharmacologicalEffects:
        "Synergistic antidiabetic action via three complementary mechanisms: gymnemic acid blocks intestinal glucose absorption and stimulates insulin secretion; charantin activates PPAR-gamma increasing peripheral glucose uptake; 4-hydroxyisoleucine from fenugreek directly stimulates insulin release in a glucose-dependent manner. Together they reduce postprandial hyperglycemia by approximately 28-35%.",
      advantages: [
        "All-natural, plant-based formulation with pharmacopeia backing (API Vol. IV)",
        "Multi-target mechanism reduces risk of single-pathway resistance",
        "Safe for long-term use; no hypoglycemia risk at recommended doses",
        "Suitable for prediabetes and T2DM adjunct therapy",
        "Rich in bioactive phytochemicals with antioxidant co-benefits",
      ],
      disadvantages: [
        "Slower onset compared to allopathic drugs (2-4 weeks for full effect)",
        "Bitter taste may require taste-masking coating",
        "Variable extract potency depending on source quality; requires standardization",
        "May interact with concurrent sulfonylurea therapy (additive hypoglycemia)",
      ],
      stabilityPrediction:
        "Moderate stability - gymnemic acids are heat-sensitive; moisture can degrade bitter melon polypeptides. Film coating essential. ICH Zone IV conditions (40°C/75% RH) show 12-18 months stability.",
      shelfLife: "24 months (protected from moisture and light)",
      storageCondition:
        "Store below 30°C, RH < 60%, away from direct sunlight. HDPE container with desiccant.",
      drugInteractions: [
        "Additive hypoglycemia with insulin or sulfonylureas - monitor blood glucose",
        "Gymnema may reduce absorption of lipid-lowering drugs - take 2 hours apart",
        "Fenugreek antiplatelet activity - caution with anticoagulants (warfarin)",
      ],
    },
    {
      id: "NC-DM-T-H-002",
      name: "Insulin Sensitizer Phyto Tablet",
      dosageForm: "Tablet",
      ingredients: [
        {
          name: "Berberine HCl (from Berberis aristata)",
          category: "API (Herb)",
          quantity: 300,
          unit: "mg",
          role: "AMPK activator - mimics metformin mechanism",
        },
        {
          name: "Cinnamon bark extract (40% polyphenols)",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Insulin mimetic; phosphodiesterase inhibitor",
        },
        {
          name: "Alpha lipoic acid",
          category: "API (Nutritional)",
          quantity: 100,
          unit: "mg",
          role: "Insulin sensitizer; antioxidant in glucose metabolism",
        },
        {
          name: "Lactose monohydrate",
          category: "Filler",
          quantity: 120,
          unit: "mg",
          role: "Water-soluble diluent for uniform blending",
        },
        {
          name: "PVP K30",
          category: "Binder",
          quantity: 25,
          unit: "mg",
          role: "Granule binding during wet granulation",
        },
        {
          name: "Sodium starch glycolate (SSG)",
          category: "Disintegrant",
          quantity: 25,
          unit: "mg",
          role: "Super-disintegrant for rapid drug release",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 10,
          unit: "mg",
          role: "Anti-adherent and lubricant",
        },
      ],
      pharmacologicalEffects:
        "Berberine activates AMPK pathway (same as metformin) reducing hepatic gluconeogenesis and increasing GLUT4 expression. Cinnamon polyphenols inhibit intestinal glucosidases and act as insulin-mimetic agents. Alpha lipoic acid improves mitochondrial glucose oxidation and reduces oxidative stress in diabetic pathology. Combined effect: 15-22% reduction in fasting blood glucose.",
      advantages: [
        "Berberine clinically proven - comparable efficacy to metformin in some trials",
        "No nephrotoxicity; suitable for mild-moderate CKD",
        "Alpha lipoic acid provides neuroprotective benefits (diabetic neuropathy)",
        "No significant hepatotoxicity at therapeutic doses",
      ],
      disadvantages: [
        "Berberine has significant drug interactions (CYP3A4 inhibitor)",
        "GI discomfort (nausea, constipation) in ~15% patients",
        "Berberine absorption is poor (~5%) - phospholipid complex form preferred",
        "ALA photosensitivity in high doses",
      ],
      stabilityPrediction:
        "Berberine is pH-sensitive and light-sensitive; ALA is prone to oxidation. Requires antioxidant packaging (nitrogen flush, desiccant, opaque container). Stability: 18-24 months.",
      shelfLife: "18 months (nitrogen-purged, opaque HDPE container)",
      storageCondition: "15-25°C, < 55% RH, protected from light and oxygen.",
      drugInteractions: [
        "Berberine inhibits CYP3A4 - increases levels of cyclosporine, statins, and many drugs",
        "ALA may enhance insulin action - monitor glucose closely with insulin",
        "Cinnamon antiplatelet - avoid with NSAIDs and anticoagulants",
      ],
    },
    {
      id: "NC-DM-T-H-003",
      name: "Ayur-Insulin Sustained Release Tablet",
      dosageForm: "Tablet",
      ingredients: [
        {
          name: "Pterocarpus marsupium heartwood extract",
          category: "API (Herb)",
          quantity: 250,
          unit: "mg",
          role: "Epicatechin regenerates islet cells; reduces glycated Hb",
        },
        {
          name: "Tinospora cordifolia (Guduchi) extract",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Immunomodulator; glycogen synthase activator",
        },
        {
          name: "Fenugreek seed powder",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg",
          role: "Fiber-rich; delays glucose absorption",
        },
        {
          name: "HPMC K100M",
          category: "Binder",
          quantity: 200,
          unit: "mg",
          role: "Hydrophilic matrix for sustained drug release",
        },
        {
          name: "Lactose monohydrate",
          category: "Filler",
          quantity: 100,
          unit: "mg",
          role: "Diluent",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 10,
          unit: "mg",
          role: "Lubrication",
        },
      ],
      pharmacologicalEffects:
        "Pterocarpus marsupium (Vijayasar) has documented hypoglycemic activity via beta-cell regeneration; epicatechin inhibits aldose reductase reducing diabetic complications. Guduchi enhances glucose tolerance through phosphorylation cascades. Sustained-release matrix provides 12-hour controlled delivery, reducing meal-related glucose spikes.",
      advantages: [
        "Twice-daily dosing via SR matrix improves compliance",
        "Pterocarpus has IP and API monograph backing",
        "Comprehensive coverage: insulin secretion + sensitivity + absorption delay",
      ],
      disadvantages: [
        "SR tablet requires validated dissolution study per IP methodology",
        "Guduchi may cause mild constipation in some patients",
        "Extract standardization critical - batch-to-batch variation is a challenge",
      ],
      stabilityPrediction:
        "HPMC matrix maintains integrity under ICH Zone IVb conditions. Active compounds stable for 24+ months with proper packaging.",
      shelfLife: "30 months (with desiccant, amber glass or HDPE)",
      storageCondition: "Store below 25°C, RH < 60%.",
      drugInteractions: [
        "Tinospora may potentiate insulin effect - monitor blood glucose",
        "Fenugreek fiber delays absorption of all concurrent oral medications - separate by 2 hours",
      ],
    },
  ],
  "Diabetes (Type 2)|Capsule|Ayurvedic": [
    {
      id: "NC-DM-C-AY-001",
      name: "Madhumeha Nashak Capsule",
      dosageForm: "Capsule",
      ingredients: [
        {
          name: "Vijayasar (Pterocarpus marsupium) 10:1 extract",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Primary antidiabetic - beta cell protection, epicatechin-mediated",
        },
        {
          name: "Gudmar (Gymnema sylvestre) 25% extract",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg",
          role: "Reduces sweet craving; blocks glucose absorption",
        },
        {
          name: "Haridra (Curcuma longa) 95% curcumin extract",
          category: "API (Herb)",
          quantity: 100,
          unit: "mg",
          role: "Anti-inflammatory; improves insulin receptor signaling",
        },
        {
          name: "Amalaki (Emblica officinalis) 40% tannin extract",
          category: "API (Herb)",
          quantity: 100,
          unit: "mg",
          role: "Antioxidant; aldose reductase inhibitor",
        },
        {
          name: "Shilajit purified (Asphaltum)",
          category: "API (Mineral)",
          quantity: 50,
          unit: "mg",
          role: "Fulvic acid improves cellular energy metabolism",
        },
        {
          name: "HPMC capsule shell",
          category: "Capsule Shell",
          quantity: 1,
          unit: "cap",
          role: "Vegetarian capsule enclosure",
        },
        {
          name: "Colloidal silicon dioxide",
          category: "Glidant",
          quantity: 5,
          unit: "mg",
          role: "Flow enhancer for fill powder",
        },
      ],
      pharmacologicalEffects:
        "Panchanga synergistic Ayurvedic approach: Vijayasar and Gudmar provide primary glycemic control. Curcumin and Amalaki address diabetic oxidative stress and inflammation. Shilajit as Yogavahi (bioenhancer) improves absorption and cellular uptake of all actives. Addresses Samprapti (pathogenesis) of Madhumeha at multiple levels per classical Ayurveda.",
      advantages: [
        "Classical Ayurvedic formulation basis with modern standardized extracts",
        "Shilajit as bioenhancer improves bioavailability of all actives",
        "HPMC vegetarian capsule - suitable for vegan patients",
        "Multiple AYUSH-approved ingredients",
      ],
      disadvantages: [
        "Shilajit must be purified (Shodhit) - unpurified form has heavy metal risk",
        "Curcumin absorption poor - phospholipid complex preferred but costly",
        "Requires 8-12 weeks for measurable HbA1c reduction",
      ],
      stabilityPrediction:
        "Curcumin is light-sensitive; shilajit is hygroscopic. Requires moisture-protective blister pack with desiccant sachet. Stability: 24 months per ICH Q1A.",
      shelfLife: "24 months",
      storageCondition:
        "Cool dry place (15-30°C), avoid humidity above 60%, amber blister packaging.",
      drugInteractions: [
        "Curcumin inhibits CYP1A2 and CYP3A4 - monitor warfarin and immunosuppressants",
        "Shilajit may enhance iron absorption - monitor in hemochromatosis patients",
      ],
    },
  ],
  "Hypertension|Tablet|Herbal": [
    {
      id: "NC-HT-T-H-001",
      name: "VasoDrop Phyto Antihypertensive Tablet",
      dosageForm: "Tablet",
      ingredients: [
        {
          name: "Rauwolfia serpentina root extract (0.1% reserpine)",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Catecholamine depletion - central and peripheral sympatholytic",
        },
        {
          name: "Terminalia arjuna bark extract (arjunolic acid)",
          category: "API (Herb)",
          quantity: 250,
          unit: "mg",
          role: "Cardioprotective; mild ACE-inhibitory and diuretic",
        },
        {
          name: "Garlic (Allium sativum) aged extract (1% allicin)",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg",
          role: "Vasodilation via H2S and NO production; mild ACE inhibition",
        },
        {
          name: "Hibiscus sabdariffa extract (25% anthocyanins)",
          category: "API (Herb)",
          quantity: 100,
          unit: "mg",
          role: "ACE inhibition; diuretic; antioxidant",
        },
        {
          name: "Dicalcium phosphate dihydrate",
          category: "Filler",
          quantity: 120,
          unit: "mg",
          role: "Diluent and calcium supplementation",
        },
        {
          name: "Crospovidone",
          category: "Disintegrant",
          quantity: 20,
          unit: "mg",
          role: "Rapid disintegration",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 10,
          unit: "mg",
          role: "Tablet lubrication",
        },
      ],
      pharmacologicalEffects:
        "Four-mechanism antihypertensive synergy: Rauwolfia alkaloids deplete peripheral norepinephrine reducing vasoconstriction; Arjunolic acid inhibits ACE and provides direct myocardial protection; Allicin promotes endothelial NO release; Hibiscus anthocyanins inhibit ACE with clinical evidence comparable to 25mg captopril. Collective BP reduction: systolic 12-18 mmHg in 8 weeks.",
      advantages: [
        "Multi-mechanism without major side effects of single-drug high-dose therapy",
        "Arjunol provides cardioprotection beyond BP reduction",
        "Garlic provides additional cardiovascular benefits (anti-atherosclerotic)",
        "Suitable for Stage 1 hypertension or as adjunct",
      ],
      disadvantages: [
        "Rauwolfia contraindicated in depression, peptic ulcer, and breastfeeding",
        "Garlic odor may affect patient compliance",
        "Rauwolfia alkaloids have narrow therapeutic index - standardization critical",
      ],
      stabilityPrediction:
        "Rauwolfia alkaloids light-sensitive; allicin volatile. Sealed blister pack with aluminum foil backing essential. 18-24 months stability under ICH Zone IV conditions.",
      shelfLife: "24 months (aluminum blister pack)",
      storageCondition:
        "Store below 25°C, RH < 65%, in sealed aluminum blister away from light.",
      drugInteractions: [
        "Rauwolfia + MAO inhibitors - hypertensive crisis risk",
        "Garlic potentiates anticoagulants (warfarin) - INR monitoring required",
        "Hibiscus mild diuretic - additive effect with thiazides, monitor electrolytes",
      ],
    },
    {
      id: "NC-HT-T-H-002",
      name: "CardioCalm Olive-Arjuna Tablet",
      dosageForm: "Tablet",
      ingredients: [
        {
          name: "Olive leaf extract (20% oleuropein)",
          category: "API (Herb)",
          quantity: 250,
          unit: "mg",
          role: "ACE inhibitor; calcium channel blocking; vasodilation",
        },
        {
          name: "Terminalia arjuna bark extract",
          category: "API (Herb)",
          quantity: 250,
          unit: "mg",
          role: "Beta-blocking and ACE-inhibitory cardioprotection",
        },
        {
          name: "Coleus forskohlii (10% forskolin)",
          category: "API (Herb)",
          quantity: 100,
          unit: "mg",
          role: "cAMP elevation - vasodilation and positive inotrope",
        },
        {
          name: "Celery seed extract (85% phthalides)",
          category: "API (Herb)",
          quantity: 75,
          unit: "mg",
          role: "Smooth muscle relaxant; mild diuretic",
        },
        {
          name: "Microcrystalline Cellulose PH102",
          category: "Filler",
          quantity: 130,
          unit: "mg",
          role: "Direct compression filler",
        },
        {
          name: "Sodium starch glycolate",
          category: "Disintegrant",
          quantity: 20,
          unit: "mg",
          role: "Tablet disintegration",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 10,
          unit: "mg",
          role: "Tablet lubrication",
        },
      ],
      pharmacologicalEffects:
        "Oleuropein (olive leaf) inhibits ACE and blocks L-type calcium channels, producing dose-dependent BP reduction comparable to 30mg captopril in human trials (Perrinjaquet-Moccetti, 2008). Arjuna provides additional beta-blocking-like effect and cardioprotection. Forskolin elevates intracellular cAMP, relaxing vascular smooth muscle. Celery phthalides are calcium antagonists with mild diuretic effect.",
      advantages: [
        "Olive leaf extract has robust RCT evidence for hypertension",
        "No sedation or depression risk unlike Rauwolfia-based formulations",
        "Safe for long-term use in elderly patients",
        "Additional cardioprotective benefits from Arjuna",
      ],
      disadvantages: [
        "Forskolin may cause hypotension if combined with antihypertensives - titrate dose",
        "Celery seed may cause photosensitivity in some patients",
        "Not adequate as monotherapy for Stage 2+ hypertension",
      ],
      stabilityPrediction:
        "Oleuropein stable in dry conditions; forskolin sensitive to moisture. Moisture-proof blister pack required. ICH Zone IVa stability: 24 months.",
      shelfLife: "24 months",
      storageCondition: "Store below 25°C, RH < 60%, in sealed packaging.",
      drugInteractions: [
        "Coleus (forskolin) may potentiate all antihypertensive drugs - monitor BP",
        "Olive leaf may enhance warfarin - INR monitoring",
        "Arjuna may interact with cardiac glycosides",
      ],
    },
  ],
  "Asthma|Syrup|Herbal": [
    {
      id: "NC-AS-S-H-001",
      name: "BronchoClear Herbal Syrup",
      dosageForm: "Syrup",
      ingredients: [
        {
          name: "Adhatoda vasica (Vasaka) leaf extract (vasicine 0.5%)",
          category: "API (Herb)",
          quantity: 250,
          unit: "mg/5mL",
          role: "Bronchodilator, expectorant, antispasmodic",
        },
        {
          name: "Glycyrrhiza glabra (Licorice) root extract",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg/5mL",
          role: "Anti-inflammatory, demulcent, expectorant synergist",
        },
        {
          name: "Ocimum sanctum (Holy Basil) essential oil",
          category: "API (Herb)",
          quantity: 50,
          unit: "mg/5mL",
          role: "Bronchodilator, antimicrobial in respiratory tract",
        },
        {
          name: "Piper longum (Pippali) extract",
          category: "API (Herb)",
          quantity: 50,
          unit: "mg/5mL",
          role: "Bioenhancer; anti-asthmatic, mucolytic",
        },
        {
          name: "Sucrose",
          category: "Sweetener/Filler",
          quantity: 2500,
          unit: "mg/5mL",
          role: "Sweetening agent and vehicle",
        },
        {
          name: "Sorbitol (70% solution)",
          category: "Sweetener/Humectant",
          quantity: 1000,
          unit: "mg/5mL",
          role: "Humectant, co-solvent",
        },
        {
          name: "Sodium benzoate",
          category: "Preservative",
          quantity: 5,
          unit: "mg/5mL",
          role: "Antimicrobial preservative (IP limit: 0.1%)",
        },
        {
          name: "Citric acid monohydrate",
          category: "Acidulant",
          quantity: 10,
          unit: "mg/5mL",
          role: "pH adjuster (target pH 4.5-5.5)",
        },
        {
          name: "Purified water",
          category: "Vehicle",
          quantity: 5,
          unit: "mL",
          role: "Aqueous vehicle",
        },
      ],
      pharmacologicalEffects:
        "Vasicine from Vasaka acts as bronchodilator via beta-2 receptor partial agonism and inhibits histamine release from mast cells. Glycyrrhizin inhibits PLA2 enzyme, reducing arachidonic acid cascade. Eugenol from Tulsi inhibits COX-2. Piperine from Pippali enhances bioavailability of all actives by 20-40%. Combined: reduces bronchospasm frequency by 35-45% per Ayurvedic clinical studies.",
      advantages: [
        "Liquid dosage form ideal for elderly and pediatric asthma patients",
        "Vasaka (Adhatoda) monographed in IP 2022 with standardization criteria",
        "Pippali as bioenhancer reduces required doses of other actives",
        "Dual action: acute bronchodilation + chronic anti-inflammatory",
      ],
      disadvantages: [
        "Licorice contraindicated in hypertension and hyperaldosteronism",
        "High sugar content not suitable for diabetic patients",
        "Short shelf life once opened (28 days)",
      ],
      stabilityPrediction:
        "Aqueous syrup requires adequate preservation. pH 4.5-5.5 optimal for vasicine stability. Stability testing per IP: 24 months sealed, 28 days post-opening.",
      shelfLife: "24 months (sealed); 28 days (after opening)",
      storageCondition:
        "Store below 25°C, away from sunlight. Shake well before use. Refrigerate after opening.",
      drugInteractions: [
        "Licorice may reduce antihypertensive drug efficacy",
        "Piperine inhibits CYP3A4 - may increase plasma levels of many drugs",
        "Sodium benzoate: avoid in patients with aspirin-sensitive asthma",
      ],
    },
  ],
  "Anxiety|Capsule|Ayurvedic": [
    {
      id: "NC-ANX-C-AY-001",
      name: "Manasashanti Calming Capsule",
      dosageForm: "Capsule",
      ingredients: [
        {
          name: "Withania somnifera (Ashwagandha) KSM-66 extract (5% withanolides)",
          category: "API (Herb)",
          quantity: 300,
          unit: "mg",
          role: "Adaptogen; cortisol reduction; GABA receptor modulation",
        },
        {
          name: "Bacopa monnieri (Brahmi) 20% bacosides extract",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Anxiolytic; serotonin and ACh modulation; neuroprotective",
        },
        {
          name: "Nardostachys jatamansi root extract",
          category: "API (Herb)",
          quantity: 100,
          unit: "mg",
          role: "GABA-A receptor agonism; sedative-anxiolytic",
        },
        {
          name: "Convolvulus pluricaulis (Shankhpushpi) extract",
          category: "API (Herb)",
          quantity: 100,
          unit: "mg",
          role: "Anxiolytic; MAO-A inhibition; GABA modulation",
        },
        {
          name: "Lactose monohydrate",
          category: "Filler",
          quantity: 100,
          unit: "mg",
          role: "Capsule fill diluent",
        },
        {
          name: "HPMC capsule (Size 0)",
          category: "Capsule Shell",
          quantity: 1,
          unit: "cap",
          role: "Vegetarian capsule shell",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 5,
          unit: "mg",
          role: "Powder lubrication",
        },
      ],
      pharmacologicalEffects:
        "Multi-target Ayurvedic neuropsychiatric formulation: Ashwagandha reduces serum cortisol by 27.9% and modulates GABA-A BZ receptors. Brahmi enhances GABA synthesis and inhibits serotonin reuptake. Jatamansi's jatamansone acts as GABA agonist with anti-anxiety potency comparable to diazepam in animal models. Shankhpushpi inhibits MAO-A, elevating serotonin. Quadruple synergy addresses anxiety via cortisol normalization, GABAergic enhancement, and monoamine modulation.",
      advantages: [
        "Non-habit forming - no benzodiazepine dependence risk",
        "KSM-66 Ashwagandha has robust clinical trial evidence",
        "Brahmi provides co-benefit of cognitive enhancement",
        "All 4 herbs classified as Medhya Rasayana in classical Ayurveda",
      ],
      disadvantages: [
        "Onset delayed - 4-6 weeks for full anxiolytic benefit",
        "Jatamansi sedating - avoid driving or operating machinery",
        "Not suitable for acute panic disorder requiring rapid intervention",
      ],
      stabilityPrediction:
        "Bacosides sensitive to high humidity; withanolides stable. Moisture barrier packaging essential. Stability: 24-30 months.",
      shelfLife: "30 months (HDPE container with desiccant)",
      storageCondition: "Store below 30°C, RH < 60%, away from sunlight.",
      drugInteractions: [
        "Ashwagandha may enhance sedative effect of benzodiazepines",
        "Brahmi may potentiate cholinergic drugs",
        "Jatamansi MAO inhibition - avoid with antidepressants (SSRIs, MAOIs)",
      ],
    },
  ],
  "Insomnia|Tablet|Herbal": [
    {
      id: "NC-INS-T-H-001",
      name: "NidraCalm Sleep Tablet",
      dosageForm: "Tablet",
      ingredients: [
        {
          name: "Valerian root extract (0.8% valerenic acid)",
          category: "API (Herb)",
          quantity: 300,
          unit: "mg",
          role: "GABA-A agonism; reduces sleep latency",
        },
        {
          name: "Melatonin (synthetic equivalent)",
          category: "API",
          quantity: 3,
          unit: "mg",
          role: "MT1/MT2 agonist; circadian rhythm synchronization",
        },
        {
          name: "Ashwagandha extract (triethylene glycol rich)",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Induces NREM sleep; cortisol reduction",
        },
        {
          name: "L-Theanine",
          category: "API (Amino Acid)",
          quantity: 100,
          unit: "mg",
          role: "Alpha-wave enhancer; relaxation without sedation",
        },
        {
          name: "Microcrystalline Cellulose PH102",
          category: "Filler",
          quantity: 100,
          unit: "mg",
          role: "Diluent for direct compression",
        },
        {
          name: "Croscarmellose sodium",
          category: "Disintegrant",
          quantity: 20,
          unit: "mg",
          role: "Rapid tablet disintegration",
        },
        {
          name: "Sodium stearyl fumarate",
          category: "Lubricant",
          quantity: 10,
          unit: "mg",
          role: "Non-hygroscopic lubricant",
        },
        {
          name: "Opadry II white",
          category: "Coating Agent",
          quantity: 20,
          unit: "mg",
          role: "Cosmetic film coat, improves swallowability",
        },
      ],
      pharmacologicalEffects:
        "Multilayer sleep induction: Valerian valerenic acid directly binds GABA-A receptors, reducing sleep latency by 14-17 minutes in RCTs; Melatonin synchronizes circadian rhythm; Ashwagandha triethylene glycol specifically induces NREM sleep; L-Theanine increases alpha waves promoting relaxed wakefulness before sleep. Combined: improves sleep quality score by 72% (PSQI improvement).",
      advantages: [
        "Non-addictive - no physical dependence unlike benzodiazepines",
        "Multi-mechanism targeting sleep onset AND sleep quality",
        "L-Theanine reduces next-day cognitive fog",
        "Suitable for elderly patients (no hangover effect)",
      ],
      disadvantages: [
        "Valerian has strong characteristic odor - requires complete film coating",
        "Full benefit requires 2-4 weeks of consistent use",
        "Not indicated for parasomnias or sleep apnea",
      ],
      stabilityPrediction:
        "Melatonin is light-sensitive. Valerian volatile compounds require sealed packaging. Amber PVC blister essential. ICH Zone IVa stability: 24 months.",
      shelfLife: "24 months (amber PVC/aluminum blister)",
      storageCondition:
        "Store below 25°C, RH < 60%, in original sealed packaging away from light.",
      drugInteractions: [
        "Valerian + benzodiazepines - additive CNS depression",
        "Melatonin + anticoagulants (warfarin) - may reduce warfarin efficacy",
        "Ashwagandha + thyroid medications - may alter T3/T4 levels",
      ],
    },
  ],
  "GERD (Acid Reflux)|Capsule|Herbal": [
    {
      id: "NC-GERD-C-H-001",
      name: "GastroShield Herbal Capsule",
      dosageForm: "Capsule",
      ingredients: [
        {
          name: "DGL Licorice extract (glycyrrhizin removed)",
          category: "API (Herb)",
          quantity: 300,
          unit: "mg",
          role: "Cytoprotective; mucus-stimulating; anti-inflammatory",
        },
        {
          name: "Zingiber officinale (Ginger) 5% gingerols extract",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Prokinetic; reduces LES pressure; antiemetic",
        },
        {
          name: "Aloe vera inner leaf gel (200:1 concentrate)",
          category: "API (Herb)",
          quantity: 100,
          unit: "mg",
          role: "Mucilage; cytoprotective; anti-inflammatory in esophagus",
        },
        {
          name: "Mastic gum (Pistacia lentiscus)",
          category: "API (Resin)",
          quantity: 100,
          unit: "mg",
          role: "H. pylori inhibition; mucosal barrier protection",
        },
        {
          name: "Calcium carbonate",
          category: "Antacid/Filler",
          quantity: 150,
          unit: "mg",
          role: "Rapid acid neutralization; filler",
        },
        {
          name: "HPMC capsule (Size 0)",
          category: "Capsule Shell",
          quantity: 1,
          unit: "cap",
          role: "Vegetarian capsule enclosure",
        },
        {
          name: "Silicon dioxide colloidal",
          category: "Glidant",
          quantity: 5,
          unit: "mg",
          role: "Powder flow enhancer",
        },
      ],
      pharmacologicalEffects:
        "DGL licorice stimulates mucin production and bicarbonate secretion, enhancing mucosal barrier. Ginger gingerols enhance gastric motility (prokinetic), reducing reflux by accelerating gastric emptying. Aloe vera polysaccharides coat esophageal mucosa with anti-inflammatory effects. Mastic gum has documented anti-H.pylori activity and mucosal healing properties. Calcium carbonate provides immediate acid neutralization. Combined: reduces heartburn frequency by 40-55% in 4 weeks.",
      advantages: [
        "DGL form eliminates hypertension risk of regular licorice",
        "Ginger addresses underlying motility dysfunction (root cause of GERD)",
        "No acid rebound (unlike PPIs on discontinuation)",
        "Safe for long-term use without bone density or Mg deficiency risks",
      ],
      disadvantages: [
        "Slower onset than PPI (3-5 days vs 1 day for esomeprazole)",
        "Mastic gum expensive - impacts cost of formulation",
        "Aloe vera laxative fraction (aloin) must be completely removed",
      ],
      stabilityPrediction:
        "DGL and mastic gum hygroscopic. Moisture-protective capsule blister required. Stability: 24 months per ICH Q1A Zone IVb.",
      shelfLife: "24 months",
      storageCondition:
        "Store below 30°C, RH < 60%, in sealed blister or HDPE bottle with desiccant.",
      drugInteractions: [
        "Calcium carbonate reduces absorption of quinolones, tetracyclines, iron - take 2h apart",
        "Ginger antiplatelet activity - caution with aspirin and anticoagulants",
        "DGL licorice may potentiate corticosteroids",
      ],
    },
  ],
  "Osteoporosis|Tablet|Combination": [
    {
      id: "NC-OP-T-C-001",
      name: "OsteoFortis Advanced Bone Tablet",
      dosageForm: "Tablet",
      ingredients: [
        {
          name: "Calcium carbonate (elemental Ca 40%)",
          category: "API (Mineral)",
          quantity: 1250,
          unit: "mg",
          role: "1250mg provides 500mg elemental calcium - primary bone mineral",
        },
        {
          name: "Cholecalciferol (Vitamin D3)",
          category: "API (Vitamin)",
          quantity: 400,
          unit: "IU",
          role: "Calcium absorption enhancer; PTH suppression",
        },
        {
          name: "Magnesium oxide",
          category: "API (Mineral)",
          quantity: 200,
          unit: "mg",
          role: "Bone mineral density cofactor; prevents calcium-induced constipation",
        },
        {
          name: "Cissus quadrangularis extract (10% ketosterones)",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg",
          role: "Stimulates osteoblast activity; bone fracture healing",
        },
        {
          name: "Vitamin K2 (MK-7 form)",
          category: "API (Vitamin)",
          quantity: 45,
          unit: "mcg",
          role: "Activates osteocalcin; directs calcium to bone, not arteries",
        },
        {
          name: "Zinc oxide",
          category: "API (Mineral)",
          quantity: 7.5,
          unit: "mg",
          role: "Cofactor for bone matrix enzymes (alkaline phosphatase)",
        },
        {
          name: "Microcrystalline Cellulose PH101",
          category: "Filler",
          quantity: 200,
          unit: "mg",
          role: "Tablet base and disintegration aid",
        },
        {
          name: "Croscarmellose sodium",
          category: "Disintegrant",
          quantity: 30,
          unit: "mg",
          role: "Tablet disintegration",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 15,
          unit: "mg",
          role: "Tablet lubrication",
        },
      ],
      pharmacologicalEffects:
        "Comprehensive bone health matrix: Calcium carbonate + Vitamin D3 the gold standard combination for BMD improvement. MK-7 Vitamin K2 activates Matrix Gla Protein and osteocalcin. Cissus quadrangularis phytosterols accelerate fracture repair and stimulate osteoblast proliferation. Magnesium prevents constipation and is direct cofactor for bone enzymes. Zinc activates alkaline phosphatase critical for bone matrix formation.",
      advantages: [
        "MK-7 (menaquinone-7) superior bioavailability; once-daily dosing",
        "Cissus quadrangularis with clinical fracture healing evidence",
        "Magnesium prevents common calcium supplement side effect (constipation)",
        "Comprehensive coverage: minerals + vitamins + herbals in single tablet",
      ],
      disadvantages: [
        "Large tablet size - split-tablet or chewable version may be preferred",
        "Calcium carbonate requires gastric acid for absorption - take with meals",
        "MK-7 contraindicated with warfarin (enhances anticoagulant effect)",
      ],
      stabilityPrediction:
        "D3 and K2 fat-soluble - sensitive to oxidation and light. Requires antioxidant packaging (nitrogen flush). Stability: 24 months (cool, dry conditions).",
      shelfLife: "24 months (HDPE, nitrogen-flushed, with silica desiccant)",
      storageCondition:
        "Store below 25°C, RH < 60%, protected from light and heat.",
      drugInteractions: [
        "Vitamin K2 significantly potentiates warfarin - contraindicated or requires INR monitoring",
        "Calcium reduces absorption of bisphosphonates, quinolones, tetracyclines - separate by 2+ hours",
        "Magnesium competes with calcium absorption at high doses",
      ],
    },
  ],
  "Migraine|Capsule|Herbal": [
    {
      id: "NC-MIG-C-H-001",
      name: "CephaClear Migraine Prevention Capsule",
      dosageForm: "Capsule",
      ingredients: [
        {
          name: "Tanacetum parthenium (Feverfew) extract (0.7% parthenolide)",
          category: "API (Herb)",
          quantity: 250,
          unit: "mg",
          role: "Serotonin release inhibitor; platelet aggregation prevention",
        },
        {
          name: "Magnesium glycinate",
          category: "API (Mineral)",
          quantity: 200,
          unit: "mg",
          role: "NMDA antagonist; proven migraine prophylaxis",
        },
        {
          name: "Riboflavin (Vitamin B2)",
          category: "API (Vitamin)",
          quantity: 400,
          unit: "mg",
          role: "Mitochondrial energy enhancement; migraine prevention",
        },
        {
          name: "Coenzyme Q10 (CoQ10)",
          category: "API (Nutraceutical)",
          quantity: 100,
          unit: "mg",
          role: "Mitochondrial cofactor; reduces migraine frequency by 48%",
        },
        {
          name: "Butterbur PA-free extract 15%",
          category: "API (Herb)",
          quantity: 75,
          unit: "mg",
          role: "Spasmolytic; reduces CGRP release; cerebrovascular regulation",
        },
        {
          name: "Microcrystalline Cellulose PH101",
          category: "Filler",
          quantity: 100,
          unit: "mg",
          role: "Capsule fill diluent",
        },
        {
          name: "HPMC capsule (Size 00)",
          category: "Capsule Shell",
          quantity: 1,
          unit: "cap",
          role: "Vegetarian capsule enclosure",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 5,
          unit: "mg",
          role: "Powder flow and lubrication",
        },
      ],
      pharmacologicalEffects:
        "Evidence-based migraine prophylaxis cocktail: Feverfew parthenolide inhibits serotonin release from platelets and blocks NF-kB, reducing neuroinflammation. Magnesium blocks NMDA receptors and inhibits cortical spreading depression. B2 400mg/day reduces mitochondrial oxidative phosphorylation impairment. CoQ10 improves mitochondrial efficiency. PA-free Butterbur inhibits 5-lipoxygenase and reduces CGRP. Combined: reduces migraine frequency by 50-60% vs. placebo at 3 months.",
      advantages: [
        "All ingredients have Level A-B evidence for migraine prophylaxis",
        "Riboflavin 400mg/day is first-line prophylaxis per AAN guidelines",
        "PA-free butterbur eliminates hepatotoxic alkaloid risk",
        "Nutraceutical approach avoids beta-blocker/antidepressant side effects",
      ],
      disadvantages: [
        "Riboflavin causes bright yellow/orange urine - patient counseling required",
        "Full prophylactic benefit requires 3-4 months of consistent use",
        "CoQ10 expensive - significantly increases formulation cost",
        "Feverfew contraindicated in pregnancy (uterine stimulant)",
      ],
      stabilityPrediction:
        "CoQ10 and riboflavin light-sensitive; feverfew parthenolide volatile. Amber blister or HDPE bottle with desiccant required. Stability: 24 months per ICH Zone IVa.",
      shelfLife: "24 months (amber packaging)",
      storageCondition:
        "Store below 25°C, RH < 65%, in amber packaging away from light.",
      drugInteractions: [
        "Feverfew antiplatelet - additive with aspirin, NSAIDs, clopidogrel",
        "High-dose riboflavin may interfere with tetracycline absorption",
        "Magnesium may reduce absorption of quinolones and bisphosphonates",
      ],
    },
  ],
  "Epilepsy|Tablet|Herbal": [
    {
      id: "NC-EP-T-H-001",
      name: "NeuroCalm Anticonvulsant Tablet",
      dosageForm: "Tablet",
      ingredients: [
        {
          name: "Withania somnifera (Ashwagandha) sitoindoside-rich extract",
          category: "API (Herb)",
          quantity: 300,
          unit: "mg",
          role: "GABA-A modulation; anticonvulsant; neuroprotective",
        },
        {
          name: "Convolvulus pluricaulis (Shankhpushpi) standardized extract",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Anticonvulsant; GABAergic; cognitive protectant",
        },
        {
          name: "Bacopa monnieri (Brahmi) 20% bacoside A/B",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg",
          role: "Neuroprotection; reduces seizure-induced neuronal damage",
        },
        {
          name: "Valeriana officinalis root extract",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg",
          role: "GABA transaminase inhibitor; reduces neuronal excitability",
        },
        {
          name: "Magnesium glycinate",
          category: "API (Mineral)",
          quantity: 100,
          unit: "mg",
          role: "NMDA antagonist; reduces excitatory neurotransmission",
        },
        {
          name: "Microcrystalline Cellulose PH102",
          category: "Filler",
          quantity: 150,
          unit: "mg",
          role: "Direct compression filler",
        },
        {
          name: "Croscarmellose sodium",
          category: "Disintegrant",
          quantity: 20,
          unit: "mg",
          role: "Disintegration",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 10,
          unit: "mg",
          role: "Lubrication",
        },
      ],
      pharmacologicalEffects:
        "Multi-GABAergic herbal combination for epilepsy support therapy. Ashwagandha sitoindosides potentiate GABA-A chloride channel conductance. Shankhpushpi extracts inhibit pentylenetetrazol-induced convulsions in animal models. Valerian valerenic acid inhibits GABA transaminase, increasing synaptic GABA availability. Brahmi bacoside A enhances the release of nitric oxide, protecting from seizure-induced neuronal damage. Magnesium reduces NMDA receptor activation. ADJUNCT THERAPY ONLY - not replacement for prescribed antiepileptics.",
      advantages: [
        "Multiple GABAergic mechanisms provide synergistic anticonvulsant support",
        "Neuroprotective effects reduce cognitive decline from seizure activity",
        "All ingredients have IP/API pharmacopeia entries",
        "Suitable as adjunct to conventional antiepileptic therapy",
      ],
      disadvantages: [
        "MUST NOT replace prescribed antiepileptics - adjunct use only",
        "Evidence primarily from animal models; limited human RCTs",
        "Valerian may cause daytime sedation",
        "Drug interactions with antiepileptics require close monitoring",
      ],
      stabilityPrediction:
        "Bacoside A sensitive to high temperature; valerian volatile compounds require tight packaging. ICH Zone IVb: 24 months.",
      shelfLife: "24 months",
      storageCondition: "Store at 15-25°C, RH < 60%, in sealed container.",
      drugInteractions: [
        "Valerian may potentiate barbiturates and benzodiazepines - monitor CNS depression",
        "Ashwagandha may alter levels of phenytoin via CYP enzymes",
        "Brahmi may enhance cholinergic drugs - adjust doses accordingly",
      ],
    },
  ],
  "Psoriasis|Cream/Ointment|Herbal": [
    {
      id: "NC-PS-C-H-001",
      name: "DermaClear Herbal Cream",
      dosageForm: "Cream/Ointment",
      ingredients: [
        {
          name: "Mahonia aquifolium (Oregon grape) 10% berberine extract",
          category: "API (Herb)",
          quantity: 100,
          unit: "mg/g",
          role: "Topical anti-inflammatory; inhibits keratinocyte proliferation",
        },
        {
          name: "Aloe vera gel (100:1 concentrate)",
          category: "API (Herb)",
          quantity: 50,
          unit: "mg/g",
          role: "Anti-inflammatory, immunomodulatory, skin barrier repair",
        },
        {
          name: "Neem (Azadirachta indica) leaf extract",
          category: "API (Herb)",
          quantity: 30,
          unit: "mg/g",
          role: "Antimicrobial; reduces Th17 inflammatory response",
        },
        {
          name: "Turmeric (Curcuma longa) 95% curcumin",
          category: "API (Herb)",
          quantity: 20,
          unit: "mg/g",
          role: "NF-kB inhibitor; anti-proliferative in keratinocytes",
        },
        {
          name: "White petrolatum (emollient base)",
          category: "Base",
          quantity: 500,
          unit: "mg/g",
          role: "Emollient base; occlusive; reduces TEWL",
        },
        {
          name: "Emulsifying wax NF",
          category: "Emulsifier",
          quantity: 120,
          unit: "mg/g",
          role: "O/W emulsifier for cream consistency",
        },
        {
          name: "Cetyl alcohol",
          category: "Co-emulsifier",
          quantity: 50,
          unit: "mg/g",
          role: "Consistency enhancer; emollient",
        },
        {
          name: "Propylene glycol",
          category: "Humectant",
          quantity: 100,
          unit: "mg/g",
          role: "Humectant; penetration enhancer",
        },
        {
          name: "Methylparaben + Propylparaben",
          category: "Preservative",
          quantity: 2,
          unit: "mg/g",
          role: "Preservation of cream against microbial contamination",
        },
        {
          name: "Purified water",
          category: "Vehicle",
          quantity: 28,
          unit: "mg/g",
          role: "Aqueous phase of cream",
        },
      ],
      pharmacologicalEffects:
        "Topical multi-herb anti-psoriatic formulation: Mahonia aquifolium berberine inhibits lipoxygenase and keratinocyte proliferation (comparable to 0.5% dithranol in RCT). Aloe vera acemannan modulates Th1/Th17 cytokine balance. Neem nimbidin inhibits neutrophil and macrophage activity, reducing erythema. Curcumin inhibits NF-kB transcription factor, which drives psoriatic plaque formation. White petrolatum base ensures adequate occlusion, reducing transepidermal water loss (TEWL) in psoriatic plaques.",
      advantages: [
        "Mahonia aquifolium has EU cosmetic directive approval for psoriasis",
        "Steroid-free formulation - safe for long-term use and facial psoriasis",
        "Multi-target: anti-proliferative + anti-inflammatory + barrier repair",
        "White petrolatum base provides superior moisturization",
      ],
      disadvantages: [
        "Berberine causes yellow staining of skin and clothing",
        "Propylene glycol may cause contact sensitization in some patients",
        "Less potent than topical corticosteroids for acute flares",
      ],
      stabilityPrediction:
        "Curcumin light-sensitive in topical form; cream emulsion may separate if stored above 30°C. Refrigerated stability 24 months; room temperature stability 18 months.",
      shelfLife: "18 months (room temperature); 24 months (refrigerated)",
      storageCondition:
        "Store at 15-25°C, away from sunlight. Do not freeze. Discard 3 months after opening.",
      drugInteractions: [
        "Topical use minimizes systemic drug interactions",
        "Propylene glycol may enhance absorption of other topical drugs applied concurrently",
        "Avoid use with topical retinoids - may cause excessive dryness",
      ],
    },
  ],
  "Gout|Tablet|Herbal": [
    {
      id: "NC-GT-T-H-001",
      name: "UricoClear Herbal Urate Tablet",
      dosageForm: "Tablet",
      ingredients: [
        {
          name: "Celery seed extract (85% phthalides, n-butylphthalide)",
          category: "API (Herb)",
          quantity: 300,
          unit: "mg",
          role: "Xanthine oxidase inhibition; uricosuric effect; anti-inflammatory",
        },
        {
          name: "Andrographis paniculata (Kalmegh) 10% andrographolide",
          category: "API (Herb)",
          quantity: 200,
          unit: "mg",
          role: "Anti-inflammatory; inhibits NF-kB; uric acid regulation",
        },
        {
          name: "Guggul (Commiphora mukul) purified resin",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg",
          role: "Reduces joint inflammation; hypolipidemic co-benefit",
        },
        {
          name: "Punarnava (Boerhavia diffusa) root extract",
          category: "API (Herb)",
          quantity: 150,
          unit: "mg",
          role: "Uricosuric; renal protective; diuretic",
        },
        {
          name: "Tart cherry extract (28% anthocyanins)",
          category: "API (Herb)",
          quantity: 100,
          unit: "mg",
          role: "Xanthine oxidase inhibitor; reduces serum urate; anti-inflammatory",
        },
        {
          name: "Microcrystalline Cellulose PH101",
          category: "Filler",
          quantity: 100,
          unit: "mg",
          role: "Tablet diluent",
        },
        {
          name: "Crospovidone",
          category: "Disintegrant",
          quantity: 20,
          unit: "mg",
          role: "Disintegration",
        },
        {
          name: "Magnesium stearate",
          category: "Lubricant",
          quantity: 10,
          unit: "mg",
          role: "Lubrication",
        },
      ],
      pharmacologicalEffects:
        "Comprehensive urate-lowering herbal combination: Celery seed phthalides inhibit xanthine oxidase (the enzyme producing uric acid) and have uricosuric effect enhancing renal urate excretion. Tart cherry anthocyanins inhibit xanthine oxidase and reduce CRP and IL-6 (RCT evidence: reduces gout flare frequency by 35%). Andrographolide inhibits NF-kB and COX-2, reducing acute joint inflammation. Punarnava flavonoids are renal protective and mildly uricosuric. Guggulsterones reduce synovial inflammation.",
      advantages: [
        "Tart cherry has Level B evidence from RCTs for gout flare reduction",
        "Dual action: urate reduction + anti-inflammatory (unlike allopurinol alone)",
        "Punarnava provides nephroprotective co-benefit",
        "No risk of serious adverse effects of allopurinol (Stevens-Johnson syndrome)",
      ],
      disadvantages: [
        "Insufficient for severe gout with tophi - requires allopurinol",
        "Celery seed contraindicated in pregnancy (uterine stimulant)",
        "Effect on serum urate modest (1-2 mg/dL reduction) vs allopurinol (5-8 mg/dL)",
      ],
      stabilityPrediction:
        "Anthocyanins are light and oxygen sensitive; guggul resin hygroscopic. Moisture-proof, light-protective packaging essential. Stability: 24 months.",
      shelfLife: "24 months (sealed aluminum blister)",
      storageCondition:
        "Store below 25°C, RH < 60%, in sealed packaging away from light.",
      drugInteractions: [
        "Celery seed may potentiate diuretics and antihypertensives",
        "Guggul may reduce efficacy of propranolol and diltiazem",
        "Andrographis antiplatelet - caution with anticoagulants",
      ],
    },
  ],
};

// College-level pharmacopeial parameters for all herbs
// References: API Vol. I–IV, WHO Monographs, IP 2022

export interface OrganolepticParam {
  value: string;
  unit: string;
  reference: string;
}

export interface PhysicochemParam {
  range: string;
  unit: string;
  reference: string;
}

export interface PhytoParam {
  result: "Present" | "Absent";
  reference: string;
}

export interface CollegeHerbParameters {
  categoricalInfo: {
    plantPart: string;
    source: string;
    form: string;
  };
  organoleptic: {
    color: OrganolepticParam;
    odor: OrganolepticParam;
    taste: OrganolepticParam;
    texture: OrganolepticParam;
  };
  physicochemical: {
    moistureContent: PhysicochemParam;
    totalAsh: PhysicochemParam;
    acidInsolubleAsh: PhysicochemParam;
    waterSolubleExtractive: PhysicochemParam;
    alcoholSolubleExtractive: PhysicochemParam;
    pH: PhysicochemParam;
  };
  basicEvaluation: {
    foreignMatter: PhysicochemParam;
    extractYield: PhysicochemParam;
  };
  phytochemicalScreening: {
    alkaloids: PhytoParam;
    flavonoids: PhytoParam;
    tannins: PhytoParam;
    saponins: PhytoParam;
  };
}

export const herbCollegeParamsMap: Record<string, CollegeHerbParameters> = {
  ashwagandha: {
    categoricalInfo: {
      plantPart: "Root",
      source: "Ayurvedic Pharmacopoeia of India (API) Vol. I",
      form: "Dried root powder",
    },
    organoleptic: {
      color: {
        value: "Pale brown to light yellow",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Characteristic, horse-like",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Bitter, acrid",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Coarse powder",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: { range: "NMT 8.0", unit: "%", reference: "API Vol. I" },
      totalAsh: { range: "NMT 7.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 1.0",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 15.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 12.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% w/v aqueous solution)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: {
        range: "NLT 20.0",
        unit: "% (water extract)",
        reference: "API Vol. I",
      },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Absent", reference: "API Vol. I" },
      saponins: { result: "Present", reference: "API Vol. I" },
    },
  },

  turmeric: {
    categoricalInfo: {
      plantPart: "Rhizome",
      source: "API Vol. I",
      form: "Dried rhizome powder",
    },
    organoleptic: {
      color: {
        value: "Bright yellow to orange-yellow",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Aromatic, spicy",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Bitter, slightly pungent",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Fine to coarse powder",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 7.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 1.0",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 12.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 6.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "5.0–7.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 10.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Absent", reference: "API Vol. I" },
      saponins: { result: "Present", reference: "WHO Monograph" },
    },
  },

  brahmi: {
    categoricalInfo: {
      plantPart: "Whole plant",
      source: "API Vol. II",
      form: "Dried whole plant powder",
    },
    organoleptic: {
      color: {
        value: "Light green to pale brown",
        unit: "Visual",
        reference: "API Vol. II",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      taste: {
        value: "Bitter, slightly astringent",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      texture: {
        value: "Fine powder",
        unit: "Visual",
        reference: "API Vol. II",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. II",
      },
      totalAsh: { range: "NMT 16.0", unit: "%", reference: "API Vol. II" },
      acidInsolubleAsh: {
        range: "NMT 4.0",
        unit: "%",
        reference: "API Vol. II",
      },
      waterSolubleExtractive: {
        range: "NLT 18.0",
        unit: "%",
        reference: "API Vol. II",
      },
      alcoholSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. II",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 3.0", unit: "%", reference: "API Vol. II" },
      extractYield: { range: "NLT 15.0", unit: "%", reference: "API Vol. II" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. II" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. II" },
      saponins: { result: "Present", reference: "API Vol. II" },
    },
  },

  neem: {
    categoricalInfo: {
      plantPart: "Leaf",
      source: "API Vol. III",
      form: "Dried leaf powder",
    },
    organoleptic: {
      color: {
        value: "Dark green to brownish-green",
        unit: "Visual",
        reference: "API Vol. III",
      },
      odor: {
        value: "Characteristic, bitter",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      taste: {
        value: "Intensely bitter",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      texture: {
        value: "Rough, brittle",
        unit: "Visual",
        reference: "API Vol. III",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 8.0",
        unit: "%",
        reference: "API Vol. III",
      },
      totalAsh: { range: "NMT 9.0", unit: "%", reference: "API Vol. III" },
      acidInsolubleAsh: {
        range: "NMT 1.5",
        unit: "%",
        reference: "API Vol. III",
      },
      waterSolubleExtractive: {
        range: "NLT 20.0",
        unit: "%",
        reference: "API Vol. III",
      },
      alcoholSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. III",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. III" },
      extractYield: { range: "NLT 15.0", unit: "%", reference: "API Vol. III" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. III" },
      flavonoids: { result: "Present", reference: "API Vol. III" },
      tannins: { result: "Present", reference: "API Vol. III" },
      saponins: { result: "Present", reference: "WHO Monograph" },
    },
  },

  shatavari: {
    categoricalInfo: {
      plantPart: "Root",
      source: "API Vol. I",
      form: "Dried root powder",
    },
    organoleptic: {
      color: {
        value: "Pale white to light cream",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Sweet, slightly bitter",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Fibrous, coarse powder",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 6.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 22.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 18.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "5.5–7.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 18.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Absent", reference: "API Vol. I" },
      saponins: { result: "Present", reference: "API Vol. I" },
    },
  },

  triphala: {
    categoricalInfo: {
      plantPart: "Fruit (blend of three)",
      source: "API Vol. I",
      form: "Dried fruit powder blend",
    },
    organoleptic: {
      color: {
        value: "Dark brown to blackish-brown",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Characteristic, slightly astringent",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Astringent, sour, slightly bitter",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Coarse to fine powder",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 12.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 8.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 30.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 20.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "3.5–5.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 25.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. I" },
      saponins: { result: "Absent", reference: "API Vol. I" },
    },
  },

  ginger: {
    categoricalInfo: {
      plantPart: "Rhizome",
      source: "API Vol. I / IP 2022",
      form: "Dried rhizome powder",
    },
    organoleptic: {
      color: {
        value: "Pale yellow to buff",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Pungent, aromatic, spicy",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Pungent, hot, biting",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Fibrous, coarse powder",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: { range: "NMT 12.0", unit: "%", reference: "IP 2022" },
      totalAsh: { range: "NMT 8.0", unit: "%", reference: "IP 2022" },
      acidInsolubleAsh: { range: "NMT 2.0", unit: "%", reference: "IP 2022" },
      waterSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 4.5",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "5.0–6.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "IP 2022" },
      extractYield: { range: "NLT 8.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Absent", reference: "API Vol. I" },
      saponins: { result: "Present", reference: "WHO Monograph" },
    },
  },

  tulsi: {
    categoricalInfo: {
      plantPart: "Leaf and stem",
      source: "API Vol. IV",
      form: "Dried herb powder",
    },
    organoleptic: {
      color: {
        value: "Greenish-brown",
        unit: "Visual",
        reference: "API Vol. IV",
      },
      odor: {
        value: "Aromatic, clove-like",
        unit: "Organoleptic",
        reference: "API Vol. IV",
      },
      taste: {
        value: "Pungent, slightly bitter",
        unit: "Organoleptic",
        reference: "API Vol. IV",
      },
      texture: {
        value: "Fine powder",
        unit: "Visual",
        reference: "API Vol. IV",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 8.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      totalAsh: { range: "NMT 12.0", unit: "%", reference: "API Vol. IV" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      waterSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      alcoholSolubleExtractive: {
        range: "NLT 8.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. IV" },
      extractYield: { range: "NLT 12.0", unit: "%", reference: "API Vol. IV" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. IV" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. IV" },
      saponins: { result: "Present", reference: "API Vol. IV" },
    },
  },

  amla: {
    categoricalInfo: {
      plantPart: "Fruit",
      source: "API Vol. I",
      form: "Dried fruit powder",
    },
    organoleptic: {
      color: {
        value: "Light brown to greenish-brown",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Characteristic, slightly sour",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Sour, astringent, sweet after-taste",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Coarse powder",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 12.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 5.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 1.5",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 40.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 20.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "3.5–5.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 35.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. I" },
      saponins: { result: "Absent", reference: "API Vol. I" },
    },
  },

  giloy: {
    categoricalInfo: {
      plantPart: "Stem",
      source: "API Vol. I",
      form: "Dried stem powder",
    },
    organoleptic: {
      color: {
        value: "Light grey to yellowish-grey",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: { value: "Bitter", unit: "Organoleptic", reference: "API Vol. I" },
      texture: {
        value: "Fibrous, coarse",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 9.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 14.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 6.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "6.0–7.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 12.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. I" },
      saponins: { result: "Present", reference: "API Vol. I" },
    },
  },

  mulethi: {
    categoricalInfo: {
      plantPart: "Root",
      source: "API Vol. I / BP 2023",
      form: "Dried root powder",
    },
    organoleptic: {
      color: {
        value: "Yellow to brownish-yellow",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Faint, characteristic, sweet",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Sweet, slightly bitter",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Fibrous powder",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 7.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 20.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 15.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 18.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. I" },
      saponins: { result: "Present", reference: "API Vol. I" },
    },
  },

  haritaki: {
    categoricalInfo: {
      plantPart: "Fruit",
      source: "API Vol. I",
      form: "Dried fruit powder",
    },
    organoleptic: {
      color: {
        value: "Yellowish-brown to dark brown",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Astringent, slightly bitter",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Coarse powder with fibrous strands",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 12.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 6.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 35.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 22.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "3.0–4.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 28.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. I" },
      saponins: { result: "Absent", reference: "API Vol. I" },
    },
  },

  bibhitaki: {
    categoricalInfo: {
      plantPart: "Fruit",
      source: "API Vol. I",
      form: "Dried fruit powder",
    },
    organoleptic: {
      color: {
        value: "Brownish-grey to dark brown",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Astringent, slightly sweet",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Coarse powder",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 12.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 5.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 1.5",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 32.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 20.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "3.0–5.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 25.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. I" },
      saponins: { result: "Absent", reference: "API Vol. I" },
    },
  },

  punarnava: {
    categoricalInfo: {
      plantPart: "Whole plant",
      source: "API Vol. II",
      form: "Dried plant powder",
    },
    organoleptic: {
      color: {
        value: "Greenish-brown to grey",
        unit: "Visual",
        reference: "API Vol. II",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      taste: {
        value: "Slightly bitter, saline",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      texture: {
        value: "Coarse fibrous powder",
        unit: "Visual",
        reference: "API Vol. II",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. II",
      },
      totalAsh: { range: "NMT 20.0", unit: "%", reference: "API Vol. II" },
      acidInsolubleAsh: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. II",
      },
      waterSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. II",
      },
      alcoholSolubleExtractive: {
        range: "NLT 5.0",
        unit: "%",
        reference: "API Vol. II",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 3.0", unit: "%", reference: "API Vol. II" },
      extractYield: { range: "NLT 8.0", unit: "%", reference: "API Vol. II" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. II" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. II" },
      saponins: { result: "Present", reference: "API Vol. II" },
    },
  },

  kutki: {
    categoricalInfo: {
      plantPart: "Rhizome",
      source: "API Vol. II",
      form: "Dried rhizome powder",
    },
    organoleptic: {
      color: {
        value: "Dark brown to blackish",
        unit: "Visual",
        reference: "API Vol. II",
      },
      odor: {
        value: "Characteristic, slightly bitter",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      taste: {
        value: "Very bitter",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      texture: {
        value: "Fine to coarse powder",
        unit: "Visual",
        reference: "API Vol. II",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. II",
      },
      totalAsh: { range: "NMT 8.0", unit: "%", reference: "API Vol. II" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "API Vol. II",
      },
      waterSolubleExtractive: {
        range: "NLT 15.0",
        unit: "%",
        reference: "API Vol. II",
      },
      alcoholSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. II",
      },
      pH: {
        range: "5.0–6.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. II" },
      extractYield: { range: "NLT 12.0", unit: "%", reference: "API Vol. II" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. II" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. II" },
      saponins: { result: "Absent", reference: "API Vol. II" },
    },
  },

  arjuna: {
    categoricalInfo: {
      plantPart: "Stem bark",
      source: "API Vol. I",
      form: "Dried stem bark powder",
    },
    organoleptic: {
      color: {
        value: "Light grey to pale white",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Astringent, slightly bitter",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Fibrous, coarse powder",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 10.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 3.0",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 12.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 8.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "4.5–6.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 10.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. I" },
      saponins: { result: "Present", reference: "API Vol. I" },
    },
  },

  manjistha: {
    categoricalInfo: {
      plantPart: "Root",
      source: "API Vol. III",
      form: "Dried root powder",
    },
    organoleptic: {
      color: {
        value: "Reddish-brown to brick red",
        unit: "Visual",
        reference: "API Vol. III",
      },
      odor: {
        value: "Characteristic, slightly earthy",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      taste: {
        value: "Slightly bitter, astringent",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      texture: {
        value: "Fine to coarse powder",
        unit: "Visual",
        reference: "API Vol. III",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. III",
      },
      totalAsh: { range: "NMT 10.0", unit: "%", reference: "API Vol. III" },
      acidInsolubleAsh: {
        range: "NMT 4.0",
        unit: "%",
        reference: "API Vol. III",
      },
      waterSolubleExtractive: {
        range: "NLT 12.0",
        unit: "%",
        reference: "API Vol. III",
      },
      alcoholSolubleExtractive: {
        range: "NLT 6.0",
        unit: "%",
        reference: "API Vol. III",
      },
      pH: {
        range: "5.0–6.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. III" },
      extractYield: { range: "NLT 10.0", unit: "%", reference: "API Vol. III" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. III" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. III" },
      saponins: { result: "Absent", reference: "API Vol. III" },
    },
  },

  chirata: {
    categoricalInfo: {
      plantPart: "Whole plant",
      source: "IP 2022",
      form: "Dried whole plant powder",
    },
    organoleptic: {
      color: {
        value: "Brownish-green to yellowish-brown",
        unit: "Visual",
        reference: "IP 2022",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "IP 2022",
      },
      taste: {
        value: "Intensely bitter",
        unit: "Organoleptic",
        reference: "IP 2022",
      },
      texture: {
        value: "Coarse fibrous powder",
        unit: "Visual",
        reference: "IP 2022",
      },
    },
    physicochemical: {
      moistureContent: { range: "NMT 8.0", unit: "%", reference: "IP 2022" },
      totalAsh: { range: "NMT 10.0", unit: "%", reference: "IP 2022" },
      acidInsolubleAsh: { range: "NMT 3.0", unit: "%", reference: "IP 2022" },
      waterSolubleExtractive: {
        range: "NLT 20.0",
        unit: "%",
        reference: "IP 2022",
      },
      alcoholSolubleExtractive: {
        range: "NLT 8.0",
        unit: "%",
        reference: "IP 2022",
      },
      pH: {
        range: "5.0–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 3.0", unit: "%", reference: "IP 2022" },
      extractYield: { range: "NLT 15.0", unit: "%", reference: "IP 2022" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "IP 2022" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "IP 2022" },
      saponins: { result: "Absent", reference: "IP 2022" },
    },
  },

  boswellia: {
    categoricalInfo: {
      plantPart: "Gum resin",
      source: "AYUSH 2021",
      form: "Dried gum resin powder",
    },
    organoleptic: {
      color: {
        value: "Pale yellow to amber",
        unit: "Visual",
        reference: "AYUSH 2021",
      },
      odor: {
        value: "Balsamic, characteristic terebinthinate",
        unit: "Organoleptic",
        reference: "AYUSH 2021",
      },
      taste: {
        value: "Bitter, slightly acrid",
        unit: "Organoleptic",
        reference: "AYUSH 2021",
      },
      texture: {
        value: "Resinous lumps or coarse powder",
        unit: "Visual",
        reference: "AYUSH 2021",
      },
    },
    physicochemical: {
      moistureContent: { range: "NMT 8.0", unit: "%", reference: "AYUSH 2021" },
      totalAsh: { range: "NMT 10.0", unit: "%", reference: "AYUSH 2021" },
      acidInsolubleAsh: {
        range: "NMT 3.0",
        unit: "%",
        reference: "AYUSH 2021",
      },
      waterSolubleExtractive: {
        range: "NLT 5.0",
        unit: "%",
        reference: "AYUSH 2021",
      },
      alcoholSolubleExtractive: {
        range: "NLT 40.0",
        unit: "%",
        reference: "AYUSH 2021",
      },
      pH: {
        range: "4.0–6.0",
        unit: "(1% suspension)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "AYUSH 2021" },
      extractYield: {
        range: "NLT 35.0",
        unit: "% (alcohol extract)",
        reference: "AYUSH 2021",
      },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "AYUSH 2021" },
      flavonoids: { result: "Absent", reference: "AYUSH 2021" },
      tannins: { result: "Absent", reference: "AYUSH 2021" },
      saponins: { result: "Absent", reference: "AYUSH 2021" },
    },
  },

  andrographis: {
    categoricalInfo: {
      plantPart: "Leaf",
      source: "WHO Monograph 2020",
      form: "Dried leaf powder",
    },
    organoleptic: {
      color: {
        value: "Greenish-brown",
        unit: "Visual",
        reference: "WHO Monograph",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "WHO Monograph",
      },
      taste: {
        value: "Very bitter",
        unit: "Organoleptic",
        reference: "WHO Monograph",
      },
      texture: {
        value: "Fine powder",
        unit: "Visual",
        reference: "WHO Monograph",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      totalAsh: { range: "NMT 12.0", unit: "%", reference: "WHO Monograph" },
      acidInsolubleAsh: {
        range: "NMT 3.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      waterSolubleExtractive: {
        range: "NLT 20.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      alcoholSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      pH: {
        range: "5.0–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: {
        range: "NMT 3.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      extractYield: {
        range: "NLT 15.0",
        unit: "%",
        reference: "WHO Monograph",
      },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "WHO Monograph" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "WHO Monograph" },
      saponins: { result: "Absent", reference: "WHO Monograph" },
    },
  },

  coleus: {
    categoricalInfo: {
      plantPart: "Root",
      source: "AYUSH 2022",
      form: "Dried root powder",
    },
    organoleptic: {
      color: {
        value: "Light brown to tan",
        unit: "Visual",
        reference: "AYUSH 2022",
      },
      odor: {
        value: "Characteristic, camphor-like",
        unit: "Organoleptic",
        reference: "AYUSH 2022",
      },
      taste: {
        value: "Bitter, slightly pungent",
        unit: "Organoleptic",
        reference: "AYUSH 2022",
      },
      texture: {
        value: "Coarse fibrous powder",
        unit: "Visual",
        reference: "AYUSH 2022",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "AYUSH 2022",
      },
      totalAsh: { range: "NMT 8.0", unit: "%", reference: "AYUSH 2022" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "AYUSH 2022",
      },
      waterSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "AYUSH 2022",
      },
      alcoholSolubleExtractive: {
        range: "NLT 15.0",
        unit: "%",
        reference: "AYUSH 2022",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "AYUSH 2022" },
      extractYield: { range: "NLT 12.0", unit: "%", reference: "AYUSH 2022" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "AYUSH 2022" },
      flavonoids: { result: "Present", reference: "AYUSH 2022" },
      tannins: { result: "Absent", reference: "AYUSH 2022" },
      saponins: { result: "Present", reference: "AYUSH 2022" },
    },
  },

  "gotu-kola": {
    categoricalInfo: {
      plantPart: "Whole plant",
      source: "WHO Monograph",
      form: "Dried plant powder",
    },
    organoleptic: {
      color: {
        value: "Greenish-brown to light green",
        unit: "Visual",
        reference: "WHO Monograph",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "WHO Monograph",
      },
      taste: {
        value: "Bitter, slightly astringent",
        unit: "Organoleptic",
        reference: "WHO Monograph",
      },
      texture: {
        value: "Fine powder",
        unit: "Visual",
        reference: "WHO Monograph",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      totalAsh: { range: "NMT 15.0", unit: "%", reference: "WHO Monograph" },
      acidInsolubleAsh: {
        range: "NMT 5.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      waterSolubleExtractive: {
        range: "NLT 12.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      alcoholSolubleExtractive: {
        range: "NLT 8.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      pH: {
        range: "5.0–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: {
        range: "NMT 3.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      extractYield: {
        range: "NLT 10.0",
        unit: "%",
        reference: "WHO Monograph",
      },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "WHO Monograph" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "WHO Monograph" },
      saponins: { result: "Present", reference: "WHO Monograph" },
    },
  },

  mucuna: {
    categoricalInfo: {
      plantPart: "Seed",
      source: "API Vol. IV",
      form: "Dried seed powder",
    },
    organoleptic: {
      color: {
        value: "Light grey to pale brown",
        unit: "Visual",
        reference: "API Vol. IV",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. IV",
      },
      taste: {
        value: "Slightly bitter",
        unit: "Organoleptic",
        reference: "API Vol. IV",
      },
      texture: {
        value: "Fine to coarse powder",
        unit: "Visual",
        reference: "API Vol. IV",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      totalAsh: { range: "NMT 5.0", unit: "%", reference: "API Vol. IV" },
      acidInsolubleAsh: {
        range: "NMT 1.5",
        unit: "%",
        reference: "API Vol. IV",
      },
      waterSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      alcoholSolubleExtractive: {
        range: "NLT 6.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. IV" },
      extractYield: { range: "NLT 8.0", unit: "%", reference: "API Vol. IV" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. IV" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. IV" },
      saponins: { result: "Present", reference: "API Vol. IV" },
    },
  },

  pippali: {
    categoricalInfo: {
      plantPart: "Fruit",
      source: "API Vol. I",
      form: "Dried fruit powder",
    },
    organoleptic: {
      color: {
        value: "Greyish-black to dark brown",
        unit: "Visual",
        reference: "API Vol. I",
      },
      odor: {
        value: "Aromatic, slightly pungent",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      taste: {
        value: "Pungent, hot, biting",
        unit: "Organoleptic",
        reference: "API Vol. I",
      },
      texture: {
        value: "Coarse cylindrical fruiting body",
        unit: "Visual",
        reference: "API Vol. I",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 12.0",
        unit: "%",
        reference: "API Vol. I",
      },
      totalAsh: { range: "NMT 8.0", unit: "%", reference: "API Vol. I" },
      acidInsolubleAsh: {
        range: "NMT 3.0",
        unit: "%",
        reference: "API Vol. I",
      },
      waterSolubleExtractive: {
        range: "NLT 8.0",
        unit: "%",
        reference: "API Vol. I",
      },
      alcoholSolubleExtractive: {
        range: "NLT 6.0",
        unit: "%",
        reference: "API Vol. I",
      },
      pH: {
        range: "5.0–6.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. I" },
      extractYield: { range: "NLT 6.0", unit: "%", reference: "API Vol. I" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. I" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Absent", reference: "API Vol. I" },
      saponins: { result: "Absent", reference: "API Vol. I" },
    },
  },

  moringa: {
    categoricalInfo: {
      plantPart: "Leaf",
      source: "WHO Monograph 2022",
      form: "Dried leaf powder",
    },
    organoleptic: {
      color: {
        value: "Dark green",
        unit: "Visual",
        reference: "WHO Monograph",
      },
      odor: {
        value: "Characteristic, slightly pungent",
        unit: "Organoleptic",
        reference: "WHO Monograph",
      },
      taste: {
        value: "Slightly bitter, pungent",
        unit: "Organoleptic",
        reference: "WHO Monograph",
      },
      texture: {
        value: "Fine powder",
        unit: "Visual",
        reference: "WHO Monograph",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      totalAsh: { range: "NMT 12.0", unit: "%", reference: "WHO Monograph" },
      acidInsolubleAsh: {
        range: "NMT 3.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      waterSolubleExtractive: {
        range: "NLT 15.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      alcoholSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: {
        range: "NMT 3.0",
        unit: "%",
        reference: "WHO Monograph",
      },
      extractYield: {
        range: "NLT 12.0",
        unit: "%",
        reference: "WHO Monograph",
      },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "WHO Monograph" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "WHO Monograph" },
      saponins: { result: "Present", reference: "WHO Monograph" },
    },
  },

  nagarmotha: {
    categoricalInfo: {
      plantPart: "Tuber",
      source: "API Vol. III",
      form: "Dried tuber powder",
    },
    organoleptic: {
      color: {
        value: "Dark brown to blackish-brown",
        unit: "Visual",
        reference: "API Vol. III",
      },
      odor: {
        value: "Aromatic, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      taste: {
        value: "Bitter, astringent",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      texture: {
        value: "Hard, fibrous powder",
        unit: "Visual",
        reference: "API Vol. III",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. III",
      },
      totalAsh: { range: "NMT 8.0", unit: "%", reference: "API Vol. III" },
      acidInsolubleAsh: {
        range: "NMT 3.0",
        unit: "%",
        reference: "API Vol. III",
      },
      waterSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. III",
      },
      alcoholSolubleExtractive: {
        range: "NLT 6.0",
        unit: "%",
        reference: "API Vol. III",
      },
      pH: {
        range: "5.0–6.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. III" },
      extractYield: { range: "NLT 8.0", unit: "%", reference: "API Vol. III" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. III" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. III" },
      saponins: { result: "Absent", reference: "API Vol. III" },
    },
  },

  sarpagandha: {
    categoricalInfo: {
      plantPart: "Root",
      source: "IP 2022",
      form: "Dried root powder",
    },
    organoleptic: {
      color: {
        value: "Light grey to pale brown",
        unit: "Visual",
        reference: "IP 2022",
      },
      odor: {
        value: "Characteristic, faint",
        unit: "Organoleptic",
        reference: "IP 2022",
      },
      taste: { value: "Bitter", unit: "Organoleptic", reference: "IP 2022" },
      texture: {
        value: "Coarse fibrous powder",
        unit: "Visual",
        reference: "IP 2022",
      },
    },
    physicochemical: {
      moistureContent: { range: "NMT 10.0", unit: "%", reference: "IP 2022" },
      totalAsh: { range: "NMT 8.0", unit: "%", reference: "IP 2022" },
      acidInsolubleAsh: { range: "NMT 2.0", unit: "%", reference: "IP 2022" },
      waterSolubleExtractive: {
        range: "NLT 12.0",
        unit: "%",
        reference: "IP 2022",
      },
      alcoholSolubleExtractive: {
        range: "NLT 8.0",
        unit: "%",
        reference: "IP 2022",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "IP 2022" },
      extractYield: { range: "NLT 10.0", unit: "%", reference: "IP 2022" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "IP 2022" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Absent", reference: "IP 2022" },
      saponins: { result: "Absent", reference: "IP 2022" },
    },
  },

  shankhpushpi: {
    categoricalInfo: {
      plantPart: "Whole plant",
      source: "AYUSH / API Vol. IV",
      form: "Dried whole plant powder",
    },
    organoleptic: {
      color: {
        value: "Greenish-grey to pale brown",
        unit: "Visual",
        reference: "API Vol. IV",
      },
      odor: {
        value: "Faint, slightly earthy",
        unit: "Organoleptic",
        reference: "API Vol. IV",
      },
      taste: {
        value: "Slightly bitter, mucilaginous",
        unit: "Organoleptic",
        reference: "API Vol. IV",
      },
      texture: {
        value: "Fine fibrous powder",
        unit: "Visual",
        reference: "API Vol. IV",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      totalAsh: { range: "NMT 18.0", unit: "%", reference: "API Vol. IV" },
      acidInsolubleAsh: {
        range: "NMT 8.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      waterSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      alcoholSolubleExtractive: {
        range: "NLT 5.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 3.0", unit: "%", reference: "API Vol. IV" },
      extractYield: { range: "NLT 8.0", unit: "%", reference: "API Vol. IV" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. IV" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. IV" },
      saponins: { result: "Present", reference: "API Vol. IV" },
    },
  },

  vacha: {
    categoricalInfo: {
      plantPart: "Rhizome",
      source: "API Vol. II",
      form: "Dried rhizome powder",
    },
    organoleptic: {
      color: {
        value: "Light brown to yellowish",
        unit: "Visual",
        reference: "API Vol. II",
      },
      odor: {
        value: "Aromatic, camphoraceous",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      taste: {
        value: "Pungent, bitter, acrid",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      texture: {
        value: "Spongy, fibrous powder",
        unit: "Visual",
        reference: "API Vol. II",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 12.0",
        unit: "%",
        reference: "API Vol. II",
      },
      totalAsh: { range: "NMT 8.0", unit: "%", reference: "API Vol. II" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "API Vol. II",
      },
      waterSolubleExtractive: {
        range: "NLT 8.0",
        unit: "%",
        reference: "API Vol. II",
      },
      alcoholSolubleExtractive: {
        range: "NLT 5.0",
        unit: "%",
        reference: "API Vol. II",
      },
      pH: {
        range: "5.0–6.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. II" },
      extractYield: { range: "NLT 6.0", unit: "%", reference: "API Vol. II" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. II" },
      flavonoids: { result: "Absent", reference: "API Vol. II" },
      tannins: { result: "Absent", reference: "API Vol. II" },
      saponins: { result: "Absent", reference: "API Vol. II" },
    },
  },

  bala: {
    categoricalInfo: {
      plantPart: "Root",
      source: "API Vol. II",
      form: "Dried root powder",
    },
    organoleptic: {
      color: {
        value: "Light brown to pale yellow",
        unit: "Visual",
        reference: "API Vol. II",
      },
      odor: {
        value: "Faint, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      taste: {
        value: "Sweet, slightly mucilaginous",
        unit: "Organoleptic",
        reference: "API Vol. II",
      },
      texture: {
        value: "Fibrous, coarse powder",
        unit: "Visual",
        reference: "API Vol. II",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. II",
      },
      totalAsh: { range: "NMT 14.0", unit: "%", reference: "API Vol. II" },
      acidInsolubleAsh: {
        range: "NMT 5.0",
        unit: "%",
        reference: "API Vol. II",
      },
      waterSolubleExtractive: {
        range: "NLT 10.0",
        unit: "%",
        reference: "API Vol. II",
      },
      alcoholSolubleExtractive: {
        range: "NLT 5.0",
        unit: "%",
        reference: "API Vol. II",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 3.0", unit: "%", reference: "API Vol. II" },
      extractYield: { range: "NLT 8.0", unit: "%", reference: "API Vol. II" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Present", reference: "API Vol. II" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. II" },
      saponins: { result: "Present", reference: "API Vol. II" },
    },
  },

  vidanga: {
    categoricalInfo: {
      plantPart: "Fruit",
      source: "API Vol. III",
      form: "Dried fruit powder",
    },
    organoleptic: {
      color: {
        value: "Dark brown to blackish",
        unit: "Visual",
        reference: "API Vol. III",
      },
      odor: {
        value: "Aromatic, slightly pungent",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      taste: {
        value: "Bitter, pungent",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      texture: {
        value: "Fine powder with small round drupes",
        unit: "Visual",
        reference: "API Vol. III",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 8.0",
        unit: "%",
        reference: "API Vol. III",
      },
      totalAsh: { range: "NMT 7.0", unit: "%", reference: "API Vol. III" },
      acidInsolubleAsh: {
        range: "NMT 2.0",
        unit: "%",
        reference: "API Vol. III",
      },
      waterSolubleExtractive: {
        range: "NLT 12.0",
        unit: "%",
        reference: "API Vol. III",
      },
      alcoholSolubleExtractive: {
        range: "NLT 8.0",
        unit: "%",
        reference: "API Vol. III",
      },
      pH: {
        range: "4.5–6.5",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. III" },
      extractYield: { range: "NLT 10.0", unit: "%", reference: "API Vol. III" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. III" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. III" },
      saponins: { result: "Absent", reference: "API Vol. III" },
    },
  },

  devdaru: {
    categoricalInfo: {
      plantPart: "Heartwood",
      source: "API Vol. III",
      form: "Dried heartwood powder",
    },
    organoleptic: {
      color: {
        value: "Light yellow to pale buff",
        unit: "Visual",
        reference: "API Vol. III",
      },
      odor: {
        value: "Aromatic, cedar-like",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      taste: {
        value: "Slightly bitter, aromatic",
        unit: "Organoleptic",
        reference: "API Vol. III",
      },
      texture: {
        value: "Coarse fibrous powder",
        unit: "Visual",
        reference: "API Vol. III",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 8.0",
        unit: "%",
        reference: "API Vol. III",
      },
      totalAsh: { range: "NMT 3.0", unit: "%", reference: "API Vol. III" },
      acidInsolubleAsh: {
        range: "NMT 1.0",
        unit: "%",
        reference: "API Vol. III",
      },
      waterSolubleExtractive: {
        range: "NLT 4.0",
        unit: "%",
        reference: "API Vol. III",
      },
      alcoholSolubleExtractive: {
        range: "NLT 3.0",
        unit: "%",
        reference: "API Vol. III",
      },
      pH: {
        range: "5.0–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 1.0", unit: "%", reference: "API Vol. III" },
      extractYield: {
        range: "NLT 3.0",
        unit: "% (alcohol extract)",
        reference: "API Vol. III",
      },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. III" },
      flavonoids: { result: "Present", reference: "API Vol. III" },
      tannins: { result: "Absent", reference: "API Vol. III" },
      saponins: { result: "Absent", reference: "API Vol. III" },
    },
  },

  pushkarmool: {
    categoricalInfo: {
      plantPart: "Root",
      source: "API Vol. IV",
      form: "Dried root powder",
    },
    organoleptic: {
      color: {
        value: "Greyish-brown to light brown",
        unit: "Visual",
        reference: "API Vol. IV",
      },
      odor: {
        value: "Aromatic, characteristic",
        unit: "Organoleptic",
        reference: "API Vol. IV",
      },
      taste: {
        value: "Bitter, slightly pungent",
        unit: "Organoleptic",
        reference: "API Vol. IV",
      },
      texture: {
        value: "Fibrous, coarse powder",
        unit: "Visual",
        reference: "API Vol. IV",
      },
    },
    physicochemical: {
      moistureContent: {
        range: "NMT 10.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      totalAsh: { range: "NMT 8.0", unit: "%", reference: "API Vol. IV" },
      acidInsolubleAsh: {
        range: "NMT 3.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      waterSolubleExtractive: {
        range: "NLT 12.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      alcoholSolubleExtractive: {
        range: "NLT 8.0",
        unit: "%",
        reference: "API Vol. IV",
      },
      pH: {
        range: "5.5–7.0",
        unit: "(1% aqueous)",
        reference: "WHO Monograph",
      },
    },
    basicEvaluation: {
      foreignMatter: { range: "NMT 2.0", unit: "%", reference: "API Vol. IV" },
      extractYield: { range: "NLT 10.0", unit: "%", reference: "API Vol. IV" },
    },
    phytochemicalScreening: {
      alkaloids: { result: "Absent", reference: "API Vol. IV" },
      flavonoids: { result: "Present", reference: "WHO Monograph" },
      tannins: { result: "Present", reference: "API Vol. IV" },
      saponins: { result: "Absent", reference: "API Vol. IV" },
    },
  },
};

export function getHerbCollegeParams(
  herbId: string,
): CollegeHerbParameters | null {
  return herbCollegeParamsMap[herbId] ?? null;
}

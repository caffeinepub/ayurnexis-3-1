import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertTriangle,
  Beaker,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Download,
  Droplets,
  FlaskConical,
  Layers,
  Package,
  Pill,
  Plus,
  Shield,
  Syringe,
  TestTube,
  Thermometer,
  Trash2,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  type APIIngredient,
  type ExcipientCategory,
  type ExcipientIngredient,
  apiDrugs,
  binders,
  coatingAgents,
  disintegrants,
  excipientCategoryLabels,
  extraExcipients,
  fillers,
  glidants,
  herbExtracts,
  lubricants,
  preservatives,
} from "../data/formulationData";
import { type HerbMonograph, pharmacopeiaData } from "../data/pharmacopeiaData";

// ─── Pharmacopeia Incompatibility Database ────────────────────────────────────
const INCOMPATIBILITY_DB: Array<{
  a: string;
  b: string;
  severity: "incompatible" | "caution";
  reason: string;
}> = [
  {
    a: "magnesium stearate",
    b: "aspirin",
    severity: "incompatible",
    reason:
      "Ester hydrolysis — Mg stearate catalyzes aspirin hydrolysis to salicylic acid, reducing potency.",
  },
  {
    a: "magnesium stearate",
    b: "ibuprofen",
    severity: "caution",
    reason:
      "Possible hydrolysis of ibuprofen ester linkage; monitor stability.",
  },
  {
    a: "calcium carbonate",
    b: "tetracycline",
    severity: "incompatible",
    reason:
      "Chelation — divalent Ca²⁺ binds tetracycline forming insoluble complex, severely reducing bioavailability.",
  },
  {
    a: "dicalcium phosphate",
    b: "tetracycline",
    severity: "incompatible",
    reason: "Chelation with Ca²⁺ reduces tetracycline absorption by >50%.",
  },
  {
    a: "sodium bicarbonate",
    b: "aspirin",
    severity: "incompatible",
    reason:
      "Acid-base reaction produces CO₂, destabilizes tablet structure and degrades aspirin.",
  },
  {
    a: "sodium bicarbonate",
    b: "ibuprofen",
    severity: "caution",
    reason:
      "Alkaline microenvironment may accelerate hydrolytic degradation of ibuprofen.",
  },
  {
    a: "lactose",
    b: "primary amine drugs",
    severity: "incompatible",
    reason:
      "Maillard reaction between lactose reducing sugar and primary amines causes browning and potency loss.",
  },
  {
    a: "lactose",
    b: "metformin",
    severity: "incompatible",
    reason:
      "Maillard reaction: metformin (primary amine) reacts with lactose reducing end, causing discoloration.",
  },
  {
    a: "lactose",
    b: "fluoxetine",
    severity: "caution",
    reason:
      "Potential Maillard reaction — monitor appearance during stability studies.",
  },
  {
    a: "magnesium stearate",
    b: "sodium lauryl sulfate",
    severity: "caution",
    reason:
      "Ionic interaction may reduce lubricant efficiency and affect dissolution.",
  },
  {
    a: "talc",
    b: "quaternary ammonium compounds",
    severity: "caution",
    reason:
      "Adsorption of active onto talc surface may reduce bioavailability.",
  },
  {
    a: "stearic acid",
    b: "sodium carbonate",
    severity: "incompatible",
    reason:
      "Saponification reaction produces sodium stearate soap, altering tablet properties.",
  },
  {
    a: "microcrystalline cellulose",
    b: "hygroscopic actives",
    severity: "caution",
    reason:
      "MCC retains moisture; may accelerate hydrolysis of moisture-sensitive APIs.",
  },
  {
    a: "povidone",
    b: "sodium nitroprusside",
    severity: "incompatible",
    reason:
      "Chemical incompatibility resulting in discoloration and degradation.",
  },
  {
    a: "crospovidone",
    b: "ascorbic acid",
    severity: "caution",
    reason: "Oxidative interaction may degrade ascorbic acid over time.",
  },
  {
    a: "benzalkonium chloride",
    b: "anionic surfactants",
    severity: "incompatible",
    reason:
      "Cationic-anionic interaction forms precipitate, reducing antimicrobial efficacy.",
  },
  {
    a: "methylparaben",
    b: "polyethylene glycol",
    severity: "caution",
    reason:
      "PEG can partition methylparaben away from aqueous phase, reducing preservative efficacy.",
  },
  {
    a: "propylparaben",
    b: "polyethylene glycol",
    severity: "caution",
    reason:
      "Partitioning into PEG phase reduces free propylparaben concentration.",
  },
  {
    a: "carbomer",
    b: "cationic polymers",
    severity: "incompatible",
    reason: "Ionic crosslinking causes gel collapse and loss of viscosity.",
  },
  {
    a: "gelatin",
    b: "formaldehyde",
    severity: "incompatible",
    reason:
      "Crosslinking of gelatin reduces capsule dissolution and bioavailability.",
  },
  {
    a: "sorbitol",
    b: "microcrystalline cellulose",
    severity: "caution",
    reason:
      "Sorbitol plasticity may soften MCC matrix affecting tablet hardness.",
  },
  {
    a: "mannitol",
    b: "moisture sensitive actives",
    severity: "caution",
    reason:
      "Mannitol crystallization during drying can trap moisture and stress APIs.",
  },
  {
    a: "acacia",
    b: "alcohol",
    severity: "caution",
    reason:
      "High alcohol concentration precipitates acacia gum, reducing binder efficacy.",
  },
  {
    a: "sodium starch glycolate",
    b: "cationic drugs",
    severity: "caution",
    reason:
      "Ionic binding may reduce drug release rate from disintegrant network.",
  },
  {
    a: "eudragit",
    b: "magnesium stearate",
    severity: "caution",
    reason:
      "Mg ions may interact with carboxyl groups on Eudragit, softening enteric coat at lower pH.",
  },
];

// ─── Stability Properties Database ───────────────────────────────────────────
const STABILITY_PROPS: Record<
  string,
  {
    hygroscopic: boolean;
    thermolabile: boolean;
    lightSensitive: boolean;
    oxidationRisk: boolean;
    hydrolysisRisk: boolean;
    phRange: [number, number];
  }
> = {
  metformin: {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [6.5, 8.0],
  },
  paracetamol: {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: true,
    hydrolysisRisk: true,
    phRange: [3.8, 6.1],
  },
  ibuprofen: {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: true,
    hydrolysisRisk: true,
    phRange: [4.0, 7.0],
  },
  aspirin: {
    hygroscopic: true,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: true,
    phRange: [2.0, 4.0],
  },
  omeprazole: {
    hygroscopic: true,
    thermolabile: true,
    lightSensitive: true,
    oxidationRisk: true,
    hydrolysisRisk: true,
    phRange: [6.0, 8.0],
  },
  atorvastatin: {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: true,
    oxidationRisk: true,
    hydrolysisRisk: false,
    phRange: [4.0, 7.0],
  },
  amoxicillin: {
    hygroscopic: true,
    thermolabile: true,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: true,
    phRange: [3.5, 6.0],
  },
  ciprofloxacin: {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: true,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [3.0, 4.5],
  },
  diclofenac: {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: true,
    oxidationRisk: true,
    hydrolysisRisk: false,
    phRange: [5.0, 8.0],
  },
  prednisolone: {
    hygroscopic: true,
    thermolabile: false,
    lightSensitive: true,
    oxidationRisk: true,
    hydrolysisRisk: false,
    phRange: [5.0, 7.0],
  },
  rifampicin: {
    hygroscopic: true,
    thermolabile: false,
    lightSensitive: true,
    oxidationRisk: true,
    hydrolysisRisk: false,
    phRange: [4.5, 6.5],
  },
  doxycycline: {
    hygroscopic: true,
    thermolabile: false,
    lightSensitive: true,
    oxidationRisk: true,
    hydrolysisRisk: true,
    phRange: [2.0, 4.0],
  },
  ashwagandha: {
    hygroscopic: true,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: true,
    hydrolysisRisk: false,
    phRange: [5.0, 7.0],
  },
  curcumin: {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: true,
    oxidationRisk: true,
    hydrolysisRisk: false,
    phRange: [5.0, 7.5],
  },
  lactose: {
    hygroscopic: true,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [4.0, 8.0],
  },
  "microcrystalline cellulose": {
    hygroscopic: true,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [5.0, 8.0],
  },
  "magnesium stearate": {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [6.0, 8.0],
  },
  povidone: {
    hygroscopic: true,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [3.0, 9.0],
  },
  starch: {
    hygroscopic: true,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [4.0, 8.0],
  },
  talc: {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [5.0, 9.0],
  },
  "sodium benzoate": {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [3.0, 6.0],
  },
  "silicon dioxide": {
    hygroscopic: false,
    thermolabile: false,
    lightSensitive: false,
    oxidationRisk: false,
    hydrolysisRisk: false,
    phRange: [5.0, 9.0],
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormulationIngredient {
  id: string;
  name: string;
  category: "api" | "herb" | ExcipientCategory;
  quantity: number;
  unit: string;
  source?: APIIngredient | ExcipientIngredient;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DOSAGE_FORMS = [
  {
    name: "Tablet",
    icon: Pill,
    description: "Compressed solid oral dosage form",
  },
  {
    name: "Capsule",
    icon: Package,
    description: "Hard/soft shell encapsulated powder or pellets",
  },
  {
    name: "Syrup",
    icon: Droplets,
    description: "Viscous aqueous liquid with dissolved API",
  },
  {
    name: "Suspension",
    icon: FlaskConical,
    description: "Insoluble API particles in liquid vehicle",
  },
  {
    name: "Cream/Ointment",
    icon: Layers,
    description: "Semi-solid topical preparation",
  },
  {
    name: "Powder",
    icon: Wind,
    description: "Finely divided dry powder blend",
  },
  {
    name: "Injection",
    icon: Syringe,
    description: "Sterile parenteral solution or suspension",
  },
  {
    name: "Gel",
    icon: Beaker,
    description: "Semi-solid dispersion in gelling agent",
  },
  {
    name: "Lotion",
    icon: Droplets,
    description: "Low-viscosity emulsion for skin",
  },
  {
    name: "Suppository",
    icon: Thermometer,
    description: "Rectal/vaginal solid melting at body temp",
  },
  {
    name: "Drops",
    icon: Droplets,
    description: "Sterile ophthalmic or nasal solution",
  },
  { name: "Granules", icon: Zap, description: "Aggregated powder particles" },
  {
    name: "Sachet",
    icon: Package,
    description: "Unit-dose powder in sealed sachet",
  },
  {
    name: "Solution",
    icon: TestTube,
    description: "API fully dissolved in solvent",
  },
];

const DOSAGE_METHODS: Record<
  string,
  {
    method: string;
    description: string;
    compatibleExcipients: ExcipientCategory[];
  }[]
> = {
  Tablet: [
    {
      method: "Wet Granulation",
      description: "Moisture-activated binder agglomeration",
      compatibleExcipients: [
        "binders",
        "disintegrants",
        "lubricants",
        "fillers",
        "glidants",
      ],
    },
    {
      method: "Dry Granulation",
      description: "Compaction without liquid binder",
      compatibleExcipients: [
        "disintegrants",
        "lubricants",
        "fillers",
        "glidants",
      ],
    },
    {
      method: "Direct Compression",
      description: "Direct blend-to-press process",
      compatibleExcipients: [
        "fillers",
        "disintegrants",
        "lubricants",
        "glidants",
      ],
    },
  ],
  Capsule: [
    {
      method: "Fill Powder Blend",
      description: "Dry powder fill into hard gelatin capsule",
      compatibleExcipients: [
        "fillers",
        "disintegrants",
        "lubricants",
        "glidants",
      ],
    },
    {
      method: "Fill Pellets",
      description: "Multiparticulate pellets in capsule",
      compatibleExcipients: ["coatingAgents", "fillers", "lubricants"],
    },
  ],
  Syrup: [
    {
      method: "Simple Solution",
      description: "API dissolved in aqueous vehicle",
      compatibleExcipients: ["preservatives"],
    },
    {
      method: "Suspension Method",
      description: "Insoluble API suspended with viscosity agent",
      compatibleExcipients: ["preservatives", "binders"],
    },
  ],
  Suspension: [
    {
      method: "Flocculated Suspension",
      description: "Controlled floc formation",
      compatibleExcipients: ["preservatives", "binders"],
    },
    {
      method: "Deflocculated Suspension",
      description: "Fine particles in stable dispersion",
      compatibleExcipients: ["preservatives", "binders", "glidants"],
    },
  ],
  "Cream/Ointment": [
    {
      method: "Fusion Method",
      description: "Melting and blending lipid/aqueous phases",
      compatibleExcipients: ["preservatives", "lubricants"],
    },
    {
      method: "Emulsification",
      description: "O/W or W/O emulsion with emulsifier",
      compatibleExcipients: ["preservatives", "lubricants", "coatingAgents"],
    },
  ],
  Powder: [
    {
      method: "Simple Blending",
      description: "Physical mixing of powdered components",
      compatibleExcipients: ["fillers", "glidants"],
    },
    {
      method: "Co-processing",
      description: "Spray-drying or co-precipitation",
      compatibleExcipients: ["fillers", "glidants", "binders"],
    },
  ],
  Injection: [
    {
      method: "Aseptic Filling",
      description: "Sterile filtration and fill under LAF",
      compatibleExcipients: ["preservatives"],
    },
    {
      method: "Terminal Sterilization",
      description: "Autoclaving filled vials",
      compatibleExcipients: ["preservatives"],
    },
  ],
  Gel: [
    {
      method: "Cold Process",
      description: "Dispersion of gelling agent without heat",
      compatibleExcipients: ["binders", "preservatives"],
    },
    {
      method: "Hot Process",
      description: "Gel formed on cooling from heated solution",
      compatibleExcipients: ["binders", "preservatives", "coatingAgents"],
    },
  ],
  Lotion: [
    {
      method: "Oil-in-Water Emulsion",
      description: "Lighter emulsion for skin surface",
      compatibleExcipients: ["preservatives", "lubricants"],
    },
  ],
  Suppository: [
    {
      method: "Fusion Moulding",
      description: "API dispersed in melted base, poured into moulds",
      compatibleExcipients: ["lubricants", "fillers"],
    },
    {
      method: "Compression Moulding",
      description: "Cold compression of powdered base",
      compatibleExcipients: ["lubricants", "fillers", "disintegrants"],
    },
  ],
  Drops: [
    {
      method: "Solution Method",
      description: "API dissolved in sterile vehicle",
      compatibleExcipients: ["preservatives"],
    },
  ],
  Granules: [
    {
      method: "Wet Granulation",
      description: "Wet mass granulation and drying",
      compatibleExcipients: ["binders", "disintegrants", "fillers", "glidants"],
    },
    {
      method: "Dry Granulation",
      description: "Compaction granulation",
      compatibleExcipients: ["disintegrants", "fillers", "glidants"],
    },
  ],
  Sachet: [
    {
      method: "Dry Blend",
      description: "Powder blend packed in sachet",
      compatibleExcipients: ["fillers", "glidants"],
    },
  ],
  Solution: [
    {
      method: "Aqueous Solution",
      description: "API dissolved in purified water",
      compatibleExcipients: ["preservatives"],
    },
    {
      method: "Hydroalcoholic Solution",
      description: "API in water-alcohol mixture",
      compatibleExcipients: ["preservatives"],
    },
  ],
};

const METHOD_STEPS: Record<string, string[]> = {
  "Wet Granulation": [
    "Weigh and sieve all ingredients through 40 mesh",
    "Prepare binder solution in purified water",
    "Add binder solution to API + filler blend and knead to form wet mass",
    "Pass wet mass through 8 mesh sieve",
    "Dry granules at 60°C until LOD < 2%",
    "Dry-sieve through 20 mesh",
    "Add disintegrant and lubricant; blend for 5 minutes",
    "Compress to target weight using rotary tablet press",
  ],
  "Dry Granulation": [
    "Weigh and sieve all ingredients through 40 mesh",
    "Blend API, filler, and disintegrant for 10 minutes",
    "Compact blend into slugs or ribbons using roller compactor",
    "Mill compacted material through 20 mesh screen",
    "Add lubricant and glidant; blend for 5 minutes",
    "Compress granules to target tablet weight",
  ],
  "Direct Compression": [
    "Weigh and sieve all ingredients through 60 mesh",
    "Blend API, filler, and disintegrant in double-cone blender for 15 minutes",
    "Add lubricant and glidant; blend for 3 minutes",
    "Check blend uniformity (RSD < 5%)",
    "Compress to target weight on rotary tablet press",
    "Test hardness (4–8 kP), friability (<1%), disintegration (<15 min)",
  ],
  "Fill Powder Blend": [
    "Weigh and sieve all ingredients through 60 mesh",
    "Blend API and excipients until uniform",
    "Check blend flow and bulk density",
    "Set capsule-filling machine to target fill weight",
    "Fill and seal hard gelatin capsules",
    "Polish and visually inspect capsules",
  ],
  "Fill Pellets": [
    "Prepare API-loaded pellets by extrusion-spheronization",
    "Coat pellets with membrane coat in fluid-bed coater",
    "Dry coated pellets and check coating weight gain",
    "Blend coated pellets with required excipients",
    "Fill into hard gelatin capsules at target weight",
    "Seal, polish, and inspect capsules",
  ],
  "Simple Solution": [
    "Dissolve preservatives in half the required purified water",
    "Add API with stirring until completely dissolved",
    "Add flavoring and sweetening agents",
    "Make up to final volume with purified water",
    "Filter through 0.45 µm membrane filter",
    "Fill into amber bottles; seal and label",
  ],
  "Suspension Method": [
    "Prepare wetting agent solution in purified water",
    "Wet the API powder with wetting agent until smooth paste",
    "Add preservative solution and mix uniformly",
    "Add suspending agent (e.g., CMC, xanthan) with continuous stirring",
    "Adjust volume and pH to specification",
    "Fill into bottles, seal, and add 'Shake Well Before Use' label",
  ],
  "Aseptic Filling": [
    "Prepare solution in clean room Class C; filter through 0.22 µm membrane",
    "Transfer filtrate into Class A/B LAF filling zone",
    "Aseptically fill into pre-sterilized vials",
    "Stopper and crimp vials immediately",
    "Perform 100% visual inspection",
    "Label and quarantine for sterility testing",
  ],
  "Terminal Sterilization": [
    "Prepare and filter API solution",
    "Fill into vials and apply rubber stoppers",
    "Load vials into autoclave",
    "Sterilize at 121°C for 15 minutes (F0 ≥ 8)",
    "Cool and visually inspect all vials",
    "Release after sterility and pyrogen testing",
  ],
  "Fusion Method": [
    "Melt waxy/fatty base at appropriate temperature (60–80°C)",
    "Dissolve oil-soluble components in melted base",
    "Separately dissolve water-soluble API in aqueous phase",
    "Combine phases at equal temperatures with continuous stirring",
    "Add preservatives and mix to homogeneity",
    "Cool to room temperature with continued mixing; fill and seal",
  ],
  Emulsification: [
    "Prepare oil phase by melting waxes and lipids at 70°C",
    "Prepare aqueous phase (preservatives in purified water) at 70°C",
    "Add aqueous phase to oil phase with high-shear mixing",
    "Mix until homogeneous emulsion forms",
    "Cool to 40°C; add heat-sensitive actives (API)",
    "Fill into containers; seal and label",
  ],
  "Simple Blending": [
    "Weigh and sieve API and excipients through 80 mesh",
    "Blend in double-cone or V-blender for 15 minutes",
    "Check blend uniformity",
    "Fill into suitable containers with desiccant",
    "Seal and label with dosing instructions",
  ],
  "Co-processing": [
    "Prepare API solution/dispersion",
    "Spray-dry with excipient solution at inlet temp 150–180°C",
    "Collect powder from cyclone separator",
    "Screen through 60 mesh to break agglomerates",
    "Blend with remaining excipients",
    "Fill and seal",
  ],
  "Cold Process": [
    "Disperse gelling agent in purified water with stirring",
    "Allow to hydrate at room temperature for 30 minutes",
    "Dissolve API and preservatives separately in small amount of water",
    "Add API solution to gel base with gentle mixing",
    "Adjust pH to 6–7 with triethanolamine",
    "Fill into tubes or jars; seal and label",
  ],
  "Hot Process": [
    "Disperse gelling polymer in water at 80°C",
    "Add API and other excipients at 80°C",
    "Cool with stirring; gel forms as temperature drops",
    "Add preservatives below 40°C",
    "Adjust consistency and pH",
    "Fill into containers while semi-fluid; seal",
  ],
  "Oil-in-Water Emulsion": [
    "Heat oil phase components to 75°C",
    "Heat aqueous phase (emulsifier + water) to 75°C",
    "Add oil phase to aqueous phase with stirring",
    "Homogenize using rotor-stator at 3000 rpm",
    "Cool to 30°C; add preservatives and fragrance",
    "Fill into bottles; seal and label",
  ],
  "Fusion Moulding": [
    "Melt suppository base (e.g., cocoa butter, PEG) at 37–45°C",
    "Disperse API uniformly in melted base",
    "Pour into pre-chilled moulds",
    "Allow to solidify at room temperature or refrigerate",
    "Remove from moulds and wrap individually in foil",
    "Store in refrigerator (2–8°C)",
  ],
  "Compression Moulding": [
    "Blend powdered base and API through 80 mesh",
    "Add lubricant and blend briefly",
    "Compress in suppository compression machine",
    "Inspect for uniformity of weight and appearance",
    "Wrap and label; store below 25°C",
  ],
  "Solution Method": [
    "Dissolve API in sterile purified water (or saline for injections)",
    "Add preservatives and tonicity agents",
    "Adjust pH to specification",
    "Filter through 0.22 µm membrane filter",
    "Fill into sterile containers under aseptic conditions",
    "Seal and label with 'For Topical/Ophthalmic Use Only'",
  ],
  "Dry Blend (Sachet)": [
    "Weigh and sieve API and excipients through 60 mesh",
    "Blend until uniform in V-blender (10–15 min)",
    "Check blend uniformity and flow properties",
    "Set sachet-filling machine to target fill weight",
    "Fill, seal, and cut sachets",
    "Inspect seal integrity; label and package",
  ],
  "Aqueous Solution": [
    "Dissolve preservatives in 80% of purified water volume",
    "Add API with stirring until completely dissolved",
    "Check clarity and pH",
    "Make up to final volume with purified water",
    "Fill into suitable containers; seal and label",
  ],
  "Hydroalcoholic Solution": [
    "Dissolve API in ethanol portion",
    "Add purified water while stirring",
    "Add preservatives and other excipients",
    "Check alcohol concentration and pH",
    "Make up to volume; filter if required",
    "Fill, seal, and label",
  ],
  default: [
    "Weigh all ingredients accurately",
    "Prepare each component according to its nature",
    "Combine components in correct order",
    "Mix to homogeneity",
    "Perform in-process quality checks",
    "Fill, seal, and label final product",
  ],
};

const EXCIPIENT_DATA: Record<ExcipientCategory, ExcipientIngredient[]> = {
  binders,
  disintegrants,
  lubricants,
  fillers,
  glidants,
  coatingAgents,
  preservatives,
};

// ─── PDF Document ─────────────────────────────────────────────────────────────

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  "Dosage Form",
  "Method",
  "Ingredients",
  "Analysis",
  "Summary",
  "SOP",
  "Ownership",
  "Export",
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div
      className="flex items-center justify-between mb-8 px-2"
      data-ocid="formulation.step_indicator"
    >
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i + 1 === current
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/40 scale-110"
                  : i + 1 < current
                    ? "bg-green-700/80 text-green-200"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1 < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-[10px] mt-1 font-medium ${
                i + 1 === current ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-[2px] w-6 mx-1 rounded mt-[-14px] ${
                i + 1 < current ? "bg-green-600" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FormulationLab({
  prefillData,
}: {
  prefillData?: {
    dosageForm: string;
    ingredients: Array<{
      name: string;
      category: string;
      quantity: number;
      unit: string;
    }>;
  } | null;
}) {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ── Navigation State ──────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Step 1 ────────────────────────────────────────────────────────────────
  const [dosageForm, setDosageForm] = useState<string | null>(null);

  // ── Step 2 ────────────────────────────────────────────────────────────────
  const [method, setMethod] = useState<string | null>(null);

  // ── Step 3 ────────────────────────────────────────────────────────────────
  const [ingredients, setIngredients] = useState<FormulationIngredient[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // ── Prefill from Formulation Idea ─────────────────────────────────────────
  useEffect(() => {
    if (!prefillData) return;
    setDosageForm(prefillData.dosageForm);
    setIngredients(
      prefillData.ingredients.map((ing, idx) => ({
        id: `prefill-${idx}`,
        name: ing.name,
        category:
          ing.category.toLowerCase().includes("api") ||
          ing.category.toLowerCase().includes("herb")
            ? "api"
            : ((ing.category.toLowerCase().includes("binder")
                ? "binders"
                : ing.category.toLowerCase().includes("disintegrant")
                  ? "disintegrants"
                  : ing.category.toLowerCase().includes("lubricant")
                    ? "lubricants"
                    : ing.category.toLowerCase().includes("filler") ||
                        ing.category.toLowerCase().includes("diluent")
                      ? "fillers"
                      : ing.category.toLowerCase().includes("glidant")
                        ? "glidants"
                        : ing.category.toLowerCase().includes("coating")
                          ? "coatingAgents"
                          : ing.category.toLowerCase().includes("preservative")
                            ? "preservatives"
                            : "fillers") as
                | "api"
                | "binders"
                | "disintegrants"
                | "lubricants"
                | "fillers"
                | "glidants"
                | "coatingAgents"
                | "preservatives"),
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    );
    setStep(3);
  }, [prefillData]);

  const [drawerSearch, setDrawerSearch] = useState("");
  const [addQty, setAddQty] = useState("50");
  const [addUnit, setAddUnit] = useState("mg");
  const [manualName, setManualName] = useState("");
  const [manualCategory, setManualCategory] = useState<
    "api" | ExcipientCategory
  >("api");
  const [manualQty, setManualQty] = useState("");
  const [manualUnit, setManualUnit] = useState("mg");

  // ── Step 6 ────────────────────────────────────────────────────────────────
  const [scaleUp, setScaleUp] = useState(1);

  // ── Step 7 ────────────────────────────────────────────────────────────────
  const [ownerName, setOwnerName] = useState("");
  const [institution, setInstitution] = useState("");
  const [designation, setDesignation] = useState("");
  const [formulationName, setFormulationName] = useState("");

  // ── Step 8 ────────────────────────────────────────────────────────────────
  const [exporting, setExporting] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    i: number;
    j: number;
    reason: string;
  } | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const methods = dosageForm ? (DOSAGE_METHODS[dosageForm] ?? []) : [];
  const selectedMethod = methods.find((m) => m.method === method);
  const compatibleExcipients = selectedMethod?.compatibleExcipients ?? [];

  const apiIngredients = ingredients.filter((i) => i.category === "api");
  const totalWeight = ingredients.reduce((s, i) => s + i.quantity, 0);
  const apiLoad =
    totalWeight > 0
      ? (apiIngredients.reduce((s, i) => s + i.quantity, 0) / totalWeight) * 100
      : 0;

  const sopSteps = useMemo(() => {
    const steps = METHOD_STEPS[method ?? ""] ?? METHOD_STEPS.default;
    // Personalize placeholders
    const binderIng = ingredients.find((i) => i.category === "binders");
    return steps.map((s) =>
      s.replace("[binder name]", binderIng?.name ?? "binder"),
    );
  }, [method, ingredients]);

  // ── Analysis ──────────────────────────────────────────────────────────────
  const analysisFlags = useMemo(() => {
    const flags: { type: "warning" | "error" | "ok"; message: string }[] = [];
    const hasLubricant = ingredients.some((i) => i.category === "lubricants");
    const hasDisintegrant = ingredients.some(
      (i) => i.category === "disintegrants",
    );
    const hasPreservative = ingredients.some(
      (i) => i.category === "preservatives",
    );
    const apiCount = apiIngredients.length;

    if (
      !hasLubricant &&
      ["Tablet", "Capsule", "Granules"].includes(dosageForm ?? "")
    ) {
      flags.push({
        type: "warning",
        message: "No lubricant added — tablet sticking risk",
      });
    }
    if (!hasDisintegrant && ["Tablet", "Capsule"].includes(dosageForm ?? "")) {
      flags.push({
        type: "warning",
        message: "No disintegrant — poor dissolution expected",
      });
    }
    if (
      !hasPreservative &&
      ["Syrup", "Suspension", "Gel", "Lotion", "Drops", "Solution"].includes(
        dosageForm ?? "",
      )
    ) {
      flags.push({
        type: "error",
        message: "No preservative — microbial growth risk",
      });
    }
    if (apiCount > 2) {
      flags.push({
        type: "warning",
        message: `Multiple APIs (${apiCount}) — verify all interactions`,
      });
    }
    if (apiCount === 0) {
      flags.push({
        type: "error",
        message: "No API added — formulation incomplete",
      });
    }
    if (flags.length === 0) {
      flags.push({ type: "ok", message: "No critical flags detected" });
    }
    return flags;
  }, [ingredients, dosageForm, apiIngredients]);

  const compatibilityScore = useMemo(() => {
    let score = 100;
    const apiCats = apiIngredients
      .map((i) => (i.source as APIIngredient)?.therapeuticCategory)
      .filter(Boolean);
    const uniqueCats = new Set(apiCats);
    if (uniqueCats.size > 1) score -= (uniqueCats.size - 1) * 10;
    if (apiIngredients.length > 2) score -= 10;
    const errorCount = analysisFlags.filter((f) => f.type === "error").length;
    const warnCount = analysisFlags.filter((f) => f.type === "warning").length;
    score -= errorCount * 15;
    score -= warnCount * 5;
    return Math.max(0, Math.min(100, score));
  }, [apiIngredients, analysisFlags]);

  // ── Compatibility Matrix ──────────────────────────────────────────────────
  const compatibilityMatrix = useMemo(() => {
    if (ingredients.length < 2) return [];
    return ingredients.map((ing1) =>
      ingredients.map((ing2) => {
        if (ing1.id === ing2.id) return { status: "self" as const, reason: "" };
        const name1 = ing1.name.toLowerCase();
        const name2 = ing2.name.toLowerCase();
        const match = INCOMPATIBILITY_DB.find(
          (entry) =>
            (name1.includes(entry.a) && name2.includes(entry.b)) ||
            (name1.includes(entry.b) && name2.includes(entry.a)),
        );
        if (match)
          return {
            status: match.severity as "incompatible" | "caution",
            reason: match.reason,
          };
        return {
          status: "compatible" as const,
          reason:
            "No known incompatibilities reported in pharmacopeia literature.",
        };
      }),
    );
  }, [ingredients]);

  // ── Advanced Stability ────────────────────────────────────────────────────
  const advancedStability = useMemo(() => {
    const props = ingredients
      .map((ing) => {
        const key = ing.name.toLowerCase();
        const found = Object.entries(STABILITY_PROPS).find(([k]) =>
          key.includes(k),
        );
        return found ? found[1] : null;
      })
      .filter(Boolean) as Array<(typeof STABILITY_PROPS)[string]>;

    const hygroscopicCount = props.filter((p) => p.hygroscopic).length;
    const thermolabileCount = props.filter((p) => p.thermolabile).length;
    const lightSensitiveCount = props.filter((p) => p.lightSensitive).length;
    const oxidationRisk = props.filter((p) => p.oxidationRisk).length;
    const hydrolysisRisk = props.filter((p) => p.hydrolysisRisk).length;

    const phRanges = props.map((p) => p.phRange);
    const phMin = phRanges.length ? Math.max(...phRanges.map((r) => r[0])) : 4;
    const phMax = phRanges.length ? Math.min(...phRanges.map((r) => r[1])) : 8;
    const phCompatible = phMin <= phMax;

    let shelfLifeMonths = 36;
    if (hygroscopicCount > 2) shelfLifeMonths -= 6;
    if (thermolabileCount > 0) shelfLifeMonths -= 6;
    if (lightSensitiveCount > 1) shelfLifeMonths -= 3;
    if (oxidationRisk > 1) shelfLifeMonths -= 6;
    if (hydrolysisRisk > 1) shelfLifeMonths -= 6;
    if (!phCompatible) shelfLifeMonths -= 12;
    shelfLifeMonths = Math.max(6, shelfLifeMonths);

    const deductions =
      (hygroscopicCount > 2 ? 15 : hygroscopicCount * 3) +
      thermolabileCount * 10 +
      lightSensitiveCount * 5 +
      oxidationRisk * 5 +
      hydrolysisRisk * 5 +
      (!phCompatible ? 20 : 0);
    const stabilityScore = Math.max(0, 100 - deductions);

    return {
      hygroscopicCount,
      thermolabileCount,
      lightSensitiveCount,
      oxidationRisk,
      hydrolysisRisk,
      phCompatible,
      phMin,
      phMax,
      shelfLifeMonths,
      stabilityScore,
    };
  }, [ingredients]);

  // ── Composition Analysis ──────────────────────────────────────────────────
  const compositionAnalysis = useMemo(() => {
    const advantages: string[] = [];
    const disadvantages: string[] = [];

    const apis = ingredients.filter(
      (i) => i.category === "api" || i.category === "herb",
    );
    const hasBinder = ingredients.some((i) => i.category === "binders");
    const hasDisintegrant = ingredients.some(
      (i) => i.category === "disintegrants",
    );
    const hasLubricant = ingredients.some((i) => i.category === "lubricants");
    const hasFiller = ingredients.some((i) => i.category === "fillers");
    const hasGlidant = ingredients.some((i) => i.category === "glidants");
    const hasCoating = ingredients.some((i) => i.category === "coatingAgents");
    const hasPreservative = ingredients.some(
      (i) => i.category === "preservatives",
    );

    const totalWt = ingredients.reduce((s, i) => s + i.quantity, 0);
    const apiWt = apis.reduce((s, i) => s + i.quantity, 0);
    const apiLoadPct = totalWt > 0 ? (apiWt / totalWt) * 100 : 0;

    if (apis.length > 0)
      advantages.push(
        `Contains ${apis.length} active pharmaceutical ingredient(s) providing targeted therapeutic effect.`,
      );
    if (apis.length > 1)
      advantages.push(
        "Combination therapy: multiple APIs may provide synergistic therapeutic effects.",
      );
    if (hasBinder)
      advantages.push(
        "Binder present: ensures tablet/granule cohesion and mechanical strength during manufacturing.",
      );
    if (hasDisintegrant)
      advantages.push(
        "Disintegrant present: promotes rapid tablet disintegration enabling faster drug release.",
      );
    if (hasLubricant)
      advantages.push(
        "Lubricant included: reduces friction during compression, preventing sticking and ensuring uniform tablet ejection.",
      );
    if (hasFiller)
      advantages.push(
        "Filler/diluent present: ensures adequate tablet weight and volume for handling and swallowability.",
      );
    if (hasGlidant)
      advantages.push(
        "Glidant included: improves powder flowability and ensures uniform die fill during compression.",
      );
    if (hasCoating)
      advantages.push(
        "Coating agent present: provides taste masking, moisture protection, and controlled/targeted drug release.",
      );
    if (hasPreservative)
      advantages.push(
        "Preservative included: prevents microbial growth extending product shelf life and ensuring patient safety.",
      );
    if (apiLoadPct >= 10 && apiLoadPct <= 40)
      advantages.push(
        `API load of ${apiLoadPct.toFixed(1)}% is within optimal range (10–40%) for good compressibility.`,
      );

    if (!hasBinder && (dosageForm === "Tablet" || dosageForm === "Capsule"))
      disadvantages.push(
        "No binder detected: tablet/capsule may lack cohesive strength; consider adding PVP K30 or HPMC E5.",
      );
    if (!hasDisintegrant && dosageForm === "Tablet")
      disadvantages.push(
        "No disintegrant present: tablet may have poor disintegration; consider Croscarmellose sodium or SSG.",
      );
    if (!hasLubricant && dosageForm === "Tablet")
      disadvantages.push(
        "No lubricant present: manufacturing issues (sticking, capping) are likely; add Magnesium stearate or Talc.",
      );
    if (apis.length === 0)
      disadvantages.push(
        "No API detected: formulation has no active therapeutic component.",
      );
    if (apis.length > 3)
      disadvantages.push(
        "High API count (>3): drug–drug interactions and compatibility risks increase significantly.",
      );
    if (apiLoadPct > 60)
      disadvantages.push(
        `High API load (${apiLoadPct.toFixed(1)}%): may compromise compressibility and dissolution; add more excipient support.`,
      );
    if (advancedStability.oxidationRisk > 1)
      disadvantages.push(
        "Multiple oxidation-prone ingredients: antioxidant (e.g., BHA, BHT, Ascorbic acid) or inert gas packaging recommended.",
      );
    if (advancedStability.hydrolysisRisk > 1)
      disadvantages.push(
        "Multiple hydrolysis-prone APIs: minimize moisture exposure; use desiccants and moisture-barrier packaging.",
      );
    if (!advancedStability.phCompatible)
      disadvantages.push(
        `pH incompatibility detected: ingredient pH ranges do not overlap (required pH ${advancedStability.phMin.toFixed(1)}–${advancedStability.phMax.toFixed(1)} is conflicted); reformulation needed.`,
      );

    return { advantages, disadvantages };
  }, [ingredients, dosageForm, advancedStability]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function addFromDrawer(
    ing: APIIngredient | ExcipientIngredient,
    cat: "api" | ExcipientCategory,
  ) {
    const qty = Number.parseFloat(addQty) || 50;
    const existing = ingredients.find((i) => i.id === `${ing.id}_${cat}`);
    if (existing) return;
    setIngredients((prev) => [
      ...prev,
      {
        id: `${ing.id}_${cat}`,
        name: ing.name,
        category: cat,
        quantity: qty,
        unit: addUnit,
        source: ing,
      },
    ]);
  }

  function addHerbFromDrawer(herb: HerbMonograph) {
    const qty = Number.parseFloat(addQty) || 100;
    const existing = ingredients.find((i) => i.id === `herb_${herb.id}`);
    if (existing) return;
    setIngredients((prev) => [
      ...prev,
      {
        id: `herb_${herb.id}`,
        name: herb.name,
        category: "herb" as const,
        quantity: qty,
        unit: addUnit,
      },
    ]);
  }
  function addManual() {
    if (!manualName.trim() || !manualQty) return;
    const id = `manual_${Date.now()}`;
    setIngredients((prev) => [
      ...prev,
      {
        id,
        name: manualName.trim(),
        category: manualCategory,
        quantity: Number.parseFloat(manualQty),
        unit: manualUnit,
      },
    ]);
    setManualName("");
    setManualQty("");
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      const addSectionHeader = (text: string) => {
        y += 4;
        doc.setFillColor(30, 30, 80);
        doc.rect(margin, y - 4, pageW - margin * 2, 8, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(text, margin + 2, y + 0.5);
        y += 8;
        doc.setTextColor(0, 0, 0);
      };
      const checkPage = (needed = 20) => {
        if (y + needed > 270) {
          doc.addPage();
          y = 20;
        }
      };

      // Cover
      doc.setFillColor(245, 245, 255);
      doc.rect(0, 0, pageW, 60, "F");
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 80);
      doc.text("FORMULATION DEVELOPMENT REPORT", pageW / 2, 25, {
        align: "center",
      });
      doc.setFontSize(13);
      doc.setTextColor(60, 60, 120);
      doc.text(formulationName || `${dosageForm} Formulation`, pageW / 2, 37, {
        align: "center",
      });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Prepared by: ${ownerName || "N/A"}  |  Institution: ${institution || "N/A"}`,
        pageW / 2,
        47,
        { align: "center" },
      );
      doc.text(
        `Date: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
        pageW / 2,
        54,
        { align: "center" },
      );
      y = 70;

      // Section 1: Formulation Overview
      addSectionHeader("1. FORMULATION OVERVIEW");
      autoTable(doc, {
        startY: y,
        head: [["Parameter", "Details"]],
        body: [
          ["Dosage Form", dosageForm || "N/A"],
          ["Manufacturing Method", method || "N/A"],
          ["Total Ingredients", ingredients.length.toString()],
          [
            "Total Batch Weight (single dose)",
            `${ingredients.reduce((s, i) => s + i.quantity, 0)} mg`,
          ],
          [
            "API Count",
            ingredients
              .filter((i) => i.category === "api" || i.category === "herb")
              .length.toString(),
          ],
          ["Compatibility Score", `${compatibilityScore}/100`],
          ["Stability Score", `${advancedStability.stabilityScore}/100`],
          [
            "Predicted Shelf Life",
            `${advancedStability.shelfLifeMonths} months at 25°C/60% RH`,
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [30, 30, 80], textColor: 255 },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      // Section 2: Composition Table
      checkPage(40);
      addSectionHeader("2. COMPOSITION TABLE");
      autoTable(doc, {
        startY: y,
        head: [
          ["#", "Ingredient", "Category", `Quantity (×${scaleUp})`, "Unit"],
        ],
        body: ingredients.map((ing, idx) => [
          (idx + 1).toString(),
          ing.name,
          ing.category,
          (ing.quantity * scaleUp).toFixed(2),
          ing.unit,
        ]),
        theme: "striped",
        headStyles: { fillColor: [30, 30, 80], textColor: 255 },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      // Section 3: Compatibility Analysis
      checkPage(40);
      addSectionHeader("3. COMPATIBILITY ANALYSIS");
      const incompatPairs: string[][] = [];
      const cautionPairs: string[][] = [];
      ingredients.forEach((ing1, i) => {
        ingredients.forEach((ing2, j) => {
          if (j <= i) return;
          const cell = compatibilityMatrix[i]?.[j];
          if (cell?.status === "incompatible")
            incompatPairs.push([ing1.name, ing2.name, cell.reason]);
          if (cell?.status === "caution")
            cautionPairs.push([ing1.name, ing2.name, cell.reason]);
        });
      });
      if (incompatPairs.length === 0 && cautionPairs.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94);
        doc.text(
          "No significant incompatibilities detected between selected ingredients.",
          margin,
          y,
        );
        y += 8;
        doc.setTextColor(0, 0, 0);
      } else {
        if (incompatPairs.length > 0) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(220, 38, 38);
          doc.text("Incompatible Pairs:", margin, y);
          y += 6;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          autoTable(doc, {
            startY: y,
            head: [["Ingredient A", "Ingredient B", "Reason"]],
            body: incompatPairs,
            theme: "grid",
            headStyles: { fillColor: [220, 38, 38], textColor: 255 },
            margin: { left: margin, right: margin },
            columnStyles: { 2: { cellWidth: 90 } },
          });
          y = (doc as any).lastAutoTable.finalY + 6;
        }
        if (cautionPairs.length > 0) {
          checkPage(30);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(202, 138, 4);
          doc.text("Caution Pairs:", margin, y);
          y += 6;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          autoTable(doc, {
            startY: y,
            head: [["Ingredient A", "Ingredient B", "Reason"]],
            body: cautionPairs,
            theme: "grid",
            headStyles: { fillColor: [202, 138, 4], textColor: 255 },
            margin: { left: margin, right: margin },
            columnStyles: { 2: { cellWidth: 90 } },
          });
          y = (doc as any).lastAutoTable.finalY + 6;
        }
      }

      // Section 4: Stability Assessment
      checkPage(60);
      addSectionHeader("4. PREDICTIVE STABILITY ASSESSMENT");
      autoTable(doc, {
        startY: y,
        head: [["Stability Parameter", "Assessment", "Recommendation"]],
        body: [
          [
            "Hygroscopic Ingredients",
            `${advancedStability.hygroscopicCount} detected`,
            advancedStability.hygroscopicCount > 1
              ? "Use desiccant packaging; store <65% RH"
              : "Standard packaging acceptable",
          ],
          [
            "Thermolabile Ingredients",
            `${advancedStability.thermolabileCount} detected`,
            advancedStability.thermolabileCount > 0
              ? "Store below 25°C; avoid high-temperature processing"
              : "No special temperature requirements",
          ],
          [
            "Light-Sensitive Ingredients",
            `${advancedStability.lightSensitiveCount} detected`,
            advancedStability.lightSensitiveCount > 0
              ? "Use amber/opaque packaging"
              : "Standard packaging acceptable",
          ],
          [
            "Oxidation Risk",
            `${advancedStability.oxidationRisk} ingredient(s) at risk`,
            advancedStability.oxidationRisk > 1
              ? "Add antioxidant; use nitrogen purge packaging"
              : "Monitor during stability studies",
          ],
          [
            "Hydrolysis Risk",
            `${advancedStability.hydrolysisRisk} ingredient(s) at risk`,
            advancedStability.hydrolysisRisk > 1
              ? "Control moisture; use desiccants"
              : "Standard precautions apply",
          ],
          [
            "pH Compatibility",
            advancedStability.phCompatible
              ? `Compatible (pH ${advancedStability.phMin.toFixed(1)}-${advancedStability.phMax.toFixed(1)})`
              : "INCOMPATIBLE pH ranges",
            advancedStability.phCompatible
              ? "Formulation is pH-stable"
              : "CRITICAL: pH conflict - reformulate",
          ],
          [
            "Predicted Shelf Life",
            `${advancedStability.shelfLifeMonths} months`,
            "At 25°C/60% RH per ICH Q1A guidelines",
          ],
          [
            "Overall Stability Score",
            `${advancedStability.stabilityScore}/100`,
            advancedStability.stabilityScore >= 80
              ? "Excellent - proceed with accelerated stability testing"
              : advancedStability.stabilityScore >= 60
                ? "Good - standard stability protocol recommended"
                : "Poor - reformulation recommended",
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [30, 30, 80], textColor: 255 },
        margin: { left: margin, right: margin },
        columnStyles: { 2: { cellWidth: 70 } },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      // Section 5: Composition Advantages & Disadvantages
      checkPage(40);
      addSectionHeader("5. COMPOSITION ADVANTAGES & DISADVANTAGES");
      if (compositionAnalysis.advantages.length > 0) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(34, 197, 94);
        doc.text("Advantages:", margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        for (const adv of compositionAnalysis.advantages) {
          checkPage(8);
          const lines = doc.splitTextToSize(`- ${adv}`, pageW - margin * 2);
          doc.text(lines, margin, y);
          y += lines.length * 5;
        }
        y += 4;
      }
      if (compositionAnalysis.disadvantages.length > 0) {
        checkPage(20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("Disadvantages / Risks:", margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        for (const dis of compositionAnalysis.disadvantages) {
          checkPage(8);
          const lines = doc.splitTextToSize(`- ${dis}`, pageW - margin * 2);
          doc.text(lines, margin, y);
          y += lines.length * 5;
        }
      }
      y += 8;

      // Section 6: SOP
      checkPage(40);
      addSectionHeader("6. STANDARD OPERATING PROCEDURE (SOP)");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Materials Required (Scaled):", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      ingredients.forEach((ing, idx) => {
        checkPage(6);
        doc.text(
          `${idx + 1}. ${ing.name}: ${(ing.quantity * scaleUp).toFixed(2)} ${ing.unit}`,
          margin + 4,
          y,
        );
        y += 5;
      });
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.text("Procedure:", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      sopSteps.forEach((step, idx) => {
        checkPage(8);
        const lines = doc.splitTextToSize(
          `Step ${idx + 1}: ${step}`,
          pageW - margin * 2 - 4,
        );
        doc.text(lines, margin + 4, y);
        y += lines.length * 5 + 2;
      });

      // Certificate page
      if (ownerName) {
        doc.addPage();
        y = 20;
        // Gold outer border
        doc.setDrawColor(180, 130, 30);
        doc.setLineWidth(3);
        doc.rect(8, 8, pageW - 16, 279, "S");
        // Green inner border
        doc.setDrawColor(20, 83, 45);
        doc.setLineWidth(1);
        doc.rect(14, 14, pageW - 28, 267, "S");
        // Corner ornaments
        for (const [cx, cy2] of [
          [12, 12],
          [pageW - 12, 12],
          [12, 283],
          [pageW - 12, 283],
        ] as [number, number][]) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(180, 130, 30);
          doc.text("◆", cx, cy2, { align: "center" });
        }
        // Green header band
        doc.setFillColor(20, 83, 45);
        doc.rect(14, 14, pageW - 28, 30, "F");
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("AyurNexis 3.1", pageW / 2, 27, { align: "center" });
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(167, 243, 208);
        doc.text("FORMULATION EXCELLENCE CERTIFICATE", pageW / 2, 36, {
          align: "center",
        });
        // Divider gold line
        doc.setDrawColor(180, 130, 30);
        doc.setLineWidth(0.5);
        doc.line(30, 48, pageW - 30, 48);
        // Body
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("THIS IS TO CERTIFY THAT", pageW / 2, 60, { align: "center" });
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 83, 45);
        doc.text(ownerName.toUpperCase(), pageW / 2, 75, { align: "center" });
        if (designation) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(80, 80, 80);
          doc.text(designation, pageW / 2, 84, { align: "center" });
        }
        if (institution) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          doc.text(institution, pageW / 2, 93, { align: "center" });
        }
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(
          "has successfully developed, validated, and documented the following pharmaceutical",
          pageW / 2,
          106,
          { align: "center" },
        );
        doc.text(
          "formulation using AyurNexis 3.1 AI-Enabled Ayurvedic Quality Assurance Platform.",
          pageW / 2,
          114,
          { align: "center" },
        );
        // Formulation box
        doc.setFillColor(240, 253, 244);
        doc.setDrawColor(20, 83, 45);
        doc.setLineWidth(0.5);
        doc.rect(25, 122, pageW - 50, 40, "FD");
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 83, 45);
        doc.text(
          (formulationName || `${dosageForm} Formulation`).toUpperCase(),
          pageW / 2,
          137,
          { align: "center" },
        );
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(
          `${dosageForm}  ·  ${method}  ·  ${ingredients.length} Ingredients`,
          pageW / 2,
          147,
          { align: "center" },
        );
        doc.text(
          `Stability Score: ${advancedStability.stabilityScore}/100  ·  Shelf Life: ${advancedStability.shelfLifeMonths} months`,
          pageW / 2,
          156,
          { align: "center" },
        );
        // Signature lines
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.3);
        doc.line(30, 205, 95, 205);
        doc.line(pageW - 95, 205, pageW - 30, 205);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        doc.text("Formulator Signature", 62, 211, { align: "center" });
        doc.text("QA Authority", pageW - 62, 211, { align: "center" });
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(ownerName, 62, 218, { align: "center" });
        doc.text("AyurNexis QA Board", pageW - 62, 218, { align: "center" });
        // Date and cert number
        const certDate = new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const certNum = `AN-${Date.now().toString(36).toUpperCase().slice(-8)}`;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        doc.text(`Date of Certification: ${certDate}`, 30, 230);
        doc.text(`Certificate No.: ${certNum}`, pageW - 30, 230, {
          align: "right",
        });
        // Footer tagline
        doc.setFillColor(20, 83, 45);
        doc.rect(14, 270, pageW - 28, 11, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(167, 243, 208);
        doc.text(
          "Powered by AyurNexis 3.1 — AI-Enabled Ayurvedic Quality Assurance Platform",
          pageW / 2,
          277,
          { align: "center" },
        );
      }

      doc.save(`${formulationName || dosageForm || "formulation"}_report.pdf`);
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setExporting(false);
    }
  }

  // ─── Render Steps ─────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 px-6 py-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20">
          <FlaskConical className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Formulation Lab</h1>
          <p className="text-xs text-muted-foreground">
            Advanced Composition System — AyurNexis 3.1
          </p>
        </div>
        {dosageForm && (
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/40">
              {dosageForm}
            </Badge>
            {method && (
              <Badge
                variant="outline"
                className="text-accent-foreground border-accent/40"
              >
                {method}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Dosage Form ─────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="mb-5">
                <h2 className="text-xl font-bold text-foreground">
                  Select Dosage Form
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the type of pharmaceutical formulation you want to
                  develop
                </p>
              </div>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3"
                data-ocid="formulation.dosage.list"
              >
                {DOSAGE_FORMS.map((df, idx) => {
                  const Icon = df.icon;
                  return (
                    <motion.div
                      key={df.name}
                      data-ocid={`formulation.dosage.item.${idx + 1}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => {
                        setDosageForm(df.name);
                        setMethod(null);
                        setStep(2);
                      }}
                      className={`cursor-pointer rounded-xl p-4 border flex flex-col items-center gap-2 text-center transition-all hover:border-primary/60 hover:bg-primary/5 ${
                        dosageForm === df.name
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-accent/20">
                        <Icon className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {df.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        {df.description}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Method ──────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <Button
                  data-ocid="formulation.step2.back_button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep(1);
                    setMethod(null);
                  }}
                  className="gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Dosage Form
                </Button>
              </div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-foreground">
                  Select Manufacturing Method
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Method determines which excipients are compatible
                </p>
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                data-ocid="formulation.method.list"
              >
                {methods.map((m, idx) => (
                  <motion.div
                    key={m.method}
                    data-ocid={`formulation.method.item.${idx + 1}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    onClick={() => {
                      setMethod(m.method);
                      setStep(3);
                    }}
                    className={`cursor-pointer rounded-xl p-5 border flex flex-col gap-2 transition-all hover:border-primary/60 hover:bg-primary/5 ${
                      method === m.method
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {m.method}
                      </span>
                      {method === m.method && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {m.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.compatibleExcipients.map((cat) => (
                        <Badge
                          key={cat}
                          variant="secondary"
                          className="text-[10px] py-0"
                        >
                          {excipientCategoryLabels[cat]}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Ingredients ─────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Add Ingredients
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add APIs and excipients to build your formulation
                  </p>
                </div>
                <Button
                  data-ocid="formulation.ingredients.open_modal_button"
                  onClick={() => setDrawerOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Add from Library
                </Button>
              </div>

              {/* Manual entry */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Manual Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <Label className="text-xs">Ingredient Name</Label>
                      <Input
                        data-ocid="formulation.manual.input"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="e.g. Starch NF"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={manualCategory}
                        onValueChange={(v) =>
                          setManualCategory(v as "api" | ExcipientCategory)
                        }
                      >
                        <SelectTrigger
                          data-ocid="formulation.manual.select"
                          className="mt-1 h-8 text-sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api">API</SelectItem>
                          {(
                            Object.keys(
                              excipientCategoryLabels,
                            ) as ExcipientCategory[]
                          ).map((k) => (
                            <SelectItem key={k} value={k}>
                              {excipientCategoryLabels[k]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        data-ocid="formulation.manual.qty_input"
                        value={manualQty}
                        onChange={(e) => setManualQty(e.target.value)}
                        placeholder="50"
                        type="number"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">Unit</Label>
                        <Select
                          value={manualUnit}
                          onValueChange={setManualUnit}
                        >
                          <SelectTrigger
                            data-ocid="formulation.manual.unit_select"
                            className="mt-1 h-8 text-sm"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["mg", "g", "mL", "%", "IU"].map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        data-ocid="formulation.manual.submit_button"
                        size="sm"
                        onClick={addManual}
                        className="h-8 px-3"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients table */}
              {ingredients.length === 0 ? (
                <div
                  data-ocid="formulation.ingredients.empty_state"
                  className="text-center py-14 border border-dashed border-border rounded-xl text-muted-foreground"
                >
                  <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    No ingredients added yet. Use the library or manual entry
                    above.
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-xl border border-border overflow-hidden"
                  data-ocid="formulation.ingredients.table"
                >
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground">
                          #
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground">
                          Ingredient
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground">
                          Category
                        </th>
                        <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground">
                          Quantity
                        </th>
                        <th className="text-right py-2 px-4 text-xs font-semibold text-muted-foreground">
                          Remove
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.map((ing, idx) => (
                        <tr
                          key={ing.id}
                          data-ocid={`formulation.ingredient.row.${idx + 1}`}
                          className="border-t border-border hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-2 px-4 text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-4 font-medium text-foreground">
                            {ing.name}
                          </td>
                          <td className="py-2 px-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                ing.category === "api"
                                  ? "border-primary/50 text-primary"
                                  : "border-accent/50 text-accent-foreground"
                              }`}
                            >
                              {ing.category === "api"
                                ? "API"
                                : excipientCategoryLabels[
                                    ing.category as ExcipientCategory
                                  ]}
                            </Badge>
                          </td>
                          <td className="py-2 px-4 text-foreground">
                            {ing.quantity} {ing.unit}
                          </td>
                          <td className="py-2 px-4 text-right">
                            <Button
                              data-ocid={`formulation.ingredient.delete_button.${idx + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIngredient(ing.id)}
                              className="h-6 w-6 p-0 hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: Analysis ────────────────────────────────── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Real-Time Analysis
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Live recalculation of compatibility, risks, and API insights
                </p>
              </div>
              <Tabs defaultValue="api" data-ocid="formulation.analysis.tab">
                <TabsList className="mb-4">
                  <TabsTrigger
                    data-ocid="formulation.analysis.api_tab"
                    value="api"
                  >
                    API Insights
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="formulation.analysis.recommendations_tab"
                    value="recs"
                  >
                    Dynamic Recommendations
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="formulation.analysis.compatibility_tab"
                    value="compat"
                  >
                    Compatibility Matrix
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="api" className="space-y-4">
                  {apiIngredients.length === 0 ? (
                    <div
                      data-ocid="formulation.analysis.api.empty_state"
                      className="text-center py-14 text-muted-foreground"
                    >
                      <TestTube className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        No API added. Go back and add at least one API.
                      </p>
                    </div>
                  ) : (
                    apiIngredients.map((ing) => {
                      const api = ing.source as APIIngredient;
                      const optimalDose = api
                        ? ((api.assayMin + api.assayMax) / 2) * 0.5
                        : 50;
                      const doseCoverage = Math.min(
                        150,
                        (ing.quantity / optimalDose) * 100,
                      );
                      const otherApis = apiIngredients.filter(
                        (a) => a.id !== ing.id,
                      );
                      return (
                        <Card key={ing.id} className="border-border glass-card">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base text-primary">
                                {ing.name}
                              </CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {api?.therapeuticCategory ?? "API"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-green-400 mb-2">
                                  ✓ Advantages
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {api?.description ??
                                    "Well-established pharmacological profile with documented efficacy."}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-yellow-400 mb-2">
                                  ⚠ Considerations
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Monitor assay range ({api?.assayMin}–
                                  {api?.assayMax}%). Store:{" "}
                                  {api?.storage ?? "as per monograph"}.
                                </p>
                              </div>
                            </div>

                            {/* Dose coverage */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">
                                  Dose Coverage vs Optimal (
                                  {optimalDose.toFixed(1)} mg)
                                </span>
                                <span
                                  className={`text-xs font-bold ${
                                    doseCoverage > 100
                                      ? "text-yellow-400"
                                      : doseCoverage >= 80
                                        ? "text-green-400"
                                        : "text-red-400"
                                  }`}
                                >
                                  {doseCoverage.toFixed(0)}%
                                </span>
                              </div>
                              <Progress value={doseCoverage} className="h-2" />
                            </div>

                            {/* DDI */}
                            {otherApis.length > 0 && (
                              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                <p className="text-xs font-semibold text-yellow-400 mb-1">
                                  Drug–Drug Interactions
                                </p>
                                {otherApis.map((other) => (
                                  <p
                                    key={other.id}
                                    className="text-xs text-muted-foreground"
                                  >
                                    • {ing.name} + {other.name} — monitor
                                    closely; verify pharmacokinetic
                                    compatibility
                                  </p>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </TabsContent>

                <TabsContent value="recs" className="space-y-4">
                  {/* Compatibility score */}
                  <Card className="border-border glass-card">
                    <CardContent className="pt-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-foreground">
                          Overall Compatibility Score
                        </span>
                        <span
                          className={`text-2xl font-bold ${
                            compatibilityScore >= 80
                              ? "text-green-400"
                              : compatibilityScore >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {compatibilityScore}/100
                        </span>
                      </div>
                      <Progress value={compatibilityScore} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {compatibilityScore >= 80
                          ? "Formulation appears compatible. Proceed with confidence."
                          : compatibilityScore >= 60
                            ? "Some concerns detected. Review flagged issues before proceeding."
                            : "Critical issues detected. Address all flags before finalization."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Flags */}
                  <div className="space-y-2">
                    {analysisFlags.map((flag) => (
                      <div
                        key={flag.message}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
                          flag.type === "ok"
                            ? "bg-green-500/10 border-green-500/20 text-green-300"
                            : flag.type === "warning"
                              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                              : "bg-red-500/10 border-red-500/20 text-red-300"
                        }`}
                      >
                        {flag.type === "ok" ? (
                          <CheckCircle className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                        )}
                        <span className="text-sm">{flag.message}</span>
                      </div>
                    ))}
                  </div>

                  {/* Compatibility notes */}
                  {ingredients.length > 0 && (
                    <Card className="border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                          Ingredient Compatibility Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {ingredients.map((ing) => (
                            <div
                              key={ing.id}
                              className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0"
                            >
                              <span className="text-foreground">
                                {ing.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] border-green-500/40 text-green-400"
                              >
                                Compatible
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="compat" className="space-y-4">
                  {ingredients.length < 2 ? (
                    <div className="text-center py-14 text-muted-foreground">
                      <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        Add at least 2 ingredients to see the compatibility
                        matrix.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground">
                        Each cell shows known pharmacopeia compatibility between
                        ingredient pairs. Click any cell to see details.
                      </p>
                      <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="text-xs border-collapse w-full">
                          <thead>
                            <tr>
                              <th className="p-2 bg-muted/60 text-left text-muted-foreground border border-border min-w-[120px]">
                                Ingredient
                              </th>
                              {ingredients.map((ing) => (
                                <th
                                  key={ing.id}
                                  className="p-2 bg-muted/60 text-center text-muted-foreground border border-border min-w-[90px] max-w-[90px]"
                                >
                                  <span
                                    className="block truncate"
                                    title={ing.name}
                                  >
                                    {ing.name.length > 12
                                      ? `${ing.name.substring(0, 12)}…`
                                      : ing.name}
                                  </span>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {ingredients.map((ing1, i) => (
                              <tr key={ing1.id}>
                                <td className="p-2 bg-muted/30 font-medium text-foreground border border-border">
                                  <span
                                    className="block truncate max-w-[120px]"
                                    title={ing1.name}
                                  >
                                    {ing1.name.length > 14
                                      ? `${ing1.name.substring(0, 14)}…`
                                      : ing1.name}
                                  </span>
                                </td>
                                {ingredients.map((ing2, j) => {
                                  const cell = compatibilityMatrix[i]?.[j];
                                  if (!cell)
                                    return (
                                      <td
                                        key={ing2.id}
                                        className="border border-border"
                                      />
                                    );
                                  const isHovered =
                                    hoveredCell?.i === i &&
                                    hoveredCell?.j === j;
                                  let bg = "#dcfce7";
                                  let label = "✓ OK";
                                  let textColor = "#15803d";
                                  if (cell.status === "self") {
                                    bg = "#f1f5f9";
                                    label = "—";
                                    textColor = "#94a3b8";
                                  } else if (cell.status === "incompatible") {
                                    bg = "#fee2e2";
                                    label = "✗ Risk";
                                    textColor = "#dc2626";
                                  } else if (cell.status === "caution") {
                                    bg = "#fef9c3";
                                    label = "⚠ Caution";
                                    textColor = "#ca8a04";
                                  }
                                  return (
                                    <td
                                      key={ing2.id}
                                      className="p-2 text-center border border-border cursor-pointer transition-opacity"
                                      style={{
                                        backgroundColor: bg,
                                        opacity: isHovered ? 0.75 : 1,
                                      }}
                                      onClick={() =>
                                        cell.status !== "self"
                                          ? setHoveredCell(
                                              hoveredCell?.i === i &&
                                                hoveredCell?.j === j
                                                ? null
                                                : { i, j, reason: cell.reason },
                                            )
                                          : undefined
                                      }
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" &&
                                          cell.status !== "self"
                                        ) {
                                          setHoveredCell(
                                            hoveredCell?.i === i &&
                                              hoveredCell?.j === j
                                              ? null
                                              : { i, j, reason: cell.reason },
                                          );
                                        }
                                      }}
                                      tabIndex={
                                        cell.status !== "self" ? 0 : undefined
                                      }
                                    >
                                      <span
                                        className="text-[11px] font-semibold"
                                        style={{ color: textColor }}
                                      >
                                        {label}
                                      </span>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {hoveredCell && (
                        <div className="rounded-xl border border-border bg-card p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-400" />
                            <div>
                              <p className="text-xs font-semibold text-foreground mb-1">
                                {ingredients[hoveredCell.i]?.name} ↔{" "}
                                {ingredients[hoveredCell.j]?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {hoveredCell.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {/* ── STEP 5: Summary ─────────────────────────────────── */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Composition Summary
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Overview of formulation quality and compliance
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Weight",
                    value: `${totalWeight.toFixed(2)} mg`,
                    color: "text-primary",
                  },
                  {
                    label: "API Load",
                    value: `${apiLoad.toFixed(1)}%`,
                    color: apiLoad > 50 ? "text-yellow-400" : "text-green-400",
                  },
                  {
                    label: "Total Ingredients",
                    value: ingredients.length.toString(),
                    color: "text-accent-foreground",
                  },
                  {
                    label: "Compatibility",
                    value: `${compatibilityScore}/100`,
                    color:
                      compatibilityScore >= 80
                        ? "text-green-400"
                        : compatibilityScore >= 60
                          ? "text-yellow-400"
                          : "text-red-400",
                  },
                ].map((stat) => (
                  <Card key={stat.label} className="border-border glass-card">
                    <CardContent className="pt-5 text-center">
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Per-API dose table */}
              {apiIngredients.length > 0 && (
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      API Dose Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground border-b border-border">
                          <th className="text-left py-1">API</th>
                          <th className="text-left py-1">Qty/dose</th>
                          <th className="text-left py-1">% of total</th>
                          <th className="text-left py-1">Pharmacopeia</th>
                          <th className="text-left py-1">Assay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiIngredients.map((ing) => {
                          const api = ing.source as APIIngredient;
                          return (
                            <tr
                              key={ing.id}
                              className="border-b border-border last:border-0"
                            >
                              <td className="py-1.5 text-foreground">
                                {ing.name}
                              </td>
                              <td className="py-1.5 text-primary">
                                {ing.quantity} {ing.unit}
                              </td>
                              <td className="py-1.5 text-muted-foreground">
                                {totalWeight > 0
                                  ? (
                                      (ing.quantity / totalWeight) *
                                      100
                                    ).toFixed(1)
                                  : 0}
                                %
                              </td>
                              <td className="py-1.5 text-muted-foreground">
                                {api?.source ?? "—"}
                              </td>
                              <td className="py-1.5 text-muted-foreground">
                                {api?.assayMin}–{api?.assayMax}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {/* Advanced Stability Cards 2x2 */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-primary" /> Predictive
                  Stability Assessment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Physical Stability */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-blue-400" />{" "}
                        Physical Stability
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      {[
                        {
                          label: "Hygroscopic Ingredients",
                          count: advancedStability.hygroscopicCount,
                          tip:
                            advancedStability.hygroscopicCount > 1
                              ? "Store in airtight container away from moisture"
                              : null,
                        },
                        {
                          label: "Thermolabile Ingredients",
                          count: advancedStability.thermolabileCount,
                          tip:
                            advancedStability.thermolabileCount > 0
                              ? "Store below 25°C"
                              : null,
                        },
                        {
                          label: "Light-Sensitive Ingredients",
                          count: advancedStability.lightSensitiveCount,
                          tip:
                            advancedStability.lightSensitiveCount > 0
                              ? "Use amber/opaque packaging"
                              : null,
                        },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {row.label}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${row.count > 2 ? "border-red-500/40 text-red-400" : row.count > 0 ? "border-yellow-500/40 text-yellow-400" : "border-green-500/40 text-green-400"}`}
                            >
                              {row.count} detected
                            </Badge>
                          </div>
                          {row.tip && (
                            <p className="text-[10px] text-yellow-400 mt-0.5">
                              → {row.tip}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Card 2: Chemical Stability */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" /> Chemical
                        Stability
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Oxidation Risk
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${advancedStability.oxidationRisk > 1 ? "border-red-500/40 text-red-400" : advancedStability.oxidationRisk > 0 ? "border-yellow-500/40 text-yellow-400" : "border-green-500/40 text-green-400"}`}
                        >
                          {advancedStability.oxidationRisk} ingredient(s)
                        </Badge>
                      </div>
                      {advancedStability.oxidationRisk > 1 && (
                        <p className="text-[10px] text-yellow-400">
                          → Add antioxidant; use nitrogen purge packaging
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Hydrolysis Risk
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${advancedStability.hydrolysisRisk > 1 ? "border-red-500/40 text-red-400" : advancedStability.hydrolysisRisk > 0 ? "border-yellow-500/40 text-yellow-400" : "border-green-500/40 text-green-400"}`}
                        >
                          {advancedStability.hydrolysisRisk} ingredient(s)
                        </Badge>
                      </div>
                      {advancedStability.hydrolysisRisk > 1 && (
                        <p className="text-[10px] text-yellow-400">
                          → Control moisture; use desiccants
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          pH Compatibility
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${advancedStability.phCompatible ? "border-green-500/40 text-green-400" : "border-red-500/40 text-red-400"}`}
                        >
                          {advancedStability.phCompatible
                            ? `Compatible pH ${advancedStability.phMin.toFixed(1)}–${advancedStability.phMax.toFixed(1)}`
                            : "⚠ Incompatible pH ranges"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3: Predicted Shelf Life */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" /> Predicted
                        Shelf Life
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-2">
                      <p
                        className={`text-4xl font-bold ${advancedStability.shelfLifeMonths >= 30 ? "text-green-400" : advancedStability.shelfLifeMonths >= 18 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {advancedStability.shelfLifeMonths}
                      </p>
                      <p className="text-xs font-semibold text-muted-foreground mt-1">
                        months
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        at 25°C / 60% RH (ICH Q1A)
                      </p>
                      <div className="text-[10px] text-left mt-3 space-y-1 text-muted-foreground">
                        {advancedStability.hygroscopicCount > 2 && (
                          <p>• High moisture sensitivity reduces shelf life</p>
                        )}
                        {advancedStability.thermolabileCount > 0 && (
                          <p>• Thermolabile components require cold chain</p>
                        )}
                        {advancedStability.oxidationRisk > 1 && (
                          <p>
                            • Multiple oxidation-prone APIs shorten stability
                          </p>
                        )}
                        {advancedStability.hydrolysisRisk > 1 && (
                          <p>• Hydrolysis risk under humid conditions</p>
                        )}
                        {!advancedStability.phCompatible && (
                          <p>• pH conflict significantly reduces stability</p>
                        )}
                        {advancedStability.shelfLifeMonths >= 30 && (
                          <p>• No major stability concerns identified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 4: Stability Score */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" /> Overall
                        Stability Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-2">
                      <div className="relative w-24 h-24 mx-auto">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-full h-full -rotate-90"
                          aria-label="Stability score gauge"
                        >
                          <title>Stability Score</title>
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-muted/30"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            strokeWidth="12"
                            stroke={
                              advancedStability.stabilityScore >= 80
                                ? "#4ade80"
                                : advancedStability.stabilityScore >= 60
                                  ? "#facc15"
                                  : "#f87171"
                            }
                            strokeDasharray={`${advancedStability.stabilityScore * 2.513} 251.3`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className={`text-2xl font-bold ${advancedStability.stabilityScore >= 80 ? "text-green-400" : advancedStability.stabilityScore >= 60 ? "text-yellow-400" : "text-red-400"}`}
                          >
                            {advancedStability.stabilityScore}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-semibold mt-2 ${advancedStability.stabilityScore >= 80 ? "text-green-400" : advancedStability.stabilityScore >= 60 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {advancedStability.stabilityScore >= 80
                          ? "Excellent"
                          : advancedStability.stabilityScore >= 60
                            ? "Good"
                            : advancedStability.stabilityScore >= 40
                              ? "Moderate"
                              : "Poor"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        out of 100
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Composition Analysis */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> Composition
                    Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                      <p className="text-xs font-semibold text-green-400 mb-2">
                        ✓ Advantages
                      </p>
                      {compositionAnalysis.advantages.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          None identified
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {compositionAnalysis.advantages.map((adv) => (
                            <li
                              key={`adv-${adv.substring(0, 20)}`}
                              className="text-xs text-muted-foreground flex gap-2"
                            >
                              <span className="text-green-400 shrink-0">•</span>
                              {adv}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                      <p className="text-xs font-semibold text-red-400 mb-2">
                        ✗ Disadvantages / Risks
                      </p>
                      {compositionAnalysis.disadvantages.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          None identified
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {compositionAnalysis.disadvantages.map((dis) => (
                            <li
                              key={`dis-${dis.substring(0, 20)}`}
                              className="text-xs text-muted-foreground flex gap-2"
                            >
                              <span className="text-red-400 shrink-0">•</span>
                              {dis}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pharmacopeia Compliance */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Pharmacopeia Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {apiIngredients.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No APIs added yet.
                    </p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {apiIngredients.map((ing) => {
                        const api = ing.source as APIIngredient;
                        return (
                          <div
                            key={ing.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-muted-foreground">
                              {ing.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] border-primary/40 text-primary"
                            >
                              {api?.source ?? "Custom"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 6: SOP ─────────────────────────────────────── */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    SOP Generation
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Auto-generated Standard Operating Procedure
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-sm text-muted-foreground">
                    Scale:
                  </Label>
                  <Input
                    data-ocid="formulation.sop.scale_input"
                    type="number"
                    min={1}
                    max={10000}
                    value={scaleUp}
                    onChange={(e) =>
                      setScaleUp(Math.max(1, Number(e.target.value)))
                    }
                    className="w-24 h-8 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">units</span>
                </div>
              </div>

              <Card className="border-border">
                <CardContent className="pt-5">
                  <div className="font-mono text-xs text-foreground whitespace-pre-line leading-relaxed">
                    <div className="text-primary font-bold text-sm mb-1">
                      STANDARD OPERATING PROCEDURE
                    </div>
                    <div className="text-muted-foreground mb-4">
                      Formulation: {dosageForm} by {method}
                      {"\n"}
                      Date: {today}
                      {"\n"}
                      Scale: {scaleUp} unit{scaleUp > 1 ? "s" : ""}
                    </div>

                    <div className="text-accent-foreground font-semibold mb-2">
                      MATERIALS REQUIRED:
                    </div>
                    {ingredients.length === 0 ? (
                      <div className="text-muted-foreground italic mb-4">
                        [No ingredients added]
                      </div>
                    ) : (
                      <div className="mb-4">
                        {ingredients.map((ing) => (
                          <div key={ing.id} className="text-muted-foreground">
                            • {ing.name} — {(ing.quantity * scaleUp).toFixed(2)}{" "}
                            {ing.unit}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-accent-foreground font-semibold mb-2">
                      PROCEDURE:
                    </div>
                    {sopSteps.map((sopStep, i) => (
                      <div
                        key={sopStep.slice(0, 20)}
                        className="text-muted-foreground mb-1"
                      >
                        {i + 1}. {sopStep}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 7: Ownership ───────────────────────────────── */}
          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Ownership & Certification
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add ownership details to generate a professional certificate
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Formulation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Formulation Name</Label>
                      <Input
                        data-ocid="formulation.cert.name_input"
                        value={formulationName}
                        onChange={(e) => setFormulationName(e.target.value)}
                        placeholder={`${dosageForm} Formulation`}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Owner / Formulator Name</Label>
                      <Input
                        data-ocid="formulation.cert.owner_input"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Dr. Ravi Kumar"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Institution / Company</Label>
                      <Input
                        data-ocid="formulation.cert.institution_input"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="PharmaTech Laboratories Pvt. Ltd."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Designation</Label>
                      <Input
                        data-ocid="formulation.cert.designation_input"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="Senior Formulation Scientist"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Preview — Premium Design */}
                <div
                  className="rounded-xl border-4 border-yellow-600/60 p-1 relative"
                  data-ocid="formulation.cert.card"
                >
                  <div className="rounded-lg border-2 border-green-700/40 overflow-hidden">
                    {/* Corner ornaments */}
                    <span className="absolute top-3 left-3 text-yellow-600 text-lg font-bold select-none z-10">
                      ◆
                    </span>
                    <span className="absolute top-3 right-3 text-yellow-600 text-lg font-bold select-none z-10">
                      ◆
                    </span>
                    <span className="absolute bottom-3 left-3 text-yellow-600 text-lg font-bold select-none z-10">
                      ◆
                    </span>
                    <span className="absolute bottom-3 right-3 text-yellow-600 text-lg font-bold select-none z-10">
                      ◆
                    </span>

                    {/* Header band */}
                    <div
                      className="flex items-center justify-between px-6 py-4"
                      style={{
                        background: "linear-gradient(135deg, #14532d, #065f46)",
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🌿</span>
                          <span className="text-white font-bold text-lg tracking-wide">
                            AyurNexis 3.1
                          </span>
                        </div>
                        <p className="text-green-200 text-[10px] tracking-widest uppercase mt-0.5">
                          Formulation Excellence Certificate
                        </p>
                      </div>
                      {/* Seal */}
                      <div
                        className="flex-shrink-0 w-16 h-16 rounded-full border-4 border-yellow-400/60 flex flex-col items-center justify-center text-center"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <Shield className="w-5 h-5 text-yellow-300 mb-0.5" />
                        <span className="text-[8px] text-yellow-200 font-bold leading-tight">
                          VERIFIED
                        </span>
                        <span className="text-[7px] text-green-200 leading-tight">
                          QA CERTIFIED
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="bg-white px-8 py-6 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
                        This is to certify that
                      </p>
                      <p className="text-xl font-bold text-green-900 font-serif mb-1">
                        {ownerName || "[Formulator Name]"}
                      </p>
                      {designation && (
                        <p className="text-sm text-gray-600 italic mb-1">
                          {designation}
                        </p>
                      )}
                      {institution && (
                        <p className="text-xs text-gray-500 mb-4">
                          <span className="font-semibold text-gray-700">
                            {institution}
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        has successfully developed, validated, and documented
                        the following pharmaceutical formulation
                        <br />
                        using AyurNexis 3.1 AI-Enabled Ayurvedic QA Platform in
                        accordance with pharmacopoeial standards.
                      </p>

                      {/* Formulation box */}
                      <div className="border-2 border-green-700/30 rounded-lg p-4 mb-4 bg-green-50/50">
                        <p className="text-base font-bold text-green-800">
                          {formulationName || `${dosageForm} Formulation`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {dosageForm} · {method}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ingredients.length} Pharmaceutical-Grade Ingredients
                          · Stability: {advancedStability.stabilityScore}/100
                        </p>
                      </div>

                      {/* Signature row */}
                      <div className="flex items-end justify-between mt-6 gap-4">
                        <div className="flex-1 text-center">
                          <div className="h-px bg-gray-300 w-full mb-1" />
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            Formulator Signature
                          </p>
                          <p className="text-xs font-semibold text-gray-700 mt-0.5">
                            {ownerName || "—"}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-center">
                          <div
                            className="w-12 h-12 mx-auto rounded-full border-2 border-yellow-500/50 flex items-center justify-center mb-1"
                            style={{
                              background:
                                "linear-gradient(135deg, #fef9c3, #fde68a)",
                            }}
                          >
                            <span className="text-lg">🏅</span>
                          </div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="h-px bg-gray-300 w-full mb-1" />
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            QA Authority
                          </p>
                          <p className="text-xs font-semibold text-gray-700 mt-0.5">
                            AyurNexis QA Board
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400">
                        <span>Date: {today}</span>
                        <span className="font-mono">
                          Cert# AN-
                          {Date.now().toString(36).toUpperCase().slice(-8)}
                        </span>
                      </div>
                    </div>

                    {/* Footer tagline */}
                    <div
                      className="px-6 py-2 text-center"
                      style={{
                        background: "linear-gradient(135deg, #14532d, #065f46)",
                      }}
                    >
                      <p className="text-[9px] text-green-200 tracking-wide">
                        Powered by AyurNexis 3.1 — AI-Enabled Ayurvedic Quality
                        Assurance Platform
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 8: Export ──────────────────────────────────── */}
          {step === 8 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Export Formulation Report
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate a professional PDF report with full formulation
                  details, SOP, and certificate
                </p>
              </div>

              {/* Summary before export */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Dosage Form", value: dosageForm ?? "—" },
                  { label: "Method", value: method ?? "—" },
                  { label: "Ingredients", value: `${ingredients.length}` },
                  { label: "Scale", value: `${scaleUp}x` },
                ].map((s) => (
                  <Card key={s.label} className="border-border">
                    <CardContent className="pt-4 text-center">
                      <p className="text-base font-bold text-primary">
                        {s.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-border glass-card">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                      <Download className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        Ready to Export
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF includes: Formulation Report, Composition Table, API
                        Analysis, SOP{scaleUp > 1 ? ` (${scaleUp}x scale)` : ""}
                        , Certificate
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        data-ocid="formulation.export.primary_button"
                        size="lg"
                        onClick={handleExport}
                        disabled={exporting || ingredients.length === 0}
                        className="gap-2"
                      >
                        {exporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Download PDF Report
                          </>
                        )}
                      </Button>
                    </div>
                    {ingredients.length === 0 && (
                      <p
                        data-ocid="formulation.export.error_state"
                        className="text-xs text-red-400"
                      >
                        ⚠ No ingredients added. Go back to Step 3 to add
                        ingredients first.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Start new formulation */}
              <div className="text-center">
                <Button
                  data-ocid="formulation.new.button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setDosageForm(null);
                    setMethod(null);
                    setIngredients([]);
                    setScaleUp(1);
                    setOwnerName("");
                    setInstitution("");
                    setDesignation("");
                    setFormulationName("");
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Start New Formulation
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        {step > 1 && (
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
            <Button
              data-ocid="formulation.nav.back_button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            {step < 8 && (
              <Button
                data-ocid="formulation.nav.next_button"
                onClick={() => {
                  if (step === 7) {
                    try {
                      const record = {
                        id: `form-${Date.now()}`,
                        name: formulationName || `${dosageForm} Formulation`,
                        dosageForm,
                        method,
                        ingredients: ingredients.map((i) => ({
                          name: i.name,
                          category: i.category,
                          qty: i.quantity,
                          unit: i.unit,
                        })),
                        ingredientCount: ingredients.length,
                        ownerName,
                        institution,
                        designation,
                        scaleUp,
                        stabilityScore: advancedStability.stabilityScore,
                        shelfLife: advancedStability.shelfLifeMonths,
                        createdAt: new Date().toISOString(),
                        date: new Date().toISOString(),
                      };
                      const existing = JSON.parse(
                        localStorage.getItem("ayurnexis_formulations") || "[]",
                      );
                      existing.unshift(record);
                      localStorage.setItem(
                        "ayurnexis_formulations",
                        JSON.stringify(existing.slice(0, 100)),
                      );
                    } catch {
                      /* ignore */
                    }
                  }
                  setStep((s) => Math.min(8, s + 1));
                }}
                className="gap-2"
                disabled={
                  (step === 2 && !method) ||
                  (step === 3 && ingredients.length === 0)
                }
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Ingredient Library Drawer ──────────────────────────────────────── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          className="w-[420px] sm:w-[500px] p-0 flex flex-col bg-card border-border"
        >
          <SheetHeader className="px-5 py-4 border-b border-border">
            <SheetTitle className="text-foreground">
              Raw Material Library
            </SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              <Input
                data-ocid="formulation.drawer.search_input"
                value={drawerSearch}
                onChange={(e) => setDrawerSearch(e.target.value)}
                placeholder="Search ingredients..."
                className="h-8 text-sm"
              />
              <div className="flex items-center gap-1">
                <Input
                  data-ocid="formulation.drawer.qty_input"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  className="w-16 h-8 text-sm"
                  placeholder="50"
                  type="number"
                />
                <Select value={addUnit} onValueChange={setAddUnit}>
                  <SelectTrigger
                    data-ocid="formulation.drawer.unit_select"
                    className="w-16 h-8 text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["mg", "g", "mL", "%", "IU"].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetHeader>

          <Tabs
            defaultValue="apis"
            className="flex flex-col flex-1 overflow-hidden"
          >
            <TabsList className="mx-4 mt-3 shrink-0 flex flex-wrap h-auto gap-1">
              <TabsTrigger
                data-ocid="formulation.drawer.api_tab"
                value="apis"
                className="text-xs"
              >
                APIs
              </TabsTrigger>
              <TabsTrigger
                data-ocid="formulation.drawer.herbs_tab"
                value="herbs"
                className="text-xs"
              >
                Herbs
              </TabsTrigger>
              <TabsTrigger
                data-ocid="formulation.drawer.herb_extracts_tab"
                value="herb-extracts"
                className="text-xs"
              >
                Herb Extracts
              </TabsTrigger>
              {compatibleExcipients.map((cat) => (
                <TabsTrigger
                  key={cat}
                  data-ocid={`formulation.drawer.${cat}_tab`}
                  value={cat}
                  className="text-xs"
                >
                  {excipientCategoryLabels[cat]}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {/* APIs tab */}
              <TabsContent value="apis" className="h-full mt-0">
                <ScrollArea className="h-full px-4 py-3">
                  {apiDrugs
                    .filter(
                      (a) =>
                        !drawerSearch ||
                        a.name
                          .toLowerCase()
                          .includes(drawerSearch.toLowerCase()) ||
                        a.therapeuticCategory
                          .toLowerCase()
                          .includes(drawerSearch.toLowerCase()),
                    )
                    .map((api) => {
                      const alreadyAdded = ingredients.some(
                        (i) => i.id === `${api.id}_api`,
                      );
                      return (
                        <div
                          key={api.id}
                          className={`flex items-center justify-between py-2.5 px-3 rounded-lg mb-1.5 border transition-colors ${
                            alreadyAdded
                              ? "border-green-500/30 bg-green-500/5"
                              : "border-border hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {api.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {api.therapeuticCategory} · {api.source}
                            </p>
                          </div>
                          {alreadyAdded ? (
                            <Badge
                              variant="outline"
                              className="ml-2 text-[10px] border-green-500/40 text-green-400 shrink-0"
                            >
                              Added
                            </Badge>
                          ) : (
                            <Button
                              data-ocid="formulation.drawer.api_add_button"
                              size="sm"
                              variant="ghost"
                              onClick={() => addFromDrawer(api, "api")}
                              className="ml-2 h-7 px-2 shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </ScrollArea>
              </TabsContent>

              {/* Herbs tab */}
              <TabsContent value="herbs" className="h-full mt-0">
                <ScrollArea className="h-full px-4 py-3">
                  {pharmacopeiaData
                    .filter(
                      (h) =>
                        !drawerSearch ||
                        h.name
                          .toLowerCase()
                          .includes(drawerSearch.toLowerCase()) ||
                        h.latinName
                          .toLowerCase()
                          .includes(drawerSearch.toLowerCase()),
                    )
                    .map((herb) => {
                      const alreadyAdded = ingredients.some(
                        (i) => i.id === `herb_${herb.id}`,
                      );
                      return (
                        <div
                          key={herb.id}
                          className={`flex items-center justify-between py-2.5 px-3 rounded-lg mb-1.5 border transition-colors ${
                            alreadyAdded
                              ? "border-green-500/30 bg-green-500/5"
                              : "border-border hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {herb.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              <em>{herb.latinName}</em> &middot; {herb.part}{" "}
                              &middot; {herb.source}
                            </p>
                            {herb.parameters.activeMarker && (
                              <p className="text-[10px] text-primary/70">
                                Marker: {herb.parameters.activeMarker.compound}{" "}
                                &ge;{herb.parameters.activeMarker.min}%
                              </p>
                            )}
                          </div>
                          {alreadyAdded ? (
                            <Badge
                              variant="outline"
                              className="ml-2 text-[10px] border-green-500/40 text-green-600 shrink-0"
                            >
                              Added
                            </Badge>
                          ) : (
                            <Button
                              data-ocid="formulation.drawer.herb_add_button"
                              size="sm"
                              variant="ghost"
                              onClick={() => addHerbFromDrawer(herb)}
                              className="ml-2 h-7 px-2 shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </ScrollArea>
              </TabsContent>
              {/* Herb Extracts tab */}
              <TabsContent value="herb-extracts" className="h-full mt-0">
                <ScrollArea className="h-full px-4 py-3">
                  {/* Botanical Herb Extracts */}
                  <p className="text-[10px] font-semibold text-green-700 uppercase tracking-widest mb-2 mt-1">
                    🌿 Botanical Herb Extracts
                  </p>
                  {herbExtracts
                    .filter(
                      (h) =>
                        !drawerSearch ||
                        h.name
                          .toLowerCase()
                          .includes(drawerSearch.toLowerCase()) ||
                        h.therapeuticCategory
                          .toLowerCase()
                          .includes(drawerSearch.toLowerCase()),
                    )
                    .map((he) => {
                      const alreadyAdded = ingredients.some(
                        (i) => i.id === `${he.id}_api`,
                      );
                      return (
                        <div
                          key={he.id}
                          className={`flex items-center justify-between py-2.5 px-3 rounded-lg mb-1.5 border transition-colors ${
                            alreadyAdded
                              ? "border-green-500/30 bg-green-500/5"
                              : "border-border hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-sm font-medium text-foreground truncate">
                                {he.name}
                              </p>
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                                style={{
                                  background: "oklch(0.42 0.14 145 / 0.12)",
                                  color: "oklch(0.32 0.14 145)",
                                }}
                              >
                                Herb Extract
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {he.therapeuticCategory} · {he.source}
                            </p>
                            <p className="text-[10px] text-primary/70">
                              Assay: {he.assayMin}–{he.assayMax}%
                            </p>
                          </div>
                          {alreadyAdded ? (
                            <Badge
                              variant="outline"
                              className="ml-2 text-[10px] border-green-500/40 text-green-400 shrink-0"
                            >
                              Added
                            </Badge>
                          ) : (
                            <Button
                              data-ocid="formulation.drawer.herb_extract_add_button"
                              size="sm"
                              variant="ghost"
                              onClick={() => addFromDrawer(he, "api")}
                              className="ml-2 h-7 px-2 shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}

                  {/* Functional Excipients section */}
                  <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-widest mb-2 mt-4">
                    ⚗️ Functional Excipients
                  </p>
                  {extraExcipients
                    .filter(
                      (e) =>
                        !drawerSearch ||
                        e.name
                          .toLowerCase()
                          .includes(drawerSearch.toLowerCase()),
                    )
                    .map((exc) => {
                      const alreadyAdded = ingredients.some(
                        (i) => i.id === `${exc.id}_excipient`,
                      );
                      return (
                        <div
                          key={exc.id}
                          className={`flex items-center justify-between py-2.5 px-3 rounded-lg mb-1.5 border transition-colors ${
                            alreadyAdded
                              ? "border-blue-500/30 bg-blue-500/5"
                              : "border-border hover:border-blue-400/40 hover:bg-muted/30 cursor-pointer"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-sm font-medium text-foreground truncate">
                                {exc.name}
                              </p>
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                                style={{
                                  background: "oklch(0.55 0.14 240 / 0.12)",
                                  color: "oklch(0.40 0.14 240)",
                                }}
                              >
                                Excipient
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {exc.grade} · {exc.source}
                            </p>
                            <p className="text-[10px] text-blue-600/70">
                              {exc.typicalUse}
                            </p>
                          </div>
                          {alreadyAdded ? (
                            <Badge
                              variant="outline"
                              className="ml-2 text-[10px] border-blue-500/40 text-blue-400 shrink-0"
                            >
                              Added
                            </Badge>
                          ) : (
                            <Button
                              data-ocid="formulation.drawer.extra_excipient_add_button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const catMap: Record<
                                  string,
                                  "fillers" | "glidants" | "lubricants"
                                > = {
                                  "mcc-ph102-exc": "fillers",
                                  "silicon-dioxide-colloidal-exc": "glidants",
                                  "magnesium-stearate-exc": "lubricants",
                                };
                                const excCat = catMap[exc.id] ?? "lubricants";
                                setIngredients((prev) => [
                                  ...prev,
                                  {
                                    id: `${exc.id}_exc`,
                                    name: exc.name,
                                    category: excCat,
                                    quantity: Number.parseFloat(addQty) || 10,
                                    unit: addUnit,
                                  },
                                ]);
                                setDrawerOpen(false);
                              }}
                              className="ml-2 h-7 px-2 shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </ScrollArea>
              </TabsContent>
              {/* Excipient tabs */}
              {compatibleExcipients.map((cat) => (
                <TabsContent key={cat} value={cat} className="h-full mt-0">
                  <ScrollArea className="h-full px-4 py-3">
                    {(EXCIPIENT_DATA[cat] ?? [])
                      .filter(
                        (e) =>
                          !drawerSearch ||
                          e.name
                            .toLowerCase()
                            .includes(drawerSearch.toLowerCase()),
                      )
                      .map((excipient) => {
                        const alreadyAdded = ingredients.some(
                          (i) => i.id === `${excipient.id}_${cat}`,
                        );
                        return (
                          <div
                            key={excipient.id}
                            className={`flex items-center justify-between py-2.5 px-3 rounded-lg mb-1.5 border transition-colors ${
                              alreadyAdded
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-border hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {excipient.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {excipient.grade} · {excipient.source}
                              </p>
                            </div>
                            {alreadyAdded ? (
                              <Badge
                                variant="outline"
                                className="ml-2 text-[10px] border-green-500/40 text-green-400 shrink-0"
                              >
                                Added
                              </Badge>
                            ) : (
                              <Button
                                data-ocid={`formulation.drawer.${cat}_add_button`}
                                size="sm"
                                variant="ghost"
                                onClick={() => addFromDrawer(excipient, cat)}
                                className="ml-2 h-7 px-2 shrink-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>

          <div className="px-5 py-3 border-t border-border shrink-0">
            <Button
              data-ocid="formulation.drawer.close_button"
              className="w-full gap-2"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              <X className="w-4 h-4" /> Close Library
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

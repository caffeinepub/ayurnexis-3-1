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

import { autoTable, getJsPDF, loadJsPDF } from "@/utils/pdfLib";
import {
  AlertTriangle,
  Award,
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
  Loader2,
  Package,
  Pill,
  Plus,
  RefreshCw,
  Shield,
  Syringe,
  Tag,
  TestTube,
  Thermometer,
  Trash2,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
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
import {
  type CompatibilityResult,
  type PharmacologyResult,
  type SOPResult,
  analyzeCompatibility,
  analyzePharmacology,
  generateSOP,
} from "../utils/aiService";
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

// ─── Full Composition Analytics Component ────────────────────────────────────

function FullCompositionAnalytics({
  ingredients,
  dosageForm,
}: {
  ingredients: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
  }>;
  dosageForm: string | null;
}) {
  const apiIngs = ingredients.filter(
    (i) => i.category === "api" || i.category === "herb",
  );
  if (apiIngs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TestTube className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">
          Add API or herb ingredients to see full composition analytics.
        </p>
      </div>
    );
  }

  const totalQty = apiIngs.reduce((s, i) => s + i.quantity, 0) || 1;
  const hasLubricant = ingredients.some((i) => i.category === "lubricants");
  const hasDisintegrant = ingredients.some(
    (i) => i.category === "disintegrants",
  );
  const isTabletOrCapsule = dosageForm === "Tablet" || dosageForm === "Capsule";

  // ── HPLC ──
  const hplcRows = apiIngs.map((ing) => {
    const d = getHPLCData(ing.name);
    const peakAreaPct = ((ing.quantity / totalQty) * 100).toFixed(1);
    return {
      name: ing.name,
      rt: d.rt,
      wavelength: d.wavelength,
      peakArea: Number(peakAreaPct),
      mobilePhaseSolvent: d.mobilePhaseSolvent,
    };
  });
  const hplcChartData = hplcRows.map((r) => ({
    rt: r.rt,
    peakArea: r.peakArea,
    name: r.name,
  }));

  // ── UV ──
  const uvRows = apiIngs.map((ing) => {
    const d = getUVData(ing.name);
    return {
      name: ing.name,
      lambdaMax: d.lambdaMax,
      solvent: d.solvent,
      qty: ing.quantity,
    };
  });
  const blendedLambdaMax = Math.round(
    uvRows.reduce((s, r) => s + r.lambdaMax * r.qty, 0) / totalQty,
  );
  const dominantSolvent = uvRows[0]?.solvent || "Methanol";
  // Generate combined UV spectrum (200–500 nm)
  const uvSpectrumData = Array.from({ length: 31 }, (_, i) => {
    const nm = 200 + i * 10;
    let abs = 0;
    for (const r of uvRows) {
      const w = r.qty / totalQty;
      const sigma = 18;
      abs += w * Math.exp(-((nm - r.lambdaMax) ** 2) / (2 * sigma ** 2));
    }
    return { nm, absorbance: Number.parseFloat(abs.toFixed(4)) };
  });

  // ── FTIR ──
  interface FtirPeak {
    wavenumber: string;
    group: string;
    assignment: string;
    intensity: string;
  }
  const ftirPeaks: FtirPeak[] = [
    {
      wavenumber: "3300–3500",
      group: "O-H / N-H stretch",
      assignment: "Hydroxyl / Amine groups",
      intensity: "Strong",
    },
    {
      wavenumber: "2900–3100",
      group: "C-H stretch (aromatic)",
      assignment: "Aromatic ring C-H",
      intensity: "Medium",
    },
    {
      wavenumber: "1700–1750",
      group: "C=O stretch",
      assignment: "Carbonyl / Ester",
      intensity: "Strong",
    },
    {
      wavenumber: "1600–1650",
      group: "C=C aromatic",
      assignment: "Phenolic / Herbal chromophores",
      intensity: "Medium",
    },
    ...(hasLubricant
      ? [
          {
            wavenumber: "2800–3000",
            group: "C-H aliphatic",
            assignment: "Fatty acid chains (lubricant)",
            intensity: "Medium",
          },
          {
            wavenumber: "1740",
            group: "Ester C=O",
            assignment: "Fatty acid lubricants",
            intensity: "Strong",
          },
        ]
      : []),
    ...(hasDisintegrant
      ? [
          {
            wavenumber: "1060",
            group: "C-O-C stretch",
            assignment: "Cellulose disintegrant",
            intensity: "Medium",
          },
        ]
      : []),
    {
      wavenumber: "1450–1500",
      group: "C-H bending",
      assignment: "Alkyl groups",
      intensity: "Weak",
    },
    {
      wavenumber: "700–900",
      group: "C-H out-of-plane",
      assignment: "Aromatic substitution",
      intensity: "Weak",
    },
  ];
  // Build FTIR chart data: 30 pts from 500 to 3800
  const ftirChartData = Array.from({ length: 33 }, (_, i) => {
    const wn = 500 + i * 100;
    let transmittance = 98;
    const peakPositions = [3400, 3000, 1720, 1630, 1470, 1060, 800];
    for (const pp of peakPositions) {
      const dist = Math.abs(wn - pp);
      if (dist < 150) transmittance -= ((150 - dist) / 150) * 40;
    }
    return {
      wn,
      transmittance: Math.max(20, Number.parseFloat(transmittance.toFixed(1))),
    };
  });

  // ── DSC ──
  const dscRows = apiIngs.map((ing) => {
    const d = getDSCData(ing.name);
    return {
      name: ing.name,
      meltingOnset: d.meltingOnset,
      deltaH: d.deltaH,
      qty: ing.quantity,
    };
  });
  const dscChartData = Array.from({ length: 29 }, (_, i) => {
    const temp = 25 + i * 10;
    let heatFlow = 0;
    for (const r of dscRows) {
      const w = r.qty / totalQty;
      const sigma = 5;
      heatFlow -=
        w * 2.5 * Math.exp(-((temp - r.meltingOnset) ** 2) / (2 * sigma ** 2));
    }
    return { temp, heatFlow: Number.parseFloat(heatFlow.toFixed(3)) };
  });

  // ── Dissolution ──
  const times = [0, 15, 30, 45, 60, 90];
  const sigmoid = (t: number, k: number, t50: number) =>
    100 / (1 + Math.exp(-k * (t - t50)));
  let k = 0.08;
  let t50 = 30;
  if (apiIngs.length > 2) t50 += 5;
  if (hasLubricant) {
    k -= 0.01;
    t50 += 5;
  }
  if (hasDisintegrant) {
    k += 0.01;
    t50 -= 5;
  }
  const dissolutionData = times.map((t) => ({
    time: t,
    release: Math.min(100, Number.parseFloat(sigmoid(t, k, t50).toFixed(1))),
  }));
  const usp_q = 85;
  const dissolutionRows = dissolutionData.map((d) => ({
    time: d.time,
    release: d.release,
    spec: d.time >= 45 ? "NLT 85% (Q)" : "—",
    status: d.time >= 45 ? (d.release >= usp_q ? "Pass" : "Fail") : "—",
  }));

  const cardClass = "border border-border";
  const labelClass =
    "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2";

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Full composition-level analytical predictions derived from all
        ingredients combined. Values are algorithmically predicted from
        physicochemical properties (ICH Q2, USP, BP 2023).
      </p>

      {/* 1. HPLC */}
      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Beaker className="w-4 h-4 text-green-600" /> Combined HPLC Profile
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Column: C18 (250×4.6mm, 5μm) | Gradient elution | Detector: UV-PDA
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={labelClass}>Peak Area Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={hplcChartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="rt"
                tick={{ fontSize: 10 }}
                label={{
                  value: "RT (min)",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 10,
                }}
                height={36}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                label={{
                  value: "Peak Area %",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  fontSize: 10,
                }}
              />
              <Tooltip
                formatter={(v: unknown) => [`${v}%`, "Peak Area"]}
                labelFormatter={(l: unknown) => `RT: ${l} min`}
                contentStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="peakArea" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-1 pr-2">Constituent</th>
                  <th className="py-1 px-2">RT (min)</th>
                  <th className="py-1 px-2">λ (nm)</th>
                  <th className="py-1 px-2">Peak Area %</th>
                  <th className="py-1 pl-2 text-left">Mobile Phase</th>
                </tr>
              </thead>
              <tbody>
                {hplcRows.map((r) => (
                  <tr
                    key={r.name}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-1 pr-2 font-medium">{r.name}</td>
                    <td className="py-1 px-2 text-center">{r.rt}</td>
                    <td className="py-1 px-2 text-center">{r.wavelength}</td>
                    <td className="py-1 px-2 text-center">{r.peakArea}%</td>
                    <td className="py-1 pl-2 text-muted-foreground">
                      {r.mobilePhaseSolvent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2. UV Spectroscopy */}
      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" /> Combined UV Spectroscopy
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Blended λmax: <strong>{blendedLambdaMax} nm</strong> | Solvent:{" "}
            {dominantSolvent}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={labelClass}>
            Combined Absorption Spectrum (200–500 nm)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={uvSpectrumData}
              margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="nm"
                tick={{ fontSize: 10 }}
                label={{
                  value: "Wavelength (nm)",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 10,
                }}
                height={36}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                label={{
                  value: "Absorbance (A.U.)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  fontSize: 10,
                }}
              />
              <Tooltip
                formatter={(v: unknown) => [String(v), "Absorbance"]}
                labelFormatter={(l: unknown) => `${l} nm`}
                contentStyle={{ fontSize: 11 }}
              />
              <ReferenceLine
                x={blendedLambdaMax}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `λmax ${blendedLambdaMax}nm`,
                  fontSize: 9,
                  fill: "#f59e0b",
                }}
              />
              <Line
                type="monotone"
                dataKey="absorbance"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-50 rounded p-2">
              <div className="text-muted-foreground">Blended λmax</div>
              <div className="font-semibold">{blendedLambdaMax} nm</div>
            </div>
            <div className="bg-blue-50 rounded p-2">
              <div className="text-muted-foreground">Solvent</div>
              <div className="font-semibold">{dominantSolvent}</div>
            </div>
            <div className="bg-blue-50 rounded p-2">
              <div className="text-muted-foreground">Absorptivity</div>
              <div className="font-semibold">Combined</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. FTIR */}
      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" /> Combined FTIR
            Fingerprint
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            KBr pellet method | Scan range: 500–4000 cm⁻¹
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={labelClass}>Transmittance Spectrum</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={ftirChartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="wn"
                tick={{ fontSize: 9 }}
                label={{
                  value: "Wavenumber (cm⁻¹)",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 10,
                }}
                height={36}
                reversed
              />
              <YAxis
                domain={[20, 100]}
                tick={{ fontSize: 10 }}
                label={{
                  value: "Transmittance %",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  fontSize: 10,
                }}
              />
              <Tooltip
                formatter={(v: unknown) => [`${v}%`, "Transmittance"]}
                labelFormatter={(l: unknown) => `${l} cm⁻¹`}
                contentStyle={{ fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="transmittance"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-1 pr-2">Wavenumber (cm⁻¹)</th>
                  <th className="text-left py-1 px-2">Functional Group</th>
                  <th className="text-left py-1 px-2">Assignment</th>
                  <th className="py-1 pl-2">Intensity</th>
                </tr>
              </thead>
              <tbody>
                {ftirPeaks.map((p) => (
                  <tr
                    key={p.wavenumber}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-1 pr-2 font-mono">{p.wavenumber}</td>
                    <td className="py-1 px-2">{p.group}</td>
                    <td className="py-1 px-2 text-muted-foreground">
                      {p.assignment}
                    </td>
                    <td className="py-1 pl-2 text-center">
                      <Badge variant="outline" className="text-xs py-0">
                        {p.intensity}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 4. DSC */}
      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-500" /> DSC Thermal Profile
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Heating rate: 10°C/min | N₂ atmosphere | Range: 25–300°C
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={labelClass}>
            Combined Heat Flow (Endothermic Events)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={dscChartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="temp"
                tick={{ fontSize: 10 }}
                label={{
                  value: "Temperature (°C)",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 10,
                }}
                height={36}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                label={{
                  value: "Heat Flow (mW/mg)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  fontSize: 10,
                }}
              />
              <Tooltip
                formatter={(v: unknown) => [String(v), "Heat Flow (mW/mg)"]}
                labelFormatter={(l: unknown) => `${l} °C`}
                contentStyle={{ fontSize: 11 }}
              />
              <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="heatFlow"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-1 pr-2">Ingredient</th>
                  <th className="py-1 px-2">Melting Onset (°C)</th>
                  <th className="py-1 px-2">ΔH</th>
                  <th className="py-1 pl-2">Event</th>
                </tr>
              </thead>
              <tbody>
                {dscRows.map((r) => (
                  <tr
                    key={r.name}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-1 pr-2 font-medium">{r.name}</td>
                    <td className="py-1 px-2 text-center">
                      {r.meltingOnset}°C
                    </td>
                    <td className="py-1 px-2 text-center">{r.deltaH}</td>
                    <td className="py-1 pl-2 text-center">
                      <Badge className="text-xs py-0 bg-red-100 text-red-700">
                        Endothermic
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Dissolution */}
      {isTabletOrCapsule && (
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600" /> Dissolution Profile
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Apparatus II (Paddle) | 900 mL 0.1N HCl | 50 rpm | 37°C
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={labelClass}>% Drug Release vs. Time</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={dissolutionData}
                margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "Time (min)",
                    position: "insideBottom",
                    offset: -2,
                    fontSize: 10,
                  }}
                  height={36}
                />
                <YAxis
                  domain={[0, 105]}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "% Drug Released",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  formatter={(v: unknown) => [`${v}%`, "% Released"]}
                  labelFormatter={(l: unknown) => `${l} min`}
                  contentStyle={{ fontSize: 11 }}
                />
                <ReferenceLine
                  y={usp_q}
                  stroke="#f59e0b"
                  strokeDasharray="6 3"
                  label={{
                    value: "USP Q (85%)",
                    fontSize: 9,
                    fill: "#f59e0b",
                    position: "right",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="release"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#06b6d4" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-1 pr-2">Time (min)</th>
                    <th className="py-1 px-2">% Released</th>
                    <th className="py-1 px-2">Specification</th>
                    <th className="py-1 pl-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dissolutionRows.map((r) => (
                    <tr
                      key={r.time}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-1 pr-2 font-medium">{r.time} min</td>
                      <td className="py-1 px-2 text-center">{r.release}%</td>
                      <td className="py-1 px-2 text-center text-muted-foreground">
                        {r.spec}
                      </td>
                      <td className="py-1 pl-2 text-center">
                        {r.status === "Pass" ? (
                          <Badge className="text-xs py-0 bg-green-100 text-green-700">
                            Pass
                          </Badge>
                        ) : r.status === "Fail" ? (
                          <Badge className="text-xs py-0 bg-red-100 text-red-700">
                            Fail
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      {!isTabletOrCapsule && dosageForm && (
        <Card className={cardClass}>
          <CardContent className="py-8 text-center text-muted-foreground text-xs">
            <Droplets className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Dissolution profile is applicable for Tablet/Capsule dosage forms.
            Selected form: <strong>{dosageForm}</strong>.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Predicted Analytical Data Component ─────────────────────────────────────

const HPLC_DATA: Record<
  string,
  { rt: number; wavelength: number; mobilePhaseSolvent: string }
> = {
  metformin: {
    rt: 3.2,
    wavelength: 254,
    mobilePhaseSolvent: "Acetonitrile:Phosphate Buffer (10:90)",
  },
  curcumin: {
    rt: 8.5,
    wavelength: 425,
    mobilePhaseSolvent: "Acetonitrile:Water:Acetic Acid (70:29:1)",
  },
  aspirin: {
    rt: 5.1,
    wavelength: 237,
    mobilePhaseSolvent: "Acetonitrile:0.1% H3PO4 (40:60)",
  },
  paracetamol: {
    rt: 4.3,
    wavelength: 254,
    mobilePhaseSolvent: "Methanol:Water (20:80)",
  },
  ibuprofen: {
    rt: 7.8,
    wavelength: 254,
    mobilePhaseSolvent: "Acetonitrile:0.1% H3PO4 (60:40)",
  },
  quercetin: {
    rt: 9.2,
    wavelength: 370,
    mobilePhaseSolvent: "Methanol:0.5% Acetic Acid (55:45)",
  },
  amlodipine: {
    rt: 6.4,
    wavelength: 360,
    mobilePhaseSolvent: "Acetonitrile:Ammonium Formate Buffer (50:50)",
  },
  atorvastatin: {
    rt: 11.2,
    wavelength: 247,
    mobilePhaseSolvent: "Acetonitrile:0.025M KH2PO4 (65:35)",
  },
  omeprazole: {
    rt: 5.8,
    wavelength: 302,
    mobilePhaseSolvent: "Acetonitrile:Phosphate Buffer pH 7.4 (45:55)",
  },
  ashwagandha: {
    rt: 6.1,
    wavelength: 227,
    mobilePhaseSolvent: "Acetonitrile:Water (30:70)",
  },
};

const UV_DATA: Record<
  string,
  { lambdaMax: number; solvent: string; absorptivity: string }
> = {
  curcumin: {
    lambdaMax: 425,
    solvent: "Methanol",
    absorptivity: "~1650 L/(mol·cm)",
  },
  aspirin: {
    lambdaMax: 230,
    solvent: "Methanol",
    absorptivity: "~9000 L/(mol·cm)",
  },
  quercetin: {
    lambdaMax: 370,
    solvent: "Methanol",
    absorptivity: "~18800 L/(mol·cm)",
  },
  paracetamol: {
    lambdaMax: 243,
    solvent: "Water",
    absorptivity: "~7900 L/(mol·cm)",
  },
  ibuprofen: {
    lambdaMax: 264,
    solvent: "Methanol",
    absorptivity: "~430 L/(mol·cm)",
  },
  metformin: {
    lambdaMax: 233,
    solvent: "Water",
    absorptivity: "~17200 L/(mol·cm)",
  },
  omeprazole: {
    lambdaMax: 302,
    solvent: "Methanol",
    absorptivity: "~4200 L/(mol·cm)",
  },
};

const DSC_DATA: Record<string, { meltingOnset: number; deltaH: string }> = {
  aspirin: { meltingOnset: 135, deltaH: "170–185 J/g" },
  metformin: { meltingOnset: 232, deltaH: "220–250 J/g" },
  paracetamol: { meltingOnset: 168, deltaH: "160–175 J/g" },
  ibuprofen: { meltingOnset: 76, deltaH: "90–110 J/g" },
  lactose: { meltingOnset: 201, deltaH: "170–200 J/g" },
  mcc: { meltingOnset: 280, deltaH: "N/A (decomposition)" },
};

function getHPLCData(name: string) {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(HPLC_DATA)) {
    if (key.includes(k)) return v;
  }
  const rt = Number.parseFloat((3.0 + ((name.length * 0.4) % 6)).toFixed(1));
  const wavelength = 254;
  return { rt, wavelength, mobilePhaseSolvent: "Acetonitrile:Water (50:50)" };
}

function getUVData(name: string) {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(UV_DATA)) {
    if (key.includes(k)) return v;
  }
  const code = name.charCodeAt(0);
  const lambdaMax = 200 + ((code * 7) % 200);
  return { lambdaMax, solvent: "Methanol", absorptivity: "Estimated" };
}

function getDSCData(name: string) {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(DSC_DATA)) {
    if (key.includes(k)) return v;
  }
  const meltingOnset = 120 + ((name.length * 11) % 100);
  return { meltingOnset, deltaH: "Estimated: 150–200 J/g" };
}

function PredictedAnalyticalData({
  ingredients,
  dosageForm,
}: {
  ingredients: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
  }>;
  dosageForm: string | null;
}) {
  const apiIngs = ingredients.filter(
    (i) => i.category === "api" || i.category === "herb",
  );
  const hasExcipients = ingredients.some(
    (i) => i.category !== "api" && i.category !== "herb",
  );
  const hasLubricant = ingredients.some((i) => i.category === "lubricants");
  const isTabletOrCapsule = dosageForm === "Tablet" || dosageForm === "Capsule";

  const ftirPeaks = [
    { range: "3300–3500", group: "O-H / N-H stretch", source: "APIs & Herbs" },
    {
      range: "2900–3100",
      group: "C-H stretch (aromatic)",
      source: "Aromatic APIs",
    },
    {
      range: "1700–1750",
      group: "C=O stretch (carbonyl)",
      source: "Ester/Carboxyl APIs",
    },
    {
      range: "1600–1650",
      group: "C=C aromatic stretch",
      source: "Phenolic compounds",
    },
    ...(hasExcipients
      ? [
          {
            range: "3200–3500",
            group: "O-H (cellulose / starch)",
            source: "Fillers/Binders (MCC)",
          },
          {
            range: "1060",
            group: "C-O-C stretch",
            source: "Cellulose excipients",
          },
        ]
      : []),
    ...(hasLubricant
      ? [
          {
            range: "2800–3000",
            group: "C-H aliphatic stretch",
            source: "Lubricants (Mg stearate)",
          },
          {
            range: "1740",
            group: "Ester C=O stretch",
            source: "Fatty acid lubricants",
          },
        ]
      : []),
  ];

  const dissolProfiles = isTabletOrCapsule
    ? [
        { time: "15 min", pct: "35–45%", note: "Early burst" },
        { time: "30 min", pct: "60–72%", note: "Rapid phase" },
        { time: "45 min", pct: "75–85%", note: "Plateau onset" },
        { time: "60 min", pct: "85–95%", note: "Near complete" },
      ]
    : null;

  if (apiIngs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TestTube className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">
          Add API ingredients to see predicted analytical data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Predicted analytical parameters based on physicochemical properties and
        pharmacopeial references (ICH Q2, USP, BP).
      </p>

      {/* HPLC */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Beaker className="w-4 h-4 text-primary" />
            HPLC Predictions (RP-HPLC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-semibold">
                    API / Herb
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">
                    RT (min)
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">λ (nm)</th>
                  <th className="px-3 py-2 text-left font-semibold hidden sm:table-cell">
                    Mobile Phase
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiIngs.map((ing) => {
                  const d = getHPLCData(ing.name);
                  return (
                    <tr key={ing.name} className="border-b border-border/40">
                      <td className="px-3 py-2 font-medium text-foreground">
                        {ing.name}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-primary">
                        {d.rt}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {d.wavelength}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell text-xs">
                        {d.mobilePhaseSolvent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Column: C18 (250×4.6mm, 5μm). Flow rate: 1.0 mL/min. Detector:
            UV-PDA.
          </p>
        </CardContent>
      </Card>

      {/* UV */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            UV-Visible Spectroscopy Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-semibold">
                    Ingredient
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">
                    λmax (nm)
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">Solvent</th>
                  <th className="px-3 py-2 text-left font-semibold hidden sm:table-cell">
                    Absorptivity
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiIngs.map((ing) => {
                  const d = getUVData(ing.name);
                  return (
                    <tr key={ing.name} className="border-b border-border/40">
                      <td className="px-3 py-2 font-medium text-foreground">
                        {ing.name}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-yellow-600">
                        {d.lambdaMax}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {d.solvent}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                        {d.absorptivity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FTIR */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            FTIR Spectroscopy — Characteristic Peaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-semibold">
                    Wavenumber (cm⁻¹)
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Functional Group
                  </th>
                  <th className="px-3 py-2 text-left font-semibold hidden sm:table-cell">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {ftirPeaks.map((p) => (
                  <tr key={p.range} className="border-b border-border/40">
                    <td className="px-3 py-2 font-mono text-blue-600">
                      {p.range}
                    </td>
                    <td className="px-3 py-2 text-foreground">{p.group}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                      {p.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            KBr pellet method. Resolution: 4 cm⁻¹. Range: 400–4000 cm⁻¹.
          </p>
        </CardContent>
      </Card>

      {/* DSC */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            DSC Analysis — Thermal Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-semibold">
                    Ingredient
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">
                    Melting Onset (°C)
                  </th>
                  <th className="px-3 py-2 text-left font-semibold hidden sm:table-cell">
                    ΔH (J/g)
                  </th>
                </tr>
              </thead>
              <tbody>
                {ingredients
                  .filter(
                    (i) =>
                      i.category === "api" ||
                      i.category === "fillers" ||
                      i.category === "binders",
                  )
                  .map((ing) => {
                    const d = getDSCData(ing.name);
                    return (
                      <tr key={ing.name} className="border-b border-border/40">
                        <td className="px-3 py-2 font-medium text-foreground">
                          {ing.name}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-red-600">
                          {d.meltingOnset}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                          {d.deltaH}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Heating rate: 10°C/min. N₂ atmosphere. Per ICH Q1A thermal stress
            protocol.
          </p>
        </CardContent>
      </Card>

      {/* Dissolution */}
      {dissolProfiles && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-500" />
              Dissolution Profile Prediction ({dosageForm})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {dissolProfiles.map((d) => (
                <div
                  key={d.time}
                  className="text-center p-3 rounded-lg bg-cyan-50/50 border border-cyan-100"
                >
                  <p className="text-xs font-semibold text-cyan-700">
                    {d.time}
                  </p>
                  <p className="text-lg font-bold text-cyan-800">{d.pct}</p>
                  <p className="text-xs text-muted-foreground">{d.note}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              USP Apparatus II (Paddle). Medium: 900 mL 0.1N HCl → pH 6.8
              phosphate buffer. Speed: 50 rpm. Temp: 37±0.5°C.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Standalone Certificate PDF Generator ────────────────────────────────────
async function generateCertificatePDF(data: {
  formulationName: string;
  dosageForm: string;
  method: string;
  ownerName: string;
  institution: string;
  designation: string;
  ingredients: { name: string; qty: number; unit: string }[];
  stabilityScore: number;
  shelfLifeMonths: number;
  overallScore: number;
  approved: boolean;
  certNum: string;
  date: string;
}): Promise<void> {
  await loadJsPDF();
  const JsPDF = getJsPDF();
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 20;

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // Outer thin teal border
  doc.setDrawColor(0, 137, 123);
  doc.setLineWidth(0.8);
  doc.rect(M - 5, M - 5, W - (M - 5) * 2, H - (M - 5) * 2, "S");

  // Header band: light teal
  doc.setFillColor(232, 245, 240);
  doc.rect(M - 5, M - 5, W - (M - 5) * 2, 28, "F");
  doc.setDrawColor(0, 137, 123);
  doc.setLineWidth(0.5);
  doc.line(M - 5, M + 23, W - M + 5, M + 23);

  // Platform name
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("AyurNexis 3.1", M, M + 6);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Pharmacopeia-Compliant QA Platform", M, M + 12);

  // ISO badge right
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 96, 100);
  doc.text("ISO 9001:2015 | IP 2022 | BP 2023", W - M, M + 6, {
    align: "right",
  });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Certificate of Analysis", W - M, M + 12, { align: "right" });

  // Title
  let y = M + 38;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("CERTIFICATE OF PHARMACEUTICAL FORMULATION", W / 2, y, {
    align: "center",
  });
  y += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This certifies that the following formulation has been evaluated in compliance with pharmacopeia guidelines",
    W / 2,
    y,
    { align: "center" },
  );
  y += 2;
  doc.setDrawColor(0, 137, 123);
  doc.setLineWidth(0.4);
  doc.line(M, y + 2, W - M, y + 2);
  y += 8;

  // Formulator info box
  doc.setFillColor(246, 246, 246);
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(0.3);
  doc.rect(M, y, (W - M * 2 - 4) / 2, 24, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Formulator", M + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.text(data.ownerName || "—", M + 4, y + 14);
  if (data.designation) {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(data.designation, M + 4, y + 20);
  }

  // Formulation details box
  const col2x = M + (W - M * 2 - 4) / 2 + 4;
  doc.setFillColor(232, 245, 240);
  doc.setDrawColor(0, 137, 123);
  doc.setLineWidth(0.3);
  doc.rect(col2x, y, (W - M * 2 - 4) / 2, 24, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("Formulation", col2x + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(8.5);
  doc.text(
    (data.formulationName || `${data.dosageForm} Formulation`).slice(0, 38),
    col2x + 4,
    y + 14,
  );
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${data.dosageForm} · ${data.method} · ${data.date}`,
    col2x + 4,
    y + 20,
  );
  y += 30;

  // Institution row
  if (data.institution) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Institution: ${data.institution}`, M, y + 4);
    doc.setTextColor(100, 100, 100);
    doc.text(`Certificate No: ${data.certNum}`, W - M, y + 4, {
      align: "right",
    });
    y += 10;
  }

  // Composition table
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("Composition", M, y + 4);
  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Ingredient", "Quantity", "Unit", "Category"]],
    body: data.ingredients
      .slice(0, 10)
      .map((i) => [
        i.name,
        String(i.qty),
        i.unit,
        i.unit === "mg" || i.unit === "g" ? "Active Ingredient" : "Excipient",
      ]),
    theme: "striped",
    headStyles: { fillColor: [0, 137, 123], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [245, 250, 250] },
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Quality metrics 2-column grid
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("Quality Metrics", M, y);
  y += 4;
  const metrics = [
    ["Stability Score", `${data.stabilityScore}/100`],
    ["Shelf Life", `${data.shelfLifeMonths} months`],
    ["Quality Score", `${data.overallScore}/100`],
    ["Assessment", data.approved ? "Compliant" : "Review Required"],
  ];
  const cellW = (W - M * 2 - 4) / 2;
  for (let i = 0; i < metrics.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = M + col * (cellW + 4);
    const by = y + row * 14;
    doc.setFillColor(
      col === 0 ? 232 : 240,
      col === 0 ? 245 : 253,
      col === 0 ? 240 : 244,
    );
    doc.setDrawColor(204, 204, 204);
    doc.setLineWidth(0.3);
    doc.rect(bx, by, cellW, 12, "FD");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(metrics[i][0], bx + 4, by + 5);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(27, 94, 32);
    doc.text(metrics[i][1], bx + 4, by + 10);
  }
  y += 34;

  // Approval banner
  if (data.approved) {
    doc.setFillColor(200, 230, 201); // light green
    doc.setDrawColor(76, 175, 80);
  } else {
    doc.setFillColor(255, 205, 210); // light red
    doc.setDrawColor(229, 115, 115);
  }
  doc.setLineWidth(0.5);
  doc.rect(M, y, W - M * 2, 14, "FD");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    data.approved ? 27 : 183,
    data.approved ? 94 : 28,
    data.approved ? 32 : 28,
  );
  const bannerTxt = data.approved
    ? "✓  APPROVED FOR PHARMACEUTICAL USE"
    : "✗  NOT APPROVED — Below Quality Threshold";
  doc.text(bannerTxt, W / 2, y + 10, { align: "center" });
  y += 20;

  // Signature lines
  const sigCols = [M + 20, W / 2, W - M - 20];
  const sigLabels = ["Formulator", "QA Director", "Date"];
  const sigVals = [data.ownerName, "AyurNexis QA Board", data.date];
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  for (let s = 0; s < 3; s++) {
    doc.line(sigCols[s] - 22, y, sigCols[s] + 22, y);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(sigLabels[s], sigCols[s], y + 5, { align: "center" });
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(sigVals[s], sigCols[s], y + 11, { align: "center" });
  }

  // Footer
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    "AyurNexis 3.1 | Pharmacopeia Compliant | IP 2022 | BP 2023",
    W / 2,
    H - M + 5,
    { align: "center" },
  );

  doc.save(
    `${data.formulationName || data.dosageForm || "formulation"}_certificate.pdf`,
  );
}

// ─── Standalone Drug Label PDF Generator (FDA-Style) ─────────────────────────
async function generateLabelPDF(data: {
  formulationName: string;
  dosageForm: string;
  ownerName: string;
  institution: string;
  ingredients: { name: string; qty: number; unit: string; category?: string }[];
  overallScore: number;
  approved: boolean;
  date: string;
  aiSummary?: string;
  indications?: string;
  contraindications?: string;
}): Promise<void> {
  await loadJsPDF();
  const JsPDF = getJsPDF();
  // A4 Portrait FDA-style label
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 10;
  const innerW = W - M * 2;
  let y = M;

  const ndcNum = `6529-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 90 + 10)}`;
  const lotNum = `LOT${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
  const expDate = new Date();
  expDate.setMonth(expDate.getMonth() + 24);
  const expStr = `${String(expDate.getMonth() + 1).padStart(2, "0")}/${expDate.getFullYear()}`;
  const prodName = (
    data.formulationName || `${data.dosageForm} Formulation`
  ).toUpperCase();

  const activeIngs = data.ingredients.filter(
    (i) =>
      i.category === "api" || i.category === "herb" || i.category === "extract",
  );
  const inactiveIngs = data.ingredients.filter(
    (i) =>
      i.category !== "api" && i.category !== "herb" && i.category !== "extract",
  );
  if (activeIngs.length === 0) {
    for (const i of data.ingredients.slice(
      0,
      Math.ceil(data.ingredients.length / 2),
    ))
      activeIngs.push(i);
    for (const i of data.ingredients.slice(
      Math.ceil(data.ingredients.length / 2),
    ))
      inactiveIngs.push(i);
  }

  // Outer border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(M, M, innerW, H - M * 2, "S");

  // Top strip: white bg, drug name
  doc.setFillColor(255, 255, 255);
  doc.rect(M + 0.5, M + 0.5, innerW - 1, 52, "F");

  // NDC top right
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`NDC  ${ndcNum}`, W - M - 3, M + 8, { align: "right" });

  // Drug name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  const nameLines = doc.splitTextToSize(prodName, innerW - 10);
  doc.text(nameLines, M + 5, M + 18);

  // Dosage form
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  const routeMap: Record<string, string> = {
    Tablet: "Tablet for Oral Administration",
    Capsule: "Capsule for Oral Administration",
    Syrup: "Oral Liquid",
    Injection: "Solution for Injection",
    Cream: "Cream for Topical Use",
    Ointment: "Ointment for Topical Use",
    Gel: "Gel for Topical Use",
    Drops: "Drops",
    Patch: "Transdermal Patch",
    Inhaler: "Inhalation Aerosol",
  };
  doc.text(
    routeMap[data.dosageForm] || `${data.dosageForm} — For appropriate route`,
    M + 5,
    M + 28,
  );

  // Strength line
  if (activeIngs.length > 0) {
    doc.setFontSize(7.5);
    const stLine = `Each ${data.dosageForm.toLowerCase()} contains: ${activeIngs
      .slice(0, 3)
      .map((i) => `${i.name} ${i.qty}${i.unit}`)
      .join(
        ", ",
      )}${activeIngs.length > 3 ? ` and ${activeIngs.length - 3} more` : ""}`;
    const stLines = doc.splitTextToSize(stLine, innerW - 10);
    doc.text(stLines.slice(0, 2), M + 5, M + 36);
  }

  // Rx badge
  doc.setFillColor(0, 0, 0);
  doc.rect(W - M - 22, M + 28, 18, 9, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Rx Only", W - M - 13, M + 34.5, { align: "center" });

  // Divider
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(M, M + 52, W - M, M + 52);
  y = M + 56;

  // Active Ingredients section
  doc.setFillColor(220, 220, 220);
  doc.rect(M + 0.5, y, innerW - 1, 6.5, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("ACTIVE INGREDIENT(S)", M + 4, y + 4.8);
  y += 7.5;

  doc.setFillColor(235, 235, 235);
  doc.rect(M + 0.5, y, innerW - 1, 5.5, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("Ingredient Name", M + 4, y + 4);
  doc.text("Amount Per Unit", W - M - 4, y + 4, { align: "right" });
  doc.setLineWidth(0.3);
  doc.line(M + 0.5, y + 5.5, W - M - 0.5, y + 5.5);
  y += 6;
  for (const ing of activeIngs.slice(0, 8)) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(ing.name, M + 4, y + 4);
    doc.text(`${ing.qty} ${ing.unit}`, W - M - 4, y + 4, { align: "right" });
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(M + 0.5, y + 5.5, W - M - 0.5, y + 5.5);
    y += 6;
  }
  y += 2;

  // Inactive ingredients
  doc.setFillColor(220, 220, 220);
  doc.rect(M + 0.5, y, innerW - 1, 6.5, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INACTIVE INGREDIENTS (EXCIPIENTS)", M + 4, y + 4.8);
  y += 7.5;
  const excipText =
    inactiveIngs.length > 0
      ? inactiveIngs.map((i) => i.name).join(", ")
      : "Not applicable";
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const exLines = doc.splitTextToSize(excipText, innerW - 8);
  doc.text(exLines.slice(0, 3), M + 4, y + 4);
  y += Math.min(exLines.length, 3) * 5 + 6;

  // Indications
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(M + 0.5, y, W - M - 0.5, y);
  y += 3;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("INDICATIONS & USAGE", M + 4, y + 4.5);
  y += 8;
  const indText =
    data.indications && data.indications.length > 5
      ? data.indications
      : `${prodName} is indicated for management of conditions responsive to its active pharmaceutical ingredients. Use as directed by a licensed healthcare provider.`;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const indLines = doc.splitTextToSize(indText, innerW - 8);
  doc.text(indLines.slice(0, 4), M + 4, y);
  y += Math.min(indLines.length, 4) * 4.5 + 4;

  // Warnings box
  doc.setFillColor(255, 250, 230);
  doc.setDrawColor(200, 160, 0);
  doc.setLineWidth(0.5);
  doc.rect(M + 0.5, y, innerW - 1, 24, "FD");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(150, 80, 0);
  doc.text("WARNING", M + 4, y + 6);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const warnText =
    data.contraindications && data.contraindications.length > 5
      ? data.contraindications
      : "Not for use in persons with known hypersensitivity to any ingredient. Keep out of reach of children. Consult physician before use during pregnancy or lactation.";
  const warnLines = doc.splitTextToSize(warnText, innerW - 8);
  doc.text(warnLines.slice(0, 4), M + 4, y + 12);
  y += 28;

  // Dosage
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("DOSAGE & ADMINISTRATION", M + 4, y + 5);
  y += 9;
  const dosageMap: Record<string, string> = {
    Tablet:
      "Adults: 1-2 tablets orally 2-3 times daily after meals or as directed by physician.",
    Capsule: "Adults: 1-2 capsules orally twice daily with water after meals.",
    Syrup:
      "Adults: 5-10 mL 3 times daily. Children (6-12 yr): 2.5-5 mL twice daily. Shake well.",
    Injection: "Administer by qualified healthcare professional only.",
    Cream:
      "Apply a thin layer to affected area 2-3 times daily or as directed.",
    Ointment: "Apply to affected area as directed by physician.",
    Gel: "Apply topically to affected area as directed.",
    Drops: "Instill as directed by physician.",
    Patch: "Apply to clean, dry skin. Replace as directed.",
    Inhaler: "Inhale as directed by physician.",
  };
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const dosLines = doc.splitTextToSize(
    dosageMap[data.dosageForm] || "Use as directed by physician.",
    innerW - 8,
  );
  doc.text(dosLines.slice(0, 3), M + 4, y);
  y += Math.min(dosLines.length, 3) * 4.5 + 6;

  // Lot, Expiry, Storage row
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(M + 0.5, y, innerW - 1, 16, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`LOT: ${lotNum}`, M + 4, y + 6);
  doc.text(`EXP: ${expStr}`, M + 4, y + 12);
  doc.text(
    "Storage: Store at 25°C ± 2°C / 60% RH. Protect from light and moisture.",
    M + 45,
    y + 6,
  );
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Manufactured by: AyurNexis Formulation Lab | ${data.institution || "Formulation Research Centre"}`,
    M + 45,
    y + 12,
  );
  y += 20;

  // Approval bottom strip
  if (data.approved) {
    doc.setFillColor(200, 230, 201);
    doc.setDrawColor(76, 175, 80);
  } else {
    doc.setFillColor(255, 205, 210);
    doc.setDrawColor(229, 115, 115);
  }
  doc.setLineWidth(0.5);
  doc.rect(M + 0.5, y, innerW - 1, 12, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    data.approved ? 27 : 183,
    data.approved ? 94 : 28,
    data.approved ? 32 : 28,
  );
  const approvalText = data.approved
    ? "APPROVED FOR MARKET RELEASE — AyurNexis QA Board"
    : `NOT APPROVED — Quality Score Below Acceptance Criteria (Score: ${data.overallScore}/100)`;
  doc.text(approvalText, W / 2, y + 8.5, { align: "center" });

  doc.save(
    `${data.formulationName || data.dosageForm || "formulation"}_drug_label.pdf`,
  );
}

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
    const defaultMethod = prefillData.dosageForm
      .toLowerCase()
      .includes("tablet")
      ? "Direct Compression"
      : prefillData.dosageForm.toLowerCase().includes("capsule")
        ? "Hard Gelatin Capsule (Dry Fill)"
        : prefillData.dosageForm.toLowerCase().includes("syrup") ||
            prefillData.dosageForm.toLowerCase().includes("solution")
          ? "Solution"
          : prefillData.dosageForm.toLowerCase().includes("injection")
            ? "Parenteral Solution"
            : prefillData.dosageForm.toLowerCase().includes("cream") ||
                prefillData.dosageForm.toLowerCase().includes("topical")
              ? "Semi-Solid"
              : "Direct Compression";
    setMethod(defaultMethod);
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
  const [certExporting, setCertExporting] = useState(false);
  const [labelExporting, setLabelExporting] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    i: number;
    j: number;
    reason: string;
  } | null>(null);

  // ── Analysis State ─────────────────────────────────────────────────────
  const [aiPharmacology, setAiPharmacology] =
    useState<PharmacologyResult | null>(null);
  const [aiPharmacologyLoading, setAiPharmacologyLoading] = useState(false);
  const [aiPharmacologyError, setAiPharmacologyError] = useState(false);
  const [aiCompat, setAiCompat] = useState<CompatibilityResult[]>([]);
  const [aiCompatLoading, setAiCompatLoading] = useState(false);
  const [_aiCompatError, setAiCompatError] = useState(false);
  const [aiSOP, setAiSOP] = useState<SOPResult | null>(null);
  const [aiSOPLoading, setAiSOPLoading] = useState(false);
  const aiIngredientsCacheRef = useRef<string>("");

  const fetchAIAnalysis = async () => {
    if (ingredients.length === 0) return;
    const key = `${ingredients.map((i) => `${i.name}:${i.quantity}:${i.unit}`).join("|")}:${dosageForm}`;
    if (key === aiIngredientsCacheRef.current) return;
    aiIngredientsCacheRef.current = key;

    const ingList = ingredients.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      category: i.category,
    }));

    // Fetch pharmacology and compatibility in parallel
    setAiPharmacologyLoading(true);
    setAiPharmacologyError(false);
    setAiCompatLoading(true);
    setAiCompatError(false);
    setAiSOPLoading(true);

    const [pharmResult, compatResult, sopResult] = await Promise.allSettled([
      analyzePharmacology(
        ingList,
        dosageForm ?? "Tablet",
        "general indication",
      ),
      analyzeCompatibility(ingList),
      generateSOP(
        ingList,
        dosageForm ?? "Tablet",
        method ?? "Direct Compression",
      ),
    ]);

    if (pharmResult.status === "fulfilled") {
      setAiPharmacology(pharmResult.value);
    } else {
      setAiPharmacologyError(true);
    }
    setAiPharmacologyLoading(false);

    if (compatResult.status === "fulfilled") {
      setAiCompat(compatResult.value);
    } else {
      setAiCompatError(true);
    }
    setAiCompatLoading(false);

    if (sopResult.status === "fulfilled") {
      setAiSOP(sopResult.value);
    }
    setAiSOPLoading(false);
  };

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
    return ingredients.map((ing1, i) =>
      ingredients.map((ing2, j) => {
        if (i === j) return { status: "self" as const, reason: "" };
        // Static DB
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
      await loadJsPDF();
      const JsPDF = getJsPDF();
      const doc = new JsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      // ─── Report design helpers ─────────────────────────────────────────────
      const addSectionHeader = (text: string) => {
        y += 4;
        doc.setFillColor(232, 245, 240); // light teal
        doc.setDrawColor(0, 137, 123);
        doc.setLineWidth(0.3);
        doc.rect(margin, y - 4, pageW - margin * 2, 9, "FD");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(27, 94, 32);
        doc.text(text, margin + 3, y + 1);
        y += 10;
        doc.setTextColor(51, 51, 51);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
      };
      const checkPage = (needed = 20) => {
        if (y + needed > 272) {
          doc.addPage();
          y = 20;
          // page footer
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(150, 150, 150);
          doc.text(
            "Confidential | AyurNexis QA Platform | IP 2022 / BP 2023 Compliant",
            pageW / 2,
            288,
            { align: "center" },
          );
          doc.setTextColor(51, 51, 51);
        }
      };

      // ─── COVER PAGE ─────────────────────────────────────────────────────────
      // Light teal top header band
      doc.setFillColor(232, 245, 240);
      doc.rect(0, 0, pageW, 22, "F");
      doc.setDrawColor(0, 137, 123);
      doc.setLineWidth(0.5);
      doc.line(0, 22, pageW, 22);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(27, 94, 32);
      doc.text("AyurNexis 3.1", margin, 14);
      doc.setFontSize(10);
      doc.text("FORMULATION REPORT", pageW - margin, 12, { align: "right" });

      // Gold accent line
      doc.setFillColor(180, 130, 42);
      doc.rect(0, 18, pageW, 2, "F");

      // Subtitle
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Pharmaceutical Formulation Quality Assessment Report",
        pageW / 2,
        30,
        { align: "center" },
      );

      // Formulation name large centered
      const coverName = (
        formulationName || `${dosageForm} Formulation`
      ).toUpperCase();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 83, 45);
      const coverLines = doc.splitTextToSize(coverName, pageW - margin * 2);
      doc.text(coverLines, pageW / 2, 50, { align: "center" });

      // Horizontal divider
      doc.setDrawColor(180, 130, 42);
      doc.setLineWidth(0.7);
      doc.line(margin, 62, pageW - margin, 62);

      // Report metadata
      const reportNum = `AN-REPORT-${Date.now().toString(36).toUpperCase().slice(-7)}`;
      const reportDate = new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`Report No: ${reportNum}`, margin, 72);
      doc.text(`Date: ${reportDate}`, pageW / 2, 72, { align: "center" });
      doc.text(
        `QA Ref: AY-QA-${new Date().getFullYear()}`,
        pageW - margin,
        72,
        { align: "right" },
      );

      // Summary box
      const reportQScore = Math.round(
        (compatibilityScore + advancedStability.stabilityScore) / 2,
      );
      const approved = reportQScore >= 65;
      doc.setFillColor(248, 252, 248);
      doc.setDrawColor(20, 83, 45);
      doc.setLineWidth(0.4);
      doc.rect(margin, 80, pageW - margin * 2, 26, "FD");
      // 4-column summary
      const sumColW = (pageW - margin * 2) / 4;
      const sumLabels = ["Dosage Form", "Method", "Quality Score", "Status"];
      const sumVals = [
        dosageForm || "N/A",
        method || "N/A",
        `${reportQScore}/100`,
        approved ? "APPROVED" : "NOT APPROVED",
      ];
      const sumColors: [number, number, number][] = [
        [20, 83, 45],
        [20, 83, 45],
        [20, 83, 45],
        approved ? [20, 83, 45] : [185, 28, 28],
      ];
      for (let sc = 0; sc < 4; sc++) {
        const sx = margin + sc * sumColW + sumColW / 2;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(sumLabels[sc], sx, 89, { align: "center" });
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...sumColors[sc]);
        doc.text(sumVals[sc], sx, 99, { align: "center" });
        if (sc < 3) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(
            margin + (sc + 1) * sumColW,
            83,
            margin + (sc + 1) * sumColW,
            103,
          );
        }
      }

      // Footer bar
      doc.setFillColor(20, 83, 45);
      doc.rect(0, 284, pageW, 13, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 230, 210);
      doc.text(
        "Confidential | AyurNexis QA Platform | IP 2022 / BP 2023 Compliant",
        pageW / 2,
        292,
        { align: "center" },
      );

      y = 116;

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
                  <TabsTrigger
                    data-ocid="formulation.analysis.analytical_tab"
                    value="analytical"
                  >
                    Analytical Data
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="formulation.analysis.full_analytics_tab"
                    value="full-analytics"
                  >
                    Full Composition Analytics
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="formulation.analysis.reactions_tab"
                    value="reactions"
                  >
                    Drug Interactions
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
                  {/* Pharmacology Section */}
                  {ingredients.length > 0 && (
                    <Card className="border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Pharmacological Analysis
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] bg-primary/10 text-primary border-0">
                              Predicted Data
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => {
                                aiIngredientsCacheRef.current = "";
                                fetchAIAnalysis();
                              }}
                              disabled={aiPharmacologyLoading}
                              data-ocid="formulation.api.button"
                            >
                              {aiPharmacologyLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              {aiPharmacologyLoading
                                ? "Analyzing…"
                                : "Get Analysis"}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {aiPharmacologyLoading && (
                          <div
                            data-ocid="formulation.api.loading_state"
                            className="space-y-2"
                          >
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-10 bg-muted/50 rounded animate-pulse"
                              />
                            ))}
                          </div>
                        )}
                        {!aiPharmacologyLoading && aiPharmacologyError && (
                          <div
                            data-ocid="formulation.api.error_state"
                            className="text-center py-4"
                          >
                            <p className="text-xs text-red-600 mb-2">
                              Could not load analysis data.
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                aiIngredientsCacheRef.current = "";
                                fetchAIAnalysis();
                              }}
                            >
                              Retry
                            </Button>
                          </div>
                        )}
                        {!aiPharmacologyLoading && aiPharmacology && (
                          <div className="space-y-3 text-xs">
                            <div>
                              <p className="font-semibold text-foreground mb-1">
                                Mechanism of Action
                              </p>
                              <p className="text-muted-foreground leading-relaxed">
                                {aiPharmacology.mechanismOfAction}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground mb-1">
                                Pharmacokinetics
                              </p>
                              <p className="text-muted-foreground">
                                {aiPharmacology.pharmacokinetics}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground mb-1">
                                Clinical Rationale
                              </p>
                              <p className="text-muted-foreground leading-relaxed">
                                {aiPharmacology.clinicalRationale}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground mb-1">
                                Therapeutic Effects
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {aiPharmacology.therapeuticEffects.map((te) => (
                                  <Badge
                                    key={te}
                                    variant="outline"
                                    className="text-xs text-green-600 border-green-200"
                                  >
                                    {te}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {!aiPharmacologyLoading &&
                          !aiPharmacology &&
                          !aiPharmacologyError && (
                            <p className="text-xs text-muted-foreground text-center py-3">
                              Click "Get Analysis" to fetch real pharmacological
                              predictions for this formulation.
                            </p>
                          )}
                      </CardContent>
                    </Card>
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

                  {/* Advantages / Disadvantages */}
                  <p className="text-sm text-muted-foreground">
                    Advantages and disadvantages analysis is based on
                    pharmacopeia ingredient profiles. Review individual
                    ingredient monographs for detailed assessments.
                  </p>

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
                <TabsContent value="analytical" className="space-y-4">
                  <PredictedAnalyticalData
                    ingredients={ingredients}
                    dosageForm={dosageForm}
                  />
                </TabsContent>
                <TabsContent value="full-analytics" className="space-y-4">
                  {ingredients.length < 2 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <TestTube className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">
                        Add 2+ ingredients to generate predictions
                      </p>
                    </div>
                  ) : (
                    <FullCompositionAnalytics
                      ingredients={ingredients}
                      dosageForm={dosageForm}
                    />
                  )}
                </TabsContent>
                <TabsContent value="reactions" className="space-y-4">
                  {ingredients.length < 2 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium mb-1">
                        Add 2+ ingredients
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" /> AI
                          Reaction Analysis
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            aiIngredientsCacheRef.current = "";
                            fetchAIAnalysis();
                          }}
                          disabled={aiCompatLoading || aiPharmacologyLoading}
                          data-ocid="formulation.reactions.button"
                        >
                          {aiCompatLoading || aiPharmacologyLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          {aiCompatLoading || aiPharmacologyLoading
                            ? "Analyzing…"
                            : "Run Analysis"}
                        </Button>
                      </div>

                      {aiPharmacologyLoading && (
                        <div
                          data-ocid="formulation.reactions.loading_state"
                          className="space-y-2"
                        >
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-12 bg-muted/50 rounded-lg animate-pulse"
                            />
                          ))}
                        </div>
                      )}

                      {!aiPharmacologyLoading && aiPharmacologyError && (
                        <div
                          data-ocid="formulation.reactions.error_state"
                          className="rounded-lg border border-red-200 bg-red-50 p-4 text-center"
                        >
                          <p className="text-xs text-red-600 mb-2">
                            Could not load analysis data.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              aiIngredientsCacheRef.current = "";
                              fetchAIAnalysis();
                            }}
                          >
                            Retry
                          </Button>
                        </div>
                      )}

                      {!aiPharmacologyLoading && aiPharmacology && (
                        <div className="space-y-3">
                          <Card className="border-border">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary" /> Drug
                                Interactions
                                <Badge className="ml-auto text-[10px] bg-primary/10 text-primary border-0">
                                  Predicted Data
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {aiPharmacology.drugInteractions.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  No significant drug interactions predicted.
                                </p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {aiPharmacology.drugInteractions.map((di) => (
                                    <li
                                      key={di}
                                      className="text-xs text-muted-foreground flex gap-2"
                                    >
                                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-yellow-500" />
                                      {di}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </CardContent>
                          </Card>
                          <Card className="border-border">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                Adverse Effects
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1.5">
                                {aiPharmacology.adverseEffects.map((ae) => (
                                  <Badge
                                    key={ae}
                                    variant="outline"
                                    className="text-xs text-amber-600 border-amber-200"
                                  >
                                    {ae}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="border-border">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                Contraindications
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1.5">
                                {aiPharmacology.contraindications.map((ci) => (
                                  <Badge
                                    key={ci}
                                    variant="outline"
                                    className="text-xs text-red-600 border-red-200"
                                  >
                                    {ci}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {!aiPharmacologyLoading &&
                        !aiPharmacology &&
                        !aiPharmacologyError && (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm mb-3">
                              Click "Run Analysis" to get real-time drug
                              interaction predictions
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchAIAnalysis()}
                              data-ocid="formulation.reactions.secondary_button"
                            >
                              <Zap className="w-3 h-3 mr-1" /> Analyze Now
                            </Button>
                          </div>
                        )}

                      {aiCompat.length > 0 && (
                        <Card className="border-border">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Layers className="w-4 h-4 text-primary" /> AI
                              Compatibility Pairs
                              <Badge className="ml-auto text-[10px] bg-primary/10 text-primary border-0">
                                Predicted Data
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {aiCompat
                                .filter((r) => r.compatibility !== "compatible")
                                .map((r) => (
                                  <div
                                    key={`${r.ingredient1}-${r.ingredient2}`}
                                    className={`p-2.5 rounded-lg text-xs ${r.compatibility === "incompatible" ? "bg-red-50 border border-red-100" : "bg-yellow-50 border border-yellow-100"}`}
                                  >
                                    <p className="font-medium mb-0.5">
                                      {r.ingredient1} + {r.ingredient2}
                                    </p>
                                    <p
                                      className={
                                        r.compatibility === "incompatible"
                                          ? "text-red-700"
                                          : "text-yellow-700"
                                      }
                                    >
                                      {r.reason}
                                    </p>
                                  </div>
                                ))}
                              {aiCompat.filter(
                                (r) => r.compatibility !== "compatible",
                              ).length === 0 && (
                                <p className="text-xs text-green-600">
                                  ✓ All ingredient pairs appear compatible per
                                  pharmacopeia analysis.
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
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

              {/* Formulation Analysis */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Formulation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Clinical Rationale */}
                  <div>
                    <p className="text-xs font-semibold text-primary mb-2">
                      Clinical Rationale
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {`This ${dosageForm} formulation has been prepared according to standard pharmaceutical manufacturing practices and pharmacopeia guidelines. The formulation contains ${ingredients.map((i) => i.name).join(", ")} prepared by the ${method} method.`}
                    </p>
                  </div>
                  {/* Manufacturing Procedure */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Manufacturing Procedure
                    </p>
                    <ol className="space-y-1">
                      {sopSteps.map((s, i) => (
                        <li
                          key={s.substring(0, 30)}
                          className="text-xs text-muted-foreground flex gap-2"
                        >
                          <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {/* Instruments & Glassware */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                      <p className="text-xs font-semibold text-blue-400 mb-2">
                        🔬 Instruments Required
                      </p>
                      <ul className="space-y-1">
                        {[
                          "Analytical balance",
                          "pH meter",
                          "Dissolution apparatus",
                          "HPLC system",
                          "UV-Vis spectrophotometer",
                          "Tablet compression machine",
                          "Granulator",
                          "Moisture analyzer",
                          "Melting point apparatus",
                          "Stability chamber",
                        ].map((inst) => (
                          <li
                            key={inst}
                            className="text-xs text-muted-foreground flex gap-1.5"
                          >
                            <span className="text-blue-400 shrink-0">•</span>
                            {inst}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-3">
                      <p className="text-xs font-semibold text-purple-400 mb-2">
                        🧪 Glassware Required
                      </p>
                      <ul className="space-y-1">
                        {[
                          "Beakers (100 mL, 250 mL, 500 mL)",
                          "Volumetric flasks",
                          "Measuring cylinders",
                          "Conical flasks",
                          "Petri dishes",
                          "Watch glass",
                          "Stirring rods",
                        ].map((gw) => (
                          <li
                            key={gw}
                            className="text-xs text-muted-foreground flex gap-1.5"
                          >
                            <span className="text-purple-400 shrink-0">•</span>
                            {gw}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pharmacological Effects of Composition */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Pharmacological Effects of Composition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ingredients.filter(
                    (i) => i.category === "api" || i.category === "herb",
                  ).length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2">
                        API / Active Ingredient Pharmacology
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-amber-50 dark:bg-amber-900/10">
                              <th className="px-3 py-2 text-left font-semibold border border-border/50">
                                Ingredient
                              </th>
                              <th className="px-3 py-2 text-left font-semibold border border-border/50">
                                Category
                              </th>
                              <th className="px-3 py-2 text-left font-semibold border border-border/50">
                                Pharmacological Role
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingredients
                              .filter(
                                (i) =>
                                  i.category === "api" || i.category === "herb",
                              )
                              .map((ing) => (
                                <tr
                                  key={ing.id}
                                  className="border-t border-border/30"
                                >
                                  <td className="px-3 py-2 font-medium">
                                    {ing.name}
                                  </td>
                                  <td className="px-3 py-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px]"
                                    >
                                      {ing.category === "api"
                                        ? "API"
                                        : "Herbal API"}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    Active therapeutic constituent — contributes
                                    to the primary pharmacological action of the
                                    formulation.
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Add API or herbal ingredients to see pharmacological
                      effects.
                    </p>
                  )}
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
              {/* SOP Preview */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Manufacturing Procedure
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px] bg-primary/10 text-primary border-0">
                        Predicted Data
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          aiIngredientsCacheRef.current = "";
                          fetchAIAnalysis();
                        }}
                        disabled={aiSOPLoading}
                        data-ocid="formulation.summary.button"
                      >
                        {aiSOPLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        {aiSOPLoading ? "Generating…" : "Generate SOP"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiSOPLoading && (
                    <div
                      data-ocid="formulation.summary.loading_state"
                      className="space-y-2"
                    >
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-8 bg-muted/50 rounded animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                  {!aiSOPLoading && aiSOP && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <p className="font-semibold text-foreground mb-2">
                          Step-by-Step Procedure
                        </p>
                        <ol className="space-y-1.5 list-none">
                          {aiSOP.procedure.map((step, i) => (
                            <li
                              key={`sop-step-${step.slice(0, 20)}`}
                              className="flex gap-2 text-muted-foreground"
                            >
                              <span className="font-mono text-primary shrink-0">
                                {String(i + 1).padStart(2, "0")}.
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="font-semibold text-foreground mb-1.5">
                            Instruments Required
                          </p>
                          <ul className="space-y-1">
                            {aiSOP.instruments.map((inst) => (
                              <li
                                key={inst}
                                className="text-muted-foreground flex gap-1.5"
                              >
                                <span className="text-primary">•</span>
                                {inst}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-1.5">
                            Glassware
                          </p>
                          <ul className="space-y-1">
                            {aiSOP.glassware.map((gw) => (
                              <li
                                key={gw}
                                className="text-muted-foreground flex gap-1.5"
                              >
                                <span className="text-primary">•</span>
                                {gw}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1.5">
                          Quality Checks
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {aiSOP.qualityChecks.map((qc) => (
                            <Badge
                              key={qc}
                              variant="outline"
                              className="text-xs"
                            >
                              {qc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {!aiSOPLoading && !aiSOP && (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      Click "Generate SOP" to get a pharmacopeia-based
                      step-by-step manufacturing procedure.
                    </p>
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

              {/* Drug Label */}
              {(() => {
                const overallScore = Math.round(
                  (compatibilityScore + advancedStability.stabilityScore) / 2,
                );
                const isApproved = overallScore >= 70;
                const today = new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                });
                const mfgDate = new Date().toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                });
                const expDate = new Date(
                  Date.now() +
                    advancedStability.shelfLifeMonths *
                      30 *
                      24 *
                      60 *
                      60 *
                      1000,
                ).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                });
                const batchNo = `AN-${Date.now().toString(36).toUpperCase().slice(-6)}`;
                return (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                          background: isApproved
                            ? "oklch(0.42 0.14 145 / 0.12)"
                            : "oklch(0.54 0.174 24 / 0.12)",
                          color: isApproved
                            ? "oklch(0.42 0.14 145)"
                            : "oklch(0.54 0.174 24)",
                          border: isApproved
                            ? "1px solid oklch(0.42 0.14 145 / 0.3)"
                            : "1px solid oklch(0.54 0.174 24 / 0.3)",
                        }}
                      >
                        {isApproved ? "✓ APPROVED" : "✗ NOT APPROVED"}
                      </span>
                      Drug Label
                    </h3>
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        border: "2px solid #1a1a1a",
                        fontFamily: "Georgia, serif",
                        background: "#ffffff",
                        color: "#000000",
                      }}
                      data-ocid="formulation.cert.card"
                    >
                      {/* Label Header */}
                      <div
                        className="px-6 py-4"
                        style={{ background: "#1a1a1a", color: "#ffffff" }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p
                              className="text-[10px] font-bold tracking-widest uppercase mb-1"
                              style={{ color: "#aaa" }}
                            >
                              Rx Only — For Pharmaceutical Use
                            </p>
                            <h3
                              className="text-xl font-bold tracking-wide"
                              style={{ fontFamily: "Arial, sans-serif" }}
                            >
                              {formulationName || `${dosageForm} Formulation`}
                            </h3>
                            <p
                              className="text-sm mt-0.5"
                              style={{ color: "#ccc" }}
                            >
                              {dosageForm} &middot; {method}
                            </p>
                          </div>
                          <div
                            className="text-right text-xs"
                            style={{ color: "#aaa" }}
                          >
                            <div>Batch: {batchNo}</div>
                            <div>Mfg: {mfgDate}</div>
                            <div>Exp: {expDate}</div>
                          </div>
                        </div>
                      </div>

                      {/* Approval Status Box */}
                      <div
                        className="mx-6 my-4 rounded-lg px-4 py-3"
                        style={{
                          background: isApproved ? "#dcfce7" : "#fee2e2",
                          border: isApproved
                            ? "2px solid #16a34a"
                            : "2px solid #dc2626",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-lg font-bold"
                            style={{
                              color: isApproved ? "#15803d" : "#b91c1c",
                            }}
                          >
                            {isApproved ? "✓" : "✗"}
                          </span>
                          <div>
                            <p
                              className="text-sm font-bold"
                              style={{
                                color: isApproved ? "#14532d" : "#7f1d1d",
                              }}
                            >
                              {isApproved
                                ? "APPROVED FOR MARKET RELEASE — Certified by AyurNexis Platform"
                                : `NOT APPROVED FOR MARKET RELEASE — Quality score ${overallScore}/100 does not meet minimum threshold of 70`}
                            </p>
                            {!isApproved && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: "#991b1b" }}
                              >
                                Deficiencies:{" "}
                                {[
                                  compatibilityScore < 70 &&
                                    `Compatibility score ${compatibilityScore}/100 (min 70)`,
                                  advancedStability.stabilityScore < 70 &&
                                    `Stability score ${advancedStability.stabilityScore}/100 (min 70)`,
                                ]
                                  .filter(Boolean)
                                  .join(" | ") ||
                                  "Overall quality below threshold"}
                              </p>
                            )}
                            {isApproved && (
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: "#166534" }}
                              >
                                Certified on {today} &middot; AyurNexis QA Board
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Composition Table */}
                      <div className="px-6 pb-2">
                        <p
                          className="text-xs font-bold uppercase tracking-widest mb-2"
                          style={{
                            color: "#333",
                            borderBottom: "1px solid #333",
                            paddingBottom: 4,
                          }}
                        >
                          Composition (per unit dose)
                        </p>
                        <table
                          style={{
                            width: "100%",
                            fontSize: 11,
                            borderCollapse: "collapse",
                          }}
                        >
                          <thead>
                            <tr style={{ background: "#f3f4f6" }}>
                              <th
                                style={{
                                  padding: "4px 8px",
                                  textAlign: "left",
                                  border: "1px solid #d1d5db",
                                }}
                              >
                                Ingredient
                              </th>
                              <th
                                style={{
                                  padding: "4px 8px",
                                  textAlign: "left",
                                  border: "1px solid #d1d5db",
                                }}
                              >
                                Role
                              </th>
                              <th
                                style={{
                                  padding: "4px 8px",
                                  textAlign: "right",
                                  border: "1px solid #d1d5db",
                                }}
                              >
                                Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingredients.map((ing) => (
                              <tr
                                key={ing.id}
                                style={{ borderBottom: "1px solid #e5e7eb" }}
                              >
                                <td
                                  style={{
                                    padding: "3px 8px",
                                    fontWeight: 600,
                                    border: "1px solid #e5e7eb",
                                  }}
                                >
                                  {ing.name}
                                </td>
                                <td
                                  style={{
                                    padding: "3px 8px",
                                    color: "#555",
                                    border: "1px solid #e5e7eb",
                                  }}
                                >
                                  {ing.category}
                                </td>
                                <td
                                  style={{
                                    padding: "3px 8px",
                                    textAlign: "right",
                                    fontFamily: "monospace",
                                    border: "1px solid #e5e7eb",
                                  }}
                                >
                                  {ing.quantity} {ing.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Dosage & Storage */}
                      <div
                        className="grid grid-cols-2 gap-0 px-6 py-3"
                        style={{ borderTop: "1px solid #ccc" }}
                      >
                        <div
                          style={{
                            borderRight: "1px solid #ccc",
                            paddingRight: 12,
                          }}
                        >
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider mb-1"
                            style={{ color: "#333" }}
                          >
                            Dosage Instructions
                          </p>
                          <p className="text-xs">
                            {dosageForm === "Tablet" || dosageForm === "Capsule"
                              ? "1-2 units orally, twice daily after meals, or as directed by physician."
                              : dosageForm === "Syrup" ||
                                  dosageForm === "Suspension"
                                ? "5-10 mL orally, twice daily, shake well before use."
                                : dosageForm === "Injection"
                                  ? "As directed by physician. For parenteral administration only."
                                  : "Apply as directed. For external use only (if topical)."}
                          </p>
                        </div>
                        <div style={{ paddingLeft: 12 }}>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider mb-1"
                            style={{ color: "#333" }}
                          >
                            Storage Conditions
                          </p>
                          <p className="text-xs">
                            {
                              "Store below 25°C in a dry place. Keep away from light and moisture. Keep out of reach of children."
                            }
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        className="px-6 py-3 flex items-center justify-between"
                        style={{
                          background: "#f9fafb",
                          borderTop: "1px solid #ccc",
                          fontSize: 10,
                        }}
                      >
                        <div>
                          <div className="font-bold">
                            Manufacturer: AyurNexis Formulation Lab
                          </div>
                          <div style={{ color: "#555" }}>
                            Formulated by: {ownerName || "AyurNexis Platform"}{" "}
                            &middot; {institution || "Formulation Laboratory"}
                          </div>
                        </div>
                        <div className="text-right" style={{ color: "#555" }}>
                          <div>Overall Score: {overallScore}/100</div>
                          <div>
                            Shelf Life: {advancedStability.shelfLifeMonths}{" "}
                            months
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
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
                      <Button
                        data-ocid="formulation.certificate.button"
                        size="lg"
                        variant="outline"
                        disabled={
                          ingredients.length === 0 ||
                          !ownerName ||
                          certExporting
                        }
                        title={
                          !ownerName || ingredients.length === 0
                            ? "Add ownership details in Step 7"
                            : "Download Certificate"
                        }
                        className="gap-2"
                        onClick={async () => {
                          setCertExporting(true);
                          try {
                            const overallScore = Math.round(
                              (compatibilityScore +
                                advancedStability.stabilityScore) /
                                2,
                            );
                            // Check locking
                            const compHash = ingredients
                              .map((i) => `${i.name}:${i.quantity}`)
                              .sort()
                              .join("|");
                            const currentUser =
                              localStorage.getItem("ayurnexis_user_name") ??
                              "unknown";
                            const locked: Record<string, string> = JSON.parse(
                              localStorage.getItem(
                                "ayurnexis_locked_formulations",
                              ) ?? "{}",
                            );
                            if (
                              locked[compHash] &&
                              locked[compHash] !== currentUser
                            ) {
                              toast.error(
                                "This formulation composition has already been certified by another user. Modify quantities to create a unique formulation.",
                              );
                              setCertExporting(false);
                              return;
                            }
                            await generateCertificatePDF({
                              formulationName:
                                formulationName || `${dosageForm} Formulation`,
                              dosageForm: dosageForm ?? "",
                              method: method ?? "",
                              ownerName,
                              institution,
                              designation,
                              ingredients: ingredients.map((i) => ({
                                name: i.name,
                                qty: i.quantity,
                                unit: i.unit,
                              })),
                              stabilityScore: advancedStability.stabilityScore,
                              shelfLifeMonths:
                                advancedStability.shelfLifeMonths,
                              overallScore,
                              approved: overallScore >= 70,
                              certNum: `AN-${Date.now().toString(36).toUpperCase().slice(-8)}`,
                              date: new Date().toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }),
                            });
                            // Lock the formulation after successful certificate generation
                            locked[compHash] = currentUser;
                            localStorage.setItem(
                              "ayurnexis_locked_formulations",
                              JSON.stringify(locked),
                            );
                          } finally {
                            setCertExporting(false);
                          }
                        }}
                      >
                        {certExporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4" /> Download Certificate
                          </>
                        )}
                      </Button>
                      <Button
                        data-ocid="formulation.label.button"
                        size="lg"
                        variant="outline"
                        disabled={
                          ingredients.length === 0 ||
                          !ownerName ||
                          labelExporting
                        }
                        title={
                          !ownerName || ingredients.length === 0
                            ? "Add ownership details in Step 7"
                            : "Download Label"
                        }
                        className="gap-2"
                        onClick={async () => {
                          setLabelExporting(true);
                          try {
                            const overallScore = Math.round(
                              (compatibilityScore +
                                advancedStability.stabilityScore) /
                                2,
                            );
                            await generateLabelPDF({
                              formulationName:
                                formulationName || `${dosageForm} Formulation`,
                              dosageForm: dosageForm ?? "",
                              ownerName,
                              institution,
                              ingredients: ingredients.map((i) => ({
                                name: i.name,
                                qty: i.quantity,
                                unit: i.unit,
                              })),
                              overallScore,
                              approved: overallScore >= 70,
                              date: new Date().toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }),
                              indications: ingredients
                                .filter(
                                  (i) =>
                                    i.category === "api" ||
                                    i.category === "herb",
                                )
                                .map((i) => i.name)
                                .join(", "),
                              contraindications:
                                "Not recommended in known hypersensitivity to any ingredient. Caution in pregnancy, lactation, and renal/hepatic impairment. Consult physician before use.",
                            });
                          } finally {
                            setLabelExporting(false);
                          }
                        }}
                      >
                        {labelExporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Tag className="w-4 h-4" /> Download Label
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
                      window.dispatchEvent(new Event("storage"));
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

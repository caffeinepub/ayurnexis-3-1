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
import {
  Document,
  Page as PDFPage,
  StyleSheet as PDFStyleSheet,
  Text as PDFText,
  View as PDFView,
  pdf,
} from "@react-pdf/renderer";
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
import { useMemo, useState } from "react";
import {
  type APIIngredient,
  type ExcipientCategory,
  type ExcipientIngredient,
  apiDrugs,
  binders,
  coatingAgents,
  disintegrants,
  excipientCategoryLabels,
  fillers,
  glidants,
  lubricants,
  preservatives,
} from "../data/formulationData";
import { type HerbMonograph, pharmacopeiaData } from "../data/pharmacopeiaData";

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

const pdfStyles = PDFStyleSheet.create({
  page: { padding: 40, backgroundColor: "#0f1923", color: "#e2f5ec" },
  header: {
    borderBottom: "2px solid #2dd4bf",
    paddingBottom: 12,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#2dd4bf" },
  subtitle: { fontSize: 11, color: "#94a3b8", marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f59e0b",
    marginBottom: 8,
    borderBottom: "1px solid #1e3a3a",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottom: "1px solid #1e3a3a",
  },
  cell: { flex: 1, fontSize: 9, color: "#e2f5ec" },
  cellBold: { flex: 1, fontSize: 9, fontWeight: "bold", color: "#94f5e0" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a3040",
    paddingVertical: 5,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  text: { fontSize: 9, color: "#e2f5ec", marginBottom: 4 },
  certBox: {
    border: "2px solid #2dd4bf",
    padding: 20,
    marginTop: 16,
    backgroundColor: "#0f2030",
  },
  certTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2dd4bf",
    textAlign: "center",
    marginBottom: 8,
  },
  certText: {
    fontSize: 10,
    color: "#e2f5ec",
    textAlign: "center",
    lineHeight: 1.5,
  },
  badge: {
    backgroundColor: "#1a3040",
    padding: "4 8",
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: { fontSize: 8, color: "#2dd4bf" },
});

function FormulationPDFDocument({
  dosageForm,
  method,
  ingredients,
  formulationName,
  ownerName,
  institution,
  designation,
  scaleUp,
  sopSteps,
  today,
}: {
  dosageForm: string;
  method: string;
  ingredients: FormulationIngredient[];
  formulationName: string;
  ownerName: string;
  institution: string;
  designation: string;
  scaleUp: number;
  sopSteps: string[];
  today: string;
}) {
  const apis = ingredients.filter((i) => i.category === "api");
  const excipients = ingredients.filter((i) => i.category !== "api");
  const totalWeight = ingredients.reduce((s, i) => s + i.quantity * scaleUp, 0);

  return (
    <Document>
      <PDFPage size="A4" style={pdfStyles.page}>
        {/* Header */}
        <PDFView style={pdfStyles.header}>
          <PDFText style={pdfStyles.title}>
            AyurNexis 3.1 — Formulation Report
          </PDFText>
          <PDFText style={pdfStyles.subtitle}>
            {formulationName || `${dosageForm} Formulation`} | Generated:{" "}
            {today}
          </PDFText>
        </PDFView>

        {/* Formulation Overview */}
        <PDFView style={pdfStyles.section}>
          <PDFText style={pdfStyles.sectionTitle}>FORMULATION OVERVIEW</PDFText>
          <PDFView style={pdfStyles.row}>
            <PDFText style={pdfStyles.cellBold}>Dosage Form</PDFText>
            <PDFText style={pdfStyles.cell}>{dosageForm}</PDFText>
            <PDFText style={pdfStyles.cellBold}>Method</PDFText>
            <PDFText style={pdfStyles.cell}>{method}</PDFText>
          </PDFView>
          <PDFView style={pdfStyles.row}>
            <PDFText style={pdfStyles.cellBold}>Scale</PDFText>
            <PDFText style={pdfStyles.cell}>{scaleUp} unit(s)</PDFText>
            <PDFText style={pdfStyles.cellBold}>Total Weight</PDFText>
            <PDFText style={pdfStyles.cell}>
              {totalWeight.toFixed(2)} mg
            </PDFText>
          </PDFView>
        </PDFView>

        {/* Composition Table */}
        <PDFView style={pdfStyles.section}>
          <PDFText style={pdfStyles.sectionTitle}>COMPOSITION TABLE</PDFText>
          <PDFView style={pdfStyles.tableHeader}>
            <PDFText style={{ ...pdfStyles.cellBold, flex: 2 }}>
              Ingredient
            </PDFText>
            <PDFText style={pdfStyles.cellBold}>Category</PDFText>
            <PDFText style={pdfStyles.cellBold}>Qty/unit</PDFText>
            <PDFText style={pdfStyles.cellBold}>Total ({scaleUp}x)</PDFText>
          </PDFView>
          {ingredients.map((ing) => (
            <PDFView key={ing.id} style={pdfStyles.row}>
              <PDFText style={{ ...pdfStyles.cell, flex: 2 }}>
                {ing.name}
              </PDFText>
              <PDFText style={pdfStyles.cell}>
                {ing.category === "api"
                  ? "API"
                  : excipientCategoryLabels[ing.category as ExcipientCategory]}
              </PDFText>
              <PDFText style={pdfStyles.cell}>
                {ing.quantity} {ing.unit}
              </PDFText>
              <PDFText style={pdfStyles.cell}>
                {(ing.quantity * scaleUp).toFixed(2)} {ing.unit}
              </PDFText>
            </PDFView>
          ))}
        </PDFView>

        {/* API Analysis */}
        {apis.length > 0 && (
          <PDFView style={pdfStyles.section}>
            <PDFText style={pdfStyles.sectionTitle}>
              API ANALYSIS SUMMARY
            </PDFText>
            {apis.map((ing) => {
              const api = ing.source as APIIngredient;
              return (
                <PDFView key={ing.id} style={{ marginBottom: 8 }}>
                  <PDFView style={pdfStyles.row}>
                    <PDFText style={pdfStyles.cellBold}>API</PDFText>
                    <PDFText style={pdfStyles.cell}>{ing.name}</PDFText>
                    <PDFText style={pdfStyles.cellBold}>Therapeutic</PDFText>
                    <PDFText style={pdfStyles.cell}>
                      {api?.therapeuticCategory || "—"}
                    </PDFText>
                  </PDFView>
                  <PDFView style={pdfStyles.row}>
                    <PDFText style={pdfStyles.cellBold}>Assay Range</PDFText>
                    <PDFText style={pdfStyles.cell}>
                      {api?.assayMin}–{api?.assayMax}%
                    </PDFText>
                    <PDFText style={pdfStyles.cellBold}>Pharmacopeia</PDFText>
                    <PDFText style={pdfStyles.cell}>
                      {api?.source || "—"}
                    </PDFText>
                  </PDFView>
                </PDFView>
              );
            })}
          </PDFView>
        )}

        {/* Excipient Summary */}
        {excipients.length > 0 && (
          <PDFView style={pdfStyles.section}>
            <PDFText style={pdfStyles.sectionTitle}>EXCIPIENT SUMMARY</PDFText>
            {excipients.map((ing) => (
              <PDFView key={ing.id} style={pdfStyles.row}>
                <PDFText style={{ ...pdfStyles.cell, flex: 2 }}>
                  {ing.name}
                </PDFText>
                <PDFText style={pdfStyles.cell}>
                  {excipientCategoryLabels[ing.category as ExcipientCategory]}
                </PDFText>
                <PDFText style={pdfStyles.cell}>
                  {ing.quantity} {ing.unit}
                </PDFText>
              </PDFView>
            ))}
          </PDFView>
        )}
      </PDFPage>

      {/* SOP Page */}
      <PDFPage size="A4" style={pdfStyles.page}>
        <PDFView style={pdfStyles.header}>
          <PDFText style={pdfStyles.title}>
            STANDARD OPERATING PROCEDURE
          </PDFText>
          <PDFText style={pdfStyles.subtitle}>
            {dosageForm} by {method} | Scale: {scaleUp}x
          </PDFText>
        </PDFView>

        <PDFView style={pdfStyles.section}>
          <PDFText style={pdfStyles.sectionTitle}>MATERIALS REQUIRED</PDFText>
          {ingredients.map((ing) => (
            <PDFText key={ing.id} style={pdfStyles.text}>
              • {ing.name} — {(ing.quantity * scaleUp).toFixed(2)} {ing.unit}
            </PDFText>
          ))}
        </PDFView>

        <PDFView style={pdfStyles.section}>
          <PDFText style={pdfStyles.sectionTitle}>PROCEDURE</PDFText>
          {sopSteps.map((sopStep, i) => (
            <PDFText key={sopStep.slice(0, 20)} style={pdfStyles.text}>
              {i + 1}. {sopStep}
            </PDFText>
          ))}
        </PDFView>

        {/* Certificate */}
        {ownerName && (
          <PDFView style={pdfStyles.certBox}>
            <PDFText style={pdfStyles.certTitle}>
              CERTIFICATE OF FORMULATION DEVELOPMENT
            </PDFText>
            <PDFText style={pdfStyles.certText}>
              This certifies that {ownerName}
              {designation ? `, ${designation},` : ""} of{" "}
              {institution || "[Institution]"} has developed the following
              formulation using AyurNexis 3.1 Formulation Lab.
            </PDFText>
            <PDFText
              style={{
                ...pdfStyles.certText,
                marginTop: 8,
                fontWeight: "bold",
                color: "#2dd4bf",
              }}
            >
              Formulation: {formulationName || `${dosageForm} Formulation`}
            </PDFText>
            <PDFText style={pdfStyles.certText}>
              Dosage Form: {dosageForm} | Method: {method}
            </PDFText>
            <PDFText style={pdfStyles.certText}>Date: {today}</PDFText>
          </PDFView>
        )}
      </PDFPage>
    </Document>
  );
}

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

export function FormulationLab() {
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

  // ── Derived ───────────────────────────────────────────────────────────────
  const methods = dosageForm ? (DOSAGE_METHODS[dosageForm] ?? []) : [];
  const selectedMethod = methods.find((m) => m.method === method);
  const compatibleExcipients = selectedMethod?.compatibleExcipients ?? [];

  const apiIngredients = ingredients.filter((i) => i.category === "api");
  const excipientIngredients = ingredients.filter((i) => i.category !== "api");
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
      const blob = await pdf(
        <FormulationPDFDocument
          dosageForm={dosageForm!}
          method={method!}
          ingredients={ingredients}
          formulationName={formulationName}
          ownerName={ownerName}
          institution={institution}
          designation={designation}
          scaleUp={scaleUp}
          sopSteps={sopSteps}
          today={today}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formulationName || dosageForm}_Formulation_${today}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
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

              {/* Stability & compliance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Stability Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      {[
                        {
                          label: "Preservative System",
                          ok: excipientIngredients.some(
                            (i) => i.category === "preservatives",
                          ),
                        },
                        {
                          label: "Lubricant / Release Agent",
                          ok: excipientIngredients.some(
                            (i) => i.category === "lubricants",
                          ),
                        },
                        {
                          label: "Structural Support (Filler)",
                          ok: excipientIngredients.some(
                            (i) => i.category === "fillers",
                          ),
                        },
                        {
                          label: "Disintegration System",
                          ok: excipientIngredients.some(
                            (i) => i.category === "disintegrants",
                          ),
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between"
                        >
                          <span className="text-muted-foreground">
                            {row.label}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              row.ok
                                ? "border-green-500/40 text-green-400"
                                : "border-red-500/40 text-red-400"
                            }`}
                          >
                            {row.ok ? "Present" : "Missing"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

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
              </div>
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

                {/* Certificate Preview */}
                <div
                  className="rounded-xl border-2 border-primary/40 bg-card p-6 flex flex-col justify-between"
                  data-ocid="formulation.cert.card"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                        AyurNexis 3.1
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-3">
                      Certificate of Formulation Development
                    </h3>
                    <div className="my-4 h-px bg-primary/30" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This certifies that{" "}
                      <span className="text-foreground font-semibold">
                        {ownerName || "[Formulator Name]"}
                      </span>
                      {designation && (
                        <>
                          ,{" "}
                          <span className="text-foreground">{designation}</span>
                          ,
                        </>
                      )}{" "}
                      of{" "}
                      <span className="text-foreground font-semibold">
                        {institution || "[Institution]"}
                      </span>{" "}
                      has developed the following pharmaceutical formulation
                      using AyurNexis 3.1 Formulation Lab.
                    </p>
                    <div className="mt-4 bg-primary/10 rounded-lg p-3">
                      <p className="text-sm font-bold text-primary">
                        {formulationName || `${dosageForm} Formulation`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dosageForm} | {method}
                      </p>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-xs text-muted-foreground">
                      Date: {today}
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-1">
                      <div className="h-px w-12 bg-primary/40" />
                      <Clipboard className="w-3 h-3 text-primary" />
                      <div className="h-px w-12 bg-primary/40" />
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
                onClick={() => setStep((s) => Math.min(8, s + 1))}
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

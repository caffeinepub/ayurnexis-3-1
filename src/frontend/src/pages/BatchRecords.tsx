import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  FlaskConical,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { AnalysisResult } from "../backend.d";
import type { Option } from "../backend.d";
import {
  useAllBatches,
  useAnalyzeBatch,
  useDeleteBatch,
} from "../hooks/useQueries";
import { isAdminAuthed } from "../utils/accessControl";
import {
  deleteSeedBatch,
  getDeletedSeedBatchIds,
  getLocalAnalyses,
  saveLocalAnalysis,
} from "../utils/analysisStore";

type SeedBatch = {
  id: bigint;
  batchId: string;
  herbName: string;
  supplier: string;
  region: string;
  dateReceived: string;
  moisture: number;
  ash: number;
  extractiveValue: number;
  heavyMetals: number;
  microbialCount: number;
  notes: string;
  volatileOil: number;
  alcoholExtract: number;
  waterExtract: number;
  acidInsolubleAsh: number;
  activeMarker: string;
  activeMarkerContent: number;
  leadPpm: number;
  arsenicPpm: number;
  mercuryPpm: number;
  cadmiumPpm: number;
  yeastMold: number;
  ecoli: string;
  salmonella: string;
  foreignMatter: number;
  particleSize: string;
  color: string;
  odor: string;
  pharmacopeiaRef: string;
  qualityStatus: "Pass" | "Fail" | "Under Review" | "Approved" | "Rejected";
  inspectorName: string;
  storageCondition: string;
  expiryDate: string;
};

const SEED_BATCHES: SeedBatch[] = [
  {
    id: -1n,
    batchId: "AY-2025-001",
    herbName: "Ashwagandha Root",
    supplier: "Himalaya Herb Farm",
    region: "Rajasthan",
    dateReceived: "2025-01-08",
    moisture: 7.2,
    ash: 4.1,
    extractiveValue: 22.5,
    heavyMetals: 0.45,
    microbialCount: 850,
    notes:
      "Pale brownish-grey powder with characteristic horse-like odour. Well-dried, no clumping. Withanolide content verified by HPLC. Compliant with IP 2022 monograph.",
    volatileOil: 0.3,
    alcoholExtract: 28.6,
    waterExtract: 18.2,
    acidInsolubleAsh: 0.8,
    activeMarker: "Withanolides",
    activeMarkerContent: 1.52,
    leadPpm: 0.18,
    arsenicPpm: 0.06,
    mercuryPpm: 0.003,
    cadmiumPpm: 0.04,
    yeastMold: 120,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.4,
    particleSize: "60 mesh",
    color: "Pale brownish-grey",
    odor: "Characteristic horse-like odour",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Pass",
    inspectorName: "Dr. Priya Sharma",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2027-01-07",
  },
  {
    id: -2n,
    batchId: "AY-2025-002",
    herbName: "Turmeric Rhizome",
    supplier: "Kerala Ayurveda Suppliers",
    region: "Kerala",
    dateReceived: "2025-01-15",
    moisture: 9.4,
    ash: 5.8,
    extractiveValue: 19.3,
    heavyMetals: 0.62,
    microbialCount: 1200,
    notes:
      "Deep orange-yellow powder with strong aromatic odour. Curcuminoid content 3.8% by UV-Vis. Slight clumping observed — recommend re-drying before use. Compliant with WHO 2021 monograph.",
    volatileOil: 3.2,
    alcoholExtract: 12.4,
    waterExtract: 8.6,
    acidInsolubleAsh: 1.1,
    activeMarker: "Curcuminoids",
    activeMarkerContent: 3.84,
    leadPpm: 0.22,
    arsenicPpm: 0.09,
    mercuryPpm: 0.004,
    cadmiumPpm: 0.06,
    yeastMold: 240,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.7,
    particleSize: "80 mesh",
    color: "Deep orange-yellow",
    odor: "Strong aromatic, characteristic",
    pharmacopeiaRef: "WHO 2021",
    qualityStatus: "Pass",
    inspectorName: "Mr. Rahul Nair",
    storageCondition: "Cool, dry place <25°C, away from light",
    expiryDate: "2027-01-14",
  },
  {
    id: -3n,
    batchId: "AY-2025-003",
    herbName: "Neem Leaf",
    supplier: "Nagarjuna Botanicals",
    region: "Maharashtra",
    dateReceived: "2025-01-22",
    moisture: 8.1,
    ash: 6.3,
    extractiveValue: 16.8,
    heavyMetals: 0.38,
    microbialCount: 2200,
    notes:
      "Dark green coarse powder with intense bitter odour. Azadirachtin content 0.12% verified. High microbial count requires attention — fumigation recommended before bulk storage.",
    volatileOil: 0.8,
    alcoholExtract: 20.1,
    waterExtract: 15.3,
    acidInsolubleAsh: 1.8,
    activeMarker: "Azadirachtin",
    activeMarkerContent: 0.12,
    leadPpm: 0.14,
    arsenicPpm: 0.05,
    mercuryPpm: 0.002,
    cadmiumPpm: 0.03,
    yeastMold: 380,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 1.1,
    particleSize: "40 mesh",
    color: "Dark green",
    odor: "Intensely bitter, characteristic",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Under Review",
    inspectorName: "Ms. Anjali Desai",
    storageCondition: "Cool, dry place <30°C",
    expiryDate: "2026-07-21",
  },
  {
    id: -4n,
    batchId: "AY-2025-004",
    herbName: "Tulsi Herb",
    supplier: "Patanjali Raw Materials",
    region: "Uttarakhand",
    dateReceived: "2025-02-03",
    moisture: 7.6,
    ash: 3.9,
    extractiveValue: 24.7,
    heavyMetals: 0.29,
    microbialCount: 600,
    notes:
      "Green aromatic powder. Eugenol content 0.72% by GC. Clean batch with excellent particle uniformity. Compliant with API 2022 monograph. Ideal for formulation use.",
    volatileOil: 1.9,
    alcoholExtract: 26.3,
    waterExtract: 21.4,
    acidInsolubleAsh: 0.6,
    activeMarker: "Eugenol",
    activeMarkerContent: 0.72,
    leadPpm: 0.1,
    arsenicPpm: 0.04,
    mercuryPpm: 0.001,
    cadmiumPpm: 0.02,
    yeastMold: 85,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.3,
    particleSize: "60 mesh",
    color: "Olive green",
    odor: "Pleasant, clove-like aromatic",
    pharmacopeiaRef: "API 2022",
    qualityStatus: "Pass",
    inspectorName: "Dr. Priya Sharma",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2027-02-02",
  },
  {
    id: -5n,
    batchId: "AY-2025-005",
    herbName: "Brahmi Herb",
    supplier: "Sandu Pharmaceuticals",
    region: "Gujarat",
    dateReceived: "2025-02-10",
    moisture: 8.8,
    ash: 4.7,
    extractiveValue: 28.1,
    heavyMetals: 0.51,
    microbialCount: 1100,
    notes:
      "Light greenish-brown powder with mild, slightly bitter taste. Bacoside A+B content 2.1% by HPLC. Uniform particle distribution. Batch meets IP 2022 requirements for cognitive herb formulations.",
    volatileOil: 0.2,
    alcoholExtract: 31.4,
    waterExtract: 24.6,
    acidInsolubleAsh: 0.9,
    activeMarker: "Bacosides A+B",
    activeMarkerContent: 2.08,
    leadPpm: 0.2,
    arsenicPpm: 0.07,
    mercuryPpm: 0.003,
    cadmiumPpm: 0.05,
    yeastMold: 160,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.5,
    particleSize: "60 mesh",
    color: "Light greenish-brown",
    odor: "Mild, slightly bitter",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Pass",
    inspectorName: "Mr. Suresh Kumar",
    storageCondition: "Cool, dry place <25°C, low humidity",
    expiryDate: "2027-02-09",
  },
  {
    id: -6n,
    batchId: "AY-2025-006",
    herbName: "Shatavari Root",
    supplier: "Dabur Herbs Division",
    region: "Madhya Pradesh",
    dateReceived: "2025-02-18",
    moisture: 10.2,
    ash: 3.2,
    extractiveValue: 30.5,
    heavyMetals: 0.35,
    microbialCount: 750,
    notes:
      "White to creamy white powder with slightly sweet taste. Saponin content 4.2% by gravimetric method. Excellent moisture content — monitor during long-term storage. Compliant with IP 2022.",
    volatileOil: 0.1,
    alcoholExtract: 34.8,
    waterExtract: 28.2,
    acidInsolubleAsh: 0.5,
    activeMarker: "Shatavarin (Saponins)",
    activeMarkerContent: 4.21,
    leadPpm: 0.13,
    arsenicPpm: 0.04,
    mercuryPpm: 0.002,
    cadmiumPpm: 0.03,
    yeastMold: 95,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.4,
    particleSize: "80 mesh",
    color: "White to creamy white",
    odor: "Slightly sweet, characteristic",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Pass",
    inspectorName: "Ms. Anjali Desai",
    storageCondition: "Refrigerated 2-8°C for long-term",
    expiryDate: "2027-02-17",
  },
  {
    id: -7n,
    batchId: "AY-2025-007",
    herbName: "Ginger Rhizome",
    supplier: "HerbCraft India",
    region: "Karnataka",
    dateReceived: "2025-03-01",
    moisture: 11.5,
    ash: 5.1,
    extractiveValue: 17.9,
    heavyMetals: 0.58,
    microbialCount: 1800,
    notes:
      "Light buff/tan coloured powder with pungent, spicy aroma. Gingerol content 1.8% by HPLC. High moisture — immediate re-drying advised before storage. Foreign matter slightly elevated.",
    volatileOil: 2.1,
    alcoholExtract: 22.3,
    waterExtract: 14.7,
    acidInsolubleAsh: 2.1,
    activeMarker: "Gingerols",
    activeMarkerContent: 1.78,
    leadPpm: 0.25,
    arsenicPpm: 0.1,
    mercuryPpm: 0.005,
    cadmiumPpm: 0.07,
    yeastMold: 320,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 1.4,
    particleSize: "60 mesh",
    color: "Light buff/tan",
    odor: "Pungent, spicy, characteristic",
    pharmacopeiaRef: "BP 2023",
    qualityStatus: "Under Review",
    inspectorName: "Mr. Rahul Nair",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2026-09-30",
  },
  {
    id: -8n,
    batchId: "AY-2025-008",
    herbName: "Amla Fruit",
    supplier: "Himalaya Herb Farm",
    region: "Himachal Pradesh",
    dateReceived: "2025-03-12",
    moisture: 8.9,
    ash: 2.8,
    extractiveValue: 32.4,
    heavyMetals: 0.22,
    microbialCount: 500,
    notes:
      "Dark greenish-brown powder with sour astringent taste. Vitamin C content 8.2% by iodometric titration. Tannin content 28%. Excellent antioxidant profile. Premium grade batch — suitable for nutraceutical use.",
    volatileOil: 0.1,
    alcoholExtract: 36.2,
    waterExtract: 30.8,
    acidInsolubleAsh: 0.4,
    activeMarker: "Gallotannins (Emblicanin A+B)",
    activeMarkerContent: 3.62,
    leadPpm: 0.08,
    arsenicPpm: 0.03,
    mercuryPpm: 0.001,
    cadmiumPpm: 0.02,
    yeastMold: 65,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.3,
    particleSize: "80 mesh",
    color: "Dark greenish-brown",
    odor: "Sour, slightly astringent",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Pass",
    inspectorName: "Dr. Priya Sharma",
    storageCondition: "Cool, dry place <25°C, airtight container",
    expiryDate: "2027-03-11",
  },
  {
    id: -9n,
    batchId: "AY-2025-009",
    herbName: "Guduchi Stem",
    supplier: "Kerala Ayurveda Suppliers",
    region: "Kerala",
    dateReceived: "2025-03-20",
    moisture: 9.3,
    ash: 5.5,
    extractiveValue: 26.8,
    heavyMetals: 0.44,
    microbialCount: 1350,
    notes:
      "Greyish-green fibrous powder with bitter taste. Tinosporin alkaloid content confirmed. Starch content high — indicative of stem-rich batch. Immuno-modulatory profile verified. Compliant with WHO monograph.",
    volatileOil: 0.2,
    alcoholExtract: 28.9,
    waterExtract: 22.4,
    acidInsolubleAsh: 1.0,
    activeMarker: "Tinosporin",
    activeMarkerContent: 1.34,
    leadPpm: 0.16,
    arsenicPpm: 0.06,
    mercuryPpm: 0.003,
    cadmiumPpm: 0.04,
    yeastMold: 180,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.6,
    particleSize: "40 mesh",
    color: "Greyish-green",
    odor: "Slightly bitter, earthy",
    pharmacopeiaRef: "WHO 2021",
    qualityStatus: "Pass",
    inspectorName: "Mr. Suresh Kumar",
    storageCondition: "Cool, dry place <30°C",
    expiryDate: "2027-03-19",
  },
  {
    id: -10n,
    batchId: "AY-2025-010",
    herbName: "Triphala Churna",
    supplier: "Nagarjuna Botanicals",
    region: "Andhra Pradesh",
    dateReceived: "2025-04-02",
    moisture: 7.8,
    ash: 4.4,
    extractiveValue: 25.6,
    heavyMetals: 0.52,
    microbialCount: 980,
    notes:
      "Dark brown mixed powder with sour-astringent taste. Blend ratio verified: Haritaki:Bibhitaki:Amla = 1:1:1. Tannic acid content 18.4%. Excellent bowel tonic formulation grade. Compliant with IP 2022.",
    volatileOil: 0.5,
    alcoholExtract: 28.1,
    waterExtract: 23.7,
    acidInsolubleAsh: 0.7,
    activeMarker: "Chebulinic Acid",
    activeMarkerContent: 2.18,
    leadPpm: 0.19,
    arsenicPpm: 0.07,
    mercuryPpm: 0.004,
    cadmiumPpm: 0.05,
    yeastMold: 145,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.5,
    particleSize: "60 mesh",
    color: "Dark brown",
    odor: "Sour-astringent, characteristic",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Pass",
    inspectorName: "Ms. Anjali Desai",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2027-04-01",
  },
  {
    id: -11n,
    batchId: "AY-2025-011",
    herbName: "Licorice Root",
    supplier: "Dabur Herbs Division",
    region: "Punjab",
    dateReceived: "2025-04-15",
    moisture: 9.7,
    ash: 6.8,
    extractiveValue: 31.2,
    heavyMetals: 0.68,
    microbialCount: 1600,
    notes:
      "Yellowish-brown fibrous powder with sweet taste. Glycyrrhizin content 3.6% by HPLC. Ash content slightly elevated — check supplier batch certificate. Useful for expectorant and anti-inflammatory formulations.",
    volatileOil: 0.3,
    alcoholExtract: 34.5,
    waterExtract: 27.8,
    acidInsolubleAsh: 2.4,
    activeMarker: "Glycyrrhizin",
    activeMarkerContent: 3.62,
    leadPpm: 0.28,
    arsenicPpm: 0.11,
    mercuryPpm: 0.005,
    cadmiumPpm: 0.08,
    yeastMold: 260,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.9,
    particleSize: "60 mesh",
    color: "Yellowish-brown",
    odor: "Sweet, characteristic licorice",
    pharmacopeiaRef: "BP 2023",
    qualityStatus: "Under Review",
    inspectorName: "Dr. Priya Sharma",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2026-10-14",
  },
  {
    id: -12n,
    batchId: "AY-2025-012",
    herbName: "Bael Fruit",
    supplier: "HerbCraft India",
    region: "Uttar Pradesh",
    dateReceived: "2025-04-28",
    moisture: 8.4,
    ash: 3.7,
    extractiveValue: 23.9,
    heavyMetals: 0.31,
    microbialCount: 720,
    notes:
      "Pale yellow to cream powder with sweet, slightly aromatic taste. Marmelosin content 0.42%. Pectin-rich — suitable for bowel tonic preparations. Excellent drying achieved. Compliant with API 2022.",
    volatileOil: 0.4,
    alcoholExtract: 26.7,
    waterExtract: 19.8,
    acidInsolubleAsh: 0.6,
    activeMarker: "Marmelosin",
    activeMarkerContent: 0.42,
    leadPpm: 0.12,
    arsenicPpm: 0.04,
    mercuryPpm: 0.002,
    cadmiumPpm: 0.03,
    yeastMold: 100,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.5,
    particleSize: "80 mesh",
    color: "Pale yellow to cream",
    odor: "Sweet, slightly aromatic",
    pharmacopeiaRef: "API 2022",
    qualityStatus: "Pass",
    inspectorName: "Mr. Rahul Nair",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2027-04-27",
  },
  {
    id: -13n,
    batchId: "AY-2025-013",
    herbName: "Punarnava Root",
    supplier: "Sandu Pharmaceuticals",
    region: "Rajasthan",
    dateReceived: "2025-05-08",
    moisture: 10.8,
    ash: 7.2,
    extractiveValue: 18.4,
    heavyMetals: 0.72,
    microbialCount: 2800,
    notes:
      "Reddish-brown fibrous powder with bitter, slightly astringent taste. Punarnavine alkaloid confirmed. High ash content — possible adulteration with root bark. FAIL: microbial count exceeds IP limits (max 2000 CFU/g). Quarantine batch.",
    volatileOil: 0.1,
    alcoholExtract: 20.6,
    waterExtract: 16.2,
    acidInsolubleAsh: 2.8,
    activeMarker: "Punarnavine",
    activeMarkerContent: 0.84,
    leadPpm: 0.32,
    arsenicPpm: 0.14,
    mercuryPpm: 0.006,
    cadmiumPpm: 0.09,
    yeastMold: 480,
    ecoli: "Present",
    salmonella: "Absent",
    foreignMatter: 1.5,
    particleSize: "40 mesh",
    color: "Reddish-brown",
    odor: "Bitter, slightly astringent",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Fail",
    inspectorName: "Mr. Suresh Kumar",
    storageCondition: "Quarantined — do not use",
    expiryDate: "2026-05-07",
  },
  {
    id: -14n,
    batchId: "AY-2025-014",
    herbName: "Karela Fruit",
    supplier: "Patanjali Raw Materials",
    region: "Haryana",
    dateReceived: "2025-05-20",
    moisture: 9.1,
    ash: 4.9,
    extractiveValue: 21.7,
    heavyMetals: 0.41,
    microbialCount: 1050,
    notes:
      "Greenish-brown powder with intensely bitter taste. Charantin content 0.28% verified. Momordicin confirmed. Blood sugar modulating profile intact. Compliant with WHO monograph for antidiabetic herbs.",
    volatileOil: 0.2,
    alcoholExtract: 24.8,
    waterExtract: 18.5,
    acidInsolubleAsh: 1.2,
    activeMarker: "Charantin",
    activeMarkerContent: 0.28,
    leadPpm: 0.15,
    arsenicPpm: 0.05,
    mercuryPpm: 0.003,
    cadmiumPpm: 0.04,
    yeastMold: 155,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.7,
    particleSize: "60 mesh",
    color: "Greenish-brown",
    odor: "Intensely bitter, characteristic",
    pharmacopeiaRef: "WHO 2021",
    qualityStatus: "Pass",
    inspectorName: "Ms. Anjali Desai",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2027-05-19",
  },
  {
    id: -15n,
    batchId: "AY-2025-015",
    herbName: "Haritaki Fruit",
    supplier: "Kerala Ayurveda Suppliers",
    region: "Tamil Nadu",
    dateReceived: "2025-06-05",
    moisture: 7.5,
    ash: 3.4,
    extractiveValue: 29.8,
    heavyMetals: 0.27,
    microbialCount: 680,
    notes:
      "Dark brownish-black powder with astringent, bitter taste. Chebulic acid 4.8% by HPLC. Gallic acid content confirmed. Superior grade — suitable for rasayana preparations. One of the best batches received this quarter.",
    volatileOil: 0.1,
    alcoholExtract: 32.4,
    waterExtract: 27.1,
    acidInsolubleAsh: 0.5,
    activeMarker: "Chebulic Acid",
    activeMarkerContent: 4.82,
    leadPpm: 0.09,
    arsenicPpm: 0.03,
    mercuryPpm: 0.001,
    cadmiumPpm: 0.02,
    yeastMold: 78,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.3,
    particleSize: "80 mesh",
    color: "Dark brownish-black",
    odor: "Astringent, mildly pungent",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Pass",
    inspectorName: "Dr. Priya Sharma",
    storageCondition: "Cool, dry place <25°C, airtight",
    expiryDate: "2027-06-04",
  },
  {
    id: -16n,
    batchId: "AY-2025-016",
    herbName: "Bibhitaki Fruit",
    supplier: "Nagarjuna Botanicals",
    region: "Odisha",
    dateReceived: "2025-06-18",
    moisture: 8.3,
    ash: 3.9,
    extractiveValue: 27.4,
    heavyMetals: 0.35,
    microbialCount: 820,
    notes:
      "Greyish-brown powder with astringent taste. Gallic acid content 2.4%. Tannin content 16.8%. Good drying achieved. Used in Triphala formulations — ensure uniform blending with other components.",
    volatileOil: 0.1,
    alcoholExtract: 29.8,
    waterExtract: 25.2,
    acidInsolubleAsh: 0.6,
    activeMarker: "Gallic Acid",
    activeMarkerContent: 2.42,
    leadPpm: 0.12,
    arsenicPpm: 0.04,
    mercuryPpm: 0.002,
    cadmiumPpm: 0.03,
    yeastMold: 110,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.4,
    particleSize: "80 mesh",
    color: "Greyish-brown",
    odor: "Mildly astringent",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Pass",
    inspectorName: "Mr. Rahul Nair",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2027-06-17",
  },
  {
    id: -17n,
    batchId: "AY-2025-017",
    herbName: "Fennel Seed",
    supplier: "HerbCraft India",
    region: "Gujarat",
    dateReceived: "2025-07-02",
    moisture: 8.7,
    ash: 7.8,
    extractiveValue: 20.3,
    heavyMetals: 0.89,
    microbialCount: 1900,
    notes:
      "Greenish-yellow aromatic powder with anise-like odour. Anethole content 2.8% by GC. High ash content — review supplier source. Slightly elevated heavy metals warrant further investigation. Placed under review pending repeat testing.",
    volatileOil: 2.8,
    alcoholExtract: 22.6,
    waterExtract: 15.4,
    acidInsolubleAsh: 2.2,
    activeMarker: "trans-Anethole",
    activeMarkerContent: 2.82,
    leadPpm: 0.38,
    arsenicPpm: 0.16,
    mercuryPpm: 0.007,
    cadmiumPpm: 0.11,
    yeastMold: 290,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 1.0,
    particleSize: "60 mesh",
    color: "Greenish-yellow",
    odor: "Anise-like, pleasant aromatic",
    pharmacopeiaRef: "BP 2023",
    qualityStatus: "Under Review",
    inspectorName: "Mr. Suresh Kumar",
    storageCondition: "Cool, dry place <25°C, away from light",
    expiryDate: "2026-07-01",
  },
  {
    id: -18n,
    batchId: "AY-2025-018",
    herbName: "Clove Bud",
    supplier: "Sandu Pharmaceuticals",
    region: "Kerala",
    dateReceived: "2025-07-15",
    moisture: 9.8,
    ash: 5.6,
    extractiveValue: 15.2,
    heavyMetals: 0.48,
    microbialCount: 760,
    notes:
      "Dark brown aromatic powder with intensely spicy clove odour. Eugenol content 14.8% by GC-MS — excellent. Volatile oil content at upper acceptable limit. Suitable for dental and antiseptic formulations. Premium batch.",
    volatileOil: 14.8,
    alcoholExtract: 62.4,
    waterExtract: 8.2,
    acidInsolubleAsh: 0.5,
    activeMarker: "Eugenol",
    activeMarkerContent: 14.82,
    leadPpm: 0.17,
    arsenicPpm: 0.06,
    mercuryPpm: 0.003,
    cadmiumPpm: 0.04,
    yeastMold: 105,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.6,
    particleSize: "60 mesh",
    color: "Dark brown",
    odor: "Intensely spicy, clove-characteristic",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Pass",
    inspectorName: "Ms. Anjali Desai",
    storageCondition: "Cool, dry place <20°C, airtight",
    expiryDate: "2027-07-14",
  },
  {
    id: -19n,
    batchId: "AY-2025-019",
    herbName: "Vijayasar Heartwood",
    supplier: "Dabur Herbs Division",
    region: "Madhya Pradesh",
    dateReceived: "2025-08-01",
    moisture: 7.1,
    ash: 2.9,
    extractiveValue: 33.8,
    heavyMetals: 0.24,
    microbialCount: 450,
    notes:
      "Reddish-brown coarse powder with slightly astringent taste. Pterostilbene content 0.92% by HPLC. Kino tannin profile confirmed. Blood sugar modulating activity validated. AYUSH 2022 approved herb — excellent compliance record.",
    volatileOil: 0.1,
    alcoholExtract: 38.4,
    waterExtract: 28.6,
    acidInsolubleAsh: 0.4,
    activeMarker: "Pterostilbene",
    activeMarkerContent: 0.92,
    leadPpm: 0.08,
    arsenicPpm: 0.03,
    mercuryPpm: 0.001,
    cadmiumPpm: 0.02,
    yeastMold: 55,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.3,
    particleSize: "40 mesh",
    color: "Reddish-brown",
    odor: "Mildly astringent, woody",
    pharmacopeiaRef: "AYUSH 2022",
    qualityStatus: "Pass",
    inspectorName: "Dr. Priya Sharma",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2027-07-31",
  },
  {
    id: -20n,
    batchId: "AY-2025-020",
    herbName: "Giloy Stem",
    supplier: "Patanjali Raw Materials",
    region: "Uttarakhand",
    dateReceived: "2025-08-14",
    moisture: 9.6,
    ash: 4.8,
    extractiveValue: 25.1,
    heavyMetals: 0.57,
    microbialCount: 1400,
    notes:
      "Light grey-brown powder with bitter taste. Berberine content 0.68% by HPLC. Tinosporide confirmed. Immuno-modulating profile verified. Compliant with IP 2022. Suitable for immunity-booster and anti-pyretic formulations. Standard pharmaceutical grade.",
    volatileOil: 0.2,
    alcoholExtract: 27.8,
    waterExtract: 21.6,
    acidInsolubleAsh: 1.1,
    activeMarker: "Berberine",
    activeMarkerContent: 0.68,
    leadPpm: 0.21,
    arsenicPpm: 0.08,
    mercuryPpm: 0.004,
    cadmiumPpm: 0.05,
    yeastMold: 195,
    ecoli: "Absent",
    salmonella: "Absent",
    foreignMatter: 0.6,
    particleSize: "60 mesh",
    color: "Light grey-brown",
    odor: "Bitter, slightly earthy",
    pharmacopeiaRef: "IP 2022",
    qualityStatus: "Pass",
    inspectorName: "Mr. Rahul Nair",
    storageCondition: "Cool, dry place <25°C",
    expiryDate: "2027-08-13",
  },
];

function isSome<T>(opt: Option<T>): opt is { __kind__: "Some"; value: T } {
  return opt.__kind__ === "Some";
}

type DisplayBatch = {
  id: bigint;
  batchId: string;
  herbName: string;
  supplier: string;
  region: string;
  dateReceived: string;
  moisture: number;
  ash: number;
  extractiveValue: number;
  heavyMetals: number;
  microbialCount: number;
  notes: string;
  volatileOil?: number;
  alcoholExtract?: number;
  waterExtract?: number;
  acidInsolubleAsh?: number;
  activeMarker?: string;
  activeMarkerContent?: number;
  leadPpm?: number;
  arsenicPpm?: number;
  mercuryPpm?: number;
  cadmiumPpm?: number;
  yeastMold?: number;
  ecoli?: string;
  salmonella?: string;
  foreignMatter?: number;
  particleSize?: string;
  color?: string;
  odor?: string;
  pharmacopeiaRef?: string;
  qualityStatus?: "Pass" | "Fail" | "Under Review" | "Approved" | "Rejected";
  inspectorName?: string;
  storageCondition?: string;
  expiryDate?: string;
};

type EditableParams = {
  moisture: number;
  ash: number;
  extractiveValue: number;
  heavyMetals: number;
  microbialCount: number;
};

function computeLocalAnalysis(
  batch: DisplayBatch,
  overrides?: Partial<EditableParams>,
): AnalysisResult {
  const p = {
    moisture: overrides?.moisture ?? batch.moisture,
    ash: overrides?.ash ?? batch.ash,
    extractiveValue: overrides?.extractiveValue ?? batch.extractiveValue,
    heavyMetals: overrides?.heavyMetals ?? batch.heavyMetals,
    microbialCount: overrides?.microbialCount ?? batch.microbialCount,
  };

  const moistureOk = p.moisture <= 12;
  const ashOk = p.ash <= 8;
  const extractiveOk = p.extractiveValue >= 15;
  const heavyMetalsOk = p.heavyMetals <= 1.0;
  const microbialOk = p.microbialCount <= 10000;

  const qualityScore =
    (moistureOk ? 20 : 0) +
    (ashOk ? 20 : 0) +
    (extractiveOk ? 20 : 0) +
    (heavyMetalsOk ? 20 : 0) +
    (microbialOk ? 20 : 0);

  const status = qualityScore >= 60 ? "Accept" : "Reject";

  const anomalyDetails: string[] = [];
  if (!moistureOk && p.moisture > 12 * 2)
    anomalyDetails.push("Moisture (>2x limit)");
  if (!ashOk && p.ash > 8 * 2) anomalyDetails.push("Ash (>2x limit)");
  if (!extractiveOk && p.extractiveValue < 15 / 2)
    anomalyDetails.push("Extractive Value (<50% of limit)");
  if (!heavyMetalsOk && p.heavyMetals > 1.0 * 2)
    anomalyDetails.push("Heavy Metals (>2x limit)");
  if (!microbialOk && p.microbialCount > 10000 * 2)
    anomalyDetails.push("Microbial Count (>2x limit)");

  const anomaly = anomalyDetails.length > 0;

  return {
    batchId: batch.batchId,
    herbName: batch.herbName,
    supplier: batch.supplier,
    region: batch.region,
    dateReceived: batch.dateReceived,
    qualityScore,
    status,
    probability: qualityScore / 100,
    anomaly,
    anomalyDetails: anomalyDetails.join("; "),
    moistureOk,
    ashOk,
    extractiveOk,
    heavyMetalsOk,
    microbialOk,
    timestamp: BigInt(Date.now()),
  };
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Pass")
    return (
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border text-xs">
        Pass
      </Badge>
    );
  if (status === "Fail")
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border text-xs">
        Fail
      </Badge>
    );
  if (status === "Under Review")
    return (
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 border text-xs">
        Under Review
      </Badge>
    );
  if (status === "Approved")
    return (
      <Badge className="bg-emerald-600/20 text-emerald-500 border-emerald-600/30 border text-xs font-semibold">
        ✓ Approved
      </Badge>
    );
  if (status === "Rejected")
    return (
      <Badge className="bg-red-600/20 text-red-500 border-red-600/30 border text-xs font-semibold">
        ✗ Rejected
      </Badge>
    );
  return (
    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 border text-xs">
      {status}
    </Badge>
  );
}

function DetailRow({
  label,
  value,
  unit,
}: { label: string; value?: string | number | null; unit?: string }) {
  const display =
    value === undefined || value === null || value === ""
      ? "N/A"
      : unit
        ? `${value} ${unit}`
        : String(value);
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{display}</span>
    </div>
  );
}

function HeavyMetalCard({
  metal,
  value,
  limit,
}: { metal: string; value?: number; limit: string }) {
  const ok = value !== undefined && value <= Number.parseFloat(limit);
  return (
    <div className="bg-input/30 rounded-lg p-3 border border-border/30">
      <div className="text-xs text-muted-foreground mb-1">{metal}</div>
      <div
        className="text-sm font-bold font-mono"
        style={{ color: ok ? "oklch(0.64 0.168 145)" : "oklch(0.54 0.174 24)" }}
      >
        {value !== undefined ? `${value} ppm` : "N/A"}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        Limit: ≤{limit} ppm
      </div>
    </div>
  );
}

// ---- Analysis Result Dialog ----

type AnalysisParamCardProps = {
  label: string;
  value: number;
  limit: string;
  unit: string;
  pass: boolean;
  onChange: (val: number) => void;
  inputId: string;
};

function AnalysisParamCard({
  label,
  value,
  limit,
  unit,
  pass,
  onChange,
  inputId,
}: AnalysisParamCardProps) {
  return (
    <div
      className="rounded-xl border p-3 flex flex-col gap-2"
      style={{
        background: pass
          ? "oklch(0.28 0.06 145 / 0.2)"
          : "oklch(0.28 0.06 24 / 0.2)",
        borderColor: pass
          ? "oklch(0.64 0.168 145 / 0.35)"
          : "oklch(0.54 0.174 24 / 0.35)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {pass ? (
          <span
            className="flex items-center gap-1 text-xs font-bold"
            style={{ color: "oklch(0.64 0.168 145)" }}
          >
            <CheckCircle2 size={13} /> PASS
          </span>
        ) : (
          <span
            className="flex items-center gap-1 text-xs font-bold"
            style={{ color: "oklch(0.64 0.174 24)" }}
          >
            <XCircle size={13} /> FAIL
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          id={inputId}
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
          className="h-8 text-sm font-mono bg-input/40 border-border/50 w-28"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="text-xs text-muted-foreground">Limit: {limit}</div>
    </div>
  );
}

function AnalysisResultDialog({
  open,
  onClose,
  result,
  batch,
  onResultChange,
}: {
  open: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  batch: DisplayBatch | null;
  onResultChange: (
    newResult: AnalysisResult,
    newParams: EditableParams,
  ) => void;
}) {
  const [params, setParams] = useState<EditableParams | null>(null);

  // Sync params when dialog opens with new result
  if (result && batch && params === null) {
    setParams({
      moisture: batch.moisture,
      ash: batch.ash,
      extractiveValue: batch.extractiveValue,
      heavyMetals: batch.heavyMetals,
      microbialCount: batch.microbialCount,
    });
  }

  if (!result || !batch || !params) return null;

  const handleReanalyze = () => {
    const newResult = computeLocalAnalysis(batch, params);
    onResultChange(newResult, params);
    toast.success(
      `Re-analyzed: Score ${newResult.qualityScore.toFixed(0)} — ${newResult.status}`,
    );
  };

  const scoreColor =
    result.status === "Accept"
      ? "oklch(0.64 0.168 145)"
      : "oklch(0.64 0.174 24)";

  const scorePercent = Math.min(100, Math.max(0, result.qualityScore));

  const handleClose = () => {
    setParams(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-2xl w-full bg-card border border-border/60 text-foreground p-0 overflow-hidden"
        style={{ maxHeight: "90vh" }}
        data-ocid="analysis.dialog"
      >
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <FlaskConical size={18} className="text-primary" />
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Analysis Result
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-mono text-amber-400">
                  {result.batchId}
                </span>
                {" — "}
                {result.herbName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea style={{ maxHeight: "calc(90vh - 160px)" }}>
          <div className="px-6 py-5 space-y-6">
            {/* Score gauge */}
            <div className="flex items-center gap-6 glass-card rounded-xl p-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Quality Score
                  </span>
                  <span
                    className="text-2xl font-bold font-mono"
                    style={{ color: scoreColor }}
                  >
                    {result.qualityScore.toFixed(0)}
                    <span className="text-sm text-muted-foreground">/100</span>
                  </span>
                </div>
                <Progress
                  value={scorePercent}
                  className="h-3 bg-input/50"
                  style={{
                    // @ts-ignore
                    "--progress-background": scoreColor,
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    Probability: {(result.probability * 100).toFixed(0)}%
                  </span>
                  <Badge
                    className="text-xs font-bold"
                    style={{
                      background:
                        result.status === "Accept"
                          ? "oklch(0.28 0.12 145 / 0.4)"
                          : "oklch(0.28 0.12 24 / 0.4)",
                      color: scoreColor,
                      border: `1px solid ${scoreColor}40`,
                    }}
                  >
                    {result.status === "Accept" ? "✓ ACCEPT" : "✗ REJECT"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Anomaly alert */}
            {result.anomaly && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 rounded-xl p-3 border"
                style={{
                  background: "oklch(0.28 0.08 60 / 0.25)",
                  borderColor: "oklch(0.74 0.15 60 / 0.4)",
                }}
              >
                <AlertTriangle
                  size={16}
                  style={{
                    color: "oklch(0.74 0.15 60)",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                />
                <div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: "oklch(0.74 0.15 60)" }}
                  >
                    Anomaly Detected
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {result.anomalyDetails}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Editable parameter cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Parameter Analysis
                  <span className="ml-2 text-primary/70 normal-case font-normal">
                    (editable — change values and re-analyze)
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AnalysisParamCard
                  inputId="analysis-moisture"
                  label="Moisture"
                  value={params.moisture}
                  limit="≤ 12%"
                  unit="%"
                  pass={result.moistureOk}
                  onChange={(v) =>
                    setParams((prev) =>
                      prev ? { ...prev, moisture: v } : prev,
                    )
                  }
                />
                <AnalysisParamCard
                  inputId="analysis-ash"
                  label="Total Ash"
                  value={params.ash}
                  limit="≤ 8%"
                  unit="%"
                  pass={result.ashOk}
                  onChange={(v) =>
                    setParams((prev) => (prev ? { ...prev, ash: v } : prev))
                  }
                />
                <AnalysisParamCard
                  inputId="analysis-extractive"
                  label="Extractive Value"
                  value={params.extractiveValue}
                  limit="≥ 15%"
                  unit="%"
                  pass={result.extractiveOk}
                  onChange={(v) =>
                    setParams((prev) =>
                      prev ? { ...prev, extractiveValue: v } : prev,
                    )
                  }
                />
                <AnalysisParamCard
                  inputId="analysis-heavymetals"
                  label="Heavy Metals"
                  value={params.heavyMetals}
                  limit="≤ 1.0 ppm"
                  unit="ppm"
                  pass={result.heavyMetalsOk}
                  onChange={(v) =>
                    setParams((prev) =>
                      prev ? { ...prev, heavyMetals: v } : prev,
                    )
                  }
                />
                <div className="col-span-2">
                  <AnalysisParamCard
                    inputId="analysis-microbial"
                    label="Microbial Count"
                    value={params.microbialCount}
                    limit="≤ 10,000 CFU/g"
                    unit="CFU/g"
                    pass={result.microbialOk}
                    onChange={(v) =>
                      setParams((prev) =>
                        prev ? { ...prev, microbialCount: v } : prev,
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-input/20 rounded-lg p-3 border border-border/30">
                <Label className="text-muted-foreground text-xs">
                  Supplier
                </Label>
                <div className="text-foreground font-medium mt-1">
                  {result.supplier}
                </div>
              </div>
              <div className="bg-input/20 rounded-lg p-3 border border-border/30">
                <Label className="text-muted-foreground text-xs">Region</Label>
                <div className="text-foreground font-medium mt-1">
                  {result.region}
                </div>
              </div>
              <div className="bg-input/20 rounded-lg p-3 border border-border/30">
                <Label className="text-muted-foreground text-xs">
                  Date Received
                </Label>
                <div className="text-foreground font-medium mt-1">
                  {result.dateReceived}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={handleClose}
            data-ocid="analysis.close_button"
          >
            Close
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
              onClick={handleReanalyze}
              data-ocid="analysis.secondary_button"
            >
              <RefreshCw size={12} /> Re-analyze
            </Button>
            <Button
              size="sm"
              className="text-xs gap-1.5 bg-primary/90 text-primary-foreground hover:opacity-80"
              onClick={() => {
                toast.success(`Parameters saved for ${result.batchId}`);
                handleClose();
              }}
              data-ocid="analysis.save_button"
            >
              <Save size={12} /> Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Batch Detail Dialog ----

function BatchDetailDialog({
  batch,
  open,
  onClose,
  onAnalyze,
  onUpdateStatus,
}: {
  batch: DisplayBatch | null;
  open: boolean;
  onClose: () => void;
  onAnalyze?: (id: bigint, batchId: string) => void;
  onUpdateStatus?: (
    batchId: string,
    newStatus: "Approved" | "Rejected",
  ) => void;
}) {
  if (!batch) return null;
  const status = batch.qualityStatus ?? "Pending";
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-3xl w-full bg-card border border-border/60 text-foreground p-0 overflow-hidden"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-base font-bold text-amber-400">
                  {batch.batchId}
                </span>
                <StatusBadge status={status} />
                {batch.pharmacopeiaRef && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-medium">
                    {batch.pharmacopeiaRef}
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {batch.herbName}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(92vh-180px)]">
          <div className="px-6 py-4 space-y-5">
            {/* General Info */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                General Information
              </h3>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <DetailRow label="Supplier" value={batch.supplier} />
                  <DetailRow label="Region" value={batch.region} />
                  <DetailRow label="Date Received" value={batch.dateReceived} />
                </div>
                <div>
                  <DetailRow label="Expiry Date" value={batch.expiryDate} />
                  <DetailRow label="Inspector" value={batch.inspectorName} />
                  <DetailRow
                    label="Storage Condition"
                    value={batch.storageCondition}
                  />
                </div>
              </div>
            </section>

            <Separator className="bg-border/30" />

            {/* Physicochemical */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Physicochemical Parameters
              </h3>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <DetailRow
                    label="Moisture Content"
                    value={batch.moisture.toFixed(1)}
                    unit="%"
                  />
                  <DetailRow
                    label="Total Ash"
                    value={batch.ash.toFixed(1)}
                    unit="%"
                  />
                  <DetailRow
                    label="Acid-Insoluble Ash"
                    value={batch.acidInsolubleAsh?.toFixed(2)}
                    unit="%"
                  />
                  <DetailRow
                    label="Extractive Value"
                    value={batch.extractiveValue.toFixed(1)}
                    unit="%"
                  />
                </div>
                <div>
                  <DetailRow
                    label="Alcohol-Soluble Extractive"
                    value={batch.alcoholExtract?.toFixed(1)}
                    unit="%"
                  />
                  <DetailRow
                    label="Water-Soluble Extractive"
                    value={batch.waterExtract?.toFixed(1)}
                    unit="%"
                  />
                  <DetailRow
                    label="Volatile Oil"
                    value={batch.volatileOil?.toFixed(1)}
                    unit="%"
                  />
                  <DetailRow
                    label="Foreign Matter"
                    value={batch.foreignMatter?.toFixed(1)}
                    unit="%"
                  />
                </div>
              </div>
              <div className="mt-2 flex gap-6">
                <DetailRow label="Particle Size" value={batch.particleSize} />
                <DetailRow label="Color" value={batch.color} />
                <DetailRow label="Odor" value={batch.odor} />
              </div>
            </section>

            <Separator className="bg-border/30" />

            {/* Heavy Metals */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Heavy Metals Panel (IP 2022 Limits)
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <HeavyMetalCard
                  metal="Lead (Pb)"
                  value={batch.leadPpm}
                  limit="1.0"
                />
                <HeavyMetalCard
                  metal="Arsenic (As)"
                  value={batch.arsenicPpm}
                  limit="0.5"
                />
                <HeavyMetalCard
                  metal="Mercury (Hg)"
                  value={batch.mercuryPpm}
                  limit="0.1"
                />
                <HeavyMetalCard
                  metal="Cadmium (Cd)"
                  value={batch.cadmiumPpm}
                  limit="0.3"
                />
              </div>
              <div className="mt-2">
                <DetailRow
                  label="Total Heavy Metals"
                  value={batch.heavyMetals.toFixed(3)}
                  unit="ppm"
                />
              </div>
            </section>

            <Separator className="bg-border/30" />

            {/* Active Marker */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Active Marker Profile
              </h3>
              <div className="grid grid-cols-2 gap-x-8">
                <DetailRow label="Active Marker" value={batch.activeMarker} />
                <DetailRow
                  label="Marker Content"
                  value={batch.activeMarkerContent?.toFixed(2)}
                  unit="%"
                />
              </div>
            </section>

            <Separator className="bg-border/30" />

            {/* Microbial */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Microbial Profile
              </h3>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <DetailRow
                    label="Total Microbial Count"
                    value={batch.microbialCount.toFixed(0)}
                    unit="CFU/g"
                  />
                  <DetailRow
                    label="Yeast & Mold"
                    value={batch.yeastMold?.toFixed(0)}
                    unit="CFU/g"
                  />
                </div>
                <div>
                  <DetailRow label="E. coli" value={batch.ecoli} />
                  <DetailRow label="Salmonella" value={batch.salmonella} />
                </div>
              </div>
            </section>

            <Separator className="bg-border/30" />

            {/* Quality & Compliance */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Quality & Compliance
              </h3>
              <div className="grid grid-cols-2 gap-x-8 mb-3">
                <DetailRow label="Quality Status" value={status} />
                <DetailRow
                  label="Pharmacopeia Reference"
                  value={batch.pharmacopeiaRef}
                />
              </div>
              <div className="bg-input/20 rounded-lg p-3 border border-border/30">
                <div className="text-xs text-muted-foreground mb-1">
                  Quality Notes
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {batch.notes || "No notes available"}
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Admin Review */}
        {isAdminAuthed() && (
          <div
            className="px-6 py-4 border-t border-border/40"
            style={{ background: "oklch(0.35 0.08 250 / 0.04)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} style={{ color: "oklch(0.35 0.08 250)" }} />
              <h3
                className="text-xs font-bold tracking-wider uppercase"
                style={{ color: "oklch(0.35 0.08 250)" }}
              >
                Admin Review
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Review all test parameters above before approving.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                data-ocid="batch.approve.button"
                size="sm"
                className="text-xs gap-1.5 font-semibold"
                style={{
                  background: "oklch(0.42 0.14 145)",
                  color: "oklch(1.0 0 0)",
                }}
                disabled={status === "Approved"}
                onClick={() => {
                  onUpdateStatus?.(batch.batchId, "Approved");
                  toast.success(`Batch ${batch.batchId} approved`);
                }}
              >
                ✓ Approve Batch
              </Button>
              <Button
                data-ocid="batch.reject.button"
                size="sm"
                variant="destructive"
                className="text-xs gap-1.5 font-semibold"
                disabled={status === "Rejected"}
                onClick={() => {
                  onUpdateStatus?.(batch.batchId, "Rejected");
                  toast.error(`Batch ${batch.batchId} rejected`);
                }}
              >
                ✗ Reject Batch
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Batch ID:{" "}
            <span className="font-mono text-amber-400">{batch.batchId}</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="bg-primary/90 text-primary-foreground hover:opacity-80 text-xs gap-1.5"
              onClick={() => {
                onAnalyze?.(batch.id, batch.batchId);
                onClose();
              }}
            >
              <FlaskConical size={12} /> Analyze Batch
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BatchRecords({
  onNavigateAnalysis,
}: { onNavigateAnalysis?: () => void }) {
  const { data: batches = [], isLoading } = useAllBatches();
  const deleteBatch = useDeleteBatch();
  const analyzeBatch = useAnalyzeBatch();
  const [deletedSeedBatchIds, setDeletedSeedBatchIds] = React.useState<
    Set<string>
  >(() => getDeletedSeedBatchIds());
  const [search, setSearch] = useState("");
  const [analyzingId, setAnalyzingId] = useState<bigint | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [analysisBatch, setAnalysisBatch] = useState<DisplayBatch | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<DisplayBatch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, "Approved" | "Rejected">
  >({});

  // Get latest analysis results from localStorage to show current status in table
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional refresh on state changes
  const localAnalysisMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const a of getLocalAnalyses()) {
      map.set(a.batchId, a.status === "Accept" ? "Pass" : "Fail");
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedSeedBatchIds, analysisResult]);

  const handleUpdateBatchStatus = (
    batchId: string,
    newStatus: "Approved" | "Rejected",
  ) => {
    setStatusOverrides((prev) => ({ ...prev, [batchId]: newStatus }));
    if (selectedBatch && selectedBatch.batchId === batchId) {
      setSelectedBatch({ ...selectedBatch, qualityStatus: newStatus });
    }
  };

  const allBatches: DisplayBatch[] = [
    ...SEED_BATCHES.filter((b) => !deletedSeedBatchIds.has(b.batchId)),
    ...batches,
  ].map((b) =>
    statusOverrides[b.batchId]
      ? { ...b, qualityStatus: statusOverrides[b.batchId] }
      : b,
  );

  const filtered = allBatches.filter(
    (b) =>
      b.batchId.toLowerCase().includes(search.toLowerCase()) ||
      b.herbName.toLowerCase().includes(search.toLowerCase()) ||
      b.supplier.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAnalyze = async (id: bigint, batchId: string) => {
    setAnalyzingId(id);
    const batch = allBatches.find((b) => b.id === id) ?? null;
    try {
      if (id < 0n) {
        // Seed batch: compute locally
        if (!batch) {
          toast.error("Batch data not found");
          return;
        }
        const result = computeLocalAnalysis(batch);
        saveLocalAnalysis(result);
        setAnalysisResult(result);
        setAnalysisBatch(batch);
        setAnalysisDialogOpen(true);
        toast.success(
          `Analysis complete for ${batchId}: Score ${result.qualityScore.toFixed(0)} — ${result.status}`,
        );
      } else {
        // Real backend batch
        const result = await analyzeBatch.mutateAsync(id);
        if (isSome(result)) {
          setAnalysisResult(result.value);
          setAnalysisBatch(batch);
          setAnalysisDialogOpen(true);
          toast.success(
            `Analysis complete for ${batchId}: Score ${result.value.qualityScore.toFixed(1)} — ${result.value.status}`,
          );
        } else {
          toast.error("Analysis returned no result");
        }
      }
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (id: bigint, batchId: string) => {
    if (id < 0n) {
      // Seed batch: delete from localStorage only
      deleteSeedBatch(batchId);
      setDeletedSeedBatchIds(getDeletedSeedBatchIds());
      toast.success(`Batch ${batchId} deleted`);
      return;
    }
    try {
      await deleteBatch.mutateAsync(id);
      toast.success(`Batch ${batchId} deleted`);
    } catch {
      toast.error("Delete failed — only admins can delete backend batches");
    }
  };

  const handleRowClick = (batch: DisplayBatch) => {
    setSelectedBatch(batch);
    setDialogOpen(true);
  };

  const totalCount = allBatches.length;

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Database size={16} className="text-gold" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Batch Records
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Raw Material Batches
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {totalCount} total batches registered
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              data-ocid="batches.search_input"
              className="w-56 bg-input/50 border border-border/50 text-foreground placeholder:text-muted-foreground h-8 text-sm"
              placeholder="Search batches…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 glass-card rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div
            data-ocid="batches.loading_state"
            className="py-16 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">
                Loading batches…
              </span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div data-ocid="batches.empty_state" className="py-16 text-center">
            <Database
              size={40}
              className="mx-auto text-muted-foreground mb-3 opacity-40"
            />
            <div className="text-sm text-muted-foreground">
              No batches found
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="batches.table">
              <thead>
                <tr className="border-b border-border/40">
                  {[
                    "Batch ID",
                    "Herb Name",
                    "Supplier",
                    "Region",
                    "Date",
                    "Moisture%",
                    "Ash%",
                    "Extract%",
                    "Heavy (ppm)",
                    "Microbial",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const analysedStatus = localAnalysisMap.get(b.batchId);
                  const rowStatus =
                    statusOverrides[b.batchId] ??
                    analysedStatus ??
                    b.qualityStatus ??
                    "Pending";
                  return (
                    <tr
                      key={b.batchId}
                      data-ocid={`batches.item.${i + 1}`}
                      className="border-b border-border/20 hover:bg-accent/20 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(b)}
                      onKeyDown={(e) => e.key === "Enter" && handleRowClick(b)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-amber-400 font-semibold">
                        {b.batchId}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {b.herbName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {b.supplier}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {b.region}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {b.dateReceived}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.moisture.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.ash.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.extractiveValue.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.heavyMetals.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.microbialCount.toFixed(0)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={rowStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            data-ocid={`batches.edit_button.${i + 1}`}
                            disabled={analyzingId === b.id}
                            onClick={() => handleAnalyze(b.id, b.batchId)}
                            className="h-7 text-xs bg-primary/90 text-primary-foreground hover:opacity-80 px-2 gap-1"
                          >
                            {analyzingId === b.id ? (
                              <span className="flex items-center gap-1">
                                <span className="w-3 h-3 border border-primary-foreground border-t-transparent rounded-full animate-spin" />{" "}
                                Analyzing…
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FlaskConical size={11} /> Analyze
                              </span>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`batches.delete_button.${i + 1}`}
                            onClick={() => handleDelete(b.id, b.batchId)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <BatchDetailDialog
        batch={selectedBatch}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onUpdateStatus={handleUpdateBatchStatus}
        onAnalyze={handleAnalyze}
      />

      <AnalysisResultDialog
        open={analysisDialogOpen}
        onClose={() => {
          setAnalysisDialogOpen(false);
          setAnalysisResult(null);
          setAnalysisBatch(null);
        }}
        result={analysisResult}
        batch={analysisBatch}
        onResultChange={(newResult, _newParams) => {
          setAnalysisResult(newResult);
        }}
      />

      {/* Unused but kept for type compatibility */}
      {onNavigateAnalysis && null}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Award,
  Beaker,
  ClipboardList,
  Download,
  FlaskConical,
  History,
  Inbox,
  Microscope,
  Search,
  Tag,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  useAllAnalyses,
  useAllAnalysesMerged,
  useAllBatches,
} from "../hooks/useQueries";

interface SavedFormulation {
  id: string;
  name: string;
  dosageForm: string;
  method: string;
  createdAt: string;
  ingredientCount: number;
  ownerName: string;
  institution?: string;
  designation?: string;
  stabilityScore?: number;
  shelfLife?: number;
  ingredients?: {
    name: string;
    qty: number;
    unit: string;
    category?: string;
  }[];
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase?.() ?? "";
  if (s === "pass" || s === "approved")
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
        Pass
      </Badge>
    );
  if (s === "fail" || s === "rejected")
    return (
      <Badge className="bg-red-50 text-red-600 border-red-200 hover:bg-red-50">
        Fail
      </Badge>
    );
  return (
    <Badge className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50">
      {status || "Pending"}
    </Badge>
  );
}

function RiskBadge({ score }: { score: number }) {
  if (score >= 75)
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
        Low
      </Badge>
    );
  if (score >= 50)
    return (
      <Badge className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50">
        Medium
      </Badge>
    );
  return (
    <Badge className="bg-red-50 text-red-600 border-red-200 hover:bg-red-50">
      High
    </Badge>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-ocid="history.empty_state"
    >
      <Inbox size={40} className="text-muted-foreground mb-3 opacity-40" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1 opacity-60">
        Records will appear here once data is available
      </p>
    </div>
  );
}

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const csvContent = [headers, ...rows]
    .map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function generateHistoryCertPDF(
  f: SavedFormulation,
  idx: number,
): Promise<void> {
  const _jsPDFMod = await (Function(
    'return import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js")',
  )() as Promise<any>);
  const jsPDF = _jsPDFMod.default ?? _jsPDFMod.jsPDF;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, 297, "F");
  for (let i = -297; i < pageW + 297; i += 8) {
    doc.setDrawColor(235, 245, 235);
    doc.setLineWidth(0.3);
    doc.line(i, 0, i + 297, 297);
  }
  doc.setDrawColor(180, 130, 30);
  doc.setLineWidth(3);
  doc.rect(6, 6, pageW - 12, 285, "S");
  doc.setDrawColor(20, 83, 45);
  doc.setLineWidth(1);
  doc.rect(12, 12, pageW - 24, 273, "S");
  for (const [cx, cy] of [
    [12, 12],
    [pageW - 12, 12],
    [12, 285],
    [pageW - 12, 285],
  ] as [number, number][]) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 130, 30);
    doc.text("◆", cx, cy + 1, { align: "center" });
  }
  doc.setFillColor(20, 83, 45);
  doc.rect(12, 12, pageW - 24, 32, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("AyurNexis 3.1", 22, 26);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(167, 243, 208);
  doc.text("AI-Enabled Ayurvedic QA Platform", 22, 33);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 220, 100);
  doc.text("ISO 9001:2015 | IP 2022", pageW - 22, 26, { align: "right" });
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(167, 243, 208);
  doc.text("Pharmacopeia Compliant", pageW - 22, 33, { align: "right" });

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 83, 45);
  doc.text("CERTIFICATE OF FORMULATION EXCELLENCE", pageW / 2, 58, {
    align: "center",
  });
  doc.setDrawColor(180, 130, 30);
  doc.setLineWidth(0.7);
  doc.line(25, 63, pageW - 25, 63);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("THIS IS TO CERTIFY THAT", pageW / 2, 72, { align: "center" });
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 83, 45);
  doc.text((f.ownerName || "Formulator").toUpperCase(), pageW / 2, 83, {
    align: "center",
  });
  if (f.designation) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);
    doc.text(f.designation, pageW / 2, 91, { align: "center" });
  }
  if (f.institution) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(f.institution, pageW / 2, 99, { align: "center" });
  }
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(
    "has successfully developed, validated, and documented the following pharmaceutical",
    pageW / 2,
    110,
    { align: "center" },
  );
  doc.text(
    "formulation using AyurNexis 3.1 AI-Enabled Ayurvedic Quality Assurance Platform.",
    pageW / 2,
    117,
    { align: "center" },
  );

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(20, 83, 45);
  doc.setLineWidth(0.5);
  doc.rect(22, 123, pageW - 44, 32, "FD");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 83, 45);
  doc.text(
    (f.name || `${f.dosageForm} Formulation`).toUpperCase(),
    pageW / 2,
    135,
    { align: "center" },
  );
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const dateStr = f.createdAt
    ? new Date(f.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
  doc.text(
    `${f.dosageForm}  ·  ${f.method}  ·  ${f.ingredientCount ?? f.ingredients?.length ?? 0} Ingredients  ·  ${dateStr}`,
    pageW / 2,
    145,
    { align: "center" },
  );

  const ings = f.ingredients ?? [];
  if (ings.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 83, 45);
    doc.text("Composition", 22, 165);
    doc.setFillColor(20, 83, 45);
    doc.rect(22, 167, pageW - 44, 7, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Ingredient", 25, 172.5);
    doc.text("Qty", 125, 172.5, { align: "right" });
    doc.text("Unit", 145, 172.5, { align: "right" });
    const maxRows = Math.min(ings.length, 8);
    for (let i = 0; i < maxRows; i++) {
      const row = ings[i];
      const ry = 174 + i * 7;
      if (i % 2 === 0) {
        doc.setFillColor(248, 252, 248);
        doc.rect(22, ry, pageW - 44, 7, "F");
      }
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(
        row.name.length > 55 ? `${row.name.slice(0, 55)}…` : row.name,
        25,
        ry + 5,
      );
      doc.text(String(row.qty), 125, ry + 5, { align: "right" });
      doc.text(row.unit, 145, ry + 5, { align: "right" });
    }
  }

  const stabScore = f.stabilityScore ?? 75;
  const shelfLife = f.shelfLife ?? 24;
  const overallScore = stabScore;
  const approved = overallScore >= 70;

  const metricsY =
    ings.length > 0 ? 174 + Math.min(ings.length, 8) * 7 + 8 : 170;
  doc.setFillColor(248, 252, 248);
  doc.setDrawColor(20, 83, 45);
  doc.setLineWidth(0.3);
  doc.rect(22, metricsY, (pageW - 48) / 2, 22, "FD");
  doc.rect(22 + (pageW - 48) / 2 + 4, metricsY, (pageW - 48) / 2, 22, "FD");
  const col1x = 22 + (pageW - 48) / 4;
  const col2x = 22 + ((pageW - 48) * 3) / 4 + 4;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Stability Score", col1x, metricsY + 7, { align: "center" });
  doc.text(`${stabScore}/100`, col1x, metricsY + 14, { align: "center" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Shelf Life: ${shelfLife} months`, col1x, metricsY + 19, {
    align: "center",
  });
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Overall Score", col2x, metricsY + 7, { align: "center" });
  doc.text(`${overallScore}/100`, col2x, metricsY + 14, { align: "center" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    approved ? "Pharmacopeia Compliant" : "Below Threshold",
    col2x,
    metricsY + 19,
    { align: "center" },
  );

  const bannerY = metricsY + 27;
  doc.setFillColor(approved ? 20 : 180, approved ? 83 : 30, approved ? 45 : 30);
  doc.rect(22, bannerY, pageW - 44, 13, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(
    approved
      ? "✓  APPROVED FOR PLATFORM RELEASE"
      : "✗  NOT APPROVED — QUALITY SCORE BELOW THRESHOLD",
    pageW / 2,
    bannerY + 9,
    { align: "center" },
  );

  const sigY = bannerY + 22;
  const sigCols = [pageW * 0.2, pageW / 2, pageW * 0.8];
  const sigLabels = ["Formulator", "QA Head", "Platform Authority"];
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  for (let s = 0; s < 3; s++) {
    doc.line(sigCols[s] - 22, sigY, sigCols[s] + 22, sigY);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(sigLabels[s], sigCols[s], sigY + 6, { align: "center" });
    if (s === 0 && f.ownerName)
      doc.text(f.ownerName, sigCols[s], sigY + 11, { align: "center" });
  }

  const certNum = f.id || `AYN-CERT-${idx + 1}`;
  doc.setFillColor(20, 83, 45);
  doc.rect(12, 276, pageW - 24, 9, "F");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(167, 243, 208);
  doc.text(`Certificate No.: ${certNum}`, 20, 281.5);
  doc.text(`Issue Date: ${dateStr}`, pageW / 2, 281.5, { align: "center" });
  doc.text("AyurNexis 3.1 | ayurnexis.platform", pageW - 20, 281.5, {
    align: "right",
  });

  doc.save(`${f.name || f.dosageForm || "formulation"}_certificate.pdf`);
}

async function generateHistoryLabelPDF(f: SavedFormulation): Promise<void> {
  const _jsPDFMod = await (Function(
    'return import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js")',
  )() as Promise<any>);
  const jsPDF = _jsPDFMod.default ?? _jsPDFMod.jsPDF;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [148, 105],
  });
  const W = 148;
  const H = 105;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");
  doc.setDrawColor(20, 83, 45);
  doc.setLineWidth(1.5);
  doc.rect(4, 4, W - 8, H - 8, "S");
  doc.setLineWidth(0.4);
  doc.rect(7, 7, W - 14, H - 14, "S");
  doc.setFillColor(20, 83, 45);
  doc.rect(7, 7, W - 14, 20, "F");
  const prodName = (f.name || `${f.dosageForm} Formulation`).toUpperCase();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(
    prodName.length > 35 ? `${prodName.slice(0, 35)}…` : prodName,
    W / 2,
    16,
    { align: "center" },
  );
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(167, 243, 208);
  doc.text("Manufactured by AyurNexis Formulation Lab", W / 2, 22, {
    align: "center",
  });

  doc.setFillColor(255, 220, 100);
  doc.rect(10, 30, 35, 7, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 40, 0);
  doc.text((f.dosageForm || "").toUpperCase(), 27.5, 35.5, { align: "center" });

  const ings = f.ingredients ?? [];
  if (ings.length > 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 83, 45);
    doc.text("Composition:", 10, 44);
    doc.setFillColor(20, 83, 45);
    doc.rect(10, 45, W - 20, 5.5, "F");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Ingredient", 12, 49);
    doc.text("Qty", 100, 49, { align: "right" });
    doc.text("Unit", 118, 49, { align: "right" });
    const maxRows = Math.min(ings.length, 6);
    for (let i = 0; i < maxRows; i++) {
      const row = ings[i];
      const ry = 50.5 + i * 6;
      if (i % 2 === 0) {
        doc.setFillColor(245, 252, 245);
        doc.rect(10, ry, W - 20, 6, "F");
      }
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(
        row.name.length > 52 ? `${row.name.slice(0, 52)}…` : row.name,
        12,
        ry + 4.2,
      );
      doc.text(String(row.qty), 100, ry + 4.2, { align: "right" });
      doc.text(row.unit, 118, ry + 4.2, { align: "right" });
    }
  }

  const stabScore = f.stabilityScore ?? 75;
  const overallScore = stabScore;
  const approved = overallScore >= 70;
  const dateStr = f.createdAt
    ? new Date(f.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
  const bottomY =
    ings.length > 0 ? 50.5 + Math.min(ings.length, 6) * 6 + 5 : 44;

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(
    "Storage: Store at 25°C ± 2°C / 60% RH. Keep in cool dry place, away from light.",
    10,
    bottomY,
  );
  doc.text(
    `Formulator: ${f.ownerName || "—"}${f.institution ? `  |  ${f.institution}` : ""}`,
    10,
    bottomY + 5,
  );
  doc.text(`Date: ${dateStr}`, 10, bottomY + 10);

  const approvalY = H - 20;
  doc.setFillColor(approved ? 20 : 180, approved ? 83 : 30, approved ? 45 : 30);
  doc.rect(7, approvalY, W - 14, 9, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(
    approved
      ? "✓ APPROVED FOR PLATFORM RELEASE"
      : "✗ NOT APPROVED FOR MARKET RELEASE",
    W / 2,
    approvalY + 6,
    { align: "center" },
  );

  doc.setFillColor(240, 253, 244);
  doc.rect(7, H - 11, W - 14, 4, "F");
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 120, 80);
  doc.text(
    `Score: ${overallScore}/100  |  AyurNexis 3.1 — AI-Enabled Ayurvedic QA Platform`,
    W / 2,
    H - 8,
    { align: "center" },
  );

  doc.save(`${f.name || f.dosageForm || "formulation"}_label.pdf`);
}

export function HistoryPage() {
  const { data: batches = [], isLoading: batchLoading } = useAllBatches();
  const { data: analyses2 = [] } = useAllAnalysesMerged();
  const { data: analyses = [], isLoading: analysisLoading } = useAllAnalyses();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [formulations, setFormulations] = useState<SavedFormulation[]>(() => {
    try {
      const raw = localStorage.getItem("ayurnexis_formulations");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("ayurnexis_formulations");
        setFormulations(raw ? JSON.parse(raw) : []);
      } catch {
        setFormulations([]);
      }
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const q = search.toLowerCase();

  const filteredBatches = useMemo(
    () =>
      batches.filter(
        (b) =>
          !q ||
          b.batchId?.toLowerCase().includes(q) ||
          b.herbName?.toLowerCase().includes(q) ||
          b.supplier?.toLowerCase().includes(q),
      ),
    [batches, q],
  );

  const filteredAnalyses = useMemo(
    () =>
      analyses.filter(
        (a) =>
          !q ||
          (a as any).analysisId?.toLowerCase().includes(q) ||
          a.batchId?.toLowerCase().includes(q),
      ),
    [analyses, q],
  );

  const filteredFormulations = useMemo(
    () =>
      formulations.filter(
        (f) =>
          !q ||
          f.name?.toLowerCase().includes(q) ||
          f.dosageForm?.toLowerCase().includes(q) ||
          f.ownerName?.toLowerCase().includes(q),
      ),
    [formulations, q],
  );

  const filteredPredictions = useMemo(
    () =>
      analyses2
        .filter((b) => b.qualityScore !== undefined && b.qualityScore !== null)
        .filter(
          (b) =>
            !q ||
            b.batchId?.toLowerCase().includes(q) ||
            b.herbName?.toLowerCase().includes(q),
        ),
    [analyses2, q],
  );

  const allCount =
    filteredBatches.length +
    filteredAnalyses.length +
    filteredFormulations.length +
    filteredPredictions.length;

  const formatDate = (dateStr: string | undefined | number) => {
    if (!dateStr) return "—";
    try {
      return new Date(Number(dateStr) || dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className=""
      >
        <div className="flex items-center gap-2 mb-1">
          <History size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            System Activity
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Activity History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete audit trail of all QA activities, batch intakes, analyses,
          and formulations
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          data-ocid="history.search_input"
          placeholder="Search across all history…"
          className="pl-9 h-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex flex-wrap gap-1">
          <TabsTrigger
            data-ocid="history.all.tab"
            value="all"
            className="text-xs"
          >
            All ({allCount})
          </TabsTrigger>
          <TabsTrigger
            data-ocid="history.batch.tab"
            value="batches"
            className="text-xs"
          >
            <FlaskConical size={12} className="mr-1" />
            Batch Intake ({filteredBatches.length})
          </TabsTrigger>
          <TabsTrigger
            data-ocid="history.analysis.tab"
            value="analyses"
            className="text-xs"
          >
            <Microscope size={12} className="mr-1" />
            Quality Analysis ({filteredAnalyses.length})
          </TabsTrigger>
          <TabsTrigger
            data-ocid="history.formulation.tab"
            value="formulations"
            className="text-xs"
          >
            <Beaker size={12} className="mr-1" />
            Formulations ({filteredFormulations.length})
          </TabsTrigger>
          <TabsTrigger
            data-ocid="history.prediction.tab"
            value="predictions"
            className="text-xs"
          >
            <TrendingUp size={12} className="mr-1" />
            Predictions ({filteredPredictions.length})
          </TabsTrigger>
        </TabsList>

        {/* ── ALL ── */}
        <TabsContent value="all" className="mt-4 space-y-6">
          {allCount === 0 ? (
            <EmptyState label="No records found" />
          ) : (
            <>
              {filteredBatches.length > 0 && (
                <Section
                  title="Batch Intake"
                  icon={<FlaskConical size={14} className="text-primary" />}
                  count={filteredBatches.length}
                >
                  <BatchTable
                    batches={filteredBatches.slice(0, 5)}
                    formatDate={formatDate}
                    loading={batchLoading}
                  />
                </Section>
              )}
              {filteredAnalyses.length > 0 && (
                <Section
                  title="Quality Analysis"
                  icon={<Microscope size={14} className="text-primary" />}
                  count={filteredAnalyses.length}
                >
                  <AnalysisTable
                    analyses={filteredAnalyses.slice(0, 5)}
                    formatDate={formatDate}
                    loading={analysisLoading}
                  />
                </Section>
              )}
              {filteredFormulations.length > 0 && (
                <Section
                  title="Formulations"
                  icon={<Beaker size={14} className="text-primary" />}
                  count={filteredFormulations.length}
                >
                  <FormulationTable
                    formulations={filteredFormulations.slice(0, 5)}
                    formatDate={formatDate}
                  />
                </Section>
              )}
              {filteredPredictions.length > 0 && (
                <Section
                  title="Predictions"
                  icon={<TrendingUp size={14} className="text-primary" />}
                  count={filteredPredictions.length}
                >
                  <PredictionTable
                    batches={filteredPredictions.slice(0, 5)}
                    formatDate={formatDate}
                  />
                </Section>
              )}
            </>
          )}
        </TabsContent>

        {/* ── BATCH INTAKE ── */}
        <TabsContent value="batches" className="mt-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <ClipboardList size={14} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Batch Intake Records
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {filteredBatches.length}
                </Badge>
              </div>
              <Button
                data-ocid="history.batch.download_button"
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  downloadCSV(
                    "batch-history.csv",
                    filteredBatches.map((b) => [
                      formatDate(b.dateReceived),
                      b.batchId ?? "",
                      b.herbName ?? "",
                      b.supplier ?? "",
                      (b as any).status ?? "",
                      String((b as any).qualityScore ?? ""),
                    ]),
                    [
                      "Date",
                      "Batch ID",
                      "Material",
                      "Supplier",
                      "Status",
                      "Quality Score",
                    ],
                  )
                }
              >
                <Download size={12} /> Export CSV
              </Button>
            </div>
            <ScrollArea className="max-h-[500px]">
              <BatchTable
                batches={filteredBatches}
                formatDate={formatDate}
                loading={batchLoading}
              />
            </ScrollArea>
          </div>
        </TabsContent>

        {/* ── QUALITY ANALYSIS ── */}
        <TabsContent value="analyses" className="mt-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Quality Analysis Records
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {filteredAnalyses.length}
                </Badge>
              </div>
              <Button
                data-ocid="history.analysis.download_button"
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  downloadCSV(
                    "analysis-history.csv",
                    filteredAnalyses.map((a) => [
                      formatDate(a.dateReceived),
                      (a as any).analysisId ?? a.batchId ?? "",
                      a.batchId ?? "",
                      a.status ?? "",
                    ]),
                    ["Date", "Analysis ID", "Batch ID", "Status"],
                  )
                }
              >
                <Download size={12} /> Export CSV
              </Button>
            </div>
            <ScrollArea className="max-h-[500px]">
              <AnalysisTable
                analyses={filteredAnalyses}
                formatDate={formatDate}
                loading={analysisLoading}
              />
            </ScrollArea>
          </div>
        </TabsContent>

        {/* ── FORMULATIONS ── */}
        <TabsContent value="formulations" className="mt-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Beaker size={14} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Formulation Sessions
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {filteredFormulations.length}
                </Badge>
              </div>
              <Button
                data-ocid="history.formulation.download_button"
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  downloadCSV(
                    "formulation-history.csv",
                    filteredFormulations.map((f) => [
                      formatDate(f.createdAt),
                      f.name ?? "",
                      f.dosageForm ?? "",
                      f.method ?? "",
                      String(f.ingredientCount ?? ""),
                      f.ownerName ?? "",
                    ]),
                    [
                      "Date",
                      "Formulation Name",
                      "Dosage Form",
                      "Method",
                      "Ingredients",
                      "Owner",
                    ],
                  )
                }
              >
                <Download size={12} /> Export CSV
              </Button>
            </div>
            <ScrollArea className="max-h-[500px]">
              <FormulationTable
                formulations={filteredFormulations}
                formatDate={formatDate}
              />
            </ScrollArea>
          </div>
        </TabsContent>

        {/* ── PREDICTIONS ── */}
        <TabsContent value="predictions" className="mt-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Prediction History
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {filteredPredictions.length}
                </Badge>
              </div>
              <Button
                data-ocid="history.prediction.download_button"
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  downloadCSV(
                    "prediction-history.csv",
                    filteredPredictions.map((b) => [
                      formatDate(b.dateReceived),
                      b.batchId ?? "",
                      b.herbName ?? "",
                      String(Number(b.qualityScore).toFixed(1)),
                      Number(b.qualityScore) >= 75
                        ? "Low"
                        : Number(b.qualityScore) >= 50
                          ? "Medium"
                          : "High",
                    ]),
                    [
                      "Date",
                      "Batch ID",
                      "Material",
                      "Predicted Score",
                      "Risk Level",
                    ],
                  )
                }
              >
                <Download size={12} /> Export CSV
              </Button>
            </div>
            <ScrollArea className="max-h-[500px]">
              <PredictionTable
                batches={filteredPredictions}
                formatDate={formatDate}
              />
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
        {icon}
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <Badge variant="outline" className="text-[10px]">
          {count}
        </Badge>
      </div>
      {children}
    </div>
  );
}

function BatchTable({
  batches,
  formatDate,
  loading,
}: {
  batches: any[];
  formatDate: (d: any) => string;
  loading?: boolean;
}) {
  if (loading)
    return (
      <div className="p-4 space-y-2">
        {[...Array(3)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  if (batches.length === 0) return <EmptyState label="No batch records yet" />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Date</TableHead>
          <TableHead className="text-xs">Batch ID</TableHead>
          <TableHead className="text-xs">Material</TableHead>
          <TableHead className="text-xs">Supplier</TableHead>
          <TableHead className="text-xs">Status</TableHead>
          <TableHead className="text-xs text-right">Quality Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((b, idx) => (
          <TableRow
            key={b.batchId ?? idx}
            data-ocid={`history.batch.item.${idx + 1}`}
          >
            <TableCell className="text-xs text-muted-foreground">
              {formatDate(b.dateReceived)}
            </TableCell>
            <TableCell className="text-xs font-mono font-medium">
              {b.batchId}
            </TableCell>
            <TableCell className="text-xs">{b.herbName}</TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {b.supplier}
            </TableCell>
            <TableCell>
              <StatusBadge status={(b as any).status} />
            </TableCell>
            <TableCell className="text-xs text-right font-semibold">
              {(b as any).qualityScore !== undefined &&
              (b as any).qualityScore !== null
                ? Number((b as any).qualityScore).toFixed(1)
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AnalysisTable({
  analyses,
  formatDate,
  loading,
}: {
  analyses: any[];
  formatDate: (d: any) => string;
  loading?: boolean;
}) {
  if (loading)
    return (
      <div className="p-4 space-y-2">
        {[...Array(3)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  if (analyses.length === 0)
    return <EmptyState label="No analysis records yet" />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Date</TableHead>
          <TableHead className="text-xs">Analysis ID</TableHead>
          <TableHead className="text-xs">Batch ID</TableHead>
          <TableHead className="text-xs">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {analyses.map((a, idx) => (
          <TableRow
            key={a.analysisId ?? idx}
            data-ocid={`history.analysis.item.${idx + 1}`}
          >
            <TableCell className="text-xs text-muted-foreground">
              {formatDate(a.dateReceived)}
            </TableCell>
            <TableCell className="text-xs font-mono">
              {(a as any).analysisId ?? a.batchId}
            </TableCell>
            <TableCell className="text-xs font-mono">{a.batchId}</TableCell>
            <TableCell>
              <StatusBadge status={a.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function FormulationTable({
  formulations,
  formatDate,
}: {
  formulations: SavedFormulation[];
  formatDate: (d: any) => string;
}) {
  const [certLoading, setCertLoading] = useState<string | null>(null);
  const [labelLoading, setLabelLoading] = useState<string | null>(null);

  if (formulations.length === 0)
    return <EmptyState label="No formulation sessions saved yet" />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Date</TableHead>
          <TableHead className="text-xs">Formulation Name</TableHead>
          <TableHead className="text-xs">Dosage Form</TableHead>
          <TableHead className="text-xs">Method</TableHead>
          <TableHead className="text-xs">Ingredients</TableHead>
          <TableHead className="text-xs">Owner</TableHead>
          <TableHead className="text-xs">Certificate</TableHead>
          <TableHead className="text-xs">Label</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {formulations.map((f, idx) => (
          <TableRow
            key={f.id ?? idx}
            data-ocid={`history.formulation.item.${idx + 1}`}
          >
            <TableCell className="text-xs text-muted-foreground">
              {formatDate(f.createdAt)}
            </TableCell>
            <TableCell className="text-xs font-medium">
              {f.name || "Unnamed"}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-[10px]">
                {f.dosageForm}
              </Badge>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {f.method}
            </TableCell>
            <TableCell className="text-xs text-center">
              {f.ingredientCount ?? f.ingredients?.length ?? "—"}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {f.ownerName || "—"}
            </TableCell>
            <TableCell>
              <button
                type="button"
                title="Download Certificate"
                data-ocid={`history.formulation.certificate.${idx + 1}`}
                disabled={certLoading === (f.id ?? String(idx))}
                className="p-1.5 rounded hover:bg-emerald-50 text-emerald-700 disabled:opacity-50 transition-colors"
                onClick={async () => {
                  const key = f.id ?? String(idx);
                  setCertLoading(key);
                  try {
                    await generateHistoryCertPDF(f, idx);
                  } finally {
                    setCertLoading(null);
                  }
                }}
              >
                {certLoading === (f.id ?? String(idx)) ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Award size={14} />
                )}
              </button>
            </TableCell>
            <TableCell>
              <button
                type="button"
                title="Download Label"
                data-ocid={`history.formulation.label.${idx + 1}`}
                disabled={labelLoading === (f.id ?? String(idx))}
                className="p-1.5 rounded hover:bg-blue-50 text-blue-700 disabled:opacity-50 transition-colors"
                onClick={async () => {
                  const key = f.id ?? String(idx);
                  setLabelLoading(key);
                  try {
                    await generateHistoryLabelPDF(f);
                  } finally {
                    setLabelLoading(null);
                  }
                }}
              >
                {labelLoading === (f.id ?? String(idx)) ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Tag size={14} />
                )}
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PredictionTable({
  batches,
  formatDate,
}: {
  batches: any[];
  formatDate: (d: any) => string;
}) {
  if (batches.length === 0)
    return <EmptyState label="No prediction data yet" />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Date</TableHead>
          <TableHead className="text-xs">Batch ID</TableHead>
          <TableHead className="text-xs">Material</TableHead>
          <TableHead className="text-xs">Predicted Score</TableHead>
          <TableHead className="text-xs">Risk Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((b, idx) => (
          <TableRow
            key={b.batchId ?? idx}
            data-ocid={`history.prediction.item.${idx + 1}`}
          >
            <TableCell className="text-xs text-muted-foreground">
              {formatDate(b.dateReceived)}
            </TableCell>
            <TableCell className="text-xs font-mono font-medium">
              {b.batchId}
            </TableCell>
            <TableCell className="text-xs">{b.herbName}</TableCell>
            <TableCell className="text-xs font-semibold">
              {Number(b.qualityScore).toFixed(1)}
            </TableCell>
            <TableCell>
              <RiskBadge score={Number(b.qualityScore)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

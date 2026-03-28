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
import { jsPDF } from "@/utils/pdfLib";
import autoTable from "jspdf-autotable";
import {
  Activity,
  Award,
  Beaker,
  ClipboardList,
  Download,
  FileText,
  FlaskConical,
  History,
  Inbox,
  Microscope,
  Search,
  Tag,
  Trash2,
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
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // Outer teal border
  doc.setDrawColor(0, 137, 123);
  doc.setLineWidth(0.8);
  doc.rect(M - 5, M - 5, W - (M - 5) * 2, H - (M - 5) * 2, "S");

  // Header band: light teal
  doc.setFillColor(232, 245, 240);
  doc.rect(M - 5, M - 5, W - (M - 5) * 2, 28, "F");
  doc.setDrawColor(0, 137, 123);
  doc.setLineWidth(0.5);
  doc.line(M - 5, M + 23, W - M + 5, M + 23);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("AyurNexis 3.1", M, M + 7);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Pharmacopeia-Compliant QA Platform", M, M + 13);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 96, 100);
  doc.text("ISO 9001:2015 | IP 2022 | BP 2023", W - M, M + 7, {
    align: "right",
  });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Certificate of Analysis", W - M, M + 13, { align: "right" });

  // Title
  let y = M + 38;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("CERTIFICATE OF PHARMACEUTICAL FORMULATION", W / 2, y, {
    align: "center",
  });
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This certifies that the following formulation has been evaluated in compliance with pharmacopeia guidelines",
    W / 2,
    y,
    { align: "center" },
  );
  y += 3;
  doc.setDrawColor(0, 137, 123);
  doc.setLineWidth(0.4);
  doc.line(M, y + 2, W - M, y + 2);
  y += 9;

  // Formulator and formulation info boxes
  const dateStr = f.createdAt
    ? new Date(Number(f.createdAt) || f.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const halfW = (W - M * 2 - 4) / 2;
  doc.setFillColor(246, 246, 246);
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(0.3);
  doc.rect(M, y, halfW, 24, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Formulator", M + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  doc.text((f.ownerName || "—").slice(0, 32), M + 4, y + 15);
  if (f.designation) {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(f.designation.slice(0, 38), M + 4, y + 21);
  }

  const col2x = M + halfW + 4;
  doc.setFillColor(232, 245, 240);
  doc.setDrawColor(0, 137, 123);
  doc.setLineWidth(0.3);
  doc.rect(col2x, y, halfW, 24, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("Formulation", col2x + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(
    (f.name || `${f.dosageForm} Formulation`).slice(0, 36),
    col2x + 4,
    y + 15,
  );
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`${f.dosageForm} · ${f.method} · ${dateStr}`, col2x + 4, y + 21);
  y += 30;

  if (f.institution) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Institution: ${f.institution}`, M, y + 4);
    const certNum = f.id || `AYN-CERT-${idx + 1}`;
    doc.text(`Certificate No: ${certNum}`, W - M, y + 4, { align: "right" });
    y += 10;
  }

  // Composition
  const ings = f.ingredients ?? [];
  if (ings.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(27, 94, 32);
    doc.text("Composition", M, y + 4);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Ingredient", "Quantity", "Unit"]],
      body: ings.slice(0, 10).map((i) => [i.name, String(i.qty), i.unit]),
      theme: "striped",
      headStyles: { fillColor: [0, 137, 123], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [245, 250, 250] },
      margin: { left: M, right: M },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Quality metrics
  const stabScore = f.stabilityScore ?? 75;
  const overallScore = stabScore;
  const approved = overallScore >= 70;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("Quality Metrics", M, y);
  y += 4;
  const metrics = [
    ["Stability Score", `${stabScore}/100`],
    ["Shelf Life", `${f.shelfLife ?? 24} months`],
    ["Overall Score", `${overallScore}/100`],
    ["Assessment", approved ? "Compliant" : "Review Required"],
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
    doc.setTextColor(27, 94, 32);
    doc.text(metrics[i][1], bx + 4, by + 10);
  }
  y += 34;

  // Approval banner
  if (approved) {
    doc.setFillColor(200, 230, 201);
    doc.setDrawColor(76, 175, 80);
  } else {
    doc.setFillColor(255, 205, 210);
    doc.setDrawColor(229, 115, 115);
  }
  doc.setLineWidth(0.5);
  doc.rect(M, y, W - M * 2, 14, "FD");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(approved ? 27 : 183, approved ? 94 : 28, approved ? 32 : 28);
  doc.text(
    approved
      ? "✓  APPROVED FOR PLATFORM RELEASE"
      : "✗  NOT APPROVED — QUALITY SCORE BELOW THRESHOLD",
    W / 2,
    y + 10,
    { align: "center" },
  );
  y += 20;

  // Signature lines
  const sigCols = [M + 20, W / 2, W - M - 20];
  const sigLabels = ["Formulator", "QA Director", "Platform Authority"];
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  for (let s = 0; s < 3; s++) {
    doc.line(sigCols[s] - 22, y, sigCols[s] + 22, y);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(sigLabels[s], sigCols[s], y + 5, { align: "center" });
    if (s === 0 && f.ownerName) {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(f.ownerName, sigCols[s], y + 11, { align: "center" });
    }
  }

  // Footer
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  const certNum2 = f.id || `AYN-CERT-${idx + 1}`;
  doc.text(
    `Certificate No.: ${certNum2}  |  Issue Date: ${dateStr}`,
    W / 2,
    H - M + 5,
    { align: "center" },
  );
  doc.text(
    "AyurNexis 3.1 | Pharmacopeia Compliant | IP 2022 | BP 2023",
    W / 2,
    H - M + 10,
    { align: "center" },
  );

  doc.save(`${f.name || f.dosageForm || "formulation"}_certificate.pdf`);
}

async function generateHistoryLabelPDF(f: SavedFormulation): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [148, 105],
  });
  const W = 148;
  const H = 105;
  const M = 6;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(M, M, W - M * 2, H - M * 2, "S");

  const prodName = (f.name || `${f.dosageForm} Formulation`).toUpperCase();
  const ndcNum = `6529-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 90 + 10)}`;
  const expDate = new Date();
  expDate.setMonth(expDate.getMonth() + 24);
  const expStr = `${String(expDate.getMonth() + 1).padStart(2, "0")}/${expDate.getFullYear()}`;
  const lotNum = `LOT${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;

  // Top strip
  doc.setFillColor(255, 255, 255);
  doc.rect(M + 0.5, M + 0.5, W - M * 2 - 1, 14, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(
    prodName.length > 32 ? `${prodName.slice(0, 32)}…` : prodName,
    M + 4,
    M + 9,
  );
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Rx Only", W - M - 4, M + 9, { align: "right" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`NDC ${ndcNum}`, W - M - 4, M + 14, { align: "right" });

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(M, M + 14, W - M, M + 14);

  let y = M + 18;

  const ings = f.ingredients ?? [];
  const activeIngs = ings.filter((i) =>
    ["api", "herb", "extract"].includes((i as any).category || ""),
  );
  const inactiveIngs = ings.filter(
    (i) => !["api", "herb", "extract"].includes((i as any).category || ""),
  );

  // Active ingredients
  doc.setFillColor(220, 220, 220);
  doc.rect(M + 0.5, y, W - M * 2 - 1, 5.5, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("ACTIVE INGREDIENTS", M + 3, y + 4);
  y += 6;
  for (const ing of (activeIngs.length > 0
    ? activeIngs
    : ings.slice(0, 3)
  ).slice(0, 4)) {
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(ing.name, M + 3, y + 3.5);
    doc.text(`${ing.qty} ${ing.unit}`, W - M - 4, y + 3.5, { align: "right" });
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(M + 0.5, y + 5, W - M - 0.5, y + 5);
    y += 5.5;
  }

  // Inactive ingredients
  if (inactiveIngs.length > 0) {
    y += 1;
    doc.setFillColor(220, 220, 220);
    doc.rect(M + 0.5, y, W - M * 2 - 1, 5.5, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("EXCIPIENTS", M + 3, y + 4);
    y += 6;
    const excipText = inactiveIngs.map((i) => i.name).join(", ");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    const exLines = doc.splitTextToSize(excipText, W - M * 2 - 6);
    doc.text(exLines.slice(0, 2), M + 3, y + 3.5);
    y += Math.min(exLines.length, 2) * 4.5 + 2;
  }

  // Storage + lot/expiry
  y = Math.max(y + 2, H - 30);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(
    "Storage: Store at 25°C ± 2°C / 60% RH. Protect from light.",
    M + 3,
    y,
  );
  doc.text(`LOT: ${lotNum}  |  EXP: ${expStr}`, M + 3, y + 5);
  const dateStr = f.createdAt
    ? new Date(Number(f.createdAt) || f.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  doc.setFont("helvetica", "normal");
  doc.text(
    `Mfg by: AyurNexis Formulation Lab | ${f.ownerName || "—"} | ${dateStr}`,
    M + 3,
    y + 10,
  );

  // Approval strip
  const stabScore = f.stabilityScore ?? 75;
  const approved = stabScore >= 70;
  const approvalY = H - M - 11;
  if (approved) {
    doc.setFillColor(200, 230, 201);
    doc.setDrawColor(76, 175, 80);
  } else {
    doc.setFillColor(255, 205, 210);
    doc.setDrawColor(229, 115, 115);
  }
  doc.setLineWidth(0.5);
  doc.rect(M + 0.5, approvalY, W - M * 2 - 1, 9, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(approved ? 27 : 183, approved ? 94 : 28, approved ? 32 : 28);
  doc.text(
    approved
      ? "APPROVED FOR MARKET RELEASE"
      : "NOT APPROVED FOR MARKET RELEASE",
    W / 2,
    approvalY + 6,
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

  const handleDeleteFormulation = (idOrIdx: string) => {
    setFormulations((prev) => {
      const updated = prev.filter((f, i) => (f.id ?? String(i)) !== idOrIdx);
      try {
        localStorage.setItem("ayurnexis_formulations", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

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
                    onDelete={handleDeleteFormulation}
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
                onDelete={handleDeleteFormulation}
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

function generateHistoryReportPDF(f: SavedFormulation): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const M = 20;

  // Header band
  doc.setFillColor(232, 245, 240);
  doc.rect(0, 0, W, 30, "F");
  doc.setDrawColor(0, 137, 123);
  doc.setLineWidth(0.5);
  doc.line(0, 30, W, 30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("AyurNexis 3.1 | Formulation Report", M, 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const dateStr = f.createdAt
    ? new Date(Number(f.createdAt) || f.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
  doc.text(`Generated: ${dateStr}  |  IP 2022 | BP 2023 Compliant`, M, 22);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Page 1", W - M, 22, { align: "right" });

  // Formulation summary
  let y = 42;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("Formulation Summary", M, y);
  y += 6;
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  const summaryData = [
    ["Formulation Name", f.name || "Unnamed"],
    ["Dosage Form", f.dosageForm || "—"],
    ["Method", f.method || "—"],
    ["Formulator", f.ownerName || "—"],
    ["Institution", f.institution || "—"],
    ["Date", dateStr],
    [
      "No. of Ingredients",
      String(f.ingredientCount ?? f.ingredients?.length ?? "—"),
    ],
  ];
  for (const [label, value] of summaryData) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(label, M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(String(value), M + 55, y);
    y += 6;
  }

  // Composition table
  const ings = f.ingredients ?? [];
  if (ings.length > 0) {
    y += 4;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(27, 94, 32);
    doc.text("Composition", M, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Ingredient", "Quantity", "Unit", "Category"]],
      body: ings.map((i) => [
        i.name,
        String(i.qty),
        i.unit,
        (i as any).category || "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: [0, 137, 123], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [245, 250, 250] },
      margin: { left: M, right: M },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Quality metrics
  const stabScore = f.stabilityScore ?? 75;
  const overallScore = stabScore;
  const approved = overallScore >= 70;
  y += 4;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.text("Quality Assessment", M, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value", "Status"]],
    body: [
      [
        "Stability Score",
        `${stabScore}/100`,
        stabScore >= 70 ? "Pass" : "Review",
      ],
      ["Shelf Life", `${f.shelfLife ?? 24} months`, "Assessed"],
      [
        "Overall Score",
        `${overallScore}/100`,
        overallScore >= 70 ? "Pass" : "Review",
      ],
      [
        "Approval Status",
        approved ? "Approved" : "Not Approved",
        approved ? "Pass" : "Fail",
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [0, 137, 123], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [245, 250, 250] },
    margin: { left: M, right: M },
  });

  // Footer
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    "AyurNexis 3.1 | Pharmacopeia Compliant | IP 2022 | BP 2023",
    W / 2,
    285,
    { align: "center" },
  );

  doc.save(`${f.name || f.dosageForm || "formulation"}_report.pdf`);
}

function FormulationTable({
  formulations,
  formatDate,
  onDelete,
}: {
  formulations: SavedFormulation[];
  formatDate: (d: any) => string;
  onDelete?: (id: string) => void;
}) {
  const [certLoading, setCertLoading] = useState<string | null>(null);
  const [labelLoading, setLabelLoading] = useState<string | null>(null);
  const currentUser = (() => {
    try {
      return localStorage.getItem("ayurnexis_userName") || "";
    } catch {
      return "";
    }
  })();

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
          <TableHead className="text-xs">Report</TableHead>
          <TableHead className="text-xs">Certificate</TableHead>
          <TableHead className="text-xs">Label</TableHead>
          <TableHead className="text-xs">Delete</TableHead>
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
                title="Download Report"
                data-ocid={`history.formulation.report.${idx + 1}`}
                className="p-1.5 rounded hover:bg-gray-50 text-gray-600 transition-colors"
                onClick={() => generateHistoryReportPDF(f)}
              >
                <FileText size={14} />
              </button>
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
            <TableCell>
              {(!currentUser || f.ownerName === currentUser) && onDelete && (
                <button
                  type="button"
                  title="Delete Record"
                  data-ocid={`history.formulation.delete_button.${idx + 1}`}
                  className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                  onClick={() => {
                    if (
                      confirm(
                        `Delete "${f.name || "this formulation"}" from history? This cannot be undone.`,
                      )
                    ) {
                      onDelete(f.id ?? String(idx));
                    }
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
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

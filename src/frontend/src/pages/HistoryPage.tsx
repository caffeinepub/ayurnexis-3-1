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
  Beaker,
  ClipboardList,
  Download,
  FlaskConical,
  History,
  Inbox,
  Microscope,
  Search,
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
              {f.ingredientCount ?? "—"}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {f.ownerName || "—"}
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

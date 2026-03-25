import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  FileBarChart,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useAllAnalysesMerged,
  useDeviationReport,
  useQualityOverview,
  useSupplierStats,
} from "../hooks/useQueries";

export function Reports() {
  const { data: overview, isLoading: overviewLoading } = useQualityOverview();
  const { data: deviations = [] } = useDeviationReport();
  const { data: supplierStats = [] } = useSupplierStats();

  const { data: mergedAnalyses = [] } = useAllAnalysesMerged();

  // Compute local overview from merged analyses if backend returns empty
  const localOverview = {
    total: BigInt(mergedAnalyses.length),
    passed: BigInt(mergedAnalyses.filter((a) => a.status === "Accept").length),
    failed: BigInt(mergedAnalyses.filter((a) => a.status !== "Accept").length),
    avgScore:
      mergedAnalyses.length > 0
        ? mergedAnalyses.reduce((s, a) => s + a.qualityScore, 0) /
          mergedAnalyses.length
        : 0,
    highRisk: BigInt(mergedAnalyses.filter((a) => a.qualityScore < 50).length),
  };

  const effectiveOverview =
    !overview || overview.total === 0n ? localOverview : overview;

  // Compute supplier stats from merged analyses if backend returns empty
  const localSupplierStats = (() => {
    if (supplierStats.length > 0) return supplierStats;
    const map: Record<string, { scores: number[]; pass: number }> = {};
    for (const a of mergedAnalyses) {
      if (!map[a.supplier]) map[a.supplier] = { scores: [], pass: 0 };
      map[a.supplier].scores.push(a.qualityScore);
      if (a.status === "Accept") map[a.supplier].pass++;
    }
    return Object.entries(map).map(([supplier, d]) => ({
      supplier,
      passRate: d.scores.length > 0 ? (d.pass / d.scores.length) * 100 : 0,
      avgScore:
        d.scores.length > 0
          ? d.scores.reduce((a, b) => a + b, 0) / d.scores.length
          : 0,
      totalBatches: BigInt(d.scores.length),
    }));
  })();

  const effectiveDeviations =
    deviations.length > 0
      ? deviations
      : mergedAnalyses.filter((a) => a.status !== "Accept" || a.anomaly);

  const supplierChartData = localSupplierStats.map((s) => ({
    name: s.supplier.length > 12 ? `${s.supplier.slice(0, 12)}…` : s.supplier,
    passRate: Math.round(s.passRate),
    batches: Number(s.totalBatches),
    avgScore: Math.round(s.avgScore),
  }));

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <FileBarChart size={16} className="text-gold" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            QA Reports
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Quality Reports &amp; Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Comprehensive QA reporting — quality overview, supplier performance,
          deviation analysis
        </p>
      </motion.div>

      {/* Quality Overview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 glass-card rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">
          Quality Overview Report
        </h2>
        {overviewLoading ? (
          <div
            data-ocid="reports.loading_state"
            className="py-8 flex items-center justify-center gap-2"
          >
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading…</span>
          </div>
        ) : effectiveOverview ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                label: "Total Batches",
                value: String(effectiveOverview.total),
                icon: FileBarChart,
                color: "oklch(0.72 0.130 78)",
              },
              {
                label: "Passed",
                value: String(effectiveOverview.passed),
                icon: CheckCircle2,
                color: "oklch(0.64 0.168 145)",
              },
              {
                label: "Failed",
                value: String(effectiveOverview.failed),
                icon: XCircle,
                color: "oklch(0.54 0.174 24)",
              },
              {
                label: "Avg Quality Score",
                value: effectiveOverview.avgScore.toFixed(1),
                icon: TrendingDown,
                color: "oklch(0.55 0.140 200)",
              },
              {
                label: "High Risk Batches",
                value: String(effectiveOverview.highRisk),
                icon: AlertTriangle,
                color: "oklch(0.78 0.130 87)",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-lg p-4 flex flex-col gap-1"
                style={{
                  background: `${color}11`,
                  border: `1px solid ${color}33`,
                }}
              >
                <Icon size={18} style={{ color }} />
                <div className="text-2xl font-bold text-foreground">
                  {value}
                </div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </motion.div>

      {/* Supplier Performance Report */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-4 glass-card rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">
          Supplier Performance Report
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={supplierChartData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.38 0.076 175 / 0.3)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "oklch(0.75 0.025 162)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: "oklch(0.75 0.025 162)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.26 0.058 170)",
                  border: "1px solid oklch(0.38 0.076 175 / 0.5)",
                  borderRadius: 8,
                  color: "oklch(0.94 0.018 162)",
                  fontSize: 11,
                }}
              />
              <Bar dataKey="passRate" name="Pass Rate %" radius={[0, 4, 4, 0]}>
                {supplierChartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      entry.passRate >= 70
                        ? "oklch(0.64 0.168 145)"
                        : entry.passRate >= 40
                          ? "oklch(0.78 0.130 87)"
                          : "oklch(0.54 0.174 24)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  {["Supplier", "Pass Rate", "Avg Score", "Batches"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2 text-muted-foreground font-semibold uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {supplierStats.map((s, i) => (
                  <tr
                    key={s.supplier}
                    data-ocid={`reports.item.${i + 1}`}
                    className="border-b border-border/20 hover:bg-accent/10"
                  >
                    <td className="px-3 py-2 font-medium text-foreground">
                      {s.supplier}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        style={{
                          color:
                            s.passRate >= 70
                              ? "oklch(0.64 0.168 145)"
                              : s.passRate >= 40
                                ? "oklch(0.78 0.130 87)"
                                : "oklch(0.54 0.174 24)",
                        }}
                        className="font-bold"
                      >
                        {s.passRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {s.avgScore.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {Number(s.totalBatches)}
                    </td>
                  </tr>
                ))}
                {supplierStats.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-muted-foreground"
                    >
                      No supplier data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Deviation Report */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 glass-card rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} className="text-warning" />
          <h2 className="text-sm font-semibold text-gold uppercase tracking-wider">
            Deviation & Anomaly Report
          </h2>
          <Badge
            style={{
              background: "oklch(0.78 0.130 87 / 0.15)",
              color: "oklch(0.78 0.130 87)",
              border: "none",
              marginLeft: "auto",
            }}
          >
            {deviations.length} deviations
          </Badge>
        </div>
        {deviations.length === 0 ? (
          <div data-ocid="reports.empty_state" className="py-8 text-center">
            <CheckCircle2 size={36} className="mx-auto text-success mb-2" />
            <div className="text-sm text-muted-foreground">
              No deviations detected — all analyzed batches within acceptable
              limits
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  {[
                    "Batch ID",
                    "Herb",
                    "Supplier",
                    "Score",
                    "Status",
                    "Anomaly Details",
                    "Moisture",
                    "Ash",
                    "Extract",
                    "Heavy",
                    "Microbial",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 text-muted-foreground font-semibold uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {effectiveDeviations.map((d) => (
                  <tr
                    key={d.batchId}
                    className="border-b border-border/20 hover:bg-accent/10"
                  >
                    <td className="px-3 py-2 font-mono text-gold font-bold">
                      {d.batchId}
                    </td>
                    <td className="px-3 py-2 font-medium text-foreground">
                      {d.herbName}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {d.supplier}
                    </td>
                    <td
                      className="px-3 py-2 font-bold"
                      style={{
                        color:
                          d.qualityScore < 50
                            ? "oklch(0.54 0.174 24)"
                            : "oklch(0.78 0.130 87)",
                      }}
                    >
                      {d.qualityScore.toFixed(1)}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        style={{
                          background: "oklch(0.54 0.174 24 / 0.15)",
                          color: "oklch(0.54 0.174 24)",
                          border: "none",
                        }}
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-warning max-w-[160px] truncate">
                      {d.anomaly
                        ? d.anomalyDetails
                        : "Parameter threshold exceeded"}
                    </td>
                    <td className="px-3 py-2">
                      {!d.moistureOk && (
                        <XCircle size={12} className="text-danger" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {!d.ashOk && (
                        <XCircle size={12} className="text-danger" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {!d.extractiveOk && (
                        <XCircle size={12} className="text-danger" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {!d.heavyMetalsOk && (
                        <XCircle size={12} className="text-danger" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {!d.microbialOk && (
                        <XCircle size={12} className="text-danger" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

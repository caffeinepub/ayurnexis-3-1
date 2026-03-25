import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Microscope,
  Pencil,
  Play,
  RefreshCw,
  Save,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SemiGauge } from "../components/SemiGauge";
import {
  type ExcipientCategory,
  type ExcipientIngredient,
  apiDrugs,
  excipientCategoryLabels,
  excipientCategoryMap,
} from "../data/formulationData";
import {
  type HerbMonograph,
  findHerb,
  getCustomRef,
  pharmacopeiaData,
  saveCustomRef,
} from "../data/pharmacopeiaData";
import {
  type DisplayBatch,
  SEED_BATCHES,
  computeLocalAnalysis,
} from "../data/seedBatches";
import { useAllAnalysesMerged, useAllBatches } from "../hooks/useQueries";

const paramLabels: [string, keyof import("../backend.d").AnalysisResult][] = [
  ["Moisture", "moistureOk"],
  ["Ash", "ashOk"],
  ["Extractive", "extractiveOk"],
  ["Heavy Metals", "heavyMetalsOk"],
  ["Microbial", "microbialOk"],
];

// ---- Herb Monograph Detail ----
function MonographDetail({ herb }: { herb: HerbMonograph }) {
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [customVals, setCustomVals] = useState<Record<string, number>>(() => {
    const c = getCustomRef(herb.id);
    return (c as Record<string, number>) || {};
  });
  const hasCustom = Object.keys(customVals).length > 0;

  const startEdit = (field: string, current: number) => {
    setEditField(field);
    setEditValue(String(current));
  };

  const saveEdit = (field: string) => {
    const val = Number.parseFloat(editValue);
    if (!Number.isNaN(val)) {
      const updated = { ...customVals, [field]: val };
      setCustomVals(updated);
      saveCustomRef(
        herb.id,
        updated as unknown as Partial<HerbMonograph["parameters"]>,
      );
    }
    setEditField(null);
  };

  const resetCustom = () => {
    setCustomVals({});
    localStorage.removeItem(`ayurnexis_custom_ref_${herb.id}`);
  };

  const p = herb.parameters;

  const rows: {
    label: string;
    field: string;
    value: number;
    unit: string;
    isMin?: boolean;
  }[] = [
    {
      label: "Moisture",
      field: "moisture",
      value: customVals.moisture ?? p.moisture.max,
      unit: "% max",
    },
    {
      label: "Total Ash",
      field: "totalAsh",
      value: customVals.totalAsh ?? p.totalAsh.max,
      unit: "% max",
    },
    {
      label: "Acid-Insoluble Ash",
      field: "acidInsolubleAsh",
      value: customVals.acidInsolubleAsh ?? p.acidInsolubleAsh.max,
      unit: "% max",
    },
    {
      label: "Water-Sol. Extractive",
      field: "waterSolubleExtractive",
      value: customVals.waterSolubleExtractive ?? p.waterSolubleExtractive.min,
      unit: "% min",
      isMin: true,
    },
    {
      label: "Alcohol-Sol. Extractive",
      field: "alcoholSolubleExtractive",
      value:
        customVals.alcoholSolubleExtractive ?? p.alcoholSolubleExtractive.min,
      unit: "% min",
      isMin: true,
    },
    {
      label: "Lead (Pb)",
      field: "lead",
      value: customVals.lead ?? p.heavyMetals.lead.max,
      unit: "ppm max",
    },
    {
      label: "Arsenic (As)",
      field: "arsenic",
      value: customVals.arsenic ?? p.heavyMetals.arsenic.max,
      unit: "ppm max",
    },
    {
      label: "Mercury (Hg)",
      field: "mercury",
      value: customVals.mercury ?? p.heavyMetals.mercury.max,
      unit: "ppm max",
    },
    {
      label: "Cadmium (Cd)",
      field: "cadmium",
      value: customVals.cadmium ?? p.heavyMetals.cadmium.max,
      unit: "ppm max",
    },
    {
      label: "Total Aerobic Count",
      field: "totalAerobicCount",
      value: customVals.totalAerobicCount ?? p.microbial.totalAerobicCount.max,
      unit: "CFU/g max",
    },
    {
      label: "Yeast & Mold",
      field: "yeastMold",
      value: customVals.yeastMold ?? p.microbial.yeastMold.max,
      unit: "CFU/g max",
    },
    {
      label: "Foreign Matter",
      field: "foreignMatter",
      value: customVals.foreignMatter ?? p.foreignMatter.max,
      unit: "% max",
    },
    {
      label: "Loss on Drying",
      field: "lossOnDrying",
      value: customVals.lossOnDrying ?? p.lossOnDrying.max,
      unit: "% max",
    },
    ...(p.volatileOil
      ? [
          {
            label: "Volatile Oil",
            field: "volatileOil",
            value: customVals.volatileOil ?? p.volatileOil.min,
            unit: "% v/w min",
            isMin: true,
          },
        ]
      : []),
    ...(p.activeMarker
      ? [
          {
            label: `Active Marker (${p.activeMarker.compound})`,
            field: "activeMarker",
            value: customVals.activeMarker ?? p.activeMarker.min,
            unit: "% min",
            isMin: true,
          },
        ]
      : []),
  ];

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground">
          Source: <span className="text-gold font-semibold">{herb.source}</span>{" "}
          · Part used: <span className="text-foreground">{herb.part}</span>
        </div>
        {hasCustom && (
          <button
            type="button"
            onClick={resetCustom}
            className="text-[10px] text-destructive hover:text-red-400 flex items-center gap-1"
          >
            <X size={10} /> Reset custom
          </button>
        )}
      </div>

      {hasCustom && (
        <div
          className="mb-2 px-2 py-1 rounded text-[10px] flex items-center gap-1.5"
          style={{
            background: "oklch(0.72 0.130 78 / 0.10)",
            color: "oklch(0.72 0.130 78)",
          }}
        >
          <Pencil size={10} /> Custom values active for this herb
        </div>
      )}

      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid oklch(0.32 0.065 172 / 0.3)" }}
      >
        <table className="w-full text-xs">
          <thead style={{ background: "oklch(0.24 0.055 170)" }}>
            <tr>
              <th className="text-left px-3 py-2 text-muted-foreground font-semibold">
                Parameter
              </th>
              <th className="text-right px-3 py-2 text-muted-foreground font-semibold">
                Limit
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, field, value, unit }, i) => (
              <tr
                key={field}
                style={{
                  background:
                    i % 2 === 0 ? "oklch(0.22 0.052 170)" : "transparent",
                  borderTop: "1px solid oklch(0.32 0.065 172 / 0.2)",
                }}
              >
                <td className="px-3 py-1.5 text-foreground">{label}</td>
                <td className="px-3 py-1.5 text-right">
                  {editField === field ? (
                    <span className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        step="any"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 text-right px-1.5 py-0.5 rounded text-xs"
                        style={{
                          background: "oklch(0.28 0.060 170)",
                          border: "1px solid oklch(0.72 0.130 78 / 0.5)",
                          color: "oklch(0.94 0.018 162)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(field)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Save size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditField(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ) : (
                    <span
                      style={{
                        color:
                          customVals[field] !== undefined
                            ? "oklch(0.72 0.130 78)"
                            : "oklch(0.64 0.168 145)",
                      }}
                    >
                      {value}{" "}
                      <span className="text-muted-foreground">{unit}</span>
                    </span>
                  )}
                </td>
                <td className="px-1 py-1.5 text-center">
                  {editField !== field && (
                    <button
                      type="button"
                      onClick={() => startEdit(field, value)}
                      className="text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100"
                    >
                      <Pencil size={10} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
        <div>
          E. coli:{" "}
          <span className="text-destructive font-semibold">Absent</span> ·
          Salmonella:{" "}
          <span className="text-destructive font-semibold">Absent</span>
        </div>
      </div>
    </div>
  );
}

// ---- Comparison Panel ----
function ComparisonPanel({
  analysis,
}: { analysis: import("../backend.d").AnalysisResult }) {
  const herb = useMemo(() => findHerb(analysis.herbName), [analysis.herbName]);
  if (!herb) {
    return (
      <div
        className="mt-3 p-4 rounded-lg text-xs text-muted-foreground"
        style={{
          background: "oklch(0.22 0.052 170)",
          border: "1px solid oklch(0.32 0.065 172 / 0.3)",
        }}
      >
        No pharmacopeia reference found for{" "}
        <strong className="text-foreground">{analysis.herbName}</strong>. The
        raw material library covers 35+ herbs — check the spelling or select the
        herb manually from the library drawer.
      </div>
    );
  }

  const p = herb.parameters;
  const custom = getCustomRef(herb.id) as Record<string, number> | null;
  const cv = (field: string, def: number) =>
    custom && custom[field] !== undefined ? custom[field] : def;

  const _rows = [
    {
      label: "Moisture (%)",
      batch: analysis.moistureOk !== undefined ? null : null,
      ref: cv("moisture", p.moisture.max),
      unit: "% max",
      batchRaw: null as number | null,
      isMax: true,
    },
    {
      label: "Total Ash (%)",
      ref: cv("totalAsh", p.totalAsh.max),
      unit: "% max",
      batchRaw: null as number | null,
      isMax: true,
    },
    {
      label: "Extractive (%)",
      ref: cv("waterSolubleExtractive", p.waterSolubleExtractive.min),
      unit: "% min",
      batchRaw: null as number | null,
      isMax: false,
    },
    {
      label: "Heavy Metals (ppm)",
      ref: cv("lead", p.heavyMetals.lead.max),
      unit: "ppm max",
      batchRaw: null as number | null,
      isMax: true,
    },
    {
      label: "Microbial (CFU/g)",
      ref: cv("totalAerobicCount", p.microbial.totalAerobicCount.max),
      unit: "CFU/g max",
      batchRaw: null as number | null,
      isMax: true,
    },
  ];

  // We don't have raw batch values in AnalysisResult, but we do have pass/fail per param
  // Map ok booleans to estimated values for radar visualization
  const paramOks = [
    analysis.moistureOk,
    analysis.ashOk,
    analysis.extractiveOk,
    analysis.heavyMetalsOk,
    analysis.microbialOk,
  ];

  const paramNames = [
    "Moisture",
    "Ash",
    "Extractive",
    "Heavy Metals",
    "Microbial",
  ];

  const radarData = paramNames.map((name, i) => ({
    subject: name,
    // Score 0-100: ok=85 (good), fail=35 (bad) — estimated since we only have bool
    Batch: paramOks[i] ? 85 : 35,
    Reference: 100,
  }));

  const tableRows = [
    {
      label: "Moisture",
      ok: analysis.moistureOk,
      ref: `≤ ${cv("moisture", p.moisture.max)}%`,
    },
    {
      label: "Total Ash",
      ok: analysis.ashOk,
      ref: `≤ ${cv("totalAsh", p.totalAsh.max)}%`,
    },
    {
      label: "Extractive Value",
      ok: analysis.extractiveOk,
      ref: `≥ ${cv("waterSolubleExtractive", p.waterSolubleExtractive.min)}%`,
    },
    {
      label: "Heavy Metals (Pb)",
      ok: analysis.heavyMetalsOk,
      ref: `≤ ${cv("lead", p.heavyMetals.lead.max)} ppm`,
    },
    {
      label: "Microbial Count",
      ok: analysis.microbialOk,
      ref: `≤ ${cv("totalAerobicCount", p.microbial.totalAerobicCount.max).toLocaleString()} CFU/g`,
    },
    ...(p.activeMarker
      ? [
          {
            label: `Active Marker (${p.activeMarker.compound})`,
            ok: null,
            ref: `≥ ${cv("activeMarker", p.activeMarker.min)}%`,
          },
        ]
      : []),
  ];

  return (
    <div
      className="mt-4 pt-4 border-t"
      style={{ borderColor: "oklch(0.32 0.065 172 / 0.3)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={13} style={{ color: "oklch(0.60 0.168 245)" }} />
        <span className="text-xs font-semibold text-foreground">
          Comparison: Batch vs. Pharmacopeia Reference
        </span>
        <span className="text-[10px] text-muted-foreground ml-1">
          ({herb.source})
        </span>
        {custom && Object.keys(custom).length > 0 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: "oklch(0.72 0.130 78 / 0.15)",
              color: "oklch(0.72 0.130 78)",
            }}
          >
            Custom limits
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid oklch(0.32 0.065 172 / 0.3)" }}
        >
          <table className="w-full text-xs">
            <thead style={{ background: "oklch(0.24 0.055 170)" }}>
              <tr>
                <th className="text-left px-3 py-2 text-muted-foreground font-semibold">
                  Parameter
                </th>
                <th className="text-right px-3 py-2 text-muted-foreground font-semibold">
                  Reference Limit
                </th>
                <th className="text-center px-3 py-2 text-muted-foreground font-semibold">
                  Batch Status
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(({ label, ok, ref }, i) => (
                <tr
                  key={label}
                  style={{
                    background:
                      i % 2 === 0 ? "oklch(0.22 0.052 170)" : "transparent",
                    borderTop: "1px solid oklch(0.32 0.065 172 / 0.2)",
                  }}
                >
                  <td className="px-3 py-2 text-foreground">{label}</td>
                  <td
                    className="px-3 py-2 text-right"
                    style={{ color: "oklch(0.64 0.168 145)" }}
                  >
                    {ref}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {ok === null ? (
                      <span className="text-muted-foreground text-[10px]">
                        N/A
                      </span>
                    ) : ok ? (
                      <span
                        className="flex items-center justify-center gap-1"
                        style={{ color: "oklch(0.64 0.168 145)" }}
                      >
                        <CheckCircle2 size={12} /> Pass
                      </span>
                    ) : (
                      <span
                        className="flex items-center justify-center gap-1"
                        style={{ color: "oklch(0.54 0.174 24)" }}
                      >
                        <XCircle size={12} /> Fail
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Radar Chart */}
        <div className="flex flex-col">
          <div className="text-[10px] text-muted-foreground mb-1 text-center">
            Quality Profile vs. Reference (estimated from pass/fail)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="oklch(0.32 0.065 172 / 0.4)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "oklch(0.75 0.025 162)", fontSize: 10 }}
              />
              <Radar
                name="Batch"
                dataKey="Batch"
                stroke="oklch(0.72 0.130 78)"
                fill="oklch(0.72 0.130 78)"
                fillOpacity={0.25}
              />
              <Radar
                name="Reference"
                dataKey="Reference"
                stroke="oklch(0.64 0.168 145)"
                fill="oklch(0.64 0.168 145)"
                fillOpacity={0.1}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.24 0.055 170)",
                  border: "1px solid oklch(0.32 0.065 172 / 0.5)",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "oklch(0.94 0.018 162)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, color: "oklch(0.75 0.025 162)" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export function QualityAnalysis() {
  const { data: analyses = [], isLoading } = useAllAnalysesMerged();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedHerb, setExpandedHerb] = useState<string | null>(null);
  const [drawerCategory, setDrawerCategory] = useState<
    "herbs" | "apis" | ExcipientCategory
  >("herbs");
  const [showComparison, setShowComparison] = useState<Record<string, boolean>>(
    {},
  );

  const filteredHerbs = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return pharmacopeiaData;
    return pharmacopeiaData.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.latinName.toLowerCase().includes(q) ||
        h.source.toLowerCase().includes(q),
    );
  }, [search]);

  const toggleComparison = (batchId: string) => {
    setShowComparison((prev) => ({ ...prev, [batchId]: !prev[batchId] }));
  };
  // ---- Run Analysis Panel State ----
  const { data: backendBatches = [] } = useAllBatches();
  const allBatchOptions: DisplayBatch[] = [
    ...(SEED_BATCHES as DisplayBatch[]),
    ...backendBatches.map((b) => ({ ...b })),
  ];

  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [params, setParams] = useState({
    moisture: 0,
    ash: 0,
    extractiveValue: 0,
    heavyMetals: 0,
    microbialCount: 0,
  });
  const [runResult, setRunResult] = useState<
    import("../backend.d").AnalysisResult | null
  >(null);

  const handleBatchSelect = (batchId: string) => {
    setSelectedBatchId(batchId);
    const batch = allBatchOptions.find((b) => b.batchId === batchId);
    if (batch) {
      setParams({
        moisture: batch.moisture,
        ash: batch.ash,
        extractiveValue: batch.extractiveValue,
        heavyMetals: batch.heavyMetals,
        microbialCount: batch.microbialCount,
      });
    }
    setRunResult(null);
  };

  const handleRunAnalysis = () => {
    const batch = allBatchOptions.find((b) => b.batchId === selectedBatchId);
    if (!batch) return;
    const result = computeLocalAnalysis(batch, params);
    setRunResult(result);
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Microscope size={16} className="text-gold" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Quality Analysis Engine
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 text-xs"
            style={{
              background: "oklch(0.24 0.055 170)",
              border: "1px solid oklch(0.32 0.065 172 / 0.5)",
              color: "oklch(0.72 0.130 78)",
            }}
          >
            <BookOpen size={13} />
            Raw Material Library
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Analysis Results</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          ML-powered rule-based scoring with parameter-level QA assessment
        </p>
      </motion.div>

      {/* ---- Run New Analysis Panel ---- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-5 glass-card rounded-xl p-5"
        style={{ border: "1px solid oklch(0.32 0.065 172 / 0.5)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical size={15} style={{ color: "oklch(0.72 0.130 78)" }} />
          <h2 className="text-sm font-semibold text-foreground">
            Run New Analysis
          </h2>
          <span className="text-xs text-muted-foreground ml-1">
            Select a batch, adjust values, and run QA scoring
          </span>
        </div>

        {/* Batch Selector */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Select Batch
          </Label>
          <Select value={selectedBatchId} onValueChange={handleBatchSelect}>
            <SelectTrigger
              className="w-full max-w-sm text-xs h-9"
              style={{
                background: "oklch(0.22 0.052 170)",
                border: "1px solid oklch(0.32 0.065 172 / 0.5)",
                color: "oklch(0.94 0.018 162)",
              }}
            >
              <SelectValue placeholder="— choose a batch —" />
            </SelectTrigger>
            <SelectContent
              style={{
                background: "oklch(0.22 0.052 170)",
                border: "1px solid oklch(0.32 0.065 172 / 0.5)",
              }}
            >
              {allBatchOptions.map((b) => (
                <SelectItem
                  key={b.batchId}
                  value={b.batchId}
                  className="text-xs text-foreground hover:bg-accent/20"
                >
                  {b.batchId} — {b.herbName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBatchId && (
          <>
            {/* Parameter Input Fields */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              {[
                {
                  key: "moisture",
                  label: "Moisture (%)",
                  hint: "≤ 12% max",
                  step: "0.1",
                },
                {
                  key: "ash",
                  label: "Total Ash (%)",
                  hint: "≤ 8% max",
                  step: "0.1",
                },
                {
                  key: "extractiveValue",
                  label: "Extractive (%)",
                  hint: "≥ 15% min",
                  step: "0.1",
                },
                {
                  key: "heavyMetals",
                  label: "Heavy Metals (ppm)",
                  hint: "≤ 1.0 ppm",
                  step: "0.01",
                },
                {
                  key: "microbialCount",
                  label: "Microbial (CFU/g)",
                  hint: "≤ 10,000",
                  step: "1",
                },
              ].map(({ key, label, hint, step }) => (
                <div key={key} className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">
                    {label}
                  </Label>
                  <Input
                    type="number"
                    step={step}
                    value={params[key as keyof typeof params]}
                    onChange={(e) =>
                      setParams((p) => ({
                        ...p,
                        [key]: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="h-8 text-xs font-mono"
                    style={{
                      background: "oklch(0.20 0.048 170)",
                      border: "1px solid oklch(0.32 0.065 172 / 0.4)",
                      color: "oklch(0.94 0.018 162)",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {hint}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={handleRunAnalysis}
                size="sm"
                className="flex items-center gap-2 text-xs font-semibold"
                style={{
                  background: "oklch(0.72 0.130 78)",
                  color: "oklch(0.15 0.040 170)",
                }}
              >
                <Play size={12} /> Run Analysis
              </Button>
              {runResult && (
                <Button
                  onClick={handleRunAnalysis}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-xs"
                  style={{
                    background: "oklch(0.24 0.055 170)",
                    border: "1px solid oklch(0.32 0.065 172 / 0.5)",
                    color: "oklch(0.75 0.025 162)",
                  }}
                >
                  <RefreshCw size={11} /> Re-analyze
                </Button>
              )}
            </div>

            {/* Analysis Result */}
            {runResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4"
                style={{
                  background: "oklch(0.20 0.048 170)",
                  border: "1px solid oklch(0.32 0.065 172 / 0.4)",
                }}
              >
                <div className="flex flex-wrap items-start gap-6">
                  {/* Gauge */}
                  <div className="flex flex-col items-center gap-1">
                    <SemiGauge
                      value={runResult.qualityScore}
                      max={100}
                      label="Quality Score"
                      size={120}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        style={{
                          background:
                            runResult.status === "Accept"
                              ? "oklch(0.64 0.168 145 / 0.15)"
                              : "oklch(0.54 0.174 24 / 0.15)",
                          color:
                            runResult.status === "Accept"
                              ? "oklch(0.64 0.168 145)"
                              : "oklch(0.54 0.174 24)",
                          border: "none",
                        }}
                      >
                        {runResult.status === "Accept" ? (
                          <CheckCircle2 size={11} className="mr-1" />
                        ) : (
                          <XCircle size={11} className="mr-1" />
                        )}
                        {runResult.status}
                      </Badge>
                      {runResult.anomaly && (
                        <Badge
                          style={{
                            background: "oklch(0.78 0.130 87 / 0.15)",
                            color: "oklch(0.78 0.130 87)",
                            border: "none",
                          }}
                        >
                          <AlertTriangle size={11} className="mr-1" /> Anomaly
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground mb-0.5">
                      {runResult.herbName}
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {runResult.supplier} · {runResult.region} ·{" "}
                      {runResult.batchId}
                    </div>

                    {/* Score bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Quality Score
                        </span>
                        <span
                          className="font-mono font-bold"
                          style={{
                            color:
                              runResult.status === "Accept"
                                ? "oklch(0.64 0.168 145)"
                                : "oklch(0.54 0.174 24)",
                          }}
                        >
                          {runResult.qualityScore.toFixed(0)}/100
                        </span>
                      </div>
                      <Progress
                        value={runResult.qualityScore}
                        className="h-2"
                        style={{
                          ["--progress-background" as string]:
                            runResult.status === "Accept"
                              ? "oklch(0.64 0.168 145)"
                              : "oklch(0.54 0.174 24)",
                        }}
                      />
                    </div>

                    {/* ML Confidence */}
                    <div className="text-xs text-muted-foreground mb-3">
                      ML Confidence:{" "}
                      <span className="font-mono font-bold text-foreground">
                        {(runResult.probability * 100).toFixed(1)}%
                      </span>{" "}
                      accept probability
                    </div>

                    {/* Parameter status */}
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Parameter QA Status
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          ["Moisture", runResult.moistureOk],
                          ["Ash", runResult.ashOk],
                          ["Extractive", runResult.extractiveOk],
                          ["Heavy Metals", runResult.heavyMetalsOk],
                          ["Microbial", runResult.microbialOk],
                        ] as [string, boolean][]
                      ).map(([label, ok]) => (
                        <div
                          key={label}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                          style={{
                            background: ok
                              ? "oklch(0.64 0.168 145 / 0.12)"
                              : "oklch(0.54 0.174 24 / 0.12)",
                            color: ok
                              ? "oklch(0.64 0.168 145)"
                              : "oklch(0.54 0.174 24)",
                          }}
                        >
                          {ok ? (
                            <CheckCircle2 size={11} />
                          ) : (
                            <XCircle size={11} />
                          )}
                          {label}
                        </div>
                      ))}
                    </div>

                    {runResult.anomaly && (
                      <div
                        className="mt-3 text-xs p-2 rounded-lg"
                        style={{
                          background: "oklch(0.78 0.130 87 / 0.1)",
                          color: "oklch(0.78 0.130 87)",
                        }}
                      >
                        <AlertTriangle size={11} className="inline mr-1" />
                        Anomaly: {runResult.anomalyDetails}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {isLoading && (
        <div
          data-ocid="analysis.loading_state"
          className="mt-8 flex items-center justify-center py-16"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">
              Running analysis engine…
            </span>
          </div>
        </div>
      )}

      {!isLoading && analyses.length === 0 && (
        <div
          data-ocid="analysis.empty_state"
          className="mt-8 flex flex-col items-center justify-center py-16 gap-3"
        >
          <Microscope size={40} className="text-muted-foreground opacity-40" />
          <div className="text-sm text-muted-foreground">
            No analysis results yet. Analyze batches from Batch Records.
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {analyses.map((a, i) => (
          <motion.div
            key={a.batchId}
            data-ocid={`analysis.item.${i + 1}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gold font-bold">
                      {a.batchId}
                    </span>
                    <Badge
                      style={{
                        background:
                          a.status === "Accept"
                            ? "oklch(0.64 0.168 145 / 0.15)"
                            : "oklch(0.54 0.174 24 / 0.15)",
                        color:
                          a.status === "Accept"
                            ? "oklch(0.64 0.168 145)"
                            : "oklch(0.54 0.174 24)",
                        border: "none",
                      }}
                    >
                      {a.status === "Accept" ? (
                        <CheckCircle2 size={11} className="mr-1" />
                      ) : (
                        <XCircle size={11} className="mr-1" />
                      )}
                      {a.status}
                    </Badge>
                    {a.anomaly && (
                      <Badge
                        style={{
                          background: "oklch(0.78 0.130 87 / 0.15)",
                          color: "oklch(0.78 0.130 87)",
                          border: "none",
                        }}
                      >
                        <AlertTriangle size={11} className="mr-1" /> Anomaly
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">
                    {a.herbName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.supplier} · {a.region} · {a.dateReceived}
                  </div>
                  {a.anomaly && (
                    <div className="text-xs text-warning mt-1">
                      {a.anomalyDetails}
                    </div>
                  )}
                </div>
              </div>

              {/* Gauge + probability */}
              <div className="flex items-center gap-6">
                <SemiGauge
                  value={a.qualityScore}
                  max={100}
                  label="Quality Score"
                  size={120}
                />
                <div className="flex flex-col gap-1 text-xs">
                  <div className="text-muted-foreground">ML Confidence</div>
                  <div className="text-xl font-bold text-foreground">
                    {(a.probability * 100).toFixed(1)}%
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Accept probability
                  </div>
                </div>
              </div>
            </div>

            {/* Parameter Status */}
            <div
              className="mt-4 pt-4 border-t"
              style={{ borderColor: "oklch(0.32 0.065 172 / 0.3)" }}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Parameter QA Status
              </div>
              <div className="flex flex-wrap gap-2">
                {paramLabels.map(([label, key]) => {
                  const ok = a[key] as boolean;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        background: ok
                          ? "oklch(0.64 0.168 145 / 0.12)"
                          : "oklch(0.54 0.174 24 / 0.12)",
                        color: ok
                          ? "oklch(0.64 0.168 145)"
                          : "oklch(0.54 0.174 24)",
                      }}
                    >
                      {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compare button */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => toggleComparison(a.batchId)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: showComparison[a.batchId]
                    ? "oklch(0.60 0.168 245 / 0.15)"
                    : "oklch(0.24 0.055 170)",
                  color: showComparison[a.batchId]
                    ? "oklch(0.60 0.168 245)"
                    : "oklch(0.75 0.025 162)",
                  border: "1px solid oklch(0.32 0.065 172 / 0.4)",
                }}
              >
                <BarChart2 size={12} />
                {showComparison[a.batchId] ? "Hide" : "Compare with Reference"}
                {showComparison[a.batchId] ? (
                  <ChevronDown size={11} />
                ) : (
                  <ChevronRight size={11} />
                )}
              </button>
            </div>

            {/* Comparison Panel */}
            <AnimatePresence>
              {showComparison[a.batchId] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ComparisonPanel analysis={a} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Raw Material Library Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          className="w-[420px] sm:w-[500px] overflow-y-auto"
          style={{
            background: "oklch(0.20 0.048 170)",
            borderLeft: "1px solid oklch(0.32 0.065 172 / 0.5)",
            color: "oklch(0.94 0.018 162)",
          }}
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <BookOpen size={16} style={{ color: "oklch(0.72 0.130 78)" }} />
              Raw Material Library
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              Herbs · APIs · Excipients · IP 2022, WHO, BP 2023, AYUSH · Click
              to expand
            </p>
          </SheetHeader>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 mb-3">
            {(
              [
                "herbs",
                "apis",
                ...Object.keys(excipientCategoryLabels),
              ] as Array<"herbs" | "apis" | ExcipientCategory>
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setDrawerCategory(cat);
                  setExpandedHerb(null);
                  setSearch("");
                }}
                className="text-[10px] px-2 py-1 rounded transition-colors"
                style={{
                  background:
                    drawerCategory === cat
                      ? "oklch(0.72 0.130 78 / 0.25)"
                      : "oklch(0.24 0.055 170)",
                  border:
                    drawerCategory === cat
                      ? "1px solid oklch(0.72 0.130 78 / 0.6)"
                      : "1px solid oklch(0.32 0.065 172 / 0.3)",
                  color:
                    drawerCategory === cat
                      ? "oklch(0.72 0.130 78)"
                      : "oklch(0.70 0.02 162)",
                  fontWeight: drawerCategory === cat ? 700 : 400,
                }}
              >
                {cat === "herbs"
                  ? "Herbs"
                  : cat === "apis"
                    ? "APIs"
                    : excipientCategoryLabels[cat as ExcipientCategory]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-8 text-xs"
              placeholder={`Search ${drawerCategory === "herbs" ? "herbs" : drawerCategory === "apis" ? "APIs" : excipientCategoryLabels[drawerCategory as ExcipientCategory]}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "oklch(0.24 0.055 170)",
                border: "1px solid oklch(0.32 0.065 172 / 0.4)",
                color: "oklch(0.94 0.018 162)",
              }}
            />
          </div>

          {/* Content list */}
          {drawerCategory === "herbs" && (
            <div className="space-y-1">
              {filteredHerbs.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-8">
                  No herbs found for "{search}"
                </div>
              )}
              {filteredHerbs.map((herb) => {
                const isExpanded = expandedHerb === herb.id;
                const hasCustom = (() => {
                  const c = getCustomRef(herb.id);
                  return c && Object.keys(c).length > 0;
                })();
                return (
                  <div
                    key={herb.id}
                    className="rounded-lg overflow-hidden"
                    style={{ border: "1px solid oklch(0.32 0.065 172 / 0.3)" }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedHerb(isExpanded ? null : herb.id)
                      }
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors"
                      style={{
                        background: isExpanded
                          ? "oklch(0.24 0.055 170)"
                          : "oklch(0.22 0.052 170)",
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">
                              {herb.name}
                            </span>
                            {hasCustom && (
                              <span
                                className="text-[9px] px-1 py-0.5 rounded"
                                style={{
                                  background: "oklch(0.72 0.130 78 / 0.2)",
                                  color: "oklch(0.72 0.130 78)",
                                }}
                              >
                                Custom
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground italic truncate">
                            {herb.latinName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: herb.source.startsWith("IP")
                              ? "oklch(0.60 0.168 245 / 0.15)"
                              : herb.source.startsWith("WHO")
                                ? "oklch(0.64 0.168 145 / 0.15)"
                                : "oklch(0.72 0.130 78 / 0.15)",
                            color: herb.source.startsWith("IP")
                              ? "oklch(0.60 0.168 245)"
                              : herb.source.startsWith("WHO")
                                ? "oklch(0.64 0.168 145)"
                                : "oklch(0.72 0.130 78)",
                          }}
                        >
                          {herb.source.split(" ")[0]}
                        </span>
                        {isExpanded ? (
                          <ChevronDown
                            size={13}
                            className="text-muted-foreground"
                          />
                        ) : (
                          <ChevronRight
                            size={13}
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-3 pb-3"
                            style={{ background: "oklch(0.21 0.050 170)" }}
                          >
                            <MonographDetail herb={herb} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {drawerCategory === "apis" && (
            <div className="space-y-1">
              {apiDrugs
                .filter(
                  (a) =>
                    !search ||
                    a.name.toLowerCase().includes(search.toLowerCase()) ||
                    a.therapeuticCategory
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                )
                .map((api) => {
                  const isExpanded = expandedHerb === api.id;
                  return (
                    <div
                      key={api.id}
                      className="rounded-lg overflow-hidden"
                      style={{
                        border: "1px solid oklch(0.32 0.065 172 / 0.3)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedHerb(isExpanded ? null : api.id)
                        }
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors"
                        style={{
                          background: isExpanded
                            ? "oklch(0.24 0.055 170)"
                            : "oklch(0.22 0.052 170)",
                        }}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground">
                            {api.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {api.therapeuticCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              background: "oklch(0.60 0.168 245 / 0.15)",
                              color: "oklch(0.60 0.168 245)",
                            }}
                          >
                            {api.source.split("/")[0].trim()}
                          </span>
                          {isExpanded ? (
                            <ChevronDown
                              size={13}
                              className="text-muted-foreground"
                            />
                          ) : (
                            <ChevronRight
                              size={13}
                              className="text-muted-foreground"
                            />
                          )}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="px-3 py-3 space-y-2 text-xs"
                              style={{ background: "oklch(0.21 0.050 170)" }}
                            >
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-muted-foreground">
                                    CAS:
                                  </span>{" "}
                                  <span className="text-foreground font-mono">
                                    {api.cas}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Formula:
                                  </span>{" "}
                                  <span className="text-foreground font-mono">
                                    {api.molecularFormula}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Assay:
                                  </span>{" "}
                                  <span className="text-foreground">
                                    {api.assayMin}–{api.assayMax}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Source:
                                  </span>{" "}
                                  <span className="text-foreground">
                                    {api.source}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Solubility:
                                </span>{" "}
                                <span className="text-foreground">
                                  {api.solubility}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Storage:
                                </span>{" "}
                                <span className="text-foreground">
                                  {api.storage}
                                </span>
                              </div>
                              <div className="text-foreground/80 italic">
                                {api.description}
                              </div>
                              {api.parameters.length > 0 && (
                                <div>
                                  <div className="text-muted-foreground font-semibold mb-1">
                                    Test Parameters:
                                  </div>
                                  {api.parameters.map((p) => (
                                    <div
                                      key={p.name}
                                      className="flex justify-between py-0.5 border-b border-border/20"
                                    >
                                      <span className="text-foreground">
                                        {p.name}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {p.limit} ({p.method})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
            </div>
          )}

          {drawerCategory !== "herbs" && drawerCategory !== "apis" && (
            <div className="space-y-1">
              {(
                excipientCategoryMap[
                  drawerCategory as ExcipientCategory
                ] as ExcipientIngredient[]
              )
                .filter(
                  (e) =>
                    !search ||
                    e.name.toLowerCase().includes(search.toLowerCase()) ||
                    e.grade.toLowerCase().includes(search.toLowerCase()),
                )
                .map((excip) => {
                  const isExpanded = expandedHerb === excip.id;
                  return (
                    <div
                      key={excip.id}
                      className="rounded-lg overflow-hidden"
                      style={{
                        border: "1px solid oklch(0.32 0.065 172 / 0.3)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedHerb(isExpanded ? null : excip.id)
                        }
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors"
                        style={{
                          background: isExpanded
                            ? "oklch(0.24 0.055 170)"
                            : "oklch(0.22 0.052 170)",
                        }}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground">
                            {excip.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {excip.grade} · {excip.typicalUse}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              background: "oklch(0.64 0.168 145 / 0.15)",
                              color: "oklch(0.64 0.168 145)",
                            }}
                          >
                            {excip.source.split("/")[0].trim()}
                          </span>
                          {isExpanded ? (
                            <ChevronDown
                              size={13}
                              className="text-muted-foreground"
                            />
                          ) : (
                            <ChevronRight
                              size={13}
                              className="text-muted-foreground"
                            />
                          )}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="px-3 py-3 space-y-2 text-xs"
                              style={{ background: "oklch(0.21 0.050 170)" }}
                            >
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-muted-foreground">
                                    CAS:
                                  </span>{" "}
                                  <span className="text-foreground font-mono">
                                    {excip.cas}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Assay:
                                  </span>{" "}
                                  <span className="text-foreground">
                                    {excip.assayMin}–{excip.assayMax}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Source:
                                  </span>{" "}
                                  <span className="text-foreground">
                                    {excip.source}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Typical use:
                                  </span>{" "}
                                  <span className="text-foreground">
                                    {excip.typicalUse}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Solubility:
                                </span>{" "}
                                <span className="text-foreground">
                                  {excip.solubility}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Storage:
                                </span>{" "}
                                <span className="text-foreground">
                                  {excip.storage}
                                </span>
                              </div>
                              <div className="text-foreground/80 italic">
                                {excip.description}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

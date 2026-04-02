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
  Trash2,
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
import { getExcipientCollegeParams } from "../data/excipientCollegeParams";
import {
  type ExcipientCategory,
  type ExcipientIngredient,
  apiDrugs,
  apiPharmacologicalEffects,
  excipientCategoryLabels,
  excipientCategoryMap,
} from "../data/formulationData";
import { getHerbCollegeParams } from "../data/herbCollegeParams";
import { getProfileByHerbName } from "../data/pharmacologicalProfiles";
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
import { deleteAnalysis, saveLocalAnalysis } from "../utils/analysisStore";

const paramLabels: [string, keyof import("../backend.d").AnalysisResult][] = [
  ["Moisture", "moistureOk"],
  ["Ash", "ashOk"],
  ["Extractive", "extractiveOk"],
  ["Heavy Metals", "heavyMetalsOk"],
  ["Microbial", "microbialOk"],
];

// ---- Herb Monograph Detail (College-Level) ----

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
      style={{
        background: "oklch(0.26 0.065 172)",
        color: "oklch(0.72 0.168 172)",
      }}
    >
      {title}
    </div>
  );
}

function ParamTable({
  rows,
  editField,
  editValue,
  setEditValue,
  startEdit,
  saveEdit,
  stopEdit,
  customVals,
}: {
  rows: {
    label: string;
    field?: string;
    range: string;
    unit: string;
    reference: string;
  }[];
  editField: string | null;
  editValue: string;
  setEditValue: (v: string) => void;
  startEdit: (field: string, current: string) => void;
  saveEdit: (field: string) => void;
  stopEdit: () => void;
  customVals: Record<string, string>;
}) {
  return (
    <table className="w-full text-xs">
      <thead style={{ background: "oklch(0.24 0.055 170)" }}>
        <tr>
          <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold w-[32%]">
            Parameter
          </th>
          <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold">
            Limit / Range
          </th>
          <th className="text-left px-2 py-1.5 text-muted-foreground font-semibold w-[22%]">
            Unit
          </th>
          <th className="text-left px-2 py-1.5 text-muted-foreground font-semibold w-[22%]">
            Reference
          </th>
          <th className="w-6" />
        </tr>
      </thead>
      <tbody>
        {rows.map(({ label, field, range, unit, reference }, i) => {
          const isEditing = field && editField === field;
          const displayRange =
            field && customVals[field] !== undefined
              ? customVals[field]
              : range;
          return (
            <tr
              key={label}
              style={{
                background:
                  i % 2 === 0 ? "oklch(0.22 0.052 170)" : "transparent",
                borderTop: "1px solid oklch(0.32 0.065 172 / 0.2)",
              }}
            >
              <td className="px-3 py-1.5 text-foreground">{label}</td>
              <td className="px-3 py-1.5">
                {isEditing ? (
                  <span className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 px-1.5 py-0.5 rounded text-xs"
                      style={{
                        background: "oklch(0.28 0.060 170)",
                        border: "1px solid oklch(0.72 0.130 78 / 0.5)",
                        color: "oklch(0.94 0.018 162)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(field!)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Save size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={stopEdit}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ) : (
                  <span
                    style={{
                      color:
                        field && customVals[field] !== undefined
                          ? "oklch(0.72 0.130 78)"
                          : "oklch(0.64 0.168 145)",
                    }}
                  >
                    {displayRange}
                  </span>
                )}
              </td>
              <td className="px-2 py-1.5 text-muted-foreground text-[10px]">
                {unit}
              </td>
              <td
                className="px-2 py-1.5 text-[10px]"
                style={{ color: "oklch(0.60 0.168 245)" }}
              >
                {reference}
              </td>
              <td className="px-1 py-1.5 text-center">
                {field && !isEditing && (
                  <button
                    type="button"
                    onClick={() => startEdit(field, displayRange)}
                    className="text-muted-foreground hover:text-foreground opacity-40 hover:opacity-100"
                  >
                    <Pencil size={10} />
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function MonographDetail({ herb }: { herb: HerbMonograph }) {
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [customVals, setCustomVals] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(`ayurnexis_college_ref_${herb.id}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const hasCustom = Object.keys(customVals).length > 0;
  const cp = getHerbCollegeParams(herb.id);

  const startEdit = (field: string, current: string) => {
    setEditField(field);
    setEditValue(current);
  };
  const saveEdit = (field: string) => {
    const updated = { ...customVals, [field]: editValue };
    setCustomVals(updated);
    localStorage.setItem(
      `ayurnexis_college_ref_${herb.id}`,
      JSON.stringify(updated),
    );
    setEditField(null);
  };
  const stopEdit = () => setEditField(null);
  const resetCustom = () => {
    setCustomVals({});
    localStorage.removeItem(`ayurnexis_college_ref_${herb.id}`);
  };

  // Fallback: use old parameters if no college params available
  if (!cp) {
    const p = herb.parameters;
    return (
      <div className="mt-3">
        <div className="text-xs text-muted-foreground mb-2">
          Source:{" "}
          <span
            className="font-semibold"
            style={{ color: "oklch(0.72 0.130 78)" }}
          >
            {herb.source}
          </span>{" "}
          · Part: <span className="text-foreground">{herb.part}</span>
        </div>
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
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Moisture (LoD)", v: `NMT ${p.moisture.max}%` },
                { label: "Total Ash", v: `NMT ${p.totalAsh.max}%` },
                {
                  label: "Acid-Insoluble Ash",
                  v: `NMT ${p.acidInsolubleAsh.max}%`,
                },
                {
                  label: "Water-Sol. Extractive",
                  v: `NLT ${p.waterSolubleExtractive.min}%`,
                },
                {
                  label: "Alcohol-Sol. Extractive",
                  v: `NLT ${p.alcoholSolubleExtractive.min}%`,
                },
                { label: "Foreign Matter", v: `NMT ${p.foreignMatter.max}%` },
              ].map(({ label, v }, i) => (
                <tr
                  key={label}
                  style={{
                    background:
                      i % 2 === 0 ? "oklch(0.22 0.052 170)" : "transparent",
                    borderTop: "1px solid oklch(0.32 0.065 172 / 0.2)",
                  }}
                >
                  <td className="px-3 py-1.5 text-foreground">{label}</td>
                  <td
                    className="px-3 py-1.5 text-right"
                    style={{ color: "oklch(0.64 0.168 145)" }}
                  >
                    {v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-0">
      {/* Header: Categorical Info */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "oklch(0.26 0.065 172)",
            color: "oklch(0.80 0.120 172)",
          }}
        >
          🌿 {cp.categoricalInfo.plantPart}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "oklch(0.60 0.168 245 / 0.15)",
            color: "oklch(0.60 0.168 245)",
          }}
        >
          📚 {cp.categoricalInfo.source}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "oklch(0.72 0.130 78 / 0.12)",
            color: "oklch(0.72 0.130 78)",
          }}
        >
          💊 {cp.categoricalInfo.form}
        </span>
        {hasCustom && (
          <button
            type="button"
            onClick={resetCustom}
            className="ml-auto text-[10px] text-destructive hover:text-red-400 flex items-center gap-1"
          >
            <X size={10} /> Reset custom
          </button>
        )}
      </div>

      {hasCustom && (
        <div
          className="mb-1.5 px-2 py-1 rounded text-[10px] flex items-center gap-1.5"
          style={{
            background: "oklch(0.72 0.130 78 / 0.10)",
            color: "oklch(0.72 0.130 78)",
          }}
        >
          <Pencil size={10} /> Custom values active
        </div>
      )}

      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid oklch(0.32 0.065 172 / 0.3)" }}
      >
        {/* Organoleptic Parameters */}
        <SectionHeader title="Organoleptic Parameters" />
        <table className="w-full text-xs">
          <thead style={{ background: "oklch(0.24 0.055 170)" }}>
            <tr>
              <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold w-[32%]">
                Parameter
              </th>
              <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold">
                Standard Description
              </th>
              <th className="text-left px-2 py-1.5 text-muted-foreground font-semibold w-[18%]">
                Reference
              </th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["Color", cp.organoleptic.color],
                ["Odor", cp.organoleptic.odor],
                ["Taste", cp.organoleptic.taste],
                ["Texture", cp.organoleptic.texture],
              ] as [string, typeof cp.organoleptic.color][]
            ).map(([label, param], i) => (
              <tr
                key={label}
                style={{
                  background:
                    i % 2 === 0 ? "oklch(0.22 0.052 170)" : "transparent",
                  borderTop: "1px solid oklch(0.32 0.065 172 / 0.2)",
                }}
              >
                <td className="px-3 py-1.5 text-foreground">{label}</td>
                <td className="px-3 py-1.5 text-foreground/90">
                  {param.value}{" "}
                  <span className="text-muted-foreground text-[10px]">
                    ({param.unit})
                  </span>
                </td>
                <td
                  className="px-2 py-1.5 text-[10px]"
                  style={{ color: "oklch(0.60 0.168 245)" }}
                >
                  {param.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Physicochemical Parameters */}
        <SectionHeader title="Physicochemical Parameters" />
        <ParamTable
          rows={[
            {
              label: "Moisture Content (LoD)",
              field: "moistureContent",
              range: cp.physicochemical.moistureContent.range,
              unit: cp.physicochemical.moistureContent.unit,
              reference: cp.physicochemical.moistureContent.reference,
            },
            {
              label: "Total Ash",
              field: "totalAsh",
              range: cp.physicochemical.totalAsh.range,
              unit: cp.physicochemical.totalAsh.unit,
              reference: cp.physicochemical.totalAsh.reference,
            },
            {
              label: "Acid-Insoluble Ash",
              field: "acidInsolubleAsh",
              range: cp.physicochemical.acidInsolubleAsh.range,
              unit: cp.physicochemical.acidInsolubleAsh.unit,
              reference: cp.physicochemical.acidInsolubleAsh.reference,
            },
            {
              label: "Water-Soluble Extractive",
              field: "waterSolubleExtractive",
              range: cp.physicochemical.waterSolubleExtractive.range,
              unit: cp.physicochemical.waterSolubleExtractive.unit,
              reference: cp.physicochemical.waterSolubleExtractive.reference,
            },
            {
              label: "Alcohol-Soluble Extractive",
              field: "alcoholSolubleExtractive",
              range: cp.physicochemical.alcoholSolubleExtractive.range,
              unit: cp.physicochemical.alcoholSolubleExtractive.unit,
              reference: cp.physicochemical.alcoholSolubleExtractive.reference,
            },
            {
              label: "pH",
              field: "pH",
              range: cp.physicochemical.pH.range,
              unit: cp.physicochemical.pH.unit,
              reference: cp.physicochemical.pH.reference,
            },
          ]}
          editField={editField}
          editValue={editValue}
          setEditValue={setEditValue}
          startEdit={startEdit}
          saveEdit={saveEdit}
          stopEdit={stopEdit}
          customVals={customVals}
        />

        {/* Basic Evaluation Tests */}
        <SectionHeader title="Basic Evaluation Tests" />
        <ParamTable
          rows={[
            {
              label: "Foreign Matter %",
              field: "foreignMatter",
              range: cp.basicEvaluation.foreignMatter.range,
              unit: cp.basicEvaluation.foreignMatter.unit,
              reference: cp.basicEvaluation.foreignMatter.reference,
            },
            {
              label: "Extract Yield %",
              field: "extractYield",
              range: cp.basicEvaluation.extractYield.range,
              unit: cp.basicEvaluation.extractYield.unit,
              reference: cp.basicEvaluation.extractYield.reference,
            },
          ]}
          editField={editField}
          editValue={editValue}
          setEditValue={setEditValue}
          startEdit={startEdit}
          saveEdit={saveEdit}
          stopEdit={stopEdit}
          customVals={customVals}
        />

        {/* Phytochemical Screening */}
        <SectionHeader title="Preliminary Phytochemical Screening" />
        <div
          className="px-3 py-2.5 flex flex-wrap gap-2"
          style={{ background: "oklch(0.21 0.050 170)" }}
        >
          {(
            [
              ["Alkaloids", cp.phytochemicalScreening.alkaloids],
              ["Flavonoids", cp.phytochemicalScreening.flavonoids],
              ["Tannins", cp.phytochemicalScreening.tannins],
              ["Saponins", cp.phytochemicalScreening.saponins],
            ] as [string, typeof cp.phytochemicalScreening.alkaloids][]
          ).map(([name, val]) => (
            <div key={name} className="flex flex-col items-center gap-0.5">
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={
                  val.result === "Present"
                    ? {
                        background: "oklch(0.35 0.100 145)",
                        color: "oklch(0.85 0.168 145)",
                      }
                    : {
                        background: "oklch(0.28 0.030 200)",
                        color: "oklch(0.60 0.030 200)",
                      }
                }
              >
                {name}: {val.result}
              </span>
              <span className="text-[9px] text-muted-foreground">
                {val.reference}
              </span>
            </div>
          ))}
        </div>
      </div>
      <MonographPharmWrapper herb={herb} />
    </div>
  );
}

function MonographPharmWrapper({
  herb,
}: { herb: import("../data/pharmacopeiaData").HerbMonograph }) {
  return <HerbPharmacologicalProfile herbName={herb.name} />;
}

// ---- Excipient / API College-Level Detail ----

function HerbPharmacologicalProfile({ herbName }: { herbName: string }) {
  const profile = getProfileByHerbName(herbName);
  if (!profile) return null;
  return (
    <div
      className="mt-3 rounded-lg overflow-hidden"
      style={{ border: "1px solid oklch(0.72 0.130 78 / 0.3)" }}
    >
      <div
        className="px-3 py-2"
        style={{ background: "oklch(0.72 0.130 78 / 0.12)" }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: "oklch(0.72 0.130 78)" }}
        >
          🔬 Pharmacological Profile
        </span>
      </div>
      <div
        className="px-3 py-2.5 space-y-2"
        style={{ background: "oklch(0.21 0.050 170)" }}
      >
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            Mechanism / Active Constituents
          </p>
          <p className="text-xs text-foreground/90">
            {profile.phytochemicals.map((p) => p.name).join(", ") ||
              "See pharmacopoeia monograph"}
          </p>
          {profile.phytochemicals[0] && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {profile.phytochemicals[0].mechanism}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            Therapeutic Uses
          </p>
          <ul className="space-y-0.5">
            {profile.therapeuticUses.slice(0, 5).map((use) => (
              <li
                key={use.substring(0, 30)}
                className="text-[11px] text-foreground/80 flex gap-1.5"
              >
                <span style={{ color: "oklch(0.72 0.130 78)" }}>•</span>
                <span>{use}</span>
              </li>
            ))}
          </ul>
        </div>
        {profile.modernEvidence.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Modern Evidence
            </p>
            <ul className="space-y-0.5">
              {profile.modernEvidence.slice(0, 3).map((ev) => (
                <li
                  key={ev.substring(0, 30)}
                  className="text-[11px] text-muted-foreground flex gap-1.5"
                >
                  <span style={{ color: "oklch(0.60 0.168 245)" }}>📄</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-1 pt-0.5">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: "oklch(0.64 0.168 145 / 0.15)",
              color: "oklch(0.64 0.168 145)",
            }}
          >
            Ref: {profile.pharmacopeiaRef}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background:
                profile.riskLevel === "Low"
                  ? "oklch(0.64 0.168 145 / 0.15)"
                  : "oklch(0.72 0.130 78 / 0.15)",
              color:
                profile.riskLevel === "Low"
                  ? "oklch(0.64 0.168 145)"
                  : "oklch(0.72 0.130 78)",
            }}
          >
            Risk: {profile.riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
}

function APIPharmacologicalProfile({ apiId }: { apiId: string }) {
  const profile = apiPharmacologicalEffects[apiId];
  if (!profile) return null;
  return (
    <div
      className="mt-3 rounded-lg overflow-hidden"
      style={{ border: "1px solid oklch(0.60 0.168 245 / 0.3)" }}
    >
      <div
        className="px-3 py-2"
        style={{ background: "oklch(0.60 0.168 245 / 0.12)" }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: "oklch(0.60 0.168 245)" }}
        >
          💊 Pharmacological Profile
        </span>
      </div>
      <div
        className="px-3 py-2.5 space-y-2"
        style={{ background: "oklch(0.21 0.050 170)" }}
      >
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            Mechanism of Action
          </p>
          <p className="text-xs text-foreground/90">{profile.mechanism}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            Therapeutic Uses
          </p>
          <ul className="space-y-0.5">
            {profile.therapeuticUses.map((use) => (
              <li
                key={use.substring(0, 30)}
                className="text-[11px] text-foreground/80 flex gap-1.5"
              >
                <span style={{ color: "oklch(0.60 0.168 245)" }}>•</span>
                <span>{use}</span>
              </li>
            ))}
          </ul>
        </div>
        {profile.notes && (
          <div
            className="text-[10px] text-muted-foreground italic border-t pt-1.5"
            style={{ borderColor: "oklch(0.32 0.065 172 / 0.3)" }}
          >
            📝 {profile.notes}
          </div>
        )}
      </div>
    </div>
  );
}

function ExcipientDetail({ id, source }: { id: string; source: string }) {
  const cp = getExcipientCollegeParams(id);
  if (!cp) {
    return (
      <div className="px-3 py-2 text-xs text-muted-foreground italic">
        College-level parameters not available. Source: {source}
      </div>
    );
  }
  return (
    <div className="space-y-0">
      {/* Categorical Info */}
      <div
        className="px-3 py-2 flex flex-wrap gap-1.5"
        style={{ background: "oklch(0.21 0.050 170)" }}
      >
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "oklch(0.26 0.065 172)",
            color: "oklch(0.80 0.120 172)",
          }}
        >
          🧪 {cp.categoricalInfo.chemicalClass}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "oklch(0.60 0.168 245 / 0.15)",
            color: "oklch(0.60 0.168 245)",
          }}
        >
          📚 {cp.categoricalInfo.source}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "oklch(0.72 0.130 78 / 0.12)",
            color: "oklch(0.72 0.130 78)",
          }}
        >
          💊 {cp.categoricalInfo.form}
        </span>
      </div>
      <div
        className="rounded-b-lg overflow-hidden"
        style={{
          border: "1px solid oklch(0.32 0.065 172 / 0.3)",
          borderTop: "none",
        }}
      >
        {/* Organoleptic */}
        <SectionHeader title="Organoleptic Parameters" />
        <table className="w-full text-xs">
          <thead style={{ background: "oklch(0.24 0.055 170)" }}>
            <tr>
              <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold w-[28%]">
                Parameter
              </th>
              <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold">
                Standard Description
              </th>
              <th className="text-left px-2 py-1.5 text-muted-foreground font-semibold w-[20%]">
                Reference
              </th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["Color", cp.organoleptic.color],
                ["Odor", cp.organoleptic.odor],
                ["Taste", cp.organoleptic.taste],
                ["Texture", cp.organoleptic.texture],
              ] as [string, typeof cp.organoleptic.color][]
            ).map(([label, param], i) => (
              <tr
                key={label}
                style={{
                  background:
                    i % 2 === 0 ? "oklch(0.22 0.052 170)" : "transparent",
                  borderTop: "1px solid oklch(0.32 0.065 172 / 0.2)",
                }}
              >
                <td className="px-3 py-1.5 text-foreground">{label}</td>
                <td className="px-3 py-1.5 text-foreground/90">
                  {param.value}{" "}
                  <span className="text-muted-foreground text-[10px]">
                    ({param.unit})
                  </span>
                </td>
                <td
                  className="px-2 py-1.5 text-[10px]"
                  style={{ color: "oklch(0.60 0.168 245)" }}
                >
                  {param.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Physicochemical */}
        <SectionHeader title="Physicochemical Parameters" />
        <table className="w-full text-xs">
          <thead style={{ background: "oklch(0.24 0.055 170)" }}>
            <tr>
              <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold w-[28%]">
                Parameter
              </th>
              <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold">
                Limit / Range
              </th>
              <th className="text-left px-2 py-1.5 text-muted-foreground font-semibold w-[14%]">
                Unit
              </th>
              <th className="text-left px-2 py-1.5 text-muted-foreground font-semibold w-[18%]">
                Reference
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: "Moisture Content (LoD)",
                d: cp.physicochemical.moistureContent,
              },
              ...(cp.physicochemical.totalAsh
                ? [{ label: "Total Ash", d: cp.physicochemical.totalAsh }]
                : []),
              { label: "pH", d: cp.physicochemical.pH },
              { label: "Solubility", d: cp.physicochemical.solubility },
            ].map(({ label, d }, i) => (
              <tr
                key={label}
                style={{
                  background:
                    i % 2 === 0 ? "oklch(0.22 0.052 170)" : "transparent",
                  borderTop: "1px solid oklch(0.32 0.065 172 / 0.2)",
                }}
              >
                <td className="px-3 py-1.5 text-foreground">{label}</td>
                <td
                  className="px-3 py-1.5"
                  style={{ color: "oklch(0.64 0.168 145)" }}
                >
                  {(d as any).range ?? (d as any).value}
                </td>
                <td className="px-2 py-1.5 text-muted-foreground text-[10px]">
                  {d.unit}
                </td>
                <td
                  className="px-2 py-1.5 text-[10px]"
                  style={{ color: "oklch(0.60 0.168 245)" }}
                >
                  {d.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Assay/Purity */}
        <SectionHeader title="Basic Evaluation / Assay" />
        <table className="w-full text-xs">
          <thead style={{ background: "oklch(0.24 0.055 170)" }}>
            <tr>
              <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold w-[28%]">
                Parameter
              </th>
              <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold">
                Limit / Range
              </th>
              <th className="text-left px-2 py-1.5 text-muted-foreground font-semibold w-[20%]">
                Unit
              </th>
              <th className="text-left px-2 py-1.5 text-muted-foreground font-semibold w-[18%]">
                Reference
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ...(cp.basicEvaluation.foreignMatter
                ? [
                    {
                      label: "Foreign Matter",
                      d: cp.basicEvaluation.foreignMatter,
                    },
                  ]
                : []),
              { label: "Assay / Purity", d: cp.basicEvaluation.assayPurity },
            ].map(({ label, d }, i) => (
              <tr
                key={label}
                style={{
                  background:
                    i % 2 === 0 ? "oklch(0.22 0.052 170)" : "transparent",
                  borderTop: "1px solid oklch(0.32 0.065 172 / 0.2)",
                }}
              >
                <td className="px-3 py-1.5 text-foreground">{label}</td>
                <td
                  className="px-3 py-1.5"
                  style={{ color: "oklch(0.64 0.168 145)" }}
                >
                  {d.range}
                </td>
                <td className="px-2 py-1.5 text-muted-foreground text-[10px]">
                  {d.unit}
                </td>
                <td
                  className="px-2 py-1.5 text-[10px]"
                  style={{ color: "oklch(0.60 0.168 245)" }}
                >
                  {d.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <APIPharmacologicalProfile apiId={id} />
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
  const {
    data: analyses = [],
    isLoading,
    refreshLocal,
  } = useAllAnalysesMerged();
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

  const handleDeleteAnalysis = (batchId: string) => {
    deleteAnalysis(batchId);
    refreshLocal();
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

    // Read config thresholds and weights from localStorage
    let cfgThresholds = {
      moisture: 12,
      totalAsh: 8,
      extractiveValue: 15,
      heavyMetals: 1.0,
      microbialCount: 10000,
    };
    let cfgWeights = {
      moistureWeight: 20,
      ashWeight: 20,
      extractiveWeight: 20,
      heavyMetalsWeight: 20,
      microbialWeight: 20,
    };
    try {
      const cfg = JSON.parse(localStorage.getItem("ayurnexis_config") || "{}");
      if (cfg.thresholds) {
        cfgThresholds = {
          moisture: cfg.thresholds.moisture ?? 12,
          totalAsh: cfg.thresholds.totalAsh ?? 8,
          extractiveValue: cfg.thresholds.extractiveValue ?? 15,
          heavyMetals: cfg.thresholds.heavyMetals ?? 1.0,
          microbialCount: cfg.thresholds.microbialCount ?? 10000,
        };
      }
      if (cfg.analysisSettings) {
        cfgWeights = {
          moistureWeight: cfg.analysisSettings.moistureWeight ?? 20,
          ashWeight: cfg.analysisSettings.ashWeight ?? 20,
          extractiveWeight: cfg.analysisSettings.extractiveWeight ?? 20,
          heavyMetalsWeight: cfg.analysisSettings.heavyMetalsWeight ?? 20,
          microbialWeight: cfg.analysisSettings.microbialWeight ?? 20,
        };
      }
    } catch {
      /* ignore */
    }

    const p = {
      moisture: params.moisture ?? batch.moisture,
      ash: params.ash ?? batch.ash,
      extractiveValue: params.extractiveValue ?? batch.extractiveValue,
      heavyMetals: params.heavyMetals ?? batch.heavyMetals,
      microbialCount: params.microbialCount ?? batch.microbialCount,
    };

    const moistureOk = p.moisture <= cfgThresholds.moisture;
    const ashOk = p.ash <= cfgThresholds.totalAsh;
    const extractiveOk = p.extractiveValue >= cfgThresholds.extractiveValue;
    const heavyMetalsOk = p.heavyMetals <= cfgThresholds.heavyMetals;
    const microbialOk = p.microbialCount <= cfgThresholds.microbialCount;

    const totalW =
      cfgWeights.moistureWeight +
      cfgWeights.ashWeight +
      cfgWeights.extractiveWeight +
      cfgWeights.heavyMetalsWeight +
      cfgWeights.microbialWeight;
    let score = 0;
    if (moistureOk) score += cfgWeights.moistureWeight;
    if (ashOk) score += cfgWeights.ashWeight;
    if (extractiveOk) score += cfgWeights.extractiveWeight;
    if (heavyMetalsOk) score += cfgWeights.heavyMetalsWeight;
    if (microbialOk) score += cfgWeights.microbialWeight;
    const qualityScore = Math.round((score / totalW) * 100);
    const status = qualityScore >= 60 ? "Accept" : "Reject";

    const anomalyDetails: string[] = [];
    if (!moistureOk && p.moisture > cfgThresholds.moisture * 2)
      anomalyDetails.push("Moisture (>2x limit)");
    if (!ashOk && p.ash > cfgThresholds.totalAsh * 2)
      anomalyDetails.push("Ash (>2x limit)");
    if (!extractiveOk && p.extractiveValue < cfgThresholds.extractiveValue / 2)
      anomalyDetails.push("Extractive Value (<50% of limit)");
    if (!heavyMetalsOk && p.heavyMetals > cfgThresholds.heavyMetals * 2)
      anomalyDetails.push("Heavy Metals (>2x limit)");
    if (!microbialOk && p.microbialCount > cfgThresholds.microbialCount * 2)
      anomalyDetails.push("Microbial Count (>2x limit)");

    const result = {
      batchId: batch.batchId,
      herbName: batch.herbName,
      supplier: batch.supplier,
      region: batch.region,
      dateReceived: batch.dateReceived,
      qualityScore,
      status,
      probability: qualityScore / 100,
      anomaly: anomalyDetails.length > 0,
      anomalyDetails: anomalyDetails.join("; "),
      moistureOk,
      ashOk,
      extractiveOk,
      heavyMetalsOk,
      microbialOk,
      timestamp: BigInt(Date.now()),
    };
    setRunResult(result);
    saveLocalAnalysis(result);
    refreshLocal();
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
                        <span style={{ color: "#1e293b" }}>Quality Score</span>
                        <span
                          className="font-mono font-bold"
                          style={{
                            color:
                              runResult.status === "Accept"
                                ? "oklch(0.80 0.168 145)"
                                : "oklch(0.78 0.174 24)",
                          }}
                        >
                          {runResult.qualityScore.toFixed(0)}/100
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "#e2e8f0" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${runResult.qualityScore}%`,
                            background:
                              runResult.status === "Accept"
                                ? "oklch(0.75 0.168 145)"
                                : "oklch(0.70 0.174 24)",
                          }}
                        />
                      </div>
                    </div>

                    {/* ML Confidence */}
                    <div className="text-xs mb-3" style={{ color: "#475569" }}>
                      ML Confidence:{" "}
                      <span
                        className="font-mono font-bold"
                        style={{ color: "#1e293b" }}
                      >
                        {(runResult.probability * 100).toFixed(1)}%
                      </span>{" "}
                      accept probability
                    </div>

                    {/* Parameter status */}
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "#475569" }}
                    >
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
                              ? "oklch(0.64 0.168 145 / 0.18)"
                              : "oklch(0.54 0.174 24 / 0.18)",
                            color: ok
                              ? "oklch(0.80 0.168 145)"
                              : "oklch(0.78 0.174 24)",
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

              {/* Gauge + probability + delete */}
              <div className="flex items-start gap-4">
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
                <button
                  type="button"
                  data-ocid={`analysis.delete_button.${i + 1}`}
                  onClick={() => handleDeleteAnalysis(a.batchId)}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors mt-1"
                  title="Delete analysis record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                              style={{ background: "oklch(0.21 0.050 170)" }}
                            >
                              <ExcipientDetail
                                id={api.id}
                                source={api.source}
                              />
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
                              style={{ background: "oklch(0.21 0.050 170)" }}
                            >
                              <ExcipientDetail
                                id={excip.id}
                                source={excip.source}
                              />
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

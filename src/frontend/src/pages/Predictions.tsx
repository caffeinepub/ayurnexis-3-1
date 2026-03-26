import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalysisResult } from "../backend.d";
import { getProfileByHerbName } from "../data/pharmacologicalProfiles";
import { SEED_BATCHES, type SeedBatch } from "../data/seedBatches";
import {
  useAllAnalysesMerged,
  useRiskAssessment,
  useScoreTrends,
  useSupplierStats,
} from "../hooks/useQueries";

type ModalState = {
  analysis: AnalysisResult;
  seed: SeedBatch | undefined;
} | null;

function riskStyle(level: string) {
  if (level === "High")
    return { bg: "oklch(0.54 0.174 24 / 0.2)", text: "oklch(0.54 0.174 24)" };
  if (level === "Medium")
    return { bg: "oklch(0.78 0.130 87 / 0.2)", text: "oklch(0.78 0.130 87)" };
  return { bg: "oklch(0.64 0.168 145 / 0.2)", text: "oklch(0.64 0.168 145)" };
}

function ParamCell({
  value,
  refLimit,
  ok,
  suffix = "%",
}: {
  value: number | undefined;
  refLimit: string;
  ok: boolean;
  suffix?: string;
}) {
  if (value === undefined) {
    return (
      <td className="px-3 py-2">
        <div
          className="text-[11px] font-semibold"
          style={{
            color: ok ? "oklch(0.64 0.168 145)" : "oklch(0.54 0.174 24)",
          }}
        >
          {ok ? "✓" : "✗"}
        </div>
        <div className="text-[9px] text-muted-foreground">{refLimit}</div>
      </td>
    );
  }
  return (
    <td className="px-3 py-2">
      <div
        className="text-[11px] font-bold"
        style={{ color: ok ? "oklch(0.64 0.168 145)" : "oklch(0.62 0.20 24)" }}
      >
        {value.toFixed(2)}
        {suffix}
      </div>
      <div className="text-[9px] text-muted-foreground">{refLimit}</div>
    </td>
  );
}

function SeverityBadge({
  severity,
}: { severity: "Mild" | "Moderate" | "Severe" }) {
  const styles = {
    Mild: { bg: "oklch(0.64 0.168 145 / 0.2)", text: "oklch(0.64 0.168 145)" },
    Moderate: {
      bg: "oklch(0.78 0.130 87 / 0.2)",
      text: "oklch(0.78 0.130 87)",
    },
    Severe: { bg: "oklch(0.54 0.174 24 / 0.2)", text: "oklch(0.54 0.174 24)" },
  };
  const s = styles[severity];
  return (
    <Badge
      style={{ background: s.bg, color: s.text, border: "none", fontSize: 10 }}
    >
      {severity}
    </Badge>
  );
}

function PharmacologicalModal({
  state,
  onClose,
}: { state: ModalState; onClose: () => void }) {
  if (!state) return null;
  const { analysis, seed } = state;
  const profile = getProfileByHerbName(analysis.herbName);

  const scoreColor =
    analysis.qualityScore >= 75
      ? "oklch(0.64 0.168 145)"
      : analysis.qualityScore >= 50
        ? "oklch(0.78 0.130 87)"
        : "oklch(0.54 0.174 24)";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-4xl p-0 overflow-hidden"
        style={{
          background: "oklch(0.18 0.045 170)",
          border: "1px solid oklch(0.38 0.076 175 / 0.4)",
        }}
        data-ocid="pharma.modal"
      >
        {/* Header */}
        <DialogHeader
          className="px-6 pt-5 pb-4"
          style={{ borderBottom: "1px solid oklch(0.38 0.076 175 / 0.3)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {analysis.herbName}
              </DialogTitle>
              {profile && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  <em>{profile.latinName}</em> · {profile.family} ·{" "}
                  {profile.part}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {analysis.batchId}
                </span>
                <Badge
                  style={{
                    background:
                      analysis.status === "Accept"
                        ? "oklch(0.64 0.168 145 / 0.2)"
                        : "oklch(0.54 0.174 24 / 0.2)",
                    color:
                      analysis.status === "Accept"
                        ? "oklch(0.64 0.168 145)"
                        : "oklch(0.54 0.174 24)",
                    border: "none",
                  }}
                >
                  {analysis.status}
                </Badge>
                <span
                  className="text-xs font-bold"
                  style={{ color: scoreColor }}
                >
                  QS: {analysis.qualityScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList
            className="mx-6 mt-3 mb-0"
            style={{ background: "oklch(0.22 0.052 170 / 0.6)" }}
          >
            <TabsTrigger value="overview" data-ocid="pharma.tab">
              Overview
            </TabsTrigger>
            <TabsTrigger value="pharmacology" data-ocid="pharma.tab">
              Pharmacology
            </TabsTrigger>
            <TabsTrigger value="safety" data-ocid="pharma.tab">
              Safety
            </TabsTrigger>
            <TabsTrigger value="batch" data-ocid="pharma.tab">
              Batch Parameters
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px]">
            {!profile ? (
              <div className="px-6 py-8">
                <TabsContent value="overview">
                  <div
                    className="rounded-xl p-5 text-sm text-muted-foreground"
                    style={{
                      background: "oklch(0.22 0.052 170 / 0.5)",
                      border: "1px solid oklch(0.38 0.076 175 / 0.25)",
                    }}
                  >
                    <p className="font-semibold text-foreground mb-1">
                      No pharmacological profile available
                    </p>
                    No detailed pharmacological profile available for this herb.
                    Contact your pharmacopeia standards officer.
                  </div>
                </TabsContent>
                <TabsContent value="pharmacology">
                  <BatchParamsTab analysis={analysis} seed={seed} />
                </TabsContent>
                <TabsContent value="safety">
                  <BatchParamsTab analysis={analysis} seed={seed} />
                </TabsContent>
                <TabsContent value="batch">
                  <BatchParamsTab analysis={analysis} seed={seed} />
                </TabsContent>
              </div>
            ) : (
              <div className="px-6 py-4">
                {/* Overview */}
                <TabsContent value="overview">
                  <div className="space-y-4">
                    {/* Pharmacopeia reference */}
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Pharmacopeia:{" "}
                      </span>
                      {profile.pharmacopeiaRef}
                    </div>

                    {/* Ayurvedic Properties */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(0.22 0.052 170 / 0.5)",
                        border: "1px solid oklch(0.38 0.076 175 / 0.25)",
                      }}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Ayurvedic Properties
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          {
                            label: "Rasa (Taste)",
                            value: profile.ayurvedicProperties.rasa.join(", "),
                          },
                          {
                            label: "Guna (Quality)",
                            value: profile.ayurvedicProperties.guna.join(", "),
                          },
                          {
                            label: "Veerya (Potency)",
                            value: profile.ayurvedicProperties.veerya,
                          },
                          {
                            label: "Vipaka (Post-digest)",
                            value: profile.ayurvedicProperties.vipaka,
                          },
                          {
                            label: "Prabhava",
                            value: profile.ayurvedicProperties.prabhava,
                          },
                          {
                            label: "Dosha Effect",
                            value: profile.ayurvedicProperties.dosha,
                          },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                              {item.label}
                            </div>
                            <div className="text-xs text-foreground mt-0.5">
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Therapeutic Uses */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(0.22 0.052 170 / 0.5)",
                        border: "1px solid oklch(0.38 0.076 175 / 0.25)",
                      }}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Therapeutic Uses &amp; Benefits
                      </h3>
                      <ul className="space-y-1.5">
                        {profile.therapeuticUses.map((use) => (
                          <li
                            key={use.slice(0, 40)}
                            className="flex gap-2 text-xs text-foreground"
                          >
                            <span style={{ color: "oklch(0.72 0.130 78)" }}>
                              •
                            </span>
                            {use}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Modern Evidence */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(0.22 0.052 170 / 0.5)",
                        border: "1px solid oklch(0.38 0.076 175 / 0.25)",
                      }}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Modern Clinical Evidence
                      </h3>
                      <ol className="space-y-1.5 list-decimal list-inside">
                        {profile.modernEvidence.map((ev) => (
                          <li
                            key={ev.slice(0, 40)}
                            className="text-xs text-foreground"
                          >
                            {ev}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </TabsContent>

                {/* Pharmacology */}
                <TabsContent value="pharmacology">
                  <div className="space-y-4">
                    {/* Mechanism of Action */}
                    {profile.mechanismOfAction && (
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background: "oklch(0.20 0.06 240 / 0.4)",
                          border: "1px solid oklch(0.50 0.12 240 / 0.3)",
                        }}
                      >
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          🔬 Mechanism of Action
                        </h3>
                        <p className="text-xs text-foreground leading-relaxed">
                          {profile.mechanismOfAction}
                        </p>
                      </div>
                    )}
                    {/* Phytochemicals */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(0.22 0.052 170 / 0.5)",
                        border: "1px solid oklch(0.38 0.076 175 / 0.25)",
                      }}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Active Phytochemicals
                      </h3>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/30">
                            {["Compound", "Class", "Mechanism of Action"].map(
                              (h) => (
                                <th
                                  key={h}
                                  className="text-left py-1.5 pr-4 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"
                                >
                                  {h}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {profile.phytochemicals.map((p) => (
                            <tr
                              key={p.name}
                              className="border-b border-border/15"
                            >
                              <td className="py-2 pr-4 font-semibold text-foreground">
                                {p.name}
                              </td>
                              <td className="py-2 pr-4 text-muted-foreground">
                                {p.class}
                              </td>
                              <td className="py-2 text-foreground">
                                {p.mechanism}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Dosage */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(0.22 0.052 170 / 0.5)",
                        border: "1px solid oklch(0.38 0.076 175 / 0.25)",
                      }}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Dosage Guidelines
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Powder", value: profile.dosage.powder },
                          { label: "Extract", value: profile.dosage.extract },
                          {
                            label: "Decoction",
                            value: profile.dosage.decoction,
                          },
                          { label: "Duration", value: profile.dosage.duration },
                        ].map((d) => (
                          <div
                            key={d.label}
                            className="rounded-lg p-3"
                            style={{
                              background: "oklch(0.18 0.045 170 / 0.8)",
                            }}
                          >
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {d.label}
                            </div>
                            <div className="text-xs text-foreground mt-1">
                              {d.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Safety */}
                <TabsContent value="safety">
                  <div className="space-y-4">
                    {/* Risk Level */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Risk Level:
                      </span>
                      <Badge
                        style={
                          riskStyle(profile.riskLevel).bg
                            ? {
                                background: riskStyle(profile.riskLevel).bg,
                                color: riskStyle(profile.riskLevel).text,
                                border: "none",
                              }
                            : {}
                        }
                      >
                        {profile.riskLevel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {profile.riskNotes}
                      </span>
                    </div>

                    {/* Adverse Effects Table */}
                    {profile.adverseEffects &&
                      profile.adverseEffects.length > 0 && (
                        <div
                          className="rounded-xl p-4"
                          style={{
                            background: "oklch(0.22 0.06 24 / 0.12)",
                            border: "1px solid oklch(0.62 0.20 24 / 0.3)",
                          }}
                        >
                          <h3
                            className="text-xs font-bold uppercase tracking-wider mb-3"
                            style={{ color: "oklch(0.62 0.20 24)" }}
                          >
                            ⚗ Adverse Effects (Evidence-Based)
                          </h3>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border/30">
                                {["Effect", "Severity", "Frequency"].map(
                                  (h) => (
                                    <th
                                      key={h}
                                      className="text-left py-1.5 pr-4 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"
                                    >
                                      {h}
                                    </th>
                                  ),
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {profile.adverseEffects.map((ae) => (
                                <tr
                                  key={ae.effect}
                                  className="border-b border-border/15"
                                >
                                  <td className="py-2 pr-4 text-foreground">
                                    {ae.effect}
                                  </td>
                                  <td className="py-2 pr-4">
                                    <Badge
                                      style={{
                                        background:
                                          ae.severity === "Severe"
                                            ? "oklch(0.54 0.174 24 / 0.2)"
                                            : ae.severity === "Moderate"
                                              ? "oklch(0.78 0.130 87 / 0.2)"
                                              : "oklch(0.64 0.168 145 / 0.2)",
                                        color:
                                          ae.severity === "Severe"
                                            ? "oklch(0.62 0.20 24)"
                                            : ae.severity === "Moderate"
                                              ? "oklch(0.65 0.14 87)"
                                              : "oklch(0.42 0.14 145)",
                                        border: "none",
                                        fontSize: 9,
                                      }}
                                    >
                                      {ae.severity}
                                    </Badge>
                                  </td>
                                  <td className="py-2 text-muted-foreground">
                                    {ae.frequency}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    {/* Therapeutic Index */}
                    {profile.therapeuticIndex && (
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background: "oklch(0.22 0.052 170 / 0.5)",
                          border: "1px solid oklch(0.38 0.076 175 / 0.25)",
                        }}
                      >
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          📊 Therapeutic Index
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-foreground">
                            {profile.therapeuticIndex.value}
                          </span>
                          <Badge
                            style={{
                              background:
                                profile.therapeuticIndex.classification ===
                                "Narrow"
                                  ? "oklch(0.54 0.174 24 / 0.2)"
                                  : profile.therapeuticIndex.classification ===
                                      "Moderate"
                                    ? "oklch(0.78 0.130 87 / 0.2)"
                                    : "oklch(0.64 0.168 145 / 0.2)",
                              color:
                                profile.therapeuticIndex.classification ===
                                "Narrow"
                                  ? "oklch(0.62 0.20 24)"
                                  : profile.therapeuticIndex.classification ===
                                      "Moderate"
                                    ? "oklch(0.65 0.14 87)"
                                    : "oklch(0.42 0.14 145)",
                              border: "none",
                            }}
                          >
                            {profile.therapeuticIndex.classification}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {profile.therapeuticIndex.notes}
                        </p>
                      </div>
                    )}

                    {/* Side Effects */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(0.28 0.08 80 / 0.15)",
                        border: "1px solid oklch(0.78 0.130 87 / 0.3)",
                      }}
                    >
                      <h3
                        className="text-xs font-bold uppercase tracking-wider mb-3"
                        style={{ color: "oklch(0.78 0.130 87)" }}
                      >
                        ⚠ Side Effects &amp; Disadvantages
                      </h3>
                      <ul className="space-y-1.5">
                        {profile.sideEffects.map((se) => (
                          <li
                            key={se.slice(0, 40)}
                            className="flex gap-2 text-xs"
                            style={{ color: "oklch(0.88 0.06 87)" }}
                          >
                            <span style={{ color: "oklch(0.78 0.130 87)" }}>
                              •
                            </span>
                            {se}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Contraindications */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(0.22 0.06 24 / 0.18)",
                        border: "1px solid oklch(0.54 0.174 24 / 0.35)",
                      }}
                    >
                      <h3
                        className="text-xs font-bold uppercase tracking-wider mb-3"
                        style={{ color: "oklch(0.62 0.20 24)" }}
                      >
                        ✕ Contraindications
                      </h3>
                      <ul className="space-y-1.5">
                        {profile.contraindications.map((ci) => (
                          <li
                            key={ci.slice(0, 40)}
                            className="flex gap-2 text-xs"
                            style={{ color: "oklch(0.85 0.07 24)" }}
                          >
                            <span style={{ color: "oklch(0.62 0.20 24)" }}>
                              •
                            </span>
                            {ci}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Drug-Herb Interactions */}
                    {profile.interactions.length > 0 && (
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background: "oklch(0.22 0.052 170 / 0.5)",
                          border: "1px solid oklch(0.38 0.076 175 / 0.25)",
                        }}
                      >
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          Drug-Herb Interactions
                        </h3>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border/30">
                              {["Drug", "Effect", "Severity"].map((h) => (
                                <th
                                  key={h}
                                  className="text-left py-1.5 pr-4 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {profile.interactions.map((intr) => (
                              <tr
                                key={intr.drug}
                                className="border-b border-border/15"
                              >
                                <td className="py-2 pr-4 font-semibold text-foreground">
                                  {intr.drug}
                                </td>
                                <td className="py-2 pr-4 text-foreground">
                                  {intr.effect}
                                </td>
                                <td className="py-2">
                                  <SeverityBadge severity={intr.severity} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Batch Parameters */}
                <TabsContent value="batch">
                  <BatchParamsTab analysis={analysis} seed={seed} />
                </TabsContent>
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function BatchParamsTab({
  analysis,
  seed,
}: { analysis: AnalysisResult; seed: SeedBatch | undefined }) {
  const scoreColor =
    analysis.qualityScore >= 75
      ? "oklch(0.64 0.168 145)"
      : analysis.qualityScore >= 50
        ? "oklch(0.78 0.130 87)"
        : "oklch(0.54 0.174 24)";

  const params: {
    param: string;
    value: string;
    limit: string;
    pass: boolean;
  }[] = [
    {
      param: "Moisture %",
      value: seed
        ? `${seed.moisture.toFixed(2)}%`
        : analysis.moistureOk
          ? "Pass"
          : "Fail",
      limit: "≤12%",
      pass: analysis.moistureOk,
    },
    {
      param: "Total Ash %",
      value: seed
        ? `${seed.ash.toFixed(2)}%`
        : analysis.ashOk
          ? "Pass"
          : "Fail",
      limit: "≤8%",
      pass: analysis.ashOk,
    },
    {
      param: "Extractive Value %",
      value: seed
        ? `${seed.extractiveValue.toFixed(2)}%`
        : analysis.extractiveOk
          ? "Pass"
          : "Fail",
      limit: "≥15%",
      pass: analysis.extractiveOk,
    },
    {
      param: "Heavy Metals (ppm)",
      value: seed
        ? `${seed.heavyMetals.toFixed(3)} ppm`
        : analysis.heavyMetalsOk
          ? "Pass"
          : "Fail",
      limit: "≤1.0 ppm",
      pass: analysis.heavyMetalsOk,
    },
    {
      param: "Microbial Count (CFU/g)",
      value: seed
        ? `${seed.microbialCount.toLocaleString()} CFU/g`
        : analysis.microbialOk
          ? "Pass"
          : "Fail",
      limit: "≤10,000 CFU/g",
      pass: analysis.microbialOk,
    },
  ];

  const heavyMetalParams = seed
    ? [
        {
          param: "Lead (Pb)",
          value: `${seed.leadPpm.toFixed(3)} ppm`,
          limit: "≤0.1 ppm",
          pass: seed.leadPpm <= 0.1,
        },
        {
          param: "Arsenic (As)",
          value: `${seed.arsenicPpm.toFixed(3)} ppm`,
          limit: "≤0.05 ppm",
          pass: seed.arsenicPpm <= 0.05,
        },
        {
          param: "Mercury (Hg)",
          value: `${seed.mercuryPpm.toFixed(3)} ppm`,
          limit: "≤0.02 ppm",
          pass: seed.mercuryPpm <= 0.02,
        },
        {
          param: "Cadmium (Cd)",
          value: `${seed.cadmiumPpm.toFixed(3)} ppm`,
          limit: "≤0.03 ppm",
          pass: seed.cadmiumPpm <= 0.03,
        },
      ]
    : [];

  const microParams = seed
    ? [
        {
          param: "E.coli",
          value: seed.ecoli,
          limit: "Absent",
          pass: seed.ecoli === "Absent",
        },
        {
          param: "Salmonella",
          value: seed.salmonella,
          limit: "Absent",
          pass: seed.salmonella === "Absent",
        },
      ]
    : [];

  const allParams = [...params, ...heavyMetalParams, ...microParams];

  return (
    <div className="space-y-4">
      {/* Quality Score */}
      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{
          background: "oklch(0.22 0.052 170 / 0.5)",
          border: "1px solid oklch(0.38 0.076 175 / 0.25)",
        }}
      >
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Quality Score
          </div>
          <div
            className="text-3xl font-bold mt-1"
            style={{ color: scoreColor }}
          >
            {analysis.qualityScore.toFixed(1)}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">
            Batch:{" "}
            <span className="font-mono text-foreground">
              {analysis.batchId}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Supplier:{" "}
            <span className="text-foreground">{analysis.supplier}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Region: <span className="text-foreground">{analysis.region}</span>
          </div>
        </div>
        <Badge
          style={{
            background:
              analysis.status === "Accept"
                ? "oklch(0.64 0.168 145 / 0.2)"
                : "oklch(0.54 0.174 24 / 0.2)",
            color:
              analysis.status === "Accept"
                ? "oklch(0.64 0.168 145)"
                : "oklch(0.54 0.174 24)",
            border: "none",
            fontSize: 13,
            padding: "6px 12px",
          }}
        >
          {analysis.status}
        </Badge>
      </div>

      {/* Parameters table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid oklch(0.38 0.076 175 / 0.25)" }}
      >
        <table className="w-full text-xs">
          <thead style={{ background: "oklch(0.22 0.052 170 / 0.7)" }}>
            <tr>
              {["Parameter", "Measured Value", "Reference Limit", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {allParams.map((p, i) => (
              <tr
                key={p.param}
                className="border-t"
                style={{
                  borderColor: "oklch(0.38 0.076 175 / 0.15)",
                  background:
                    i % 2 === 0 ? "oklch(0.22 0.052 170 / 0.3)" : "transparent",
                }}
              >
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {p.param}
                </td>
                <td
                  className="px-4 py-2.5 font-bold"
                  style={{
                    color: p.pass
                      ? "oklch(0.64 0.168 145)"
                      : "oklch(0.62 0.20 24)",
                  }}
                >
                  {p.value}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.limit}</td>
                <td className="px-4 py-2.5">
                  <Badge
                    style={{
                      background: p.pass
                        ? "oklch(0.64 0.168 145 / 0.2)"
                        : "oklch(0.54 0.174 24 / 0.2)",
                      color: p.pass
                        ? "oklch(0.64 0.168 145)"
                        : "oklch(0.54 0.174 24)",
                      border: "none",
                      fontSize: 10,
                    }}
                  >
                    {p.pass ? "Pass" : "Fail"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Predictions() {
  const { data: riskBatches = [] } = useRiskAssessment();
  const { data: supplierStats = [] } = useSupplierStats();
  const { data: analyses = [] } = useAllAnalysesMerged();
  const { data: trends = [] } = useScoreTrends();
  const [modalState, setModalState] = useState<ModalState>(null);

  // Build heatmap: suppliers x batches
  const suppliers = [...new Set(riskBatches.map((r) => r.supplier))].slice(
    0,
    8,
  );
  const heatmapData: Record<string, Record<string, number>> = {};
  for (const s of suppliers) {
    heatmapData[s] = {};
  }
  for (const rb of riskBatches) {
    if (heatmapData[rb.supplier]) {
      heatmapData[rb.supplier][rb.batchId] = rb.qualityScore;
    }
  }
  const allBatchIds = [...new Set(riskBatches.map((r) => r.batchId))].slice(
    0,
    8,
  );

  function heatColor(score: number) {
    if (score >= 75) return "oklch(0.64 0.168 145)";
    if (score >= 55) return "oklch(0.72 0.130 78)";
    if (score >= 35) return "oklch(0.78 0.130 87)";
    return "oklch(0.54 0.174 24)";
  }

  const trendChartData = trends.slice(-10).map((t, i) => ({
    name: `B${i + 1}`,
    score: Math.round(t.qualityScore),
  }));

  const supplierTrendData = supplierStats.slice(0, 4).map((s) => ({
    name: s.supplier.length > 12 ? `${s.supplier.slice(0, 12)}…` : s.supplier,
    passRate: Math.round(s.passRate),
    avgScore: Math.round(s.avgScore),
    batches: Number(s.totalBatches),
  }));

  function handleRowClick(analysis: AnalysisResult) {
    const seed = SEED_BATCHES.find((b) => b.batchId === analysis.batchId);
    setModalState({ analysis, seed });
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit size={16} className="text-gold" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            ML Predictions Engine
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Predictions &amp; Risk Intelligence
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Decision-tree ML model predictions, risk heatmap, and supplier trend
          analysis. Click any batch row to view its pharmacological profile.
        </p>
      </motion.div>

      {/* Top row: heatmap + score trend */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Risk Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-3 glass-card rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Risk Heatmap — Supplier × Batch
          </h2>
          {riskBatches.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Analyze batches to generate risk heatmap
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-[10px]">
                <thead>
                  <tr>
                    <th className="text-left pr-3 pb-2 text-muted-foreground font-semibold">
                      Supplier
                    </th>
                    {allBatchIds.map((b) => (
                      <th
                        key={b}
                        className="px-1 pb-2 text-muted-foreground font-mono"
                        style={{ minWidth: 56 }}
                      >
                        {b.replace("AY-2025-", "#")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s}>
                      <td
                        className="pr-3 py-1 text-muted-foreground truncate"
                        style={{ maxWidth: 120 }}
                      >
                        {s}
                      </td>
                      {allBatchIds.map((b) => {
                        const score = heatmapData[s][b];
                        return (
                          <td key={b} className="px-1 py-1">
                            {score !== undefined ? (
                              <div
                                className="rounded text-center font-bold"
                                style={{
                                  background: `${heatColor(score)}22`,
                                  color: heatColor(score),
                                  border: `1px solid ${heatColor(score)}44`,
                                  padding: "2px 4px",
                                }}
                              >
                                {Math.round(score)}
                              </div>
                            ) : (
                              <div className="text-border text-center">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Score Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={13} className="text-gold" />
            <h2 className="text-sm font-semibold text-foreground">
              Quality Score Trend
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.38 0.076 175 / 0.3)"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "oklch(0.75 0.025 162)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
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
              <Line
                type="monotone"
                dataKey="score"
                stroke="oklch(0.72 0.130 78)"
                strokeWidth={2}
                dot={{ r: 3, fill: "oklch(0.72 0.130 78)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Batch Prediction Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 glass-card rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold text-foreground mb-1">
          Batch Prediction Table — ML Accept/Reject
        </h2>
        <p className="text-[11px] text-muted-foreground mb-4">
          Click a row to view the full pharmacological profile for that batch's
          herb.
        </p>
        {analyses.length === 0 ? (
          <div
            className="py-8 text-center text-xs text-muted-foreground"
            data-ocid="predictions.empty_state"
          >
            Analyze batches to populate prediction data
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
                    "Region",
                    "Quality Score",
                    "ML Status",
                    "Confidence",
                    "Anomaly",
                    "Moisture",
                    "Ash",
                    "Extract",
                    "Heavy Metals",
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
                {analyses.map((a, i) => {
                  const rs = riskStyle(a.status === "Accept" ? "Low" : "High");
                  const seed = SEED_BATCHES.find(
                    (b) => b.batchId === a.batchId,
                  );
                  return (
                    <tr
                      key={a.batchId}
                      data-ocid={`predictions.item.${i + 1}`}
                      className="border-b border-border/20 hover:bg-accent/10 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(a)}
                      onKeyDown={(e) => e.key === "Enter" && handleRowClick(a)}
                      tabIndex={0}
                    >
                      <td className="px-3 py-2 font-mono font-semibold text-gold">
                        {a.batchId}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground">
                        {a.herbName}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {a.supplier}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {a.region}
                      </td>
                      <td className="px-3 py-2 font-bold text-foreground">
                        {a.qualityScore.toFixed(1)}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          style={{
                            background: rs.bg,
                            color: rs.text,
                            border: "none",
                          }}
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {(a.probability * 100).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2">
                        {a.anomaly ? (
                          <span className="text-warning">⚠ Yes</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <ParamCell
                        value={seed?.moisture}
                        refLimit="≤12%"
                        ok={a.moistureOk}
                      />
                      <ParamCell
                        value={seed?.ash}
                        refLimit="≤8%"
                        ok={a.ashOk}
                      />
                      <ParamCell
                        value={seed?.extractiveValue}
                        refLimit="≥15%"
                        ok={a.extractiveOk}
                      />
                      <ParamCell
                        value={seed?.heavyMetals}
                        refLimit="≤1.0 ppm"
                        ok={a.heavyMetalsOk}
                        suffix=" ppm"
                      />
                      <ParamCell
                        value={seed?.microbialCount}
                        refLimit="≤10k CFU/g"
                        ok={a.microbialOk}
                        suffix=" CFU/g"
                      />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Supplier Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-4 glass-card rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Supplier Intelligence Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {supplierTrendData.map((s) => (
            <div
              key={s.name}
              className="rounded-lg p-4"
              style={{
                background: "oklch(0.22 0.052 170 / 0.6)",
                border: "1px solid oklch(0.38 0.076 175 / 0.3)",
              }}
            >
              <div className="text-xs font-bold text-foreground truncate">
                {s.name}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                <div>
                  <div className="text-lg font-bold text-gold">
                    {s.passRate}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Pass Rate
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">
                    {s.avgScore}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Avg Score
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">
                    {s.batches}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Batches
                  </div>
                </div>
              </div>
            </div>
          ))}
          {supplierTrendData.length === 0 && (
            <div className="col-span-4 text-xs text-muted-foreground text-center py-4">
              No supplier data available
            </div>
          )}
        </div>
      </motion.div>

      {/* Pharmacological Modal */}
      <PharmacologicalModal
        state={modalState}
        onClose={() => setModalState(null)}
      />
    </div>
  );
}

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Database,
  FileBarChart,
  FlaskConical,
  Info,
  LayoutDashboard,
  Lightbulb,
  Microscope,
  Settings,
  Shield,
  Users,
} from "lucide-react";

const S = {
  section: "mb-10",
  header: "flex items-center gap-3 mb-4 pb-2 border-b",
  title: "text-lg font-bold text-foreground",
  steps: "space-y-3 ml-2",
  step: "flex items-start gap-3",
  stepNum:
    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
  stepText: "text-sm text-foreground leading-relaxed pt-0.5",
  tip: "flex items-start gap-2 p-3 rounded-lg text-xs",
  table: "w-full text-xs border-collapse",
  th: "text-left px-3 py-2 text-muted-foreground font-semibold uppercase tracking-wider",
  td: "px-3 py-2 text-foreground border-t",
};

function SectionHeader({
  icon: Icon,
  title,
  color = "oklch(0.72 0.130 78)",
}: {
  icon: React.ElementType;
  title: string;
  color?: string;
}) {
  return (
    <div
      className={S.header}
      style={{ borderColor: "oklch(0.32 0.065 172 / 0.4)" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: `${color} / 0.15`,
          border: `1px solid ${color} / 0.3`,
        }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <h2 className={S.title}>{title}</h2>
    </div>
  );
}

function Step({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <div className={S.step}>
      <div
        className={S.stepNum}
        style={{
          background: "oklch(0.72 0.130 78 / 0.15)",
          color: "oklch(0.72 0.130 78)",
          border: "1px solid oklch(0.72 0.130 78 / 0.3)",
        }}
      >
        {n}
      </div>
      <div className={S.stepText}>{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={S.tip}
      style={{
        background: "oklch(0.72 0.130 78 / 0.08)",
        border: "1px solid oklch(0.72 0.130 78 / 0.25)",
      }}
    >
      <Lightbulb
        size={14}
        style={{ color: "oklch(0.72 0.130 78)", marginTop: 1 }}
        className="flex-shrink-0"
      />
      <span style={{ color: "oklch(0.88 0.025 162)" }}>{children}</span>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={S.tip}
      style={{
        background: "oklch(0.78 0.130 87 / 0.08)",
        border: "1px solid oklch(0.78 0.130 87 / 0.25)",
      }}
    >
      <AlertTriangle
        size={14}
        style={{ color: "oklch(0.78 0.130 87)", marginTop: 1 }}
        className="flex-shrink-0"
      />
      <span style={{ color: "oklch(0.88 0.025 162)" }}>{children}</span>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={S.tip}
      style={{
        background: "oklch(0.60 0.168 245 / 0.08)",
        border: "1px solid oklch(0.60 0.168 245 / 0.25)",
      }}
    >
      <Info
        size={14}
        style={{ color: "oklch(0.60 0.168 245)", marginTop: 1 }}
        className="flex-shrink-0"
      />
      <span style={{ color: "oklch(0.88 0.025 162)" }}>{children}</span>
    </div>
  );
}

export function UserManual() {
  const toc = [
    { id: "getting-started", label: "Getting Started" },
    { id: "intake", label: "Raw Material Intake" },
    { id: "batches", label: "Batch Records" },
    { id: "analysis", label: "Quality Analysis Engine" },
    { id: "predictions", label: "Predictions Dashboard" },
    { id: "reports", label: "Reports" },
    { id: "config", label: "Configuration" },
    { id: "params", label: "Parameter Reference" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} className="text-gold" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Documentation
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">User Manual</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Complete guide to AyurNexis 3.1 — Ayurvedic Quality Assurance Platform
        </p>
      </div>

      {/* Table of Contents */}
      <div
        className="mb-10 p-4 rounded-xl"
        style={{
          background: "oklch(0.24 0.055 170)",
          border: "1px solid oklch(0.32 0.065 172 / 0.4)",
        }}
      >
        <div className="text-xs font-semibold text-gold uppercase tracking-widest mb-3">
          Table of Contents
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {toc.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <span
                className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  background: "oklch(0.72 0.130 78 / 0.15)",
                  color: "oklch(0.72 0.130 78)",
                }}
              >
                {i + 1}
              </span>
              {item.label}
              <ChevronRight size={10} className="ml-auto" />
            </a>
          ))}
        </div>
      </div>

      {/* 1. Getting Started */}
      <section id="getting-started" className={S.section}>
        <SectionHeader icon={Shield} title="1. Getting Started" />
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            AyurNexis 3.1 is a full-stack Ayurvedic Quality Assurance platform
            for pharmaceutical manufacturers. It combines rule-based and
            ML-powered analysis to assess raw material batches against
            pharmacopoeial standards.
          </p>
          <div className={S.steps}>
            <Step n={1}>
              Open the app. A one-time{" "}
              <strong className="text-foreground">Initialize System</strong>{" "}
              dialog will appear on first launch.
            </Step>
            <Step n={2}>
              Enter the admin secret (default:{" "}
              <code
                className="px-1 rounded text-[11px]"
                style={{
                  background: "oklch(0.30 0.060 170)",
                  color: "oklch(0.72 0.130 78)",
                }}
              >
                AYURNEXIS-ADMIN-TOKEN-2026
              </code>
              ) and click{" "}
              <strong className="text-foreground">Initialize System</strong>.
            </Step>
            <Step n={3}>
              The system loads with demo batch data. The sidebar is hidden by
              default — click the{" "}
              <strong className="text-foreground">menu icon</strong> (bottom
              left) to open navigation.
            </Step>
            <Step n={4}>
              Use the navigation to move between modules: Dashboard, Intake,
              Batches, Analysis, Predictions, Reports, and Config.
            </Step>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              background: "oklch(0.22 0.052 170)",
              border: "1px solid oklch(0.32 0.065 172 / 0.4)",
            }}
          >
            <div className="text-xs font-semibold text-gold mb-2 flex items-center gap-1.5">
              <Users size={12} /> User Roles
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                {
                  role: "Admin",
                  perms: "Full access to all modules, data, and configuration",
                },
                {
                  role: "QA Manager",
                  perms: "Dashboard, Reports, batch approval/rejection",
                },
                {
                  role: "Lab Technician",
                  perms: "Data entry (Intake) and running Quality Analysis",
                },
              ].map(({ role, perms }) => (
                <div
                  key={role}
                  className="p-3 rounded-lg"
                  style={{ background: "oklch(0.26 0.058 170)" }}
                >
                  <div className="font-semibold text-foreground mb-1">
                    {role}
                  </div>
                  <div className="text-muted-foreground">{perms}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Raw Material Intake */}
      <section id="intake" className={S.section}>
        <SectionHeader
          icon={FlaskConical}
          title="2. Raw Material Intake"
          color="oklch(0.64 0.168 145)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          Use this module to log incoming raw material batches with all measured
          physicochemical parameters.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            Navigate to{" "}
            <strong className="text-foreground">Raw Material Intake</strong>{" "}
            from the sidebar or header.
          </Step>
          <Step n={2}>
            Fill in the <strong className="text-foreground">Batch ID</strong>{" "}
            (e.g., AYU-009) — this must be unique across all batches.
          </Step>
          <Step n={3}>
            Select the <strong className="text-foreground">Herb Name</strong>,
            enter the <strong className="text-foreground">Supplier</strong>,{" "}
            <strong className="text-foreground">Region</strong>, and{" "}
            <strong className="text-foreground">Date Received</strong>.
          </Step>
          <Step n={4}>
            Enter all measured parameters: Moisture %, Total Ash %, Extractive
            Value %, Heavy Metals (ppm), and Microbial Count (CFU/g).
          </Step>
          <Step n={5}>
            Add any optional <strong className="text-foreground">Notes</strong>,
            then click <strong className="text-foreground">Submit Batch</strong>
            .
          </Step>
          <Step n={6}>
            You will be redirected to{" "}
            <strong className="text-foreground">Batch Records</strong> where the
            new entry appears at the top of the list.
          </Step>
        </div>
        <div className="mt-3 space-y-2">
          <Tip>
            Use consistent Batch ID naming (e.g., AYU-001, AYU-002) to make
            filtering and tracking easier.
          </Tip>
          <Warning>
            All numeric fields must have values. Leave as 0 only if the
            measurement was truly zero — not if it was not measured.
          </Warning>
        </div>
      </section>

      {/* 3. Batch Records */}
      <section id="batches" className={S.section}>
        <SectionHeader
          icon={Database}
          title="3. Batch Records"
          color="oklch(0.60 0.168 245)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          View, search, and manage all submitted raw material batches. Trigger
          quality analysis from here.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            Go to <strong className="text-foreground">Batch Records</strong>.
            All submitted batches are listed in reverse-chronological order.
          </Step>
          <Step n={2}>
            Use the <strong className="text-foreground">search bar</strong> to
            filter by Batch ID, herb name, or supplier.
          </Step>
          <Step n={3}>
            Each batch card shows: Batch ID, herb name, supplier, date, and key
            parameter values.
          </Step>
          <Step n={4}>
            Click <strong className="text-foreground">Analyze</strong> on any
            batch card to run the Quality Analysis Engine for that batch.
          </Step>
          <Step n={5}>
            After analysis, a{" "}
            <strong className="text-foreground">Pass/Fail</strong> badge appears
            on the batch card.
          </Step>
        </div>
        <div className="mt-3">
          <InfoBox>
            Analyzed batches show a quality score badge. Batches not yet
            analyzed show a pending indicator.
          </InfoBox>
        </div>
      </section>

      {/* 4. Quality Analysis Engine */}
      <section id="analysis" className={S.section}>
        <SectionHeader icon={Microscope} title="4. Quality Analysis Engine" />
        <p className="text-sm text-muted-foreground mb-3">
          The analysis engine scores each batch using a hybrid rule-based and
          ML-inspired algorithm.
        </p>

        <div
          className="mb-4 p-4 rounded-xl"
          style={{
            background: "oklch(0.22 0.052 170)",
            border: "1px solid oklch(0.32 0.065 172 / 0.4)",
          }}
        >
          <div className="text-xs font-semibold text-gold mb-2">
            Scoring Algorithm
          </div>
          <div className="grid grid-cols-5 gap-2 text-xs text-center">
            {[
              "Moisture",
              "Total Ash",
              "Extractive",
              "Heavy Metals",
              "Microbial",
            ].map((p) => (
              <div
                key={p}
                className="p-2 rounded-lg"
                style={{ background: "oklch(0.26 0.058 170)" }}
              >
                <div className="font-semibold text-foreground">{p}</div>
                <div
                  className="text-lg font-bold mt-1"
                  style={{ color: "oklch(0.72 0.130 78)" }}
                >
                  20
                </div>
                <div className="text-muted-foreground">pts</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Total = 100 pts •{" "}
            <span style={{ color: "oklch(0.64 0.168 145)" }}>Accept ≥ 65</span>{" "}
            •{" "}
            <span style={{ color: "oklch(0.54 0.174 24)" }}>
              Reject &lt; 65
            </span>{" "}
            •{" "}
            <span style={{ color: "oklch(0.78 0.130 87)" }}>
              Anomaly flag if any parameter exceeds 1.5× threshold
            </span>
          </div>
        </div>

        <div className={S.steps}>
          <Step n={1}>
            Go to <strong className="text-foreground">Quality Analysis</strong>.
            Previously analyzed batches are shown with their scores.
          </Step>
          <Step n={2}>
            Click{" "}
            <strong className="text-foreground">Raw Material Library</strong>{" "}
            (top right) to open the pharmacopeia reference drawer.
          </Step>
          <Step n={3}>
            In the drawer, search for any herb by name. Click it to expand its
            full monograph with all reference limits.
          </Step>
          <Step n={4}>
            Click the <strong className="text-foreground">pencil icon</strong>{" "}
            next to any parameter to edit the reference value. Click{" "}
            <strong className="text-foreground">Save</strong> to store your
            custom threshold (saved locally per herb).
          </Step>
          <Step n={5}>
            On any analysis result card, click{" "}
            <strong className="text-foreground">Compare with Reference</strong>{" "}
            to open a side-by-side comparison showing batch values vs.
            pharmacopeia limits, with a radar chart overlay.
          </Step>
        </div>
        <div className="mt-3 space-y-2">
          <Tip>
            If you have customized reference values for a herb, the comparison
            will use your custom values instead of the default pharmacopeia
            limits.
          </Tip>
          <InfoBox>
            The pharmacopeia data is sourced from IP 2022 (Indian
            Pharmacopoeia), WHO Monographs, British Pharmacopoeia 2023, and
            AYUSH guidelines.
          </InfoBox>
        </div>
      </section>

      {/* 5. Predictions Dashboard */}
      <section id="predictions" className={S.section}>
        <SectionHeader
          icon={BarChart3}
          title="5. Predictions Dashboard"
          color="oklch(0.75 0.168 310)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          Visual analytics showing trends, risk assessments, and supplier
          performance across all analyzed batches.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            The top row shows KPI cards: Total Batches, Pass Rate, Average
            Quality Score, and High-Risk batches.
          </Step>
          <Step n={2}>
            The <strong className="text-foreground">Score Trend</strong> line
            chart shows quality scores over time — look for declining trends as
            early warning signals.
          </Step>
          <Step n={3}>
            The{" "}
            <strong className="text-foreground">Pass/Fail Distribution</strong>{" "}
            pie chart gives an at-a-glance acceptance rate.
          </Step>
          <Step n={4}>
            The <strong className="text-foreground">Supplier Analytics</strong>{" "}
            bar chart ranks suppliers by average quality score and pass rate.
          </Step>
          <Step n={5}>
            The <strong className="text-foreground">Risk Assessment</strong>{" "}
            heatmap displays batches by risk level (Low / Medium / High).
          </Step>
        </div>
        <Tip>
          Analyze more batches to get more meaningful trend charts. With at
          least 10 batches, the predictions become statistically reliable.
        </Tip>
      </section>

      {/* 6. Reports */}
      <section id="reports" className={S.section}>
        <SectionHeader
          icon={FileBarChart}
          title="6. Reports"
          color="oklch(0.54 0.174 24)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          On-screen summary reports for quality management and regulatory
          compliance. Reports are viewable only (no download).
        </p>
        <div className={S.steps}>
          <Step n={1}>
            Go to <strong className="text-foreground">Reports</strong> from the
            navigation.
          </Step>
          <Step n={2}>
            Use the report type tabs to switch between: Batch Quality Summary,
            Supplier Performance, Parameter Deviations, and Trend Analysis.
          </Step>
          <Step n={3}>
            The{" "}
            <strong className="text-foreground">Batch Quality Summary</strong>{" "}
            lists all analyzed batches with their scores and Accept/Reject
            status.
          </Step>
          <Step n={4}>
            <strong className="text-foreground">Supplier Performance</strong>{" "}
            ranks suppliers by average quality score and pass rate.
          </Step>
          <Step n={5}>
            <strong className="text-foreground">Parameter Deviations</strong>{" "}
            shows all batches where one or more parameters failed the threshold.
          </Step>
        </div>
        <Warning>
          Reports reflect real-time data. Refresh the page if recent analyses
          are not appearing.
        </Warning>
      </section>

      {/* 7. Configuration */}
      <section id="config" className={S.section}>
        <SectionHeader icon={Settings} title="7. Configuration" />
        <p className="text-sm text-muted-foreground mb-3">
          System thresholds, ML model parameters, and role access matrix.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            Go to <strong className="text-foreground">Configuration</strong>{" "}
            from the sidebar.
          </Step>
          <Step n={2}>
            Review the{" "}
            <strong className="text-foreground">Quality Thresholds</strong>:
            Moisture ≤ 12%, Ash ≤ 5%, Extractive ≥ 15%, Heavy Metals ≤ 10 ppm,
            Microbial ≤ 1000 CFU/g (default system thresholds).
          </Step>
          <Step n={3}>
            The <strong className="text-foreground">ML Model Parameters</strong>{" "}
            section shows the decision-tree configuration. Confidence threshold
            is 60% for anomaly flagging.
          </Step>
          <Step n={4}>
            The <strong className="text-foreground">Role Access Matrix</strong>{" "}
            shows permissions per role. Contact your Admin to update role
            assignments.
          </Step>
        </div>
        <InfoBox>
          For herb-specific custom thresholds, use the Raw Material Library
          drawer on the Analysis page — those take precedence over global
          defaults.
        </InfoBox>
      </section>

      {/* 8. Parameter Reference */}
      <section id="params" className={S.section}>
        <SectionHeader
          icon={BookOpen}
          title="8. Parameter Reference"
          color="oklch(0.60 0.168 245)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          Definitions of all measured physicochemical and microbiological
          parameters.
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid oklch(0.32 0.065 172 / 0.4)" }}
        >
          <table className={S.table}>
            <thead style={{ background: "oklch(0.24 0.055 170)" }}>
              <tr>
                <th className={S.th}>Parameter</th>
                <th className={S.th}>Unit</th>
                <th className={S.th}>System Default</th>
                <th className={S.th}>What It Measures</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  param: "Moisture Content",
                  unit: "%",
                  default: "≤ 12%",
                  desc: "Water content in the raw material. High moisture promotes microbial growth and degradation.",
                },
                {
                  param: "Total Ash",
                  unit: "%",
                  default: "≤ 5%",
                  desc: "Inorganic residue after incineration. Indicates mineral content and potential adulteration.",
                },
                {
                  param: "Acid-Insoluble Ash",
                  unit: "%",
                  default: "≤ 2%",
                  desc: "Siliceous matter; indicates soil contamination or adulteration with sand/silica.",
                },
                {
                  param: "Extractive Value (Water)",
                  unit: "%",
                  default: "≥ 10%",
                  desc: "Water-soluble active constituents. Low values may indicate poor quality or adulteration.",
                },
                {
                  param: "Extractive Value (Alcohol)",
                  unit: "%",
                  default: "≥ 6%",
                  desc: "Alcohol-soluble actives including resins, glycosides, volatile oils.",
                },
                {
                  param: "Lead (Pb)",
                  unit: "ppm",
                  default: "≤ 10 ppm",
                  desc: "Heavy metal contaminant. Sources include soil pollution and industrial contamination.",
                },
                {
                  param: "Arsenic (As)",
                  unit: "ppm",
                  default: "≤ 3 ppm",
                  desc: "Toxic metalloid. Found in pesticide residues and contaminated soil.",
                },
                {
                  param: "Mercury (Hg)",
                  unit: "ppm",
                  default: "≤ 1 ppm",
                  desc: "Highly toxic heavy metal. Even trace amounts are harmful.",
                },
                {
                  param: "Cadmium (Cd)",
                  unit: "ppm",
                  default: "≤ 0.3 ppm",
                  desc: "Carcinogenic heavy metal. Accumulates in kidneys with chronic exposure.",
                },
                {
                  param: "Total Aerobic Count",
                  unit: "CFU/g",
                  default: "≤ 10⁵",
                  desc: "Total viable bacteria count. Indicates hygienic quality of raw material.",
                },
                {
                  param: "Yeast & Mold Count",
                  unit: "CFU/g",
                  default: "≤ 10³",
                  desc: "Fungal contamination. Can produce mycotoxins that are harmful at low concentrations.",
                },
                {
                  param: "E. coli",
                  unit: "—",
                  default: "Absent",
                  desc: "Fecal indicator organism. Must be absent in all herbal raw materials.",
                },
                {
                  param: "Volatile Oil",
                  unit: "% v/w",
                  default: "Herb-specific",
                  desc: "Aromatic essential oils. Indicates authenticity and potency for aromatic herbs.",
                },
                {
                  param: "Active Marker",
                  unit: "%",
                  default: "Herb-specific",
                  desc: "Key phytochemical marker (e.g., withanolides in Ashwagandha). Confirms identity and potency.",
                },
                {
                  param: "Foreign Matter",
                  unit: "%",
                  default: "≤ 2%",
                  desc: "Non-botanical material (soil, insects, other plant parts). Indicates poor processing.",
                },
                {
                  param: "Loss on Drying",
                  unit: "%",
                  default: "Herb-specific",
                  desc: "Total volatile matter lost on drying at 105°C. Similar to moisture but at higher temperature.",
                },
              ].map(({ param, unit, default: def, desc }, i) => (
                <tr
                  key={param}
                  style={{
                    background:
                      i % 2 === 0 ? "oklch(0.22 0.052 170)" : "transparent",
                  }}
                >
                  <td
                    className={S.td}
                    style={{
                      color: "oklch(0.72 0.130 78)",
                      fontWeight: 600,
                      borderColor: "oklch(0.32 0.065 172 / 0.3)",
                    }}
                  >
                    {param}
                  </td>
                  <td
                    className={S.td}
                    style={{ borderColor: "oklch(0.32 0.065 172 / 0.3)" }}
                  >
                    {unit}
                  </td>
                  <td
                    className={S.td}
                    style={{
                      color: "oklch(0.64 0.168 145)",
                      borderColor: "oklch(0.32 0.065 172 / 0.3)",
                    }}
                  >
                    {def}
                  </td>
                  <td
                    className={`${S.td} text-muted-foreground`}
                    style={{ borderColor: "oklch(0.32 0.065 172 / 0.3)" }}
                  >
                    {desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowRight size={12} />
          <span>
            Sources: Indian Pharmacopoeia 2022, WHO Guidelines on Quality of
            Herbal Medicines, British Pharmacopoeia 2023, AYUSH Quality Control
            Methods.
          </span>
        </div>
      </section>
    </div>
  );
}

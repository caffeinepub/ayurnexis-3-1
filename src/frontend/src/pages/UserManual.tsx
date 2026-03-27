import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Beaker,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Database,
  FileBarChart,
  FlaskConical,
  History,
  Info,
  LayoutDashboard,
  Lightbulb,
  Microscope,
  Settings,
  TrendingUp,
  Zap,
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

function Step({ n, children }: { n: number; children: React.ReactNode }) {
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
    { id: "overview", label: "Overview" },
    { id: "dashboard", label: "Dashboard" },
    { id: "library", label: "Raw Material Library" },
    { id: "intake", label: "Raw Material Intake" },
    { id: "batches", label: "Batch Records" },
    { id: "analysis", label: "Quality Analysis Engine" },
    { id: "predictions", label: "Predictions & Risk Intelligence" },
    { id: "formulation-idea", label: "Get Formulation Idea" },
    { id: "formulation-lab", label: "Formulation Lab" },
    { id: "analytics", label: "Full Composition Analytics" },
    { id: "history", label: "History" },
    { id: "reports", label: "Reports" },
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

      {/* 1. Overview */}
      <section id="overview" className={S.section}>
        <SectionHeader icon={LayoutDashboard} title="1. Overview" />
        <p className="text-sm text-muted-foreground mb-4">
          AyurNexis 3.1 is a pharmacopeia-compliant, AI-enabled Ayurvedic
          Quality Assurance and pharmaceutical formulation platform. It
          integrates raw material analysis, batch management, predictive
          analytics, and advanced formulation tools in a single interface.
        </p>
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            background: "oklch(0.22 0.052 170)",
            border: "1px solid oklch(0.32 0.065 172 / 0.4)",
          }}
        >
          <div className="text-xs font-semibold text-gold mb-3">
            Available Modules
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { name: "Dashboard", desc: "KPIs & live analytics" },
              {
                name: "Raw Material Library",
                desc: "200+ ingredient database",
              },
              { name: "Batch Intake", desc: "Log incoming materials" },
              { name: "Batch Records", desc: "Browse & manage batches" },
              { name: "Quality Analysis", desc: "Scoring engine" },
              { name: "Predictions & Risk", desc: "ML-driven insights" },
              { name: "Get Formulation Idea", desc: "Disease-based ideation" },
              { name: "Formulation Lab", desc: "Advanced composition system" },
              { name: "History", desc: "All records & exports" },
              { name: "Reports", desc: "Compliance reports" },
              { name: "Configuration", desc: "System settings" },
            ].map((m) => (
              <div
                key={m.name}
                className="p-2 rounded-lg"
                style={{ background: "oklch(0.26 0.058 170)" }}
              >
                <div className="font-semibold text-foreground">{m.name}</div>
                <div className="text-muted-foreground">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={S.steps}>
          <Step n={1}>
            Open the app. Use the{" "}
            <strong className="text-foreground">sidebar</strong> on the left to
            navigate between modules. Click the menu icon (bottom left) to
            expand/collapse the sidebar.
          </Step>
          <Step n={2}>
            The <strong className="text-foreground">header</strong> shows quick
            navigation tabs and a search bar. Use the profile icon to edit your
            details.
          </Step>
          <Step n={3}>
            The <strong className="text-foreground">Logout</strong> button in
            the header ends your session.
          </Step>
        </div>
        <div className="mt-3">
          <Tip>
            All modules are accessible from both the collapsible sidebar and the
            header navigation tabs.
          </Tip>
        </div>
      </section>

      {/* 2. Dashboard */}
      <section id="dashboard" className={S.section}>
        <SectionHeader
          icon={LayoutDashboard}
          title="2. Dashboard"
          color="oklch(0.55 0.140 200)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          The Dashboard is your real-time control center, providing live KPIs,
          batch analytics, and FDA drug status updates.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            <strong className="text-foreground">
              FDA Drug Status KPI (Top Card)
            </strong>{" "}
            — Shows the latest FDA-approved drug and the latest
            recalled/delisted drug fetched live from the FDA database. Drug
            names are clickable and redirect to the official FDA drug label or
            enforcement report.
          </Step>
          <Step n={2}>
            <strong className="text-foreground">FDA Live News Ticker</strong> —
            Scrolling ticker showing real-time FDA drug safety communications
            and label updates. Hover to pause. Click any item to visit the FDA
            source.
          </Step>
          <Step n={3}>
            <strong className="text-foreground">KPI Cards (6 cards)</strong>:
            Total Batches Processed, QA Compliance Rate (pass%), Open
            Deviations, Average Quality Score, Formulation Sessions, and Herb
            Monographs.
          </Step>
          <Step n={4}>
            <strong className="text-foreground">Quality Score Trend</strong> —
            Line chart showing quality scores across the last 12 batches.
            Declining trends are early warning signals.
          </Step>
          <Step n={5}>
            <strong className="text-foreground">Supplier Performance</strong> —
            Bar chart ranking suppliers by pass rate and average score.
          </Step>
          <Step n={6}>
            <strong className="text-foreground">Recent Activity Feed</strong> —
            The 5 most recently processed batches with pass/fail status.
          </Step>
          <Step n={7}>
            <strong className="text-foreground">
              Formulation Lab Quick Stats
            </strong>{" "}
            — Recent formulation sessions with ingredient count and date.
          </Step>
        </div>
        <div className="mt-3">
          <InfoBox>
            The FDA Drug Status KPI fetches live data from api.fda.gov. Drug
            names are clickable — clicking opens the official FDA page for that
            drug in a new tab.
          </InfoBox>
        </div>
      </section>

      {/* 3. Raw Material Library */}
      <section id="library" className={S.section}>
        <SectionHeader
          icon={FlaskConical}
          title="3. Raw Material Library"
          color="oklch(0.64 0.168 145)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          Browse and manage 200+ pharmaceutical-grade ingredients across all
          categories with full pharmacopeia data.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            Open the{" "}
            <strong className="text-foreground">Raw Material Library</strong>{" "}
            drawer from the Quality Analysis page (top-right button) or the
            sidebar.
          </Step>
          <Step n={2}>
            Browse by category tabs:{" "}
            <strong className="text-foreground">
              Herbs, APIs, Binders, Disintegrants, Lubricants, Fillers,
              Glidants, Coating Agents, Preservatives, Botanical Extracts,
              Functional Excipients
            </strong>
            .
          </Step>
          <Step n={3}>
            Click any ingredient to expand its full monograph: CAS number,
            molecular formula, assay limits, solubility, storage conditions,
            organoleptic properties, physicochemical parameters, and
            pharmacological profile.
          </Step>
          <Step n={4}>
            Click the <strong className="text-foreground">pencil icon</strong>{" "}
            next to any parameter to edit the reference value. Click{" "}
            <strong className="text-foreground">Save</strong> to store your
            custom threshold (takes precedence over system defaults for that
            ingredient).
          </Step>
        </div>
        <div className="mt-3">
          <Tip>
            Pharmacological profiles include mechanism of action, active
            phytochemicals, clinical evidence, and therapeutic uses — useful for
            formulation planning.
          </Tip>
        </div>
      </section>

      {/* 4. Raw Material Intake */}
      <section id="intake" className={S.section}>
        <SectionHeader
          icon={FlaskConical}
          title="4. Raw Material Intake"
          color="oklch(0.64 0.168 145)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          Log incoming raw material batches with all measured physicochemical
          parameters.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            Navigate to{" "}
            <strong className="text-foreground">Raw Material Intake</strong>.
          </Step>
          <Step n={2}>
            Select the{" "}
            <strong className="text-foreground">Material Type</strong> from the
            dropdown (Herb, API, Binder, etc.).
          </Step>
          <Step n={3}>
            Choose the{" "}
            <strong className="text-foreground">Ingredient Name</strong> from
            the list — all parameters auto-fill from the pharmacopeia database.
          </Step>
          <Step n={4}>
            Enter or edit measured values: Batch ID, Supplier, Region, Date
            Received, Moisture %, Total Ash %, Extractive Value %, Heavy Metals
            (ppm), Microbial Count (CFU/g).
          </Step>
          <Step n={5}>
            Add optional Notes, then click{" "}
            <strong className="text-foreground">Submit Batch</strong>. You are
            redirected to Batch Records.
          </Step>
          <Step n={6}>
            Submitted batches have a status of{" "}
            <strong className="text-foreground">Pending</strong> until reviewed
            and approved by an authorized user.
          </Step>
        </div>
        <div className="mt-3 space-y-2">
          <Warning>
            All numeric fields must have values. Leave as 0 only if the
            measurement was truly zero — not if it was not measured.
          </Warning>
        </div>
      </section>

      {/* 5. Batch Records */}
      <section id="batches" className={S.section}>
        <SectionHeader
          icon={Database}
          title="5. Batch Records"
          color="oklch(0.60 0.168 245)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          View, search, and manage all submitted raw material batches. Review
          detailed test parameters and approval status.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            Go to <strong className="text-foreground">Batch Records</strong>.
            All submitted batches appear in reverse-chronological order.
          </Step>
          <Step n={2}>
            Use the <strong className="text-foreground">search bar</strong> to
            filter by Batch ID, herb name, or supplier.
          </Step>
          <Step n={3}>
            Each batch card shows: Batch ID, ingredient, supplier, date,
            compliance status badge, and key parameter values.
          </Step>
          <Step n={4}>
            Click any batch to expand its full detail view with all test
            parameters.
          </Step>
          <Step n={5}>
            Authorized reviewers see{" "}
            <strong className="text-foreground">Approve</strong> and{" "}
            <strong className="text-foreground">Reject</strong> buttons at the
            bottom of the batch detail — click to update the batch approval
            status after reviewing all parameters.
          </Step>
          <Step n={6}>
            Click <strong className="text-foreground">Analyze</strong> on any
            batch to run the Quality Analysis Engine.
          </Step>
        </div>
        <div className="mt-3">
          <InfoBox>
            Analyzed batches show a quality score badge. Batches not yet
            analyzed show a pending indicator.
          </InfoBox>
        </div>
      </section>

      {/* 6. Quality Analysis Engine */}
      <section id="analysis" className={S.section}>
        <SectionHeader icon={Microscope} title="6. Quality Analysis Engine" />
        <p className="text-sm text-muted-foreground mb-3">
          The analysis engine scores each batch using a hybrid rule-based and
          ML-inspired algorithm against pharmacopeia reference limits.
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
            Total = 100 pts ·{" "}
            <span style={{ color: "oklch(0.64 0.168 145)" }}>Accept ≥ 65</span>{" "}
            ·{" "}
            <span style={{ color: "oklch(0.54 0.174 24)" }}>
              Reject &lt; 65
            </span>
          </div>
        </div>

        <div className={S.steps}>
          <Step n={1}>
            Go to <strong className="text-foreground">Quality Analysis</strong>.
          </Step>
          <Step n={2}>
            Click{" "}
            <strong className="text-foreground">Raw Material Library</strong>{" "}
            (top right) to open the pharmacopeia reference drawer.
          </Step>
          <Step n={3}>
            In the drawer, click any ingredient to auto-fill the analysis form
            with its reference limits. You can edit these values before running
            analysis.
          </Step>
          <Step n={4}>
            On any analysis result card, click{" "}
            <strong className="text-foreground">Compare with Reference</strong>{" "}
            to open a side-by-side comparison with a radar chart overlay showing
            batch values vs. pharmacopeia limits.
          </Step>
        </div>
        <div className="mt-3 space-y-2">
          <Tip>
            If you have customized reference values for an ingredient, the
            comparison will use your custom values instead of the default
            pharmacopeia limits.
          </Tip>
          <InfoBox>
            Data sourced from IP 2022 (Indian Pharmacopoeia), WHO Monographs,
            British Pharmacopoeia 2023, and AYUSH guidelines.
          </InfoBox>
        </div>
      </section>

      {/* 7. Predictions & Risk Intelligence */}
      <section id="predictions" className={S.section}>
        <SectionHeader
          icon={BarChart3}
          title="7. Predictions & Risk Intelligence"
          color="oklch(0.75 0.168 310)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          ML-driven analytics showing batch quality trends, risk assessments,
          and detailed ingredient profiles.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            The top row shows KPI cards: Total Batches, Pass Rate, Average
            Quality Score, and High-Risk batch count.
          </Step>
          <Step n={2}>
            The <strong className="text-foreground">Quality Score Trend</strong>{" "}
            line chart shows scores over time. Declining trends are early
            warning signals.
          </Step>
          <Step n={3}>
            The <strong className="text-foreground">Risk Heatmap</strong> shows
            batches by risk level (Low / Medium / High) across parameters.
          </Step>
          <Step n={4}>
            Click any batch row to open the{" "}
            <strong className="text-foreground">Ingredient Detail Modal</strong>{" "}
            with 5 tabs:
            <ul className="mt-2 space-y-1 ml-4 text-xs text-muted-foreground list-disc">
              <li>
                <strong className="text-foreground">Overview</strong> —
                Description, CAS number, therapeutic class, pharmacopeia source
              </li>
              <li>
                <strong className="text-foreground">Pharmacology</strong> —
                Mechanism of action, active phytochemicals, receptor targets,
                clinical evidence
              </li>
              <li>
                <strong className="text-foreground">Safety</strong> — Adverse
                effects table with severity badges (Low/Moderate/High),
                frequency, and therapeutic index card
              </li>
              <li>
                <strong className="text-foreground">Batch</strong> — Specific
                test results for this batch: assay result, moisture, pH,
                compliance status
              </li>
              <li>
                <strong className="text-foreground">Parameters</strong> — Full
                QA parameter panel with reference ranges (organoleptic,
                physicochemical, basic evaluation)
              </li>
            </ul>
          </Step>
        </div>
        <div className="mt-3">
          <Tip>
            Analyze more batches (at least 10) for statistically reliable
            predictions and trend charts.
          </Tip>
        </div>
      </section>

      {/* 8. Get Formulation Idea */}
      <section id="formulation-idea" className={S.section}>
        <SectionHeader
          icon={Lightbulb}
          title="8. Get Formulation Idea"
          color="oklch(0.68 0.13 78)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          Search any disease or condition and discover real marketed drugs plus
          AI-generated novel formulation compositions.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            <strong className="text-foreground">
              Search Disease/Condition
            </strong>{" "}
            — Type any condition in the search box (e.g., Fever, Diabetes,
            Hypertension, Common Cold, Headache, GERD, Migraine, etc.). The AI
            engine searches in real time and shows matching conditions. Click
            popular shortcuts for quick access.
          </Step>
          <Step n={2}>
            <strong className="text-foreground">Select Dosage Form</strong> —
            Choose from: Tablet, Capsule, Syrup, Suspension, Cream/Ointment,
            Powder, Injection, Gel, Lotion, Drops, Granules, or Sachet.
          </Step>
          <Step n={3}>
            <strong className="text-foreground">Select Drug Type</strong> —
            Choose from: Allopathic, Herbal, Ayurvedic, Homeopathic, or
            Combination.
          </Step>
          <Step n={4}>
            <strong className="text-foreground">View Marketed Drugs</strong> —
            See a reference list of real marketed drugs for the selected disease
            and drug type, with generic name, dose, manufacturer, and mechanism
            of action.
          </Step>
          <Step n={5}>
            <strong className="text-foreground">
              Browse Novel Compositions (up to 20)
            </strong>{" "}
            — AI-generated formulations are shown one at a time. Each
            composition includes:
            <ul className="mt-2 space-y-1 ml-4 text-xs text-muted-foreground list-disc">
              <li>Full ingredient list with quantities and roles</li>
              <li>Pharmacological effects and mechanism of action</li>
              <li>Advantages and disadvantages</li>
              <li>Stability prediction and shelf life</li>
              <li>Drug interactions and precautions</li>
            </ul>
          </Step>
          <Step n={6}>
            Use the <strong className="text-foreground">Prev / Next</strong>{" "}
            buttons to browse different compositions without claiming them.
          </Step>
          <Step n={7}>
            Click{" "}
            <strong className="text-foreground">Add to Formulation Lab</strong>{" "}
            to claim the composition and transfer it directly to the Formulation
            Lab with all ingredients pre-filled.
          </Step>
        </div>
        <div className="mt-3 space-y-2">
          <InfoBox>
            Each composition can only be claimed by one user at a time. Claimed
            compositions are locked for 7 days, after which they become
            available again. Browsing with Prev/Next does NOT claim a
            composition — only clicking &quot;Add to Formulation Lab&quot;
            claims it.
          </InfoBox>
          <Warning>
            If a composition shows a &quot;Claimed&quot; badge, it has been
            taken by another user. Use Next to browse for an available
            composition.
          </Warning>
        </div>
      </section>

      {/* 9. Formulation Lab */}
      <section id="formulation-lab" className={S.section}>
        <SectionHeader
          icon={Beaker}
          title="9. Formulation Lab"
          color="oklch(0.55 0.14 295)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          Advanced pharmaceutical formulation system with 8 guided steps,
          real-time analysis, AI-powered predictions, and professional
          certificate & drug label generation.
        </p>

        <div
          className="mb-4 p-4 rounded-xl"
          style={{
            background: "oklch(0.22 0.052 170)",
            border: "1px solid oklch(0.32 0.065 172 / 0.4)",
          }}
        >
          <div className="text-xs font-semibold text-gold mb-3">
            8-Step Workflow
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { n: 1, label: "Basic Info" },
              { n: 2, label: "API Selection" },
              { n: 3, label: "Excipients" },
              { n: 4, label: "Analysis" },
              { n: 5, label: "Full Analytics" },
              { n: 6, label: "SOP" },
              { n: 7, label: "Certificate" },
              { n: 8, label: "Export" },
            ].map((s) => (
              <div
                key={s.n}
                className="p-2 rounded-lg flex items-center gap-2"
                style={{ background: "oklch(0.26 0.058 170)" }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    background: "oklch(0.72 0.130 78 / 0.2)",
                    color: "oklch(0.72 0.130 78)",
                  }}
                >
                  {s.n}
                </span>
                <span className="text-foreground font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={S.steps}>
          <Step n={1}>
            <strong className="text-foreground">Basic Info</strong> — Enter
            formulation name, select dosage form (Tablet, Capsule, Syrup, etc.)
            and manufacturing method (Direct Compression, Wet Granulation,
            etc.).
          </Step>
          <Step n={2}>
            <strong className="text-foreground">API Selection</strong> — Add
            Active Pharmaceutical Ingredients. Select from the herbs and APIs
            database, specify quantity and unit. Herbs and herb extracts are
            selectable as APIs.
          </Step>
          <Step n={3}>
            <strong className="text-foreground">Excipient Selection</strong> —
            Add excipients by category: Binders, Disintegrants, Lubricants,
            Fillers, Glidants, Coating Agents, Preservatives, Botanical
            Extracts, Functional Excipients.
          </Step>
          <Step n={4}>
            <strong className="text-foreground">Analysis</strong> — Real-time
            analysis generates:
            <ul className="mt-2 space-y-1 ml-4 text-xs text-muted-foreground list-disc">
              <li>
                Compatibility Matrix — NxN color-coded grid with compatibility
                reasons
              </li>
              <li>
                Stability Assessment — Physical/chemical stability, shelf life,
                ICH Q1A classification
              </li>
              <li>
                Inter-Ingredient Reactions — Detected reactions with severity
                levels
              </li>
              <li>Composition Advantages & Disadvantages</li>
              <li>Overall compatibility and stability scores (0-100)</li>
            </ul>
          </Step>
          <Step n={5}>
            <strong className="text-foreground">
              Full Composition Analytics
            </strong>{" "}
            — Predicted analytical profiles for the complete formulation (see
            Section 10).
          </Step>
          <Step n={6}>
            <strong className="text-foreground">SOP Generation</strong> — View
            and customize the standard operating procedure for manufacturing,
            including scale-up options (1x, 5x, 10x, 50x batch size).
          </Step>
          <Step n={7}>
            <strong className="text-foreground">
              Certificate & Drug Label
            </strong>{" "}
            — Enter ownership details to generate:
            <ul className="mt-2 space-y-1 ml-4 text-xs text-muted-foreground list-disc">
              <li>Professional formulation excellence certificate</li>
              <li>
                Pharmaceutical drug label with Rx designation, composition
                table, dosage instructions, storage conditions, batch number,
                and expiry date
              </li>
              <li>
                Regulatory status box:{" "}
                <strong className="text-foreground">APPROVED</strong> (score ≥
                70) or{" "}
                <strong className="text-foreground">
                  NOT APPROVED FOR MARKET RELEASE
                </strong>{" "}
                (score &lt; 70) with specific deficiencies listed
              </li>
            </ul>
          </Step>
          <Step n={8}>
            <strong className="text-foreground">Export PDF</strong> — Download a
            professional multi-page PDF report including formulation summary,
            compatibility matrix, stability analysis, SOP, and certificate.
            Formulations are auto-saved to History after export.
          </Step>
        </div>
        <div className="mt-3 space-y-2">
          <Tip>
            After any user exports a formulation, that exact ingredient
            composition (same ingredients + quantities) is locked. Other users
            must modify at least one quantity to create a new unique
            formulation.
          </Tip>
          <InfoBox>
            Use the Back button at any step to revise previous selections
            without losing your current data.
          </InfoBox>
        </div>
      </section>

      {/* 10. Full Composition Analytics */}
      <section id="analytics" className={S.section}>
        <SectionHeader
          icon={TrendingUp}
          title="10. Full Composition Analytics"
          color="oklch(0.60 0.168 245)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          AI-predicted analytical profiles for the entire formulation,
          aggregated from all ingredient data.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            <strong className="text-foreground">HPLC Chromatogram</strong> —
            Combined peak profile for all active constituents. Shows retention
            time (minutes), peak area (%), and constituent name. Interpreted as
            a bar chart of peak areas.
          </Step>
          <Step n={2}>
            <strong className="text-foreground">UV Absorption Spectrum</strong>{" "}
            — Predicted λmax range based on chromophore contributions from all
            ingredients. Shown as a Gaussian absorption curve.
          </Step>
          <Step n={3}>
            <strong className="text-foreground">FTIR Fingerprint</strong> —
            Merged functional group transmittance profile (O-H, C=O, N-H,
            aromatic peaks) across all ingredients. Shown as wavenumber vs.
            transmittance % chart.
          </Step>
          <Step n={4}>
            <strong className="text-foreground">DSC Thermal Profile</strong> —
            Combined endothermic/exothermic events per ingredient showing
            melting points and glass transition temperatures.
          </Step>
          <Step n={5}>
            <strong className="text-foreground">Dissolution Profile</strong> —
            Predicted % drug release at 15, 30, 45, 60, and 90 minutes based on
            dosage form and ingredient solubility. Includes USP Q 85% reference
            line.
          </Step>
        </div>
        <div className="mt-3">
          <InfoBox>
            All analytical predictions are AI-generated based on ingredient
            physicochemical properties. These are computational predictions for
            formulation planning — not substitutes for laboratory analysis.
          </InfoBox>
        </div>
      </section>

      {/* 11. History */}
      <section id="history" className={S.section}>
        <SectionHeader
          icon={History}
          title="11. History"
          color="oklch(0.54 0.174 24)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          Complete historical record of all activities organized by category.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            Go to <strong className="text-foreground">History</strong> from the
            sidebar.
          </Step>
          <Step n={2}>
            Use the category tabs to switch between:{" "}
            <strong className="text-foreground">Batch Intake</strong>,{" "}
            <strong className="text-foreground">Analysis</strong>, and{" "}
            <strong className="text-foreground">Formulations</strong>.
          </Step>
          <Step n={3}>
            Each record shows full details. The Formulations tab shows all
            exported formulations with their ingredients, scores, and date.
          </Step>
          <Step n={4}>
            Click <strong className="text-foreground">Export CSV</strong> to
            download any category as a spreadsheet for external reporting.
          </Step>
        </div>
        <div className="mt-3">
          <Tip>
            Formulations are automatically saved to History after you click
            &quot;Download PDF Report&quot; in the Formulation Lab. No manual
            save required.
          </Tip>
        </div>
      </section>

      {/* 12. Reports */}
      <section id="reports" className={S.section}>
        <SectionHeader
          icon={FileBarChart}
          title="12. Reports"
          color="oklch(0.54 0.174 24)"
        />
        <p className="text-sm text-muted-foreground mb-3">
          On-screen compliance and performance reports for quality management.
        </p>
        <div className={S.steps}>
          <Step n={1}>
            Go to <strong className="text-foreground">Reports</strong> from the
            navigation.
          </Step>
          <Step n={2}>
            Use report type tabs to switch between:
            <ul className="mt-2 space-y-1 ml-4 text-xs text-muted-foreground list-disc">
              <li>
                <strong className="text-foreground">
                  Batch Quality Summary
                </strong>{" "}
                — All analyzed batches with scores and Accept/Reject status
              </li>
              <li>
                <strong className="text-foreground">
                  Supplier Performance
                </strong>{" "}
                — Rankings by average quality score and pass rate
              </li>
              <li>
                <strong className="text-foreground">
                  Parameter Deviations
                </strong>{" "}
                — Batches where any parameter failed its threshold
              </li>
              <li>
                <strong className="text-foreground">Trend Analysis</strong> —
                Quality scores over time with trend visualization
              </li>
            </ul>
          </Step>
        </div>
        <div className="mt-3">
          <Warning>
            Reports reflect real-time data. Refresh the page if recent batches
            are not appearing.
          </Warning>
        </div>
      </section>

      {/* 13. Parameter Reference */}
      <section id="params" className={S.section}>
        <SectionHeader
          icon={BookOpen}
          title="13. Parameter Reference"
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
                  default: "\u2264 12%",
                  desc: "Water content in the raw material. High moisture promotes microbial growth and degradation.",
                },
                {
                  param: "Total Ash",
                  unit: "%",
                  default: "\u2264 5%",
                  desc: "Inorganic residue after incineration. Indicates mineral content and potential adulteration.",
                },
                {
                  param: "Acid-Insoluble Ash",
                  unit: "%",
                  default: "\u2264 2%",
                  desc: "Siliceous matter; indicates soil contamination or adulteration with sand/silica.",
                },
                {
                  param: "Extractive Value (Water)",
                  unit: "%",
                  default: "\u2265 10%",
                  desc: "Water-soluble active constituents. Low values may indicate poor quality or adulteration.",
                },
                {
                  param: "Extractive Value (Alcohol)",
                  unit: "%",
                  default: "\u2265 6%",
                  desc: "Alcohol-soluble actives including resins, glycosides, volatile oils.",
                },
                {
                  param: "Lead (Pb)",
                  unit: "ppm",
                  default: "\u2264 10 ppm",
                  desc: "Heavy metal contaminant. Sources include soil pollution and industrial contamination.",
                },
                {
                  param: "Arsenic (As)",
                  unit: "ppm",
                  default: "\u2264 3 ppm",
                  desc: "Toxic metalloid. Found in pesticide residues and contaminated soil.",
                },
                {
                  param: "Mercury (Hg)",
                  unit: "ppm",
                  default: "\u2264 1 ppm",
                  desc: "Highly toxic heavy metal. Even trace amounts are harmful.",
                },
                {
                  param: "Cadmium (Cd)",
                  unit: "ppm",
                  default: "\u2264 0.3 ppm",
                  desc: "Carcinogenic heavy metal. Accumulates in kidneys with chronic exposure.",
                },
                {
                  param: "Total Aerobic Count",
                  unit: "CFU/g",
                  default: "\u2264 10\u2075",
                  desc: "Total viable bacteria count. Indicates hygienic quality of raw material.",
                },
                {
                  param: "Yeast & Mold Count",
                  unit: "CFU/g",
                  default: "\u2264 10\u00b3",
                  desc: "Fungal contamination. Can produce mycotoxins that are harmful at low concentrations.",
                },
                {
                  param: "E. coli",
                  unit: "\u2014",
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
                  default: "\u2264 2%",
                  desc: "Non-botanical material (soil, insects, other plant parts). Indicates poor processing.",
                },
                {
                  param: "Loss on Drying",
                  unit: "%",
                  default: "Herb-specific",
                  desc: "Total volatile matter lost on drying at 105\u00b0C. Similar to moisture but at higher temperature.",
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

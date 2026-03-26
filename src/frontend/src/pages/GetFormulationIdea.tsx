import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FlaskConical,
  Lightbulb,
  Package,
  Search,
  ShieldCheck,
  Thermometer,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DISEASES,
  MARKETED_DRUGS,
  type MarketedDrug,
  NOVEL_COMPOSITIONS,
  type NovelComposition,
} from "../data/formulationIdeaData";
import { claimFormulation, isFormulationClaimed } from "../utils/accessControl";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  onAddToFormulationLab: (data: {
    dosageForm: string;
    ingredients: Array<{
      name: string;
      category: string;
      quantity: number;
      unit: string;
    }>;
  }) => void;
}

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Suspension",
  "Cream/Ointment",
  "Powder",
  "Injection",
  "Gel",
  "Lotion",
  "Drops",
  "Granules",
  "Sachet",
];

const DRUG_TYPES = [
  "Allopathic",
  "Herbal",
  "Ayurvedic",
  "Homeopathic",
  "Combination",
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = [
    "Disease Search",
    "Form & Type",
    "Marketed Drugs",
    "Novel Ideas",
  ];
  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = idx === current;
        const done = idx < current;
        return (
          <div
            key={label}
            className="flex items-center gap-1 flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-primary/10 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  active ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded transition-all ${
                  done ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Disease Search ───────────────────────────────────────────────────

function DiseaseSearch({ onSelect }: { onSelect: (disease: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [fdaResults, setFdaResults] = useState<string[]>([]);
  const [fdaConnected, setFdaConnected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fdaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const preloadedFiltered = DISEASES.filter((d) =>
    d.toLowerCase().includes(query.toLowerCase()),
  ).slice(0, 8);

  const filtered = fdaResults.length > 0 ? fdaResults : preloadedFiltered;

  useEffect(() => {
    if (query.length < 3) {
      setFdaResults([]);
      return;
    }
    if (fdaTimerRef.current) clearTimeout(fdaTimerRef.current);
    fdaTimerRef.current = setTimeout(async () => {
      try {
        const url = `https://api.fda.gov/drug/label.json?search=indications_and_usage:"${encodeURIComponent(query)}"&limit=8`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const names: string[] = [];
        for (const r of data.results || []) {
          const name =
            r?.openfda?.brand_name?.[0] || r?.openfda?.generic_name?.[0];
          if (name && !names.includes(name)) names.push(name);
        }
        if (names.length > 0) {
          setFdaResults(names);
          setFdaConnected(true);
        } else {
          setFdaResults([]);
        }
      } catch {
        setFdaResults([]);
      }
    }, 500);
  }, [query]);

  const handleSelect = (d: string) => {
    setSelected(d);
    setQuery(d);
    setOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Lightbulb className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What condition are you formulating for?
        </h2>
        <p className="text-muted-foreground">
          Search from 50+ diseases and conditions with preloaded pharmaceutical
          data
        </p>
        {fdaConnected && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-2"
            style={{
              background: "oklch(0.42 0.14 145 / 0.1)",
              color: "oklch(0.42 0.14 145)",
              border: "1px solid oklch(0.42 0.14 145 / 0.3)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Live Drug Database (OpenFDA)
          </div>
        )}
      </div>

      <div className="relative" data-ocid="idea.search_input">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setSelected(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Type a disease or condition (e.g. Diabetes, Hypertension)…"
          className="pl-9 h-12 text-base"
          data-ocid="idea.input"
        />
        <AnimatePresence>
          {open && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
            >
              <ScrollArea className="max-h-64">
                {filtered.map((d) => (
                  <button
                    type="button"
                    key={d}
                    onMouseDown={() => handleSelect(d)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-primary/5 flex items-center gap-2 transition-colors"
                    data-ocid="idea.dropdown_menu"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    {d}
                  </button>
                ))}
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Selected condition
                  </p>
                  <p className="font-semibold text-foreground">{selected}</p>
                </div>
                <Button
                  onClick={() => onSelect(selected)}
                  className="gap-2"
                  data-ocid="idea.primary_button"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
          Popular conditions
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Diabetes (Type 2)",
            "Hypertension",
            "Asthma",
            "Anxiety",
            "GERD (Acid Reflux)",
            "Migraine",
            "Insomnia",
            "Osteoporosis",
          ].map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => {
                handleSelect(d);
                setTimeout(() => onSelect(d), 50);
              }}
              className="px-3 py-1.5 rounded-full text-xs border border-border hover:border-primary hover:bg-primary/5 transition-colors text-foreground"
              data-ocid="idea.tab"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Dosage Form + Drug Type ─────────────────────────────────────────

function DosageFormStep({
  disease,
  onNext,
  onBack,
}: {
  disease: string;
  onNext: (dosageForm: string, drugType: string) => void;
  onBack: () => void;
}) {
  const [dosageForm, setDosageForm] = useState<string | null>(null);
  const [drugType, setDrugType] = useState("Allopathic");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          data-ocid="idea.button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground">Formulating for</p>
          <h3 className="font-semibold text-foreground">{disease}</h3>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-foreground mb-3">
          Select Dosage Form
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {DOSAGE_FORMS.map((form) => (
            <button
              type="button"
              key={form}
              onClick={() => setDosageForm(form)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                dosageForm === form
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-primary/5 text-foreground"
              }`}
              data-ocid="idea.toggle"
            >
              {form}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-foreground mb-3">Select Drug Type</h4>
        <Tabs value={drugType} onValueChange={setDrugType}>
          <TabsList className="w-full flex gap-1 h-auto p-1 flex-wrap">
            {DRUG_TYPES.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="flex-1 min-w-20"
                data-ocid="idea.tab"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Button
        disabled={!dosageForm}
        onClick={() => dosageForm && onNext(dosageForm, drugType)}
        className="w-full gap-2"
        data-ocid="idea.primary_button"
      >
        View Marketed Drugs <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

// ─── Step 3: Marketed Drugs ───────────────────────────────────────────────────

function MarketedDrugsStep({
  disease,
  drugType,
  dosageForm,
  onNext,
  onBack,
}: {
  disease: string;
  drugType: string;
  dosageForm: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const drugs: MarketedDrug[] = MARKETED_DRUGS[disease]?.[drugType] ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          data-ocid="idea.button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="font-semibold text-foreground">{disease}</h3>
          <p className="text-xs text-muted-foreground">
            {drugType} · {dosageForm}
          </p>
        </div>
      </div>

      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        Marketed Drugs Reference
      </h4>

      {drugs.length === 0 ? (
        <Card className="border-dashed mb-6">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              No marketed drugs data for this combination.
            </p>
            <p className="text-xs mt-1">
              You can still explore novel compositions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mb-6" data-ocid="idea.list">
          {drugs.map((drug, i) => (
            <motion.div
              key={drug.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`idea.item.${i + 1}`}
            >
              <Card className="overflow-hidden">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {drug.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {drug.generic}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {drug.dose}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">
                      Manufacturer:
                    </span>{" "}
                    {drug.manufacturer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Mechanism:
                    </span>{" "}
                    {drug.mechanism}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Button
        onClick={onNext}
        className="w-full gap-2"
        data-ocid="idea.primary_button"
      >
        <Zap className="w-4 h-4" />
        Explore Novel Compositions
      </Button>
    </motion.div>
  );
}

// ─── Step 4: Novel Compositions ───────────────────────────────────────────────

function NovelCompositionsStep({
  disease,
  dosageForm,
  drugType,
  onAdd,
  onBack,
}: {
  disease: string;
  dosageForm: string;
  drugType: string;
  onAdd: (comp: NovelComposition) => void;
  onBack: () => void;
}) {
  const key = `${disease}|${dosageForm}|${drugType}`;
  const directComps: NovelComposition[] = NOVEL_COMPOSITIONS[key] ?? [];

  // fallback: find any key matching disease
  const fallbackComps: NovelComposition[] =
    directComps.length === 0
      ? Object.keys(NOVEL_COMPOSITIONS)
          .filter((k) => k.startsWith(disease))
          .flatMap((k) => NOVEL_COMPOSITIONS[k])
      : [];

  const displayComps = directComps.length > 0 ? directComps : fallbackComps;
  const [index, setIndex] = useState(0);
  const total = displayComps.length;
  const comp = displayComps[index] ?? null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: key is a derived string
  useEffect(() => {
    setIndex(0);
  }, [key]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          data-ocid="idea.button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{disease}</h3>
          <p className="text-xs text-muted-foreground">
            {drugType} · {dosageForm}
          </p>
        </div>
        {total > 0 && (
          <Badge variant="outline">
            {index + 1} / {total}
          </Badge>
        )}
      </div>

      {!comp ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium text-foreground mb-1">
              No novel compositions found
            </p>
            <p className="text-sm text-muted-foreground">
              Try a different dosage form or drug type combination.
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${key}-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <Card className="mb-4 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="text-xs" variant="outline">
                        {comp.id}
                      </Badge>
                      {isFormulationClaimed(
                        `${disease}-${dosageForm}-${drugType}-${index}`
                          .toLowerCase()
                          .replace(/\s+/g, "-"),
                      ) && (
                        <Badge
                          className="text-xs"
                          style={{
                            background: "oklch(0.54 0.174 24 / 0.15)",
                            color: "oklch(0.54 0.174 24)",
                            border: "1px solid oklch(0.54 0.174 24 / 0.3)",
                          }}
                        >
                          Claimed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{comp.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {comp.dosageForm}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Ingredients Table */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  Composition ({comp.ingredients.length} ingredients)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">
                          Ingredient
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Category
                        </th>
                        <th className="px-4 py-2 text-right font-medium">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left font-medium hidden sm:table-cell">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comp.ingredients.map((ing) => (
                        <tr
                          key={ing.name}
                          className="border-t border-border/50"
                        >
                          <td className="px-4 py-2 font-medium text-foreground">
                            {ing.name}
                          </td>
                          <td className="px-4 py-2">
                            <Badge variant="secondary" className="text-xs">
                              {ing.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-right font-mono">
                            {ing.quantity} {ing.unit}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">
                            {ing.role}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pharmacological Effects */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Pharmacological Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {comp.pharmacologicalEffects}
                </p>
              </CardContent>
            </Card>

            {/* Advantages & Disadvantages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {comp.advantages.map((a) => (
                      <li key={a} className="text-xs text-green-800 flex gap-2">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-green-600" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                    Disadvantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {comp.disadvantages.map((d) => (
                      <li key={d} className="text-xs text-amber-800 flex gap-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-600" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Stability & Storage */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  Stability & Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Stability Prediction
                    </p>
                    <p className="text-xs text-foreground">
                      {comp.stabilityPrediction}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Shelf Life
                    </p>
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      {comp.shelfLife}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Storage Condition
                    </p>
                    <p className="text-xs text-foreground">
                      {comp.storageCondition}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drug Interactions */}
            {comp.drugInteractions.length > 0 && (
              <Card className="mb-4 border-red-200 bg-red-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                    <ShieldCheck className="w-4 h-4" />
                    Drug Interactions & Precautions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {comp.drugInteractions.map((di) => (
                      <li key={di} className="text-xs text-red-800 flex gap-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-red-500" />
                        {di}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Separator className="my-4" />

            {/* Navigation & CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => setIndex((p) => p - 1)}
                  className="gap-1"
                  data-ocid="idea.pagination_prev"
                >
                  <ArrowLeft className="w-4 h-4" /> Prev
                </Button>
                <Button
                  variant="outline"
                  disabled={index >= total - 1}
                  onClick={() => setIndex((p) => p + 1)}
                  className="gap-1"
                  data-ocid="idea.pagination_next"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  const formulationId =
                    `${disease}-${dosageForm}-${drugType}-${index}`
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                  const claimed = claimFormulation(formulationId, {
                    disease,
                    dosageForm,
                    drugType,
                    compositionName: comp.name,
                  });
                  if (!claimed) {
                    toast.error(
                      "This composition has been claimed by another user. Try the next one.",
                    );
                    return;
                  }
                  onAdd(comp);
                }}
                data-ocid="idea.primary_button"
              >
                <FlaskConical className="w-4 h-4" />
                Add to Formulation Lab
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GetFormulationIdea({ onAddToFormulationLab }: Props) {
  const [step, setStep] = useState(1);
  const [disease, setDisease] = useState("");
  const [dosageForm, setDosageForm] = useState("");
  const [drugType, setDrugType] = useState("");

  const handleAdd = (comp: NovelComposition) => {
    onAddToFormulationLab({
      dosageForm: comp.dosageForm,
      ingredients: comp.ingredients.map((ing) => ({
        name: ing.name,
        category: ing.category,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              Get Formulation Idea
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore marketed drugs and novel pharmaceutical compositions by
            disease
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator current={step} />

        {/* Steps */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <DiseaseSearch
                  key="step1"
                  onSelect={(d) => {
                    setDisease(d);
                    setStep(2);
                  }}
                />
              )}
              {step === 2 && (
                <DosageFormStep
                  key="step2"
                  disease={disease}
                  onNext={(df, dt) => {
                    setDosageForm(df);
                    setDrugType(dt);
                    setStep(3);
                  }}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <MarketedDrugsStep
                  key="step3"
                  disease={disease}
                  drugType={drugType}
                  dosageForm={dosageForm}
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              )}
              {step === 4 && (
                <NovelCompositionsStep
                  key="step4"
                  disease={disease}
                  dosageForm={dosageForm}
                  drugType={drugType}
                  onAdd={handleAdd}
                  onBack={() => setStep(3)}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

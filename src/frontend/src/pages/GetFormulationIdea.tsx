import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { NovelComposition } from "../data/formulationIdeaData";
import {
  type FormulationIdea,
  type MarketedDrugResult,
  getFormulationIdeas,
  getMarketedDrugs,
  searchDiseases,
} from "../services/geminiService";

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
  const [aiResults, setAiResults] = useState<string[]>([]);
  const [aiConnected, setAiConnected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = aiResults;

  const [aiSearching, setAiSearching] = useState(false);

  useEffect(() => {
    if (query.length < 1) {
      setAiResults([]);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setAiSearching(true);
      try {
        const results = await searchDiseases(query);
        if (results.length > 0) {
          setAiResults(results);
          setAiConnected(true);
        } else {
          setAiResults([]);
        }
      } catch {
        setAiResults([]);
      } finally {
        setAiSearching(false);
      }
    }, 300);
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
          Search any disease or condition — AI-Powered intelligent search finds
          relevant results
        </p>
        {aiConnected && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-2"
            style={{
              background: "oklch(0.42 0.14 145 / 0.1)",
              color: "oklch(0.42 0.14 145)",
              border: "1px solid oklch(0.42 0.14 145 / 0.3)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Live Search Active
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
          placeholder="Type any disease or condition (e.g. fever, diabetes, headache)…"
          className="pl-9 pr-10 h-12 text-base"
          data-ocid="idea.input"
        />
        {aiSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
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
            "Fever",
            "Common Cold",
            "Cough",
            "Headache",
            "Diabetes (Type 2)",
            "Hypertension",
            "Anxiety",
            "GERD (Acid Reflux)",
            "Migraine",
            "Insomnia",
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
  const [drugs, setDrugs] = useState<MarketedDrugResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDrugs([]);
    getMarketedDrugs(disease, drugType, dosageForm)
      .then((results) => setDrugs(results))
      .catch(() => setDrugs([]))
      .finally(() => setLoading(false));
  }, [disease, drugType, dosageForm]);

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
          data-ocid="marketed.button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            Marketed Drug Reference
          </h3>
          <p className="text-xs text-muted-foreground">
            {disease} · {drugType} · {dosageForm}
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs bg-violet-100 text-violet-700 border-violet-200"
        >
          ✦ AI-Powered
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-border">
              <CardContent className="py-4 flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2 w-2/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-center text-xs text-muted-foreground animate-pulse">
            Fetching real marketed drugs for {disease}…
          </p>
        </div>
      ) : drugs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-foreground mb-1">
              No marketed drugs found
            </p>
            <p className="text-xs text-muted-foreground">
              Try a different drug type or dosage form
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-2">
            Showing {drugs.length} marketed drugs for{" "}
            <span className="font-medium text-foreground">{disease}</span>
          </p>
          {drugs.map((drug, i) => (
            <Card
              key={`${drug.brandName}-${i}`}
              className="border-border hover:border-primary/30 transition-colors"
            >
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground text-sm">
                        {drug.brandName}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {drug.dosageForm}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Generic:{" "}
                      <span className="text-foreground">
                        {drug.genericName}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Manufacturer: {drug.manufacturer}
                    </p>
                    <p className="text-xs text-primary font-medium mt-1">
                      Strength: {drug.strength}
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1"
          data-ocid="marketed.primary_button"
        >
          View Novel Compositions <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
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
  const [index, setIndex] = useState(0);
  const [aiComps, setAiComps] = useState<FormulationIdea[] | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch AI ideas on mount / when key changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: key is a derived string
  useEffect(() => {
    setIndex(0);
    setAiComps(null);
    setIsLoadingAi(true);
    getFormulationIdeas(disease, dosageForm, drugType)
      .then((ideas) => {
        if (ideas && ideas.length > 0) setAiComps(ideas);
        else setAiComps(null);
      })
      .catch(() => setAiComps(null))
      .finally(() => setIsLoadingAi(false));
  }, [key]);

  const generateMore = () => {
    if (isLoadingMore || (aiComps && aiComps.length >= 20)) return;
    setIsLoadingMore(true);
    getFormulationIdeas(disease, dosageForm, drugType)
      .then((ideas) => {
        if (ideas && ideas.length > 0) {
          setAiComps((prev) => {
            const combined = [...(prev ?? []), ...ideas];
            // Cap at 20, deduplicate by name
            const seen = new Set<string>();
            const unique = combined.filter((c) => {
              if (seen.has(c.compositionName)) return false;
              seen.add(c.compositionName);
              return true;
            });
            return unique.slice(0, 20);
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  };

  // Convert AI ideas to NovelComposition format for display
  const aiConverted: NovelComposition[] | null = aiComps
    ? aiComps.map((idea, idx) => ({
        id: `AI-COMP-${Date.now()}-${String(idx + 1).padStart(3, "0")}`,
        name: idea.compositionName,
        ingredients: idea.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          role: ing.role,
          category: "api",
        })),
        pharmacologicalEffects:
          idea.pharmacologicalEffects ?? idea.mechanismOfAction,
        advantages: idea.advantages,
        disadvantages: idea.disadvantages,
        stabilityPrediction: idea.stabilityPrediction,
        shelfLife: idea.stabilityPrediction.includes("24")
          ? "24 months"
          : "18 months",
        storageCondition:
          "Store at 25\u00b0C/60% RH, protect from light and moisture",
        drugInteractions: idea.drugInteractions,
        dosageForm: dosageForm,
        analyticalData: {
          hplcMethod: "RP-HPLC, C18 column, UV detection",
          uvLambdaMax: "254 nm",
          ftirPeaks: "3300-3500 (O-H), 1700-1750 (C=O), 1600-1650 (C=C)",
        },
      }))
    : null;

  const displayComps: NovelComposition[] = aiConverted ?? [];

  const isAiSource = !!(aiConverted && aiConverted.length > 0);
  const isDynamic = false;

  const total = displayComps.length;
  const comp = displayComps[index] ?? null;

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

      {isLoadingAi ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-medium text-foreground">
                Generating novel formulations with AyurNexis AI…
              </p>
              <p className="text-sm text-muted-foreground">
                Analyzing {disease} treatment options for {dosageForm} (
                {drugType})
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !comp ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium text-foreground mb-1">
              No formulations generated
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              AI could not generate formulations — please retry
            </p>
            <Button
              onClick={() => {
                setAiComps(null);
                setIsLoadingAi(true);
                getFormulationIdeas(disease, dosageForm, drugType)
                  .then((ideas) => {
                    if (ideas && ideas.length > 0) setAiComps(ideas);
                    else setAiComps(null);
                  })
                  .catch(() => setAiComps(null))
                  .finally(() => setIsLoadingAi(false));
              }}
              className="gap-2"
            >
              <Zap className="w-4 h-4" /> Retry
            </Button>
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
                      {isAiSource && (
                        <Badge className="text-xs bg-violet-100 text-violet-700 border-violet-200">
                          ✦ AyurNexis AI — Real-time Generated
                        </Badge>
                      )}
                      {isDynamic && !isAiSource && (
                        <Badge className="text-xs bg-violet-100 text-violet-700 border-violet-200">
                          ✦ AI-Generated Composition
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
                        <th className="px-4 py-2 text-left font-medium hidden md:table-cell">
                          Pharmacological Effect
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
                          <td className="px-4 py-2 text-muted-foreground text-xs hidden md:table-cell max-w-[180px]">
                            {(ing as any).pharmacologicalEffect ?? "—"}
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
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-amber-600 mb-1">
                    Combined Mechanism of Action
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {(comp as any).pharmacologicalEffects ??
                      comp.pharmacologicalEffects}
                  </p>
                </div>
                {(comp as any).indicationsForDisease &&
                  (comp as any).indicationsForDisease.length > 3 && (
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">
                        Indications
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {(comp as any).indicationsForDisease}
                      </p>
                    </div>
                  )}
                {(comp as any).dosageInstructions &&
                  (comp as any).dosageInstructions.length > 3 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Dosage & Administration
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {(comp as any).dosageInstructions}
                      </p>
                    </div>
                  )}
                {(comp as any).contraindications &&
                  (comp as any).contraindications.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-500 mb-1">
                        Contraindications
                      </p>
                      <ul className="space-y-0.5">
                        {((comp as any).contraindications as string[]).map(
                          (c: string) => (
                            <li
                              key={c}
                              className="text-xs text-muted-foreground flex gap-1.5"
                            >
                              <span className="text-red-400 shrink-0">•</span>
                              {c}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
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
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        Number.parseInt(comp.shelfLife) >= 24
                          ? "bg-green-100 text-green-700"
                          : Number.parseInt(comp.shelfLife) >= 18
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {comp.shelfLife}
                    </span>
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
                  if (!comp) return;
                  onAdd(comp);
                }}
                data-ocid="idea.primary_button"
              >
                <FlaskConical className="w-4 h-4" />
                Add to Formulation Lab
              </Button>
            </div>
            {/* Generate More */}
            {!isLoadingAi && (aiComps ?? []).length < 20 && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={generateMore}
                  disabled={isLoadingMore}
                  data-ocid="idea.secondary_button"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />{" "}
                      Generating more…
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Generate More Formulations
                    </>
                  )}
                </Button>
                {aiComps && aiComps.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {aiComps.length}/20 compositions generated
                  </p>
                )}
              </div>
            )}
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
          \u00a9 {new Date().getFullYear()}. Built with love using{" "}
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

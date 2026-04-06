import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  Edit3,
  ExternalLink,
  FlaskConical,
  Leaf,
  Package,
  Pill,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type APIIngredient,
  type ExcipientIngredient,
  apiDrugs,
  binders,
  coatingAgents,
  disintegrants,
  extraExcipients,
  fillers,
  glidants,
  herbExtracts,
  lubricants,
  preservatives,
} from "../data/formulationData";
import { type HerbMonograph, pharmacopeiaData } from "../data/pharmacopeiaData";

interface IngredientLibraryProps {
  onAddToFormulationLab: (ingredient: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
  }) => void;
}

type LibraryCategory = "all" | "herbs" | "apis" | "excipients" | "extracts";
type SortMode = "alpha" | "category" | "source";

type UnifiedIngredient = {
  id: string;
  name: string;
  latinName?: string;
  category: LibraryCategory;
  categoryLabel: string;
  source: string;
  description: string;
  data: HerbMonograph | APIIngredient | ExcipientIngredient;
  isCustom?: boolean;
};

interface CustomIngredient {
  id: string;
  name: string;
  category: LibraryCategory;
  source: string;
  description: string;
  storage: string;
  createdAt: string;
}

const LS_OVERRIDES = "ayurnexis_ingredient_overrides";
const LS_CUSTOM = "ayurnexis_custom_ingredients";

function loadCustomIngredients(): CustomIngredient[] {
  try {
    return JSON.parse(localStorage.getItem(LS_CUSTOM) || "[]");
  } catch {
    return [];
  }
}

function saveCustomIngredients(items: CustomIngredient[]) {
  localStorage.setItem(LS_CUSTOM, JSON.stringify(items));
}

function loadOverrides(): Record<string, Record<string, unknown>> {
  try {
    return JSON.parse(localStorage.getItem(LS_OVERRIDES) || "{}");
  } catch {
    return {};
  }
}

function saveOverride(id: string, override: Record<string, unknown>) {
  const overrides = loadOverrides();
  overrides[id] = { ...overrides[id], ...override };
  localStorage.setItem(LS_OVERRIDES, JSON.stringify(overrides));
}

function buildExternalLink(ingredient: UnifiedIngredient): string {
  const encoded = encodeURIComponent(ingredient.name);
  switch (ingredient.category) {
    case "herbs":
      return `https://ayush.gov.in/search?q=${encoded}`;
    case "apis":
      return `https://pubchem.ncbi.nlm.nih.gov/compound/${encoded}`;
    case "excipients":
      return `https://www.ncbi.nlm.nih.gov/pmc/search/?term=${encoded}`;
    case "extracts":
      return `https://pubchem.ncbi.nlm.nih.gov/compound/${encoded}`;
    default:
      return `https://pubchem.ncbi.nlm.nih.gov/compound/${encoded}`;
  }
}

function categoryColor(cat: LibraryCategory): {
  bg: string;
  text: string;
  border: string;
} {
  switch (cat) {
    case "herbs":
      return {
        bg: "oklch(0.42 0.14 145 / 0.10)",
        text: "oklch(0.30 0.12 145)",
        border: "oklch(0.42 0.14 145 / 0.30)",
      };
    case "apis":
      return {
        bg: "oklch(0.50 0.15 240 / 0.10)",
        text: "oklch(0.35 0.12 240)",
        border: "oklch(0.50 0.15 240 / 0.30)",
      };
    case "excipients":
      return {
        bg: "oklch(0.70 0.13 78 / 0.10)",
        text: "oklch(0.50 0.10 78)",
        border: "oklch(0.70 0.13 78 / 0.30)",
      };
    case "extracts":
      return {
        bg: "oklch(0.55 0.15 295 / 0.10)",
        text: "oklch(0.40 0.12 295)",
        border: "oklch(0.55 0.15 295 / 0.30)",
      };
    default:
      return {
        bg: "oklch(0.94 0.008 240)",
        text: "oklch(0.45 0.015 240)",
        border: "oklch(0.88 0.012 240)",
      };
  }
}

function getCategoryIcon(cat: LibraryCategory) {
  switch (cat) {
    case "herbs":
      return Leaf;
    case "apis":
      return Pill;
    case "excipients":
      return Package;
    case "extracts":
      return Sparkles;
    default:
      return FlaskConical;
  }
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function HerbDetailContent({ herb }: { herb: HerbMonograph }) {
  const p = herb.parameters;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div
          className="p-3 rounded-lg space-y-1"
          style={{ background: "oklch(0.96 0.005 240)" }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Source
          </div>
          <div className="text-sm font-medium">{herb.source}</div>
        </div>
        <div
          className="p-3 rounded-lg space-y-1"
          style={{ background: "oklch(0.96 0.005 240)" }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Plant Part
          </div>
          <div className="text-sm font-medium">{herb.part}</div>
        </div>
      </div>

      {herb.parameters.activeMarker && (
        <div
          className="p-3 rounded-lg"
          style={{
            background: "oklch(0.42 0.14 145 / 0.08)",
            border: "1px solid oklch(0.42 0.14 145 / 0.2)",
          }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Active Marker
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: "oklch(0.30 0.12 145)" }}
          >
            {herb.parameters.activeMarker.compound} — ≥
            {herb.parameters.activeMarker.min}%
          </div>
        </div>
      )}

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Quality Parameters
        </div>
        <div className="rounded-lg overflow-hidden border">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "oklch(0.95 0.006 240)" }}>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                  Parameter
                </th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                  Limit
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Moisture", `≤${p.moisture.max}%`],
                ["Total Ash", `≤${p.totalAsh.max}%`],
                ["Acid Insoluble Ash", `≤${p.acidInsolubleAsh.max}%`],
                [
                  "Water Soluble Extractive",
                  `≥${p.waterSolubleExtractive.min}%`,
                ],
                [
                  "Alcohol Soluble Extractive",
                  `≥${p.alcoholSolubleExtractive.min}%`,
                ],
                ["Loss on Drying", `≤${p.lossOnDrying.max}%`],
                ["Foreign Matter", `≤${p.foreignMatter.max}%`],
                ...(p.volatileOil
                  ? [["Volatile Oil", `≥${p.volatileOil.min}% v/w`]]
                  : []),
              ].map(([param, limit], i) => (
                <tr
                  key={param}
                  style={{
                    background: i % 2 === 0 ? "white" : "oklch(0.98 0.003 240)",
                  }}
                >
                  <td className="px-3 py-2 font-medium">{param}</td>
                  <td
                    className="px-3 py-2 font-mono"
                    style={{ color: "oklch(0.35 0.12 240)" }}
                  >
                    {limit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Heavy Metals (ppm)
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            ["Lead", p.heavyMetals.lead.max],
            ["Arsenic", p.heavyMetals.arsenic.max],
            ["Mercury", p.heavyMetals.mercury.max],
            ["Cadmium", p.heavyMetals.cadmium.max],
          ].map(([metal, val]) => (
            <div
              key={String(metal)}
              className="p-2 rounded text-center"
              style={{
                background: "oklch(0.97 0.004 240)",
                border: "1px solid oklch(0.88 0.012 240)",
              }}
            >
              <div className="text-[10px] text-muted-foreground">
                {String(metal)}
              </div>
              <div
                className="text-xs font-bold"
                style={{ color: "oklch(0.45 0.10 25)" }}
              >
                ≤{String(val)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-3 rounded-lg"
        style={{ background: "oklch(0.96 0.005 240)" }}
      >
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Microbial Limits
        </div>
        <div className="text-xs space-y-1">
          <div>
            Total Aerobic Count: ≤
            {p.microbial.totalAerobicCount.max.toLocaleString()} CFU/g
          </div>
          <div>
            Yeast &amp; Mold: ≤{p.microbial.yeastMold.max.toLocaleString()}{" "}
            CFU/g
          </div>
          <div>
            E. coli: {p.microbial.eColi} &nbsp;|&nbsp; Salmonella:{" "}
            {p.microbial.salmonella}
          </div>
        </div>
      </div>
    </div>
  );
}

function APIDetailContent({ api }: { api: APIIngredient }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          ["CAS Number", api.cas],
          ["Molecular Formula", api.molecularFormula],
          ["Pharmacopeia", api.source],
          ["Therapeutic Category", api.therapeuticCategory],
        ].map(([k, v]) => (
          <div
            key={String(k)}
            className="p-3 rounded-lg"
            style={{ background: "oklch(0.96 0.005 240)" }}
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {String(k)}
            </div>
            <div className="text-xs font-medium">{String(v)}</div>
          </div>
        ))}
      </div>

      <div
        className="p-3 rounded-lg"
        style={{
          background: "oklch(0.50 0.15 240 / 0.07)",
          border: "1px solid oklch(0.50 0.15 240 / 0.2)",
        }}
      >
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Description
        </div>
        <div className="text-sm">{api.description}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="p-3 rounded-lg"
          style={{ background: "oklch(0.96 0.005 240)" }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Assay Limit
          </div>
          <div
            className="text-sm font-mono font-bold"
            style={{ color: "oklch(0.35 0.12 240)" }}
          >
            {api.assayMin}–{api.assayMax}%
          </div>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ background: "oklch(0.96 0.005 240)" }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Storage
          </div>
          <div className="text-xs">{api.storage}</div>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Parameters Table
        </div>
        <div className="rounded-lg overflow-hidden border">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "oklch(0.95 0.006 240)" }}>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                  Parameter
                </th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                  Limit
                </th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                  Method
                </th>
              </tr>
            </thead>
            <tbody>
              {api.parameters.map((p, i) => (
                <tr
                  key={p.name}
                  style={{
                    background: i % 2 === 0 ? "white" : "oklch(0.98 0.003 240)",
                  }}
                >
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td
                    className="px-3 py-2 font-mono"
                    style={{ color: "oklch(0.35 0.12 240)" }}
                  >
                    {p.limit}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {p.method}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="p-3 rounded-lg"
        style={{ background: "oklch(0.96 0.005 240)" }}
      >
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Solubility
        </div>
        <div className="text-xs">{api.solubility}</div>
      </div>
    </div>
  );
}

function ExcipientDetailContent({ exc }: { exc: ExcipientIngredient }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          ["CAS Number", exc.cas],
          ["Grade", exc.grade],
          ["Pharmacopeia", exc.source],
          ["Assay Range", `${exc.assayMin}–${exc.assayMax}%`],
        ].map(([k, v]) => (
          <div
            key={String(k)}
            className="p-3 rounded-lg"
            style={{ background: "oklch(0.96 0.005 240)" }}
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {String(k)}
            </div>
            <div className="text-xs font-medium">{String(v)}</div>
          </div>
        ))}
      </div>

      <div
        className="p-3 rounded-lg"
        style={{
          background: "oklch(0.70 0.13 78 / 0.07)",
          border: "1px solid oklch(0.70 0.13 78 / 0.2)",
        }}
      >
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Description
        </div>
        <div className="text-sm">{exc.description}</div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div
          className="p-3 rounded-lg"
          style={{ background: "oklch(0.96 0.005 240)" }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Typical Use
          </div>
          <div
            className="text-xs font-medium"
            style={{ color: "oklch(0.50 0.10 78)" }}
          >
            {exc.typicalUse}
          </div>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ background: "oklch(0.96 0.005 240)" }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Solubility
          </div>
          <div className="text-xs">{exc.solubility}</div>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ background: "oklch(0.96 0.005 240)" }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Storage
          </div>
          <div className="text-xs">{exc.storage}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  ingredient,
  open,
  onClose,
}: {
  ingredient: UnifiedIngredient | null;
  open: boolean;
  onClose: () => void;
}) {
  const [editName, setEditName] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Sync form when ingredient changes
  const handleOpen = () => {
    if (ingredient) {
      setEditName(ingredient.name);
      setEditSource(ingredient.source);
      setEditDescription(ingredient.description);
    }
  };

  if (!ingredient) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) handleOpen();
        else onClose();
      }}
    >
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(1.0 0 0)",
          border: "1px solid oklch(0.88 0.012 240)",
          color: "oklch(0.14 0.02 250)",
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Ingredient</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Changes are saved locally and applied immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Name
            </Label>
            <Input
              data-ocid="library.edit.input"
              className="mt-1 text-sm"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Pharmacopeia Source
            </Label>
            <Input
              data-ocid="library.edit.input"
              className="mt-1 text-sm"
              value={editSource}
              onChange={(e) => setEditSource(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Description / Therapeutic Use
            </Label>
            <Textarea
              data-ocid="library.edit.textarea"
              className="mt-1 text-sm resize-none"
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            data-ocid="library.edit.save_button"
            className="flex-1 font-semibold"
            style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
            onClick={() => {
              saveOverride(ingredient.id, {
                name: editName,
                source: editSource,
                description: editDescription,
              });
              toast.success(`${editName} updated successfully`);
              onClose();
            }}
          >
            Save Changes
          </Button>
          <Button
            data-ocid="library.edit.cancel_button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Ingredient Modal ─────────────────────────────────────────────────────
function AddIngredientModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (ing: CustomIngredient) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    category: "apis" as LibraryCategory,
    source: "IP 2022",
    description: "",
    storage: "",
  });

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const newItem: CustomIngredient = {
      id: `custom-${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString(),
    };
    const existing = loadCustomIngredients();
    saveCustomIngredients([...existing, newItem]);
    onAdd(newItem);
    toast.success(`${form.name} added to library`);
    setForm({
      name: "",
      category: "apis",
      source: "IP 2022",
      description: "",
      storage: "",
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(1.0 0 0)",
          border: "1px solid oklch(0.88 0.012 240)",
          color: "oklch(0.14 0.02 250)",
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Ingredient</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a custom ingredient to the library. Saved locally.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Name *
            </Label>
            <Input
              data-ocid="library.add.input"
              className="mt-1 text-sm"
              placeholder="e.g. Shilajit Purified"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Category
            </Label>
            <select
              className="mt-1 w-full px-3 py-1.5 rounded-lg border text-sm bg-background"
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  category: e.target.value as LibraryCategory,
                }))
              }
              data-ocid="library.add.select"
            >
              <option value="herbs">Herb</option>
              <option value="apis">API</option>
              <option value="excipients">Excipient</option>
              <option value="extracts">Herb Extract</option>
            </select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Pharmacopeia Source
            </Label>
            <Input
              data-ocid="library.add.input"
              className="mt-1 text-sm"
              placeholder="e.g. IP 2022"
              value={form.source}
              onChange={(e) =>
                setForm((p) => ({ ...p, source: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Description / Therapeutic Use
            </Label>
            <Textarea
              data-ocid="library.add.textarea"
              className="mt-1 text-sm resize-none"
              rows={3}
              placeholder="Brief description of the ingredient..."
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Storage Conditions
            </Label>
            <Input
              data-ocid="library.add.input"
              className="mt-1 text-sm"
              placeholder="e.g. Store below 25°C"
              value={form.storage}
              onChange={(e) =>
                setForm((p) => ({ ...p, storage: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            data-ocid="library.add.submit_button"
            className="flex-1 font-semibold"
            style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
            onClick={handleSave}
          >
            Add to Library
          </Button>
          <Button
            data-ocid="library.add.cancel_button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Ingredient Card ──────────────────────────────────────────────────────────
function IngredientCard({
  ingredient,
  overrides,
  onView,
  onEdit,
  onAddToLab,
}: {
  ingredient: UnifiedIngredient;
  overrides: Record<string, Record<string, unknown>>;
  onView: () => void;
  onEdit: () => void;
  onAddToLab: () => void;
}) {
  const override = overrides[ingredient.id] || {};
  const name = (override.name as string) || ingredient.name;
  const source = (override.source as string) || ingredient.source;
  const description =
    (override.description as string) || ingredient.description;
  const colors = categoryColor(ingredient.category);
  const Icon = getCategoryIcon(ingredient.category);
  const externalUrl = buildExternalLink(ingredient);

  return (
    <div
      className="flex flex-col rounded-xl border bg-white transition-all duration-200 hover:shadow-md group"
      style={{ borderColor: "oklch(0.88 0.012 240)" }}
      data-ocid="library.item.card"
    >
      {/* Card Header */}
      <div className="p-4 pb-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 min-w-0">
            <div
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Icon size={13} style={{ color: colors.text }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
                {name}
              </h3>
              {ingredient.latinName && (
                <p className="text-[10px] text-muted-foreground italic truncate">
                  {ingredient.latinName}
                </p>
              )}
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="library.item.link"
                  className="flex-shrink-0 p-1 rounded transition-opacity opacity-40 hover:opacity-100"
                  style={{ color: "oklch(0.45 0.015 240)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                </a>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">View on approved database</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide"
            style={{
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
            }}
          >
            {ingredient.categoryLabel}
          </span>
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium"
            style={{
              background: "oklch(0.94 0.008 240)",
              color: "oklch(0.45 0.015 240)",
              border: "1px solid oklch(0.88 0.012 240)",
            }}
          >
            {source}
          </span>
          {ingredient.isCustom && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold"
              style={{
                background: "oklch(0.90 0.06 295 / 0.15)",
                color: "oklch(0.40 0.12 295)",
                border: "1px solid oklch(0.55 0.15 295 / 0.25)",
              }}
            >
              Custom
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {description.substring(0, 100)}
          {description.length > 100 ? "..." : ""}
        </p>
      </div>

      {/* Card Actions */}
      <div
        className="flex gap-1.5 px-3 pb-3 pt-2 border-t"
        style={{ borderColor: "oklch(0.92 0.008 240)" }}
      >
        <button
          type="button"
          data-ocid="library.item.view_button"
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium transition-all"
          style={{
            background: "oklch(0.95 0.006 240)",
            color: "oklch(0.35 0.02 240)",
            border: "1px solid oklch(0.88 0.012 240)",
          }}
        >
          <BookOpen size={11} />
          Detail
        </button>
        <button
          type="button"
          data-ocid="library.item.edit_button"
          onClick={onEdit}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
          style={{
            background: "oklch(0.70 0.13 78 / 0.08)",
            color: "oklch(0.50 0.10 78)",
            border: "1px solid oklch(0.70 0.13 78 / 0.25)",
          }}
        >
          <Edit3 size={11} />
        </button>
        <button
          type="button"
          data-ocid="library.item.add_button"
          onClick={onAddToLab}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
          style={{
            background: "oklch(0.42 0.14 145 / 0.10)",
            color: "oklch(0.30 0.12 145)",
            border: "1px solid oklch(0.42 0.14 145 / 0.25)",
          }}
        >
          <FlaskConical size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function IngredientLibrary({
  onAddToFormulationLab,
}: IngredientLibraryProps) {
  const [activeTab, setActiveTab] = useState<LibraryCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [viewIngredient, setViewIngredient] =
    useState<UnifiedIngredient | null>(null);
  const [editIngredient, setEditIngredient] =
    useState<UnifiedIngredient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customIngredients, setCustomIngredients] = useState<
    CustomIngredient[]
  >(loadCustomIngredients);
  const [overrides, setOverrides] =
    useState<Record<string, Record<string, unknown>>>(loadOverrides);

  // Build unified ingredient list
  const allIngredients = useMemo((): UnifiedIngredient[] => {
    const list: UnifiedIngredient[] = [];

    // Herbs
    for (const h of pharmacopeiaData) {
      list.push({
        id: h.id,
        name: h.name,
        latinName: h.latinName,
        category: "herbs",
        categoryLabel: "Herb",
        source: h.source,
        description: `${h.part} — ${h.source}. ${h.parameters.activeMarker ? `Active: ${h.parameters.activeMarker.compound} ≥${h.parameters.activeMarker.min}%.` : ""}`,
        data: h,
      });
    }

    // APIs
    for (const a of apiDrugs) {
      list.push({
        id: a.id,
        name: a.name,
        category: "apis",
        categoryLabel: "API",
        source: a.source,
        description: a.description,
        data: a,
      });
    }

    // Herb Extracts
    for (const e of herbExtracts) {
      list.push({
        id: e.id,
        name: e.name,
        category: "extracts",
        categoryLabel: "Extract",
        source: e.source,
        description: e.description,
        data: e,
      });
    }

    // All excipients
    const allExcs = [
      ...binders,
      ...disintegrants,
      ...lubricants,
      ...fillers,
      ...glidants,
      ...coatingAgents,
      ...preservatives,
      ...extraExcipients,
    ];
    const seenExcIds = new Set<string>();
    for (const ex of allExcs) {
      if (!seenExcIds.has(ex.id)) {
        seenExcIds.add(ex.id);
        list.push({
          id: ex.id,
          name: ex.name,
          category: "excipients",
          categoryLabel: "Excipient",
          source: ex.source,
          description: ex.description,
          data: ex,
        });
      }
    }

    // Custom ingredients
    for (const c of customIngredients) {
      list.push({
        id: c.id,
        name: c.name,
        category: c.category,
        categoryLabel:
          c.category === "herbs"
            ? "Herb"
            : c.category === "apis"
              ? "API"
              : c.category === "extracts"
                ? "Extract"
                : "Excipient",
        source: c.source,
        description: c.description,
        data: {
          id: c.id,
          name: c.name,
          grade: "Custom",
          cas: "—",
          source: c.source,
          assayMin: 0,
          assayMax: 0,
          description: c.description,
          storage: c.storage,
          solubility: "—",
          typicalUse: "Custom",
        } as ExcipientIngredient,
        isCustom: true,
      });
    }

    return list;
  }, [customIngredients]);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = allIngredients;

    if (activeTab !== "all") {
      result = result.filter((i) => i.category === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.latinName?.toLowerCase().includes(q) ?? false) ||
          i.description.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q) ||
          i.categoryLabel.toLowerCase().includes(q),
      );
    }

    const order: LibraryCategory[] = [
      "herbs",
      "apis",
      "excipients",
      "extracts",
    ];
    if (sortMode === "alpha") {
      result = [...result].sort((a, b) => {
        const na = (overrides[a.id]?.name as string) || a.name;
        const nb = (overrides[b.id]?.name as string) || b.name;
        return na.localeCompare(nb);
      });
    } else if (sortMode === "category") {
      result = [...result].sort(
        (a, b) => order.indexOf(a.category) - order.indexOf(b.category),
      );
    } else {
      result = [...result].sort((a, b) => {
        const sa = (overrides[a.id]?.source as string) || a.source;
        const sb = (overrides[b.id]?.source as string) || b.source;
        return sa.localeCompare(sb);
      });
    }

    return result;
  }, [allIngredients, activeTab, searchQuery, sortMode, overrides]);

  // Category counts
  const counts = useMemo(() => {
    const c = {
      all: allIngredients.length,
      herbs: 0,
      apis: 0,
      excipients: 0,
      extracts: 0,
    };
    for (const i of allIngredients) {
      c[i.category]++;
    }
    return c;
  }, [allIngredients]);

  const handleAddToLab = (ingredient: UnifiedIngredient) => {
    const override = overrides[ingredient.id] || {};
    const name = (override.name as string) || ingredient.name;
    onAddToFormulationLab({
      name,
      category: ingredient.categoryLabel,
      quantity: 100,
      unit: "mg",
    });
    toast.success(`${name} added to Formulation Lab`);
  };

  const handleEditSaved = () => {
    setOverrides(loadOverrides());
    setEditIngredient(null);
  };

  const tabItems: {
    id: LibraryCategory;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "all", label: "All", icon: FlaskConical },
    { id: "herbs", label: "Herbs", icon: Leaf },
    { id: "apis", label: "APIs", icon: Pill },
    { id: "excipients", label: "Excipients", icon: Package },
    { id: "extracts", label: "Extracts", icon: Sparkles },
  ];

  // Detail modal title
  const detailIngredient = viewIngredient
    ? {
        ...viewIngredient,
        name:
          (overrides[viewIngredient.id]?.name as string) || viewIngredient.name,
      }
    : null;

  return (
    <TooltipProvider>
      <div className="p-5 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "oklch(0.42 0.14 145 / 0.12)",
                  border: "1px solid oklch(0.42 0.14 145 / 0.3)",
                }}
              >
                <BookOpen size={15} style={{ color: "oklch(0.42 0.14 145)" }} />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Ingredient Library
              </h1>
            </div>
            <p className="text-xs text-muted-foreground ml-10">
              {allIngredients.length} ingredients — pharmacopeia-aligned
              reference catalog
            </p>
          </div>
          <Button
            data-ocid="library.add_ingredient.open_modal_button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-xs font-semibold shrink-0"
            style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
          >
            <Plus size={14} />
            Add Ingredient
          </Button>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              data-ocid="library.search_input"
              className="pl-8 text-sm h-9"
              placeholder="Search by name, source, therapeutic use…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {(["alpha", "category", "source"] as SortMode[]).map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setSortMode(mode)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                style={{
                  background:
                    sortMode === mode
                      ? "oklch(0.42 0.14 145 / 0.10)"
                      : "transparent",
                  color:
                    sortMode === mode
                      ? "oklch(0.30 0.12 145)"
                      : "oklch(0.45 0.015 240)",
                  borderColor:
                    sortMode === mode
                      ? "oklch(0.42 0.14 145 / 0.35)"
                      : "oklch(0.88 0.012 240)",
                }}
              >
                {mode === "alpha"
                  ? "A→Z"
                  : mode === "category"
                    ? "Category"
                    : "Source"}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as LibraryCategory)}
          className="mb-5"
        >
          <TabsList className="flex gap-1 h-auto p-1 bg-muted/30 rounded-xl w-full sm:w-auto">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  data-ocid={`library.${tab.id}.tab`}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                    style={{
                      background:
                        activeTab === tab.id
                          ? "oklch(0.42 0.14 145 / 0.12)"
                          : "oklch(0.88 0.012 240)",
                      color:
                        activeTab === tab.id
                          ? "oklch(0.30 0.12 145)"
                          : "oklch(0.45 0.015 240)",
                    }}
                  >
                    {counts[tab.id]}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Content - same layout for all tabs */}
          {tabItems.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              {filtered.length === 0 ? (
                <div
                  data-ocid="library.empty_state"
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ background: "oklch(0.94 0.008 240)" }}
                  >
                    <Search size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No ingredients found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "This category is empty"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filtered.map((ingredient, idx) => (
                    <div
                      key={ingredient.id}
                      data-ocid={`library.item.${idx + 1}`}
                    >
                      <IngredientCard
                        ingredient={ingredient}
                        overrides={overrides}
                        onView={() => setViewIngredient(ingredient)}
                        onEdit={() => setEditIngredient(ingredient)}
                        onAddToLab={() => handleAddToLab(ingredient)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Detail Modal */}
        <Dialog
          open={!!viewIngredient}
          onOpenChange={(o) => {
            if (!o) setViewIngredient(null);
          }}
        >
          <DialogContent
            className="max-w-2xl"
            style={{
              background: "oklch(1.0 0 0)",
              border: "1px solid oklch(0.88 0.012 240)",
              color: "oklch(0.14 0.02 250)",
            }}
          >
            {detailIngredient && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: categoryColor(detailIngredient.category).bg,
                        border: `1px solid ${categoryColor(detailIngredient.category).border}`,
                      }}
                    >
                      {(() => {
                        const I = getCategoryIcon(detailIngredient.category);
                        return (
                          <I
                            size={16}
                            style={{
                              color: categoryColor(detailIngredient.category)
                                .text,
                            }}
                          />
                        );
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-foreground">
                        {detailIngredient.name}
                      </DialogTitle>
                      {detailIngredient.latinName && (
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          {detailIngredient.latinName}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto flex gap-2">
                      <a
                        href={buildExternalLink(detailIngredient)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-ocid="library.detail.link"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: "oklch(0.94 0.008 240)",
                          color: "oklch(0.45 0.015 240)",
                          border: "1px solid oklch(0.88 0.012 240)",
                        }}
                      >
                        <ExternalLink size={11} />
                        Live Data
                      </a>
                    </div>
                  </div>
                  <DialogDescription className="text-xs">
                    {detailIngredient.categoryLabel} ·{" "}
                    {(overrides[detailIngredient.id]?.source as string) ||
                      detailIngredient.source}
                  </DialogDescription>
                </DialogHeader>
                <Separator />
                <ScrollArea className="max-h-[60vh] pr-2">
                  {detailIngredient.category === "herbs" ? (
                    <HerbDetailContent
                      herb={detailIngredient.data as HerbMonograph}
                    />
                  ) : detailIngredient.category === "apis" ||
                    detailIngredient.category === "extracts" ? (
                    <APIDetailContent
                      api={detailIngredient.data as APIIngredient}
                    />
                  ) : (
                    <ExcipientDetailContent
                      exc={detailIngredient.data as ExcipientIngredient}
                    />
                  )}
                </ScrollArea>
                <div className="flex gap-3 pt-2">
                  <Button
                    data-ocid="library.detail.add_button"
                    className="flex-1 text-xs font-semibold"
                    style={{
                      background: "oklch(0.42 0.14 145)",
                      color: "white",
                    }}
                    onClick={() => {
                      handleAddToLab(detailIngredient);
                      setViewIngredient(null);
                    }}
                  >
                    <FlaskConical size={13} className="mr-2" />
                    Add to Formulation Lab
                  </Button>
                  <Button
                    data-ocid="library.detail.edit_button"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      setEditIngredient(viewIngredient);
                      setViewIngredient(null);
                    }}
                  >
                    <Edit3 size={12} className="mr-1" />
                    Edit
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <EditModal
          ingredient={editIngredient}
          open={!!editIngredient}
          onClose={handleEditSaved}
        />

        {/* Add Modal */}
        <AddIngredientModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(ing) => setCustomIngredients((prev) => [...prev, ing])}
        />
      </div>
    </TooltipProvider>
  );
}

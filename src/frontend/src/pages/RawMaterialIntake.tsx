import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, FlaskConical } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ExcipientCategory,
  apiDrugs,
  excipientCategoryLabels,
  excipientCategoryMap,
} from "../data/formulationData";
import { pharmacopeiaData } from "../data/pharmacopeiaData";
import { useCreateBatch } from "../hooks/useQueries";

type MaterialType = "herb" | "api" | ExcipientCategory;

const materialTypeOptions: { value: MaterialType; label: string }[] = [
  { value: "herb", label: "Herb / Plant Material" },
  { value: "api", label: "API (Active Pharmaceutical Ingredient)" },
  { value: "binders", label: "Binder" },
  { value: "disintegrants", label: "Disintegrant" },
  { value: "lubricants", label: "Lubricant" },
  { value: "fillers", label: "Filler / Diluent" },
  { value: "glidants", label: "Glidant" },
  { value: "coatingAgents", label: "Coating Agent" },
  { value: "preservatives", label: "Preservative" },
];

const initialForm = {
  batchId: "",
  herbName: "",
  supplier: "",
  region: "",
  dateReceived: new Date().toISOString().split("T")[0],
  moisture: "",
  ash: "",
  extractiveValue: "",
  heavyMetals: "",
  microbialCount: "",
  notes: "",
};

type FormState = typeof initialForm;

export function RawMaterialIntake({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [materialType, setMaterialType] = useState<MaterialType>("herb");
  const createBatch = useCreateBatch();

  const set =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const getIngredientOptions = () => {
    if (materialType === "herb")
      return pharmacopeiaData.map((h) => ({
        id: h.id,
        name: h.name,
        sub: h.latinName,
      }));
    if (materialType === "api")
      return apiDrugs.map((a) => ({
        id: a.id,
        name: a.name,
        sub: a.therapeuticCategory,
      }));
    return excipientCategoryMap[materialType as ExcipientCategory].map((e) => ({
      id: e.id,
      name: e.name,
      sub: e.grade,
    }));
  };

  const handleIngredientSelect = (id: string) => {
    if (materialType === "herb") {
      const herb = pharmacopeiaData.find((h) => h.id === id);
      if (!herb) return;
      setForm((prev) => ({
        ...prev,
        herbName: herb.name,
        moisture: String(herb.parameters.moisture.max),
        ash: String(herb.parameters.totalAsh.max),
        extractiveValue: String(herb.parameters.waterSolubleExtractive.min),
        heavyMetals: String(herb.parameters.heavyMetals.lead.max),
        microbialCount: String(herb.parameters.microbial.totalAerobicCount.max),
      }));
    } else if (materialType === "api") {
      const api = apiDrugs.find((a) => a.id === id);
      if (!api) return;
      setForm((prev) => ({
        ...prev,
        herbName: api.name,
        notes: `CAS: ${api.cas} | Formula: ${api.molecularFormula} | Assay: ${api.assayMin}–${api.assayMax}% | Source: ${api.source} | ${api.therapeuticCategory}`,
      }));
    } else {
      const items = excipientCategoryMap[materialType as ExcipientCategory];
      const item = items.find((i) => i.id === id);
      if (!item) return;
      setForm((prev) => ({
        ...prev,
        herbName: item.name,
        notes: `CAS: ${item.cas} | Grade: ${item.grade} | Assay: ${item.assayMin}–${item.assayMax} | Source: ${item.source} | Typical use: ${item.typicalUse} | ${item.description}`,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId || !form.herbName || !form.supplier) {
      toast.error("Batch ID, Material Name, and Supplier are required");
      return;
    }
    try {
      await createBatch.mutateAsync({
        batchId: form.batchId,
        herbName: form.herbName,
        supplier: form.supplier,
        region: form.region,
        dateReceived: form.dateReceived,
        moisture: Number.parseFloat(form.moisture) || 0,
        ash: Number.parseFloat(form.ash) || 0,
        extractiveValue: Number.parseFloat(form.extractiveValue) || 0,
        heavyMetals: Number.parseFloat(form.heavyMetals) || 0,
        microbialCount: Number.parseFloat(form.microbialCount) || 0,
        notes: form.notes,
      });
      setSubmitted(true);
      toast.success("Batch registered successfully");
      setTimeout(() => {
        setSubmitted(false);
        setForm(initialForm);
        setMaterialType("herb");
        onSuccess?.();
      }, 2000);
    } catch {
      toast.error("Failed to create batch");
    }
  };

  const fieldCls =
    "bg-input/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg h-9 text-sm px-3";

  const ingredients = getIngredientOptions();

  return (
    <div className="p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical size={16} className="text-gold" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Raw Material Intake
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Register New Batch
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter raw material parameters for QA analysis and ML prediction
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 glass-card rounded-xl p-6"
      >
        {submitted ? (
          <div
            className="flex flex-col items-center justify-center py-12 gap-3"
            data-ocid="intake.success_state"
          >
            <CheckCircle2 size={48} className="text-success" />
            <div className="text-lg font-semibold text-foreground">
              Batch Registered!
            </div>
            <div className="text-sm text-muted-foreground">
              Redirecting to batch records…
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Material Type + Ingredient Selection */}
            <div
              className="p-4 rounded-lg border border-border/40"
              style={{ background: "oklch(0.22 0.05 170 / 0.4)" }}
            >
              <div className="text-xs font-semibold text-gold uppercase tracking-widest mb-3">
                Material Type &amp; Selection
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Material Type *
                  </Label>
                  <Select
                    value={materialType}
                    onValueChange={(v) => {
                      setMaterialType(v as MaterialType);
                      setForm((prev) => ({
                        ...prev,
                        herbName: "",
                        notes: "",
                        moisture: "",
                        ash: "",
                        extractiveValue: "",
                        heavyMetals: "",
                        microbialCount: "",
                      }));
                    }}
                  >
                    <SelectTrigger className={`${fieldCls} w-full`}>
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Select Ingredient (auto-fill)
                  </Label>
                  <Select onValueChange={handleIngredientSelect}>
                    <SelectTrigger className={`${fieldCls} w-full`}>
                      <SelectValue placeholder="Search & select to auto-fill…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {ingredients.map((ing) => (
                        <SelectItem key={ing.id} value={ing.id}>
                          <span className="font-medium">{ing.name}</span>
                          {ing.sub && (
                            <span className="text-muted-foreground ml-1 text-xs">
                              — {ing.sub}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Batch ID *
                </Label>
                <Input
                  data-ocid="intake.input"
                  className={fieldCls}
                  placeholder="e.g. AY-2026-001"
                  value={form.batchId}
                  onChange={set("batchId")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  {materialType === "herb"
                    ? "Herb / Material Name"
                    : materialType === "api"
                      ? "API Name"
                      : `${excipientCategoryLabels[materialType as ExcipientCategory] ?? "Excipient"} Name`}{" "}
                  *
                </Label>
                <Input
                  className={fieldCls}
                  placeholder="Auto-filled or enter manually"
                  value={form.herbName}
                  onChange={set("herbName")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Supplier *
                </Label>
                <Input
                  className={fieldCls}
                  placeholder="e.g. HerbCraft India"
                  value={form.supplier}
                  onChange={set("supplier")}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Region / Origin
                </Label>
                <Input
                  className={fieldCls}
                  placeholder="e.g. Rajasthan, India"
                  value={form.region}
                  onChange={set("region")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Date Received
                </Label>
                <Input
                  type="date"
                  className={fieldCls}
                  value={form.dateReceived}
                  onChange={set("dateReceived")}
                />
              </div>
            </div>

            {/* Physicochemical Parameters */}
            <div className="border-t border-border/30 pt-4">
              <div className="text-xs font-semibold text-gold uppercase tracking-widest mb-3">
                Physicochemical Parameters
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Moisture %
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    className={fieldCls}
                    placeholder="8.5"
                    value={form.moisture}
                    onChange={set("moisture")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Ash %
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    className={fieldCls}
                    placeholder="3.2"
                    value={form.ash}
                    onChange={set("ash")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Extractive Value %
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    className={fieldCls}
                    placeholder="22.0"
                    value={form.extractiveValue}
                    onChange={set("extractiveValue")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Heavy Metals (ppm)
                  </Label>
                  <Input
                    type="number"
                    step="0.001"
                    className={fieldCls}
                    placeholder="0.5"
                    value={form.heavyMetals}
                    onChange={set("heavyMetals")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Microbial (CFU/g)
                  </Label>
                  <Input
                    type="number"
                    step="1"
                    className={fieldCls}
                    placeholder="100"
                    value={form.microbialCount}
                    onChange={set("microbialCount")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Notes / Observations
              </Label>
              <Textarea
                data-ocid="intake.textarea"
                className="bg-input/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-sm resize-none"
                rows={3}
                placeholder="Additional observations, pharmacopeia reference, storage conditions…"
                value={form.notes}
                onChange={set("notes")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="intake.cancel_button"
                className="border-border/50 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setForm(initialForm);
                  setMaterialType("herb");
                }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                data-ocid="intake.submit_button"
                disabled={createBatch.isPending}
                className="bg-primary text-primary-foreground hover:opacity-90 font-semibold px-6 glow-gold"
              >
                {createBatch.isPending ? "Registering…" : "Register Batch"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

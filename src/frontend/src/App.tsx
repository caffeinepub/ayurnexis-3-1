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
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Beaker,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Database,
  FileBarChart,
  FlaskConical,
  History,
  LayoutDashboard,
  Leaf,
  Lightbulb,
  Loader2,
  Lock,
  LogOut,
  Menu,
  Microscope,
  Search,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import type { backendInterface as FullBackend } from "./backend.d";
import { AccessGate } from "./components/AccessGate";
import { useActor } from "./hooks/useActor";
import { useSeedData } from "./hooks/useQueries";
import { AdminDashboard } from "./pages/AdminDashboard";
import { BatchRecords } from "./pages/BatchRecords";
import { Dashboard } from "./pages/Dashboard";
import { FormulationLab } from "./pages/FormulationLab";
import { GetFormulationIdea } from "./pages/GetFormulationIdea";
import { HistoryPage } from "./pages/HistoryPage";
import { Predictions } from "./pages/Predictions";
import { QualityAnalysis } from "./pages/QualityAnalysis";
import { RawMaterialIntake } from "./pages/RawMaterialIntake";
import { Reports } from "./pages/Reports";
import { UserManual } from "./pages/UserManual";
import {
  getCurrentAccessLevel,
  isAdminAuthed,
  logActivity,
} from "./utils/accessControl";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 2 } },
});

export const ReadOnlyContext = createContext<boolean>(false);
export function useReadOnly() {
  return useContext(ReadOnlyContext);
}

type Page =
  | "dashboard"
  | "intake"
  | "batches"
  | "analysis"
  | "predictions"
  | "reports"
  | "config"
  | "manual"
  | "formulation"
  | "formulationIdea"
  | "history"
  | "adminDashboard";

const NAV_ITEMS: {
  id: Page;
  label: string;
  icon: React.ElementType;
  short?: string;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "intake",
    label: "Raw Material Intake",
    icon: FlaskConical,
    short: "Intake",
  },
  { id: "batches", label: "Batch Records", icon: Database, short: "Batches" },
  {
    id: "analysis",
    label: "Quality Analysis",
    icon: Microscope,
    short: "Analysis",
  },
  { id: "predictions", label: "Predictions", icon: BrainCircuit },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "history", label: "History", icon: History, short: "History" },
  {
    id: "formulationIdea",
    label: "Formulation Idea",
    icon: Lightbulb,
    short: "Idea",
  },
  { id: "config", label: "Configuration", icon: Settings, short: "Config" },
  { id: "manual", label: "User Manual", icon: BookOpen, short: "Manual" },
  {
    id: "formulation",
    label: "Formulation Lab",
    icon: Beaker,
    short: "Formula",
  },
];

function AppShell() {
  const { actor, isFetching } = useActor();
  const seedMutation = useSeedData();
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [secret, setSecret] = useState("");
  const [initializing, setInitializing] = useState(false);
  const [_initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [accessLevel, setAccessLevelState] = useState(() =>
    getCurrentAccessLevel(),
  );
  const readOnly = accessLevel !== "full";

  const [profile, setProfile] = useState<{
    name: string;
    designation: string;
    institution: string;
    email: string;
  }>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("ayurnexis_profile") || "null") || {
          name: "Admin",
          designation: "System Admin",
          institution: "AyurNexis Lab",
          email: "admin@ayurnexis.com",
        }
      );
    } catch {
      return {
        name: "Admin",
        designation: "System Admin",
        institution: "AyurNexis Lab",
        email: "admin@ayurnexis.com",
      };
    }
  });
  const [formulationPrefill, setFormulationPrefill] = useState<{
    dosageForm: string;
    ingredients: Array<{
      name: string;
      category: string;
      quantity: number;
      unit: string;
    }>;
  } | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    designation: "",
    institution: "",
    email: "",
  });

  useEffect(() => {
    if (!actor || isFetching) return;
    const alreadyInited = localStorage.getItem("ayurnexis_inited");
    if (!alreadyInited) {
      localStorage.setItem("ayurnexis_inited", "1");
      ensureSeedData();
    } else {
      ensureSeedData();
    }
  }, [actor, isFetching]);

  // Sync access level on storage changes
  useEffect(() => {
    const handler = () => setAccessLevelState(getCurrentAccessLevel());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ayurnexis_access_level");
    localStorage.removeItem("ayurnexis_current_user_id");
    localStorage.removeItem("ayurnexis_admin_authed");
    setAccessLevelState("none");
    window.location.reload();
  };

  const handlePageChange = (newPage: Page) => {
    // Readonly users can only see dashboard
    if (accessLevel === "readonly" && newPage !== "dashboard") return;
    setPage(newPage);
    logActivity("navigate", newPage);
  };

  const ensureSeedData = async () => {
    const seeded = localStorage.getItem("ayurnexis_seeded");
    if (!seeded && actor) {
      try {
        await seedMutation.mutateAsync();
        localStorage.setItem("ayurnexis_seeded", "1");
      } catch {
        // ignore seed errors
      }
    }
  };

  const handleInit = async () => {
    if (!actor) return;
    setInitializing(true);
    try {
      await (
        actor as unknown as FullBackend
      )._initializeAccessControlWithSecret(
        secret || "AYURNEXIS-ADMIN-TOKEN-2026",
      );
      localStorage.setItem("ayurnexis_inited", "1");
      setInitialized(true);
      setShowInitModal(false);
      toast.success("AyurNexis 3.1 initialized — Admin access granted");
      await ensureSeedData();
    } catch {
      localStorage.setItem("ayurnexis_inited", "1");
      setShowInitModal(false);
      await ensureSeedData();
    } finally {
      setInitializing(false);
    }
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "intake":
        return (
          <RawMaterialIntake onSuccess={() => handlePageChange("batches")} />
        );
      case "batches":
        return (
          <BatchRecords
            onNavigateAnalysis={() => handlePageChange("analysis")}
          />
        );
      case "analysis":
        return <QualityAnalysis />;
      case "predictions":
        return <Predictions />;
      case "reports":
        return <Reports />;
      case "config":
        return <ConfigPage />;
      case "manual":
        return <UserManual />;
      case "formulation":
        return <FormulationLab prefillData={formulationPrefill} />;
      case "formulationIdea":
        return (
          <GetFormulationIdea
            onAddToFormulationLab={(data) => {
              setFormulationPrefill(data);
              handlePageChange("formulation");
            }}
          />
        );
      case "history":
        return <HistoryPage />;
      case "adminDashboard":
        return <AdminDashboard />;
    }
  };

  const currentNav = NAV_ITEMS.find((n) => n.id === page);

  return (
    <ReadOnlyContext.Provider value={readOnly}>
      <div
        className="flex h-full overflow-hidden"
        style={{ background: "oklch(0.97 0.004 240)" }}
      >
        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 220 : 60 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex-shrink-0 flex flex-col h-full overflow-hidden"
          style={{
            background: "oklch(0.98 0.004 240)",
            borderRight: "1px solid oklch(0.88 0.012 240 / 0.6)",
          }}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 px-3 py-4 border-b"
            style={{ borderColor: "oklch(0.88 0.012 240 / 0.6)" }}
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "oklch(0.42 0.14 145 / 0.12)",
                border: "1px solid oklch(0.42 0.14 145 / 0.3)",
              }}
            >
              <Leaf size={16} style={{ color: "oklch(0.42 0.14 145)" }} />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="text-sm font-bold text-foreground leading-tight">
                    AyurNexis
                  </div>
                  <div className="text-[10px] text-gold font-semibold tracking-wider">
                    v3.1 QA
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
            {NAV_ITEMS.filter(
              (item) => accessLevel !== "readonly" || item.id === "dashboard",
            ).map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={`nav.${item.id}.link`}
                  onClick={() => handlePageChange(item.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group relative"
                  style={{
                    background: active
                      ? "oklch(0.42 0.14 145 / 0.12)"
                      : "transparent",
                    color: active
                      ? "oklch(0.42 0.14 145)"
                      : "oklch(0.45 0.015 240)",
                    border: active
                      ? "1px solid oklch(0.72 0.130 78 / 0.3)"
                      : "1px solid transparent",
                  }}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-medium truncate"
                      >
                        {item.short || item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && (
                    <div className="absolute right-2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin link */}
          <div
            className="px-2 pb-1"
            style={{ borderTop: "1px solid oklch(0.88 0.012 240 / 0.6)" }}
          >
            {isAdminAuthed() ? (
              <button
                type="button"
                data-ocid="nav.admin.link"
                onClick={() => handlePageChange("adminDashboard")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 mt-1"
                style={{
                  background:
                    page === "adminDashboard"
                      ? "oklch(0.35 0.08 250 / 0.12)"
                      : "transparent",
                  color:
                    page === "adminDashboard"
                      ? "oklch(0.35 0.08 250)"
                      : "oklch(0.50 0.015 240)",
                  border:
                    page === "adminDashboard"
                      ? "1px solid oklch(0.35 0.08 250 / 0.3)"
                      : "1px solid transparent",
                }}
              >
                <Shield
                  size={14}
                  className="flex-shrink-0"
                  style={{
                    color:
                      page === "adminDashboard"
                        ? "oklch(0.35 0.08 250)"
                        : "oklch(0.50 0.10 240)",
                  }}
                />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-semibold"
                      style={{
                        color:
                          page === "adminDashboard"
                            ? "oklch(0.35 0.08 250)"
                            : "oklch(0.50 0.015 240)",
                      }}
                    >
                      Admin Panel
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ) : (
              <button
                type="button"
                data-ocid="nav.admin.link"
                onClick={() => {
                  window.location.hash = "admin";
                  window.location.reload();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 mt-1"
                style={{
                  color: "oklch(0.50 0.015 240)",
                  border: "1px solid transparent",
                }}
              >
                <Shield
                  size={14}
                  className="flex-shrink-0"
                  style={{ color: "oklch(0.50 0.10 240)" }}
                />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-muted-foreground"
                    >
                      Admin
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}
          </div>

          {/* Sidebar toggle */}
          <div
            className="p-2 border-t"
            style={{ borderColor: "oklch(0.88 0.012 240 / 0.6)" }}
          >
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
            >
              {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </motion.aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header
            className="flex-shrink-0 flex items-center gap-4 px-5 py-3 border-b"
            style={{
              background: "oklch(0.99 0.003 240 / 0.97)",
              borderColor: "oklch(0.88 0.012 240 / 0.6)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield size={12} className="text-gold" />
              <span className="text-gold font-semibold">AyurNexis 3.1</span>
              <ChevronRight size={10} />
              <span className="text-foreground font-medium">
                {currentNav?.label}
              </span>
            </div>

            {/* Nav tabs */}
            <div className="hidden xl:flex items-center gap-0.5 ml-4">
              {NAV_ITEMS.slice(0, 7).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={`header.${item.id}.tab`}
                  onClick={() => handlePageChange(item.id)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={{
                    background:
                      page === item.id
                        ? "oklch(0.42 0.14 145 / 0.12)"
                        : "transparent",
                    color:
                      page === item.id
                        ? "oklch(0.42 0.14 145)"
                        : "oklch(0.45 0.015 240)",
                  }}
                >
                  {item.short || item.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Read-only indicator */}
            {readOnly && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{
                  background: "oklch(0.88 0.10 78 / 0.15)",
                  color: "oklch(0.45 0.10 78)",
                  border: "1px solid oklch(0.72 0.130 78 / 0.3)",
                }}
              >
                <Lock size={10} />
                Read-only
              </div>
            )}

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                data-ocid="header.search_input"
                className="pl-8 h-7 w-48 text-xs bg-input/40 border-border/40 text-foreground placeholder:text-muted-foreground focus:border-primary/60"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* User + Manual link */}
            <button
              type="button"
              onClick={() => handlePageChange("manual")}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
              style={{
                background:
                  page === "manual"
                    ? "oklch(0.42 0.14 145 / 0.12)"
                    : "transparent",
                color:
                  page === "manual"
                    ? "oklch(0.42 0.14 145)"
                    : "oklch(0.45 0.015 240)",
                border: "1px solid oklch(0.32 0.065 172 / 0.3)",
              }}
            >
              <BookOpen size={12} />
              <span>Manual</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 pl-3 border-l cursor-pointer bg-transparent"
              style={{ borderColor: "oklch(0.88 0.012 240 / 0.6)" }}
              onClick={() => {
                setProfileForm({
                  name: profile.name,
                  designation: profile.designation,
                  institution: profile.institution,
                  email: profile.email,
                });
                setProfileOpen(true);
              }}
              data-ocid="header.profile.button"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity"
                style={{
                  background: "oklch(0.72 0.130 78 / 0.2)",
                  color: "oklch(0.42 0.14 145)",
                }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-semibold text-foreground">
                  {profile.name}
                </span>
                <span className="text-[10px] text-gold">
                  {profile.designation}
                </span>
              </div>
              <ChevronDown size={12} className="text-muted-foreground" />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              data-ocid="header.logout.button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 border"
              style={{
                background: "oklch(0.97 0.005 20)",
                color: "oklch(0.50 0.18 25)",
                borderColor: "oklch(0.85 0.06 25 / 0.5)",
              }}
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="min-h-full"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer
            className="flex-shrink-0 px-5 py-3 flex items-center justify-between text-[10px] text-muted-foreground border-t"
            style={{
              background: "oklch(0.97 0.004 240)",
              borderColor: "oklch(0.88 0.012 240 / 0.6)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gold">AyurNexis 3.1</span>
              <span className="hidden sm:inline">
                Precision Ayurvedic QA Intelligence
              </span>
              <span
                className="hidden sm:inline px-1.5 py-0.5 rounded"
                style={{
                  background: "oklch(0.42 0.14 145 / 0.10)",
                  color: "oklch(0.42 0.14 145)",
                }}
              >
                ISO 17025 Compliant
              </span>
              <span
                className="hidden sm:inline px-1.5 py-0.5 rounded"
                style={{
                  background: "oklch(0.42 0.14 145 / 0.12)",
                  color: "oklch(0.42 0.14 145)",
                }}
              >
                GMP Certified
              </span>
            </div>
            <div>
              © {new Date().getFullYear()} Built with ♥ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                className="underline hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                caffeine.ai
              </a>
            </div>
          </footer>
        </div>

        {/* Init Modal */}
        <Dialog open={showInitModal} onOpenChange={setShowInitModal}>
          <DialogContent
            className="max-w-md"
            style={{
              background: "oklch(1.0 0 0)",
              border: "1px solid oklch(0.88 0.012 240)",
              color: "oklch(0.14 0.02 250)",
            }}
          >
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "oklch(0.42 0.14 145 / 0.10)",
                    border: "1px solid oklch(0.42 0.14 145 / 0.3)",
                  }}
                >
                  <Lock size={18} style={{ color: "oklch(0.42 0.14 145)" }} />
                </div>
                <div>
                  <DialogTitle className="text-foreground">
                    Initialize AyurNexis 3.1
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                    Enter admin secret to activate the QA system
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">Admin Secret</div>
              <Input
                data-ocid="init.input"
                type="password"
                className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                placeholder="AYURNEXIS-ADMIN-TOKEN-2026"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInit()}
              />
              <div className="text-[10px] text-muted-foreground">
                Default: AYURNEXIS-ADMIN-TOKEN-2026
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                data-ocid="init.confirm_button"
                disabled={initializing}
                onClick={handleInit}
                className="flex-1 bg-primary text-primary-foreground font-semibold hover:opacity-90"
              >
                {initializing ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />{" "}
                    Initializing…
                  </>
                ) : (
                  "Initialize System"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Profile Modal */}
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent
            className="max-w-md"
            style={{
              background: "oklch(1.0 0 0)",
              border: "1px solid oklch(0.88 0.012 240)",
              color: "oklch(0.14 0.02 250)",
            }}
          >
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    background: "oklch(0.72 0.130 78 / 0.15)",
                    color: "oklch(0.42 0.14 145)",
                    border: "2px solid oklch(0.72 0.130 78 / 0.3)",
                  }}
                >
                  {profileForm.name.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <DialogTitle className="text-foreground">
                    Edit Profile
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                    Update your personal and institutional details
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Full Name
                </Label>
                <Input
                  data-ocid="profile.name.input"
                  className="mt-1 bg-input/50 border-border/50 text-foreground"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Dr. Priya Sharma"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Designation
                </Label>
                <Input
                  data-ocid="profile.designation.input"
                  className="mt-1 bg-input/50 border-border/50 text-foreground"
                  value={profileForm.designation}
                  onChange={(e) =>
                    setProfileForm((p) => ({
                      ...p,
                      designation: e.target.value,
                    }))
                  }
                  placeholder="Senior QA Scientist"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Institution / Organization
                </Label>
                <Input
                  data-ocid="profile.institution.input"
                  className="mt-1 bg-input/50 border-border/50 text-foreground"
                  value={profileForm.institution}
                  onChange={(e) =>
                    setProfileForm((p) => ({
                      ...p,
                      institution: e.target.value,
                    }))
                  }
                  placeholder="PharmaTech Laboratories Pvt. Ltd."
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email Address
                </Label>
                <Input
                  data-ocid="profile.email.input"
                  type="email"
                  className="mt-1 bg-input/50 border-border/50 text-foreground"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="admin@ayurnexis.com"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                data-ocid="profile.save_button"
                className="flex-1 bg-primary text-primary-foreground font-semibold hover:opacity-90"
                onClick={() => {
                  setProfile({ ...profileForm });
                  localStorage.setItem(
                    "ayurnexis_profile",
                    JSON.stringify(profileForm),
                  );
                  setProfileOpen(false);
                }}
              >
                Save Changes
              </Button>
              <Button
                data-ocid="profile.cancel_button"
                variant="outline"
                onClick={() => setProfileOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Toaster position="top-right" theme="light" richColors />
      </div>
    </ReadOnlyContext.Provider>
  );
}

function ConfigPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <Settings size={16} className="text-gold" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          System Configuration
        </span>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Configuration</h1>
      <p className="text-muted-foreground text-sm mt-1">
        System parameters, thresholds, and user role management
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Quality Thresholds",
            desc: "Configure accept/reject scoring thresholds per parameter",
            params: [
              "Moisture ≤ 10%",
              "Ash ≤ 5%",
              "Extractive ≥ 20%",
              "Heavy Metals ≤ 2ppm",
              "Microbial ≤ 500 CFU/g",
            ],
          },
          {
            title: "ML Model Parameters",
            desc: "Decision-tree ML model configuration",
            params: [
              "Model: Rule-Based + Decision Tree",
              "Training: Historical batch data",
              "Features: 5 physicochemical params",
              "Scoring: 0-100 normalized",
              "Confidence threshold: 60%",
            ],
          },
          {
            title: "Role Access Control",
            desc: "User role permissions matrix",
            params: [
              "Admin: Full access",
              "QA Manager: Dashboard, Reports, Approval",
              "Lab Technician: Data Entry, Analysis",
              "Guest: View-only dashboard",
            ],
          },
          {
            title: "Notification Settings",
            desc: "Alert thresholds and notification rules",
            params: [
              "Anomaly alert: Score < 40",
              "High-risk flag: Score < 50",
              "Deviation report: Auto-generated",
              "Daily summary: 08:00 IST",
            ],
          },
        ].map(({ title, desc, params }) => (
          <div key={title} className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gold mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{desc}</p>
            <ul className="space-y-1.5">
              {params.map((p) => (
                <li
                  key={p}
                  className="text-xs text-foreground flex items-center gap-2"
                >
                  <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppRoot() {
  // Check for admin hash
  const isAdminRoute = window.location.hash === "#admin";

  if (isAdminRoute) {
    return (
      <>
        <AdminDashboard />
        <Toaster position="top-right" theme="light" richColors />
      </>
    );
  }

  return (
    <AccessGate>
      <div className="h-screen flex flex-col">
        <AppShell />
      </div>
    </AccessGate>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AppRoot />
    </QueryClientProvider>
  );
}

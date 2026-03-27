import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Key,
  Leaf,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  UserMinus,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  type UserRegistration,
  approveUser,
  generateCodeForUser,
  getAllUsers,
  isAdminAuthed,
  mergeBackendUsers,
  revokeUser,
  saveAllUsers,
  setAdminAuthed,
} from "../utils/accessControl";

const ADMIN_PASSWORD = "AYURNEXIS-ADMIN-TOKEN-2026";

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      onLogin();
      toast.success("Admin access granted");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "oklch(0.97 0.004 240)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "oklch(1.0 0 0)",
          border: "1px solid oklch(0.88 0.012 240)",
          boxShadow: "0 4px 24px oklch(0.14 0.02 250 / 0.08)",
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: "oklch(0.42 0.14 145 / 0.12)",
              border: "2px solid oklch(0.42 0.14 145 / 0.3)",
            }}
          >
            <Shield size={24} style={{ color: "oklch(0.42 0.14 145)" }} />
          </div>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            AyurNexis 3.1 Administration
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <Label
              htmlFor="admin-pwd"
              className="text-xs font-semibold text-muted-foreground"
            >
              Admin Password
            </Label>
            <Input
              id="admin-pwd"
              data-ocid="admin_login.password.input"
              type="password"
              className="mt-1"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          {error && (
            <p
              data-ocid="admin_login.error_state"
              className="text-xs text-red-500"
            >
              {error}
            </p>
          )}
          <Button
            data-ocid="admin_login.submit_button"
            className="w-full bg-primary text-primary-foreground font-semibold"
            onClick={handleLogin}
          >
            Login as Admin
          </Button>
        </div>
        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            ← Back to AyurNexis
          </a>
        </div>
      </div>
    </div>
  );
}

function CodeModal({
  user,
  code,
  onClose,
}: {
  user: UserRegistration;
  code: string;
  onClose: () => void;
}) {
  const expiry = user.codeGeneratedAt
    ? new Date(
        user.codeGeneratedAt + 30 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm mx-4"
        style={{
          background: "oklch(1.0 0 0)",
          border: "1px solid oklch(0.88 0.012 240)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key size={16} style={{ color: "oklch(0.42 0.14 145)" }} />
            Access Code Generated
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-xs text-muted-foreground">
            Share this code with{" "}
            <strong className="text-foreground">{user.name}</strong>
          </p>
          <div
            className="flex items-center justify-between rounded-xl p-4 gap-4"
            style={{
              background: "oklch(0.42 0.14 145 / 0.06)",
              border: "2px solid oklch(0.42 0.14 145 / 0.3)",
            }}
          >
            <span
              className="text-3xl font-bold tracking-widest"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "monospace" }}
            >
              {code}
            </span>
            <button
              type="button"
              data-ocid="admin.code_modal.copy_button"
              onClick={handleCopy}
              className="p-2 rounded-lg transition-colors hover:bg-black/5"
            >
              <Copy size={18} style={{ color: "oklch(0.42 0.14 145)" }} />
            </button>
          </div>
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
            style={{
              background: "oklch(0.72 0.130 78 / 0.08)",
              color: "oklch(0.50 0.10 78)",
            }}
          >
            <Key size={12} />
            Valid for 30 days · Expires {expiry}
          </div>
          <Button
            data-ocid="admin.code_modal.close_button"
            className="w-full"
            variant="outline"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserCard({
  user,
  onRefresh,
}: { user: UserRegistration; onRefresh: () => void }) {
  const [showLog, setShowLog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const { actor } = useActor();

  const codeExpiry = localUser.codeGeneratedAt
    ? new Date(localUser.codeGeneratedAt + 30 * 24 * 60 * 60 * 1000)
    : null;
  const isCodeExpired = codeExpiry ? codeExpiry < new Date() : false;

  const handleApprove = async () => {
    // Update localStorage immediately (optimistic)
    approveUser(localUser.id);
    setLocalUser((u) => ({
      ...u,
      status: "approved" as const,
      approvedAt: Date.now(),
    }));
    toast.success(`${localUser.name} approved`);
    onRefresh();
    // Sync to backend if available
    if (actor) {
      try {
        await (actor as any).adminApproveUser(
          localUser.id,
          "AYURNEXIS-ADMIN-TOKEN-2026",
        );
      } catch {
        console.warn("Backend sync for approve failed");
      }
    }
  };

  const handleRevoke = async () => {
    // Update localStorage immediately (optimistic)
    revokeUser(localUser.id);
    setLocalUser((u) => ({
      ...u,
      status: "revoked" as const,
      accessCode: undefined,
    }));
    toast.success(`${localUser.name}'s access revoked`);
    onRefresh();
    // Sync to backend if available
    if (actor) {
      try {
        await (actor as any).adminRevokeUser(
          localUser.id,
          "AYURNEXIS-ADMIN-TOKEN-2026",
        );
      } catch {
        console.warn("Backend sync for revoke failed");
      }
    }
  };

  const handleReactivate = async () => {
    // Update localStorage immediately (optimistic)
    approveUser(localUser.id);
    setLocalUser((u) => ({ ...u, status: "approved" as const }));
    toast.success(`${localUser.name} reactivated`);
    onRefresh();
    // Sync to backend if available
    if (actor) {
      try {
        await (actor as any).adminApproveUser(
          localUser.id,
          "AYURNEXIS-ADMIN-TOKEN-2026",
        );
      } catch {
        console.warn("Backend sync for reactivate failed");
      }
    }
  };

  const handleGenerateCode = async () => {
    // Generate code locally first (works offline)
    const localCode = generateCodeForUser(localUser.id);
    setLocalUser((u) => ({
      ...u,
      accessCode: localCode,
      codeGeneratedAt: Date.now(),
    }));
    setGeneratedCode(localCode);
    setShowCodeModal(true);
    onRefresh();
    // Try to sync with backend
    if (!actor) return;
    try {
      const result = await (actor as any).adminGenerateCode(
        localUser.id,
        "AYURNEXIS-ADMIN-TOKEN-2026",
      );
      // Handle both Candid array format and Option object format
      let code: string | undefined;
      if (Array.isArray(result)) {
        code = result.length > 0 ? String(result[0]) : undefined;
      } else if (result?.__kind__ === "Some") {
        code = result.value;
      }
      if (code && code !== localCode) {
        // Backend returned a different code - use it
        generateCodeForUser(localUser.id); // re-save with new code not available, keep local
      }
    } catch {
      console.warn("Backend sync for generate code failed, using local code");
    }
  };

  const statusBadge = {
    pending: (
      <Badge
        style={{
          background: "oklch(0.88 0.10 78 / 0.2)",
          color: "oklch(0.45 0.12 78)",
          border: "1px solid oklch(0.72 0.130 78 / 0.4)",
        }}
      >
        Pending
      </Badge>
    ),
    approved: (
      <Badge
        style={{
          background: "oklch(0.42 0.14 145 / 0.1)",
          color: "oklch(0.32 0.10 145)",
          border: "1px solid oklch(0.42 0.14 145 / 0.3)",
        }}
      >
        Approved
      </Badge>
    ),
    revoked: (
      <Badge
        style={{
          background: "oklch(0.54 0.174 24 / 0.1)",
          color: "oklch(0.44 0.14 24)",
          border: "1px solid oklch(0.54 0.174 24 / 0.3)",
        }}
      >
        Revoked
      </Badge>
    ),
  }[localUser.status];

  return (
    <div
      data-ocid="admin.users.card"
      className="rounded-xl p-4"
      style={{
        background: "oklch(1.0 0 0)",
        border: "1px solid oklch(0.88 0.012 240)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm">
              {localUser.name}
            </span>
            {statusBadge}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {localUser.institution}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {localUser.email}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 italic line-clamp-1">
            {localUser.purpose}
          </p>
        </div>
        <div className="flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
            style={{
              background: "oklch(0.72 0.130 78 / 0.15)",
              color: "oklch(0.42 0.14 145)",
            }}
          >
            {localUser.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {localUser.status === "approved" && localUser.accessCode && (
        <div
          className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: "oklch(0.97 0.004 240)",
            border: "1px solid oklch(0.88 0.012 240)",
          }}
        >
          <Key size={11} className="text-gold" />
          <span className="text-muted-foreground">Code: </span>
          <span className="font-mono font-bold text-foreground">••••••</span>
          {isCodeExpired && (
            <span className="text-red-500 text-[10px] ml-1">Expired</span>
          )}
          {!isCodeExpired && codeExpiry && (
            <span className="text-muted-foreground text-[10px] ml-1">
              Expires{" "}
              {codeExpiry.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        {localUser.status === "pending" && (
          <>
            <Button
              data-ocid="admin.users.approve_button"
              size="sm"
              className="h-7 text-xs px-3 bg-primary text-primary-foreground"
              onClick={handleApprove}
            >
              <UserCheck size={12} className="mr-1" /> Approve
            </Button>
            <Button
              data-ocid="admin.users.delete_button"
              size="sm"
              variant="outline"
              className="h-7 text-xs px-3 text-red-500 border-red-200 hover:bg-red-50"
              onClick={handleRevoke}
            >
              <XCircle size={12} className="mr-1" /> Reject
            </Button>
          </>
        )}
        {localUser.status === "approved" && (
          <>
            <Button
              data-ocid="admin.users.generate_code_button"
              size="sm"
              className="h-7 text-xs px-3"
              style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
              onClick={handleGenerateCode}
            >
              <Key size={12} className="mr-1" />
              {localUser.accessCode ? "Regenerate Code" : "Generate Code"}
            </Button>
            <Button
              data-ocid="admin.users.delete_button"
              size="sm"
              variant="outline"
              className="h-7 text-xs px-3 text-red-500 border-red-200 hover:bg-red-50"
              onClick={handleRevoke}
            >
              <UserMinus size={12} className="mr-1" /> Revoke
            </Button>
          </>
        )}
        {localUser.status === "revoked" && (
          <Button
            data-ocid="admin.users.save_button"
            size="sm"
            variant="outline"
            className="h-7 text-xs px-3"
            onClick={handleReactivate}
          >
            <RefreshCw size={12} className="mr-1" /> Reactivate
          </Button>
        )}

        {(localUser.claimedFormulations?.length ?? 0) > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Claimed Formulations ({localUser.claimedFormulations!.length})
            </div>
            <div className="space-y-1.5">
              {localUser.claimedFormulations!.map((cf) => (
                <div
                  key={cf.id}
                  className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: "oklch(0.42 0.14 145 / 0.08)",
                    border: "1px solid oklch(0.42 0.14 145 / 0.2)",
                  }}
                >
                  <span className="font-semibold text-foreground">
                    {cf.disease}
                  </span>
                  <Badge style={{ fontSize: 9 }}>{cf.dosageForm}</Badge>
                  <Badge
                    style={{
                      fontSize: 9,
                      background: "oklch(0.50 0.10 240 / 0.1)",
                    }}
                  >
                    {cf.drugType}
                  </Badge>
                  <span className="text-muted-foreground flex-1 min-w-0 truncate">
                    {cf.compositionName}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {new Date(cf.claimedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(localUser.activityLog?.length ?? 0) > 0 && (
          <button
            type="button"
            data-ocid="admin.users.activity_toggle"
            className="h-7 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 transition-colors"
            onClick={() => setShowLog(!showLog)}
          >
            {showLog ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Activity ({localUser.activityLog?.length})
          </button>
        )}
      </div>

      {/* Activity log */}
      {showLog && localUser.activityLog && localUser.activityLog.length > 0 && (
        <div
          className="mt-3 rounded-lg p-3"
          style={{
            background: "oklch(0.97 0.004 240)",
            border: "1px solid oklch(0.88 0.012 240)",
          }}
        >
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Activity Log
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {[...localUser.activityLog].reverse().map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                className="flex items-center gap-2 text-[10px] text-muted-foreground"
              >
                <span className="text-foreground font-medium">
                  {entry.module}
                </span>
                <span>—</span>
                <span>{entry.action}</span>
                <span className="ml-auto">
                  {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCodeModal && generatedCode && (
        <CodeModal
          user={{ ...localUser }}
          code={generatedCode}
          onClose={() => setShowCodeModal(false)}
        />
      )}
    </div>
  );
}

export function AdminDashboard() {
  const [authed, setAuthed] = useState(isAdminAuthed);
  const [users, setUsers] = useState<UserRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "approved" | "revoked"
  >("all");
  const { actor } = useActor();
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshUsers = async () => {
    // 1. Load from localStorage immediately so users are always shown
    const localUsers = getAllUsers();
    if (localUsers.length > 0) {
      setUsers(localUsers);
    }
    setLoading(true);
    setLoadError(null);
    // 2. Try backend in background
    try {
      if (actor) {
        const records = await (actor as any).getAccessRequests(
          "AYURNEXIS-ADMIN-TOKEN-2026",
        );
        if (Array.isArray(records) && records.length > 0) {
          // Merge backend into localStorage (backend takes precedence)
          mergeBackendUsers(records);
          const merged = getAllUsers();
          setUsers(merged);
        } else if (Array.isArray(records)) {
          // Backend returned empty — still show local users
          if (localUsers.length === 0) setUsers([]);
        }
      } else {
        // No actor — show inline warning but keep local users displayed
        if (localUsers.length === 0) {
          setLoadError("Showing locally cached users. Backend sync failed.");
        } else {
          setLoadError("Showing locally cached users. Backend sync failed.");
        }
      }
    } catch (err) {
      console.error("Backend sync failed:", err);
      // Show subtle inline warning, not a blocking error
      setLoadError("Showing locally cached users. Backend sync failed.");
      // Keep whatever users we already loaded from localStorage
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!authed) return;
    const timer = setTimeout(() => {
      refreshUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [authed, actor]);

  const handleLogout = () => {
    setAdminAuthed(false);
    setAuthed(false);
  };

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "all" || u.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const counts = {
    total: users.length,
    pending: users.filter((u) => u.status === "pending").length,
    approved: users.filter((u) => u.status === "approved").length,
    revoked: users.filter((u) => u.status === "revoked").length,
  };

  const stats = [
    {
      label: "Total Requests",
      value: counts.total,
      icon: Users,
      color: "oklch(0.55 0.14 200)",
    },
    {
      label: "Pending",
      value: counts.pending,
      icon: Users,
      color: "oklch(0.68 0.13 78)",
    },
    {
      label: "Approved",
      value: counts.approved,
      icon: UserCheck,
      color: "oklch(0.42 0.14 145)",
    },
    {
      label: "Revoked",
      value: counts.revoked,
      icon: XCircle,
      color: "oklch(0.54 0.174 24)",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.97 0.004 240)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-4"
        style={{
          background: "oklch(0.99 0.003 240 / 0.97)",
          borderBottom: "1px solid oklch(0.88 0.012 240)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.42 0.14 145 / 0.12)",
              border: "1px solid oklch(0.42 0.14 145 / 0.3)",
            }}
          >
            <Shield size={16} style={{ color: "oklch(0.42 0.14 145)" }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-[10px] text-gold font-semibold tracking-wide">
              AyurNexis 3.1 Admin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{
              background: "oklch(0.42 0.14 145 / 0.08)",
              color: "oklch(0.42 0.14 145)",
              border: "1px solid oklch(0.42 0.14 145 / 0.2)",
            }}
          >
            <Leaf size={12} />
            <span className="hidden sm:inline">App</span>
          </a>
          <button
            type="button"
            data-ocid="admin.logout.button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-red-50"
            style={{
              color: "oklch(0.44 0.14 24)",
              border: "1px solid oklch(0.54 0.174 24 / 0.3)",
            }}
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <button
            type="button"
            onClick={refreshUsers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-blue-50"
            style={{
              color: "oklch(0.44 0.14 240)",
              border: "1px solid oklch(0.54 0.14 240 / 0.3)",
            }}
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                data-ocid="admin.stats.card"
                className="rounded-xl p-4"
                style={{
                  background: "oklch(1.0 0 0)",
                  border: "1px solid oklch(0.88 0.012 240)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {s.label}
                  </span>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                <div className="text-2xl font-bold" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Load error banner */}
        {loadError && (
          <div
            className="mb-2 p-3 rounded-lg flex items-center justify-between gap-3"
            style={{
              background: "oklch(0.88 0.10 78 / 0.15)",
              border: "1px solid oklch(0.72 0.13 78 / 0.3)",
            }}
          >
            <span className="text-sm" style={{ color: "oklch(0.40 0.10 78)" }}>
              {loadError}
            </span>
            <button
              type="button"
              onClick={refreshUsers}
              className="text-xs font-semibold px-3 py-1 rounded-lg"
              style={{ background: "oklch(0.68 0.13 78)", color: "white" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              data-ocid="admin.search.search_input"
              className="pl-8 h-9 text-sm"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "pending", "approved", "revoked"] as const).map((f) => (
              <button
                key={f}
                type="button"
                data-ocid={`admin.filter.${f}.tab`}
                onClick={() => setActiveFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={{
                  background:
                    activeFilter === f
                      ? "oklch(0.42 0.14 145)"
                      : "oklch(1.0 0 0)",
                  color: activeFilter === f ? "white" : "oklch(0.45 0.015 240)",
                  border: `1px solid ${
                    activeFilter === f
                      ? "oklch(0.42 0.14 145)"
                      : "oklch(0.88 0.012 240)"
                  }`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div
              data-ocid="admin.users.empty_state"
              className="text-center py-12 text-muted-foreground text-sm"
            >
              {search || activeFilter !== "all"
                ? "No users match your filter."
                : "No access requests yet."}
            </div>
          )}
          {filtered.map((user) => (
            <UserCard key={user.id} user={user} onRefresh={refreshUsers} />
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t text-center text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} AyurNexis 3.1 Admin · Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}

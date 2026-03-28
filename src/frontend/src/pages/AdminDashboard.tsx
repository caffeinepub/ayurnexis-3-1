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
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Key,
  Leaf,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import {
  type UserRegistration,
  backendUserToLocal,
  isAdminAuthed,
  setAdminAuthed,
} from "../utils/accessControl";

const ADMIN_TOKEN = "AYURNEXIS-ADMIN-TOKEN-2026";

// ─── Admin Login ───────────────────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === ADMIN_TOKEN) {
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

// ─── Code Modal ────────────────────────────────────────────────────────

function CodeModal({
  user,
  code,
  onClose,
}: {
  user: UserRegistration;
  code: string;
  onClose: () => void;
}) {
  const days = user.codeExpiryDays ?? 30;
  const expiry = user.codeGeneratedAt
    ? new Date(
        user.codeGeneratedAt + days * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm"
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
          <p className="text-sm text-muted-foreground">
            Share this code with{" "}
            <span className="font-semibold text-foreground">{user.name}</span>
          </p>
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{
              background: "oklch(0.42 0.14 145 / 0.08)",
              border: "2px solid oklch(0.42 0.14 145 / 0.3)",
            }}
          >
            <span
              className="text-3xl font-mono font-bold tracking-widest"
              style={{ color: "oklch(0.42 0.14 145)" }}
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
            Valid for {days} {days === 1 ? "day" : "days"} · Expires {expiry}
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

// ─── User Card ───────────────────────────────────────────────────────────

function UserCard({
  user: initialUser,
  onRefresh,
}: { user: UserRegistration; onRefresh: () => void }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showDaysInput, setShowDaysInput] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);
  const [showActivity, setShowActivity] = useState(false);

  const getUserActivity = () => {
    const activities: { time: string; label: string }[] = [];
    try {
      const fRaw = localStorage.getItem("ayurnexis_formulations");
      const formulations: any[] = fRaw ? JSON.parse(fRaw) : [];
      for (const f of formulations) {
        if (f.ownerName && f.ownerName === user.name) {
          const dt = f.createdAt
            ? new Date(Number(f.createdAt) || f.createdAt)
            : null;
          activities.push({
            time: dt
              ? dt.toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—",
            label: `Formulation: ${f.name || "Unnamed"} | ${f.dosageForm || "—"} | ${(f.stabilityScore ?? 75) >= 70 ? "Approved" : "Not Approved"}`,
          });
        }
      }
      const bRaw = localStorage.getItem("ayurnexis_batches");
      const batches: any[] = bRaw ? JSON.parse(bRaw) : [];
      for (const b of batches) {
        if (b.submittedBy && b.submittedBy === user.name) {
          const dt = b.dateReceived
            ? new Date(Number(b.dateReceived) || b.dateReceived)
            : null;
          activities.push({
            time: dt
              ? dt.toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—",
            label: `Batch: ${b.batchId || "—"} | ${b.herbName || "—"} | ${b.status || "—"}`,
          });
        }
      }
    } catch {}
    activities.sort((a, b) => b.time.localeCompare(a.time));
    return activities;
  };

  const days = user.codeExpiryDays ?? 30;
  const codeExpiry = user.codeGeneratedAt
    ? new Date(user.codeGeneratedAt + days * 24 * 60 * 60 * 1000)
    : null;
  const isCodeExpired = codeExpiry ? codeExpiry < new Date() : false;

  // All admin actions call backend directly
  const callBackend = async <T,>(
    fn: (actor: any) => Promise<T>,
  ): Promise<T | null> => {
    try {
      const actor = await createActorWithConfig();
      return await fn(actor);
    } catch (err) {
      console.error("Backend call failed:", err);
      toast.error("Backend call failed. Please try again.");
      return null;
    }
  };

  const handleApprove = async () => {
    setLoading("approve");
    const ok = await callBackend((a) =>
      a.adminApproveUser(user.id, ADMIN_TOKEN),
    );
    setLoading(null);
    if (ok === true) {
      setUser((u) => ({
        ...u,
        status: "approved" as const,
        approvedAt: Date.now(),
      }));
      toast.success(`${user.name} approved`);
      onRefresh();
    } else {
      toast.error("Failed to approve. Please refresh and try again.");
    }
  };

  const handleRevoke = async () => {
    setLoading("revoke");
    const ok = await callBackend((a) =>
      a.adminRevokeUser(user.id, ADMIN_TOKEN),
    );
    setLoading(null);
    if (ok === true) {
      setUser((u) => ({
        ...u,
        status: "revoked" as const,
        accessCode: undefined,
      }));
      toast.success(`${user.name}'s access revoked`);
      onRefresh();
    } else {
      toast.error("Failed to revoke. Please refresh and try again.");
    }
  };

  const handleReactivate = async () => {
    setLoading("reactivate");
    const ok = await callBackend((a) =>
      a.adminApproveUser(user.id, ADMIN_TOKEN),
    );
    setLoading(null);
    if (ok === true) {
      setUser((u) => ({ ...u, status: "approved" as const }));
      toast.success(`${user.name} reactivated`);
      onRefresh();
    } else {
      toast.error("Failed to reactivate. Please refresh and try again.");
    }
  };

  const handleGenerateCode = async () => {
    setShowDaysInput(false);
    setLoading("code");
    const result = await callBackend((a) =>
      a.adminGenerateCode(user.id, ADMIN_TOKEN, BigInt(expiryDays)),
    );
    setLoading(null);

    let code: string | undefined;
    if (Array.isArray(result) && result.length > 0) code = String(result[0]);
    else if (
      result &&
      typeof result === "object" &&
      "__kind__" in result &&
      (result as any).__kind__ === "Some"
    )
      code = String((result as any).value);

    if (code) {
      const now = Date.now();
      setUser((u) => ({
        ...u,
        accessCode: code,
        codeGeneratedAt: now,
        codeExpiryDays: expiryDays,
        status: "approved" as const,
      }));
      setGeneratedCode(code);
      setShowCodeModal(true);
      onRefresh();
    } else {
      toast.error("Failed to generate code. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete ${user.name}'s request permanently? This cannot be undone.`,
      )
    )
      return;
    setLoading("delete");
    const ok = await callBackend((a) =>
      a.adminDeleteUser(user.id, ADMIN_TOKEN),
    );
    setLoading(null);
    if (ok === true) {
      toast.success(`${user.name}'s request deleted`);
      onRefresh(); // will remove from list
    } else {
      toast.error("Failed to delete. Please try again.");
    }
  };

  const statusBadge = {
    pending: (
      <Badge
        style={{
          background: "oklch(0.72 0.130 78 / 0.15)",
          color: "oklch(0.50 0.12 78)",
          border: "1px solid oklch(0.72 0.130 78 / 0.3)",
        }}
      >
        Pending
      </Badge>
    ),
    approved: (
      <Badge
        style={{
          background: "oklch(0.42 0.14 145 / 0.15)",
          color: "oklch(0.35 0.13 145)",
          border: "1px solid oklch(0.42 0.14 145 / 0.3)",
        }}
      >
        Approved
      </Badge>
    ),
    revoked: (
      <Badge
        style={{
          background: "oklch(0.55 0.20 25 / 0.15)",
          color: "oklch(0.45 0.18 25)",
          border: "1px solid oklch(0.55 0.20 25 / 0.3)",
        }}
      >
        Revoked
      </Badge>
    ),
  }[user.status];

  const isLoading = loading !== null;

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
              {user.name}
            </span>
            {statusBadge}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {user.institution}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5 italic line-clamp-1">
            {user.purpose}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Joined:{" "}
            <span className="font-medium text-foreground">
              {new Date(user.registeredAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
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
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Code info */}
      {user.status === "approved" && user.accessCode && (
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
          {!isCodeExpired &&
            codeExpiry &&
            (() => {
              const remMs = codeExpiry.getTime() - Date.now();
              const remDays = Math.ceil(remMs / 86400000);
              return (
                <span
                  className={`text-[10px] ml-1 font-semibold ${
                    remDays <= 2
                      ? "text-red-500"
                      : remDays <= 7
                        ? "text-amber-500"
                        : "text-green-600"
                  }`}
                >
                  {remDays}d left
                </span>
              );
            })()}
          {!isCodeExpired && codeExpiry && (
            <span className="text-muted-foreground text-[10px] ml-1">
              (Expires{" "}
              {codeExpiry.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
              )
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        {user.status === "pending" && (
          <>
            <Button
              data-ocid="admin.users.approve_button"
              size="sm"
              className="h-7 text-xs px-3 bg-primary text-primary-foreground"
              disabled={isLoading}
              onClick={handleApprove}
            >
              {loading === "approve" ? (
                <Loader2 size={11} className="mr-1 animate-spin" />
              ) : (
                <UserCheck size={12} className="mr-1" />
              )}
              Approve
            </Button>
            <Button
              data-ocid="admin.users.delete_button"
              size="sm"
              variant="outline"
              className="h-7 text-xs px-3 text-red-500 border-red-200 hover:bg-red-50"
              disabled={isLoading}
              onClick={handleRevoke}
            >
              <XCircle size={12} className="mr-1" /> Reject
            </Button>
          </>
        )}

        {user.status === "approved" && (
          <>
            {showDaysInput ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={expiryDays}
                  onChange={(e) =>
                    setExpiryDays(
                      Math.max(1, Math.min(365, Number(e.target.value))),
                    )
                  }
                  className="h-7 w-20 text-xs rounded-md border px-2 outline-none"
                  style={{ border: "1px solid oklch(0.42 0.14 145 / 0.4)" }}
                  placeholder="Days"
                />
                <span className="text-xs text-muted-foreground">days</span>
                <Button
                  data-ocid="admin.users.generate_code_button"
                  size="sm"
                  className="h-7 text-xs px-3"
                  style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
                  disabled={isLoading}
                  onClick={handleGenerateCode}
                >
                  {loading === "code" ? (
                    <Loader2 size={11} className="mr-1 animate-spin" />
                  ) : (
                    <Key size={12} className="mr-1" />
                  )}
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2"
                  onClick={() => setShowDaysInput(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                data-ocid="admin.users.generate_code_button"
                size="sm"
                className="h-7 text-xs px-3"
                style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
                disabled={isLoading}
                onClick={() => setShowDaysInput(true)}
              >
                <Key size={12} className="mr-1" />
                {user.accessCode ? "Regenerate Code" : "Generate Code"}
              </Button>
            )}
            <Button
              data-ocid="admin.users.delete_button"
              size="sm"
              variant="outline"
              className="h-7 text-xs px-3 text-red-500 border-red-200 hover:bg-red-50"
              disabled={isLoading}
              onClick={handleRevoke}
            >
              {loading === "revoke" ? (
                <Loader2 size={11} className="mr-1 animate-spin" />
              ) : (
                <UserMinus size={12} className="mr-1" />
              )}
              Revoke
            </Button>
          </>
        )}

        {user.status === "revoked" && (
          <Button
            data-ocid="admin.users.save_button"
            size="sm"
            variant="outline"
            className="h-7 text-xs px-3"
            disabled={isLoading}
            onClick={handleReactivate}
          >
            {loading === "reactivate" ? (
              <Loader2 size={11} className="mr-1 animate-spin" />
            ) : (
              <RefreshCw size={12} className="mr-1" />
            )}
            Reactivate
          </Button>
        )}

        <Button
          data-ocid="admin.users.delete_request_button"
          size="sm"
          variant="outline"
          className="h-7 text-xs px-3 text-red-500 border-red-200 hover:bg-red-50 ml-auto"
          disabled={isLoading}
          onClick={handleDelete}
        >
          {loading === "delete" ? (
            <Loader2 size={11} className="mr-1 animate-spin" />
          ) : (
            <Trash2 size={12} className="mr-1" />
          )}
          Delete Request
        </Button>
        <Button
          data-ocid="admin.users.activity_button"
          size="sm"
          variant="outline"
          className="h-7 text-xs px-3 text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => setShowActivity((v) => !v)}
        >
          <Activity size={12} className="mr-1" />
          Activity
          {showActivity ? (
            <ChevronUp size={11} className="ml-1" />
          ) : (
            <ChevronDown size={11} className="ml-1" />
          )}
        </Button>
      </div>

      {showActivity && (
        <div
          className="mt-3 rounded-xl p-3 space-y-2"
          style={{
            background: "oklch(0.97 0.004 240)",
            border: "1px solid oklch(0.88 0.012 240)",
          }}
        >
          <p className="text-xs font-semibold text-foreground mb-2">
            User Activity Log
          </p>
          {(() => {
            const acts = getUserActivity();
            if (acts.length === 0) {
              return (
                <p className="text-xs text-muted-foreground">
                  No activity recorded yet.
                </p>
              );
            }
            return acts.map((act, i) => (
              <div key={`${act.time}-${i}`} className="flex gap-3 text-xs">
                <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                  {act.time}
                </span>
                <span className="text-foreground">{act.label}</span>
              </div>
            ));
          })()}
        </div>
      )}

      {showCodeModal && generatedCode && (
        <CodeModal
          user={user}
          code={generatedCode}
          onClose={() => setShowCodeModal(false)}
        />
      )}
    </div>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────

export function AdminDashboard() {
  const [authed, setAuthed] = useState(isAdminAuthed());
  const [users, setUsers] = useState<UserRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "approved" | "revoked"
  >("all");

  // Load users exclusively from backend
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setBackendError("");
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          setBackendError(`Auto-retrying… (${attempt}/${MAX_RETRIES - 1})`);
          await new Promise((r) => setTimeout(r, 3000));
        }
        const actor = await createActorWithConfig();
        const records: any[] = await actor.getAccessRequests(ADMIN_TOKEN);
        const parsed: UserRegistration[] = records.map(backendUserToLocal);
        // Sort newest first
        parsed.sort((a, b) => b.registeredAt - a.registeredAt);
        setUsers(parsed);
        setBackendError("");
        console.log(`Admin panel: loaded ${parsed.length} users from backend`);
        setLoading(false);
        return;
      } catch (err) {
        console.warn(
          `Admin load attempt ${attempt + 1}/${MAX_RETRIES} failed:`,
          err,
        );
        if (attempt === MAX_RETRIES - 1) {
          setBackendError(
            "Could not reach backend. Check your connection and click Refresh.",
          );
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) loadUsers();
  }, [authed, loadUsers]);

  const handleLogout = () => {
    setAdminAuthed(false);
    setAuthed(false);
    setUsers([]);
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

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.97 0.004 240)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 md:px-6 py-3 flex items-center justify-between gap-4"
        style={{
          background: "oklch(1.0 0 0)",
          borderBottom: "1px solid oklch(0.88 0.012 240)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.42 0.14 145 / 0.12)" }}
          >
            <Leaf size={16} style={{ color: "oklch(0.42 0.14 145)" }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-none">
              Admin Panel
            </h1>
            <p className="text-[10px] text-muted-foreground">AyurNexis 3.1</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="admin.refresh_button"
            size="sm"
            variant="outline"
            className="h-8 text-xs px-3 gap-1.5"
            disabled={loading}
            onClick={loadUsers}
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            Refresh
          </Button>
          <Button
            data-ocid="admin.logout_button"
            size="sm"
            variant="ghost"
            className="h-8 text-xs px-2 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut size={12} className="mr-1" /> Logout
          </Button>
          <a
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
          >
            ← App
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Backend error */}
        {backendError && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "oklch(0.95 0.03 25)",
              border: "1px solid oklch(0.70 0.10 25 / 0.4)",
              color: "oklch(0.45 0.15 25)",
            }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Backend unavailable</p>
              <p className="text-xs mt-0.5">{backendError}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2 flex-shrink-0"
              onClick={loadUsers}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {(
            [
              { label: "Total", count: counts.total, filter: "all" as const },
              {
                label: "Pending",
                count: counts.pending,
                filter: "pending" as const,
              },
              {
                label: "Active",
                count: counts.approved,
                filter: "approved" as const,
              },
              {
                label: "Revoked",
                count: counts.revoked,
                filter: "revoked" as const,
              },
            ] as const
          ).map(({ label, count, filter }) => (
            <button
              key={filter}
              type="button"
              data-ocid={`admin.filter.${filter}`}
              onClick={() => setActiveFilter(filter)}
              className="rounded-xl p-3 text-center transition-all"
              style={{
                background:
                  activeFilter === filter
                    ? "oklch(0.42 0.14 145 / 0.1)"
                    : "oklch(1.0 0 0)",
                border:
                  activeFilter === filter
                    ? "1.5px solid oklch(0.42 0.14 145 / 0.5)"
                    : "1px solid oklch(0.88 0.012 240)",
              }}
            >
              <p className="text-xl font-bold text-foreground">{count}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{
            background: "oklch(1.0 0 0)",
            border: "1px solid oklch(0.88 0.012 240)",
          }}
        >
          <Search size={14} className="text-muted-foreground" />
          <input
            data-ocid="admin.search.input"
            type="text"
            placeholder="Search by name or email…"
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* User list */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: "oklch(0.42 0.14 145)" }}
            />
            <span className="ml-3 text-sm text-muted-foreground">
              Loading users from backend…
            </span>
          </div>
        )}

        {!loading && !backendError && users.length === 0 && (
          <div className="text-center py-12">
            <Users
              size={32}
              className="mx-auto mb-3"
              style={{ color: "oklch(0.75 0.01 240)" }}
            />
            <p className="text-sm font-medium text-muted-foreground">
              No access requests yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              When users submit registration forms, they will appear here.
            </p>
          </div>
        )}

        {!loading && filtered.length === 0 && users.length > 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No users match your filter.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((u) => (
            <UserCard key={u.id} user={u} onRefresh={loadUsers} />
          ))}
        </div>
      </div>
    </div>
  );
}

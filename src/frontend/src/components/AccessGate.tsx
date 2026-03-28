import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Leaf,
  Loader2,
  Lock,
  RefreshCw,
  Shield,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import {
  type UserRegistration,
  getCodeRemainingDays,
  getCurrentAccessLevel,
  getCurrentUser,
  getCurrentUserId,
  saveCodeExpiry,
  saveCurrentUser,
  setAccessLevel,
  setAdminAuthed,
} from "../utils/accessControl";

interface AccessGateProps {
  children: React.ReactNode;
}

const ADMIN_TOKEN = "AYURNEXIS-ADMIN-TOKEN-2026";

export function AccessGate({ children }: AccessGateProps) {
  const [accessLevel, setAccessLevelState] = useState<
    "none" | "readonly" | "full"
  >(() => getCurrentAccessLevel());
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");

  // Registration form
  const [regName, setRegName] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPurpose, setRegPurpose] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  // Code entry
  const [codeEmail, setCodeEmail] = useState("");
  const [codeValue, setCodeValue] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  // Activation popup
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const [activationDays, setActivationDays] = useState(0);

  // Expiry warning popup
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [expiryRemainingDays, setExpiryRemainingDays] = useState(0);

  // Resend
  const [resendLoading, setResendLoading] = useState(false);

  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const level = getCurrentAccessLevel();
    setAccessLevelState(level);

    if (level === "full") {
      const userId = getCurrentUserId();
      if (userId) {
        // Check expiry warning from locally stored code info
        const remaining = getCodeRemainingDays(userId);
        if (remaining > 0 && remaining <= 2) {
          setExpiryRemainingDays(remaining);
          setShowExpiryWarning(true);
        }
        // Check revocation from backend
        (async () => {
          try {
            const actor = await createActorWithConfig();
            const status = await (actor as any).checkUserAccess(userId);
            if (status === "revoked" || status === "expired") {
              setAccessLevel("readonly");
              setAccessLevelState("readonly");
              toast.error(
                status === "expired"
                  ? "Your access code has expired. Contact your administrator to renew."
                  : "Your access has been revoked. Contact your administrator.",
              );
            }
          } catch {
            // Backend unreachable — keep current access
          }
        })();
      }
    }
  }, []);

  // ─── Registration ────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    if (
      !regName.trim() ||
      !regInstitution.trim() ||
      !regEmail.trim() ||
      !regPurpose.trim()
    ) {
      setRegError("Please fill in all fields.");
      return;
    }
    setRegLoading(true);
    setRegError("");

    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newUser: UserRegistration = {
      id: userId,
      name: regName.trim(),
      institution: regInstitution.trim(),
      email: regEmail.trim(),
      purpose: regPurpose.trim(),
      registeredAt: Date.now(),
      status: "pending",
      activityLog: [],
      claimedFormulations: [],
    };

    // Try backend up to 3 times
    let saved = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 3000));
        const actor = await createActorWithConfig();
        const ok = await (actor as any).submitAccessRequest(
          userId,
          newUser.name,
          newUser.institution,
          newUser.email,
          newUser.purpose,
          BigInt(newUser.registeredAt),
        );
        if (ok === true || ok === false) {
          // false means user ID already exists (should not happen with fresh ID)
          saved = true;
          break;
        }
      } catch (err) {
        console.warn(`Registration attempt ${attempt + 1}/3 failed:`, err);
      }
    }

    if (!saved) {
      setRegError(
        "Could not reach server after 3 attempts. Please check your connection and try again.",
      );
      setRegLoading(false);
      return;
    }

    // Backend confirmed — save session and proceed
    saveCurrentUser(newUser);
    setAccessLevel("readonly");
    setAccessLevelState("readonly");
    toast.success(
      "Request submitted! You can browse in read-only mode. Admin will send you an access code.",
    );
    setRegLoading(false);
  };

  // ─── Resend Request ──────────────────────────────────────────────────────────

  const handleResendRequest = async () => {
    const existingUser = getCurrentUser();
    if (!existingUser) {
      toast.error("No registration data found. Please register first.");
      return;
    }

    setResendLoading(true);
    let sent = false;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 3000));
        const actor = await createActorWithConfig();
        // submitAccessRequest allows upsert for pending users
        await (actor as any).submitAccessRequest(
          existingUser.id,
          existingUser.name,
          existingUser.institution,
          existingUser.email,
          existingUser.purpose,
          BigInt(existingUser.registeredAt),
        );
        sent = true;
        break;
      } catch (err) {
        console.warn(`Resend attempt ${attempt + 1}/3 failed:`, err);
      }
    }

    setResendLoading(false);
    if (sent) {
      toast.success("Request resent to admin successfully!");
    } else {
      toast.error("Could not reach server. Please check your connection.");
    }
  };

  // ─── Code Entry ──────────────────────────────────────────────────────────────

  const handleCodeEntry = async () => {
    if (codeValue.length !== 6) {
      setCodeError("Please enter a 6-digit code");
      return;
    }
    if (!codeEmail.trim()) {
      setCodeError("Please enter your registered email");
      return;
    }

    setCodeLoading(true);
    setCodeError("");

    try {
      const actor = await createActorWithConfig();
      const result = await (actor as any).verifyUserCode(
        codeEmail.trim(),
        codeValue,
      );

      let userId: string | undefined;
      if (Array.isArray(result) && result.length > 0) {
        userId = String(result[0]);
      } else if (
        result &&
        typeof result === "object" &&
        "__kind__" in result &&
        (result as { __kind__: string }).__kind__ === "Some"
      ) {
        userId = String((result as { value: unknown }).value);
      }

      if (!userId) {
        setCodeError(
          "Invalid or expired code. Please check with your administrator.",
        );
        setCodeLoading(false);
        return;
      }

      // Code is valid — save session
      const user = getCurrentUser();
      if (user) {
        saveCurrentUser({ ...user, id: userId, status: "approved" });
      } else {
        // User registered from a different device — save minimal info
        saveCurrentUser({
          id: userId,
          name: codeEmail.trim().split("@")[0],
          institution: "",
          email: codeEmail.trim(),
          purpose: "",
          registeredAt: Date.now(),
          status: "approved",
        });
      }

      // Get expiry info and save locally for expiry warnings
      let remDays = 30;
      try {
        const expiryResult = await (actor as any).getUserCodeExpiry(
          codeEmail.trim(),
        );
        if (Array.isArray(expiryResult) && expiryResult.length > 0) {
          const [genAtNs, expDays] = expiryResult[0];
          const genAtMs = Math.round(Number(genAtNs) / 1_000_000);
          const days = Number(expDays);
          saveCodeExpiry(userId, genAtMs, days);
          remDays = Math.max(
            1,
            Math.ceil((genAtMs + days * 86400000 - Date.now()) / 86400000),
          );
        }
      } catch {
        // ignore — use default
      }

      setAccessLevel("full");
      setAccessLevelState("full");
      setShowCodeDialog(false);
      setActivationDays(remDays);
      setShowActivationPopup(true);
    } catch (err) {
      console.error("Code verification failed:", err);
      setCodeError("Could not reach server. Please try again.");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleCodeDigitChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const arr = codeValue.split("").concat(Array(6).fill("")).slice(0, 6);
    arr[idx] = digit;
    const newCode = arr.join("");
    setCodeValue(newCode);
    setCodeError("");
    if (digit && idx < 5) {
      codeInputs.current[idx + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !codeValue[idx] && idx > 0) {
      codeInputs.current[idx - 1]?.focus();
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_TOKEN) {
      setAdminAuthed(true);
      setAccessLevel("full");
      setAccessLevelState("full");
      toast.success("Admin access granted — Welcome to AyurNexis 3.1");
    } else {
      setAdminPasswordError("Incorrect password. Please try again.");
    }
  };

  // ─── Code dialog content (shared between locked and readonly views) ─────────

  const CodeDialogContent = () => (
    <div className="space-y-4 mt-2">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground">
          Registered Email
        </Label>
        <Input
          data-ocid="code_entry.email.input"
          type="email"
          className="mt-1"
          placeholder="your@email.com"
          value={codeEmail}
          onChange={(e) => {
            setCodeEmail(e.target.value);
            setCodeError("");
          }}
        />
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground">
          6-Digit Access Code
        </Label>
        <div className="flex gap-2 mt-2">
          {([0, 1, 2, 3, 4, 5] as const).map((i) => (
            <input
              key={i}
              ref={(el) => {
                codeInputs.current[i] = el;
              }}
              data-ocid={`code_entry.digit.input.${i + 1}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-10 h-12 text-center text-lg font-bold rounded-lg border focus:outline-none focus:ring-2"
              style={{
                background: "oklch(0.97 0.004 240)",
                borderColor: codeValue[i]
                  ? "oklch(0.42 0.14 145)"
                  : "oklch(0.88 0.012 240)",
                color: "oklch(0.14 0.02 250)",
              }}
              value={codeValue[i] || ""}
              onChange={(e) => handleCodeDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(i, e)}
            />
          ))}
        </div>
        {codeError && (
          <p
            data-ocid="code_entry.error_state"
            className="text-xs text-red-500 mt-1"
          >
            {codeError}
          </p>
        )}
      </div>
      <Button
        data-ocid="code_entry.submit_button"
        className="w-full bg-primary text-primary-foreground font-semibold"
        disabled={codeLoading}
        onClick={handleCodeEntry}
      >
        {codeLoading ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" /> Verifying…
          </>
        ) : (
          "Unlock Access"
        )}
      </Button>
      <div
        className="pt-2 border-t"
        style={{ borderColor: "oklch(0.88 0.012 240)" }}
      >
        <p className="text-xs text-muted-foreground text-center mb-2">
          Haven&apos;t received a code yet?
        </p>
        <Button
          data-ocid="code_entry.resend_button"
          className="w-full font-semibold"
          variant="outline"
          disabled={resendLoading}
          onClick={handleResendRequest}
        >
          {resendLoading ? (
            <>
              <Loader2 size={13} className="mr-2 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <RefreshCw size={13} className="mr-2" />
              Resend Request to Admin
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // ─── Locked screen (no access yet) ───────────────────────────────────────

  if (accessLevel === "none") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
        style={{ background: "oklch(0.97 0.004 240)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "oklch(0.42 0.14 145 / 0.12)",
                border: "2px solid oklch(0.42 0.14 145 / 0.3)",
              }}
            >
              <Leaf size={28} style={{ color: "oklch(0.42 0.14 145)" }} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              AyurNexis 3.1
            </h1>
            <p className="text-xs text-gold font-semibold tracking-wider mt-0.5">
              PRECISION AYURVEDIC QA INTELLIGENCE
            </p>
          </div>

          {/* Registration card */}
          <div
            className="rounded-2xl p-6 mb-4"
            style={{
              background: "oklch(1.0 0 0)",
              border: "1px solid oklch(0.88 0.012 240)",
              boxShadow: "0 4px 24px oklch(0.14 0.02 250 / 0.08)",
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "oklch(0.72 0.130 78 / 0.12)",
                  border: "1px solid oklch(0.72 0.130 78 / 0.3)",
                }}
              >
                <Lock size={18} style={{ color: "oklch(0.68 0.13 78)" }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Request Access
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your request will be sent directly to the administrator
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  Full Name *
                </Label>
                <Input
                  data-ocid="access.name.input"
                  className="mt-1"
                  placeholder="Dr. Priya Sharma"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    setRegError("");
                  }}
                  disabled={regLoading}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  Institution / Organization *
                </Label>
                <Input
                  data-ocid="access.institution.input"
                  className="mt-1"
                  placeholder="PharmaTech Laboratories Pvt. Ltd."
                  value={regInstitution}
                  onChange={(e) => {
                    setRegInstitution(e.target.value);
                    setRegError("");
                  }}
                  disabled={regLoading}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  Email Address *
                </Label>
                <Input
                  data-ocid="access.email.input"
                  type="email"
                  className="mt-1"
                  placeholder="priya@pharmatech.in"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    setRegError("");
                  }}
                  disabled={regLoading}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  Purpose / Role *
                </Label>
                <Textarea
                  data-ocid="access.purpose.textarea"
                  className="mt-1 resize-none"
                  rows={2}
                  placeholder="QA Scientist — conducting herbal ingredient analysis research"
                  value={regPurpose}
                  onChange={(e) => {
                    setRegPurpose(e.target.value);
                    setRegError("");
                  }}
                  disabled={regLoading}
                />
              </div>

              {regError && (
                <div
                  className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: "oklch(0.95 0.03 25)",
                    border: "1px solid oklch(0.70 0.10 25 / 0.4)",
                    color: "oklch(0.45 0.15 25)",
                  }}
                >
                  <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <Button
                data-ocid="access.register.primary_button"
                className="w-full bg-primary text-primary-foreground font-semibold hover:opacity-90 mt-1"
                disabled={regLoading}
                onClick={handleRegister}
              >
                {regLoading ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Sending request…
                  </>
                ) : (
                  "Request Access"
                )}
              </Button>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              data-ocid="access.code_entry.link"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              onClick={() => setShowCodeDialog(true)}
            >
              Already have an access code? Enter it here
            </button>
          </div>

          {/* Admin Login */}
          <div className="mt-4">
            <button
              type="button"
              data-ocid="access.admin_login.toggle"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
              style={{
                background: showAdminLogin
                  ? "oklch(0.22 0.04 250 / 0.08)"
                  : "oklch(0.22 0.04 250 / 0.04)",
                border: "1px solid oklch(0.50 0.10 240 / 0.3)",
                color: "oklch(0.45 0.015 240)",
              }}
              onClick={() => {
                setShowAdminLogin(!showAdminLogin);
                setAdminPasswordError("");
              }}
            >
              <div className="flex items-center gap-2">
                <Shield size={14} style={{ color: "oklch(0.50 0.10 240)" }} />
                <span className="text-xs font-semibold">Admin Login</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {showAdminLogin ? "▲" : "▼"}
              </span>
            </button>

            {showAdminLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.2 }}
                className="rounded-b-xl px-4 pb-4 pt-3 space-y-3"
                style={{
                  background: "oklch(0.22 0.04 250 / 0.04)",
                  border: "1px solid oklch(0.50 0.10 240 / 0.2)",
                  borderTop: "none",
                }}
              >
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Admin Password
                  </Label>
                  <Input
                    data-ocid="admin_login.password.input"
                    type="password"
                    className="mt-1"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminPasswordError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  />
                  {adminPasswordError && (
                    <p
                      data-ocid="admin_login.error_state"
                      className="text-xs text-red-500 mt-1"
                    >
                      {adminPasswordError}
                    </p>
                  )}
                </div>
                <Button
                  data-ocid="admin_login.submit_button"
                  className="w-full font-semibold"
                  style={{
                    background: "oklch(0.35 0.08 250)",
                    color: "oklch(1.0 0 0)",
                  }}
                  onClick={handleAdminLogin}
                >
                  <Shield size={14} className="mr-2" />
                  Login as Admin
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Code dialog for locked screen */}
        <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
          <DialogContent
            className="max-w-sm mx-4"
            style={{
              background: "oklch(1.0 0 0)",
              border: "1px solid oklch(0.88 0.012 240)",
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield size={16} style={{ color: "oklch(0.42 0.14 145)" }} />
                Enter Access Code
              </DialogTitle>
            </DialogHeader>
            <CodeDialogContent />
          </DialogContent>
        </Dialog>

        {/* Plan Activated Popup */}
        {showActivationPopup && (
          <ActivationPopup
            days={activationDays}
            onClose={() => setShowActivationPopup(false)}
          />
        )}
      </div>
    );
  }

  // ─── Read-only / Full access layout ──────────────────────────────────

  return (
    <div className="relative flex flex-col h-screen">
      {/* Read-only banner */}
      <AnimatePresence>
        {accessLevel === "readonly" && !bannerDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-ocid="access.readonly.banner"
            className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            style={{
              background: "oklch(0.88 0.10 78 / 0.2)",
              borderBottom: "1px solid oklch(0.72 0.130 78 / 0.4)",
              color: "oklch(0.40 0.10 78)",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Lock size={14} className="flex-shrink-0" />
              <span className="text-xs font-medium truncate">
                You&apos;re browsing in <strong>read-only mode</strong>. Enter
                your 6-digit access code to unlock full features.
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                data-ocid="access.enter_code.button"
                className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                style={{
                  background: "oklch(0.68 0.13 78)",
                  color: "oklch(1.0 0 0)",
                }}
                onClick={() => setShowCodeDialog(true)}
              >
                Enter Code
              </button>
              <button
                type="button"
                data-ocid="access.banner_dismiss.button"
                onClick={() => setBannerDismissed(true)}
                className="p-1 rounded hover:bg-black/10 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>

      {/* Code dialog for readonly banner */}
      <Dialog
        open={showCodeDialog}
        onOpenChange={(v) => {
          setShowCodeDialog(v);
          if (!v) setBannerDismissed(false);
        }}
      >
        <DialogContent
          className="max-w-sm mx-4"
          style={{
            background: "oklch(1.0 0 0)",
            border: "1px solid oklch(0.88 0.012 240)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={16} style={{ color: "oklch(0.42 0.14 145)" }} />
              Enter Access Code
            </DialogTitle>
          </DialogHeader>
          <CodeDialogContent />
        </DialogContent>
      </Dialog>

      {/* Plan Activated Popup */}
      {showActivationPopup && (
        <ActivationPopup
          days={activationDays}
          onClose={() => setShowActivationPopup(false)}
        />
      )}

      {/* Expiry Warning Popup */}
      {showExpiryWarning && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="relative rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
            style={{
              background: "oklch(1.0 0 0)",
              border: "2px solid oklch(0.72 0.130 78 / 0.5)",
            }}
          >
            <div className="flex justify-center mb-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.72 0.130 78 / 0.12)" }}
              >
                <RefreshCw size={26} style={{ color: "oklch(0.50 0.12 78)" }} />
              </div>
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">
              Plan Expiring Soon
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              Your plan is going to expire in{" "}
              <span
                className="font-bold"
                style={{ color: "oklch(0.50 0.12 78)" }}
              >
                {expiryRemainingDays}{" "}
                {expiryRemainingDays === 1 ? "day" : "days"}
              </span>
              .
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Please contact your administrator to renew your access code.
            </p>
            <Button
              className="w-full font-semibold"
              style={{ background: "oklch(0.50 0.12 78)", color: "white" }}
              onClick={() => setShowExpiryWarning(false)}
            >
              OK, I&apos;ll Renew
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivationPopup({
  days,
  onClose,
}: { days: number; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div
        className="relative rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
        style={{
          background: "oklch(1.0 0 0)",
          border: "2px solid oklch(0.42 0.14 145 / 0.4)",
        }}
      >
        <div className="flex justify-center mb-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.42 0.14 145 / 0.1)" }}
          >
            <CheckCircle size={28} style={{ color: "oklch(0.42 0.14 145)" }} />
          </div>
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">
          Plan Activated!
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          Your plan is activated for{" "}
          <span className="font-bold" style={{ color: "oklch(0.42 0.14 145)" }}>
            {days} {days === 1 ? "day" : "days"}
          </span>
          .
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Welcome to AyurNexis 3.1 — Full access granted.
        </p>
        <Button
          className="w-full font-semibold"
          style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
          onClick={onClose}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}

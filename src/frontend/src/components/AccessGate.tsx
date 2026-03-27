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
import { Leaf, Lock, Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  getCurrentAccessLevel,
  getCurrentUser,
  registerUser,
  setAccessLevel,
  setAdminAuthed,
  verifyAccessCodeByEmail,
} from "../utils/accessControl";

interface AccessGateProps {
  children: React.ReactNode;
}

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

  // Code entry
  const [codeEmail, setCodeEmail] = useState("");
  const [codeValue, setCodeValue] = useState("");
  const [codeError, setCodeError] = useState("");
  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);
  const { actor, isFetching: actorLoading } = useActor();

  useEffect(() => {
    // Sync access level on mount
    setAccessLevelState(getCurrentAccessLevel());
  }, []);

  const handleRegister = async () => {
    if (
      !regName.trim() ||
      !regInstitution.trim() ||
      !regEmail.trim() ||
      !regPurpose.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    setRegLoading(true);
    try {
      // Save to localStorage FIRST — this always works regardless of backend state
      const newUser = registerUser({
        name: regName.trim(),
        institution: regInstitution.trim(),
        email: regEmail.trim(),
        purpose: regPurpose.trim(),
        activityLog: [],
        claimedFormulations: [],
      });
      setAccessLevelState("readonly");
      toast.success(
        "Registration submitted! You can now browse in read-only mode. Contact admin for your access code.",
      );
      // Fire-and-forget backend sync (non-blocking)
      if (actor) {
        (actor as any)
          .submitAccessRequest(
            newUser.id,
            regName.trim(),
            regInstitution.trim(),
            regEmail.trim(),
            regPurpose.trim(),
            BigInt(Date.now()),
          )
          .catch((err: unknown) => {
            console.warn("Backend sync failed (non-blocking):", err);
          });
      }
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error("Failed to register. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleCodeEntry = async () => {
    if (codeValue.length !== 6) {
      setCodeError("Please enter a 6-digit code");
      return;
    }
    if (!codeEmail.trim()) {
      setCodeError("Please enter your registered email");
      return;
    }
    try {
      let granted = false;
      // Try backend first if actor is available
      if (actor) {
        try {
          const result = await (actor as any).verifyUserCode(
            codeEmail.trim(),
            codeValue,
          );
          let userId: string | undefined;
          if (Array.isArray(result) && result.length > 0) {
            userId = String(result[0]);
          } else if (result && result.__kind__ === "Some") {
            userId = result.value;
          }
          if (userId) {
            localStorage.setItem("ayurnexis_current_user_id", userId);
            localStorage.setItem("ayurnexis_access_level", "full");
            setAccessLevel("full");
            setAccessLevelState("full");
            setShowCodeDialog(false);
            toast.success("Full access granted! Welcome to AyurNexis 3.1");
            granted = true;
          }
        } catch (backendErr) {
          console.warn(
            "Backend code verify failed, falling back to local:",
            backendErr,
          );
        }
      }
      // Fallback: check localStorage
      if (!granted) {
        const localResult = verifyAccessCodeByEmail(
          codeEmail.trim(),
          codeValue,
        );
        if (localResult.success) {
          setAccessLevel("full");
          setAccessLevelState("full");
          setShowCodeDialog(false);
          toast.success("Full access granted! Welcome to AyurNexis 3.1");
          granted = true;
        }
      }
      if (!granted) {
        setCodeError(
          "Invalid or expired code. Please check with your administrator.",
        );
      }
    } catch {
      setCodeError("Failed to verify code. Please try again.");
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
    if (adminPassword === "AYURNEXIS-ADMIN-TOKEN-2026") {
      setAdminAuthed(true);
      setAccessLevel("full");
      setAccessLevelState("full");
      toast.success("Admin access granted — Welcome to AyurNexis 3.1");
    } else {
      setAdminPasswordError("Incorrect password. Please try again.");
    }
  };

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

          {/* Lock card */}
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
                  Fill in your details to browse in read-only mode immediately
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
                  onChange={(e) => setRegName(e.target.value)}
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
                  onChange={(e) => setRegInstitution(e.target.value)}
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
                  onChange={(e) => setRegEmail(e.target.value)}
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
                  onChange={(e) => setRegPurpose(e.target.value)}
                />
              </div>

              <Button
                data-ocid="access.register.primary_button"
                className="w-full bg-primary text-primary-foreground font-semibold hover:opacity-90 mt-1"
                disabled={regLoading || actorLoading}
                onClick={handleRegister}
              >
                {actorLoading
                  ? "Connecting…"
                  : regLoading
                    ? "Submitting…"
                    : "Request Access"}
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

        {/* Code dialog */}
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
                  {(["d0", "d1", "d2", "d3", "d4", "d5"] as const).map(
                    (dk, i) => (
                      <input
                        key={dk}
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
                        onChange={(e) =>
                          handleCodeDigitChange(i, e.target.value)
                        }
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      />
                    ),
                  )}
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
                onClick={handleCodeEntry}
              >
                Unlock Access
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

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
          if (!v) {
            setBannerDismissed(false);
          }
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
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                Registered Email
              </Label>
              <Input
                data-ocid="code_entry2.email.input"
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
                {(["d0", "d1", "d2", "d3", "d4", "d5"] as const).map(
                  (dk, i) => (
                    <input
                      key={dk}
                      ref={(el) => {
                        codeInputs.current[i] = el;
                      }}
                      data-ocid={`code_entry2.digit.input.${i + 1}`}
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
                  ),
                )}
              </div>
              {codeError && (
                <p
                  data-ocid="code_entry2.error_state"
                  className="text-xs text-red-500 mt-1"
                >
                  {codeError}
                </p>
              )}
            </div>
            <Button
              data-ocid="code_entry2.submit_button"
              className="w-full bg-primary text-primary-foreground font-semibold"
              onClick={handleCodeEntry}
            >
              Unlock Access
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

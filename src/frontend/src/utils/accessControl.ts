// ─── Session-only localStorage. User records live in the backend canister. ───

export interface ClaimedFormulation {
  id: string;
  disease: string;
  dosageForm: string;
  drugType: string;
  compositionName: string;
  claimedAt: number;
  expiresAt: number;
}

export interface UserRegistration {
  id: string;
  name: string;
  institution: string;
  email: string;
  purpose: string;
  registeredAt: number;
  status: "pending" | "approved" | "revoked";
  accessCode?: string;
  codeGeneratedAt?: number;
  codeExpiryDays?: number;
  approvedAt?: number;
  activityLog?: ActivityEntry[];
  claimedFormulations?: ClaimedFormulation[];
}

export interface ActivityEntry {
  action: string;
  module: string;
  timestamp: number;
}

const CURRENT_USER_KEY = "ayurnexis_current_user_id";
const ACCESS_LEVEL_KEY = "ayurnexis_access_level";
const ADMIN_AUTHED_KEY = "ayurnexis_admin_authed";
const USER_DATA_KEY = "ayurnexis_user_data"; // current user's registration data
const LOCKED_FORMULATIONS_KEY = "ayurnexis_locked_formulations";
const CODE_EXPIRY_KEY = "ayurnexis_code_expiry"; // { [userId]: { genAt, days } }

// ─── Session ────────────────────────────────────────────────────────────────

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserId(id: string): void {
  localStorage.setItem(CURRENT_USER_KEY, id);
}

export function getCurrentUser(): UserRegistration | null {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: UserRegistration): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  localStorage.setItem(CURRENT_USER_KEY, user.id);
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(ACCESS_LEVEL_KEY);
}

export function getCurrentAccessLevel(): "none" | "readonly" | "full" {
  return (
    (localStorage.getItem(ACCESS_LEVEL_KEY) as "none" | "readonly" | "full") ||
    "none"
  );
}

export function setAccessLevel(level: "none" | "readonly" | "full"): void {
  localStorage.setItem(ACCESS_LEVEL_KEY, level);
}

export function setAdminAuthed(val: boolean): void {
  if (val) {
    localStorage.setItem(ADMIN_AUTHED_KEY, "1");
  } else {
    localStorage.removeItem(ADMIN_AUTHED_KEY);
  }
}

export function isAdminAuthed(): boolean {
  return localStorage.getItem(ADMIN_AUTHED_KEY) === "1";
}

// ─── Code expiry (stored per user ID on the device that verified the code) ──

interface CodeExpiry {
  genAt: number; // ms
  days: number;
}

function getCodeExpiryMap(): Record<string, CodeExpiry> {
  try {
    return JSON.parse(localStorage.getItem(CODE_EXPIRY_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveCodeExpiry(
  userId: string,
  genAtMs: number,
  days: number,
): void {
  const map = getCodeExpiryMap();
  map[userId] = { genAt: genAtMs, days };
  localStorage.setItem(CODE_EXPIRY_KEY, JSON.stringify(map));
}

export function getCodeRemainingDays(userId: string): number {
  const map = getCodeExpiryMap();
  const entry = map[userId];
  if (!entry) return 0;
  const expiresAt = entry.genAt + entry.days * 24 * 60 * 60 * 1000;
  const remaining = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(0, remaining);
}

// ─── Formulation locking ─────────────────────────────────────────────────────

export interface LockedFormulation {
  hash: string;
  lockedBy: string;
  lockedAt: number;
  formulationName: string;
}

function computeFormulationHash(
  ingredients: Array<{ name: string; quantity: number; unit: string }>,
): string {
  const sorted = [...ingredients].sort((a, b) => a.name.localeCompare(b.name));
  return sorted
    .map((i) => `${i.name.toLowerCase()}:${i.quantity}${i.unit}`)
    .join("|");
}

export function lockFormulation(
  ingredients: Array<{ name: string; quantity: number; unit: string }>,
  lockedBy: string,
  formulationName: string,
): void {
  const hash = computeFormulationHash(ingredients);
  const existing: LockedFormulation[] = JSON.parse(
    localStorage.getItem(LOCKED_FORMULATIONS_KEY) || "[]",
  );
  if (!existing.find((f) => f.hash === hash)) {
    existing.push({ hash, lockedBy, lockedAt: Date.now(), formulationName });
    localStorage.setItem(LOCKED_FORMULATIONS_KEY, JSON.stringify(existing));
  }
}

export function getFormulationLockInfo(
  ingredients: Array<{ name: string; quantity: number; unit: string }>,
): LockedFormulation | null {
  const hash = computeFormulationHash(ingredients);
  const existing: LockedFormulation[] = JSON.parse(
    localStorage.getItem(LOCKED_FORMULATIONS_KEY) || "[]",
  );
  return existing.find((f) => f.hash === hash) || null;
}

// ─── Activity log (stored locally for current user) ──────────────────────────

export function logActivity(action: string, module: string): void {
  const user = getCurrentUser();
  if (!user) return;
  if (!user.activityLog) user.activityLog = [];
  user.activityLog.push({ action, module, timestamp: Date.now() });
  if (user.activityLog.length > 100) {
    user.activityLog = user.activityLog.slice(-100);
  }
  saveCurrentUser(user);
}

// ─── Backend user record conversion ─────────────────────────────────────────

function getOptStr(v: unknown): string | undefined {
  if (!v) return undefined;
  if (Array.isArray(v)) return v.length > 0 ? String(v[0]) : undefined;
  if (
    v &&
    typeof v === "object" &&
    "__kind__" in v &&
    (v as { __kind__: string }).__kind__ === "Some"
  )
    return String((v as unknown as { value: unknown }).value);
  return undefined;
}

function getOptNum(v: unknown): number | undefined {
  if (!v && v !== 0) return undefined;
  if (Array.isArray(v)) return v.length > 0 ? Number(v[0]) : undefined;
  if (
    v &&
    typeof v === "object" &&
    "__kind__" in v &&
    (v as { __kind__: string }).__kind__ === "Some"
  )
    return Number((v as unknown as { value: unknown }).value);
  return undefined;
}

export function backendUserToLocal(r: {
  id: string;
  name: string;
  institution: string;
  email: string;
  purpose: string;
  registeredAt: bigint | number;
  status: string;
  accessCode: unknown;
  codeGeneratedAt: unknown;
  approvedAt: unknown;
  [key: string]: unknown;
}): UserRegistration {
  // registeredAt is passed from frontend as BigInt(Date.now()) — milliseconds
  const registeredAtMs = Number(r.registeredAt);
  // If the value looks like nanoseconds (> year 3000 in ms), convert
  const registeredAt =
    registeredAtMs > 32503680000000
      ? Math.round(registeredAtMs / 1_000_000)
      : registeredAtMs;

  const codeGenNs = getOptNum(r.codeGeneratedAt);
  // codeGeneratedAt from backend is nanoseconds (Prim.time())
  const codeGeneratedAt =
    codeGenNs !== undefined ? Math.round(codeGenNs / 1_000_000) : undefined;

  const approvedNs = getOptNum(r.approvedAt);
  const approvedAt =
    approvedNs !== undefined ? Math.round(approvedNs / 1_000_000) : undefined;

  // codeExpiryDays is not in UserRecord; it comes from getUserCodeExpiry separately.
  const codeExpiryDays = 30;

  return {
    id: r.id,
    name: r.name,
    institution: r.institution,
    email: r.email,
    purpose: r.purpose,
    registeredAt,
    status: r.status as "pending" | "approved" | "revoked",
    accessCode: getOptStr(r.accessCode),
    codeGeneratedAt,
    codeExpiryDays,
    approvedAt,
    activityLog: [],
    claimedFormulations: [],
  };
}

// ─── Legacy shims (used by pages that haven't been updated yet) ───────────────
// Keep these so existing imports don't break.

export function getAllUsers(): UserRegistration[] {
  return [];
}

export function saveAllUsers(_users: UserRegistration[]): void {
  // no-op — users live in backend now
}

export function mergeBackendUsers(_backendUsers: unknown[]): void {
  // no-op — admin panel loads directly from backend
}

export function approveUser(_userId: string): void {}
export function revokeUser(_userId: string): void {}
export function generateCodeForUser(
  _userId: string,
  _expiryDays?: number,
  _presetCode?: string,
): string {
  return "";
}

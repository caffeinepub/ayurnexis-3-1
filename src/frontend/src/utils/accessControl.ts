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
  codeExpiryDays?: number; // admin-set expiry in days
  approvedAt?: number;
  activityLog?: ActivityEntry[];
  claimedFormulations?: ClaimedFormulation[];
}

export interface ActivityEntry {
  action: string;
  module: string;
  timestamp: number;
}

const USERS_KEY = "ayurnexis_users";
const CURRENT_USER_KEY = "ayurnexis_current_user_id";
const ACCESS_LEVEL_KEY = "ayurnexis_access_level";
const ADMIN_AUTHED_KEY = "ayurnexis_admin_authed";
const LOCKED_FORMULATIONS_KEY = "ayurnexis_locked_formulations";

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

export function getAllUsers(): UserRegistration[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAllUsers(users: UserRegistration[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): UserRegistration | null {
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return null;
  const users = getAllUsers();
  return users.find((u) => u.id === id) || null;
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

export function registerUser(
  data: Omit<UserRegistration, "id" | "registeredAt" | "status">,
): UserRegistration {
  const users = getAllUsers();
  const newUser: UserRegistration = {
    ...data,
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    registeredAt: Date.now(),
    status: "pending",
    activityLog: [],
  };
  users.push(newUser);
  saveAllUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, newUser.id);
  localStorage.setItem(ACCESS_LEVEL_KEY, "readonly");
  return newUser;
}

export function verifyAccessCode(userId: string, code: string): boolean {
  const users = getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  if (user.status !== "approved") return false;
  if (user.accessCode !== code) return false;
  if (!user.codeGeneratedAt) return false;
  const days = user.codeExpiryDays ?? 30;
  const expiryMs = days * 24 * 60 * 60 * 1000;
  if (Date.now() - user.codeGeneratedAt > expiryMs) return false;
  return true;
}

export function getCodeRemainingDays(userId: string): number {
  const users = getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user || !user.codeGeneratedAt) return 0;
  const days = user.codeExpiryDays ?? 30;
  const expiresAt = user.codeGeneratedAt + days * 24 * 60 * 60 * 1000;
  const remaining = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(0, remaining);
}

export function verifyAccessCodeByEmail(
  email: string,
  code: string,
): { success: boolean; userId?: string; expiryDays?: number } {
  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { success: false };
  if (verifyAccessCode(user.id, code)) {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    localStorage.setItem(ACCESS_LEVEL_KEY, "full");
    return {
      success: true,
      userId: user.id,
      expiryDays: user.codeExpiryDays ?? 30,
    };
  }
  return { success: false };
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

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function logActivity(action: string, module: string): void {
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return;
  const users = getAllUsers();
  const userIdx = users.findIndex((u) => u.id === id);
  if (userIdx < 0) return;
  const entry: ActivityEntry = { action, module, timestamp: Date.now() };
  if (!users[userIdx].activityLog) users[userIdx].activityLog = [];
  users[userIdx].activityLog!.push(entry);
  if (users[userIdx].activityLog!.length > 100) {
    users[userIdx].activityLog = users[userIdx].activityLog!.slice(-100);
  }
  saveAllUsers(users);
}

export function approveUser(userId: string): void {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  users[idx].status = "approved";
  users[idx].approvedAt = Date.now();
  saveAllUsers(users);
}

export function revokeUser(userId: string): void {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  users[idx].status = "revoked";
  users[idx].accessCode = undefined;
  saveAllUsers(users);
  const currentId = localStorage.getItem(CURRENT_USER_KEY);
  if (currentId === userId) {
    localStorage.setItem(ACCESS_LEVEL_KEY, "readonly");
  }
}

export function generateCodeForUser(
  userId: string,
  expiryDays = 30,
  presetCode?: string,
): string {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return "";
  const code = presetCode || generateCode();
  users[idx].accessCode = code;
  users[idx].codeGeneratedAt = Date.now();
  users[idx].codeExpiryDays = expiryDays;
  saveAllUsers(users);
  return code;
}

const CURRENT_USER_KEY_LOCAL = "ayurnexis_current_user_id";

export function claimFormulation(
  formulationId: string,
  data: Omit<ClaimedFormulation, "id" | "claimedAt" | "expiresAt">,
): boolean {
  const allUsers = getAllUsers();
  const now = Date.now();
  const currentId = localStorage.getItem(CURRENT_USER_KEY_LOCAL);
  for (const u of allUsers) {
    for (const cf of u.claimedFormulations || []) {
      if (cf.id === formulationId && cf.expiresAt > now && u.id !== currentId) {
        return false;
      }
    }
  }
  if (!currentId) return false;
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === currentId);
  if (idx < 0) return false;
  if (!users[idx].claimedFormulations) users[idx].claimedFormulations = [];
  users[idx].claimedFormulations = users[idx].claimedFormulations!.filter(
    (cf) => cf.id !== formulationId || cf.expiresAt > now,
  );
  users[idx].claimedFormulations!.push({
    id: formulationId,
    ...data,
    claimedAt: now,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000,
  });
  saveAllUsers(users);
  return true;
}

export function isFormulationClaimed(formulationId: string): boolean {
  const allUsers = getAllUsers();
  const now = Date.now();
  const currentId = localStorage.getItem(CURRENT_USER_KEY_LOCAL);
  for (const u of allUsers) {
    for (const cf of u.claimedFormulations || []) {
      if (cf.id === formulationId && cf.expiresAt > now && u.id !== currentId) {
        return true;
      }
    }
  }
  return false;
}

export function backendUserToLocal(r: any): UserRegistration {
  const getOptStr = (v: any): string | undefined => {
    if (!v) return undefined;
    if (Array.isArray(v)) return v.length > 0 ? String(v[0]) : undefined;
    if (v.__kind__ === "Some") return v.value;
    return undefined;
  };
  const getOptNum = (v: any): number | undefined => {
    if (!v) return undefined;
    if (Array.isArray(v)) return v.length > 0 ? Number(v[0]) : undefined;
    if (v.__kind__ === "Some") return Number(v.value);
    return undefined;
  };
  // ICP Prim.time() returns nanoseconds — convert to milliseconds
  const nsToMs = (ns: number | undefined): number | undefined =>
    ns !== undefined ? ns / 1_000_000 : undefined;
  return {
    id: r.id,
    name: r.name,
    institution: r.institution,
    email: r.email,
    purpose: r.purpose,
    registeredAt: r.registeredAt
      ? Number(r.registeredAt) / 1_000_000
      : Date.now(),
    status: r.status as "pending" | "approved" | "revoked",
    accessCode: getOptStr(r.accessCode),
    codeGeneratedAt: nsToMs(getOptNum(r.codeGeneratedAt)),
    codeExpiryDays: getOptNum(r.codeExpiryDays) ?? 30,
    approvedAt: nsToMs(getOptNum(r.approvedAt)),
    activityLog: [],
    claimedFormulations: [],
  };
}

export function mergeBackendUsers(backendUsers: any[]): void {
  const localUsers = getAllUsers();
  const userMap = new Map(localUsers.map((u) => [u.id, u]));
  for (const bu of backendUsers) {
    const converted = backendUserToLocal(bu);
    const existing = userMap.get(converted.id);
    if (existing) {
      userMap.set(converted.id, {
        ...converted,
        activityLog: existing.activityLog || [],
        claimedFormulations: existing.claimedFormulations || [],
      });
    } else {
      userMap.set(converted.id, converted);
    }
  }
  saveAllUsers(Array.from(userMap.values()));
}

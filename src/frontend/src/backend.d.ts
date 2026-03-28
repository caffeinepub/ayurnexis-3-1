import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
  __kind__: "Some";
  value: T;
}
export interface None {
  __kind__: "None";
}
export type Option<T> = Some<T> | None;

export type AppRole = { qaManager: null } | { labTechnician: null } | { admin: null };
export type UserRole = { admin: null } | { user: null } | { guest: null };

export interface Batch {
  id: bigint;
  batchId: string;
  herbName: string;
  supplier: string;
  region: string;
  dateReceived: string;
  moisture: number;
  ash: number;
  extractiveValue: number;
  heavyMetals: number;
  microbialCount: number;
  notes: string;
  createdBy: Principal;
}

export interface BatchInput {
  batchId: string;
  herbName: string;
  supplier: string;
  region: string;
  dateReceived: string;
  moisture: number;
  ash: number;
  extractiveValue: number;
  heavyMetals: number;
  microbialCount: number;
  notes: string;
}

export interface AnalysisResult {
  batchId: string;
  herbName: string;
  supplier: string;
  region: string;
  dateReceived: string;
  qualityScore: number;
  status: string;
  probability: number;
  anomaly: boolean;
  anomalyDetails: string;
  moistureOk: boolean;
  ashOk: boolean;
  extractiveOk: boolean;
  heavyMetalsOk: boolean;
  microbialOk: boolean;
  timestamp: bigint;
}

export interface DashboardStats {
  totalBatches: bigint;
  passCount: bigint;
  failCount: bigint;
  passRate: number;
  openDeviations: bigint;
  avgQualityScore: number;
}

export interface ScoreTrend {
  batchId: string;
  qualityScore: number;
  timestamp: bigint;
}

export interface SupplierStats {
  supplier: string;
  passRate: number;
  avgScore: number;
  totalBatches: bigint;
}

export interface RiskBatch {
  batchId: string;
  herbName: string;
  supplier: string;
  qualityScore: number;
  riskLevel: string;
}

export interface QualityOverview {
  total: bigint;
  passed: bigint;
  failed: bigint;
  avgScore: number;
  highRisk: bigint;
}

export interface UserRecord {
  id: string;
  name: string;
  institution: string;
  email: string;
  purpose: string;
  registeredAt: bigint;
  status: string;
  accessCode: Option<string>;
  codeGeneratedAt: Option<bigint>;
  approvedAt: Option<bigint>;
}

export interface backendInterface {
  // Auth
  _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
  getCallerUserRole(): Promise<UserRole>;
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
  isCallerAdmin(): Promise<boolean>;
  setAppRole(user: Principal, role: AppRole): Promise<void>;
  getMyAppRole(): Promise<Option<AppRole>>;

  // AI Proxy — routes all AI calls through the backend canister to avoid CORS
  callDeepSeek(prompt: string): Promise<string>;

  // Batch CRUD
  createBatch(input: BatchInput): Promise<bigint>;
  getBatch(id: bigint): Promise<Option<Batch>>;
  getAllBatches(): Promise<Batch[]>;
  updateBatch(id: bigint, input: BatchInput): Promise<boolean>;
  deleteBatch(id: bigint): Promise<boolean>;

  // Analysis
  analyzeBatch(id: bigint): Promise<Option<AnalysisResult>>;
  getAnalysis(batchId: string): Promise<Option<AnalysisResult>>;
  getAllAnalyses(): Promise<AnalysisResult[]>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  getScoreTrends(): Promise<ScoreTrend[]>;
  getSupplierStats(): Promise<SupplierStats[]>;
  getRiskAssessment(): Promise<RiskBatch[]>;

  // Reports
  getQualityOverview(): Promise<QualityOverview>;
  getDeviationReport(): Promise<AnalysisResult[]>;

  // Seed
  seedDemoData(): Promise<void>;

  // User Access Requests
  submitAccessRequest(id: string, name: string, institution: string, email: string, purpose: string, registeredAt: bigint): Promise<boolean>;
  getAccessRequests(adminToken: string): Promise<UserRecord[]>;
  adminApproveUser(userId: string, adminToken: string): Promise<boolean>;
  adminRevokeUser(userId: string, adminToken: string): Promise<boolean>;
  adminDeleteUser(userId: string, adminToken: string): Promise<boolean>;
  adminGenerateCode(userId: string, adminToken: string, expiryDays: bigint): Promise<Option<string>>;
  verifyUserCode(email: string, code: string): Promise<Option<string>>;
  getUserCodeExpiry(email: string): Promise<Option<[bigint, bigint]>>;
  checkUserAccess(userId: string): Promise<string>;
  getUserRecord(userId: string, adminToken: string): Promise<Option<UserRecord>>;
}

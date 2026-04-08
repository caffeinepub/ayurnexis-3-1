// Local type definitions to avoid depending on generated backend.d.ts
// These mirror the backend types but are defined locally for type safety.

export interface AnalysisResult {
  batchId: string;
  herbName: string;
  supplier: string;
  region?: string;
  dateReceived?: string;
  qualityScore: number;
  status: string;
  riskLevel?: string;
  moistureOk: boolean;
  ashOk: boolean;
  extractiveOk: boolean;
  heavyMetalsOk: boolean;
  microbialOk: boolean;
  analyzedAt?: bigint;
  timestamp?: bigint;
  recommendations?: string[];
  moisture?: number;
  ash?: number;
  extractiveValue?: number;
  heavyMetals?: number;
  microbialCount?: number;
  probability?: number;
  anomaly?: boolean;
  anomalyDetails?: string;
}

export interface BatchInput {
  id?: bigint;
  batchId: string;
  herbName: string;
  supplier: string;
  region: string;
  dateReceived: string;
  materialType?: string;
  moisture: number;
  ash: number;
  extractiveValue: number;
  heavyMetals: number;
  microbialCount: number;
  notes: string;
  qualityStatus?: string;
}

export interface DashboardStats {
  totalBatches: bigint;
  passedBatches?: bigint;
  failedBatches?: bigint;
  pendingBatches?: bigint;
  passCount?: bigint;
  failCount?: bigint;
  avgQualityScore: number;
  highRiskCount?: bigint;
  passRate?: number;
  openDeviations?: bigint;
}

export interface ScoreTrend {
  batchId: string;
  herbName: string;
  qualityScore: number;
  analyzedAt?: bigint;
  timestamp?: bigint;
}

export interface SupplierStat {
  supplier: string;
  totalBatches: bigint;
  passRate: number;
  avgScore: number;
}

export interface QualityOverview {
  totalAnalyzed?: bigint;
  total?: bigint;
  passed?: bigint;
  failed?: bigint;
  passRate?: number;
  avgScore: number;
  topRiskHerb?: string;
  topSupplier?: string;
  highRisk?: bigint;
}

export interface DeviationRecord {
  batchId: string;
  herbName: string;
  parameter: string;
  deviation: string;
  detectedAt: bigint;
}

export interface BackendInterface {
  getDashboardStats(): Promise<DashboardStats>;
  getScoreTrends(): Promise<ScoreTrend[]>;
  getSupplierStats(): Promise<SupplierStat[]>;
  getRiskAssessment(): Promise<AnalysisResult[]>;
  getQualityOverview(): Promise<QualityOverview | null>;
  getDeviationReport(): Promise<DeviationRecord[]>;
  getAllBatches(): Promise<BatchInput[]>;
  createBatch(input: BatchInput): Promise<{ ok: bigint } | { err: string }>;
  deleteBatch(id: bigint): Promise<{ ok: null } | { err: string }>;
  analyzeBatch(id: bigint): Promise<[AnalysisResult] | []>;
  getAllAnalyses(): Promise<AnalysisResult[]>;
  seedDemoData(): Promise<null>;
  _initializeAccessControlWithSecret(secret: string): Promise<null>;
  getAccessRequests(adminToken: string): Promise<unknown[]>;
  submitAccessRequest(record: unknown): Promise<{ ok: null } | { err: string }>;
  approveUser(
    adminToken: string,
    userId: string,
  ): Promise<{ ok: null } | { err: string }>;
  revokeUser(
    adminToken: string,
    userId: string,
  ): Promise<{ ok: null } | { err: string }>;
  deleteAccessRequest(
    adminToken: string,
    userId: string,
  ): Promise<{ ok: null } | { err: string }>;
  generateAccessCode(
    adminToken: string,
    userId: string,
    expiryDays: number,
  ): Promise<{ ok: string } | { err: string }>;
  verifyAccessCode(code: string): Promise<{ ok: string } | { err: string }>;
  checkUserAccess(userId: string): Promise<string>;
  getAllUserCredits(adminToken: string): Promise<Array<[string, bigint]>>;
  setUserCredits(
    userId: string,
    amount: bigint | number,
    adminToken: string,
  ): Promise<{ ok: null } | { err: string } | boolean>;
  getRiskAuditLog(adminToken: string): Promise<unknown[]>;
  getUserCredits(userId: string): Promise<number>;
  deductCredit(userId: string): Promise<{ ok: null } | { err: string }>;
  logRiskRun(
    adminToken: string,
    entry: unknown,
  ): Promise<{ ok: null } | { err: string }>;
  callDeepSeek(prompt: string): Promise<string>;
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RiskBatch {
    supplier: string;
    qualityScore: number;
    batchId: string;
    herbName: string;
    riskLevel: string;
}
export interface QualityOverview {
    avgScore: number;
    total: bigint;
    highRisk: bigint;
    failed: bigint;
    passed: bigint;
}
export interface ScoreTrend {
    qualityScore: number;
    timestamp: bigint;
    batchId: string;
}
export interface RiskAuditEntry {
    userName: string;
    userId: string;
    timestamp: bigint;
    riskLevel: string;
    creditsUsed: bigint;
    riskScore: bigint;
    systemName: string;
}
export interface DashboardStats {
    passRate: number;
    totalBatches: bigint;
    passCount: bigint;
    avgQualityScore: number;
    openDeviations: bigint;
    failCount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface UserRecord {
    id: string;
    status: string;
    institution: string;
    approvedAt?: bigint;
    name: string;
    accessCode?: string;
    codeGeneratedAt?: bigint;
    email: string;
    registeredAt: bigint;
    purpose: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SupplierStats {
    avgScore: number;
    passRate: number;
    supplier: string;
    totalBatches: bigint;
}
export interface AyurNexisInterface {
    addAdmin(user: Principal): Promise<void>;
    adminApproveUser(userId: string, adminToken: string): Promise<boolean>;
    adminDeleteUser(userId: string, adminToken: string): Promise<boolean>;
    adminGenerateCode(userId: string, adminToken: string, expiryDays: bigint): Promise<string | null>;
    adminRevokeUser(userId: string, adminToken: string): Promise<boolean>;
    analyzeBatch(id: bigint): Promise<AnalysisResult | null>;
    callDeepSeek(prompt: string): Promise<string>;
    callDeepSeekExtended(prompt: string): Promise<string>;
    checkUserAccess(userId: string): Promise<string>;
    createBatch(input: BatchInput): Promise<bigint>;
    deductCredit(userId: string): Promise<boolean>;
    deleteBatch(id: bigint): Promise<boolean>;
    getAccessRequests(adminToken: string): Promise<Array<UserRecord>>;
    getAllAnalyses(): Promise<Array<AnalysisResult>>;
    getAllBatches(): Promise<Array<Batch>>;
    getAllUserCredits(adminToken: string): Promise<Array<[string, bigint]>>;
    getAnalysis(batchId: string): Promise<AnalysisResult | null>;
    getBatch(id: bigint): Promise<Batch | null>;
    getDashboardStats(): Promise<DashboardStats>;
    getDeviationReport(): Promise<Array<AnalysisResult>>;
    getMyAppRole(): Promise<AppRole | null>;
    getQualityOverview(): Promise<QualityOverview>;
    getRiskAssessment(): Promise<Array<RiskBatch>>;
    getRiskAuditLog(adminToken: string): Promise<Array<RiskAuditEntry>>;
    getScoreTrends(): Promise<Array<ScoreTrend>>;
    getSupplierStats(): Promise<Array<SupplierStats>>;
    getUserCodeExpiry(email: string): Promise<[bigint, bigint] | null>;
    getUserCredits(userId: string, adminToken: string): Promise<bigint>;
    getUserOwnCredits(userId: string): Promise<bigint>;
    getUserRecord(userId: string, adminToken: string): Promise<UserRecord | null>;
    isCallerAdmin(): Promise<boolean>;
    logRiskPrediction(userId: string, userName: string, systemName: string, riskScore: bigint, riskLevel: string): Promise<void>;
    removeAdmin(user: Principal): Promise<void>;
    seedDemoData(): Promise<void>;
    setAppRole(user: Principal, role: AppRole): Promise<void>;
    setUserCredits(userId: string, amount: bigint, adminToken: string): Promise<boolean>;
    submitAccessRequest(id: string, name: string, institution: string, email: string, purpose: string, registeredAt: bigint): Promise<boolean>;
    updateBatch(id: bigint, input: BatchInput): Promise<boolean>;
    verifyUserCode(email: string, code: string): Promise<string | null>;
}
export interface BatchInput {
    ash: number;
    region: string;
    supplier: string;
    heavyMetals: number;
    extractiveValue: number;
    dateReceived: string;
    notes: string;
    microbialCount: number;
    batchId: string;
    herbName: string;
    moisture: number;
}
export interface Batch {
    id: bigint;
    ash: number;
    region: string;
    supplier: string;
    createdBy: Principal;
    heavyMetals: number;
    extractiveValue: number;
    dateReceived: string;
    notes: string;
    microbialCount: number;
    batchId: string;
    herbName: string;
    moisture: number;
}
export interface AnalysisResult {
    region: string;
    status: string;
    probability: number;
    ashOk: boolean;
    supplier: string;
    extractiveOk: boolean;
    anomalyDetails: string;
    qualityScore: number;
    moistureOk: boolean;
    heavyMetalsOk: boolean;
    dateReceived: string;
    timestamp: bigint;
    microbialOk: boolean;
    batchId: string;
    herbName: string;
    anomaly: boolean;
}
export enum AppRole {
    admin = "admin",
    qaManager = "qaManager",
    labTechnician = "labTechnician"
}
export interface backendInterface extends AyurNexisInterface {
}

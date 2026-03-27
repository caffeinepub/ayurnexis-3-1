/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const AppRole = IDL.Variant({
  admin: IDL.Null,
  qaManager: IDL.Null,
  labTechnician: IDL.Null,
});

const UserRole = IDL.Variant({
  admin: IDL.Null,
  user: IDL.Null,
});

const BatchInput = IDL.Record({
  batchId: IDL.Text,
  herbName: IDL.Text,
  supplier: IDL.Text,
  region: IDL.Text,
  dateReceived: IDL.Text,
  moisture: IDL.Float64,
  ash: IDL.Float64,
  extractiveValue: IDL.Float64,
  heavyMetals: IDL.Float64,
  microbialCount: IDL.Float64,
  notes: IDL.Text,
});

const Batch = IDL.Record({
  id: IDL.Nat,
  batchId: IDL.Text,
  herbName: IDL.Text,
  supplier: IDL.Text,
  region: IDL.Text,
  dateReceived: IDL.Text,
  moisture: IDL.Float64,
  ash: IDL.Float64,
  extractiveValue: IDL.Float64,
  heavyMetals: IDL.Float64,
  microbialCount: IDL.Float64,
  notes: IDL.Text,
  createdBy: IDL.Principal,
});

const AnalysisResult = IDL.Record({
  batchId: IDL.Text,
  herbName: IDL.Text,
  supplier: IDL.Text,
  region: IDL.Text,
  dateReceived: IDL.Text,
  qualityScore: IDL.Float64,
  status: IDL.Text,
  probability: IDL.Float64,
  anomaly: IDL.Bool,
  anomalyDetails: IDL.Text,
  moistureOk: IDL.Bool,
  ashOk: IDL.Bool,
  extractiveOk: IDL.Bool,
  heavyMetalsOk: IDL.Bool,
  microbialOk: IDL.Bool,
  timestamp: IDL.Int,
});

const DashboardStats = IDL.Record({
  totalBatches: IDL.Nat,
  passCount: IDL.Nat,
  failCount: IDL.Nat,
  passRate: IDL.Float64,
  openDeviations: IDL.Nat,
  avgQualityScore: IDL.Float64,
});

const ScoreTrend = IDL.Record({
  batchId: IDL.Text,
  qualityScore: IDL.Float64,
  timestamp: IDL.Int,
});

const SupplierStats = IDL.Record({
  supplier: IDL.Text,
  passRate: IDL.Float64,
  avgScore: IDL.Float64,
  totalBatches: IDL.Nat,
});

const RiskBatch = IDL.Record({
  batchId: IDL.Text,
  herbName: IDL.Text,
  supplier: IDL.Text,
  qualityScore: IDL.Float64,
  riskLevel: IDL.Text,
});

const QualityOverview = IDL.Record({
  total: IDL.Nat,
  passed: IDL.Nat,
  failed: IDL.Nat,
  avgScore: IDL.Float64,
  highRisk: IDL.Nat,
});

const UserRecord = IDL.Record({
  id: IDL.Text,
  name: IDL.Text,
  institution: IDL.Text,
  email: IDL.Text,
  purpose: IDL.Text,
  registeredAt: IDL.Int,
  status: IDL.Text,
  accessCode: IDL.Opt(IDL.Text),
  codeGeneratedAt: IDL.Opt(IDL.Int),
  approvedAt: IDL.Opt(IDL.Int),
});

export const idlService = IDL.Service({
  // Authorization
  _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
  getCallerUserRole: IDL.Func([], [UserRole], ['query']),
  assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
  isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
  setAppRole: IDL.Func([IDL.Principal, AppRole], [], []),
  getMyAppRole: IDL.Func([], [IDL.Opt(AppRole)], ['query']),
  // Batch CRUD
  createBatch: IDL.Func([BatchInput], [IDL.Nat], []),
  getBatch: IDL.Func([IDL.Nat], [IDL.Opt(Batch)], ['query']),
  getAllBatches: IDL.Func([], [IDL.Vec(Batch)], ['query']),
  updateBatch: IDL.Func([IDL.Nat, BatchInput], [IDL.Bool], []),
  deleteBatch: IDL.Func([IDL.Nat], [IDL.Bool], []),
  // Analysis
  analyzeBatch: IDL.Func([IDL.Nat], [IDL.Opt(AnalysisResult)], []),
  getAnalysis: IDL.Func([IDL.Text], [IDL.Opt(AnalysisResult)], ['query']),
  getAllAnalyses: IDL.Func([], [IDL.Vec(AnalysisResult)], ['query']),
  // Dashboard
  getDashboardStats: IDL.Func([], [DashboardStats], ['query']),
  getScoreTrends: IDL.Func([], [IDL.Vec(ScoreTrend)], ['query']),
  getSupplierStats: IDL.Func([], [IDL.Vec(SupplierStats)], ['query']),
  getRiskAssessment: IDL.Func([], [IDL.Vec(RiskBatch)], ['query']),
  // Reports
  getQualityOverview: IDL.Func([], [QualityOverview], ['query']),
  getDeviationReport: IDL.Func([], [IDL.Vec(AnalysisResult)], ['query']),
  // Seed
  seedDemoData: IDL.Func([], [], []),
  // User Access Requests
  submitAccessRequest: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Int], [IDL.Bool], []),
  getAccessRequests: IDL.Func([IDL.Text], [IDL.Vec(UserRecord)], ['query']),
  adminApproveUser: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  adminRevokeUser: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  adminGenerateCode: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(IDL.Text)], []),
  verifyUserCode: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const AppRole = IDL.Variant({
    admin: IDL.Null,
    qaManager: IDL.Null,
    labTechnician: IDL.Null,
  });
  const UserRole = IDL.Variant({
    admin: IDL.Null,
    user: IDL.Null,
  });
  const BatchInput = IDL.Record({
    batchId: IDL.Text,
    herbName: IDL.Text,
    supplier: IDL.Text,
    region: IDL.Text,
    dateReceived: IDL.Text,
    moisture: IDL.Float64,
    ash: IDL.Float64,
    extractiveValue: IDL.Float64,
    heavyMetals: IDL.Float64,
    microbialCount: IDL.Float64,
    notes: IDL.Text,
  });
  const Batch = IDL.Record({
    id: IDL.Nat,
    batchId: IDL.Text,
    herbName: IDL.Text,
    supplier: IDL.Text,
    region: IDL.Text,
    dateReceived: IDL.Text,
    moisture: IDL.Float64,
    ash: IDL.Float64,
    extractiveValue: IDL.Float64,
    heavyMetals: IDL.Float64,
    microbialCount: IDL.Float64,
    notes: IDL.Text,
    createdBy: IDL.Principal,
  });
  const AnalysisResult = IDL.Record({
    batchId: IDL.Text,
    herbName: IDL.Text,
    supplier: IDL.Text,
    region: IDL.Text,
    dateReceived: IDL.Text,
    qualityScore: IDL.Float64,
    status: IDL.Text,
    probability: IDL.Float64,
    anomaly: IDL.Bool,
    anomalyDetails: IDL.Text,
    moistureOk: IDL.Bool,
    ashOk: IDL.Bool,
    extractiveOk: IDL.Bool,
    heavyMetalsOk: IDL.Bool,
    microbialOk: IDL.Bool,
    timestamp: IDL.Int,
  });
  const DashboardStats = IDL.Record({
    totalBatches: IDL.Nat,
    passCount: IDL.Nat,
    failCount: IDL.Nat,
    passRate: IDL.Float64,
    openDeviations: IDL.Nat,
    avgQualityScore: IDL.Float64,
  });
  const ScoreTrend = IDL.Record({
    batchId: IDL.Text,
    qualityScore: IDL.Float64,
    timestamp: IDL.Int,
  });
  const SupplierStats = IDL.Record({
    supplier: IDL.Text,
    passRate: IDL.Float64,
    avgScore: IDL.Float64,
    totalBatches: IDL.Nat,
  });
  const RiskBatch = IDL.Record({
    batchId: IDL.Text,
    herbName: IDL.Text,
    supplier: IDL.Text,
    qualityScore: IDL.Float64,
    riskLevel: IDL.Text,
  });
  const QualityOverview = IDL.Record({
    total: IDL.Nat,
    passed: IDL.Nat,
    failed: IDL.Nat,
    avgScore: IDL.Float64,
    highRisk: IDL.Nat,
  });
  const UserRecord = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    institution: IDL.Text,
    email: IDL.Text,
    purpose: IDL.Text,
    registeredAt: IDL.Int,
    status: IDL.Text,
    accessCode: IDL.Opt(IDL.Text),
    codeGeneratedAt: IDL.Opt(IDL.Int),
    approvedAt: IDL.Opt(IDL.Int),
  });
  return IDL.Service({
    _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
    getCallerUserRole: IDL.Func([], [UserRole], ['query']),
    assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
    isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
    setAppRole: IDL.Func([IDL.Principal, AppRole], [], []),
    getMyAppRole: IDL.Func([], [IDL.Opt(AppRole)], ['query']),
    createBatch: IDL.Func([BatchInput], [IDL.Nat], []),
    getBatch: IDL.Func([IDL.Nat], [IDL.Opt(Batch)], ['query']),
    getAllBatches: IDL.Func([], [IDL.Vec(Batch)], ['query']),
    updateBatch: IDL.Func([IDL.Nat, BatchInput], [IDL.Bool], []),
    deleteBatch: IDL.Func([IDL.Nat], [IDL.Bool], []),
    analyzeBatch: IDL.Func([IDL.Nat], [IDL.Opt(AnalysisResult)], []),
    getAnalysis: IDL.Func([IDL.Text], [IDL.Opt(AnalysisResult)], ['query']),
    getAllAnalyses: IDL.Func([], [IDL.Vec(AnalysisResult)], ['query']),
    getDashboardStats: IDL.Func([], [DashboardStats], ['query']),
    getScoreTrends: IDL.Func([], [IDL.Vec(ScoreTrend)], ['query']),
    getSupplierStats: IDL.Func([], [IDL.Vec(SupplierStats)], ['query']),
    getRiskAssessment: IDL.Func([], [IDL.Vec(RiskBatch)], ['query']),
    getQualityOverview: IDL.Func([], [QualityOverview], ['query']),
    getDeviationReport: IDL.Func([], [IDL.Vec(AnalysisResult)], ['query']),
    seedDemoData: IDL.Func([], [], []),
    submitAccessRequest: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Int], [IDL.Bool], []),
    getAccessRequests: IDL.Func([IDL.Text], [IDL.Vec(UserRecord)], ['query']),
    adminApproveUser: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    adminRevokeUser: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    adminGenerateCode: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(IDL.Text)], []),
    verifyUserCode: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };

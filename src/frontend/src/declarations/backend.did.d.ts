/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

// UserRecord matches the backend exactly — codeExpiryDays is NOT in this struct;
// it lives in the backend's codeExpiryMap and is returned via getUserCodeExpiry.
export interface UserRecord {
  id: string;
  name: string;
  institution: string;
  email: string;
  purpose: string;
  registeredAt: bigint;
  status: string;
  accessCode: [] | [string];
  codeGeneratedAt: [] | [bigint];
  approvedAt: [] | [bigint];
}

export interface _SERVICE {
  _initializeAccessControlWithSecret: ActorMethod<[string], void>;
  getCallerUserRole: ActorMethod<[], { admin: null } | { user: null }>;
  assignCallerUserRole: ActorMethod<[Principal, { admin: null } | { user: null }], void>;
  isCallerAdmin: ActorMethod<[], boolean>;
  setAppRole: ActorMethod<[Principal, { admin: null } | { qaManager: null } | { labTechnician: null }], void>;
  getMyAppRole: ActorMethod<[], [] | [{ admin: null } | { qaManager: null } | { labTechnician: null }]>;
  callDeepSeek: ActorMethod<[string], string>;
  createBatch: ActorMethod<[any], bigint>;
  getBatch: ActorMethod<[bigint], [] | [any]>;
  getAllBatches: ActorMethod<[], any[]>;
  updateBatch: ActorMethod<[bigint, any], boolean>;
  deleteBatch: ActorMethod<[bigint], boolean>;
  analyzeBatch: ActorMethod<[bigint], [] | [any]>;
  getAnalysis: ActorMethod<[string], [] | [any]>;
  getAllAnalyses: ActorMethod<[], any[]>;
  getDashboardStats: ActorMethod<[], any>;
  getScoreTrends: ActorMethod<[], any[]>;
  getSupplierStats: ActorMethod<[], any[]>;
  getRiskAssessment: ActorMethod<[], any[]>;
  getQualityOverview: ActorMethod<[], any>;
  getDeviationReport: ActorMethod<[], any[]>;
  seedDemoData: ActorMethod<[], void>;
  submitAccessRequest: ActorMethod<[string, string, string, string, string, bigint], boolean>;
  getAccessRequests: ActorMethod<[string], UserRecord[]>;
  adminApproveUser: ActorMethod<[string, string], boolean>;
  adminRevokeUser: ActorMethod<[string, string], boolean>;
  adminDeleteUser: ActorMethod<[string, string], boolean>;
  adminGenerateCode: ActorMethod<[string, string, bigint], [] | [string]>;
  getUserCodeExpiry: ActorMethod<[string], [] | [[bigint, bigint]]>;
  verifyUserCode: ActorMethod<[string, string], [] | [string]>;
  getUserRecord: ActorMethod<[string, string], [] | [UserRecord]>;
  checkUserAccess: ActorMethod<[string], string>;
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

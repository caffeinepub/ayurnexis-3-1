import type { AnalysisResult } from "../types";

const LOCAL_ANALYSES_KEY = "ayurnexis_local_analyses";
const DELETED_IDS_KEY = "ayurnexis_deleted_analyses";
const DELETED_BATCH_IDS_KEY = "ayurnexis_deleted_seed_batches";

export function saveLocalAnalysis(result: AnalysisResult): void {
  const existing = getLocalAnalyses();
  // Replace if same batchId exists, otherwise prepend
  const filtered = existing.filter((a) => a.batchId !== result.batchId);
  localStorage.setItem(
    LOCAL_ANALYSES_KEY,
    JSON.stringify([result, ...filtered]),
  );
}

export function getLocalAnalyses(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(LOCAL_ANALYSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteAnalysis(batchId: string): void {
  // Remove from local analyses
  const analyses = getLocalAnalyses().filter((a) => a.batchId !== batchId);
  localStorage.setItem(LOCAL_ANALYSES_KEY, JSON.stringify(analyses));
  // Add to deleted IDs set (to also hide seed analyses)
  const deleted = getDeletedIds();
  deleted.add(batchId);
  localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...deleted]));
}

export function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function restoreAnalysis(batchId: string): void {
  const deleted = getDeletedIds();
  deleted.delete(batchId);
  localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...deleted]));
}

// ─── Seed batch deletion (frontend-only batches with negative IDs) ────────────

export function deleteSeedBatch(batchId: string): void {
  const deleted = getDeletedSeedBatchIds();
  deleted.add(batchId);
  localStorage.setItem(DELETED_BATCH_IDS_KEY, JSON.stringify([...deleted]));
  // Also delete the analysis entry
  deleteAnalysis(batchId);
}

export function getDeletedSeedBatchIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_BATCH_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function isSeedBatchDeleted(batchId: string): boolean {
  return getDeletedSeedBatchIds().has(batchId);
}

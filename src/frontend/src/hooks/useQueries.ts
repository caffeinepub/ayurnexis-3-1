import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { backendInterface as FullBackend } from "../backend.d";
import type { BatchInput } from "../backend.d";
import { useActor } from "./useActor";

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as unknown as FullBackend).getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useScoreTrends() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["scoreTrends"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as FullBackend).getScoreTrends();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSupplierStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["supplierStats"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as FullBackend).getSupplierStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRiskAssessment() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["riskAssessment"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as FullBackend).getRiskAssessment();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllBatches() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as FullBackend).getAllBatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllAnalyses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as FullBackend).getAllAnalyses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useQualityOverview() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["qualityOverview"],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as unknown as FullBackend).getQualityOverview();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeviationReport() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["deviationReport"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as FullBackend).getDeviationReport();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBatch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BatchInput) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as FullBackend).createBatch(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteBatch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as FullBackend).deleteBatch(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useAnalyzeBatch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as FullBackend).analyzeBatch(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analyses"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["riskAssessment"] });
      qc.invalidateQueries({ queryKey: ["scoreTrends"] });
      qc.invalidateQueries({ queryKey: ["supplierStats"] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as FullBackend).seedDemoData();
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

// Merged analyses: backend + local seed batch computations + localStorage analyses
import { useCallback, useMemo, useState } from "react";
import { SEED_BATCHES, computeLocalAnalysis } from "../data/seedBatches";
import { getDeletedIds, getLocalAnalyses } from "../utils/analysisStore";

export function useAllAnalysesMerged() {
  const backendResult = useAllAnalyses();
  const backendData = backendResult.data ?? [];
  const [localVersion, setLocalVersion] = useState(0);

  // Expose refresh function
  const refreshLocal = useCallback(() => setLocalVersion((v) => v + 1), []);

  const merged = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    localVersion; // track for refresh
    const deletedIds = getDeletedIds();
    const localAnalyses = getLocalAnalyses();
    const seedAnalyses = SEED_BATCHES.map((b) => computeLocalAnalysis(b));
    const backendIds = new Set(backendData.map((a) => a.batchId));
    const localIds = new Set(localAnalyses.map((a) => a.batchId));

    // Seed analyses not overridden by backend or local
    const filteredSeed = seedAnalyses.filter(
      (a) =>
        !backendIds.has(a.batchId) &&
        !localIds.has(a.batchId) &&
        !deletedIds.has(a.batchId),
    );

    // Filter out deleted from all sources
    const filteredBackend = backendData.filter(
      (a) => !deletedIds.has(a.batchId),
    );
    const filteredLocal = localAnalyses.filter(
      (a) => !deletedIds.has(a.batchId),
    );

    return [...filteredLocal, ...filteredBackend, ...filteredSeed];
  }, [backendData, localVersion]);

  return { ...backendResult, data: merged, refreshLocal };
}

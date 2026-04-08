// Re-export createActorWithConfig, pre-bound with the backend createActor
import { createActorWithConfig as _createActorWithConfig } from "@caffeineai/core-infrastructure";
import type { CreateActorOptions } from "@caffeineai/core-infrastructure";
import { createActor } from "./backend";
import type { BackendInterface } from "./types";

export async function createActorWithConfig(options?: CreateActorOptions): Promise<BackendInterface> {
  const actor = await _createActorWithConfig(
    createActor as Parameters<typeof _createActorWithConfig>[0],
    options,
  );
  return actor as unknown as BackendInterface;
}

export { loadConfig } from "@caffeineai/core-infrastructure";

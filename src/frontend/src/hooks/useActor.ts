// Wrapper hook that pre-binds the backend createActor function
import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

export function useActor() {
  return _useActor(createActor as Parameters<typeof _useActor>[0]);
}

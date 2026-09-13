import type { StoreApi } from "zustand";
import type { OnboardingStore } from "@/stores/onboarding.store";
import type { OnboardingRepository } from "./repositories/onboarding.repository";

export type OnboardingStoreApi = Pick<StoreApi<OnboardingStore>, "getState" | "subscribe">;

export interface PersistenceBinding {
  unsubscribe: () => void;
  /** Resolves once every write queued so far has settled. */
  whenIdle: () => Promise<void>;
}

/**
 * Mirrors onboarding state from the Zustand store into the local database.
 * Writes are queued so they hit SQLite in the same order the store changed,
 * and a failed write is logged without blocking the ones after it.
 */
export function bindOnboardingPersistence(
  store: OnboardingStoreApi,
  repository: OnboardingRepository,
): PersistenceBinding {
  let queue: Promise<void> = Promise.resolve();

  const enqueue = (action: string, write: () => Promise<void>) => {
    queue = queue.then(write).catch((error: unknown) => {
      console.error(`[db] Failed to ${action}`, error);
    });
  };

  const unsubscribe = store.subscribe((state, previous) => {
    const isUnchanged =
      state.onboardingData === previous.onboardingData &&
      state.hasCompletedOnboarding === previous.hasCompletedOnboarding;
    if (isUnchanged) return;

    const { onboardingData } = state;
    if (state.hasCompletedOnboarding && onboardingData) {
      enqueue("save onboarding", () => repository.save(onboardingData));
      return;
    }
    if (previous.hasCompletedOnboarding && !state.hasCompletedOnboarding) {
      enqueue("clear onboarding", () => repository.clear());
    }
  });

  return { unsubscribe, whenIdle: () => queue };
}

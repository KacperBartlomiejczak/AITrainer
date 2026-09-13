import type { DatabaseBootstrapStatus } from "@/schemas/database.schema";
import {
  bindOnboardingPersistence,
  type OnboardingStoreApi,
  type PersistenceBinding,
} from "./onboarding-persistence";
import type { OnboardingRepository } from "./repositories/onboarding.repository";

export interface BootstrapOnboardingPersistenceInput {
  openRepository: () => Promise<OnboardingRepository>;
  store: OnboardingStoreApi;
}

export interface BootstrapOnboardingPersistenceResult extends PersistenceBinding {
  status: Exclude<DatabaseBootstrapStatus, "loading">;
}

const noopBinding: PersistenceBinding = {
  unsubscribe: () => undefined,
  whenIdle: () => Promise.resolve(),
};

/**
 * Opens the database, restores saved onboarding into the store and starts
 * mirroring later changes. Never rejects: on failure the app keeps working
 * in memory (the user sees onboarding instead of an error screen).
 */
export async function bootstrapOnboardingPersistence({
  openRepository,
  store,
}: BootstrapOnboardingPersistenceInput): Promise<BootstrapOnboardingPersistenceResult> {
  try {
    const repository = await openRepository();
    const savedOnboarding = await repository.load();
    store.getState().hydrate(savedOnboarding);
    // Bind after hydration so restoring saved data does not write it back
    return { status: "ready", ...bindOnboardingPersistence(store, repository) };
  } catch (error: unknown) {
    console.error("[db] Database bootstrap failed, continuing without persistence", error);
    store.getState().hydrate(null);
    return { status: "error", ...noopBinding };
  }
}

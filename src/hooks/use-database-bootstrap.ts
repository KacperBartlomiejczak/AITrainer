import { useEffect, useState } from "react";
import { bootstrapOnboardingPersistence } from "@/db/bootstrap";
import { openOnboardingRepository } from "@/db/client";
import type { PersistenceBinding } from "@/db/onboarding-persistence";
import type { DatabaseBootstrapStatus } from "@/schemas/database.schema";
import { useOnboardingStore } from "@/stores/onboarding.store";

/**
 * Restores persisted onboarding from SQLite on app start and keeps the
 * onboarding store mirrored to the database while the root layout is mounted.
 */
export function useDatabaseBootstrap(): DatabaseBootstrapStatus {
  const [status, setStatus] = useState<DatabaseBootstrapStatus>("loading");

  useEffect(() => {
    let isActive = true;
    let binding: PersistenceBinding | null = null;

    void bootstrapOnboardingPersistence({
      openRepository: openOnboardingRepository,
      store: useOnboardingStore,
    }).then((result) => {
      if (!isActive) {
        result.unsubscribe();
        return;
      }
      binding = result;
      setStatus(result.status);
    });

    return () => {
      isActive = false;
      binding?.unsubscribe();
    };
  }, []);

  return status;
}

import { bootstrapOnboardingPersistence } from "../bootstrap";
import type { OnboardingRepository } from "../repositories/onboarding.repository";
import { useOnboardingStore } from "@/stores/onboarding.store";
import type { OnboardingFormData } from "@/schemas/onboarding.schema";

const onboarding: OnboardingFormData = {
  name: "Kacper",
  experienceLevel: "beginner",
  fitnessGoal: "general_fitness",
  muscleFocus: { mode: "selected", muscleGroups: ["arms", "back"] },
};

function createFakeRepository(stored: OnboardingFormData | null): jest.Mocked<OnboardingRepository> {
  return {
    load: jest.fn().mockResolvedValue(stored),
    save: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  };
}

describe("bootstrapOnboardingPersistence", () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      hasCompletedOnboarding: false,
      onboardingData: null,
      isHydrated: false,
    });
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("hydrates the store with saved onboarding so it is not shown again", async () => {
    const repository = createFakeRepository(onboarding);

    const result = await bootstrapOnboardingPersistence({
      openRepository: () => Promise.resolve(repository),
      store: useOnboardingStore,
    });

    expect(result.status).toBe("ready");
    expect(useOnboardingStore.getState()).toMatchObject({
      isHydrated: true,
      hasCompletedOnboarding: true,
      onboardingData: onboarding,
    });
    result.unsubscribe();
  });

  it("hydrates an empty store for first-time users", async () => {
    const result = await bootstrapOnboardingPersistence({
      openRepository: () => Promise.resolve(createFakeRepository(null)),
      store: useOnboardingStore,
    });

    expect(result.status).toBe("ready");
    expect(useOnboardingStore.getState()).toMatchObject({
      isHydrated: true,
      hasCompletedOnboarding: false,
      onboardingData: null,
    });
    result.unsubscribe();
  });

  it("persists changes made after bootstrap, but not the hydration itself", async () => {
    const repository = createFakeRepository(null);
    const result = await bootstrapOnboardingPersistence({
      openRepository: () => Promise.resolve(repository),
      store: useOnboardingStore,
    });
    expect(repository.save).not.toHaveBeenCalled();

    useOnboardingStore.getState().completeOnboarding(onboarding);
    await result.whenIdle();

    expect(repository.save).toHaveBeenCalledWith(onboarding);
    result.unsubscribe();
  });

  it("falls back to an in-memory session when the database cannot be opened", async () => {
    const result = await bootstrapOnboardingPersistence({
      openRepository: () => Promise.reject(new Error("migration failed")),
      store: useOnboardingStore,
    });

    expect(result.status).toBe("error");
    expect(useOnboardingStore.getState()).toMatchObject({
      isHydrated: true,
      hasCompletedOnboarding: false,
      onboardingData: null,
    });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("[db]"), expect.any(Error));
    expect(() => result.unsubscribe()).not.toThrow();
    await expect(result.whenIdle()).resolves.toBeUndefined();
  });

  it("falls back when loading saved data fails", async () => {
    const repository = createFakeRepository(null);
    repository.load.mockRejectedValue(new Error("read error"));

    const result = await bootstrapOnboardingPersistence({
      openRepository: () => Promise.resolve(repository),
      store: useOnboardingStore,
    });

    expect(result.status).toBe("error");
    expect(useOnboardingStore.getState().isHydrated).toBe(true);
  });
});

import { bindOnboardingPersistence } from "../onboarding-persistence";
import type { OnboardingRepository } from "../repositories/onboarding.repository";
import { useOnboardingStore } from "@/stores/onboarding.store";
import type { OnboardingFormData } from "@/schemas/onboarding.schema";

const onboarding: OnboardingFormData = {
  name: "Kacper",
  experienceLevel: "intermediate",
  fitnessGoal: "strength",
  muscleFocus: { mode: "selected", muscleGroups: ["chest"] },
};

function createFakeRepository(): jest.Mocked<OnboardingRepository> {
  return {
    load: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  };
}

describe("bindOnboardingPersistence", () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      hasCompletedOnboarding: false,
      onboardingData: null,
      isHydrated: true,
    });
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("saves data when onboarding is completed", async () => {
    const repository = createFakeRepository();
    const binding = bindOnboardingPersistence(useOnboardingStore, repository);

    useOnboardingStore.getState().completeOnboarding(onboarding);
    await binding.whenIdle();

    expect(repository.save).toHaveBeenCalledWith(onboarding);
    binding.unsubscribe();
  });

  it("saves merged data when the profile is updated after completion", async () => {
    const repository = createFakeRepository();
    const binding = bindOnboardingPersistence(useOnboardingStore, repository);

    useOnboardingStore.getState().completeOnboarding(onboarding);
    useOnboardingStore.getState().updateProfile({ name: "Kacper Pro" });
    await binding.whenIdle();

    expect(repository.save).toHaveBeenLastCalledWith({ ...onboarding, name: "Kacper Pro" });
    binding.unsubscribe();
  });

  it("clears the database when onboarding is reset (data deletion)", async () => {
    const repository = createFakeRepository();
    useOnboardingStore.setState({ hasCompletedOnboarding: true, onboardingData: onboarding });
    const binding = bindOnboardingPersistence(useOnboardingStore, repository);

    useOnboardingStore.getState().resetOnboarding();
    await binding.whenIdle();

    expect(repository.clear).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    binding.unsubscribe();
  });

  it("ignores changes unrelated to onboarding data", async () => {
    const repository = createFakeRepository();
    const binding = bindOnboardingPersistence(useOnboardingStore, repository);

    useOnboardingStore.getState().setHydrated(false);
    await binding.whenIdle();

    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.clear).not.toHaveBeenCalled();
    binding.unsubscribe();
  });

  it("does not persist a partial profile before onboarding is completed", async () => {
    const repository = createFakeRepository();
    const binding = bindOnboardingPersistence(useOnboardingStore, repository);

    useOnboardingStore.getState().updateProfile({ name: "Draft" });
    await binding.whenIdle();

    expect(repository.save).not.toHaveBeenCalled();
    binding.unsubscribe();
  });

  it("stops writing after unsubscribe", async () => {
    const repository = createFakeRepository();
    const binding = bindOnboardingPersistence(useOnboardingStore, repository);
    binding.unsubscribe();

    useOnboardingStore.getState().completeOnboarding(onboarding);
    await binding.whenIdle();

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("runs writes sequentially and keeps going after a failed write", async () => {
    const calls: string[] = [];
    const repository = createFakeRepository();
    repository.save.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      calls.push("save");
      throw new Error("disk full");
    });
    repository.clear.mockImplementationOnce(async () => {
      calls.push("clear");
    });
    const binding = bindOnboardingPersistence(useOnboardingStore, repository);

    useOnboardingStore.getState().completeOnboarding(onboarding);
    useOnboardingStore.getState().resetOnboarding();
    await binding.whenIdle();

    expect(calls).toEqual(["save", "clear"]);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[db]"),
      expect.any(Error),
    );
    binding.unsubscribe();
  });
});

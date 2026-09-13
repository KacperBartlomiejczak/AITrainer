import { act, renderHook } from "@testing-library/react-native";
import { useOnboarding } from "../use-onboarding";
import { useOnboardingFormStore } from "@/stores/onboarding-form.store";

// Mock expo-router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}));

// Mock the persisted onboarding store
const mockCompleteOnboarding = jest.fn();
jest.mock("@/stores/onboarding.store", () => ({
  useOnboardingStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      completeOnboarding: mockCompleteOnboarding,
    }),
}));

const initialFormState = useOnboardingFormStore.getState();

function fillForm(overrides: Partial<ReturnType<typeof useOnboardingFormStore.getState>> = {}) {
  useOnboardingFormStore.setState({
    name: "Kacper",
    experienceLevel: "intermediate",
    fitnessGoal: "strength",
    muscleFocus: { mode: "selected", muscleGroups: ["chest"] },
    ...overrides,
  });
}

describe("useOnboarding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOnboardingFormStore.setState(initialFormState, true);
  });

  it("reports the given currentStep", async () => {
    const { result } = await renderHook(() => useOnboarding(0));
    expect(result.current.currentStep).toBe(0);
  });

  it("reports totalSteps as 5", async () => {
    const { result } = await renderHook(() => useOnboarding(0));
    expect(result.current.totalSteps).toBe(5);
  });

  it("exposes form values from the form store", async () => {
    fillForm({ muscleFocus: { mode: "undecided" } });
    const { result } = await renderHook(() => useOnboarding(4));

    expect(result.current.name).toBe("Kacper");
    expect(result.current.experienceLevel).toBe("intermediate");
    expect(result.current.fitnessGoal).toBe("strength");
    expect(result.current.muscleFocus).toEqual({ mode: "undecided" });
  });

  // ── isStepValid tests ──

  it("step 0 (name) requires a non-empty name", async () => {
    const { result, rerender } = await renderHook(() => useOnboarding(0));
    expect(result.current.isStepValid).toBe(false);

    await act(async () => useOnboardingFormStore.getState().setName("Kacper"));
    await rerender({});
    expect(result.current.isStepValid).toBe(true);
  });

  it("step 1 (experience) requires an experience level", async () => {
    const { result } = await renderHook(() => useOnboarding(1));
    expect(result.current.isStepValid).toBe(false);

    await act(async () => result.current.setExperienceLevel("beginner"));
    expect(result.current.isStepValid).toBe(true);
  });

  it("step 2 (goal) requires a goal", async () => {
    const { result } = await renderHook(() => useOnboarding(2));
    expect(result.current.isStepValid).toBe(false);

    await act(async () => result.current.setGoal("strength"));
    expect(result.current.isStepValid).toBe(true);
  });

  it("step 3 (muscle focus) is valid with muscle groups or 'not sure yet'", async () => {
    const { result } = await renderHook(() => useOnboarding(3));
    expect(result.current.isStepValid).toBe(false);

    await act(async () => result.current.toggleMuscleGroup("legs"));
    expect(result.current.isStepValid).toBe(true);
    expect(result.current.muscleFocus).toEqual({ mode: "selected", muscleGroups: ["legs"] });

    await act(async () => result.current.toggleUndecidedMuscleFocus());
    expect(result.current.isStepValid).toBe(true);
    expect(result.current.muscleFocus).toEqual({ mode: "undecided" });

    await act(async () => result.current.toggleUndecidedMuscleFocus());
    expect(result.current.isStepValid).toBe(false);
  });

  it("step 4 (summary) is always valid", async () => {
    const { result } = await renderHook(() => useOnboarding(4));
    expect(result.current.isStepValid).toBe(true);
  });

  // ── Navigation ──

  it.each([
    [0, "/(onboarding)/step-experience"],
    [1, "/(onboarding)/step-goal"],
    [2, "/(onboarding)/step-muscle-groups"],
    [3, "/(onboarding)/step-summary"],
  ] as const)("nextStep from step %i navigates to %s", async (step, route) => {
    fillForm();
    const { result } = await renderHook(() => useOnboarding(step));
    result.current.nextStep();
    expect(mockPush).toHaveBeenCalledWith(route);
  });

  it("nextStep does not navigate if invalid", async () => {
    const { result } = await renderHook(() => useOnboarding(0));
    result.current.nextStep();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("nextStep does nothing on the summary step", async () => {
    fillForm();
    const { result } = await renderHook(() => useOnboarding(4));
    result.current.nextStep();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("prevStep navigates back if step > 0", async () => {
    const { result } = await renderHook(() => useOnboarding(1));
    result.current.prevStep();
    expect(mockBack).toHaveBeenCalled();
  });

  it("prevStep does not navigate back if step is 0", async () => {
    const { result } = await renderHook(() => useOnboarding(0));
    result.current.prevStep();
    expect(mockBack).not.toHaveBeenCalled();
  });

  // ── Submit ──

  it("submitOnboarding completes onboarding and leaves navigation to the root guard", async () => {
    fillForm({ name: "  Kacper  " });

    const { result } = await renderHook(() => useOnboarding(4));
    await act(async () => result.current.submitOnboarding());

    expect(mockCompleteOnboarding).toHaveBeenCalledWith({
      name: "Kacper",
      experienceLevel: "intermediate",
      fitnessGoal: "strength",
      muscleFocus: { mode: "selected", muscleGroups: ["chest"] },
    });
    expect(useOnboardingFormStore.getState().name).toBe("");
    // RootLayout guard is the single source of truth for the redirect to home
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("submitOnboarding saves 'not sure yet' muscle focus", async () => {
    fillForm({ muscleFocus: { mode: "undecided" } });

    const { result } = await renderHook(() => useOnboarding(4));
    await act(async () => result.current.submitOnboarding());

    expect(mockCompleteOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({ muscleFocus: { mode: "undecided" } }),
    );
  });

  it.each([
    ["goal", { fitnessGoal: null }],
    ["experience level", { experienceLevel: null }],
    ["muscle focus", { muscleFocus: null }],
  ] as const)("submitOnboarding does not complete onboarding when %s is missing", async (_, missing) => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    fillForm(missing);

    const { result } = await renderHook(() => useOnboarding(4));
    await act(async () => result.current.submitOnboarding());

    expect(mockCompleteOnboarding).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

import { renderHook } from "@testing-library/react-native";
import { useOnboarding } from "../use-onboarding";

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

// Mutable mock state for the form store
const mockFormStoreState = {
  name: "",
  fitnessGoal: null as string | null,
  focusMuscleGroups: [] as string[],
};

const mockSetName = jest.fn((name: string) => {
  mockFormStoreState.name = name;
});
const mockSetGoal = jest.fn((goal: string) => {
  mockFormStoreState.fitnessGoal = goal;
});
const mockToggleMuscleGroup = jest.fn((group: string) => {
  if (mockFormStoreState.focusMuscleGroups.includes(group)) {
    mockFormStoreState.focusMuscleGroups = mockFormStoreState.focusMuscleGroups.filter(
      (g) => g !== group
    );
  } else {
    mockFormStoreState.focusMuscleGroups = [...mockFormStoreState.focusMuscleGroups, group];
  }
});
const mockResetForm = jest.fn();

jest.mock("@/stores/onboarding-form.store", () => ({
  useOnboardingFormStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      get name() {
        return mockFormStoreState.name;
      },
      get fitnessGoal() {
        return mockFormStoreState.fitnessGoal;
      },
      get focusMuscleGroups() {
        return mockFormStoreState.focusMuscleGroups;
      },
      setName: mockSetName,
      setGoal: mockSetGoal,
      toggleMuscleGroup: mockToggleMuscleGroup,
      resetForm: mockResetForm,
    }),
}));

describe("useOnboarding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormStoreState.name = "";
    mockFormStoreState.fitnessGoal = null;
    mockFormStoreState.focusMuscleGroups = [];
  });

  it("reports the given currentStep", async () => {
    const { result } = await renderHook(() => useOnboarding(0));
    expect(result.current.currentStep).toBe(0);
  });

  it("reports totalSteps as 4", async () => {
    const { result } = await renderHook(() => useOnboarding(0));
    expect(result.current.totalSteps).toBe(4);
  });

  it("exposes name from form store", async () => {
    mockFormStoreState.name = "Kacper";
    const { result } = await renderHook(() => useOnboarding(0));
    expect(result.current.name).toBe("Kacper");
  });

  it("exposes fitnessGoal from form store", async () => {
    mockFormStoreState.fitnessGoal = "strength";
    const { result } = await renderHook(() => useOnboarding(1));
    expect(result.current.fitnessGoal).toBe("strength");
  });

  it("exposes focusMuscleGroups from form store", async () => {
    mockFormStoreState.focusMuscleGroups = ["chest", "back"];
    const { result } = await renderHook(() => useOnboarding(2));
    expect(result.current.focusMuscleGroups).toEqual(["chest", "back"]);
  });

  // ── isStepValid tests ──

  it("isStepValid returns false for step 0 when name is empty", async () => {
    const { result } = await renderHook(() => useOnboarding(0));
    expect(result.current.isStepValid).toBe(false);
  });

  it("isStepValid returns true for step 0 when name is set", async () => {
    mockFormStoreState.name = "Kacper";
    const { result } = await renderHook(() => useOnboarding(0));
    expect(result.current.isStepValid).toBe(true);
  });

  it("isStepValid returns false for step 1 when goal is not set", async () => {
    const { result } = await renderHook(() => useOnboarding(1));
    expect(result.current.isStepValid).toBe(false);
  });

  it("isStepValid returns true for step 1 when goal is set", async () => {
    mockFormStoreState.fitnessGoal = "strength";
    const { result } = await renderHook(() => useOnboarding(1));
    expect(result.current.isStepValid).toBe(true);
  });

  it("isStepValid returns false for step 2 when no muscle groups selected", async () => {
    const { result } = await renderHook(() => useOnboarding(2));
    expect(result.current.isStepValid).toBe(false);
  });

  it("isStepValid returns true for step 2 when muscle groups selected", async () => {
    mockFormStoreState.focusMuscleGroups = ["chest"];
    const { result } = await renderHook(() => useOnboarding(2));
    expect(result.current.isStepValid).toBe(true);
  });

  it("isStepValid returns true for step 3 (summary always valid)", async () => {
    const { result } = await renderHook(() => useOnboarding(3));
    expect(result.current.isStepValid).toBe(true);
  });

  // ── Function exposure and operation tests ──

  it("exposes setName function and invokes store", async () => {
    const { result } = await renderHook(() => useOnboarding(0));
    expect(typeof result.current.setName).toBe("function");
    result.current.setName("Jan");
    expect(mockSetName).toHaveBeenCalledWith("Jan");
  });

  it("exposes setGoal function and invokes store", async () => {
    const { result } = await renderHook(() => useOnboarding(1));
    expect(typeof result.current.setGoal).toBe("function");
    result.current.setGoal("muscle_gain");
    expect(mockSetGoal).toHaveBeenCalledWith("muscle_gain");
  });

  it("exposes toggleMuscleGroup function and invokes store", async () => {
    const { result } = await renderHook(() => useOnboarding(2));
    expect(typeof result.current.toggleMuscleGroup).toBe("function");
    result.current.toggleMuscleGroup("legs");
    expect(mockToggleMuscleGroup).toHaveBeenCalledWith("legs");
  });

  it("nextStep navigates to next step if valid", async () => {
    mockFormStoreState.name = "Kacper";
    const { result } = await renderHook(() => useOnboarding(0));
    result.current.nextStep();
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/step-goal");
  });

  it("nextStep does not navigate if invalid", async () => {
    mockFormStoreState.name = "";
    const { result } = await renderHook(() => useOnboarding(0));
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

  it("submitOnboarding completes onboarding and leaves navigation to the root guard", async () => {
    mockFormStoreState.name = "Kacper";
    mockFormStoreState.fitnessGoal = "strength";
    mockFormStoreState.focusMuscleGroups = ["chest"];

    const { result } = await renderHook(() => useOnboarding(3));
    result.current.submitOnboarding();

    expect(mockCompleteOnboarding).toHaveBeenCalledWith({
      name: "Kacper",
      fitnessGoal: "strength",
      focusMuscleGroups: ["chest"],
    });
    expect(mockResetForm).toHaveBeenCalled();
    // RootLayout guard is the single source of truth for the redirect to home
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("submitOnboarding does not complete onboarding when goal is missing", async () => {
    mockFormStoreState.name = "Kacper";
    mockFormStoreState.fitnessGoal = null;
    mockFormStoreState.focusMuscleGroups = ["chest"];

    const { result } = await renderHook(() => useOnboarding(3));
    result.current.submitOnboarding();

    expect(mockCompleteOnboarding).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

import { useOnboardingFormStore } from "../onboarding-form.store";

const initialState = useOnboardingFormStore.getState();

describe("useOnboardingFormStore", () => {
  afterEach(() => {
    useOnboardingFormStore.setState(initialState, true);
  });

  it("starts empty", () => {
    expect(initialState).toMatchObject({
      name: "",
      experienceLevel: null,
      fitnessGoal: null,
      muscleFocus: null,
    });
  });

  it("sets the experience level", () => {
    useOnboardingFormStore.getState().setExperienceLevel("advanced");
    expect(useOnboardingFormStore.getState().experienceLevel).toBe("advanced");
  });

  it("picking 'not sure yet' clears selected muscle groups", () => {
    const store = useOnboardingFormStore.getState();
    store.toggleMuscleGroup("chest");
    store.toggleMuscleGroup("legs");
    store.toggleUndecidedMuscleFocus();

    expect(useOnboardingFormStore.getState().muscleFocus).toEqual({ mode: "undecided" });
  });

  it("picking a muscle group clears 'not sure yet'", () => {
    const store = useOnboardingFormStore.getState();
    store.toggleUndecidedMuscleFocus();
    store.toggleMuscleGroup("back");

    expect(useOnboardingFormStore.getState().muscleFocus).toEqual({
      mode: "selected",
      muscleGroups: ["back"],
    });
  });

  it("resetForm clears every field", () => {
    const store = useOnboardingFormStore.getState();
    store.setName("Kacper");
    store.setExperienceLevel("beginner");
    store.setGoal("strength");
    store.toggleUndecidedMuscleFocus();
    store.resetForm();

    expect(useOnboardingFormStore.getState()).toMatchObject({
      name: "",
      experienceLevel: null,
      fitnessGoal: null,
      muscleFocus: null,
    });
  });
});

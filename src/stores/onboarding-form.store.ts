import { create } from "zustand";
import type { FitnessGoal, MuscleGroup } from "@/schemas/onboarding.schema";

/**
 * Ephemeral store for onboarding form state shared across onboarding step screens.
 * NOT persisted — this is transient form data that only matters during onboarding.
 * Once submitted, the data goes to the persisted onboarding.store.
 */
interface OnboardingFormState {
  name: string;
  fitnessGoal: FitnessGoal | null;
  focusMuscleGroups: MuscleGroup[];

  setName: (name: string) => void;
  setGoal: (goal: FitnessGoal) => void;
  toggleMuscleGroup: (group: MuscleGroup) => void;
  resetForm: () => void;
}

export const useOnboardingFormStore = create<OnboardingFormState>((set) => ({
  name: "",
  fitnessGoal: null,
  focusMuscleGroups: [],

  setName: (name: string) => set({ name }),

  setGoal: (goal: FitnessGoal) => set({ fitnessGoal: goal }),

  toggleMuscleGroup: (group: MuscleGroup) =>
    set((state) => ({
      focusMuscleGroups: state.focusMuscleGroups.includes(group)
        ? state.focusMuscleGroups.filter((g) => g !== group)
        : [...state.focusMuscleGroups, group],
    })),

  resetForm: () =>
    set({
      name: "",
      fitnessGoal: null,
      focusMuscleGroups: [],
    }),
}));

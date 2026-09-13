import { create } from "zustand";
import {
  toggleMuscleGroupInFocus,
  toggleUndecidedMuscleFocus,
} from "@/lib/muscle-focus";
import type {
  ExperienceLevel,
  FitnessGoal,
  MuscleFocus,
  MuscleGroup,
} from "@/schemas/onboarding.schema";

/**
 * Ephemeral store for onboarding form state shared across onboarding step screens.
 * NOT persisted — this is transient form data that only matters during onboarding.
 * Once submitted, the data goes to the persisted onboarding.store.
 */
interface OnboardingFormState {
  name: string;
  experienceLevel: ExperienceLevel | null;
  fitnessGoal: FitnessGoal | null;
  /** null = nothing picked yet */
  muscleFocus: MuscleFocus | null;

  setName: (name: string) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  setGoal: (goal: FitnessGoal) => void;
  toggleMuscleGroup: (group: MuscleGroup) => void;
  toggleUndecidedMuscleFocus: () => void;
  resetForm: () => void;
}

const INITIAL_FORM_VALUES = {
  name: "",
  experienceLevel: null,
  fitnessGoal: null,
  muscleFocus: null,
} satisfies Pick<OnboardingFormState, "name" | "experienceLevel" | "fitnessGoal" | "muscleFocus">;

export const useOnboardingFormStore = create<OnboardingFormState>((set) => ({
  ...INITIAL_FORM_VALUES,

  setName: (name: string) => set({ name }),

  setExperienceLevel: (level: ExperienceLevel) => set({ experienceLevel: level }),

  setGoal: (goal: FitnessGoal) => set({ fitnessGoal: goal }),

  toggleMuscleGroup: (group: MuscleGroup) =>
    set((state) => ({ muscleFocus: toggleMuscleGroupInFocus(state.muscleFocus, group) })),

  toggleUndecidedMuscleFocus: () =>
    set((state) => ({ muscleFocus: toggleUndecidedMuscleFocus(state.muscleFocus) })),

  resetForm: () => set(INITIAL_FORM_VALUES),
}));

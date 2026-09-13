import { create } from "zustand";
import type { OnboardingFormData } from "@/schemas/onboarding.schema";

interface OnboardingStoreState {
  /** Whether the onboarding flow has been completed */
  hasCompletedOnboarding: boolean;
  /** Saved onboarding data (null until completed) */
  onboardingData: OnboardingFormData | null;
  /** Whether saved onboarding has been read from the local database */
  isHydrated: boolean;
}

interface OnboardingStoreActions {
  /** Save onboarding data and mark as completed */
  completeOnboarding: (data: OnboardingFormData) => void;
  /** Update profile data partially (e.g. from settings) */
  updateProfile: (data: Partial<OnboardingFormData>) => void;
  /** Reset onboarding state (for testing / data deletion) */
  resetOnboarding: () => void;
  /** Mark store as hydrated / ready in RAM */
  setHydrated: (value: boolean) => void;
  /** Restore state read from the local database (null = nothing saved yet) */
  hydrate: (data: OnboardingFormData | null) => void;
}

export type OnboardingStore = OnboardingStoreState & OnboardingStoreActions;

export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  // ── State (mirrored to SQLite by bindOnboardingPersistence) ──
  hasCompletedOnboarding: false,
  onboardingData: null,
  isHydrated: false,

  // ── Actions ──
  completeOnboarding: (data: OnboardingFormData) =>
    set({
      hasCompletedOnboarding: true,
      onboardingData: data,
    }),

  updateProfile: (data: Partial<OnboardingFormData>) =>
    set((state) => ({
      onboardingData: state.onboardingData
        ? { ...state.onboardingData, ...data }
        : (data as OnboardingFormData),
    })),

  resetOnboarding: () =>
    set({
      hasCompletedOnboarding: false,
      onboardingData: null,
    }),

  setHydrated: (value: boolean) => set({ isHydrated: value }),

  hydrate: (data: OnboardingFormData | null) =>
    set({
      hasCompletedOnboarding: data !== null,
      onboardingData: data,
      isHydrated: true,
    }),
}));


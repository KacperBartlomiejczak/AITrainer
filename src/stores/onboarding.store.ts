import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OnboardingFormData } from "@/schemas/onboarding.schema";

interface OnboardingStoreState {
  /** Whether the onboarding flow has been completed */
  hasCompletedOnboarding: boolean;
  /** Saved onboarding data (null until completed) */
  onboardingData: OnboardingFormData | null;
  /** Whether the store has been rehydrated from AsyncStorage */
  isHydrated: boolean;
}

interface OnboardingStoreActions {
  /** Save onboarding data and mark as completed */
  completeOnboarding: (data: OnboardingFormData) => void;
  /** Reset onboarding state (for testing / data deletion) */
  resetOnboarding: () => void;
  /** Mark store as hydrated (called by persist middleware) */
  setHydrated: (value: boolean) => void;
}

type OnboardingStore = OnboardingStoreState & OnboardingStoreActions;

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      // ── State ──
      hasCompletedOnboarding: false,
      onboardingData: null,
      isHydrated: false,

      // ── Actions ──
      completeOnboarding: (data: OnboardingFormData) =>
        set({
          hasCompletedOnboarding: true,
          onboardingData: data,
        }),

      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          onboardingData: null,
        }),

      setHydrated: (value: boolean) => set({ isHydrated: value }),
    }),
    {
      name: "aitrainer-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        onboardingData: state.onboardingData,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

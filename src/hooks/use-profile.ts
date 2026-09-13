import { useState, useCallback, useMemo } from "react";
import { deleteWorkoutHistory, exportWorkoutSessions } from "@/db/workout-history";
import { useOnboardingStore } from "@/stores/onboarding.store";
import {
  UNDECIDED_MUSCLE_FOCUS,
  areMuscleFocusesEqual,
  toggleMuscleGroupInFocus,
  toggleUndecidedMuscleFocus as toggleUndecidedInFocus,
} from "@/lib/muscle-focus";
import {
  ProfileFormSchema,
  AppSettingsSchema,
  type AppSettings,
  type UserDataExport,
  type ExperienceLevel,
  type FitnessGoal,
  type MuscleFocus,
  type MuscleGroup,
} from "@/schemas/profile.schema";

export interface ProfileFormErrors {
  name?: string;
  experienceLevel?: string;
  fitnessGoal?: string;
  muscleFocus?: string;
  general?: string;
}

const PROFILE_ERROR_FIELDS = ["name", "experienceLevel", "fitnessGoal", "muscleFocus"] as const;

function isProfileErrorField(field: unknown): field is (typeof PROFILE_ERROR_FIELDS)[number] {
  return PROFILE_ERROR_FIELDS.some((known) => known === field);
}

export function useProfile() {
  const onboardingData = useOnboardingStore((s) => s.onboardingData);
  const updateProfileInStore = useOnboardingStore((s) => s.updateProfile);
  const resetOnboardingInStore = useOnboardingStore((s) => s.resetOnboarding);

  const [name, setNameState] = useState<string>(onboardingData?.name ?? "");
  const [experienceLevel, setExperienceLevelState] = useState<ExperienceLevel | null>(
    onboardingData?.experienceLevel ?? null
  );
  const [fitnessGoal, setFitnessGoalState] = useState<FitnessGoal | null>(
    onboardingData?.fitnessGoal ?? null
  );
  const [muscleFocus, setMuscleFocusState] = useState<MuscleFocus | null>(
    onboardingData?.muscleFocus ?? null
  );

  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    return AppSettingsSchema.parse({});
  });

  const [prevOnboardingData, setPrevOnboardingData] = useState(onboardingData);

  // Synchronize state if store rehydrates later while form is pristine
  if (onboardingData !== prevOnboardingData) {
    setPrevOnboardingData(onboardingData);
    if (name === "" && onboardingData?.name) {
      setNameState(onboardingData.name);
    }
    if (experienceLevel === null && onboardingData?.experienceLevel) {
      setExperienceLevelState(onboardingData.experienceLevel);
    }
    if (fitnessGoal === null && onboardingData?.fitnessGoal) {
      setFitnessGoalState(onboardingData.fitnessGoal);
    }
    if (muscleFocus === null && onboardingData?.muscleFocus) {
      setMuscleFocusState(onboardingData.muscleFocus);
    }
  }

  const isDirty = useMemo(() => {
    return (
      name !== (onboardingData?.name ?? "") ||
      experienceLevel !== (onboardingData?.experienceLevel ?? null) ||
      fitnessGoal !== (onboardingData?.fitnessGoal ?? null) ||
      !areMuscleFocusesEqual(muscleFocus, onboardingData?.muscleFocus ?? null)
    );
  }, [name, experienceLevel, fitnessGoal, muscleFocus, onboardingData]);

  const clearFieldFeedback = useCallback((field: keyof ProfileFormErrors) => {
    setIsSuccess(false);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const setName = useCallback((newName: string) => {
    setNameState(newName);
    clearFieldFeedback("name");
  }, [clearFieldFeedback]);

  const setExperienceLevel = useCallback((level: ExperienceLevel) => {
    setExperienceLevelState(level);
    clearFieldFeedback("experienceLevel");
  }, [clearFieldFeedback]);

  const setFitnessGoal = useCallback((newGoal: FitnessGoal) => {
    setFitnessGoalState(newGoal);
    clearFieldFeedback("fitnessGoal");
  }, [clearFieldFeedback]);

  const toggleMuscleGroup = useCallback((group: MuscleGroup) => {
    setMuscleFocusState((prev) => toggleMuscleGroupInFocus(prev, group));
    clearFieldFeedback("muscleFocus");
  }, [clearFieldFeedback]);

  const toggleUndecidedMuscleFocus = useCallback(() => {
    setMuscleFocusState((prev) => toggleUndecidedInFocus(prev));
    clearFieldFeedback("muscleFocus");
  }, [clearFieldFeedback]);

  const resetForm = useCallback(() => {
    setNameState(onboardingData?.name ?? "");
    setExperienceLevelState(onboardingData?.experienceLevel ?? null);
    setFitnessGoalState(onboardingData?.fitnessGoal ?? null);
    setMuscleFocusState(onboardingData?.muscleFocus ?? null);
    setErrors({});
    setIsSuccess(false);
  }, [onboardingData]);

  const saveProfile = useCallback((): boolean => {
    const parsed = ProfileFormSchema.safeParse({
      name: name.trim(),
      experienceLevel,
      fitnessGoal,
      muscleFocus,
    });

    if (!parsed.success) {
      const fieldErrors: ProfileFormErrors = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0];
        if (isProfileErrorField(fieldName) && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setIsSuccess(false);
      return false;
    }

    updateProfileInStore(parsed.data);
    setNameState(parsed.data.name);
    setErrors({});
    setIsSuccess(true);
    return true;
  }, [name, experienceLevel, fitnessGoal, muscleFocus, updateProfileInStore]);

  const exportData = useCallback(async (): Promise<string> => {
    const exportObject: UserDataExport = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      profile: {
        name: name.trim() || (onboardingData?.name ?? "Użytkownik"),
        experienceLevel: experienceLevel ?? onboardingData?.experienceLevel ?? "beginner",
        fitnessGoal: fitnessGoal ?? onboardingData?.fitnessGoal ?? "general_fitness",
        muscleFocus: muscleFocus ?? onboardingData?.muscleFocus ?? UNDECIDED_MUSCLE_FOCUS,
      },
      appSettings,
      workoutSessions: await exportWorkoutSessions(),
    };
    return JSON.stringify(exportObject, null, 2);
  }, [name, experienceLevel, fitnessGoal, muscleFocus, onboardingData, appSettings]);

  const resetAllData = useCallback(() => {
    // Workout history and photos are sensitive: removed together with the profile
    void deleteWorkoutHistory().catch((error: unknown) => {
      console.error("[db] Failed to delete workout history", error);
    });
    resetOnboardingInStore();
    resetForm();
  }, [resetOnboardingInStore, resetForm]);

  return {
    name,
    experienceLevel,
    fitnessGoal,
    muscleFocus,
    errors,
    isDirty,
    isSuccess,
    appSettings,
    setName,
    setExperienceLevel,
    setFitnessGoal,
    toggleMuscleGroup,
    toggleUndecidedMuscleFocus,
    resetForm,
    saveProfile,
    exportData,
    resetAllData,
    setAppSettings,
  };
}

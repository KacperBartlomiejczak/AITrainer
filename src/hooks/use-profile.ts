import { useState, useCallback, useMemo } from "react";
import { useOnboardingStore } from "@/stores/onboarding.store";
import {
  ProfileFormSchema,
  AppSettingsSchema,
  type AppSettings,
  type UserDataExport,
  type FitnessGoal,
  type MuscleGroup,
} from "@/schemas/profile.schema";

export interface ProfileFormErrors {
  name?: string;
  fitnessGoal?: string;
  focusMuscleGroups?: string;
  general?: string;
}

export function useProfile() {
  const onboardingData = useOnboardingStore((s) => s.onboardingData);
  const updateProfileInStore = useOnboardingStore((s) => s.updateProfile);
  const resetOnboardingInStore = useOnboardingStore((s) => s.resetOnboarding);

  const [name, setNameState] = useState<string>(onboardingData?.name ?? "");
  const [fitnessGoal, setFitnessGoalState] = useState<FitnessGoal | null>(
    onboardingData?.fitnessGoal ?? null
  );
  const [focusMuscleGroups, setFocusMuscleGroupsState] = useState<MuscleGroup[]>(
    onboardingData?.focusMuscleGroups ?? []
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
    if (fitnessGoal === null && onboardingData?.fitnessGoal) {
      setFitnessGoalState(onboardingData.fitnessGoal);
    }
    if (focusMuscleGroups.length === 0 && onboardingData?.focusMuscleGroups) {
      setFocusMuscleGroupsState(onboardingData.focusMuscleGroups);
    }
  }

  const isDirty = useMemo(() => {
    const originalName = onboardingData?.name ?? "";
    const originalGoal = onboardingData?.fitnessGoal ?? null;
    const originalMuscles = onboardingData?.focusMuscleGroups ?? [];

    const nameChanged = name !== originalName;
    const goalChanged = fitnessGoal !== originalGoal;
    const musclesChanged =
      focusMuscleGroups.length !== originalMuscles.length ||
      focusMuscleGroups.some((m) => !originalMuscles.includes(m));

    return nameChanged || goalChanged || musclesChanged;
  }, [name, fitnessGoal, focusMuscleGroups, onboardingData]);

  const setName = useCallback((newName: string) => {
    setNameState(newName);
    setIsSuccess(false);
    setErrors((prev) => ({ ...prev, name: undefined }));
  }, []);

  const setFitnessGoal = useCallback((newGoal: FitnessGoal) => {
    setFitnessGoalState(newGoal);
    setIsSuccess(false);
    setErrors((prev) => ({ ...prev, fitnessGoal: undefined }));
  }, []);

  const toggleMuscleGroup = useCallback((group: MuscleGroup) => {
    setIsSuccess(false);
    setErrors((prev) => ({ ...prev, focusMuscleGroups: undefined }));
    setFocusMuscleGroupsState((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  }, []);

  const resetForm = useCallback(() => {
    setNameState(onboardingData?.name ?? "");
    setFitnessGoalState(onboardingData?.fitnessGoal ?? null);
    setFocusMuscleGroupsState(onboardingData?.focusMuscleGroups ?? []);
    setErrors({});
    setIsSuccess(false);
  }, [onboardingData]);

  const saveProfile = useCallback((): boolean => {
    const formData = {
      name: name.trim(),
      fitnessGoal,
      focusMuscleGroups,
    };

    const parsed = ProfileFormSchema.safeParse(formData);

    if (!parsed.success) {
      const fieldErrors: ProfileFormErrors = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as keyof ProfileFormErrors;
        if (fieldName && !fieldErrors[fieldName]) {
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
  }, [name, fitnessGoal, focusMuscleGroups, updateProfileInStore]);

  const exportData = useCallback((): string => {
    const exportObject: UserDataExport = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      profile: {
        name: name.trim() || (onboardingData?.name ?? "Użytkownik"),
        fitnessGoal: fitnessGoal ?? onboardingData?.fitnessGoal ?? "general_fitness",
        focusMuscleGroups:
          focusMuscleGroups.length > 0
            ? focusMuscleGroups
            : (onboardingData?.focusMuscleGroups ?? ["chest"]),
      },
      appSettings,
    };
    return JSON.stringify(exportObject, null, 2);
  }, [name, fitnessGoal, focusMuscleGroups, onboardingData, appSettings]);

  const resetAllData = useCallback(() => {
    resetOnboardingInStore();
    resetForm();
  }, [resetOnboardingInStore, resetForm]);

  return {
    name,
    fitnessGoal,
    focusMuscleGroups,
    errors,
    isDirty,
    isSuccess,
    appSettings,
    setName,
    setFitnessGoal,
    toggleMuscleGroup,
    resetForm,
    saveProfile,
    exportData,
    resetAllData,
    setAppSettings,
  };
}

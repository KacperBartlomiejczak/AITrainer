import { useState, useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { MOCK_MONTHLY_INTENSITY } from "@/lib/mock-monthly-intensity";
import { toUserRoutineCard } from "@/lib/routine-mappers";
import { toCompletedWorkoutDetail, toRoutinePhotoItem } from "@/lib/workout-history-mappers";
import {
  FITNESS_GOAL_LABELS,
  OnboardingFormSchema,
} from "@/schemas/onboarding.schema";
import {
  calculateStrengthLeague,
  type ProfileStats,
  type RoutinePhotoItem,
} from "@/schemas/user-profile-screen.schema";
import { useRoutineLibrary } from "./use-routine-library";
import { useWorkoutHistory } from "./use-workout-history";
import { useWorkoutPhoto } from "./use-workout-photo";

// Not tracked yet (needs logged weights and a calendar of workouts) — stays mocked
const MOCK_STREAK_DAYS = 36;
const MOCK_BENCH_PRESS_MAX_KG = 100;

export function useUserProfileScreen() {
  const router = useRouter();
  const rawOnboardingData = useOnboardingStore((s) => s.onboardingData);
  const history = useWorkoutHistory();
  const { reload: reloadHistory } = history;
  const routineLibrary = useRoutineLibrary();
  const [selectedWorkoutPhotoId, setSelectedWorkoutPhotoId] = useState<string | null>(null);
  const photo = useWorkoutPhoto({ onPhotoChanged: reloadHistory });

  const validatedOnboarding = useMemo(() => {
    if (!rawOnboardingData) return null;
    const parsed = OnboardingFormSchema.safeParse(rawOnboardingData);
    return parsed.success ? parsed.data : null;
  }, [rawOnboardingData]);

  const recentWorkouts = useMemo(() => {
    const now = new Date();
    return history.entries.map((entry) => toCompletedWorkoutDetail(entry, now));
  }, [history.entries]);

  const routinePhotos = useMemo(
    () =>
      recentWorkouts.flatMap((workout) => {
        const item = toRoutinePhotoItem(workout);
        return item ? [item] : [];
      }),
    [recentWorkouts],
  );

  const routines = useMemo(
    () => routineLibrary.routines.map(toUserRoutineCard),
    [routineLibrary.routines],
  );

  const stats = useMemo<ProfileStats>(() => {
    const goalKey = validatedOnboarding?.fitnessGoal;
    return {
      displayName: validatedOnboarding?.name?.trim() || "Kacper",
      fitnessGoalLabel: goalKey ? FITNESS_GOAL_LABELS[goalKey]?.label ?? "Budowa sylwetki" : "Budowa sylwetki",
      streakDays: MOCK_STREAK_DAYS,
      benchPressMaxKg: MOCK_BENCH_PRESS_MAX_KG,
      strengthLeague: calculateStrengthLeague(MOCK_BENCH_PRESS_MAX_KG),
      totalWorkoutsCompleted: recentWorkouts.length,
    };
  }, [validatedOnboarding, recentWorkouts.length]);

  const selectedWorkoutPhoto: RoutinePhotoItem | null = useMemo(
    () => routinePhotos.find((item) => item.id === selectedWorkoutPhotoId) ?? null,
    [routinePhotos, selectedWorkoutPhotoId],
  );

  const openWorkoutPhotoModal = useCallback((photoId: string) => {
    setSelectedWorkoutPhotoId(photoId);
  }, []);

  const closeWorkoutPhotoModal = useCallback(() => {
    setSelectedWorkoutPhotoId(null);
  }, []);

  const photoTargetHasPhoto = useMemo(
    () => recentWorkouts.some((workout) => workout.id === photo.targetSessionId && workout.photoUri !== null),
    [recentWorkouts, photo.targetSessionId],
  );

  const openSettings = useCallback(() => {
    router.push("/profile" as never);
  }, [router]);

  const startRoutine = useCallback(
    (routineId: string) => {
      router.push(`/workout/${routineId}` as never);
    },
    [router]
  );

  const openExercisesAtlas = useCallback(() => {
    router.push("/exercises" as never);
  }, [router]);

  return {
    stats,
    routinePhotos,
    monthlyIntensity: MOCK_MONTHLY_INTENSITY,
    routines,
    recentWorkouts,
    isLoading: history.status === "loading" || routineLibrary.status === "loading",
    selectedWorkoutPhoto,
    openWorkoutPhotoModal,
    closeWorkoutPhotoModal,
    managePhoto: photo.openPhotoSheet,
    photoSheet: {
      isOpen: photo.isPhotoSheetOpen,
      hasPhoto: photoTargetHasPhoto,
      isSaving: photo.isSaving,
      errorMessage: photo.errorMessage,
      selectSource: photo.selectPhotoSource,
      removePhoto: photo.removePhoto,
      dismiss: photo.closePhotoSheet,
    },
    openSettings,
    startRoutine,
    openExercisesAtlas,
  };
}

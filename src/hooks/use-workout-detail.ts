import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { saveWorkoutSession } from "@/db/workout-history";
import { buildNewWorkoutSession, toWorkoutDetail } from "@/lib/routine-mappers";
import { NewWorkoutSessionSchema } from "@/schemas/workout-history.schema";
import type { WorkoutDetail } from "@/schemas/workout-session.schema";
import { useActiveWorkoutStore } from "@/stores/active-workout.store";
import { useRoutineLibrary } from "./use-routine-library";
import { useWorkoutPhoto } from "./use-workout-photo";

const SAVE_FAILED_MESSAGE = "Nie udało się zapisać treningu. Spróbuj ponownie.";

export function useWorkoutDetail(routineId?: string) {
  const router = useRouter();
  const { status, routines } = useRoutineLibrary();
  const {
    activeRoutineId,
    isActive,
    startedAt,
    completedExerciseIds,
    startWorkout,
    finishWorkout: resetActiveWorkout,
    toggleExerciseCompleted,
  } = useActiveWorkoutStore();
  const [isSaving, setIsSaving] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const storedRoutine = useMemo(
    () => routines.find((candidate) => candidate.id === routineId) ?? null,
    [routines, routineId],
  );
  const routine: WorkoutDetail | null = useMemo(
    () => (storedRoutine ? toWorkoutDetail(storedRoutine) : null),
    [storedRoutine],
  );

  const isCurrentRoutineActive = isActive && activeRoutineId === routineId;

  const goToProfile = useCallback(() => {
    router.push("/user-profile" as never);
  }, [router]);

  // After finishing, the user may add an optional photo; either way they land on their profile
  const {
    isPhotoSheetOpen,
    isSaving: isSavingPhoto,
    errorMessage: photoErrorMessage,
    openPhotoSheet,
    closePhotoSheet,
    selectPhotoSource,
  } = useWorkoutPhoto({ onPhotoChanged: goToProfile });

  const handleStartWorkout = useCallback(() => {
    if (routineId) {
      setFinishError(null);
      startWorkout(routineId);
    }
  }, [routineId, startWorkout]);

  const handleFinishWorkout = useCallback(async () => {
    if (!storedRoutine || !isCurrentRoutineActive || startedAt === null || isSaving) return;

    const session = NewWorkoutSessionSchema.safeParse(
      buildNewWorkoutSession({
        routine: storedRoutine,
        completedExerciseIds,
        startedAt: new Date(startedAt),
        completedAt: new Date(),
      }),
    );
    if (!session.success) {
      setFinishError(session.error.issues[0]?.message ?? SAVE_FAILED_MESSAGE);
      return;
    }

    setFinishError(null);
    setIsSaving(true);
    try {
      const saved = await saveWorkoutSession(session.data);
      resetActiveWorkout();
      openPhotoSheet(saved.id);
    } catch (error: unknown) {
      console.error("[db] Failed to save the finished workout", error);
      setFinishError(SAVE_FAILED_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  }, [
    storedRoutine,
    isCurrentRoutineActive,
    startedAt,
    isSaving,
    completedExerciseIds,
    resetActiveWorkout,
    openPhotoSheet,
  ]);

  const skipPhoto = useCallback(() => {
    closePhotoSheet();
    goToProfile();
  }, [closePhotoSheet, goToProfile]);

  const handleBackToWorkouts = useCallback(() => {
    router.push("/workouts" as never);
  }, [router]);

  return {
    routine,
    isLoading: status === "loading",
    isActive: isCurrentRoutineActive,
    isSaving,
    finishError,
    completedExerciseIds,
    startWorkout: handleStartWorkout,
    finishWorkout: handleFinishWorkout,
    toggleExercise: toggleExerciseCompleted,
    backToWorkouts: handleBackToWorkouts,
    photoSheet: {
      isOpen: isPhotoSheetOpen,
      isSaving: isSavingPhoto,
      errorMessage: photoErrorMessage,
      selectSource: selectPhotoSource,
      dismiss: skipPhoto,
    },
  };
}

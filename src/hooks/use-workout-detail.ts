import { useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { getWorkoutDetail } from "@/lib/workout-routines-data";
import { useActiveWorkoutStore } from "@/stores/active-workout.store";
import type { WorkoutDetail } from "@/schemas/workout-session.schema";

export function useWorkoutDetail(routineId?: string) {
  const router = useRouter();
  const {
    activeRoutineId,
    isActive,
    completedExerciseIds,
    startWorkout,
    finishWorkout,
    toggleExerciseCompleted,
  } = useActiveWorkoutStore();

  const routine: WorkoutDetail | null = useMemo(() => {
    if (!routineId) return null;
    return getWorkoutDetail(routineId);
  }, [routineId]);

  const isCurrentRoutineActive = isActive && activeRoutineId === routineId;

  const handleStartWorkout = useCallback(() => {
    if (routineId) {
      startWorkout(routineId);
    }
  }, [routineId, startWorkout]);

  const handleFinishWorkout = useCallback(() => {
    finishWorkout();
    router.push("/workouts" as never);
  }, [finishWorkout, router]);

  const handleBackToWorkouts = useCallback(() => {
    router.push("/workouts" as never);
  }, [router]);

  return {
    routine,
    isActive: isCurrentRoutineActive,
    completedExerciseIds,
    startWorkout: handleStartWorkout,
    finishWorkout: handleFinishWorkout,
    toggleExercise: toggleExerciseCompleted,
    backToWorkouts: handleBackToWorkouts,
  };
}

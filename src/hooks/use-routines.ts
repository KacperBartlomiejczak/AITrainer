import { useState, useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { toRoutineItem } from "@/lib/routine-mappers";
import type { RoutineLevel, RoutineList } from "@/schemas/routine.schema";
import { useLiveWorkoutStore } from "@/stores/live-workout.store";
import { useRoutineLibrary } from "./use-routine-library";

export function useRoutines() {
  const router = useRouter();
  const { status, routines: storedRoutines } = useRoutineLibrary();
  const hasActiveEmptyWorkout = useLiveWorkoutStore((state) => state.session !== null);
  const [filterLevel, setFilterLevel] = useState<RoutineLevel | "all">("all");

  const routines: RoutineList = useMemo(() => storedRoutines.map(toRoutineItem), [storedRoutines]);

  const filteredRoutines = useMemo(() => {
    if (filterLevel === "all") return routines;
    return routines.filter((r) => r.level === filterLevel);
  }, [filterLevel, routines]);

  const startRoutine = useCallback(
    (routineId: string) => {
      router.push(`/workout/${routineId}` as never);
    },
    [router]
  );

  const startEmptyWorkout = useCallback(() => {
    // The screen starts a new empty workout or resumes the running one
    router.push("/workout-session" as never);
  }, [router]);

  const openAllExercises = useCallback(() => {
    router.push("/exercises" as never);
  }, [router]);

  return {
    routines,
    filteredRoutines,
    isLoading: status === "loading",
    filterLevel,
    setFilterLevel,
    startRoutine,
    hasActiveEmptyWorkout,
    startEmptyWorkout,
    openAllExercises,
  };
}

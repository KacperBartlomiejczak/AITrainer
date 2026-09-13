import { useState, useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { toRoutineItem } from "@/lib/routine-mappers";
import type { RoutineLevel, RoutineList } from "@/schemas/routine.schema";
import { useRoutineLibrary } from "./use-routine-library";

export function useRoutines() {
  const router = useRouter();
  const { status, routines: storedRoutines } = useRoutineLibrary();
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
    openAllExercises,
  };
}

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  type RoutineLevel,
  type RoutineList,
  RoutineListSchema,
} from "@/schemas/routine.schema";

export const INITIAL_ROUTINES: RoutineList = [
  {
    id: "rtn_fbw_01",
    title: "FBW dla Początkujących",
    description: "Kompleksowy trening całego ciała z wolnymi ciężarami.",
    durationMinutes: 45,
    daysPerWeek: 3,
    level: "beginner",
    targetMuscleGroups: ["Klatka", "Plecy", "Nogi", "Barki"],
    exerciseCount: 5,
    isPopular: true,
  },
  {
    id: "rtn_push_02",
    title: "Push (Klatka + Barki + Triceps)",
    description: "Skupienie na mięśniach pchających i budowie siły.",
    durationMinutes: 55,
    daysPerWeek: 4,
    level: "intermediate",
    targetMuscleGroups: ["Klatka", "Barki", "Triceps"],
    exerciseCount: 6,
    isPopular: false,
  },
  {
    id: "rtn_pull_03",
    title: "Pull (Plecy + Tył barku + Biceps)",
    description: "Rozwój szerokości i grubości pleców oraz ramion.",
    durationMinutes: 50,
    daysPerWeek: 4,
    level: "intermediate",
    targetMuscleGroups: ["Plecy", "Biceps"],
    exerciseCount: 5,
    isPopular: false,
  },
  {
    id: "rtn_legs_04",
    title: "Legs & Core (Nogi + Brzuch)",
    description: "Potężny bodziec na dolne partie ciała i stabilizację tułowia.",
    durationMinutes: 60,
    daysPerWeek: 3,
    level: "advanced",
    targetMuscleGroups: ["Nogi", "Brzuch"],
    exerciseCount: 6,
    isPopular: false,
  },
];

export function useRoutines() {
  const router = useRouter();
  const [filterLevel, setFilterLevel] = useState<RoutineLevel | "all">("all");

  const validatedRoutines = useMemo(() => {
    const parsed = RoutineListSchema.safeParse(INITIAL_ROUTINES);
    return parsed.success ? parsed.data : INITIAL_ROUTINES;
  }, []);

  const filteredRoutines = useMemo(() => {
    if (filterLevel === "all") return validatedRoutines;
    return validatedRoutines.filter((r) => r.level === filterLevel);
  }, [filterLevel, validatedRoutines]);

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
    routines: validatedRoutines,
    filteredRoutines,
    filterLevel,
    setFilterLevel,
    startRoutine,
    openAllExercises,
  };
}

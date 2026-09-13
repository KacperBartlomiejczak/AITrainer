import type { NewRoutine } from "@/schemas/workout-history.schema";

/**
 * Two basic full-body routines for beginners, seeded on every app start (idempotent).
 * Alternating A/B is the classic starting point: every muscle group 3x per week, simple free-weight lifts.
 * Ids are stable — completed workouts reference them.
 */
export const BUILTIN_ROUTINES: readonly NewRoutine[] = [
  {
    id: "rtn_fbw_a",
    userId: null,
    title: "FBW A — Całe ciało",
    description: "Podstawowy trening całego ciała z wolnymi ciężarami. Wykonuj na zmianę z FBW B.",
    level: "beginner",
    daysPerWeek: 3,
    durationMinutes: 45,
    exercises: [
      { id: "rtn_fbw_a_ex_1", name: "Przysiad ze sztangą", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", restSeconds: 90 },
      { id: "rtn_fbw_a_ex_2", name: "Wyciskanie sztangi leżąc", targetMuscle: "Klatka piersiowa", sets: 3, targetReps: "8-10", restSeconds: 90 },
      { id: "rtn_fbw_a_ex_3", name: "Wiosłowanie hantlem w opadzie", targetMuscle: "Plecy", sets: 3, targetReps: "10-12", restSeconds: 60 },
      { id: "rtn_fbw_a_ex_4", name: "Wyciskanie hantli nad głowę", targetMuscle: "Barki", sets: 3, targetReps: "10-12", restSeconds: 60 },
      { id: "rtn_fbw_a_ex_5", name: "Plank (deska)", targetMuscle: "Brzuch", sets: 3, targetReps: "30-45 sek", restSeconds: 45 },
    ],
  },
  {
    id: "rtn_fbw_b",
    userId: null,
    title: "FBW B — Całe ciało",
    description: "Drugi wariant treningu całego ciała. Wykonuj na zmianę z FBW A.",
    level: "beginner",
    daysPerWeek: 3,
    durationMinutes: 45,
    exercises: [
      { id: "rtn_fbw_b_ex_1", name: "Martwy ciąg rumuński", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", restSeconds: 90 },
      { id: "rtn_fbw_b_ex_2", name: "Ściąganie drążka wyciągu górnego", targetMuscle: "Plecy", sets: 3, targetReps: "10-12", restSeconds: 60 },
      { id: "rtn_fbw_b_ex_3", name: "Wyciskanie hantli na ławce skośnej", targetMuscle: "Klatka piersiowa", sets: 3, targetReps: "10-12", restSeconds: 60 },
      { id: "rtn_fbw_b_ex_4", name: "Wykroki z hantlami", targetMuscle: "Nogi", sets: 3, targetReps: "10 na nogę", restSeconds: 60 },
      { id: "rtn_fbw_b_ex_5", name: "Uginanie ramion z hantlami", targetMuscle: "Biceps", sets: 2, targetReps: "12-15", restSeconds: 45 },
    ],
  },
];

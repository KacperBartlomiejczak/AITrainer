import {
  buildNewWorkoutSession,
  buildRoutineFromDraft,
  toRoutineItem,
  toUserRoutineCard,
  toWorkoutDetail,
} from "../routine-mappers";
import { RoutineItemSchema } from "@/schemas/routine.schema";
import type { RoutineDraft } from "@/schemas/routine-form.schema";
import { UserRoutineCardSchema } from "@/schemas/user-profile-screen.schema";
import { WorkoutDetailSchema } from "@/schemas/workout-session.schema";
import { NewUserRoutineSchema, NewWorkoutSessionSchema, type Routine } from "@/schemas/workout-history.schema";

const routine: Routine = {
  id: "rtn_fbw_a",
  userId: null,
  title: "FBW A — Całe ciało",
  description: "Podstawowy trening całego ciała.",
  level: "beginner",
  daysPerWeek: 3,
  durationMinutes: 45,
  createdAt: new Date("2026-09-13T10:00:00.000Z"),
  updatedAt: new Date("2026-09-13T10:00:00.000Z"),
  exercises: [
    { id: "ex_1", name: "Przysiad", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", restSeconds: 90 },
    { id: "ex_2", name: "Wykroki", targetMuscle: "Nogi", sets: 3, targetReps: "10", restSeconds: 60 },
    { id: "ex_3", name: "Pompki", targetMuscle: "Klatka", sets: 3, targetReps: "10", restSeconds: 60 },
  ],
};

describe("routine mappers", () => {
  it("maps a routine to a profile routine card with unique muscle groups", () => {
    const card = toUserRoutineCard(routine);

    expect(UserRoutineCardSchema.safeParse(card).success).toBe(true);
    expect(card).toEqual({
      id: "rtn_fbw_a",
      title: "FBW A — Całe ciało",
      targetMuscleGroups: ["Nogi", "Klatka"],
      daysPerWeek: 3,
      durationMinutes: 45,
      exerciseCount: 3,
      levelLabel: "Początkujący",
    });
  });

  it("maps a routine to a workouts list item", () => {
    const item = toRoutineItem(routine);
    expect(RoutineItemSchema.safeParse(item).success).toBe(true);
    expect(item.exerciseCount).toBe(3);
    expect(item.isUserCreated).toBe(false);
  });

  it("marks a user-owned routine as user-created", () => {
    const item = toRoutineItem({ ...routine, userId: "local" });
    expect(item.isUserCreated).toBe(true);
  });

  it("maps a routine to the workout detail screen model", () => {
    const detail = toWorkoutDetail(routine);
    expect(WorkoutDetailSchema.safeParse(detail).success).toBe(true);
    expect(detail.exercises.map((exercise) => exercise.id)).toEqual(["ex_1", "ex_2", "ex_3"]);
  });
});

describe("buildNewWorkoutSession", () => {
  it("snapshots routine exercises and marks which ones were completed", () => {
    const startedAt = new Date("2026-09-13T17:00:00.000Z");
    const completedAt = new Date("2026-09-13T17:40:00.000Z");
    const session = buildNewWorkoutSession({
      routine,
      completedExerciseIds: ["ex_3", "ex_1", "unknown"],
      startedAt,
      completedAt,
    });

    expect(NewWorkoutSessionSchema.safeParse(session).success).toBe(true);
    expect(session).toEqual({
      routineId: "rtn_fbw_a",
      title: "FBW A — Całe ciało",
      startedAt,
      completedAt,
      exercises: [
        { name: "Przysiad", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true },
        { name: "Wykroki", targetMuscle: "Nogi", sets: 3, targetReps: "10", completed: false },
        { name: "Pompki", targetMuscle: "Klatka", sets: 3, targetReps: "10", completed: true },
      ],
    });
  });
});

describe("buildRoutineFromDraft", () => {
  const draft: RoutineDraft = {
    title: "Push day",
    description: "Klatka, barki, triceps",
    level: "intermediate",
    daysPerWeek: 3,
    durationMinutes: 45,
    exercises: [
      {
        id: "row_1",
        catalogExerciseId: "0025",
        name: "Wyciskanie sztangi na ławce poziomej",
        targetMuscle: "Klatka piersiowa",
        sets: 4,
        targetReps: "8-10",
        restSeconds: 90,
      },
    ],
  };

  it("builds a valid new user routine, generating fresh ids and dropping the catalog id", () => {
    let counter = 0;
    const createId = (prefix: string) => `${prefix}_${++counter}`;

    const routine = buildRoutineFromDraft(draft, createId);

    expect(NewUserRoutineSchema.safeParse(routine).success).toBe(true);
    expect(routine).toEqual({
      id: "rtn_1",
      title: "Push day",
      description: "Klatka, barki, triceps",
      level: "intermediate",
      daysPerWeek: 3,
      durationMinutes: 45,
      exercises: [
        {
          id: "rtx_2",
          name: "Wyciskanie sztangi na ławce poziomej",
          targetMuscle: "Klatka piersiowa",
          sets: 4,
          targetReps: "8-10",
          restSeconds: 90,
        },
      ],
    });
  });
});

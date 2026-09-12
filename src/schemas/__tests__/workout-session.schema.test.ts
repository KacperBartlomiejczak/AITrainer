import {
  WorkoutExerciseItemSchema,
  WorkoutDetailSchema,
  ActiveWorkoutSessionSchema,
} from "../workout-session.schema";

describe("workout-session.schema", () => {
  const validExercise = {
    id: "ex_1",
    name: "Wyciskanie sztangi",
    targetMuscle: "Klatka",
    sets: 4,
    targetReps: "8-10",
    restSeconds: 90,
    completed: false,
  };

  const validDetail = {
    id: "rtn_fbw_01",
    title: "FBW dla Początkujących",
    description: "Kompleksowy trening całego ciała",
    durationMinutes: 45,
    level: "beginner",
    targetMuscleGroups: ["Klatka", "Plecy"],
    exercises: [validExercise],
  };

  it("validates a valid exercise item", () => {
    const parsed = WorkoutExerciseItemSchema.safeParse(validExercise);
    expect(parsed.success).toBe(true);
  });

  it("fails exercise item when sets is negative or zero", () => {
    const parsed = WorkoutExerciseItemSchema.safeParse({
      ...validExercise,
      sets: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it("validates a valid workout detail", () => {
    const parsed = WorkoutDetailSchema.safeParse(validDetail);
    expect(parsed.success).toBe(true);
  });

  it("fails workout detail if exercises array is empty", () => {
    const parsed = WorkoutDetailSchema.safeParse({
      ...validDetail,
      exercises: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("validates active workout session schema", () => {
    const session = {
      routineId: "rtn_fbw_01",
      startedAt: new Date().toISOString(),
      isPaused: false,
      elapsedSeconds: 120,
      currentExerciseIndex: 0,
      completedExerciseIds: [],
      isFinished: false,
    };
    const parsed = ActiveWorkoutSessionSchema.safeParse(session);
    expect(parsed.success).toBe(true);
  });
});

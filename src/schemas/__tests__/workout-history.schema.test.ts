import {
  NewRoutineSchema,
  NewWorkoutSessionSchema,
  PickedImageResultSchema,
  PickWorkoutPhotoResultSchema,
  PersonalRecordTypeSchema,
  RoutineRowSchema,
  SetTagSchema,
  WorkoutPhotoFileNameSchema,
  WorkoutPhotoSourceSchema,
  WorkoutSessionExportSchema,
  WorkoutSessionRowSchema,
  WorkoutSessionSetRowSchema,
  type NewWorkoutSession,
} from "../workout-history.schema";
import { LOCAL_USER_ID } from "../database.schema";

const startedAt = new Date("2026-09-13T17:00:00.000Z");
const completedAt = new Date("2026-09-13T17:45:00.000Z");

const validNewSession: NewWorkoutSession = {
  routineId: "rtn_fbw_a",
  title: "FBW A — Całe ciało",
  startedAt,
  completedAt,
  exercises: [
    { name: "Przysiad", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true },
    { name: "Plank", targetMuscle: "Brzuch", sets: 3, targetReps: "45 sek", completed: false },
  ],
};

describe("WorkoutPhotoFileNameSchema", () => {
  it.each(["wks_abc-1726246800000.jpg", "session_1.png", "a.heic", "x-y_z.webp", "p.jpeg"])(
    "accepts a plain file name %s",
    (fileName) => {
      expect(WorkoutPhotoFileNameSchema.safeParse(fileName).success).toBe(true);
    },
  );

  it.each([
    "../secret.jpg",
    "photos/a.jpg",
    "file:///document/a.jpg",
    "a.gif",
    "a.jpg.exe",
    "",
    "no-extension",
  ])("rejects paths, URIs and unsupported files: %s", (fileName) => {
    expect(WorkoutPhotoFileNameSchema.safeParse(fileName).success).toBe(false);
  });
});

describe("WorkoutPhotoSourceSchema", () => {
  it("allows only camera or library", () => {
    expect(WorkoutPhotoSourceSchema.options).toEqual(["camera", "library"]);
  });
});

describe("RoutineRowSchema", () => {
  const row = {
    id: "rtn_fbw_a",
    userId: null,
    title: "FBW A",
    description: "Całe ciało",
    level: "beginner",
    daysPerWeek: 3,
    durationMinutes: 45,
    createdAt: startedAt,
    updatedAt: startedAt,
  };

  it("accepts a built-in routine without an owner", () => {
    expect(RoutineRowSchema.safeParse(row).success).toBe(true);
  });

  it("accepts a routine owned by the local user", () => {
    expect(RoutineRowSchema.safeParse({ ...row, userId: LOCAL_USER_ID }).success).toBe(true);
  });

  it("rejects more than 7 training days per week and unknown levels", () => {
    expect(RoutineRowSchema.safeParse({ ...row, daysPerWeek: 8 }).success).toBe(false);
    expect(RoutineRowSchema.safeParse({ ...row, level: "pro" }).success).toBe(false);
  });
});

describe("NewRoutineSchema", () => {
  it("requires at least one exercise", () => {
    const result = NewRoutineSchema.safeParse({
      id: "rtn_empty",
      userId: null,
      title: "Pusta",
      description: "Brak ćwiczeń",
      level: "beginner",
      daysPerWeek: 3,
      durationMinutes: 30,
      exercises: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("WorkoutSessionRowSchema", () => {
  const row = {
    id: "wks_1",
    userId: LOCAL_USER_ID,
    routineId: null,
    title: "FBW A",
    startedAt,
    completedAt,
    durationSeconds: 2700,
    photoFileName: null,
    createdAt: completedAt,
  };

  it("accepts a session without a photo (photo is optional)", () => {
    expect(WorkoutSessionRowSchema.safeParse(row).success).toBe(true);
  });

  it("accepts a session with a valid photo file name", () => {
    expect(
      WorkoutSessionRowSchema.safeParse({ ...row, photoFileName: "wks_1-1.jpg" }).success,
    ).toBe(true);
  });

  it("rejects a photo stored as a path", () => {
    expect(
      WorkoutSessionRowSchema.safeParse({ ...row, photoFileName: "../../etc/passwd.jpg" }).success,
    ).toBe(false);
  });
});

describe("NewWorkoutSessionSchema", () => {
  it("accepts a finished workout with at least one completed exercise", () => {
    expect(NewWorkoutSessionSchema.safeParse(validNewSession).success).toBe(true);
  });

  it("rejects a workout without any completed exercise with a Polish message", () => {
    const result = NewWorkoutSessionSchema.safeParse({
      ...validNewSession,
      exercises: validNewSession.exercises.map((exercise) => ({ ...exercise, completed: false })),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Odhacz przynajmniej jedno ćwiczenie, aby zapisać trening",
    );
  });

  it("rejects a workout that ends before it started", () => {
    const result = NewWorkoutSessionSchema.safeParse({
      ...validNewSession,
      completedAt: new Date(startedAt.getTime() - 1000),
    });
    expect(result.success).toBe(false);
  });
});

describe("PickedImageResultSchema", () => {
  it("accepts canceled and picked results from expo-image-picker", () => {
    expect(PickedImageResultSchema.safeParse({ canceled: true, assets: null }).success).toBe(true);
    expect(
      PickedImageResultSchema.safeParse({ canceled: false, assets: [{ uri: "file:///cache/a.jpg" }] })
        .success,
    ).toBe(true);
  });

  it("rejects an unexpected payload", () => {
    expect(PickedImageResultSchema.safeParse({ cancelled: false }).success).toBe(false);
    expect(PickedImageResultSchema.safeParse({ canceled: false, assets: [{}] }).success).toBe(false);
  });
});

describe("PickWorkoutPhotoResultSchema", () => {
  it("requires a uri only for picked photos", () => {
    expect(PickWorkoutPhotoResultSchema.safeParse({ status: "picked" }).success).toBe(false);
    expect(PickWorkoutPhotoResultSchema.safeParse({ status: "canceled" }).success).toBe(true);
  });
});

describe("WorkoutSessionExportSchema", () => {
  it("exports dates as ISO strings and only a photo flag (no file path)", () => {
    const result = WorkoutSessionExportSchema.safeParse({
      id: "wks_1",
      routineId: "rtn_fbw_a",
      title: "FBW A",
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationSeconds: 2700,
      hasPhoto: true,
      exercises: [{ name: "Przysiad", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true }],
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("photoFileName");
  });
});

describe("WorkoutSessionSetRowSchema", () => {
  const row = {
    id: "wss_1",
    sessionExerciseId: "wse_1",
    position: 0,
    weightKg: 62.5,
    reps: 8,
    tag: null,
    isOneRepMaxRecord: false,
    isBestSetVolumeRecord: false,
    isMaxRepsRecord: false,
  };

  it("accepts a regular set and every set tag", () => {
    expect(WorkoutSessionSetRowSchema.safeParse(row).success).toBe(true);
    for (const tag of SetTagSchema.options) {
      expect(WorkoutSessionSetRowSchema.safeParse({ ...row, tag }).success).toBe(true);
    }
  });

  it("requires all three record flags (no legacy isPersonalRecord)", () => {
    expect(WorkoutSessionSetRowSchema.safeParse({ ...row, isMaxRepsRecord: undefined }).success).toBe(false);
    expect(PersonalRecordTypeSchema.options).toEqual(["one_rep_max", "best_set_volume", "max_reps"]);
  });

  it.each([{ weightKg: -1 }, { reps: 0 }, { tag: "pr" }, { position: -1 }])("rejects %p", (override) => {
    expect(WorkoutSessionSetRowSchema.safeParse({ ...row, ...override }).success).toBe(false);
  });
});

describe("NewWorkoutSessionSchema with logged sets", () => {
  const loggedSet = {
    weightKg: 80,
    reps: 5,
    tag: null,
    isOneRepMaxRecord: true,
    isBestSetVolumeRecord: true,
    isMaxRepsRecord: false,
  };

  it("accepts logged sets and a catalog exercise id on a completed exercise", () => {
    const result = NewWorkoutSessionSchema.safeParse({
      ...validNewSession,
      routineId: null,
      exercises: [{ ...validNewSession.exercises[0], catalogExerciseId: "0025", loggedSets: [loggedSet] }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects logged sets on an exercise that is not completed", () => {
    const result = NewWorkoutSessionSchema.safeParse({
      ...validNewSession,
      exercises: [
        validNewSession.exercises[0],
        { ...validNewSession.exercises[1], loggedSets: [loggedSet] },
      ],
    });
    expect(result.success).toBe(false);
  });
});

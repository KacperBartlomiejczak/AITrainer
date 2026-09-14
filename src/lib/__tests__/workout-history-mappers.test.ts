import {
  formatSetsSummary,
  toCompletedWorkoutDetail,
  toRecentActivity,
  toRoutinePhotoItem,
  toWorkoutSessionExport,
} from "../workout-history-mappers";
import {
  CompletedWorkoutDetailSchema,
  RoutinePhotoItemSchema,
} from "@/schemas/user-profile-screen.schema";
import { RecentActivitySchema } from "@/schemas/workout.schema";
import { WorkoutSessionExportSchema, type WorkoutHistoryEntry } from "@/schemas/workout-history.schema";

const now = new Date(2026, 8, 13, 20, 0);

const entry: WorkoutHistoryEntry = {
  id: "wks_1",
  userId: "local",
  routineId: "rtn_fbw_a",
  title: "FBW A — Całe ciało",
  startedAt: new Date(2026, 8, 12, 17, 45),
  completedAt: new Date(2026, 8, 12, 18, 30),
  durationSeconds: 2700,
  photoFileName: "wks_1-1.jpg",
  createdAt: new Date(2026, 8, 12, 18, 30),
  photoUri: "file:///document/workout-photos/wks_1-1.jpg",
  exercises: [
    // Routine workout: exercises are only ticked, no sets are logged
    { id: "wse_1", catalogExerciseId: null, name: "Przysiad", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true, loggedSets: [] },
    { id: "wse_2", catalogExerciseId: null, name: "Wyciskanie", targetMuscle: "Klatka", sets: 1, targetReps: "10", completed: true, loggedSets: [] },
    { id: "wse_3", catalogExerciseId: null, name: "Plank", targetMuscle: "Brzuch", sets: 5, targetReps: "45 sek", completed: false, loggedSets: [] },
  ],
};

describe("formatSetsSummary", () => {
  it("uses Polish plural forms for sets", () => {
    expect(formatSetsSummary({ sets: 1, targetReps: "10", completed: true })).toBe("1 seria × 10");
    expect(formatSetsSummary({ sets: 3, targetReps: "8-10", completed: true })).toBe("3 serie × 8-10");
    expect(formatSetsSummary({ sets: 5, targetReps: "5", completed: true })).toBe("5 serii × 5");
  });

  it("marks skipped exercises", () => {
    expect(formatSetsSummary({ sets: 3, targetReps: "10", completed: false })).toBe("Pominięte");
  });
});

describe("toCompletedWorkoutDetail", () => {
  it("maps a stored session to a valid profile history card", () => {
    const detail = toCompletedWorkoutDetail(entry, now);

    expect(CompletedWorkoutDetailSchema.safeParse(detail).success).toBe(true);
    expect(detail).toMatchObject({
      id: "wks_1",
      title: "FBW A — Całe ciało",
      subtitle: "Nogi, Klatka, Brzuch",
      completedDate: "Wczoraj, 18:30",
      durationMinutes: 45,
      completedExerciseCount: 2,
      photoUri: entry.photoUri,
      achievements: [],
    });
    expect(detail.exercises[2]).toMatchObject({ name: "Plank", setsSummary: "Pominięte", completed: false });
  });

  it("keeps photoUri null for a workout without a photo", () => {
    expect(toCompletedWorkoutDetail({ ...entry, photoFileName: null, photoUri: null }, now).photoUri).toBeNull();
  });
});

describe("toRoutinePhotoItem", () => {
  it("builds a carousel item only for workouts with a photo", () => {
    const withPhoto = toRoutinePhotoItem(toCompletedWorkoutDetail(entry, now));
    expect(RoutinePhotoItemSchema.safeParse(withPhoto).success).toBe(true);

    const withoutPhoto = toRoutinePhotoItem(
      toCompletedWorkoutDetail({ ...entry, photoFileName: null, photoUri: null }, now),
    );
    expect(withoutPhoto).toBeNull();
  });
});

describe("toRecentActivity", () => {
  it("summarizes the latest workout for the home screen", () => {
    const activity = toRecentActivity(entry, now);

    expect(RecentActivitySchema.safeParse(activity).success).toBe(true);
    expect(activity).toEqual({
      id: "wks_1",
      title: "FBW A — Całe ciało",
      completedAt: "Wczoraj, 18:30",
      durationMinutes: 45,
      completedExerciseCount: 2,
      totalExerciseCount: 3,
      photoUri: entry.photoUri,
    });
  });
});

describe("toWorkoutSessionExport", () => {
  it("exports ISO dates and a photo flag without the file name", () => {
    const exported = toWorkoutSessionExport(entry);

    expect(WorkoutSessionExportSchema.safeParse(exported).success).toBe(true);
    expect(exported.hasPhoto).toBe(true);
    expect(exported.startedAt).toBe(entry.startedAt.toISOString());
    expect(JSON.stringify(exported)).not.toContain("wks_1-1.jpg");
  });
});

describe("logged workouts (empty workout with sets)", () => {
  const loggedEntry: WorkoutHistoryEntry = {
    ...entry,
    routineId: null,
    title: "Push day",
    exercises: [
      {
        id: "wse_10",
        catalogExerciseId: "0025",
        name: "Wyciskanie sztangi",
        targetMuscle: "Klatka piersiowa",
        sets: 3,
        targetReps: "5–10",
        completed: true,
        loggedSets: [
          { id: "wss_1", weightKg: 40, reps: 10, tag: "warmup", isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false },
          { id: "wss_2", weightKg: 82.5, reps: 5, tag: null, isOneRepMaxRecord: true, isBestSetVolumeRecord: false, isMaxRepsRecord: false },
          { id: "wss_3", weightKg: 70, reps: 8, tag: "drop_set", isOneRepMaxRecord: false, isBestSetVolumeRecord: true, isMaxRepsRecord: false },
        ],
      },
      {
        id: "wse_11",
        catalogExerciseId: "0033",
        name: "Pompki",
        targetMuscle: "Klatka piersiowa",
        sets: 1,
        targetReps: "25",
        completed: true,
        loggedSets: [{ id: "wss_4", weightKg: 0, reps: 25, tag: null, isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: true }],
      },
    ],
  };

  it("summarizes logged sets with the heaviest working set and describes every record type", () => {
    const detail = toCompletedWorkoutDetail(loggedEntry, now);

    expect(CompletedWorkoutDetailSchema.safeParse(detail).success).toBe(true);
    expect(detail.exercises).toEqual([
      {
        id: "wse_10",
        name: "Wyciskanie sztangi",
        setsSummary: "3 serie • maks. 82,5 kg × 5",
        completed: true,
        isPersonalRecord: true,
        // 1RM of 82,5 kg × 5 ≈ 96,25 kg → rounded to 0,5 kg
        recordNote: "Max ≈ 96,5 kg • Rekordowa seria: 560 kg",
      },
      {
        id: "wse_11",
        name: "Pompki",
        setsSummary: "1 seria • maks. 25 powt.",
        completed: true,
        isPersonalRecord: true,
        recordNote: "Najwięcej powtórzeń: 25",
      },
    ]);
  });

  it("lists each personal record and the workout volume (without warm-ups) as achievements", () => {
    const detail = toCompletedWorkoutDetail(loggedEntry, now);

    expect(detail.achievements).toEqual([
      {
        id: "pr-one_rep_max-wse_10",
        title: "Nowy max – Wyciskanie sztangi",
        description: "≈ 96,5 kg (82,5 kg × 5)",
        icon: "🏆",
        badgeColor: "#F59E0B",
      },
      {
        id: "pr-best_set_volume-wse_10",
        title: "Rekordowa seria – Wyciskanie sztangi",
        description: "560 kg (70 kg × 8)",
        icon: "🔥",
        badgeColor: "#22C55E",
      },
      {
        id: "pr-max_reps-wse_11",
        title: "Najwięcej powtórzeń – Pompki",
        description: "25 powt.",
        icon: "💪",
        badgeColor: "#38BDF8",
      },
      {
        id: "volume",
        title: "Tonaż treningu",
        description: "972,5 kg",
        icon: "🏋️",
        badgeColor: "#007AFF",
      },
    ]);
  });

  it("shows the exact weight for a one-rep max set", () => {
    const singleRep: WorkoutHistoryEntry = {
      ...loggedEntry,
      exercises: [
        {
          ...loggedEntry.exercises[0]!,
          loggedSets: [{ id: "wss_9", weightKg: 100, reps: 1, tag: null, isOneRepMaxRecord: true, isBestSetVolumeRecord: false, isMaxRepsRecord: false }],
        },
      ],
    };
    const detail = toCompletedWorkoutDetail(singleRep, now);

    expect(detail.exercises[0]?.recordNote).toBe("Max: 100 kg");
    expect(detail.achievements[0]?.description).toBe("100 kg (1 powt.)");
  });

  it("exports logged sets without internal ids", () => {
    const exported = toWorkoutSessionExport(loggedEntry);

    expect(WorkoutSessionExportSchema.safeParse(exported).success).toBe(true);
    expect(exported.exercises[0]?.loggedSets).toEqual([
      { weightKg: 40, reps: 10, tag: "warmup", isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false },
      { weightKg: 82.5, reps: 5, tag: null, isOneRepMaxRecord: true, isBestSetVolumeRecord: false, isMaxRepsRecord: false },
      { weightKg: 70, reps: 8, tag: "drop_set", isOneRepMaxRecord: false, isBestSetVolumeRecord: true, isMaxRepsRecord: false },
    ]);
    expect(JSON.stringify(exported)).not.toContain("wss_");
  });
});

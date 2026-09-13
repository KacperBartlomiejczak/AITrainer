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
    { id: "wse_1", name: "Przysiad", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true },
    { id: "wse_2", name: "Wyciskanie", targetMuscle: "Klatka", sets: 1, targetReps: "10", completed: true },
    { id: "wse_3", name: "Plank", targetMuscle: "Brzuch", sets: 5, targetReps: "45 sek", completed: false },
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

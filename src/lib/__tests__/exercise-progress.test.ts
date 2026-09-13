import { ExerciseProgressSchema, MAX_PROGRESS_POINTS } from "@/schemas/exercise-progress.schema";
import { buildExerciseProgress, getProgressValue, type ProgressSessionSets } from "../exercise-progress";

const session = (
  sessionId: string,
  day: number,
  sets: ProgressSessionSets["sets"],
): ProgressSessionSets => ({ sessionId, completedAt: new Date(2026, 8, day, 18), sets });

describe("buildExerciseProgress", () => {
  it("returns an empty progress for an exercise that was never saved", () => {
    expect(buildExerciseProgress("0025", [])).toEqual({
      catalogExerciseId: "0025",
      points: [],
      summary: { oneRepMaxKg: null, heaviestSet: null, bestSetVolume: null, maxReps: null, workoutCount: 0 },
    });
  });

  it("builds one chart point per workout (oldest first) and an all-time summary", () => {
    const progress = buildExerciseProgress("0025", [
      session("wks_2", 12, [
        { weightKg: 85, reps: 3, tag: null },
        { weightKg: 70, reps: 10, tag: "drop_set" },
      ]),
      session("wks_1", 10, [
        { weightKg: 40, reps: 10, tag: "warmup" },
        { weightKg: 80, reps: 5, tag: null },
      ]),
    ]);

    expect(ExerciseProgressSchema.safeParse(progress).success).toBe(true);
    expect(progress.points).toEqual([
      { sessionId: "wks_1", completedAt: new Date(2026, 8, 10, 18), oneRepMaxKg: 93.33, bestSetVolumeKg: 400, maxReps: null },
      { sessionId: "wks_2", completedAt: new Date(2026, 8, 12, 18), oneRepMaxKg: 93.5, bestSetVolumeKg: 700, maxReps: null },
    ]);
    expect(progress.summary).toEqual({
      oneRepMaxKg: 93.5,
      heaviestSet: { weightKg: 85, reps: 3 },
      bestSetVolume: { weightKg: 70, reps: 10, volumeKg: 700 },
      maxReps: null,
      workoutCount: 2,
    });
  });

  it("ignores warm-ups and failed sets, and workouts with nothing else", () => {
    const progress = buildExerciseProgress("0025", [
      session("wks_1", 10, [{ weightKg: 150, reps: 1, tag: "failed" }]),
      session("wks_2", 11, [
        { weightKg: 120, reps: 5, tag: "warmup" },
        { weightKg: 60, reps: 8, tag: null },
      ]),
    ]);

    expect(progress.points.map((point) => point.sessionId)).toEqual(["wks_2"]);
    expect(progress.summary.heaviestSet).toEqual({ weightKg: 60, reps: 8 });
    expect(progress.summary.workoutCount).toBe(1);
  });

  it("tracks most reps for bodyweight sets", () => {
    const progress = buildExerciseProgress("1311", [
      session("wks_1", 10, [{ weightKg: 0, reps: 20, tag: null }]),
      session("wks_2", 12, [{ weightKg: 0, reps: 26, tag: null }]),
    ]);

    expect(progress.points.map((point) => point.maxReps)).toEqual([20, 26]);
    expect(progress.summary).toMatchObject({ oneRepMaxKg: null, heaviestSet: null, bestSetVolume: null, maxReps: 26 });
  });

  it("keeps only the last workouts on the chart, but all of them in the summary", () => {
    const sessions = Array.from({ length: MAX_PROGRESS_POINTS + 3 }, (_, index) =>
      session(`wks_${index}`, index + 1, [{ weightKg: index === 0 ? 200 : 50, reps: 1, tag: null }]),
    );
    const progress = buildExerciseProgress("0025", sessions);

    expect(progress.points).toHaveLength(MAX_PROGRESS_POINTS);
    expect(progress.points[0]?.sessionId).toBe("wks_3");
    expect(progress.summary).toMatchObject({ oneRepMaxKg: 200, workoutCount: MAX_PROGRESS_POINTS + 3 });
  });
});

describe("getProgressValue", () => {
  it("reads the value of the selected chart metric", () => {
    const point = { sessionId: "w", completedAt: new Date(), oneRepMaxKg: 90, bestSetVolumeKg: 500, maxReps: null };
    expect(getProgressValue(point, "one_rep_max")).toBe(90);
    expect(getProgressValue(point, "best_set_volume")).toBe(500);
    expect(getProgressValue(point, "max_reps")).toBeNull();
  });
});

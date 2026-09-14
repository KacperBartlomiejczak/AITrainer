import {
  ExerciseProgressSchema,
  MAX_PROGRESS_POINTS,
  PROGRESS_METRIC_LABELS,
  ProgressMetricSchema,
  type ExerciseProgress,
} from "../exercise-progress.schema";

const progress: ExerciseProgress = {
  catalogExerciseId: "0025",
  points: [
    {
      sessionId: "wks_1",
      completedAt: new Date("2026-09-10T18:00:00.000Z"),
      oneRepMaxKg: 93.33,
      bestSetVolumeKg: 400,
      maxReps: null,
    },
  ],
  summary: {
    oneRepMaxKg: 93.33,
    heaviestSet: { weightKg: 80, reps: 5 },
    bestSetVolume: { weightKg: 80, reps: 5, volumeKg: 400 },
    maxReps: null,
    workoutCount: 1,
  },
};

describe("ExerciseProgressSchema", () => {
  it("accepts progress of an exercise and an empty history", () => {
    expect(ExerciseProgressSchema.safeParse(progress).success).toBe(true);
    expect(
      ExerciseProgressSchema.safeParse({
        catalogExerciseId: "0025",
        points: [],
        summary: { oneRepMaxKg: null, heaviestSet: null, bestSetVolume: null, maxReps: null, workoutCount: 0 },
      }).success,
    ).toBe(true);
  });

  it("caps the chart at the last workouts and rejects invalid results", () => {
    const tooMany = Array.from({ length: MAX_PROGRESS_POINTS + 1 }, (_, index) => ({
      ...progress.points[0]!,
      sessionId: `wks_${index}`,
    }));
    expect(ExerciseProgressSchema.safeParse({ ...progress, points: tooMany }).success).toBe(false);
    expect(
      ExerciseProgressSchema.safeParse({ ...progress, summary: { ...progress.summary, heaviestSet: { weightKg: -1, reps: 5 } } })
        .success,
    ).toBe(false);
  });

  it("labels every chart metric", () => {
    for (const metric of ProgressMetricSchema.options) {
      expect(PROGRESS_METRIC_LABELS[metric].label.length).toBeGreaterThan(0);
    }
  });
});

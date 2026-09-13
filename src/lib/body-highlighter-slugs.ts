import type { ExtendedBodyPart, Slug } from "react-native-body-highlighter";
import type { RankingMuscleGroup } from "@/schemas/ranking.schema";
import type { TrainedMuscle } from "@/schemas/live-workout.schema";

/** Body diagram slugs painted for each ranking muscle group (shared by the ranking and the workout screens). */
export const RANKING_MUSCLE_SLUGS: Readonly<Record<RankingMuscleGroup, readonly Slug[]>> = {
  chest: ["chest"],
  shoulders: ["deltoids"],
  biceps: ["biceps"],
  triceps: ["triceps"],
  abs: ["abs", "obliques"],
  back: ["trapezius", "upper-back", "lower-back"],
  legs: ["quadriceps", "gluteal", "hamstring", "calves"],
};

export const TRAINED_MUSCLE_COLORS = {
  primary: "#007AFF",
  secondary: "#1E4E8C",
} as const;

/** Muscles trained in a workout → highlighted parts (primary: full color, secondary: dimmed). */
export function toTrainedBodyParts(trainedMuscles: readonly TrainedMuscle[]): ExtendedBodyPart[] {
  return trainedMuscles.flatMap(({ muscle, intensity }) =>
    RANKING_MUSCLE_SLUGS[muscle].map((slug) => ({ slug, styles: { fill: TRAINED_MUSCLE_COLORS[intensity] } })),
  );
}

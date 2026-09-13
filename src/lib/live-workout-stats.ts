import {
  SET_TAG_META,
  type LiveWorkoutExercise,
  type LiveWorkoutSet,
  type LiveWorkoutStats,
  type TrainedMuscle,
} from "@/schemas/live-workout.schema";

/** Pure calculations for the live workout header (timer, sets, volume, body diagram). */

/** A set can be ticked once reps are typed in; an empty weight means bodyweight. */
export function canCompleteSet(set: Pick<LiveWorkoutSet, "reps">): boolean {
  return set.reps !== null;
}

function trainedMuscles(exercises: readonly LiveWorkoutExercise[]): TrainedMuscle[] {
  const trained = exercises.filter((exercise) => exercise.sets.some((set) => set.isCompleted));
  const primary = new Set(trained.flatMap((exercise) => exercise.primaryMuscles));
  const secondary = new Set(
    trained.flatMap((exercise) => exercise.secondaryMuscles).filter((muscle) => !primary.has(muscle)),
  );
  return [
    ...[...primary].map((muscle) => ({ muscle, intensity: "primary" as const })),
    ...[...secondary].map((muscle) => ({ muscle, intensity: "secondary" as const })),
  ];
}

/** Σ kg × reps of completed sets. Warm-ups do not add to the volume; failed sets were still (partly) lifted. */
export function computeVolumeKg(completedSets: readonly Pick<LiveWorkoutSet, "weightKg" | "reps" | "tag">[]): number {
  return completedSets
    .filter((set) => set.tag !== "warmup")
    .reduce((sum, set) => sum + (set.weightKg ?? 0) * (set.reps ?? 0), 0);
}

export function computeLiveWorkoutStats(exercises: readonly LiveWorkoutExercise[]): LiveWorkoutStats {
  const completedSets = exercises.flatMap((exercise) => exercise.sets.filter((set) => set.isCompleted));

  return {
    completedSetCount: completedSets.length,
    totalVolumeKg: computeVolumeKg(completedSets),
    trainedMuscles: trainedMuscles(exercises),
  };
}

/** "1", "2"… for regular sets; "R" / "D" / "NU" for tagged sets. */
export function getSetLabels(sets: readonly Pick<LiveWorkoutSet, "tag">[]): string[] {
  let regularSetNumber = 0;
  return sets.map((set) => (set.tag ? SET_TAG_META[set.tag].short : String(++regularSetNumber)));
}

const pad = (value: number) => String(value).padStart(2, "0");

export function formatElapsed(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** Weight or volume in Polish notation: "12 345,5 kg" (no Intl — Hermes locale data differs between platforms). */
export function formatKg(volumeKg: number): string {
  const rounded = Math.round(volumeKg * 10) / 10;
  const [integerPart = "0", fractionPart] = rounded.toString().split(".");
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${fractionPart ? `${grouped},${fractionPart}` : grouped} kg`;
}

/** Estimated values (1RM) are shown rounded to 0,5 kg: "≈ 96,5 kg" */
export function formatEstimatedKg(kg: number): string {
  return `≈ ${formatKg(Math.round(kg * 2) / 2)}`;
}

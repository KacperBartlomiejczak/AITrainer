import type { LiveWorkoutExercise, LiveWorkoutSet, LiveWorkoutSetPatch } from "@/schemas/live-workout.schema";
import { canCompleteSet } from "./live-workout-stats";

/** A set can follow the weight typed in another set only if it is a regular set the user has not ticked yet */
const followsTypedWeight = (set: LiveWorkoutSet) => set.tag === null && !set.isCompleted;

/**
 * Applies a (validated) patch to one set of an exercise.
 * Typing the weight of a regular set copies it to every unchecked regular set, so the user sets the working weight once.
 */
export function applySetPatch(
  exercise: LiveWorkoutExercise,
  setId: string,
  patch: LiveWorkoutSetPatch,
): LiveWorkoutExercise {
  const target = exercise.sets.find((set) => set.id === setId);
  if (!target) return exercise;

  const copiesWeight = patch.weightKg !== undefined && target.tag === null;

  return {
    ...exercise,
    sets: exercise.sets.map((set) => {
      if (set.id === setId) {
        const next = { ...set, ...patch };
        // A set without reps cannot stay completed
        return canCompleteSet(next) ? next : { ...next, isCompleted: false };
      }
      return copiesWeight && followsTypedWeight(set) ? { ...set, weightKg: patch.weightKg ?? null } : set;
    }),
  };
}

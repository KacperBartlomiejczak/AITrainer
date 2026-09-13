import { create } from "zustand";
import { createId } from "@/lib/create-id";
import { createLiveExercise, createNextSet } from "@/lib/live-workout-mappers";
import { applySetPatch } from "@/lib/live-workout-sets";
import { canCompleteSet } from "@/lib/live-workout-stats";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import {
  LiveWorkoutSetPatchSchema,
  MAX_LIVE_WORKOUT_EXERCISES,
  type LiveWorkoutExercise,
  type LiveWorkoutSession,
  type LiveWorkoutSet,
  type LiveWorkoutSetPatch,
} from "@/schemas/live-workout.schema";
import { MAX_SETS_PER_EXERCISE, type SetTag } from "@/schemas/workout-history.schema";

/** The empty workout in progress — shared by the workouts list (resume) and the workout screen. */
interface LiveWorkoutState {
  /** null = no empty workout is running */
  session: LiveWorkoutSession | null;
  /** Starts a new workout; keeps the running one if there is any. */
  startWorkout: (startedAt?: number) => void;
  /** false = no running workout, the exercise limit is reached or the exercise has no known muscles */
  addExercise: (exercise: CatalogExercise) => boolean;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, patch: LiveWorkoutSetPatch) => void;
  toggleSetCompleted: (exerciseId: string, setId: string) => void;
  setSetTag: (exerciseId: string, setId: string, tag: SetTag | null) => void;
  /** Removing the last set removes the exercise */
  removeSet: (exerciseId: string, setId: string) => void;
  /** Clears the workout (after saving it or when the user throws it away) */
  discardWorkout: () => void;
}

type SessionUpdater = (session: LiveWorkoutSession) => LiveWorkoutSession;
type SetUpdater = (set: LiveWorkoutSet) => LiveWorkoutSet;

function mapExercise(
  session: LiveWorkoutSession,
  exerciseId: string,
  update: (exercise: LiveWorkoutExercise) => LiveWorkoutExercise,
): LiveWorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((exercise) => (exercise.id === exerciseId ? update(exercise) : exercise)),
  };
}

function mapSet(session: LiveWorkoutSession, exerciseId: string, setId: string, update: SetUpdater) {
  return mapExercise(session, exerciseId, (exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => (set.id === setId ? update(set) : set)),
  }));
}

export const useLiveWorkoutStore = create<LiveWorkoutState>((set, get) => {
  const updateSession = (updater: SessionUpdater) =>
    set((state) => (state.session ? { session: updater(state.session) } : state));

  return {
    session: null,

    startWorkout: (startedAt = Date.now()) =>
      set((state) => (state.session ? state : { session: { startedAt, exercises: [] } })),

    addExercise: (catalogExercise) => {
      const { session } = get();
      if (!session || session.exercises.length >= MAX_LIVE_WORKOUT_EXERCISES) return false;
      const exercise = createLiveExercise(catalogExercise, createId);
      if (!exercise) {
        console.warn("[live-workout] Exercise has no known muscle group", { id: catalogExercise.id });
        return false;
      }
      set({ session: { ...session, exercises: [...session.exercises, exercise] } });
      return true;
    },

    removeExercise: (exerciseId) =>
      updateSession((session) => ({
        ...session,
        exercises: session.exercises.filter((exercise) => exercise.id !== exerciseId),
      })),

    addSet: (exerciseId) =>
      updateSession((session) =>
        mapExercise(session, exerciseId, (exercise) =>
          exercise.sets.length >= MAX_SETS_PER_EXERCISE
            ? exercise
            : { ...exercise, sets: [...exercise.sets, createNextSet(exercise.sets.at(-1), createId)] },
        ),
      ),

    updateSet: (exerciseId, setId, patch) => {
      const parsed = LiveWorkoutSetPatchSchema.safeParse(patch);
      if (!parsed.success) return;
      updateSession((session) => mapExercise(session, exerciseId, (exercise) => applySetPatch(exercise, setId, parsed.data)));
    },

    toggleSetCompleted: (exerciseId, setId) =>
      updateSession((session) =>
        mapSet(session, exerciseId, setId, (current) =>
          current.isCompleted || canCompleteSet(current) ? { ...current, isCompleted: !current.isCompleted } : current,
        ),
      ),

    setSetTag: (exerciseId, setId, tag) =>
      updateSession((session) => mapSet(session, exerciseId, setId, (current) => ({ ...current, tag }))),

    removeSet: (exerciseId, setId) =>
      updateSession((session) => ({
        ...session,
        exercises: session.exercises.flatMap((exercise) => {
          if (exercise.id !== exerciseId) return [exercise];
          const sets = exercise.sets.filter((current) => current.id !== setId);
          return sets.length > 0 ? [{ ...exercise, sets }] : [];
        }),
      })),

    discardWorkout: () => set({ session: null }),
  };
});

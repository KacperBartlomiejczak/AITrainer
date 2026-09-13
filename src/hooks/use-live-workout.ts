import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { loadPersonalBests } from "@/db/workout-history";
import { computeLiveWorkoutStats } from "@/lib/live-workout-stats";
import { countPersonalRecords, findPersonalRecordHits } from "@/lib/personal-records";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import type { LiveWorkoutExercise, PersonalBest } from "@/schemas/live-workout.schema";
import type { SetTag } from "@/schemas/workout-history.schema";
import { useLiveWorkoutStore } from "@/stores/live-workout.store";
import type { AsyncResourceStatus } from "./use-async-resource";
import { useElapsedSeconds } from "./use-elapsed-seconds";

const NO_EXERCISES: LiveWorkoutExercise[] = [];

export interface SetTagDialogTarget {
  exerciseId: string;
  setId: string;
}

interface PersonalBestsResult {
  catalogIdsKey: string;
  personalBests: PersonalBest[];
  failed: boolean;
}

/** Records for the exercises in the workout, reloaded when the user adds a different exercise. */
function usePersonalBests(exercises: readonly LiveWorkoutExercise[]) {
  const [result, setResult] = useState<PersonalBestsResult | null>(null);
  const catalogIdsKey = useMemo(
    () => [...new Set(exercises.map((exercise) => exercise.catalogExerciseId))].sort().join("|"),
    [exercises],
  );

  useEffect(() => {
    let isCurrent = true;
    loadPersonalBests(catalogIdsKey ? catalogIdsKey.split("|") : [])
      .then((personalBests) => {
        if (isCurrent) setResult({ catalogIdsKey, personalBests, failed: false });
      })
      .catch((error: unknown) => {
        // Without records the workout still works — just no PR badges
        console.error("[db] Failed to load personal bests", error);
        if (isCurrent) setResult({ catalogIdsKey, personalBests: [], failed: true });
      });
    return () => {
      isCurrent = false;
    };
  }, [catalogIdsKey]);

  const status: AsyncResourceStatus =
    result?.catalogIdsKey !== catalogIdsKey ? "loading" : result.failed ? "error" : "ready";
  // While new records load, the previous ones stay valid for exercises already in the workout
  return { personalBests: result?.personalBests ?? [], status };
}

/** The empty workout screen: running session, live stats, automatic PRs and the set tag dialog. */
export function useLiveWorkout() {
  const router = useRouter();
  const session = useLiveWorkoutStore((state) => state.session);
  const startWorkout = useLiveWorkoutStore((state) => state.startWorkout);
  const addExercise = useLiveWorkoutStore((state) => state.addExercise);
  const removeExercise = useLiveWorkoutStore((state) => state.removeExercise);
  const addSet = useLiveWorkoutStore((state) => state.addSet);
  const updateSet = useLiveWorkoutStore((state) => state.updateSet);
  const toggleSetCompleted = useLiveWorkoutStore((state) => state.toggleSetCompleted);
  const setSetTag = useLiveWorkoutStore((state) => state.setSetTag);
  const removeSet = useLiveWorkoutStore((state) => state.removeSet);
  const discard = useLiveWorkoutStore((state) => state.discardWorkout);
  const [tagDialogTarget, setTagDialogTarget] = useState<SetTagDialogTarget | null>(null);

  // Opening the screen starts a workout, or resumes the one already running
  useEffect(() => {
    startWorkout();
  }, [startWorkout]);

  const exercises = session?.exercises ?? NO_EXERCISES;
  const elapsedSeconds = useElapsedSeconds(session?.startedAt ?? null);
  const stats = useMemo(() => computeLiveWorkoutStats(exercises), [exercises]);
  const { personalBests, status: personalBestsStatus } = usePersonalBests(exercises);
  const personalRecordHits = useMemo(
    () => findPersonalRecordHits(exercises, personalBests),
    [exercises, personalBests],
  );

  const tagDialogSet = useMemo(
    () =>
      tagDialogTarget
        ? exercises
            .find((exercise) => exercise.id === tagDialogTarget.exerciseId)
            ?.sets.find((set) => set.id === tagDialogTarget.setId) ?? null
        : null,
    [exercises, tagDialogTarget],
  );

  const openTagDialog = useCallback((exerciseId: string, setId: string) => {
    setTagDialogTarget({ exerciseId, setId });
  }, []);
  const closeTagDialog = useCallback(() => setTagDialogTarget(null), []);

  const selectTag = useCallback(
    (tag: SetTag | null) => {
      if (tagDialogTarget) setSetTag(tagDialogTarget.exerciseId, tagDialogTarget.setId, tag);
      setTagDialogTarget(null);
    },
    [tagDialogTarget, setSetTag],
  );

  const removeTaggedSet = useCallback(() => {
    if (tagDialogTarget) removeSet(tagDialogTarget.exerciseId, tagDialogTarget.setId);
    setTagDialogTarget(null);
  }, [tagDialogTarget, removeSet]);

  const discardWorkout = useCallback(() => {
    discard();
    router.replace("/workouts" as never);
  }, [discard, router]);

  const confirmDiscard = useCallback(() => {
    Alert.alert("Odrzucić trening?", "Wszystkie serie z tego treningu zostaną usunięte.", [
      { text: "Anuluj", style: "cancel" },
      { text: "Odrzuć", style: "destructive", onPress: discardWorkout },
    ]);
  }, [discardWorkout]);

  const goBack = useCallback(() => {
    // The workout keeps running in the store; the user can resume it from the workouts list
    router.push("/workouts" as never);
  }, [router]);

  return {
    exercises,
    elapsedSeconds,
    stats,
    personalRecordHits,
    personalRecordCount: countPersonalRecords(personalRecordHits),
    personalBestsStatus,
    addExercise: (exercise: CatalogExercise) => addExercise(exercise),
    removeExercise,
    addSet,
    updateSet,
    toggleSetCompleted,
    setSetTag,
    tagDialogTarget,
    /** The set being tagged; null = dialog closed (or the set no longer exists) */
    tagDialogSet,
    openTagDialog,
    closeTagDialog,
    selectTag,
    removeTaggedSet,
    discardWorkout,
    confirmDiscard,
    goBack,
  };
}

export type LiveWorkoutController = ReturnType<typeof useLiveWorkout>;

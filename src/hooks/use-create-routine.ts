import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { createRoutine } from "@/db/workout-history";
import { createId } from "@/lib/create-id";
import { buildRoutineFromDraft } from "@/lib/routine-mappers";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import {
  DEFAULT_ROUTINE_REST_SECONDS,
  DEFAULT_ROUTINE_SETS,
  DEFAULT_ROUTINE_TARGET_REPS,
  RoutineDraftSchema,
  type RoutineDraftExercise,
} from "@/schemas/routine-form.schema";
import type { RoutineLevel } from "@/schemas/routine.schema";
import { NewUserRoutineSchema } from "@/schemas/workout-history.schema";
import { useExercisePicker } from "./use-exercise-picker";

export const CREATE_ROUTINE_MESSAGES = {
  saveFailed: "Nie udało się zapisać rutyny. Spróbuj ponownie.",
} as const;

type ExerciseDraftPatch = Partial<Pick<RoutineDraftExercise, "sets" | "targetReps" | "restSeconds">>;

/** "Stwórz nową rutynę": basic info, exercises picked from the catalog, then save. */
export function useCreateRoutine() {
  const router = useRouter();
  const picker = useExercisePicker();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<RoutineLevel>("beginner");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [exercises, setExercises] = useState<RoutineDraftExercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addExercise = useCallback(
    (exercise: CatalogExercise) => {
      setExercises((current) => [
        ...current,
        {
          id: createId("row"),
          catalogExerciseId: exercise.id,
          name: exercise.name,
          targetMuscle: exercise.target,
          sets: DEFAULT_ROUTINE_SETS,
          targetReps: DEFAULT_ROUTINE_TARGET_REPS,
          restSeconds: DEFAULT_ROUTINE_REST_SECONDS,
        },
      ]);
      picker.close();
    },
    [picker],
  );

  const removeExercise = useCallback((rowId: string) => {
    setExercises((current) => current.filter((exercise) => exercise.id !== rowId));
  }, []);

  const updateExercise = useCallback((rowId: string, patch: ExerciseDraftPatch) => {
    setExercises((current) => current.map((exercise) => (exercise.id === rowId ? { ...exercise, ...patch } : exercise)));
  }, []);

  const canSave = title.trim().length > 0 && description.trim().length > 0 && exercises.length > 0;

  const save = useCallback(async () => {
    if (isSaving) return;
    const draft = RoutineDraftSchema.safeParse({
      title,
      description,
      level,
      daysPerWeek,
      durationMinutes,
      exercises,
    });
    if (!draft.success) {
      setErrorMessage(draft.error.issues[0]?.message ?? CREATE_ROUTINE_MESSAGES.saveFailed);
      return;
    }
    const candidate = NewUserRoutineSchema.safeParse(buildRoutineFromDraft(draft.data, createId));
    if (!candidate.success) {
      console.warn("[routine] Draft routine failed validation", candidate.error.issues);
      setErrorMessage(CREATE_ROUTINE_MESSAGES.saveFailed);
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      await createRoutine(candidate.data);
      router.back();
    } catch (error: unknown) {
      console.error("[db] Failed to save the routine", error);
      setErrorMessage(CREATE_ROUTINE_MESSAGES.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, title, description, level, daysPerWeek, durationMinutes, exercises, router]);

  return {
    picker,
    title,
    setTitle,
    description,
    setDescription,
    level,
    setLevel,
    daysPerWeek,
    setDaysPerWeek,
    durationMinutes,
    setDurationMinutes,
    exercises,
    addExercise,
    removeExercise,
    updateExercise,
    canSave,
    isSaving,
    errorMessage,
    save,
  };
}

export type CreateRoutineController = ReturnType<typeof useCreateRoutine>;

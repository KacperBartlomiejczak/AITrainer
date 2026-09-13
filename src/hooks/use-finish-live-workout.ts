import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { saveLiveWorkout } from "@/db/workout-history";
import { createId } from "@/lib/create-id";
import { buildRoutineFromLiveWorkout, buildSessionFromLiveWorkout } from "@/lib/live-workout-mappers";
import { pickWorkoutPhoto } from "@/lib/workout-photo-picker";
import { FinishWorkoutFormSchema, type PersonalRecordHits } from "@/schemas/live-workout.schema";
import { RoutineLevelSchema, type RoutineLevel } from "@/schemas/routine.schema";
import {
  NewUserRoutineSchema,
  NewWorkoutSessionSchema,
  type NewUserRoutine,
  type WorkoutPhotoSource,
} from "@/schemas/workout-history.schema";
import { useLiveWorkoutStore } from "@/stores/live-workout.store";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { WORKOUT_PHOTO_MESSAGES } from "./use-workout-photo";

export const FINISH_WORKOUT_MESSAGES = {
  noCompletedSets: "Odhacz przynajmniej jedną serię, aby zakończyć trening.",
  saveFailed: "Nie udało się zapisać treningu. Spróbuj ponownie.",
  photoNotSaved: "Nie udało się dodać zdjęcia. Możesz dodać je później w profilu.",
  routineNotSaved: "Nie udało się zapisać rutyny. Trening został zapisany.",
} as const;

interface UseFinishLiveWorkoutOptions {
  personalRecordHits: PersonalRecordHits;
}

function useRoutineLevel(): RoutineLevel {
  const experienceLevel = useOnboardingStore((state) => state.onboardingData?.experienceLevel);
  const parsed = RoutineLevelSchema.safeParse(experienceLevel);
  return parsed.success ? parsed.data : "beginner";
}

/** "Zakończ trening" → confirmation: name, optional photo, "save as routine", then saving to the database. */
export function useFinishLiveWorkout({ personalRecordHits }: UseFinishLiveWorkoutOptions) {
  const router = useRouter();
  const session = useLiveWorkoutStore((state) => state.session);
  const discardWorkout = useLiveWorkoutStore((state) => state.discardWorkout);
  const routineLevel = useRoutineLevel();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saveAsRoutine, setSaveAsRoutine] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasCompletedSet = session?.exercises.some((exercise) => exercise.sets.some((set) => set.isCompleted)) ?? false;

  const openSummary = useCallback(() => {
    if (!hasCompletedSet) {
      setErrorMessage(FINISH_WORKOUT_MESSAGES.noCompletedSets);
      return;
    }
    setErrorMessage(null);
    setIsSummaryOpen(true);
  }, [hasCompletedSet]);

  const closeSummary = useCallback(() => {
    setErrorMessage(null);
    setIsSummaryOpen(false);
  }, []);

  const toggleSaveAsRoutine = useCallback(() => setSaveAsRoutine((current) => !current), []);
  const removePhoto = useCallback(() => setPhotoUri(null), []);

  const pickPhoto = useCallback(async (source: WorkoutPhotoSource) => {
    setErrorMessage(null);
    setIsPickingPhoto(true);
    const result = await pickWorkoutPhoto(source);
    setIsPickingPhoto(false);
    if (result.status === "picked") {
      setPhotoUri(result.uri);
    } else if (result.status === "permission_denied") {
      setErrorMessage(
        source === "camera"
          ? WORKOUT_PHOTO_MESSAGES.cameraPermissionDenied
          : WORKOUT_PHOTO_MESSAGES.libraryPermissionDenied,
      );
    } else if (result.status === "failed") {
      setErrorMessage(WORKOUT_PHOTO_MESSAGES.pickFailed);
    }
  }, []);

  const save = useCallback(async () => {
    if (!session || isSaving) return;
    const form = FinishWorkoutFormSchema.safeParse({ title, saveAsRoutine, photoUri });
    if (!form.success) {
      setErrorMessage(form.error.issues[0]?.message ?? FINISH_WORKOUT_MESSAGES.saveFailed);
      return;
    }

    const completedAt = new Date();
    const startedAt = new Date(session.startedAt);
    const candidate = NewWorkoutSessionSchema.safeParse(
      buildSessionFromLiveWorkout({
        exercises: session.exercises,
        title: form.data.title,
        startedAt,
        completedAt,
        personalRecordHits,
      }),
    );
    if (!candidate.success) {
      console.warn("[live-workout] Finished workout failed validation", candidate.error.issues);
      setErrorMessage(candidate.error.issues[0]?.message ?? FINISH_WORKOUT_MESSAGES.saveFailed);
      return;
    }

    let routine: NewUserRoutine | null = null;
    if (form.data.saveAsRoutine) {
      const routineCandidate = NewUserRoutineSchema.safeParse(
        buildRoutineFromLiveWorkout({
          exercises: session.exercises,
          title: form.data.title,
          level: routineLevel,
          durationSeconds: (completedAt.getTime() - startedAt.getTime()) / 1000,
          completedAt,
          createId,
        }),
      );
      if (routineCandidate.success) routine = routineCandidate.data;
      else console.warn("[live-workout] Routine from workout failed validation", routineCandidate.error.issues);
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      const result = await saveLiveWorkout({ session: candidate.data, routine, photoUri: form.data.photoUri });
      discardWorkout();
      setIsSummaryOpen(false);
      if (form.data.photoUri && !result.photoSaved) {
        Alert.alert("Trening zapisany", FINISH_WORKOUT_MESSAGES.photoNotSaved);
      } else if (form.data.saveAsRoutine && !result.routineSaved) {
        Alert.alert("Trening zapisany", FINISH_WORKOUT_MESSAGES.routineNotSaved);
      }
      router.replace("/user-profile" as never);
    } catch (error: unknown) {
      console.error("[db] Failed to save the empty workout", error);
      setErrorMessage(FINISH_WORKOUT_MESSAGES.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }, [session, isSaving, title, saveAsRoutine, photoUri, personalRecordHits, routineLevel, discardWorkout, router]);

  return {
    isSummaryOpen,
    openSummary,
    closeSummary,
    title,
    setTitle,
    saveAsRoutine,
    toggleSaveAsRoutine,
    photoUri,
    isPickingPhoto,
    pickPhoto,
    removePhoto,
    isSaving,
    errorMessage,
    save,
  };
}

export type FinishLiveWorkoutController = ReturnType<typeof useFinishLiveWorkout>;

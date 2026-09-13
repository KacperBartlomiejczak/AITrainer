import { useCallback, useState } from "react";
import { attachPhotoToWorkout, removePhotoFromWorkout } from "@/db/workout-history";
import { pickWorkoutPhoto } from "@/lib/workout-photo-picker";
import type { WorkoutPhotoSource, WorkoutSessionId } from "@/schemas/workout-history.schema";

export const WORKOUT_PHOTO_MESSAGES = {
  cameraPermissionDenied: "Brak dostępu do aparatu. Zezwól na dostęp w ustawieniach telefonu.",
  libraryPermissionDenied: "Brak dostępu do galerii. Zezwól na dostęp w ustawieniach telefonu.",
  pickFailed: "Nie udało się wybrać zdjęcia. Spróbuj ponownie.",
  saveFailed: "Nie udało się zapisać zdjęcia. Spróbuj ponownie.",
  removeFailed: "Nie udało się usunąć zdjęcia. Spróbuj ponownie.",
} as const;

export interface UseWorkoutPhotoOptions {
  /** Called after a photo was attached or removed (e.g. reload history or navigate). */
  onPhotoChanged?: () => void;
}

/** Optional photo for a completed workout: the user picks the camera or the gallery. */
export function useWorkoutPhoto({ onPhotoChanged }: UseWorkoutPhotoOptions = {}) {
  const [targetSessionId, setTargetSessionId] = useState<WorkoutSessionId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openPhotoSheet = useCallback((sessionId: WorkoutSessionId) => {
    setErrorMessage(null);
    setTargetSessionId(sessionId);
  }, []);

  const closePhotoSheet = useCallback(() => {
    setErrorMessage(null);
    setTargetSessionId(null);
  }, []);

  const finishChange = useCallback(() => {
    setTargetSessionId(null);
    onPhotoChanged?.();
  }, [onPhotoChanged]);

  const selectPhotoSource = useCallback(
    async (source: WorkoutPhotoSource) => {
      if (!targetSessionId || isSaving) return;
      setErrorMessage(null);
      setIsSaving(true);
      try {
        const result = await pickWorkoutPhoto(source);
        if (result.status === "permission_denied") {
          setErrorMessage(
            source === "camera"
              ? WORKOUT_PHOTO_MESSAGES.cameraPermissionDenied
              : WORKOUT_PHOTO_MESSAGES.libraryPermissionDenied,
          );
        } else if (result.status === "failed") {
          setErrorMessage(WORKOUT_PHOTO_MESSAGES.pickFailed);
        } else if (result.status === "picked") {
          await attachPhotoToWorkout(targetSessionId, result.uri);
          finishChange();
        }
      } catch (error: unknown) {
        console.error("[photos] Failed to save a workout photo", error);
        setErrorMessage(WORKOUT_PHOTO_MESSAGES.saveFailed);
      } finally {
        setIsSaving(false);
      }
    },
    [targetSessionId, isSaving, finishChange],
  );

  const removePhoto = useCallback(async () => {
    if (!targetSessionId || isSaving) return;
    setErrorMessage(null);
    setIsSaving(true);
    try {
      await removePhotoFromWorkout(targetSessionId);
      finishChange();
    } catch (error: unknown) {
      console.error("[photos] Failed to remove a workout photo", error);
      setErrorMessage(WORKOUT_PHOTO_MESSAGES.removeFailed);
    } finally {
      setIsSaving(false);
    }
  }, [targetSessionId, isSaving, finishChange]);

  return {
    targetSessionId,
    isPhotoSheetOpen: targetSessionId !== null,
    isSaving,
    errorMessage,
    openPhotoSheet,
    closePhotoSheet,
    selectPhotoSource,
    removePhoto,
  };
}

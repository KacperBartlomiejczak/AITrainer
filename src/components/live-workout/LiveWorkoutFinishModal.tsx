import React from "react";
import type { FinishLiveWorkoutController } from "@/hooks/use-finish-live-workout";
import { getDefaultWorkoutTitle } from "@/lib/live-workout-mappers";
import type { LiveWorkoutStats } from "@/schemas/live-workout.schema";
import { FinishWorkoutSection } from "./FinishWorkoutSection";

interface LiveWorkoutFinishModalProps {
  finish: FinishLiveWorkoutController;
  stats: LiveWorkoutStats;
  elapsedSeconds: number;
  personalRecordCount: number;
}

/** Connects the finish form state to the confirmation section. */
export function LiveWorkoutFinishModal({ finish, stats, elapsedSeconds, personalRecordCount }: LiveWorkoutFinishModalProps) {
  return (
    <FinishWorkoutSection
      visible={finish.isSummaryOpen}
      elapsedSeconds={elapsedSeconds}
      completedSetCount={stats.completedSetCount}
      totalVolumeKg={stats.totalVolumeKg}
      personalRecordCount={personalRecordCount}
      title={finish.title}
      titlePlaceholder={getDefaultWorkoutTitle(new Date())}
      onChangeTitle={finish.setTitle}
      saveAsRoutine={finish.saveAsRoutine}
      onToggleSaveAsRoutine={finish.toggleSaveAsRoutine}
      photoUri={finish.photoUri}
      isPickingPhoto={finish.isPickingPhoto}
      onPickPhoto={(source) => void finish.pickPhoto(source)}
      onRemovePhoto={finish.removePhoto}
      isSaving={finish.isSaving}
      errorMessage={finish.errorMessage}
      onSave={() => void finish.save()}
      onClose={finish.closeSummary}
    />
  );
}

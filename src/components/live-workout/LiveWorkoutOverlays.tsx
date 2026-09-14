import React from "react";
import { ExercisePreviewModal } from "@/components/exercises/ExercisePreviewModal";
import type { ExercisePickerController } from "@/hooks/use-exercise-picker";
import type { ExercisePreviewController } from "@/hooks/use-exercise-preview";
import type { ExerciseProgressSheetController } from "@/hooks/use-exercise-progress-sheet";
import type { LiveWorkoutController } from "@/hooks/use-live-workout";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import { ExercisePickerModal } from "./ExercisePickerModal";
import { ExerciseProgressSheet } from "./ExerciseProgressSheet";
import { SetTagDialog } from "./SetTagDialog";

interface LiveWorkoutOverlaysProps {
  workout: LiveWorkoutController;
  picker: ExercisePickerController;
  preview: ExercisePreviewController;
  progress: ExerciseProgressSheetController;
  onAddExercise: (exercise: CatalogExercise) => void;
}

/** Modals and bottom sheets of the live workout screen, connected to their hooks. */
export function LiveWorkoutOverlays({ workout, picker, preview, progress, onAddExercise }: LiveWorkoutOverlaysProps) {
  return (
    <>
      <ExercisePickerModal
        visible={picker.isOpen}
        query={picker.query}
        exercises={picker.exercises}
        muscleFilter={picker.muscleFilter}
        equipmentFilter={picker.equipmentFilter}
        hasActiveFilters={picker.hasActiveFilters}
        activeFilterCount={picker.activeFilterCount}
        isFilterSheetOpen={picker.isFilterSheetOpen}
        previewExercise={picker.previewExercise}
        onChangeQuery={picker.setQuery}
        onSelectMuscle={picker.setMuscleFilter}
        onSelectEquipment={picker.setEquipmentFilter}
        onResetFilters={picker.resetFilters}
        onOpenFilterSheet={picker.openFilterSheet}
        onCloseFilterSheet={picker.closeFilterSheet}
        onPreview={picker.openPreview}
        onClosePreview={picker.closePreview}
        onAdd={onAddExercise}
        onClose={picker.close}
      />
      <ExercisePreviewModal
        exercise={preview.previewExercise}
        visible={preview.previewExercise !== null}
        onClose={preview.closePreview}
      />
      <ExerciseProgressSheet
        target={progress.target}
        status={progress.status}
        progress={progress.progress}
        availableMetrics={progress.availableMetrics}
        metric={progress.metric}
        techniqueExercise={progress.techniqueExercise}
        onSelectMetric={progress.setMetric}
        onShowTechnique={progress.showTechnique}
        onCloseTechnique={progress.closeTechnique}
        onClose={progress.close}
      />
      <SetTagDialog
        visible={workout.tagDialogSet !== null}
        currentTag={workout.tagDialogSet?.tag ?? null}
        onSelect={workout.selectTag}
        onRemoveSet={workout.removeTaggedSet}
        onClose={workout.closeTagDialog}
      />
    </>
  );
}

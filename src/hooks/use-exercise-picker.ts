import { useCallback, useMemo, useState } from "react";
import { filterPickerExercises } from "@/lib/exercise-picker-filter";
import { PICKABLE_EXERCISES } from "@/lib/pickable-exercises";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import {
  DEFAULT_PICKER_FILTERS,
  PICKER_QUERY_MAX_LENGTH,
  type PickerEquipmentFilter,
  type PickerMuscleFilter,
} from "@/schemas/exercise-picker.schema";

/** "Dodaj ćwiczenie" modal: open state, search, filter bottom sheet (muscle group / equipment) and the exercise preview. */
export function useExercisePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState(DEFAULT_PICKER_FILTERS.query);
  const [muscleFilter, setMuscleFilter] = useState<PickerMuscleFilter>(DEFAULT_PICKER_FILTERS.muscle);
  const [equipmentFilter, setEquipmentFilter] = useState<PickerEquipmentFilter>(DEFAULT_PICKER_FILTERS.equipment);
  const [previewExercise, setPreviewExercise] = useState<CatalogExercise | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const exercises = useMemo(
    () => filterPickerExercises(PICKABLE_EXERCISES, { muscle: muscleFilter, equipment: equipmentFilter, query }),
    [muscleFilter, equipmentFilter, query],
  );

  const setQuery = useCallback((text: string) => setQueryState(text.slice(0, PICKER_QUERY_MAX_LENGTH)), []);

  const resetFilters = useCallback(() => {
    setQueryState(DEFAULT_PICKER_FILTERS.query);
    setMuscleFilter(DEFAULT_PICKER_FILTERS.muscle);
    setEquipmentFilter(DEFAULT_PICKER_FILTERS.equipment);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setIsFilterSheetOpen(false);
    setPreviewExercise(null);
    resetFilters();
  }, [resetFilters]);

  const openFilterSheet = useCallback(() => setIsFilterSheetOpen(true), []);
  const closeFilterSheet = useCallback(() => setIsFilterSheetOpen(false), []);

  const openPreview = useCallback((exercise: CatalogExercise) => setPreviewExercise(exercise), []);
  const closePreview = useCallback(() => setPreviewExercise(null), []);

  return {
    isOpen,
    open,
    close,
    query,
    setQuery,
    muscleFilter,
    setMuscleFilter,
    equipmentFilter,
    setEquipmentFilter,
    hasActiveFilters: muscleFilter !== "all" || equipmentFilter !== "all" || query.trim() !== "",
    /** Filters chosen in the bottom sheet (the search phrase is not counted) */
    activeFilterCount: Number(muscleFilter !== "all") + Number(equipmentFilter !== "all"),
    isFilterSheetOpen,
    openFilterSheet,
    closeFilterSheet,
    resetFilters,
    exercises,
    previewExercise,
    openPreview,
    closePreview,
  };
}

export type ExercisePickerController = ReturnType<typeof useExercisePicker>;

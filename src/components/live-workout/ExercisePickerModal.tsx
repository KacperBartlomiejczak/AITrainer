import React from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { ExercisePreviewModal } from "@/components/exercises/ExercisePreviewModal";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import type { PickerEquipmentFilter, PickerMuscleFilter } from "@/schemas/exercise-picker.schema";
import { ExercisePickerEmpty } from "./ExercisePickerEmpty";
import { ExercisePickerFilterSheet } from "./ExercisePickerFilterSheet";
import { ExercisePickerItem } from "./ExercisePickerItem";
import { ExercisePickerSearchRow } from "./ExercisePickerSearchRow";

interface ExercisePickerModalProps {
  visible: boolean;
  query: string;
  exercises: readonly CatalogExercise[];
  muscleFilter: PickerMuscleFilter;
  equipmentFilter: PickerEquipmentFilter;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  isFilterSheetOpen: boolean;
  previewExercise: CatalogExercise | null;
  onChangeQuery: (query: string) => void;
  onSelectMuscle: (muscle: PickerMuscleFilter) => void;
  onSelectEquipment: (equipment: PickerEquipmentFilter) => void;
  onResetFilters: () => void;
  onOpenFilterSheet: () => void;
  onCloseFilterSheet: () => void;
  onPreview: (exercise: CatalogExercise) => void;
  onClosePreview: () => void;
  onAdd: (exercise: CatalogExercise) => void;
  onClose: () => void;
}

/** "Dodaj ćwiczenie": search + filter sheet, preview how an exercise is done, add it to the workout. */
export function ExercisePickerModal(props: ExercisePickerModalProps) {
  const { visible, query, exercises, previewExercise, onAdd, onClose } = props;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} testID="exercise-picker">
      <View className="flex-1 bg-black px-4 pt-5 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-black text-white">Dodaj ćwiczenie</Text>
          <Pressable
            testID="exercise-picker-close"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Zamknij wybór ćwiczeń"
            className="w-9 h-9 rounded-full bg-[#1E1E22] items-center justify-center"
          >
            <X size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        <ExercisePickerSearchRow
          query={query}
          activeFilterCount={props.activeFilterCount}
          onChangeQuery={props.onChangeQuery}
          onOpenFilters={props.onOpenFilterSheet}
        />

        <FlatList
          data={exercises}
          keyExtractor={(exercise) => exercise.id}
          renderItem={({ item }) => <ExercisePickerItem exercise={item} onPreview={props.onPreview} onAdd={onAdd} />}
          contentContainerStyle={{ gap: 8, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={50}
          ListEmptyComponent={
            <ExercisePickerEmpty hasActiveFilters={props.hasActiveFilters} onResetFilters={props.onResetFilters} />
          }
        />
      </View>

      {/* Rendered inside the picker's modal so they can stack on top of it (iOS) */}
      <ExercisePickerFilterSheet
        visible={props.isFilterSheetOpen}
        muscleFilter={props.muscleFilter}
        equipmentFilter={props.equipmentFilter}
        activeFilterCount={props.activeFilterCount}
        resultCount={exercises.length}
        onSelectMuscle={props.onSelectMuscle}
        onSelectEquipment={props.onSelectEquipment}
        onReset={props.onResetFilters}
        onClose={props.onCloseFilterSheet}
      />
      <ExercisePreviewModal
        exercise={previewExercise}
        visible={previewExercise !== null}
        onClose={props.onClosePreview}
        actionLabel="Dodaj do treningu"
        onAction={onAdd}
      />
    </Modal>
  );
}

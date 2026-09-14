import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { ExerciseFilterFooter } from "@/components/exercises/ExerciseFilterFooter";
import {
  PICKER_EQUIPMENT_OPTIONS,
  PICKER_MUSCLE_OPTIONS,
  type PickerEquipmentFilter,
  type PickerMuscleFilter,
} from "@/schemas/exercise-picker.schema";
import { FilterOptionGrid } from "./FilterOptionGrid";

interface ExercisePickerFilterSheetProps {
  visible: boolean;
  muscleFilter: PickerMuscleFilter;
  equipmentFilter: PickerEquipmentFilter;
  activeFilterCount: number;
  resultCount: number;
  onSelectMuscle: (muscle: PickerMuscleFilter) => void;
  onSelectEquipment: (equipment: PickerEquipmentFilter) => void;
  onReset: () => void;
  onClose: () => void;
}

/** Bottom sheet with muscle group and equipment filters of the "Dodaj ćwiczenie" list. */
export function ExercisePickerFilterSheet(props: ExercisePickerFilterSheetProps) {
  const { visible, onClose } = props;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} testID="exercise-picker-filter-sheet">
      <View className="flex-1 justify-end bg-black/70">
        <Pressable className="flex-1" onPress={onClose} accessibilityRole="button" accessibilityLabel="Zamknij filtry" />
        <View className="rounded-t-3xl bg-[#0A0A0C] border-t border-[#27272A] max-h-[85%]">
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-[#1E1E22]">
            <View className="flex-1 pr-3">
              <Text className="text-base font-black text-white">Filtry ćwiczeń</Text>
              <Text className="text-xs text-[#71717A] mt-0.5">Wybierz partię ciała i sprzęt</Text>
            </View>
            <Pressable
              testID="close-picker-filter-sheet"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Zamknij filtry"
              className="w-8 h-8 rounded-full bg-[#18181B] border border-[#27272A] items-center justify-center"
            >
              <X size={16} color="#A1A1AA" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }} showsVerticalScrollIndicator={false}>
            <FilterOptionGrid
              title="Partia ciała"
              testIDPrefix="picker-muscle"
              options={PICKER_MUSCLE_OPTIONS}
              selected={props.muscleFilter}
              onSelect={props.onSelectMuscle}
            />
            <FilterOptionGrid
              title="Sprzęt"
              testIDPrefix="picker-equipment"
              options={PICKER_EQUIPMENT_OPTIONS}
              selected={props.equipmentFilter}
              onSelect={props.onSelectEquipment}
            />
          </ScrollView>

          <ExerciseFilterFooter
            hasActiveFilters={props.activeFilterCount > 0}
            onResetFilters={props.onReset}
            onApply={onClose}
            totalResultsCount={props.resultCount}
          />
        </View>
      </View>
    </Modal>
  );
}

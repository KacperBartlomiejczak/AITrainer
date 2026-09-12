import React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { ExerciseMuscleFilterSection } from "./ExerciseMuscleFilterSection";
import { ExerciseEquipmentFilterSection } from "./ExerciseEquipmentFilterSection";
import { ExerciseFilterFooter } from "./ExerciseFilterFooter";
import type {
  ExerciseCategoryFilter,
  ExerciseEquipmentFilter,
} from "@/schemas/exercise-catalog.schema";

interface ExerciseFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: ExerciseCategoryFilter;
  onSelectCategory: (category: ExerciseCategoryFilter) => void;
  selectedEquipment: ExerciseEquipmentFilter;
  onSelectEquipment: (equipment: ExerciseEquipmentFilter) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

export function ExerciseFilterModal({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedEquipment,
  onSelectEquipment,
  onResetFilters,
  totalResultsCount,
}: ExerciseFilterModalProps) {
  const hasActiveFilters =
    selectedCategory !== "all" || selectedEquipment !== "all";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/80">
        <Pressable
          testID="filter-modal-backdrop"
          accessibilityRole="button"
          accessibilityLabel="Zamknij filtry"
          className="flex-1"
          onPress={onClose}
        />
        <View className="bg-[#0A0A0C] border-t border-[#27272A] rounded-t-3xl max-h-[85%] flex-col">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-[#1E1E22]">
            <View className="flex-1 pr-3">
              <Text className="text-base font-black text-white">Filtry ćwiczeń</Text>
              <Text className="text-xs text-[#71717A] mt-0.5">
                Dobierz partię mięśniową oraz dostępny sprzęt
              </Text>
            </View>
            <Pressable
              testID="close-filter-modal-button"
              accessibilityRole="button"
              accessibilityLabel="Zamknij okno filtrów"
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-[#18181B] items-center justify-center border border-[#27272A]"
            >
              <X size={16} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            contentContainerStyle={{ padding: 20, gap: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <ExerciseMuscleFilterSection
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
            />
            <ExerciseEquipmentFilterSection
              selectedEquipment={selectedEquipment}
              onSelectEquipment={onSelectEquipment}
            />
          </ScrollView>

          {/* Footer */}
          <ExerciseFilterFooter
            hasActiveFilters={hasActiveFilters}
            onResetFilters={onResetFilters}
            onApply={onClose}
            totalResultsCount={totalResultsCount}
          />
        </View>
      </View>
    </Modal>
  );
}



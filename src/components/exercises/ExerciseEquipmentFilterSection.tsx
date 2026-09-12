import React from "react";
import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import {
  type ExerciseEquipmentFilter,
  EQUIPMENT_FILTER_OPTIONS,
} from "@/schemas/exercise-catalog.schema";

interface ExerciseEquipmentFilterSectionProps {
  selectedEquipment: ExerciseEquipmentFilter;
  onSelectEquipment: (equipment: ExerciseEquipmentFilter) => void;
}

export function ExerciseEquipmentFilterSection({
  selectedEquipment,
  onSelectEquipment,
}: ExerciseEquipmentFilterSectionProps) {
  return (
    <View className="gap-2.5">
      <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
        Sprzęt treningowy
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {EQUIPMENT_FILTER_OPTIONS.map((item) => {
          const isSelected = selectedEquipment === item.id;
          return (
            <Pressable
              key={item.id}
              testID={`equipment-filter-${item.id}`}
              onPress={() => onSelectEquipment(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className={cn(
                "flex-row items-center gap-2 px-3.5 py-2.5 rounded-xl border",
                isSelected
                  ? "bg-[#007AFF] border-[#007AFF]"
                  : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
              )}
            >
              <Text className="text-base">{item.emoji}</Text>
              <Text
                className={cn(
                  "text-xs font-semibold",
                  isSelected ? "text-white" : "text-[#D4D4D8]"
                )}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

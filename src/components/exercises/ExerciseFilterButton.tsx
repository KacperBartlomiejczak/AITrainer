import React from "react";
import { Pressable, View, Text } from "react-native";
import { SlidersHorizontal } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface ExerciseFilterButtonProps {
  onPress: () => void;
  activeCount?: number;
  testID?: string;
}

export function ExerciseFilterButton({
  onPress,
  activeCount = 0,
  testID = "open-filters-button",
}: ExerciseFilterButtonProps) {
  const hasActiveFilters = activeCount > 0;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filtry ćwiczeń${
        hasActiveFilters ? `, aktywne filtry: ${activeCount}` : ""
      }`}
      className={cn(
        "w-11 h-11 rounded-2xl items-center justify-center border relative",
        hasActiveFilters
          ? "bg-[#007AFF]/20 border-[#007AFF]"
          : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
      )}
    >
      <SlidersHorizontal
        size={18}
        color={hasActiveFilters ? "#38BDF8" : "#A1A1AA"}
      />
      {hasActiveFilters && (
        <View
          testID="active-filter-badge"
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#007AFF] border-2 border-black items-center justify-center"
        >
          <Text className="text-[10px] font-extrabold text-white">
            {activeCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

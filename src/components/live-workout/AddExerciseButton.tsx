import React from "react";
import { Pressable, Text } from "react-native";
import { Plus } from "lucide-react-native";

interface AddExerciseButtonProps {
  disabled: boolean;
  onPress: () => void;
}

export function AddExerciseButton({ disabled, onPress }: AddExerciseButtonProps) {
  return (
    <Pressable
      testID="add-exercise-button"
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`flex-row items-center justify-center gap-2 rounded-2xl border border-[#007AFF]/40 bg-[#007AFF]/15 py-3.5 active:bg-[#007AFF]/30 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <Plus size={16} color="#007AFF" />
      <Text className="text-sm font-bold text-[#007AFF]">Dodaj ćwiczenie</Text>
    </Pressable>
  );
}

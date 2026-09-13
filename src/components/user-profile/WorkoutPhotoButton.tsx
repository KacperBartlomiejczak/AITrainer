import React from "react";
import { Pressable, Text } from "react-native";

interface WorkoutPhotoButtonProps {
  workoutId: string;
  hasPhoto: boolean;
  onPress: (workoutId: string) => void;
}

export function WorkoutPhotoButton({ workoutId, hasPhoto, onPress }: WorkoutPhotoButtonProps) {
  const label = hasPhoto ? "📷 Zmień zdjęcie" : "📷 Dodaj zdjęcie";
  return (
    <Pressable
      testID={`manage-photo-${workoutId}`}
      onPress={() => onPress(workoutId)}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="items-center py-2.5 border-t border-[#27272A] bg-[#121214] active:bg-[#1E1E22]"
    >
      <Text className="text-xs font-black text-[#38BDF8]">{label}</Text>
    </Pressable>
  );
}

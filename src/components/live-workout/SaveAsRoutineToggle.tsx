import React from "react";
import { Switch, Text, View } from "react-native";

interface SaveAsRoutineToggleProps {
  value: boolean;
  onToggle: () => void;
}

export function SaveAsRoutineToggle({ value, onToggle }: SaveAsRoutineToggleProps) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-2xl bg-[#121214] border border-[#27272A] p-3">
      <View className="flex-1">
        <Text className="text-sm font-bold text-white">Zapisz jako rutynę</Text>
        <Text className="text-xs text-[#71717A]">Powtórzysz ten plan jednym kliknięciem z listy rutyn</Text>
      </View>
      <Switch
        testID="save-as-routine-switch"
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#27272A", true: "#007AFF" }}
        accessibilityLabel="Zapisz trening jako rutynę"
      />
    </View>
  );
}

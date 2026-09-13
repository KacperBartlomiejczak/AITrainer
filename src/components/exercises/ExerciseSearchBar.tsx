import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { Search, X } from "lucide-react-native";

interface ExerciseSearchBarProps {
  query: string;
  onChangeQuery: (text: string) => void;
  onClear?: () => void;
}

export function ExerciseSearchBar({
  query,
  onChangeQuery,
  onClear,
}: ExerciseSearchBarProps) {
  return (
    <View className="flex-row items-center bg-[#121214] border border-[#27272A] rounded-2xl px-3.5 py-2.5 gap-2.5">
      <Search size={18} color="#71717A" />
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Szukaj ćwiczenia, mięśnia lub sprzętu..."
        placeholderTextColor="#52525B"
        className="flex-1 text-white text-sm font-medium p-0"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {query.length > 0 && (
        <Pressable
          testID="clear-search-button"
          accessibilityRole="button"
          accessibilityLabel="Wyczyść wyszukiwanie"
          onPress={() => {
            onChangeQuery("");
            onClear?.();
          }}
          className="w-6 h-6 rounded-full bg-[#27272A] items-center justify-center"
        >
          <X size={12} color="#A1A1AA" />
        </Pressable>
      )}
    </View>
  );
}

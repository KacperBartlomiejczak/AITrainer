import * as React from "react";
import { View, Text, TextInput } from "react-native";

interface ProfileNameSectionProps {
  name: string;
  onChangeName: (name: string) => void;
  error?: string;
}

export function ProfileNameSection({
  name,
  onChangeName,
  error,
}: ProfileNameSectionProps) {
  return (
    <View className="flex-col gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
          Twoje Imię
        </Text>
        <Text className="text-xs text-[#71717A]">{name.length}/50</Text>
      </View>

      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="Wpisz swoje imię"
        placeholderTextColor="#52525B"
        maxLength={50}
        autoCorrect={false}
        className={`w-full rounded-xl bg-[#121214] border ${
          error ? "border-red-500" : "border-[#27272A]"
        } px-4 py-3.5 text-base font-bold text-white`}
      />

      {error ? (
        <Text className="text-xs font-medium text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}

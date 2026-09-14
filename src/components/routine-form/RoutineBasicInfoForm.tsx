import React from "react";
import { Text, TextInput, View } from "react-native";
import { FilterChipRow } from "@/components/live-workout/FilterChipRow";
import { ROUTINE_DESCRIPTION_MAX_LENGTH, ROUTINE_TITLE_MAX_LENGTH } from "@/schemas/routine-form.schema";
import type { RoutineLevel } from "@/schemas/routine.schema";
import type { FilterOption } from "@/schemas/exercise-picker.schema";

interface RoutineBasicInfoFormProps {
  title: string;
  onChangeTitle: (title: string) => void;
  description: string;
  onChangeDescription: (description: string) => void;
  level: RoutineLevel;
  onChangeLevel: (level: RoutineLevel) => void;
  daysPerWeek: number;
  onChangeDaysPerWeek: (days: number) => void;
  durationMinutes: number;
  onChangeDurationMinutes: (minutes: number) => void;
}

const LEVEL_OPTIONS: readonly FilterOption<RoutineLevel>[] = [
  { id: "beginner", label: "Początkujący", emoji: "🌱" },
  { id: "intermediate", label: "Średni", emoji: "🔥" },
  { id: "advanced", label: "Zaawansowany", emoji: "⚡" },
];

/** Parses a numeric field, ignoring non-digit input rather than reporting NaN. */
function parsePositiveInt(text: string): number | null {
  const digitsOnly = text.replace(/[^0-9]/g, "");
  if (digitsOnly.length === 0) return null;
  return Number(digitsOnly);
}

export function RoutineBasicInfoForm({
  title,
  onChangeTitle,
  description,
  onChangeDescription,
  level,
  onChangeLevel,
  daysPerWeek,
  onChangeDaysPerWeek,
  durationMinutes,
  onChangeDurationMinutes,
}: RoutineBasicInfoFormProps) {
  return (
    <View className="flex-col gap-4">
      <View className="gap-2">
        <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Nazwa rutyny</Text>
        <TextInput
          testID="routine-title-input"
          value={title}
          onChangeText={onChangeTitle}
          placeholder="np. Push day"
          placeholderTextColor="#52525B"
          maxLength={ROUTINE_TITLE_MAX_LENGTH}
          className="rounded-xl bg-[#121214] border border-[#27272A] px-3 py-3 text-sm text-white"
        />
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Opis</Text>
        <TextInput
          testID="routine-description-input"
          value={description}
          onChangeText={onChangeDescription}
          placeholder="np. Klatka, barki i triceps"
          placeholderTextColor="#52525B"
          multiline
          maxLength={ROUTINE_DESCRIPTION_MAX_LENGTH}
          className="rounded-xl bg-[#121214] border border-[#27272A] px-3 py-3 text-sm text-white min-h-20"
        />
      </View>

      <View className="gap-2">
        <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Poziom</Text>
        <FilterChipRow
          testIDPrefix="routine-level"
          accessibilityLabel="Poziom trudności"
          options={LEVEL_OPTIONS}
          selected={level}
          onSelect={onChangeLevel}
        />
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 gap-2">
          <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Dni / tydzień</Text>
          <TextInput
            testID="routine-days-input"
            value={String(daysPerWeek)}
            onChangeText={(text) => {
              const parsed = parsePositiveInt(text);
              if (parsed !== null) onChangeDaysPerWeek(parsed);
            }}
            keyboardType="number-pad"
            className="rounded-xl bg-[#121214] border border-[#27272A] px-3 py-3 text-sm text-white"
          />
        </View>
        <View className="flex-1 gap-2">
          <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Czas (min)</Text>
          <TextInput
            testID="routine-duration-input"
            value={String(durationMinutes)}
            onChangeText={(text) => {
              const parsed = parsePositiveInt(text);
              if (parsed !== null) onChangeDurationMinutes(parsed);
            }}
            keyboardType="number-pad"
            className="rounded-xl bg-[#121214] border border-[#27272A] px-3 py-3 text-sm text-white"
          />
        </View>
      </View>
    </View>
  );
}

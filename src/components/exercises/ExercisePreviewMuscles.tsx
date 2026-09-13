import React from "react";
import { View, Text } from "react-native";
import { Dumbbell } from "lucide-react-native";

interface ExercisePreviewMusclesProps {
  muscleGroup: string;
  secondaryMuscles: string[];
}

const MUSCLE_LABEL: Record<string, string> = {
  chest: "Klatka",
  back: "Plecy",
  "upper legs": "Nogi",
  "upper arms": "Ramiona",
  shoulders: "Barki",
  waist: "Brzuch",
  cardio: "Cardio",
  "lower legs": "Łydki",
  "lower arms": "Przedramiona",
  biceps: "Biceps",
  triceps: "Triceps",
  quadriceps: "Czworogłowe",
  hamstrings: "Dwugłowe uda",
  glutes: "Pośladki",
  calves: "Łydki",
  abs: "Brzuch",
  lats: "Najszersze grzbietu",
  "upper back": "Górne plecy",
  "lower back": "Dolne plecy",
  delts: "Deltoid",
  obliques: "Skośne",
  core: "Core",
  forearms: "Przedramiona",
  trapezius: "Czworoboczny",
  pectorals: "Mięsień piersiowy",
};

function getMuscleLabel(muscle: string): string {
  return MUSCLE_LABEL[muscle.toLowerCase()] ?? muscle;
}

export function ExercisePreviewMuscles({
  muscleGroup,
  secondaryMuscles,
}: ExercisePreviewMusclesProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-1.5">
        <Dumbbell size={13} color="#A1A1AA" />
        <Text className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
          Partie mięśniowe
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {/* Primary */}
        <View className="flex-row items-center gap-1.5 bg-[#007AFF]/15 border border-[#007AFF]/30 px-3 py-1.5 rounded-full">
          <View className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
          <Text className="text-[11px] font-bold text-[#007AFF]">
            {getMuscleLabel(muscleGroup)}
          </Text>
        </View>

        {/* Secondary */}
        {secondaryMuscles.slice(0, 4).map((muscle) => (
          <View
            key={muscle}
            className="bg-[#1E1E22] border border-[#27272A] px-3 py-1.5 rounded-full"
          >
            <Text className="text-[11px] text-[#A1A1AA]">{getMuscleLabel(muscle)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

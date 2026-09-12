import React from "react";
import { Modal, View, Text, Image, Pressable, ScrollView } from "react-native";
import { X, Dumbbell, Target, ChevronRight } from "lucide-react-native";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

interface ExercisePreviewModalProps {
  exercise: CatalogExercise | null;
  visible: boolean;
  onClose: () => void;
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

export function ExercisePreviewModal({
  exercise,
  visible,
  onClose,
}: ExercisePreviewModalProps) {
  if (!exercise) return null;
  const media = getExerciseMedia(exercise.id);

  const steps =
    exercise.instructionStepsPl && exercise.instructionStepsPl.length > 0
      ? exercise.instructionStepsPl
      : exercise.instructionsPl
          .split(/\. /)
          .filter((s) => s.trim().length > 0)
          .map((s) => (s.endsWith(".") ? s : s + "."));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/80">
        <View className="bg-[#0A0A0C] border-t border-[#27272A] rounded-t-3xl max-h-[92%] flex-col">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <View className="flex-1 pr-3">
              <Text className="text-base font-black text-white" numberOfLines={2}>
                {exercise.name}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <Target size={11} color="#007AFF" />
                <Text className="text-xs text-[#007AFF] font-semibold">
                  {exercise.target}
                </Text>
                <Text className="text-xs text-[#3F3F46]">•</Text>
                <Text className="text-xs text-[#71717A]">
                  {exercise.equipment}
                </Text>
              </View>
            </View>
            <Pressable
              testID="close-exercise-preview-button"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Zamknij podgląd"
              className="w-9 h-9 rounded-full bg-[#1E1E22] border border-[#27272A] items-center justify-center active:bg-[#27272A]"
            >
              <X size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 16 }}
          >
            {/* GIF Preview */}
            {media && (
              <View className="w-full rounded-2xl bg-[#111113] overflow-hidden border border-[#27272A] items-center justify-center"
                style={{ height: 220 }}>
                <Image
                  source={media.gif}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Muscle groups */}
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
                    {getMuscleLabel(exercise.muscleGroup)}
                  </Text>
                </View>

                {/* Secondary */}
                {(exercise.secondaryMuscles ?? []).slice(0, 4).map((muscle) => (
                  <View
                    key={muscle}
                    className="bg-[#1E1E22] border border-[#27272A] px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-[11px] text-[#A1A1AA]">
                      {getMuscleLabel(muscle)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Step-by-step instructions */}
            <View className="gap-2">
              <View className="flex-row items-center gap-1.5">
                <ChevronRight size={13} color="#A1A1AA" />
                <Text className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                  Technika wykonania
                </Text>
              </View>

              <View className="gap-2">
                {steps.map((step, index) => (
                  <View
                    key={index}
                    className="flex-row gap-3 bg-[#111113] border border-[#1E1E22] rounded-xl p-3"
                  >
                    <View className="w-5 h-5 rounded-full bg-[#007AFF]/20 items-center justify-center mt-0.5 shrink-0">
                      <Text className="text-[10px] font-black text-[#007AFF]">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="flex-1 text-xs text-[#D4D4D8] leading-relaxed">
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* CTA */}
          <View className="px-5 pb-6 pt-2 border-t border-[#27272A]">
            <Pressable
              onPress={onClose}
              className="w-full bg-[#007AFF] py-3.5 rounded-xl items-center active:bg-[#0062CC]"
            >
              <Text className="text-sm font-bold text-white">Zamknij podgląd</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

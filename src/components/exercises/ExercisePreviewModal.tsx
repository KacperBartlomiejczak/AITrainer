import React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { X, Target } from "lucide-react-native";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import { ExerciseMediaPreview } from "./ExerciseMediaPreview";
import { ExercisePreviewMuscles } from "./ExercisePreviewMuscles";
import { ExercisePreviewFooter } from "./ExercisePreviewFooter";
import { ExercisePreviewSteps } from "./ExercisePreviewSteps";

interface ExercisePreviewModalProps {
  exercise: CatalogExercise | null;
  visible: boolean;
  onClose: () => void;
  /** Optional primary action instead of "Zamknij podgląd" (e.g. "Dodaj do treningu") */
  actionLabel?: string;
  onAction?: (exercise: CatalogExercise) => void;
}

function getExerciseSteps(exercise: CatalogExercise): string[] {
  if (exercise.instructionStepsPl && exercise.instructionStepsPl.length > 0) {
    return exercise.instructionStepsPl;
  }
  return exercise.instructionsPl
    .split(/\. /)
    .filter((s) => s.trim().length > 0)
    .map((s) => (s.endsWith(".") ? s : s + "."));
}

export function ExercisePreviewModal({
  exercise,
  visible,
  onClose,
  actionLabel,
  onAction,
}: ExercisePreviewModalProps) {
  if (!exercise) return null;
  const media = getExerciseMedia(exercise.id);

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
            <ExerciseMediaPreview media={media} />
            <ExercisePreviewMuscles
              muscleGroup={exercise.muscleGroup}
              secondaryMuscles={exercise.secondaryMuscles ?? []}
            />
            <ExercisePreviewSteps steps={getExerciseSteps(exercise)} />
          </ScrollView>

          <ExercisePreviewFooter
            actionLabel={actionLabel}
            onAction={onAction ? () => onAction(exercise) : undefined}
            onClose={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

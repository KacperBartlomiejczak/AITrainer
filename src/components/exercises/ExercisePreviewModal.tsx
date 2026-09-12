import React from "react";
import { Modal, View, Text, Image, Pressable, ScrollView } from "react-native";
import { X, Sparkles } from "lucide-react-native";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

interface ExercisePreviewModalProps {
  exercise: CatalogExercise | null;
  visible: boolean;
  onClose: () => void;
}

export function ExercisePreviewModal({
  exercise,
  visible,
  onClose,
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
        <View className="bg-[#121214] border-t border-[#27272A] rounded-t-3xl p-5 max-h-[85%] flex-col gap-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-base font-black text-white" numberOfLines={2}>
                {exercise.name}
              </Text>
              <Text className="text-xs text-[#007AFF] font-medium">
                {exercise.target} • {exercise.equipment}
              </Text>
            </View>
            <Pressable
              testID="close-exercise-preview-button"
              onPress={onClose}
              accessibilityRole="button"
              className="w-9 h-9 rounded-full bg-[#1E1E22] border border-[#27272A] items-center justify-center active:bg-[#27272A]"
            >
              <X size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          {media && (
            <View className="w-full h-52 rounded-2xl bg-black overflow-hidden border border-[#27272A] items-center justify-center">
              <Image
                source={media.gif}
                className="w-full h-full object-contain"
                resizeMode="contain"
              />
            </View>
          )}

          <ScrollView
            className="flex-col gap-3"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center gap-1.5 mb-1">
              <Sparkles size={14} color="#007AFF" />
              <Text className="text-xs font-bold text-white uppercase tracking-wider">
                Instrukcja wykonania (Technika)
              </Text>
            </View>
            <View className="bg-[#18181B] rounded-xl p-3.5 border border-[#27272A]">
              <Text className="text-xs text-[#E4E4E7] leading-relaxed">
                {exercise.instructionsPl}
              </Text>
            </View>
          </ScrollView>

          <Pressable
            onPress={onClose}
            className="w-full bg-[#007AFF] py-3.5 rounded-xl items-center active:bg-[#0062CC]"
          >
            <Text className="text-sm font-bold text-white">Zamknij podgląd</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

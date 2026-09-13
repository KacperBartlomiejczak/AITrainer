import React from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Dumbbell, CirclePlay, X } from "lucide-react-native";
import { ExercisePreviewModal } from "@/components/exercises/ExercisePreviewModal";
import type { ProgressSheetStatus, ProgressSheetTarget } from "@/hooks/use-exercise-progress-sheet";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import type { ExerciseProgress, ProgressMetric } from "@/schemas/exercise-progress.schema";
import { ExerciseProgressBody } from "./ExerciseProgressBody";

interface ExerciseProgressSheetProps {
  target: ProgressSheetTarget | null;
  status: ProgressSheetStatus;
  progress: ExerciseProgress | null;
  availableMetrics: readonly ProgressMetric[];
  metric: ProgressMetric;
  techniqueExercise: CatalogExercise | null;
  onSelectMetric: (metric: ProgressMetric) => void;
  onShowTechnique: () => void;
  onCloseTechnique: () => void;
  onClose: () => void;
}

/** Bottom sheet opened from an exercise card: my max, my best results and the progress chart. */
export function ExerciseProgressSheet(props: ExerciseProgressSheetProps) {
  const { target, onClose } = props;
  const media = target ? getExerciseMedia(target.catalogExerciseId) : null;

  return (
    <Modal visible={target !== null} transparent animationType="slide" onRequestClose={onClose} testID="exercise-progress-sheet">
      <View className="flex-1 justify-end bg-black/70">
        <Pressable className="flex-1" onPress={onClose} accessibilityRole="button" accessibilityLabel="Zamknij postępy" />
        <View className="rounded-t-3xl bg-[#0A0A0C] border-t border-[#27272A] max-h-[88%]">
          <View className="flex-row items-center gap-3 px-5 pt-5 pb-3 border-b border-[#1E1E22]">
            <View className="w-12 h-12 rounded-xl bg-[#1E1E22] overflow-hidden items-center justify-center">
              {media ? <Image source={media.image} className="w-full h-full" resizeMode="cover" /> : <Dumbbell size={18} color="#71717A" />}
            </View>
            <View className="flex-1">
              <Text className="text-base font-black text-white" numberOfLines={2}>
                {target?.name}
              </Text>
              <Text className="text-xs text-[#71717A]">Twoje postępy</Text>
            </View>
            <Pressable
              testID="progress-sheet-close"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Zamknij postępy"
              className="w-8 h-8 rounded-full bg-[#18181B] border border-[#27272A] items-center justify-center"
            >
              <X size={16} color="#A1A1AA" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36, gap: 16 }} showsVerticalScrollIndicator={false}>
            <ExerciseProgressBody
              status={props.status}
              progress={props.progress}
              availableMetrics={props.availableMetrics}
              metric={props.metric}
              onSelectMetric={props.onSelectMetric}
            />
            <Pressable
              testID="progress-show-technique"
              onPress={props.onShowTechnique}
              accessibilityRole="button"
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#1E1E22] border border-[#27272A] py-3 active:bg-[#27272A]"
            >
              <CirclePlay size={16} color="#FFFFFF" />
              <Text className="text-sm font-bold text-white">Zobacz technikę</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>

      <ExercisePreviewModal
        exercise={props.techniqueExercise}
        visible={props.techniqueExercise !== null}
        onClose={props.onCloseTechnique}
      />
    </Modal>
  );
}

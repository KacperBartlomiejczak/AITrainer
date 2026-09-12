import React from "react";
import { Modal, View, Text, ScrollView, Pressable, Image } from "react-native";
import { X } from "lucide-react-native";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { RoutinePhotoItem } from "@/schemas/user-profile-screen.schema";

interface PastWorkoutModalProps {
  workout: RoutinePhotoItem | null;
  visible: boolean;
  onClose: () => void;
}

export function PastWorkoutModal({ workout, visible, onClose }: PastWorkoutModalProps) {
  if (!workout) return null;
  const coverMedia = getExerciseMedia(workout.imageAssetKey);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} testID="past-workout-modal">
      <View className="flex-1 justify-end bg-black/85">
        <View className="h-[94%] rounded-t-3xl bg-[#121214] border-t border-[#27272A] p-5 flex-col gap-3 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-xs font-bold text-[#38BDF8]">
                {workout.completedDate || "Wykonany trening"} • {workout.durationMinutes} min
              </Text>
              <Text className="text-lg font-black text-white" numberOfLines={1}>{workout.title}</Text>
            </View>
            <Pressable
              testID="close-past-workout-modal"
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-[#1E1E22] items-center justify-center border border-[#27272A]"
            >
              <X size={18} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* Enriched Training Cover Image: large container where vertical photo fits completely */}
          {coverMedia?.image && (
            <View className="w-full h-72 rounded-2xl overflow-hidden bg-[#09090B] border border-[#27272A] items-center justify-center">
              <Image source={coverMedia.image} className="w-full h-full" resizeMode="contain" />
            </View>
          )}

          <Text className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">
            Ćwiczenia wykonane na treningu:
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
            {workout.exercises?.map((ex) => {
              const exMedia = getExerciseMedia(ex.imageAssetKey);
              return (
                <View
                  key={ex.id}
                  testID={`modal-exercise-${ex.id}`}
                  className="rounded-xl bg-[#18181B] border border-[#27272A] p-3 flex-row items-center gap-3"
                >
                  {exMedia?.image && (
                    <View className="w-14 h-14 rounded-lg overflow-hidden bg-black border border-[#27272A]">
                      <Image source={exMedia.image} className="w-full h-full" resizeMode="cover" />
                    </View>
                  )}
                  <View className="flex-1 flex-col gap-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-bold text-white flex-1" numberOfLines={1}>{ex.name}</Text>
                      {ex.isPersonalRecord && (
                        <View className="bg-[#F59E0B]/20 px-1.5 py-0.5 rounded-full border border-[#F59E0B]/30 ml-1">
                          <Text className="text-[9px] font-black text-[#F59E0B]">PR 🔥</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-[#38BDF8] font-semibold">{ex.setsSummary}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

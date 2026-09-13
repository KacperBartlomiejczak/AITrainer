import React from "react";
import { Modal, View, Text, ScrollView, Pressable, Image } from "react-native";
import { X } from "lucide-react-native";
import type { RoutinePhotoItem } from "@/schemas/user-profile-screen.schema";

interface PastWorkoutModalProps {
  workout: RoutinePhotoItem | null;
  visible: boolean;
  onClose: () => void;
}

export function PastWorkoutModal({ workout, visible, onClose }: PastWorkoutModalProps) {
  if (!workout) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} testID="past-workout-modal">
      <View className="flex-1 justify-end bg-black/85">
        <View className="h-[94%] rounded-t-3xl bg-[#121214] border-t border-[#27272A] p-5 flex-col gap-3 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-xs font-bold text-[#38BDF8]">
                {workout.completedDate} • {workout.durationMinutes} min
              </Text>
              <Text className="text-lg font-black text-white" numberOfLines={1}>{workout.title}</Text>
            </View>
            <Pressable
              testID="close-past-workout-modal"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Zamknij podgląd treningu"
              className="w-9 h-9 rounded-full bg-[#1E1E22] items-center justify-center border border-[#27272A]"
            >
              <X size={18} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* The user's photo fits completely inside a large container */}
          <View className="w-full h-72 rounded-2xl overflow-hidden bg-[#09090B] border border-[#27272A] items-center justify-center">
            <Image
              testID="past-workout-photo"
              source={{ uri: workout.photoUri }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>

          <Text className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">
            Ćwiczenia wykonane na treningu:
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
            {workout.exercises.map((exercise) => (
              <View
                key={exercise.id}
                testID={`modal-exercise-${exercise.id}`}
                className="rounded-xl bg-[#18181B] border border-[#27272A] p-3 flex-row items-center gap-3"
              >
                <Text className="text-base">{exercise.completed ? "✅" : "⏭️"}</Text>
                <View className="flex-1 flex-col gap-1">
                  <Text className="text-xs font-bold text-white" numberOfLines={1}>{exercise.name}</Text>
                  <Text className={`text-xs font-semibold ${exercise.completed ? "text-[#38BDF8]" : "text-[#71717A]"}`}>
                    {exercise.setsSummary}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

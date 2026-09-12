import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useExerciseCatalog } from "@/hooks/use-exercise-catalog";
import {
  ExerciseSearchBar,
  ExerciseFilterChips,
  ExerciseCard,
  ExercisePreviewModal,
} from "@/components/exercises";

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    filteredExercises,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    selectedExercise,
    openPreview,
    closePreview,
  } = useExerciseCatalog();

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 border-b border-[#27272A]">
        <Pressable
          testID="back-to-workouts-button"
          onPress={() => router.back()}
          accessibilityRole="button"
          className="w-10 h-10 rounded-full bg-[#121214] border border-[#27272A] items-center justify-center active:bg-[#1E1E22]"
        >
          <ArrowLeft size={18} color="#FFFFFF" />
        </Pressable>
        <Text className="text-base font-black text-white">Baza Ćwiczeń</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 24) + 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ExerciseSearchBar
          query={searchQuery}
          onChangeQuery={setSearchQuery}
        />

        <ExerciseFilterChips
          selectedCategory={categoryFilter}
          onSelectCategory={setCategoryFilter}
        />

        <View className="flex-col gap-3 pt-1">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPressPreview={openPreview}
              />
            ))
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-3xl mb-2">🔍</Text>
              <Text className="text-sm font-bold text-white mb-1">
                Brak pasujących ćwiczeń
              </Text>
              <Text className="text-xs text-[#71717A] text-center">
                Spróbuj zmienić kategorię lub wpisać inną frazę wyszukiwania
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Exercise Animated GIF & Technique Modal */}
      <ExercisePreviewModal
        exercise={selectedExercise}
        visible={!!selectedExercise}
        onClose={closePreview}
      />
    </View>
  );
}

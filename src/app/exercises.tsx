import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, LayoutList, Grid2x2 } from "lucide-react-native";
import { useExerciseCatalog } from "@/hooks/use-exercise-catalog";
import {
  ExerciseSearchBar,
  ExerciseFilterChips,
  ExerciseCard,
  ExercisePreviewModal,
  ExerciseMuscleGroupSection,
} from "@/components/exercises";
import { cn } from "@/lib/utils";

// Map body_part → Polish label + emoji
const MUSCLE_GROUP_META: Record<
  string,
  { label: string; emoji: string }
> = {
  chest: { label: "Klatka piersiowa", emoji: "💪" },
  back: { label: "Plecy", emoji: "🔙" },
  "upper legs": { label: "Nogi", emoji: "🦵" },
  "upper arms": { label: "Ramiona", emoji: "💪" },
  shoulders: { label: "Barki", emoji: "🏃" },
  waist: { label: "Brzuch", emoji: "🎯" },
  cardio: { label: "Cardio", emoji: "❤️" },
  "lower legs": { label: "Łydki", emoji: "🦶" },
  "lower arms": { label: "Przedramiona", emoji: "✊" },
};

// Preferred display order for muscle groups
const MUSCLE_GROUP_ORDER = [
  "chest",
  "back",
  "upper legs",
  "upper arms",
  "shoulders",
  "waist",
  "cardio",
  "lower legs",
  "lower arms",
];

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const {
    filteredExercises,
    exercisesByMuscleGroup,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    selectedExercise,
    openPreview,
    closePreview,
  } = useExerciseCatalog();

  const sortedGroups = MUSCLE_GROUP_ORDER.filter(
    (key) => exercisesByMuscleGroup[key]?.length > 0
  );

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
          accessibilityLabel="Wróć do treningów"
          className="w-10 h-10 rounded-full bg-[#121214] border border-[#27272A] items-center justify-center active:bg-[#1E1E22]"
        >
          <ArrowLeft size={18} color="#FFFFFF" />
        </Pressable>
        <Text className="text-base font-black text-white">Baza Ćwiczeń</Text>

        {/* View mode toggle */}
        <View className="flex-row bg-[#121214] border border-[#27272A] rounded-full p-0.5">
          <Pressable
            onPress={() => setViewMode("grid")}
            className={cn(
              "w-9 h-9 rounded-full items-center justify-center",
              viewMode === "grid" ? "bg-[#007AFF]" : "bg-transparent"
            )}
          >
            <Grid2x2 size={15} color={viewMode === "grid" ? "#FFF" : "#71717A"} />
          </Pressable>
          <Pressable
            onPress={() => setViewMode("list")}
            className={cn(
              "w-9 h-9 rounded-full items-center justify-center",
              viewMode === "list" ? "bg-[#007AFF]" : "bg-transparent"
            )}
          >
            <LayoutList size={15} color={viewMode === "list" ? "#FFF" : "#71717A"} />
          </Pressable>
        </View>
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
        <ExerciseSearchBar query={searchQuery} onChangeQuery={setSearchQuery} />

        <ExerciseFilterChips
          selectedCategory={categoryFilter}
          onSelectCategory={setCategoryFilter}
        />

        {/* ── GRID MODE: grouped by muscle ─────────────────────────── */}
        {viewMode === "grid" ? (
          <>
            {sortedGroups.length > 0 ? (
              <View className="gap-8">
                {sortedGroups.map((groupKey) => {
                  const meta = MUSCLE_GROUP_META[groupKey] ?? {
                    label: groupKey,
                    emoji: "🏋️",
                  };
                  return (
                    <ExerciseMuscleGroupSection
                      key={groupKey}
                      title={meta.label}
                      emoji={meta.emoji}
                      exercises={exercisesByMuscleGroup[groupKey]}
                      onPressPreview={openPreview}
                    />
                  );
                })}
              </View>
            ) : (
              <View className="items-center justify-center py-16">
                <Text className="text-3xl mb-3">🔍</Text>
                <Text className="text-sm font-bold text-white mb-1">
                  Brak pasujących ćwiczeń
                </Text>
                <Text className="text-xs text-[#71717A] text-center">
                  Spróbuj zmienić kategorię lub wpisać inną frazę
                </Text>
              </View>
            )}
          </>
        ) : (
          /* ── LIST MODE: flat list ──────────────────────────────────── */
          <View className="gap-3 pt-1">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onPressPreview={openPreview}
                />
              ))
            ) : (
              <View className="items-center justify-center py-16">
                <Text className="text-3xl mb-3">🔍</Text>
                <Text className="text-sm font-bold text-white mb-1">
                  Brak pasujących ćwiczeń
                </Text>
                <Text className="text-xs text-[#71717A] text-center">
                  Spróbuj zmienić kategorię lub wpisać inną frazę wyszukiwania
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Exercise Preview Modal */}
      <ExercisePreviewModal
        exercise={selectedExercise}
        visible={!!selectedExercise}
        onClose={closePreview}
      />
    </View>
  );
}

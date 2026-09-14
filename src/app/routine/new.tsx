import React from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExercisePickerModal } from "@/components/live-workout/ExercisePickerModal";
import { RoutineBasicInfoForm, RoutineExerciseList } from "@/components/routine-form";
import { useCreateRoutine } from "@/hooks/use-create-routine";

export default function CreateRoutineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const routine = useCreateRoutine();
  const { picker } = routine;

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: Math.max(insets.top, 16) }}>
      <View className="flex-row items-center justify-between px-4 pb-3">
        <Pressable
          testID="create-routine-back"
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Wróć"
          className="w-9 h-9 rounded-full bg-[#1E1E22] items-center justify-center"
        >
          <ChevronLeft size={18} color="#FFFFFF" />
        </Pressable>
        <Text className="text-base font-black text-white">Nowa rutyna</Text>
        <View className="w-9 h-9" />
      </View>

      <KeyboardAvoidingView
        testID="create-routine-keyboard-avoiding"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom, 24) + 32, gap: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <RoutineBasicInfoForm
            title={routine.title}
            onChangeTitle={routine.setTitle}
            description={routine.description}
            onChangeDescription={routine.setDescription}
            level={routine.level}
            onChangeLevel={routine.setLevel}
            daysPerWeek={routine.daysPerWeek}
            onChangeDaysPerWeek={routine.setDaysPerWeek}
            durationMinutes={routine.durationMinutes}
            onChangeDurationMinutes={routine.setDurationMinutes}
          />

          <RoutineExerciseList
            exercises={routine.exercises}
            onChangeExercise={routine.updateExercise}
            onRemoveExercise={routine.removeExercise}
            onAddExercise={picker.open}
          />

          {routine.errorMessage ? (
            <Text accessibilityRole="alert" className="text-sm font-semibold text-center text-[#F87171]">
              {routine.errorMessage}
            </Text>
          ) : null}

          <Pressable
            testID="create-routine-save"
            onPress={routine.save}
            disabled={!routine.canSave || routine.isSaving}
            accessibilityRole="button"
            accessibilityState={{ disabled: !routine.canSave || routine.isSaving, busy: routine.isSaving }}
            className={`flex-row items-center justify-center gap-2 rounded-2xl bg-[#007AFF] py-4 active:bg-[#0062CC] ${
              !routine.canSave || routine.isSaving ? "opacity-40" : ""
            }`}
          >
            {routine.isSaving ? <ActivityIndicator color="#FFFFFF" /> : null}
            <Text className="text-base font-bold text-white">{routine.isSaving ? "Zapisywanie…" : "Zapisz rutynę"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <ExercisePickerModal
        visible={picker.isOpen}
        query={picker.query}
        exercises={picker.exercises}
        muscleFilter={picker.muscleFilter}
        equipmentFilter={picker.equipmentFilter}
        hasActiveFilters={picker.hasActiveFilters}
        activeFilterCount={picker.activeFilterCount}
        isFilterSheetOpen={picker.isFilterSheetOpen}
        previewExercise={picker.previewExercise}
        onChangeQuery={picker.setQuery}
        onSelectMuscle={picker.setMuscleFilter}
        onSelectEquipment={picker.setEquipmentFilter}
        onResetFilters={picker.resetFilters}
        onOpenFilterSheet={picker.openFilterSheet}
        onCloseFilterSheet={picker.closeFilterSheet}
        onPreview={picker.openPreview}
        onClosePreview={picker.closePreview}
        onAdd={routine.addExercise}
        onClose={picker.close}
      />
    </View>
  );
}

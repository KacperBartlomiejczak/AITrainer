import React from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { WORKOUT_TITLE_MAX_LENGTH } from "@/schemas/live-workout.schema";
import type { WorkoutPhotoSource } from "@/schemas/workout-history.schema";
import { FinishPhotoPicker } from "./FinishPhotoPicker";
import { FinishSummaryHeader } from "./FinishSummaryHeader";
import { LiveWorkoutStatsBar } from "./LiveWorkoutStatsBar";
import { SaveAsRoutineToggle } from "./SaveAsRoutineToggle";

interface FinishWorkoutSectionProps {
  visible: boolean;
  elapsedSeconds: number;
  completedSetCount: number;
  totalVolumeKg: number;
  personalRecordCount: number;
  title: string;
  titlePlaceholder: string;
  onChangeTitle: (title: string) => void;
  saveAsRoutine: boolean;
  onToggleSaveAsRoutine: () => void;
  photoUri: string | null;
  isPickingPhoto: boolean;
  onPickPhoto: (source: WorkoutPhotoSource) => void;
  onRemovePhoto: () => void;
  isSaving: boolean;
  errorMessage: string | null;
  onSave: () => void;
  onClose: () => void;
}

/** Confirmation after "Zakończ": summary, optional name, photo and "save as routine". */
export function FinishWorkoutSection(props: FinishWorkoutSectionProps) {
  const { visible, isSaving, errorMessage, onSave, onClose } = props;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} testID="finish-workout">
      <KeyboardAvoidingView
        testID="finish-workout-keyboard-avoiding"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black"
      >
        <ScrollView
          className="flex-1 bg-black"
          contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 18 }}
          keyboardShouldPersistTaps="handled"
        >
          <FinishSummaryHeader personalRecordCount={props.personalRecordCount} />

          <LiveWorkoutStatsBar
            elapsedSeconds={props.elapsedSeconds}
            completedSetCount={props.completedSetCount}
            totalVolumeKg={props.totalVolumeKg}
          />

          <View className="gap-2">
            <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Nazwa treningu (opcjonalnie)</Text>
            <TextInput
              testID="finish-workout-title"
              value={props.title}
              onChangeText={props.onChangeTitle}
              placeholder={props.titlePlaceholder}
              placeholderTextColor="#52525B"
              maxLength={WORKOUT_TITLE_MAX_LENGTH}
              className="rounded-xl bg-[#121214] border border-[#27272A] px-3 py-3 text-sm text-white"
            />
          </View>

          <FinishPhotoPicker
            photoUri={props.photoUri}
            isPicking={props.isPickingPhoto}
            onPick={props.onPickPhoto}
            onRemove={props.onRemovePhoto}
          />
          <SaveAsRoutineToggle value={props.saveAsRoutine} onToggle={props.onToggleSaveAsRoutine} />

          {errorMessage ? (
            <Text accessibilityRole="alert" className="text-sm font-semibold text-center text-[#F87171]">
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            testID="finish-workout-save"
            onPress={onSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving, busy: isSaving }}
            className={`flex-row items-center justify-center gap-2 rounded-2xl bg-[#2E7D32] py-4 active:bg-[#1B5E20] ${isSaving ? "opacity-60" : ""}`}
          >
            {isSaving ? <ActivityIndicator color="#FFFFFF" /> : null}
            <Text className="text-base font-bold text-white">{isSaving ? "Zapisywanie…" : "Zapisz trening"}</Text>
          </Pressable>
          <Pressable testID="finish-workout-back" onPress={onClose} disabled={isSaving} accessibilityRole="button" className="items-center py-2">
            <Text className="text-sm font-bold text-[#71717A]">Wróć do treningu</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

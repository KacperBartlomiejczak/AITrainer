import React from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import type { WorkoutPhotoSource } from "@/schemas/workout-history.schema";
import { PhotoSheetOption } from "./PhotoSheetOption";

interface WorkoutPhotoSourceSheetProps {
  visible: boolean;
  title: string;
  description?: string;
  hasPhoto: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  /** "Pomiń" right after a workout, "Anuluj" when editing history */
  dismissLabel: string;
  onSelectSource: (source: WorkoutPhotoSource) => void;
  onRemovePhoto?: () => void;
  onDismiss: () => void;
}

/** Optional workout photo: the user decides between the camera and the gallery. */
export function WorkoutPhotoSourceSheet({
  visible,
  title,
  description,
  hasPhoto,
  isSaving,
  errorMessage,
  dismissLabel,
  onSelectSource,
  onRemovePhoto,
  onDismiss,
}: WorkoutPhotoSourceSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss} testID="workout-photo-sheet">
      <View className="flex-1 justify-end bg-black/70">
        <Pressable className="flex-1" onPress={isSaving ? undefined : onDismiss} accessibilityLabel="Zamknij" />
        <View className="rounded-t-3xl bg-[#121214] border-t border-[#27272A] px-5 pt-5 pb-10 gap-3">
          <View className="gap-1 pb-1">
            <Text className="text-lg font-black text-white">{title}</Text>
            {description ? <Text className="text-xs text-[#A1A1AA]">{description}</Text> : null}
          </View>

          <PhotoSheetOption
            testID="photo-source-camera"
            label="📷 Zrób zdjęcie"
            variant="primary"
            disabled={isSaving}
            onPress={() => onSelectSource("camera")}
          />
          <PhotoSheetOption
            testID="photo-source-library"
            label="🖼️ Wybierz z galerii"
            disabled={isSaving}
            onPress={() => onSelectSource("library")}
          />
          {hasPhoto && onRemovePhoto ? (
            <PhotoSheetOption
              testID="photo-remove"
              label="Usuń zdjęcie"
              variant="destructive"
              disabled={isSaving}
              onPress={onRemovePhoto}
            />
          ) : null}

          {isSaving ? <ActivityIndicator testID="photo-sheet-saving" color="#38BDF8" /> : null}
          {errorMessage ? (
            <Text accessibilityRole="alert" className="text-xs font-semibold text-center text-[#F87171]">
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            testID="photo-sheet-dismiss"
            onPress={onDismiss}
            disabled={isSaving}
            accessibilityRole="button"
            className="items-center py-2"
          >
            <Text className="text-sm font-bold text-[#71717A]">{dismissLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

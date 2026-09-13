import React from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { PhotoSheetOption } from "@/components/workout-photo";
import type { WorkoutPhotoSource } from "@/schemas/workout-history.schema";

interface FinishPhotoPickerProps {
  photoUri: string | null;
  isPicking: boolean;
  onPick: (source: WorkoutPhotoSource) => void;
  onRemove: () => void;
}

/** Optional workout photo on the confirmation screen: camera or gallery. */
export function FinishPhotoPicker({ photoUri, isPicking, onPick, onRemove }: FinishPhotoPickerProps) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Zdjęcie (opcjonalnie)</Text>

      {photoUri ? (
        <View className="rounded-2xl overflow-hidden border border-[#27272A]">
          <Image testID="finish-photo-preview" source={{ uri: photoUri }} className="w-full h-56" resizeMode="cover" />
          <Pressable
            testID="finish-photo-remove"
            onPress={onRemove}
            accessibilityRole="button"
            className="absolute top-2 right-2 rounded-full bg-black/70 px-3 py-1.5"
          >
            <Text className="text-xs font-bold text-white">Usuń zdjęcie</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row gap-2">
          <View className="flex-1">
            <PhotoSheetOption
              testID="finish-photo-camera"
              label="📷 Aparat"
              disabled={isPicking}
              onPress={() => onPick("camera")}
            />
          </View>
          <View className="flex-1">
            <PhotoSheetOption
              testID="finish-photo-library"
              label="🖼️ Galeria"
              disabled={isPicking}
              onPress={() => onPick("library")}
            />
          </View>
        </View>
      )}
      {isPicking ? <ActivityIndicator color="#38BDF8" /> : null}
    </View>
  );
}

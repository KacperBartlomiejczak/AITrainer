import React from "react";
import { View, Text, Image } from "react-native";
import { ImageOff } from "lucide-react-native";
import type { ExerciseMediaItem } from "@/lib/exercise-assets";

interface ExerciseMediaPreviewProps {
  media: ExerciseMediaItem | null;
}

export function ExerciseMediaPreview({ media }: ExerciseMediaPreviewProps) {
  return (
    <View
      className="w-full rounded-2xl bg-[#111113] overflow-hidden border border-[#27272A] items-center justify-center"
      style={{ height: 220 }}
    >
      {media ? (
        <Image
          testID="exercise-preview-gif"
          source={media.gif}
          className="w-full h-full"
          resizeMode="contain"
        />
      ) : (
        <View testID="exercise-preview-placeholder" className="items-center gap-2">
          <ImageOff size={28} color="#52525B" />
          <Text className="text-xs font-semibold text-[#71717A]">Brak podglądu ćwiczenia</Text>
        </View>
      )}
    </View>
  );
}

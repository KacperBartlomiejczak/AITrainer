import React from "react";
import { Pressable, Text, View } from "react-native";

interface ExercisePreviewFooterProps {
  /** Without a label the footer only closes the preview */
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}

export function ExercisePreviewFooter({ actionLabel, onAction, onClose }: ExercisePreviewFooterProps) {
  const hasAction = actionLabel !== undefined && onAction !== undefined;

  return (
    <View className="px-5 pb-6 pt-2 border-t border-[#27272A]">
      <Pressable
        testID={hasAction ? "exercise-preview-action" : undefined}
        onPress={hasAction ? onAction : onClose}
        accessibilityRole="button"
        className="w-full bg-[#007AFF] py-3.5 rounded-xl items-center active:bg-[#0062CC]"
      >
        <Text className="text-sm font-bold text-white">{hasAction ? actionLabel : "Zamknij podgląd"}</Text>
      </Pressable>
    </View>
  );
}

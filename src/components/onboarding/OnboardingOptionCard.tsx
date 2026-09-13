import React from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";

interface OnboardingOptionCardProps {
  testID: string;
  label: string;
  emoji: string;
  description?: string;
  isSelected: boolean;
  onPress: () => void;
  /** "radio" for single choice lists, "checkbox" for toggles */
  selectionType: "radio" | "checkbox";
}

export function OnboardingOptionCard({
  testID,
  label,
  emoji,
  description,
  isSelected,
  onPress,
  selectionType,
}: OnboardingOptionCardProps) {
  const accessibilityState =
    selectionType === "radio" ? { selected: isSelected } : { checked: isSelected };

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className={cn(
        "flex-row items-center rounded-2xl p-4 border",
        isSelected
          ? "bg-[rgba(0,122,255,0.15)] border-[#007AFF]"
          : "bg-[#121214] border-[#27272A]"
      )}
      accessibilityRole={selectionType}
      accessibilityState={accessibilityState}
    >
      <View
        className={cn(
          "w-12 h-12 rounded-xl items-center justify-center mr-4",
          isSelected ? "bg-[#007AFF]" : "bg-[#1E1E22]"
        )}
      >
        <Text className="text-2xl">{emoji}</Text>
      </View>
      <View className="flex-1">
        <Text
          className={cn("text-base font-bold mb-0.5", isSelected ? "text-[#007AFF]" : "text-white")}
        >
          {label}
        </Text>
        {description ? <Text className="text-xs text-[#A1A1AA]">{description}</Text> : null}
      </View>
      {isSelected && (
        <View className="w-6 h-6 rounded-full bg-[#007AFF] items-center justify-center">
          <Text className="text-white text-xs font-bold">✓</Text>
        </View>
      )}
    </Pressable>
  );
}

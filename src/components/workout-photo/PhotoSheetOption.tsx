import React from "react";
import { Pressable, Text } from "react-native";

interface PhotoSheetOptionProps {
  testID: string;
  label: string;
  disabled: boolean;
  variant?: "primary" | "secondary" | "destructive";
  onPress: () => void;
}

const VARIANT_CLASSES = {
  primary: { container: "bg-[#007AFF] active:bg-[#0060DF]", text: "text-white" },
  secondary: { container: "bg-[#1E1E22] border border-[#27272A] active:bg-[#27272A]", text: "text-white" },
  destructive: { container: "bg-[#EF4444]/10 border border-[#EF4444]/30 active:bg-[#EF4444]/20", text: "text-[#EF4444]" },
} as const;

export function PhotoSheetOption({ testID, label, disabled, variant = "secondary", onPress }: PhotoSheetOptionProps) {
  const classes = VARIANT_CLASSES[variant];
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={`w-full items-center rounded-xl py-3.5 ${classes.container} ${disabled ? "opacity-50" : ""}`}
    >
      <Text className={`text-sm font-black ${classes.text}`}>{label}</Text>
    </Pressable>
  );
}

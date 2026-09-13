import React, { type ReactNode } from "react";
import { Text, View } from "react-native";

interface OnboardingSummaryCardProps {
  title: string;
  children: ReactNode;
}

export function OnboardingSummaryCard({ title, children }: OnboardingSummaryCardProps) {
  return (
    <View className="bg-[#121214] rounded-2xl p-4 border border-[#27272A]">
      <Text className="text-xs text-[#71717A] font-semibold uppercase tracking-wider mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}

interface OnboardingSummaryRowProps {
  emoji: string;
  label: string;
  description: string;
}

export function OnboardingSummaryRow({ emoji, label, description }: OnboardingSummaryRowProps) {
  return (
    <View className="flex-row items-center">
      <Text className="text-xl mr-3">{emoji}</Text>
      <View>
        <Text className="text-white font-bold text-base">{label}</Text>
        <Text className="text-[#A1A1AA] text-xs">{description}</Text>
      </View>
    </View>
  );
}

interface OnboardingSummaryChipProps {
  emoji: string;
  label: string;
}

export function OnboardingSummaryChip({ emoji, label }: OnboardingSummaryChipProps) {
  return (
    <View className="bg-[rgba(0,122,255,0.15)] rounded-xl px-3 py-2 flex-row items-center">
      <Text className="mr-1.5">{emoji}</Text>
      <Text className="text-[#007AFF] text-sm font-semibold">{label}</Text>
    </View>
  );
}

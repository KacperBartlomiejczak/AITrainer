import React from "react";
import { View, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";

interface ExercisePreviewStepsProps {
  steps: string[];
}

export function ExercisePreviewSteps({ steps }: ExercisePreviewStepsProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-1.5">
        <ChevronRight size={13} color="#A1A1AA" />
        <Text className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
          Technika wykonania
        </Text>
      </View>

      <View className="gap-2">
        {steps.map((step, index) => (
          <View
            key={index}
            className="flex-row gap-3 bg-[#111113] border border-[#1E1E22] rounded-xl p-3"
          >
            <View className="w-5 h-5 rounded-full bg-[#007AFF]/20 items-center justify-center mt-0.5 shrink-0">
              <Text className="text-[10px] font-black text-[#007AFF]">{index + 1}</Text>
            </View>
            <Text className="flex-1 text-xs text-[#D4D4D8] leading-relaxed">{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

import React from "react";
import { View, Text } from "react-native";

interface WorkoutCardPaginationProps {
  activeSlide: number;
  totalSlides: number;
}

export function WorkoutCardPagination({
  activeSlide,
  totalSlides,
}: WorkoutCardPaginationProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-2 bg-[#161619] border-t border-[#27272A]">
      <View className="flex-row items-center gap-1.5">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <View
            key={idx}
            className={`h-1.5 rounded-full ${
              idx === activeSlide ? "w-5 bg-[#38BDF8]" : "w-1.5 bg-[#3F3F46]"
            }`}
          />
        ))}
      </View>
      <Text className="text-[10px] font-bold text-[#71717A]">
        Slajd {activeSlide + 1} z {totalSlides}
      </Text>
    </View>
  );
}

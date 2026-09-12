import React from "react";
import { View, Text, Pressable } from "react-native";
import { Dumbbell, ArrowRight } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";

interface ExercisesHeroBannerProps {
  onPressShowAll: () => void;
}

export function ExercisesHeroBanner({ onPressShowAll }: ExercisesHeroBannerProps) {
  return (
    <View className="rounded-3xl bg-gradient-to-br from-[#121214] to-[#18181B] border border-[#27272A] p-5 shadow-xl overflow-hidden">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-2xl bg-[#007AFF]/15 border border-[#007AFF]/30 items-center justify-center">
            <Dumbbell size={20} color="#007AFF" />
          </View>
          <View>
            <Text className="text-base font-black text-white tracking-tight">
              Baza Ćwiczeń & Atlas
            </Text>
            <Text className="text-xs text-[#71717A]">
              Animacje wideo • Technika • Atlas
            </Text>
          </View>
        </View>
        <Badge variant="default" size="sm" className="bg-[#007AFF]/20 border-[#007AFF]/40">
          <Text className="text-[10px] font-bold text-[#007AFF]">NOWOŚĆ</Text>
        </Badge>
      </View>

      <Text className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
        Przeglądaj ćwiczenia z animacjami GIF, polskimi instrukcjami oraz podziałem na partie mięśniowe.
      </Text>

      <Pressable
        testID="show-all-exercises-button"
        onPress={onPressShowAll}
        accessibilityRole="button"
        className="flex-row items-center justify-center bg-[#007AFF] py-3.5 px-5 rounded-2xl gap-2 active:bg-[#0062CC]"
      >
        <Text className="text-sm font-bold text-white">
          Pokaż wszystkie ćwiczenia
        </Text>
        <ArrowRight size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";

export default function AiMentorScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-black items-center justify-center gap-4 px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="w-16 h-16 rounded-full bg-[#007AFF]/15 border border-[#007AFF]/40 items-center justify-center">
        <Sparkles size={28} color="#007AFF" strokeWidth={2} />
      </View>
      <Text className="text-2xl font-black text-white tracking-tight">AI Mentor</Text>
      <Text className="text-sm text-[#71717A] text-center">
        Wkrótce: osobisty plan treningowy, wskazówki i wsparcie od Twojego AI trenera.
      </Text>
    </View>
  );
}

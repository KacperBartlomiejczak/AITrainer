import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <View className="flex-1 bg-black">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
          animation: "slide_from_right",
        }}
      />
    </View>
  );
}

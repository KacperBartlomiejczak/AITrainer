import React from "react";
import { Text, ActivityIndicator } from "react-native";
import Animated from "react-native-reanimated";
import {
  useSplashScreen,
  type UseSplashScreenOptions,
} from "@/hooks/use-splash-screen";

export type SplashScreenProps = UseSplashScreenOptions;

export default function SplashScreen({
  onFinish,
  durationMs = 1800,
  isOverlay = false,
}: SplashScreenProps) {
  "use no memo";

  const {
    config,
    containerStyle,
    logoAnimatedStyle,
    titleAnimatedStyle,
    subtitleAnimatedStyle,
    loaderAnimatedStyle,
  } = useSplashScreen({ onFinish, durationMs, isOverlay });

  return (
    <Animated.View
      className={
        config.isOverlay
          ? "absolute inset-0 z-50 bg-black items-center justify-center"
          : "flex-1 bg-black items-center justify-center"
      }
      style={containerStyle}
    >
      {/* Logo Icon */}
      <Animated.View
        style={logoAnimatedStyle}
        className="w-24 h-24 rounded-3xl bg-[#007AFF] items-center justify-center mb-6"
      >
        <Text className="text-5xl">🏋️</Text>
      </Animated.View>

      {/* App Name */}
      <Animated.Text
        style={titleAnimatedStyle}
        className="text-3xl font-extrabold text-white tracking-tight mb-2"
      >
        AITrainer
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text
        style={subtitleAnimatedStyle}
        className="text-base text-[#A1A1AA] mb-12"
      >
        Twój osobisty trener AI
      </Animated.Text>

      {/* Loading indicator */}
      <Animated.View style={loaderAnimatedStyle}>
        <ActivityIndicator size="small" color="#007AFF" />
      </Animated.View>
    </Animated.View>
  );
}

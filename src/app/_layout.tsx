import "./global.css";
import React, { useCallback, useState, useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import * as SplashScreenModule from "expo-splash-screen";
import { useOnboardingStore } from "@/stores/onboarding.store";
import SplashScreen from "./splash";

// Keep native splash screen visible while JS bundle initializes.
// Safe catch prevents unhandled rejection if already called.
SplashScreenModule.preventAutoHideAsync().catch(() => {
  /* ignore already prevented */
});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isHydrated = useOnboardingStore((s) => s.isHydrated);
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding
  );

  const [showSplashOverlay, setShowSplashOverlay] = useState<boolean>(true);

  const onLayoutRootView = useCallback(async () => {
    try {
      // Hide native splash screen safely once root view is laid out
      await SplashScreenModule.hideAsync();
    } catch {
      /* ignore if already hidden */
    }
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplashOverlay(false);
  }, []);

  useEffect(() => {
    // Only navigate after store is hydrated and splash overlay completes
    if (!isHydrated || showSplashOverlay) return;

    // Check if the user is currently within any onboarding step
    const currentSegments = segments as string[];
    const inOnboarding = currentSegments.some(
      (s) => s.startsWith("step-") || s === "(onboarding)"
    );
    const onSplash = currentSegments.includes("splash");

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace("/(onboarding)/step-name");
    } else if (hasCompletedOnboarding && (inOnboarding || onSplash)) {
      router.replace("/");
    }
  }, [isHydrated, showSplashOverlay, hasCompletedOnboarding, segments, router]);

  return (
    <View className="flex-1 bg-black" onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
          animation: "fade",
        }}
      />

      {/* Smooth animated splash overlay on cold start */}
      {(!isHydrated || showSplashOverlay) && (
        <SplashScreen
          isOverlay
          durationMs={1600}
          onFinish={handleSplashFinish}
        />
      )}
    </View>
  );
}

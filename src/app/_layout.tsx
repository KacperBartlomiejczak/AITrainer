import { useOnboardingStore } from "@/stores/onboarding.store";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreenModule from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useLayoutEffect, useState } from "react";
import { View } from "react-native";
import "./global.css";
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
    (s) => s.hasCompletedOnboarding,
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

  const currentSegments = segments as string[];
  const segmentsKey = currentSegments.join("/");
  const onSplash = currentSegments.includes("splash");
  const isSplashOverlayActive = showSplashOverlay && !onSplash;

  useLayoutEffect(() => {
    console.log("[nav-effect]", {
      isHydrated,
      isSplashOverlayActive,
      hasCompletedOnboarding,
      currentSegments,
      onSplash,
    });
    // Only navigate after store is hydrated and splash overlay completes
    if (!isHydrated || isSplashOverlayActive) return;

    // Check if the user is currently within any onboarding step
    const inOnboarding = currentSegments.some(
      (s) => s.startsWith("step-") || s === "(onboarding)",
    );

    if (!hasCompletedOnboarding && !inOnboarding && !onSplash) {
      router.replace("/(onboarding)/step-name");
    } else if (hasCompletedOnboarding && (inOnboarding || onSplash)) {
      router.replace("/");
    }
  }, [
    isHydrated,
    isSplashOverlayActive,
    hasCompletedOnboarding,
    currentSegments,
    onSplash,
    router,
    segmentsKey,
  ]);

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

      {/* Smooth animated splash overlay on cold start (skip if user is directly on /splash route to prevent duplicate mount) */}
      {(!isHydrated || showSplashOverlay) && !onSplash && (
        <SplashScreen
          isOverlay
          durationMs={1600}
          onFinish={handleSplashFinish}
        />
      )}
    </View>
  );
}

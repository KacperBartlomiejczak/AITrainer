import { resolveOnboardingRedirect } from "@/lib/onboarding-redirect";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreenModule from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import "./global.css";
import SplashScreen from "./splash";

// Disable Reanimated strict mode to prevent false-positive warnings during React 19 render & unmount cycles
// Refer to: https://docs.swmansion.com/react-native-reanimated/docs/debugging/logger-configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Keep native splash screen visible while JS bundle initializes.
// Safe catch prevents unhandled rejection if already called.
SplashScreenModule.preventAutoHideAsync().catch(() => {
  /* ignore already prevented */
});

// Force the initial route to "/" so Expo Router doesn't restore a cached
// deep-link (e.g. /ranking) before NavigationContainer is fully mounted.
export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isHydrated = useOnboardingStore((s) => s.isHydrated);
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding,
  );

  const [showSplash, setShowSplash] = useState<boolean>(true);

  const onLayoutRootView = useCallback(async () => {
    try {
      // Hide native splash screen safely once root view is laid out
      await SplashScreenModule.hideAsync();
    } catch {
      /* ignore if already hidden */
    }
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  const segmentsKey = (segments as string[]).join("/");
  const onSplash = (segments as string[]).includes("splash");
  const isSplashActive = showSplash && !onSplash;

  useEffect(() => {
    const target = resolveOnboardingRedirect({
      isHydrated,
      isSplashActive,
      hasCompletedOnboarding,
      segments: segmentsKey ? segmentsKey.split("/") : [],
    });

    if (target) {
      router.replace(target);
    }
  }, [isHydrated, isSplashActive, hasCompletedOnboarding, router, segmentsKey]);

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

      {/* Warunkowe wyświetlanie splash screen (skip if user is directly on /splash route) */}
      {showSplash && !onSplash && (
        <SplashScreen
          isOverlay
          durationMs={1600}
          onFinish={handleSplashFinish}
        />
      )}
    </View>
  );
}


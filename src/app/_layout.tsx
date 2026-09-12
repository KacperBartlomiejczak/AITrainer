import "./global.css";
import { useEffect, useCallback } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import * as SplashScreenModule from "expo-splash-screen";
import { useOnboardingStore } from "@/stores/onboarding.store";
import SplashScreen from "./splash";

// Keep the native splash screen visible while we load the store
SplashScreenModule.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isHydrated = useOnboardingStore((s) => s.isHydrated);
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding
  );

  const onLayoutRootView = useCallback(async () => {
    if (isHydrated) {
      // Hide native splash screen once store is ready
      await SplashScreenModule.hideAsync();
    }
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const inOnboarding = segments[0] === "(onboarding)";
    const onSplash = segments[0] === "splash";

    if (!hasCompletedOnboarding && !inOnboarding) {
      // User hasn't onboarded — redirect to onboarding
      router.replace("/(onboarding)/step-name");
    } else if (hasCompletedOnboarding && (inOnboarding || onSplash)) {
      // User already onboarded — redirect to home
      router.replace("/");
    }
  }, [isHydrated, hasCompletedOnboarding, segments, router]);

  // Show custom animated splash while store hydrates
  if (!isHydrated) {
    return (
      <View className="flex-1 bg-black" onLayout={onLayoutRootView}>
        <StatusBar style="light" />
        <SplashScreen />
      </View>
    );
  }

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
    </View>
  );
}

import { useEffect, useState } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";
import {
  SplashScreenConfigSchema,
  type SplashScreenConfig,
} from "@/schemas/splash.schema";

export interface UseSplashScreenOptions {
  /** Optional callback invoked when the splash animation and timer complete */
  onFinish?: () => void;
  /** Duration in milliseconds to show splash before completing (default: 1800ms) */
  durationMs?: number;
  /** Whether the splash screen is displayed as an absolute overlay */
  isOverlay?: boolean;
}

const FADE_OUT_DURATION_MS = 300;

/**
 * Custom hook isolating Splash Screen animations, lifecycle, hydration-gated
 * auto-navigation, and reduced-motion accessibility.
 */
export function useSplashScreen({
  onFinish,
  durationMs = 1800,
  isOverlay = false,
}: UseSplashScreenOptions = {}) {
  "use no memo";

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isReducedMotion = useReducedMotion();

  const isHydrated = useOnboardingStore((s) => s.isHydrated);
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding
  );

  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Validate configuration with Zod
  const parsedConfig = SplashScreenConfigSchema.safeParse({
    durationMs,
    isOverlay,
  });

  const config: SplashScreenConfig = parsedConfig.success
    ? parsedConfig.data
    : { durationMs: 1800, isOverlay: false };

  // ── Shared Animation Values ──
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const loaderOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  // ── Animation Timelines ──
  useEffect(() => {
    // 1. Logo fade in
    logoOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Logo pulse (respect reduced-motion preference)
    if (!isReducedMotion) {
      logoScale.value = withDelay(
        500,
        withRepeat(
          withSequence(
            withTiming(1.08, {
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(1, {
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          true
        )
      );
    } else {
      logoScale.value = 1;
    }

    // 3. Title fade in after logo
    titleOpacity.value = withDelay(
      350,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // 4. Subtitle fade in after title
    subtitleOpacity.value = withDelay(
      700,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // 5. Loader fade in last
    loaderOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );

    // 6. Fade out container before timer ends to prevent hard cut
    const fadeOutDelay = Math.max(0, config.durationMs - FADE_OUT_DURATION_MS);
    const fadeTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, {
        duration: FADE_OUT_DURATION_MS,
        easing: Easing.out(Easing.ease),
      });
    }, fadeOutDelay);

    // 7. Transition timer to trigger completion
    const completeTimer = setTimeout(() => {
      setIsCompleted(true);
    }, config.durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [
    config.durationMs,
    isReducedMotion,
    containerOpacity,
    loaderOpacity,
    logoOpacity,
    logoScale,
    subtitleOpacity,
    titleOpacity,
  ]);


  // ── Navigation & Completion Effect (Gated on isHydrated) ──
  useEffect(() => {
    if (!isCompleted) return;

    if (onFinish) {
      onFinish();
      return;
    }

    // Standalone route: gate auto-navigation on store hydration to avoid premature redirects
    if (!isHydrated) return;

    if (hasCompletedOnboarding) {
      router.replace("/");
    } else {
      router.replace("/(onboarding)/step-name");
    }
  }, [isCompleted, isHydrated, hasCompletedOnboarding, onFinish, router]);

  // ── Animated Styles ──
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const loaderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
  }));

  const containerStyle = [
    { paddingTop: insets.top, paddingBottom: insets.bottom },
    containerAnimatedStyle,
  ];

  return {
    config,
    isCompleted,
    containerStyle,
    logoAnimatedStyle,
    titleAnimatedStyle,
    subtitleAnimatedStyle,
    loaderAnimatedStyle,
  };
}

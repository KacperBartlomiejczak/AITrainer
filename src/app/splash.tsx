import React, { useEffect } from "react";
import { Text, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { SplashScreenConfigSchema, type SplashScreenConfig } from "@/schemas/splash.schema";

// Disable Reanimated strict mode reading/writing warnings in development
try {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });
} catch {
  // Ignore in mock/test environments
}

export interface SplashScreenProps {
  /** Optional callback invoked when the splash animation and timer complete */
  onFinish?: () => void;
  /** Duration in milliseconds to show splash before completing (default: 1800ms) */
  durationMs?: number;
  /** Whether the splash screen is displayed as an absolute overlay */
  isOverlay?: boolean;
}

export default function SplashScreen({
  onFinish,
  durationMs = 1800,
  isOverlay = false,
}: SplashScreenProps) {
  "use no memo";

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding
  );

  // Validate configuration with Zod
  const parsedConfig = SplashScreenConfigSchema.safeParse({
    durationMs,
    isOverlay,
  });

  const config: SplashScreenConfig = parsedConfig.success
    ? parsedConfig.data
    : { durationMs: 1800, isOverlay: false };

  // ── Animations ──
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const loaderOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Logo fade in
    logoOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Logo pulse
    logoScale.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

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

    // 6. Transition timer to trigger onFinish or auto-navigation
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else {
        if (hasCompletedOnboarding) {
          router.replace("/");
        } else {
          router.replace("/(onboarding)/step-name");
        }
      }
    }, config.durationMs);

    return () => {
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.durationMs, onFinish, hasCompletedOnboarding, router]);

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

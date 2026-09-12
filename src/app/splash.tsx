import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  // ── Animations ──
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const loaderOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo fade in
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    // Logo pulse
    logoScale.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Title fade in after logo
    titleOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // Subtitle fade in after title
    subtitleOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // Loader fade in last
    loaderOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <View
      className="flex-1 bg-black items-center justify-center"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
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
    </View>
  );
}

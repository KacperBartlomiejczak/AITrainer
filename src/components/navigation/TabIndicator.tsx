import React from "react";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import type { StyleProp, ViewStyle } from "react-native";

interface TabIndicatorProps {
  style: AnimatedStyle<StyleProp<ViewStyle>>;
}

/** The sliding blue pill behind the active nav item. Absolutely positioned, no children. */
export function TabIndicator({ style }: TabIndicatorProps) {
  return (
    <Animated.View
      testID="pill-nav-indicator"
      pointerEvents="none"
      className="absolute left-0 top-1.5 bottom-1.5 rounded-full bg-[#007AFF] shadow-md shadow-[#007AFF]/30"
      style={style}
    />
  );
}

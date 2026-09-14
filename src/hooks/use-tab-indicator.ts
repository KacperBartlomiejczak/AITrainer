import { useCallback, useEffect, useRef, useState } from "react";
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  NavItemLayoutSchema,
  type NavItemLayout,
  type NavTabId,
} from "@/schemas/navigation.schema";

const INDICATOR_DURATION_MS = 250;
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

type LayoutsByTab = Partial<Record<NavTabId, NavItemLayout>>;

/**
 * Drives the sliding pill indicator behind the active nav item.
 * Item positions are measured once via `onLayout`, never per frame.
 */
export function useTabIndicator(activeTab: NavTabId) {
  const isReducedMotion = useReducedMotion();
  const [layouts, setLayouts] = useState<LayoutsByTab>({});
  const hasInitializedRef = useRef(false);

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const reportLayout = useCallback((tabId: NavTabId, layout: NavItemLayout) => {
    const parsed = NavItemLayoutSchema.safeParse(layout);
    if (!parsed.success) return;

    setLayouts((prev) => {
      const existing = prev[tabId];
      if (existing && existing.x === parsed.data.x && existing.width === parsed.data.width) {
        return prev;
      }
      return { ...prev, [tabId]: parsed.data };
    });
  }, []);

  const activeLayout = layouts[activeTab];

  useEffect(() => {
    if (!activeLayout) return;

    const isFirstMeasurement = !hasInitializedRef.current;
    const duration = isReducedMotion || isFirstMeasurement ? 0 : INDICATOR_DURATION_MS;

    indicatorX.set(withTiming(activeLayout.x, { duration, easing: EASE_IN_OUT }));
    indicatorWidth.set(withTiming(activeLayout.width, { duration, easing: EASE_IN_OUT }));
    hasInitializedRef.current = true;
  }, [activeLayout, isReducedMotion, indicatorX, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.get() }],
    width: indicatorWidth.get(),
  }));

  return { indicatorStyle, reportLayout };
}

import React from "react";
import { render, screen } from "@testing-library/react-native";
import SplashScreen from "../splash";

// Mock react-native-reanimated BEFORE any component import
jest.mock("react-native-reanimated", () => {
  const { View, Text } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (component: React.ComponentType) => component,
      View,
      Text,
      call: jest.fn(),
    },
    View,
    Text,
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: () => ({}),
    withTiming: (toValue: number) => toValue,
    withDelay: (_: number, anim: unknown) => anim,
    withRepeat: (anim: unknown) => anim,
    withSequence: (...anims: unknown[]) => anims[0],
    Easing: {
      out: () => ({}),
      inOut: () => ({}),
      ease: {},
      cubic: {},
    },
  };
});

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock expo-splash-screen
jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}));

// Mock the onboarding store
jest.mock("@/stores/onboarding.store", () => ({
  useOnboardingStore: jest.fn(() => ({
    isHydrated: false,
    hasCompletedOnboarding: false,
  })),
}));

describe("SplashScreen", () => {
  it("renders the app name", async () => {
    await render(<SplashScreen />);
    expect(screen.getByText("AITrainer")).toBeTruthy();
  });

  it("renders the motivational subtitle", async () => {
    await render(<SplashScreen />);
    expect(
      screen.getByText("Twój osobisty trener AI")
    ).toBeTruthy();
  });
});

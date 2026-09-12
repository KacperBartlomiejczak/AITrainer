import React from "react";
import { render, screen, act } from "@testing-library/react-native";
import SplashScreen from "../splash";
import { useOnboardingStore } from "@/stores/onboarding.store";

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

const mockReplace = jest.fn();

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock expo-splash-screen
jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn().mockResolvedValue(true),
  preventAutoHideAsync: jest.fn().mockResolvedValue(true),
}));

// Mock the onboarding store
jest.mock("@/stores/onboarding.store", () => ({
  useOnboardingStore: jest.fn((selector) => {
    const state = {
      isHydrated: true,
      hasCompletedOnboarding: false,
    };
    return typeof selector === "function" ? selector(state) : state;
  }),
}));

describe("SplashScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("renders the app name", async () => {
    await render(<SplashScreen />);
    expect(screen.getByText("AITrainer")).toBeTruthy();
  });

  it("renders the motivational subtitle", async () => {
    await render(<SplashScreen />);
    expect(screen.getByText("Twój osobisty trener AI")).toBeTruthy();
  });

  it("calls onFinish callback after durationMs expires", async () => {
    const onFinishMock = jest.fn();
    await render(<SplashScreen onFinish={onFinishMock} durationMs={1000} />);

    expect(onFinishMock).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(onFinishMock).toHaveBeenCalledTimes(1);
  });

  it("navigates to onboarding if user has not completed onboarding and onFinish is not provided", async () => {
    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { isHydrated: true, hasCompletedOnboarding: false };
      return typeof selector === "function" ? selector(state) : state;
    });

    await render(<SplashScreen durationMs={500} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(mockReplace).toHaveBeenCalledWith("/(onboarding)/step-name");
  });

  it("navigates to home screen if user has completed onboarding and onFinish is not provided", async () => {
    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { isHydrated: true, hasCompletedOnboarding: true };
      return typeof selector === "function" ? selector(state) : state;
    });

    await render(<SplashScreen durationMs={500} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("cleans up timer on unmount to prevent memory leaks and unmounted updates", async () => {
    const onFinishMock = jest.fn();
    const { unmount } = await render(<SplashScreen onFinish={onFinishMock} durationMs={1000} />);
    expect(onFinishMock).not.toHaveBeenCalled();

    await act(async () => {
      unmount();
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(onFinishMock).not.toHaveBeenCalled();
  });
});

import React from "react";
import { render, screen, act } from "@testing-library/react-native";
import RootLayout from "../_layout";
import * as SplashScreenModule from "expo-splash-screen";

// Mock react-native-reanimated BEFORE any component import
jest.mock("react-native-reanimated", () => {
  const { View: RNView, Text: RNText } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (component: React.ComponentType) => component,
      View: RNView,
      Text: RNText,
      call: jest.fn(),
    },
    View: RNView,
    Text: RNText,
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: () => ({}),
    useReducedMotion: () => false,
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
let mockSegments: string[] = [];

// Mock expo-router
jest.mock("expo-router", () => {
  const React = jest.requireActual("react");
  const RN = jest.requireActual("react-native");

  function MockScreen() {
    return null;
  }
  MockScreen.displayName = "MockScreen";

  function MockStack(props: { children?: React.ReactNode }) {
    return React.createElement(RN.View, { testID: "mock-stack-navigator" }, props.children);
  }
  MockStack.displayName = "MockStack";
  MockStack.Screen = MockScreen;

  return {
    useRouter: () => ({
      replace: mockReplace,
    }),
    useSegments: () => mockSegments,
    Stack: MockStack,
  };
});

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  };
});

// Mock expo-splash-screen
jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn().mockResolvedValue(true),
  preventAutoHideAsync: jest.fn().mockResolvedValue(true),
}));

let mockStoreState = {
  isHydrated: true,
  hasCompletedOnboarding: true,
};

// Mock onboarding store
jest.mock("@/stores/onboarding.store", () => ({
  useOnboardingStore: jest.fn((selector) => {
    return typeof selector === "function" ? selector(mockStoreState) : mockStoreState;
  }),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockSegments = [];
    mockStoreState = {
      isHydrated: true,
      hasCompletedOnboarding: true,
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("always renders the Stack navigator for Expo Router compliance", async () => {
    await render(<RootLayout />);
    expect(screen.getByTestId("mock-stack-navigator")).toBeTruthy();
  });

  it("renders the animated splash overlay initially on root route", async () => {
    await render(<RootLayout />);
    expect(screen.getByText("AITrainer")).toBeTruthy();
  });

  it("does NOT render the animated splash overlay if current route is /splash", async () => {
    mockSegments = ["splash"];
    await render(<RootLayout />);

    expect(screen.queryByText("AITrainer")).toBeNull();
  });

  it("safely hides native splash screen on root view layout", async () => {
    const { getByTestId } = await render(<RootLayout />);
    const container = getByTestId("mock-stack-navigator").parent;

    await act(async () => {
      container?.props.onLayout?.();
    });

    expect(SplashScreenModule.hideAsync).toHaveBeenCalled();
  });

  it("redirects un-onboarded user to /(onboarding)/step-name after splash overlay finishes", async () => {
    mockStoreState = {
      isHydrated: true,
      hasCompletedOnboarding: false,
    };
    mockSegments = [];

    await render(<RootLayout />);

    // Splash overlay is still showing; should NOT navigate yet
    expect(mockReplace).not.toHaveBeenCalled();

    // Advance splash duration timer (1600ms)
    await act(async () => {
      jest.advanceTimersByTime(1600);
    });

    expect(mockReplace).toHaveBeenCalledWith("/(onboarding)/step-name");
  });

  it("does NOT redirect user who is already in an onboarding step", async () => {
    mockStoreState = {
      isHydrated: true,
      hasCompletedOnboarding: false,
    };
    mockSegments = ["(onboarding)", "step-muscles"];

    await render(<RootLayout />);

    await act(async () => {
      jest.advanceTimersByTime(1600);
    });

    // User is already in onboarding step, so no redirect should occur
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects user with completed onboarding away from onboarding route back to /", async () => {
    mockStoreState = {
      isHydrated: true,
      hasCompletedOnboarding: true,
    };
    mockSegments = ["(onboarding)", "step-name"];

    await render(<RootLayout />);

    await act(async () => {
      jest.advanceTimersByTime(1600);
    });

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("redirects user with completed onboarding away from /splash route back to /", async () => {
    mockStoreState = {
      isHydrated: true,
      hasCompletedOnboarding: true,
    };
    mockSegments = ["splash"];

    await render(<RootLayout />);

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("does NOT navigate while store is not hydrated", async () => {
    mockStoreState = {
      isHydrated: false,
      hasCompletedOnboarding: false,
    };
    mockSegments = [];

    await render(<RootLayout />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});

import React from "react";
import { render } from "@testing-library/react-native";
import RootLayout from "../_layout";

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

// Mock expo-router without JSX to avoid babel css-interop issues
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
      replace: jest.fn(),
    }),
    useSegments: () => [],
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

// Mock onboarding store
jest.mock("@/stores/onboarding.store", () => ({
  useOnboardingStore: jest.fn((selector) => {
    const state = {
      isHydrated: true,
      hasCompletedOnboarding: true,
    };
    return typeof selector === "function" ? selector(state) : state;
  }),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("always renders the Stack navigator for Expo Router compliance", async () => {
    const { getByTestId } = await render(<RootLayout />);
    expect(getByTestId("mock-stack-navigator")).toBeTruthy();
  });

  it("renders the animated splash overlay initially", async () => {
    const { getByText } = await render(<RootLayout />);
    expect(getByText("AITrainer")).toBeTruthy();
  });
});

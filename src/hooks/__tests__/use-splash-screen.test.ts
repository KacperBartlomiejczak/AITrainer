import { renderHook, act } from "@testing-library/react-native";
import { useSplashScreen } from "../use-splash-screen";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { useReducedMotion } from "react-native-reanimated";

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (component: React.ComponentType) => component,
      View: actual.View,
      Text: actual.Text,
      call: jest.fn(),
    },
    View: actual.View,
    Text: actual.Text,
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: () => ({}),
    useReducedMotion: jest.fn(() => false),
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

// Mock onboarding store
jest.mock("@/stores/onboarding.store", () => ({
  useOnboardingStore: jest.fn((selector) => {
    const state = {
      isHydrated: true,
      hasCompletedOnboarding: false,
    };
    return typeof selector === "function" ? selector(state) : state;
  }),
}));

describe("useSplashScreen hook", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.clearAllTimers();
    (useReducedMotion as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("initializes with parsed config and animation styles", async () => {
    const { result } = await renderHook(() =>
      useSplashScreen({ durationMs: 1200, isOverlay: true })
    );

    expect(result.current.config.durationMs).toBe(1200);
    expect(result.current.config.isOverlay).toBe(true);
    expect(result.current.containerStyle).toBeDefined();
    expect(result.current.logoAnimatedStyle).toBeDefined();
    expect(result.current.isCompleted).toBe(false);
  });

  it("calls onFinish callback after durationMs expires", async () => {
    const onFinish = jest.fn();
    const { result } = await renderHook(() =>
      useSplashScreen({ onFinish, durationMs: 1000 })
    );

    expect(onFinish).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isCompleted).toBe(true);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("navigates to onboarding when onFinish is not provided and hasCompletedOnboarding is false", async () => {
    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { isHydrated: true, hasCompletedOnboarding: false };
      return typeof selector === "function" ? selector(state) : state;
    });

    const { result } = await renderHook(() =>
      useSplashScreen({ durationMs: 800 })
    );

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    expect(result.current.isCompleted).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith("/(onboarding)/step-name");
  });

  it("navigates to home when onFinish is not provided and hasCompletedOnboarding is true", async () => {
    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { isHydrated: true, hasCompletedOnboarding: true };
      return typeof selector === "function" ? selector(state) : state;
    });

    const { result } = await renderHook(() =>
      useSplashScreen({ durationMs: 800 })
    );

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    expect(result.current.isCompleted).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("waits for isHydrated before navigating when timer completes during unhydrated state", async () => {
    let hydrated = false;
    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { isHydrated: hydrated, hasCompletedOnboarding: true };
      return typeof selector === "function" ? selector(state) : state;
    });

    const { result, rerender } = await renderHook(() =>
      useSplashScreen({ durationMs: 800 })
    );

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    expect(result.current.isCompleted).toBe(true);
    // Not hydrated yet -> must NOT navigate prematurely
    expect(mockReplace).not.toHaveBeenCalled();

    // Now rehydration completes
    hydrated = true;
    await act(async () => {
      rerender({});
    });

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("cleans up timers on unmount", async () => {
    const onFinish = jest.fn();
    const { unmount } = await renderHook(() =>
      useSplashScreen({ onFinish, durationMs: 1500 })
    );

    await act(async () => {
      unmount();
    });

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    expect(onFinish).not.toHaveBeenCalled();
  });

  it("respects reduced motion preference without errors", async () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true);

    const { result } = await renderHook(() =>
      useSplashScreen({ durationMs: 500 })
    );

    expect(result.current.logoAnimatedStyle).toBeDefined();
  });
});

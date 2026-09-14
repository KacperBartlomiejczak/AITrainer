import { renderHook, act } from "@testing-library/react-native";
import { useTabIndicator } from "../use-tab-indicator";
import { useReducedMotion, withTiming } from "react-native-reanimated";
import type { NavTabId } from "@/schemas/navigation.schema";

interface HookProps {
  active: NavTabId;
}

// Mock react-native-reanimated the same way use-splash-screen.test.ts does:
// assert on *what the hook decides to call* (withTiming args), not on the
// composited style, since real animated styles update on the UI thread and
// never round-trip back through a React re-render in Jest.
jest.mock("react-native-reanimated", () => {
  return {
    __esModule: true,
    useSharedValue: (init: number) => {
      let current = init;
      return {
        get() {
          return current;
        },
        set(v: unknown) {
          current = typeof v === "function" ? v(current) : v;
        },
      };
    },
    useAnimatedStyle: () => ({}),
    useReducedMotion: jest.fn(() => false),
    withTiming: jest.fn((toValue: number) => toValue),
    Easing: {
      bezier: () => ({}),
    },
  };
});

describe("useTabIndicator", () => {
  beforeEach(() => {
    (withTiming as jest.Mock).mockClear();
    (useReducedMotion as jest.Mock).mockReturnValue(false);
  });

  it("returns a defined indicator style and does not animate before any layout is measured", async () => {
    const { result, unmount } = await renderHook(() => useTabIndicator("home"));

    expect(result.current.indicatorStyle).toBeDefined();
    expect(withTiming).not.toHaveBeenCalled();

    unmount();
  });

  it("snaps to the first measured layout without animating (duration 0)", async () => {
    const { result, rerender, unmount } = await renderHook(
      ({ active }: HookProps) => useTabIndicator(active),
      { initialProps: { active: "home" as const } }
    );

    await act(async () => {
      result.current.reportLayout("home", { x: 12, width: 80 });
    });
    await rerender({ active: "home" });

    expect(withTiming).toHaveBeenCalledWith(12, expect.objectContaining({ duration: 0 }));
    expect(withTiming).toHaveBeenCalledWith(80, expect.objectContaining({ duration: 0 }));

    unmount();
  });

  it("animates (duration 250) when switching to an already-measured tab", async () => {
    const { result, rerender, unmount } = await renderHook(
      ({ active }: HookProps) => useTabIndicator(active),
      { initialProps: { active: "home" as const } }
    );

    await act(async () => {
      result.current.reportLayout("home", { x: 0, width: 80 });
      result.current.reportLayout("workouts", { x: 90, width: 100 });
    });
    await rerender({ active: "home" });

    (withTiming as jest.Mock).mockClear();
    await rerender({ active: "workouts" });

    expect(withTiming).toHaveBeenCalledWith(90, expect.objectContaining({ duration: 250 }));
    expect(withTiming).toHaveBeenCalledWith(100, expect.objectContaining({ duration: 250 }));

    unmount();
  });

  it("uses duration 0 for every move when reduced motion is enabled", async () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true);

    const { result, rerender, unmount } = await renderHook(
      ({ active }: HookProps) => useTabIndicator(active),
      { initialProps: { active: "home" as const } }
    );

    await act(async () => {
      result.current.reportLayout("home", { x: 0, width: 80 });
      result.current.reportLayout("workouts", { x: 90, width: 100 });
    });
    await rerender({ active: "home" });
    await rerender({ active: "workouts" });

    for (const call of (withTiming as jest.Mock).mock.calls) {
      expect(call[1]).toEqual(expect.objectContaining({ duration: 0 }));
    }
    expect(withTiming).toHaveBeenCalled();

    unmount();
  });

  it("ignores an invalid layout (negative x, non-positive width)", async () => {
    const { result, rerender, unmount } = await renderHook(
      ({ active }: HookProps) => useTabIndicator(active),
      { initialProps: { active: "home" as const } }
    );

    await act(async () => {
      result.current.reportLayout("home", { x: -5, width: 0 });
    });
    await rerender({ active: "home" });

    expect(withTiming).not.toHaveBeenCalled();

    unmount();
  });
});

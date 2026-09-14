import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { PillNavbar } from "../PillNavbar";
import { PillNavItem } from "../PillNavItem";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

const mockSelectionAsync = jest.fn();
jest.mock("expo-haptics", () => ({
  selectionAsync: () => mockSelectionAsync(),
}));

jest.mock("react-native-reanimated", () => {
  const { View: RNView, Text: RNText } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (component: React.ComponentType) => component,
      View: RNView,
      Text: RNText,
    },
    View: RNView,
    Text: RNText,
    useSharedValue: (init: number) => ({ value: init, get: () => init, set: () => {} }),
    useAnimatedStyle: () => ({}),
    useReducedMotion: () => false,
    withTiming: (toValue: number) => toValue,
    Easing: { bezier: () => ({}) },
  };
});

describe("PillNavbar & PillNavItem", () => {
  beforeEach(() => {
    mockSelectionAsync.mockClear();
  });

  it("renders 5 nav tabs (Home, Treningi, AI mentor, Ranking, Twój profil)", async () => {
    const { getByTestId, getByText, unmount } = await render(<PillNavbar />);

    expect(getByTestId("pill-navbar")).toBeTruthy();
    expect(getByTestId("pill-nav-indicator")).toBeTruthy();
    expect(getByTestId("pill-nav-home")).toBeTruthy();
    expect(getByTestId("pill-nav-workouts")).toBeTruthy();
    expect(getByTestId("pill-nav-ai-mentor")).toBeTruthy();
    expect(getByTestId("pill-nav-ranking")).toBeTruthy();
    expect(getByTestId("pill-nav-profile")).toBeTruthy();

    expect(getByText("Home")).toBeTruthy();
    expect(getByText("Treningi")).toBeTruthy();
    expect(getByText("AI mentor")).toBeTruthy();
    expect(getByText("Ranking")).toBeTruthy();
    expect(getByText("Twój profil")).toBeTruthy();

    unmount();
  });

  it("handles tab press in PillNavItem and fires a selection haptic", async () => {
    const onPressMock = jest.fn();
    const item = {
      id: "home" as const,
      label: "Home",
      iconName: "Home" as const,
      route: "/",
      testID: "test-pill-item",
    };

    const { getByTestId, unmount } = await render(
      <PillNavItem item={item} isActive={false} onPress={onPressMock} />
    );

    await act(async () => {
      fireEvent.press(getByTestId("test-pill-item"));
    });
    expect(onPressMock).toHaveBeenCalledTimes(1);
    expect(mockSelectionAsync).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("reports its measured layout via onMeasured", async () => {
    const onMeasuredMock = jest.fn();
    const item = {
      id: "home" as const,
      label: "Home",
      iconName: "Home" as const,
      route: "/",
      testID: "test-pill-item",
    };

    const { getByTestId, unmount } = await render(
      <PillNavItem item={item} isActive={false} onPress={jest.fn()} onMeasured={onMeasuredMock} />
    );

    await act(async () => {
      fireEvent(getByTestId("test-pill-item"), "layout", {
        nativeEvent: { layout: { x: 4, y: 0, width: 76, height: 40 } },
      });
    });

    expect(onMeasuredMock).toHaveBeenCalledWith({ x: 4, width: 76 });

    unmount();
  });

  it("highlights active tab correctly", async () => {
    const { getByTestId, unmount } = await render(
      <PillNavbar activeTab="workouts" />
    );

    const workoutsTab = getByTestId("pill-nav-workouts");
    expect(workoutsTab.props.accessibilityState).toEqual({ selected: true });

    const homeTab = getByTestId("pill-nav-home");
    expect(homeTab.props.accessibilityState).toEqual({ selected: false });

    unmount();
  });

  it("marks nav items with the tab accessibility role", async () => {
    const { getByTestId, unmount } = await render(<PillNavbar activeTab="ai-mentor" />);

    expect(getByTestId("pill-nav-ai-mentor").props.accessibilityRole).toBe("tab");

    unmount();
  });
});

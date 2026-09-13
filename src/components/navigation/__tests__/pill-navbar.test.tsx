import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { PillNavbar } from "../PillNavbar";
import { PillNavItem } from "../PillNavItem";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("PillNavbar & PillNavItem", () => {
  it("renders 3 nav tabs (Home, Trening, Profil)", async () => {
    const { getByTestId, getByText, unmount } = await render(<PillNavbar />);

    expect(getByTestId("pill-navbar")).toBeTruthy();
    expect(getByTestId("pill-nav-home")).toBeTruthy();
    expect(getByTestId("pill-nav-workouts")).toBeTruthy();
    expect(getByTestId("pill-nav-profile")).toBeTruthy();

    expect(getByText("Start")).toBeTruthy();
    expect(getByText("Trening")).toBeTruthy();
    expect(getByText("Profil")).toBeTruthy();

    unmount();
  });

  it("handles tab press in PillNavItem", async () => {
    const onPressMock = jest.fn();
    const item = {
      id: "home" as const,
      label: "Start",
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
});

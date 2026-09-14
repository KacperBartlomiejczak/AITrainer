import React from "react";
import { render, screen } from "@testing-library/react-native";
import TabsLayout from "../(tabs)/_layout";

jest.mock("@/components/navigation", () => {
  const ActualReact = jest.requireActual<typeof import("react")>("react");
  const RN = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    PillNavbar: () => ActualReact.createElement(RN.View, { testID: "mock-pill-navbar" }),
  };
});

jest.mock("expo-router", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const RN = jest.requireActual<typeof import("react-native")>("react-native");

  function MockTabsScreen() {
    return null;
  }
  MockTabsScreen.displayName = "MockTabsScreen";

  function MockTabs(props: {
    children?: React.ReactNode;
    tabBar?: (props: unknown) => React.ReactNode;
  }) {
    const names = React.Children.toArray(props.children)
      .filter(
        (child): child is React.ReactElement<{ name: string }> =>
          React.isValidElement(child) && typeof (child.props as { name?: unknown }).name === "string"
      )
      .map((child) => child.props.name);

    return React.createElement(
      RN.View,
      { testID: "mock-tabs-navigator", accessibilityLabel: names.join(",") },
      typeof props.tabBar === "function"
        ? props.tabBar({
            state: {},
            descriptors: {},
            navigation: {},
            insets: { top: 0, bottom: 0, left: 0, right: 0 },
          })
        : null
    );
  }
  MockTabs.displayName = "MockTabs";
  MockTabs.Screen = MockTabsScreen;

  return { Tabs: MockTabs };
});

describe("(tabs)/_layout", () => {
  it("declares all 5 tabs in order: index, workouts, ai-mentor, ranking, user-profile", async () => {
    await render(<TabsLayout />);

    expect(screen.getByTestId("mock-tabs-navigator").props.accessibilityLabel).toBe(
      "index,workouts,ai-mentor,ranking,user-profile"
    );
  });

  it("renders PillNavbar as the custom tab bar", async () => {
    await render(<TabsLayout />);

    expect(screen.getByTestId("mock-pill-navbar")).toBeTruthy();
  });
});

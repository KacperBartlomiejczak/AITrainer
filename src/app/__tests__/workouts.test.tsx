import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import WorkoutsScreen from "../workouts";
import { useRouter } from "expo-router";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("WorkoutsScreen", () => {
  it("renders workouts screen with routines and pill navbar", async () => {
    const router = useRouter();
    const { getByText, getByTestId, unmount } = await render(<WorkoutsScreen />);

    expect(getByText("Treningi & Rutyny 🏋️")).toBeTruthy();
    expect(getByText("Baza Ćwiczeń & Atlas")).toBeTruthy();
    expect(getByText("Gotowe Rutyny Treningowe")).toBeTruthy();
    expect(getByTestId("pill-navbar")).toBeTruthy();

    const showAllBtn = getByTestId("show-all-exercises-button");
    await act(async () => {
      fireEvent.press(showAllBtn);
    });
    expect(router.push).toHaveBeenCalledWith("/exercises");

    unmount();
  });
});

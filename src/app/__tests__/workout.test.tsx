import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import WorkoutDetailScreen from "../workout/[id]";
import { useRouter, useLocalSearchParams } from "expo-router";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("WorkoutDetailScreen", () => {
  it("renders workout detail screen for valid routine", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "rtn_fbw_01" });
    const router = useRouter();

    const { getByText, getByTestId, unmount } = await render(
      <WorkoutDetailScreen />
    );

    expect(getByText("FBW dla Początkujących")).toBeTruthy();
    expect(getByText("Plan Ćwiczeń")).toBeTruthy();

    const backBtn = getByTestId("workout-back-button");
    await act(async () => {
      fireEvent.press(backBtn);
    });

    expect(router.push).toHaveBeenCalledWith("/workouts");
    unmount();
  });

  it("renders not-found state for invalid routine", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "non_existent" });
    const router = useRouter();

    const { getByText, getByTestId, unmount } = await render(
      <WorkoutDetailScreen />
    );

    expect(getByText("Nie znaleziono treningu")).toBeTruthy();

    const backBtn = getByTestId("workout-not-found-back-button");
    await act(async () => {
      fireEvent.press(backBtn);
    });

    expect(router.push).toHaveBeenCalledWith("/workouts");
    unmount();
  });
});

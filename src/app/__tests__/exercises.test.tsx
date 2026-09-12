import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import ExercisesScreen from "../exercises";
import { useRouter } from "expo-router";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("ExercisesScreen", () => {
  it("renders exercises screen with search and categories", async () => {
    const router = useRouter();
    const { getByText, getByTestId, unmount } = await render(
      <ExercisesScreen />
    );

    expect(getByText("Baza Ćwiczeń")).toBeTruthy();
    expect(getByText("Wszystkie")).toBeTruthy();
    expect(getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();

    const backBtn = getByTestId("back-to-workouts-button");
    await act(async () => {
      fireEvent.press(backBtn);
    });
    expect(router.back).toHaveBeenCalled();

    unmount();
  });
});

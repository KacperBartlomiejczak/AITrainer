import React from "react";
import { render, fireEvent, act, screen } from "@testing-library/react-native";
import WorkoutsScreen from "../(tabs)/workouts";
import { useRouter } from "expo-router";
import { resetInMemoryDatabase } from "@/db/testing/in-memory-client";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("WorkoutsScreen", () => {
  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("renders workouts screen with routines from the database", async () => {
    const router = useRouter();
    const { unmount } = await render(<WorkoutsScreen />);

    expect(screen.getByText("Treningi & Rutyny 🏋️")).toBeTruthy();
    expect(screen.getByText("Baza Ćwiczeń & Atlas")).toBeTruthy();
    expect(screen.getByText("Gotowe Rutyny Treningowe")).toBeTruthy();
    expect(await screen.findByText("FBW A — Całe ciało")).toBeTruthy();
    expect(screen.getByText("FBW B — Całe ciało")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("show-all-exercises-button"));
    });
    expect(router.push).toHaveBeenCalledWith("/exercises");

    expect(screen.getByText("Stwórz nową rutynę")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByTestId("start-empty-workout-button"));
    });
    expect(router.push).toHaveBeenCalledWith("/workout-session");

    unmount();
  });
});

import React from "react";
import { render, fireEvent, act, screen } from "@testing-library/react-native";
import WorkoutDetailScreen from "../workout/[id]";
import { useRouter, useLocalSearchParams } from "expo-router";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { loadWorkoutHistory } from "@/db/workout-history";
import { useActiveWorkoutStore } from "@/stores/active-workout.store";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("WorkoutDetailScreen", () => {
  beforeEach(async () => {
    useActiveWorkoutStore.getState().finishWorkout();
    await saveLocalProfile();
  });

  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("renders workout detail screen for a routine stored in the database", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "rtn_fbw_a" });
    const router = useRouter();

    const { unmount } = await render(<WorkoutDetailScreen />);

    expect(await screen.findByText("FBW A — Całe ciało")).toBeTruthy();
    expect(screen.getByText("Plan Ćwiczeń")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("workout-back-button"));
    });

    expect(router.push).toHaveBeenCalledWith("/workouts");
    unmount();
  });

  it("renders not-found state for invalid routine", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "non_existent" });
    const router = useRouter();

    const { unmount } = await render(<WorkoutDetailScreen />);

    expect(await screen.findByText("Nie znaleziono treningu")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("workout-not-found-back-button"));
    });

    expect(router.push).toHaveBeenCalledWith("/workouts");
    unmount();
  });

  it("asks to complete at least one exercise before saving", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "rtn_fbw_a" });
    const { unmount } = await render(<WorkoutDetailScreen />);
    await screen.findByText("FBW A — Całe ciało");

    await act(async () => fireEvent.press(screen.getByTestId("start-workout-session-button")));
    await act(async () => fireEvent.press(screen.getByTestId("finish-workout-button")));

    expect(screen.getByText("Odhacz przynajmniej jedno ćwiczenie, aby zapisać trening")).toBeTruthy();
    expect(screen.queryByText("Trening zapisany 💪")).toBeNull();
    unmount();
  });

  it("saves a finished workout, offers an optional photo and lets the user skip it", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "rtn_fbw_a" });
    const router = useRouter();
    const { unmount } = await render(<WorkoutDetailScreen />);
    await screen.findByText("FBW A — Całe ciało");

    await act(async () => fireEvent.press(screen.getByTestId("start-workout-session-button")));
    await act(async () => fireEvent.press(screen.getByTestId("workout-exercise-item-rtn_fbw_a_ex_1")));
    await act(async () => fireEvent.press(screen.getByTestId("finish-workout-button")));

    expect(await screen.findByText("Trening zapisany 💪")).toBeTruthy();
    expect(screen.getByTestId("photo-source-camera")).toBeTruthy();
    expect(screen.getByTestId("photo-source-library")).toBeTruthy();
    expect(await loadWorkoutHistory()).toHaveLength(1);

    await act(async () => fireEvent.press(screen.getByText("Pomiń")));
    expect(router.push).toHaveBeenCalledWith("/user-profile");
    unmount();
  });
});

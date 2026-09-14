import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import CreateRoutineScreen from "../new";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { loadRoutines } from "@/db/workout-history";
import { INITIAL_CATALOG_EXERCISES } from "@/hooks/use-exercise-catalog";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

const BENCH_PRESS_ID = INITIAL_CATALOG_EXERCISES.find(
  (exercise) => exercise.name === "Wyciskanie sztangi na ławce poziomej",
)!.id;

describe("CreateRoutineScreen", () => {
  beforeEach(async () => {
    await saveLocalProfile();
  });

  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("navigates back when the header back button is pressed", async () => {
    const router = useRouter();
    const { unmount } = await render(<CreateRoutineScreen />);

    await act(async () => fireEvent.press(screen.getByTestId("create-routine-back")));
    expect(router.back).toHaveBeenCalled();
    unmount();
  });

  it("disables save until title, description and an exercise are filled in", async () => {
    const { unmount } = await render(<CreateRoutineScreen />);

    expect(screen.getByTestId("create-routine-save").props.accessibilityState).toMatchObject({ disabled: true });
    unmount();
  });

  it("picks an exercise, fills the form and saves a new routine", async () => {
    const router = useRouter();
    const { unmount } = await render(<CreateRoutineScreen />);

    await act(async () => fireEvent.press(screen.getByTestId("add-exercise-button")));
    await act(async () => fireEvent.changeText(screen.getByTestId("exercise-picker-search"), "ławce poziomej"));
    await act(async () => fireEvent.press(screen.getByTestId(`exercise-picker-add-${BENCH_PRESS_ID}`)));

    expect(screen.queryByTestId("exercise-picker-search")).toBeNull();
    expect(screen.getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();

    await act(async () => fireEvent.changeText(screen.getByTestId("routine-title-input"), "Push day"));
    await act(async () => fireEvent.changeText(screen.getByTestId("routine-description-input"), "Klatka i triceps"));

    expect(screen.getByTestId("create-routine-save").props.accessibilityState).toMatchObject({ disabled: false });
    await act(async () => fireEvent.press(screen.getByTestId("create-routine-save")));

    await waitFor(() => expect(router.back).toHaveBeenCalled());
    const routines = await loadRoutines();
    expect(routines.map((r) => r.title)).toContain("Push day");
    unmount();
  });

  it("removes a picked exercise from the draft", async () => {
    const { unmount } = await render(<CreateRoutineScreen />);

    await act(async () => fireEvent.press(screen.getByTestId("add-exercise-button")));
    await act(async () => fireEvent.changeText(screen.getByTestId("exercise-picker-search"), "ławce poziomej"));
    await act(async () => fireEvent.press(screen.getByTestId(`exercise-picker-add-${BENCH_PRESS_ID}`)));
    expect(screen.getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();

    const removeButtons = screen.getAllByLabelText(/Usuń/);
    await act(async () => fireEvent.press(removeButtons[0]!));

    expect(screen.getByText("Dodaj przynajmniej jedno ćwiczenie")).toBeTruthy();
    unmount();
  });
});

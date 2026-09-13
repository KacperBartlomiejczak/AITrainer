import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import ExercisesScreen from "../exercises";
import { useRouter } from "expo-router";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("ExercisesScreen", () => {
  it("renders exercises screen with search and filter button", async () => {
    const router = useRouter();
    const { getByText, getByTestId, unmount } = await render(
      <ExercisesScreen />
    );

    expect(getByText("Baza Ćwiczeń")).toBeTruthy();
    expect(getByTestId("open-filters-button")).toBeTruthy();
    expect(getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();

    const backBtn = getByTestId("back-to-workouts-button");
    await act(async () => {
      fireEvent.press(backBtn);
    });
    expect(router.back).toHaveBeenCalled();

    unmount();
  });

  it("opens filter modal and filters exercises by equipment and muscle group", async () => {
    const { getByTestId, getByText, queryByText, queryByTestId, unmount } = await render(
      <ExercisesScreen />
    );

    // Open filter modal
    const filterBtn = getByTestId("open-filters-button");
    expect(filterBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(filterBtn);
    });

    // Modal should be visible
    expect(getByText("Filtry ćwiczeń")).toBeTruthy();
    expect(getByText("Sprzęt treningowy")).toBeTruthy();

    // Select Hantle (dumbbell)
    const dumbbellChip = getByTestId("equipment-filter-dumbbell");
    await act(async () => {
      fireEvent.press(dumbbellChip);
    });

    // Apply filters
    const applyBtn = getByTestId("apply-filters-button");
    await act(async () => {
      fireEvent.press(applyBtn);
    });

    // Badge should be visible showing active filter count
    expect(getByTestId("active-filter-badge")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();

    // Dumbbell exercise should be present
    expect(getByText("Wyciskanie hantli na ławce")).toBeTruthy();
    // Barbell-only exercise shouldn't be present
    expect(queryByText("Wyciskanie sztangi na ławce poziomej")).toBeNull();

    // Re-open modal to reset filters
    await act(async () => {
      fireEvent.press(filterBtn);
    });

    const resetBtn = getByTestId("reset-filters-button");
    await act(async () => {
      fireEvent.press(resetBtn);
    });

    await act(async () => {
      fireEvent.press(getByTestId("apply-filters-button"));
    });

    // Badge should be gone
    expect(queryByTestId("active-filter-badge")).toBeNull();

    // Barbell exercise should now reappear
    expect(getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();

    unmount();
  });

  it("exposes accessible view-mode selector and updates selected state", async () => {
    const { getByLabelText, getByTestId, unmount } = await render(
      <ExercisesScreen />
    );

    const gridBtn = getByTestId("view-mode-grid-button");
    const listBtn = getByTestId("view-mode-list-button");

    expect(gridBtn.props.accessibilityRole).toBe("button");
    expect(gridBtn.props.accessibilityLabel).toBe("Widok siatki");
    expect(gridBtn.props.accessibilityState).toEqual({ selected: true });

    expect(listBtn.props.accessibilityRole).toBe("button");
    expect(listBtn.props.accessibilityLabel).toBe("Widok listy");
    expect(listBtn.props.accessibilityState).toEqual({ selected: false });

    expect(getByLabelText("Widok siatki")).toBeTruthy();
    expect(getByLabelText("Widok listy")).toBeTruthy();

    // Switch to list mode
    await act(async () => {
      fireEvent.press(listBtn);
    });

    expect(gridBtn.props.accessibilityState).toEqual({ selected: false });
    expect(listBtn.props.accessibilityState).toEqual({ selected: true });

    // Switch back to grid mode
    await act(async () => {
      fireEvent.press(gridBtn);
    });

    expect(gridBtn.props.accessibilityState).toEqual({ selected: true });
    expect(listBtn.props.accessibilityState).toEqual({ selected: false });

    unmount();
  });
});




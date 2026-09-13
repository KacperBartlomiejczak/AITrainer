import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ExerciseSearchBar } from "../ExerciseSearchBar";
import { ExerciseFilterChips } from "../ExerciseFilterChips";
import { ExerciseCard } from "../ExerciseCard";
import { ExercisePreviewModal } from "../ExercisePreviewModal";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

const MOCK_EXERCISE: CatalogExercise = {
  id: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  bodyPart: "chest",
  category: "chest",
  target: "Klatka piersiowa",
  equipment: "Sztanga",
  instructionsPl: "Połóż się płasko na ławce i wyciśnij sztangę w górę.",
  imageFile: "images/0025-EIeI8Vf.jpg",
  gifFile: "videos/0025-EIeI8Vf.gif",
  muscleGroup: "pectorals",
  secondaryMuscles: ["shoulders", "triceps"],
};

describe("Exercise Catalog Components", () => {
  it("renders ExerciseSearchBar and handles query change", async () => {
    const onChangeMock = jest.fn();
    const { getByPlaceholderText, unmount } = await render(
      <ExerciseSearchBar query="" onChangeQuery={onChangeMock} />
    );

    const input = getByPlaceholderText("Szukaj ćwiczenia, mięśnia lub sprzętu...");
    expect(input).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(input, "Klatka");
    });
    expect(onChangeMock).toHaveBeenCalledWith("Klatka");

    unmount();
  });

  it("renders ExerciseFilterChips and selects category", async () => {
    const onSelectMock = jest.fn();
    const { getByText, unmount } = await render(
      <ExerciseFilterChips
        selectedCategory="all"
        onSelectCategory={onSelectMock}
      />
    );

    expect(getByText("Wszystkie")).toBeTruthy();
    expect(getByText("Klatka")).toBeTruthy();
    expect(getByText("Plecy")).toBeTruthy();
    expect(getByText("Cardio")).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByText("Klatka"));
    });
    expect(onSelectMock).toHaveBeenCalledWith("chest");

    unmount();
  });

  it("renders ExerciseCard and triggers preview on press", async () => {
    const onPreviewMock = jest.fn();
    const { getByText, getByTestId, unmount } = await render(
      <ExerciseCard exercise={MOCK_EXERCISE} onPressPreview={onPreviewMock} />
    );

    expect(getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();
    expect(getByText("Klatka piersiowa")).toBeTruthy();
    expect(getByText("Sztanga")).toBeTruthy();

    const card = getByTestId("exercise-card-0025");
    await act(async () => {
      fireEvent.press(card);
    });
    expect(onPreviewMock).toHaveBeenCalledWith(MOCK_EXERCISE);

    unmount();
  });

  it("renders ExercisePreviewModal when visible and handles close", async () => {
    const onCloseMock = jest.fn();
    const { getByText, getByTestId, unmount } = await render(
      <ExercisePreviewModal
        exercise={MOCK_EXERCISE}
        visible={true}
        onClose={onCloseMock}
      />
    );

    expect(getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();
    expect(getByText("Połóż się płasko na ławce i wyciśnij sztangę w górę.")).toBeTruthy();

    const closeBtn = getByTestId("close-exercise-preview-button");
    await act(async () => {
      fireEvent.press(closeBtn);
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("renders the exercise GIF in ExercisePreviewModal when media exists", async () => {
    const { getByTestId, queryByTestId, unmount } = await render(
      <ExercisePreviewModal exercise={MOCK_EXERCISE} visible={true} onClose={jest.fn()} />
    );

    expect(getByTestId("exercise-preview-gif")).toBeTruthy();
    expect(queryByTestId("exercise-preview-placeholder")).toBeNull();

    unmount();
  });

  it("renders a placeholder in ExercisePreviewModal when the exercise has no media", async () => {
    const exerciseWithoutMedia: CatalogExercise = { ...MOCK_EXERCISE, id: "no-media" };
    const { getByTestId, getByText, queryByTestId, unmount } = await render(
      <ExercisePreviewModal exercise={exerciseWithoutMedia} visible={true} onClose={jest.fn()} />
    );

    expect(getByTestId("exercise-preview-placeholder")).toBeTruthy();
    expect(getByText("Brak podglądu ćwiczenia")).toBeTruthy();
    expect(queryByTestId("exercise-preview-gif")).toBeNull();

    unmount();
  });
});

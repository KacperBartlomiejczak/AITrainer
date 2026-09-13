import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ExerciseGridCard } from "../ExerciseGridCard";
import { ExerciseMuscleGroupSection } from "../ExerciseMuscleGroupSection";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

const MOCK_EXERCISE: CatalogExercise = {
  id: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  bodyPart: "chest",
  category: "chest",
  target: "Klatka piersiowa",
  equipment: "Sztanga",
  instructionsPl:
    "Połóż się płasko na ławce i wyciśnij sztangę w górę.",
  imageFile: "images/0025-EIeI8Vf.jpg",
  gifFile: "videos/0025-EIeI8Vf.gif",
  muscleGroup: "pectorals",
  secondaryMuscles: ["shoulders", "triceps"],
};

const MOCK_EXERCISE_2: CatalogExercise = {
  id: "0047",
  name: "Wyciskanie sztangi na ławce skośnej",
  bodyPart: "chest",
  category: "chest",
  target: "Górna część klatki",
  equipment: "Sztanga",
  instructionsPl: "Ustaw ławkę pod kątem 30-45 stopni i wyciśnij.",
  imageFile: "images/0047-3TZduzM.jpg",
  gifFile: "videos/0047-3TZduzM.gif",
  muscleGroup: "pectorals",
  secondaryMuscles: ["shoulders", "triceps"],
};

describe("ExerciseGridCard", () => {
  it("renders exercise name, target and equipment", async () => {
    const onPreviewMock = jest.fn();
    const { getByText, unmount } = await render(
      <ExerciseGridCard exercise={MOCK_EXERCISE} onPressPreview={onPreviewMock} />
    );

    expect(getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();
    expect(getByText("Klatka piersiowa")).toBeTruthy();
    expect(getByText("Sztanga")).toBeTruthy();

    unmount();
  });

  it("calls onPressPreview when card is pressed", async () => {
    const onPreviewMock = jest.fn();
    const { getByTestId, unmount } = await render(
      <ExerciseGridCard exercise={MOCK_EXERCISE} onPressPreview={onPreviewMock} />
    );

    const card = getByTestId("exercise-grid-card-0025");
    await act(async () => {
      fireEvent.press(card);
    });

    expect(onPreviewMock).toHaveBeenCalledWith(MOCK_EXERCISE);
    unmount();
  });
});

describe("ExerciseMuscleGroupSection", () => {
  it("renders muscle group title and exercises", async () => {
    const onPreviewMock = jest.fn();
    const { getAllByText, getByText, unmount } = await render(
      <ExerciseMuscleGroupSection
        title="Klatka piersiowa"
        emoji="💪"
        exercises={[MOCK_EXERCISE, MOCK_EXERCISE_2]}
        onPressPreview={onPreviewMock}
      />
    );

    expect(getAllByText("Klatka piersiowa").length).toBeGreaterThan(0);
    expect(getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();
    expect(getByText("Wyciskanie sztangi na ławce skośnej")).toBeTruthy();

    unmount();
  });

  it("renders empty state when no exercises provided", async () => {
    const onPreviewMock = jest.fn();
    const { getByTestId, unmount } = await render(
      <ExerciseMuscleGroupSection
        title="Klatka piersiowa"
        emoji="💪"
        exercises={[]}
        onPressPreview={onPreviewMock}
      />
    );

    expect(getByTestId("muscle-group-section-empty-klatka-piersiowa")).toBeTruthy();
    unmount();
  });
});

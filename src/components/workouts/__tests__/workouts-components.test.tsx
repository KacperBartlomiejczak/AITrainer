import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ExercisesHeroBanner } from "../ExercisesHeroBanner";
import { RoutineCard } from "../RoutineCard";
import { RoutineListSection } from "../RoutineListSection";
import type { RoutineItem } from "@/schemas/routine.schema";

const MOCK_ROUTINE: RoutineItem = {
  id: "rtn_test_1",
  title: "FBW dla Początkujących",
  description: "Plan na całe ciało",
  durationMinutes: 45,
  daysPerWeek: 3,
  level: "beginner",
  targetMuscleGroups: ["Klatka", "Plecy"],
  exerciseCount: 5,
  isPopular: true,
};

describe("Workouts Components", () => {
  it("renders ExercisesHeroBanner and triggers onPressShowAll", async () => {
    const onPressMock = jest.fn();
    const { getByTestId, getByText, unmount } = await render(
      <ExercisesHeroBanner onPressShowAll={onPressMock} />
    );

    expect(getByText("Baza Ćwiczeń & Atlas")).toBeTruthy();
    expect(getByTestId("show-all-exercises-button")).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId("show-all-exercises-button"));
    });
    expect(onPressMock).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("renders RoutineCard with details and triggers onStart", async () => {
    const onStartMock = jest.fn();
    const { getByTestId, getByText, unmount } = await render(
      <RoutineCard routine={MOCK_ROUTINE} onStart={onStartMock} />
    );

    expect(getByText("FBW dla Początkujących")).toBeTruthy();
    expect(getByText("45 min")).toBeTruthy();
    expect(getByText("3 dni / tydz.")).toBeTruthy();
    expect(getByText("Klatka")).toBeTruthy();

    const startBtn = getByTestId("start-routine-rtn_test_1");
    await act(async () => {
      fireEvent.press(startBtn);
    });
    expect(onStartMock).toHaveBeenCalledWith("rtn_test_1");

    unmount();
  });

  it("renders RoutineListSection with multiple cards", async () => {
    const onStartMock = jest.fn();
    const routines: RoutineItem[] = [
      MOCK_ROUTINE,
      {
        ...MOCK_ROUTINE,
        id: "rtn_test_2",
        title: "Push Trening",
      },
    ];

    const { getByText, getByTestId, unmount } = await render(
      <RoutineListSection routines={routines} onStartRoutine={onStartMock} />
    );

    expect(getByText("Gotowe Rutyny Treningowe")).toBeTruthy();
    expect(getByText("Push Trening")).toBeTruthy();
    expect(getByTestId("start-routine-rtn_test_2")).toBeTruthy();

    unmount();
  });
});

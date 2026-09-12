import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import {
  WorkoutDetailHeader,
  WorkoutExerciseItem,
  WorkoutExercisesList,
  WorkoutStartButton,
} from "../index";
import type { WorkoutDetail } from "@/schemas/workout-session.schema";

const MOCK_ROUTINE: WorkoutDetail = {
  id: "rtn_test_01",
  title: "Trening Testowy FBW",
  description: "Opis testowego treningu",
  durationMinutes: 45,
  level: "beginner",
  targetMuscleGroups: ["Klatka", "Plecy"],
  exercises: [
    {
      id: "ex_1",
      name: "Wyciskanie sztangi",
      targetMuscle: "Klatka",
      sets: 3,
      targetReps: "10",
      restSeconds: 60,
      completed: false,
    },
  ],
};

describe("Workout components", () => {
  it("renders WorkoutDetailHeader with title and calls onBack", async () => {
    const onBack = jest.fn();
    const { getByText, getByTestId, unmount } = await render(
      <WorkoutDetailHeader routine={MOCK_ROUTINE} onBack={onBack} />
    );

    expect(getByText("Trening Testowy FBW")).toBeTruthy();
    expect(getByText("45 min")).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId("workout-back-button"));
    });
    expect(onBack).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("renders WorkoutExerciseItem and toggles when active", async () => {
    const onToggle = jest.fn();
    const { getByText, getByTestId, unmount } = await render(
      <WorkoutExerciseItem
        exercise={MOCK_ROUTINE.exercises[0]}
        index={0}
        isCompleted={false}
        isActiveSession={true}
        onToggle={onToggle}
      />
    );

    expect(getByText("Wyciskanie sztangi")).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByTestId("workout-exercise-item-ex_1"));
    });
    expect(onToggle).toHaveBeenCalledWith("ex_1");
    unmount();
  });

  it("renders WorkoutExercisesList and displays exercise count", async () => {
    const onToggle = jest.fn();
    const { getByText, unmount } = await render(
      <WorkoutExercisesList
        exercises={MOCK_ROUTINE.exercises}
        completedExerciseIds={["ex_1"]}
        isActiveSession={true}
        onToggleExercise={onToggle}
      />
    );

    expect(getByText("Ukończono: 1/1")).toBeTruthy();
    unmount();
  });

  it("handles WorkoutStartButton start and finish", async () => {
    const onStart = jest.fn();
    const onFinish = jest.fn();

    const { getByTestId, unmount } = await render(
      <WorkoutStartButton
        isActive={false}
        onStart={onStart}
        onFinish={onFinish}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId("start-workout-session-button"));
    });
    expect(onStart).toHaveBeenCalledTimes(1);
    unmount();

    const { getByTestId: getActiveTestId, unmount: unmountActive } =
      await render(
        <WorkoutStartButton
          isActive={true}
          onStart={onStart}
          onFinish={onFinish}
        />
      );

    await act(async () => {
      fireEvent.press(getActiveTestId("finish-workout-button"));
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
    unmountActive();
  });
});

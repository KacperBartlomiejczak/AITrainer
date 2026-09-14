import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ExercisesHeroBanner } from "../ExercisesHeroBanner";
import { RoutineCard } from "../RoutineCard";
import { RoutineListSection } from "../RoutineListSection";
import { WorkoutQuickActions } from "../WorkoutQuickActions";
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
  isUserCreated: false,
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

  it("ignores long-press on a built-in routine (no delete affordance)", async () => {
    const onDelete = jest.fn();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const { getByTestId, unmount } = await render(
      <RoutineCard routine={MOCK_ROUTINE} onStart={jest.fn()} onDelete={onDelete} />,
    );

    await act(async () => fireEvent(getByTestId("routine-card-rtn_test_1"), "longPress"));

    expect(alertSpy).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    alertSpy.mockRestore();
    unmount();
  });

  it("asks for confirmation and deletes a user-created routine on long-press", async () => {
    const onDelete = jest.fn();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      const destructive = buttons?.find((button) => button.style === "destructive");
      destructive?.onPress?.();
    });
    const userRoutine = { ...MOCK_ROUTINE, isUserCreated: true };
    const { getByTestId, unmount } = await render(
      <RoutineCard routine={userRoutine} onStart={jest.fn()} onDelete={onDelete} />,
    );

    await act(async () => fireEvent(getByTestId("routine-card-rtn_test_1"), "longPress"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Usuń rutynę",
      expect.stringContaining(MOCK_ROUTINE.title),
      expect.any(Array),
    );
    expect(onDelete).toHaveBeenCalledWith("rtn_test_1");
    alertSpy.mockRestore();
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
      <RoutineListSection routines={routines} onStartRoutine={onStartMock} onDeleteRoutine={jest.fn()} />
    );

    expect(getByText("Gotowe Rutyny Treningowe")).toBeTruthy();
    expect(getByText("Push Trening")).toBeTruthy();
    expect(getByTestId("start-routine-rtn_test_2")).toBeTruthy();

    unmount();
  });
});

describe("WorkoutQuickActions", () => {
  it("starts an empty workout and opens the create-routine screen", async () => {
    const onStartEmptyWorkout = jest.fn();
    const onCreateRoutine = jest.fn();
    const { getByTestId, getByText, unmount } = await render(
      <WorkoutQuickActions
        hasActiveWorkout={false}
        onStartEmptyWorkout={onStartEmptyWorkout}
        onCreateRoutine={onCreateRoutine}
      />,
    );

    expect(getByText("Rozpocznij pusty trening")).toBeTruthy();
    expect(getByText("Stwórz nową rutynę")).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByTestId("start-empty-workout-button"));
      fireEvent.press(getByTestId("create-routine-button"));
    });
    expect(onStartEmptyWorkout).toHaveBeenCalledTimes(1);
    expect(onCreateRoutine).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("offers to resume a running empty workout", async () => {
    const { getByText, unmount } = await render(
      <WorkoutQuickActions hasActiveWorkout onStartEmptyWorkout={jest.fn()} onCreateRoutine={jest.fn()} />,
    );
    expect(getByText("Wróć do treningu")).toBeTruthy();
    unmount();
  });
});

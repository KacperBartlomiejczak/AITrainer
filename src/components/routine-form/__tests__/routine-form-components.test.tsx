import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { RoutineDraftExercise } from "@/schemas/routine-form.schema";
import { RoutineBasicInfoForm } from "../RoutineBasicInfoForm";
import { RoutineExerciseList } from "../RoutineExerciseList";
import { RoutineExerciseRow } from "../RoutineExerciseRow";

const draftExercise: RoutineDraftExercise = {
  id: "row_1",
  catalogExerciseId: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  targetMuscle: "Klatka piersiowa",
  sets: 3,
  targetReps: "8-12",
  restSeconds: 90,
};

describe("RoutineBasicInfoForm", () => {
  const renderForm = async (overrides: Partial<React.ComponentProps<typeof RoutineBasicInfoForm>> = {}) => {
    const props: React.ComponentProps<typeof RoutineBasicInfoForm> = {
      title: "",
      onChangeTitle: jest.fn(),
      description: "",
      onChangeDescription: jest.fn(),
      level: "beginner",
      onChangeLevel: jest.fn(),
      daysPerWeek: 3,
      onChangeDaysPerWeek: jest.fn(),
      durationMinutes: 45,
      onChangeDurationMinutes: jest.fn(),
      ...overrides,
    };
    await render(<RoutineBasicInfoForm {...props} />);
    return props;
  };

  it("reports title, description and level changes", async () => {
    const props = await renderForm();

    await act(async () => fireEvent.changeText(screen.getByTestId("routine-title-input"), "Push day"));
    await act(async () => fireEvent.changeText(screen.getByTestId("routine-description-input"), "Klatka i triceps"));
    await act(async () => fireEvent.press(screen.getByTestId("routine-level-advanced")));

    expect(props.onChangeTitle).toHaveBeenCalledWith("Push day");
    expect(props.onChangeDescription).toHaveBeenCalledWith("Klatka i triceps");
    expect(props.onChangeLevel).toHaveBeenCalledWith("advanced");
  });

  it("parses days-per-week and duration as numbers, ignoring garbage input", async () => {
    const props = await renderForm();

    await act(async () => fireEvent.changeText(screen.getByTestId("routine-days-input"), "5"));
    await act(async () => fireEvent.changeText(screen.getByTestId("routine-duration-input"), "60"));
    expect(props.onChangeDaysPerWeek).toHaveBeenCalledWith(5);
    expect(props.onChangeDurationMinutes).toHaveBeenCalledWith(60);

    await act(async () => fireEvent.changeText(screen.getByTestId("routine-days-input"), "abc"));
    expect(props.onChangeDaysPerWeek).toHaveBeenCalledTimes(1);
  });
});

describe("RoutineExerciseRow", () => {
  it("shows the exercise and reports sets/reps/rest edits and removal", async () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();
    await render(<RoutineExerciseRow exercise={draftExercise} onChange={onChange} onRemove={onRemove} />);

    expect(screen.getByText(draftExercise.name)).toBeTruthy();
    await act(async () => fireEvent.changeText(screen.getByTestId("routine-exercise-sets-row_1"), "4"));
    expect(onChange).toHaveBeenCalledWith({ sets: 4 });

    await act(async () => fireEvent.changeText(screen.getByTestId("routine-exercise-reps-row_1"), "5"));
    expect(onChange).toHaveBeenCalledWith({ targetReps: "5" });

    await act(async () => fireEvent.changeText(screen.getByTestId("routine-exercise-rest-row_1"), "120"));
    expect(onChange).toHaveBeenCalledWith({ restSeconds: 120 });

    await act(async () => fireEvent.press(screen.getByTestId("routine-exercise-remove-row_1")));
    expect(onRemove).toHaveBeenCalled();
  });
});

describe("RoutineExerciseList", () => {
  it("shows an empty state and opens the picker when there are no exercises yet", async () => {
    const onAddExercise = jest.fn();
    await render(
      <RoutineExerciseList exercises={[]} onChangeExercise={jest.fn()} onRemoveExercise={jest.fn()} onAddExercise={onAddExercise} />,
    );

    expect(screen.getByText("Dodaj przynajmniej jedno ćwiczenie")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("add-exercise-button")));
    expect(onAddExercise).toHaveBeenCalled();
  });

  it("lists exercises and forwards row edits/removal", async () => {
    const onChangeExercise = jest.fn();
    const onRemoveExercise = jest.fn();
    await render(
      <RoutineExerciseList
        exercises={[draftExercise]}
        onChangeExercise={onChangeExercise}
        onRemoveExercise={onRemoveExercise}
        onAddExercise={jest.fn()}
      />,
    );

    expect(screen.getByText(draftExercise.name)).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("routine-exercise-remove-row_1")));
    expect(onRemoveExercise).toHaveBeenCalledWith("row_1");

    await act(async () => fireEvent.changeText(screen.getByTestId("routine-exercise-sets-row_1"), "2"));
    expect(onChangeExercise).toHaveBeenCalledWith("row_1", { sets: 2 });
  });
});

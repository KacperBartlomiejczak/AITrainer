import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { INITIAL_CATALOG_EXERCISES } from "@/hooks/use-exercise-catalog";
import type { ExerciseProgress } from "@/schemas/exercise-progress.schema";
import { PICKER_EQUIPMENT_OPTIONS } from "@/schemas/exercise-picker.schema";
import type { LiveWorkoutExercise } from "@/schemas/live-workout.schema";
import { AddExerciseButton } from "../AddExerciseButton";
import { ExercisePickerModal } from "../ExercisePickerModal";
import { FinishPhotoPicker } from "../FinishPhotoPicker";
import { FinishSummaryHeader } from "../FinishSummaryHeader";
import { FilterChipRow } from "../FilterChipRow";
import { ExerciseProgressSheet } from "../ExerciseProgressSheet";
import { FinishWorkoutSection } from "../FinishWorkoutSection";
import { LiveExerciseCard } from "../LiveExerciseCard";
import { COMPLETED_SET_INPUT_CLASS, COMPLETED_SET_ROW_CLASS, LiveSetRow } from "../LiveSetRow";
import { LiveWorkoutEmptyState } from "../LiveWorkoutEmptyState";
import { LiveWorkoutHeader } from "../LiveWorkoutHeader";
import { LiveWorkoutStatsBar } from "../LiveWorkoutStatsBar";
import { ProgressLineChart } from "../ProgressLineChart";
import { SaveAsRoutineToggle } from "../SaveAsRoutineToggle";
import { SetRecordBadges } from "../SetRecordBadges";
import { SetTagDialog } from "../SetTagDialog";
import { WorkoutMuscleMap } from "../WorkoutMuscleMap";

const exercise: LiveWorkoutExercise = {
  id: "lwe_1",
  catalogExerciseId: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  targetMuscle: "Klatka piersiowa",
  primaryMuscles: ["chest"],
  secondaryMuscles: ["triceps"],
  sets: [
    { id: "s1", weightKg: 40, reps: 10, tag: "warmup", isCompleted: true },
    { id: "s2", weightKg: 80, reps: 5, tag: null, isCompleted: true },
    { id: "s3", weightKg: null, reps: null, tag: null, isCompleted: false },
  ],
};

describe("LiveWorkoutHeader", () => {
  it("goes back, discards and finishes the workout", async () => {
    const props = { onBack: jest.fn(), onDiscard: jest.fn(), onFinish: jest.fn() };
    await render(<LiveWorkoutHeader {...props} />);

    expect(screen.getByText("Pusty trening")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("live-workout-back")));
    await act(async () => fireEvent.press(screen.getByTestId("live-workout-discard")));
    await act(async () => fireEvent.press(screen.getByTestId("live-workout-finish")));
    expect(props.onBack).toHaveBeenCalled();
    expect(props.onDiscard).toHaveBeenCalled();
    expect(props.onFinish).toHaveBeenCalled();
  });
});

describe("LiveWorkoutStatsBar", () => {
  it("shows the timer, completed sets and volume", async () => {
    await render(<LiveWorkoutStatsBar elapsedSeconds={3725} completedSetCount={7} totalVolumeKg={12345.5} />);

    expect(screen.getByTestId("live-workout-timer").props.children).toBe("1:02:05");
    expect(screen.getByTestId("live-workout-set-count").props.children).toBe(7);
    expect(screen.getByTestId("live-workout-volume").props.children).toBe("12 345,5 kg");
  });
});

describe("WorkoutMuscleMap", () => {
  it("renders front and back and lists trained muscles", async () => {
    await render(
      <WorkoutMuscleMap
        trainedMuscles={[
          { muscle: "chest", intensity: "primary" },
          { muscle: "triceps", intensity: "secondary" },
        ]}
      />,
    );
    expect(screen.getByTestId("workout-muscle-map-front")).toBeTruthy();
    expect(screen.getByTestId("workout-muscle-map-back")).toBeTruthy();
    expect(screen.getByText("Klatka piersiowa")).toBeTruthy();
    expect(screen.getByText("Triceps")).toBeTruthy();
  });

  it("shows a hint before any set is completed", async () => {
    await render(<WorkoutMuscleMap trainedMuscles={[]} />);
    expect(screen.getByText("Odhacz serię, aby zobaczyć trenowane partie")).toBeTruthy();
  });
});

describe("LiveSetRow", () => {
  const renderRow = async (overrides: Partial<React.ComponentProps<typeof LiveSetRow>> = {}) => {
    const props: React.ComponentProps<typeof LiveSetRow> = {
      set: exercise.sets[1] ?? exercise.sets[0]!,
      label: "1",
      records: [],
      onUpdate: jest.fn(),
      onToggle: jest.fn(),
      onPressLabel: jest.fn(),
      ...overrides,
    };
    await render(<LiveSetRow {...props} />);
    return props;
  };

  it("opens the tag dialog from the set number and toggles completion", async () => {
    const props = await renderRow();

    await act(async () => fireEvent.press(screen.getByTestId("set-label-s2")));
    await act(async () => fireEvent.press(screen.getByTestId("set-toggle-s2")));
    expect(props.onPressLabel).toHaveBeenCalled();
    expect(props.onToggle).toHaveBeenCalled();
  });

  it("turns the whole row green once the set is ticked", async () => {
    await renderRow();
    expect(screen.getByTestId("set-row-s2").props.className).toContain(COMPLETED_SET_ROW_CLASS);
    expect(screen.getByTestId("set-weight-s2").props.className).toContain(COMPLETED_SET_INPUT_CLASS);

    await render(
      <LiveSetRow
        set={{ id: "s8", weightKg: 60, reps: 8, tag: null, isCompleted: false }}
        label="3"
        records={[]}
        onUpdate={jest.fn()}
        onToggle={jest.fn()}
        onPressLabel={jest.fn()}
      />,
    );
    expect(screen.getByTestId("set-row-s8").props.className).not.toContain(COMPLETED_SET_ROW_CLASS);
  });

  it("sends typed weight and reps to the store", async () => {
    const props = await renderRow();

    await act(async () => fireEvent.changeText(screen.getByTestId("set-weight-s2"), "82,5"));
    await act(async () => fireEvent.changeText(screen.getByTestId("set-reps-s2"), "6"));
    expect(props.onUpdate).toHaveBeenCalledWith({ weightKg: 82.5 });
    expect(props.onUpdate).toHaveBeenCalledWith({ reps: 6 });
  });

  it("shows record badges and disables completing a set without reps", async () => {
    await renderRow({ records: ["one_rep_max", "best_set_volume"] });
    expect(screen.getByText("MAX")).toBeTruthy();
    expect(screen.getByText("SERIA")).toBeTruthy();

    await render(
      <LiveSetRow
        set={{ id: "s9", weightKg: null, reps: null, tag: null, isCompleted: false }}
        label="2"
        records={[]}
        onUpdate={jest.fn()}
        onToggle={jest.fn()}
        onPressLabel={jest.fn()}
      />,
    );
    expect(screen.getByTestId("set-toggle-s9").props.accessibilityState).toMatchObject({ disabled: true });
  });
});

describe("LiveExerciseCard", () => {
  it("labels sets (R, 1, 2), adds sets and removes the exercise", async () => {
    const props = {
      exercise,
      personalRecordHits: new Map([["s2", ["one_rep_max"] as const]]),
      onUpdateSet: jest.fn(),
      onToggleSet: jest.fn(),
      onPressSetLabel: jest.fn(),
      onAddSet: jest.fn(),
      onRemoveExercise: jest.fn(),
      onShowExercise: jest.fn(),
      onShowProgress: jest.fn(),
    };
    await render(<LiveExerciseCard {...props} />);

    expect(screen.getByText(exercise.name)).toBeTruthy();
    expect(screen.getByTestId("set-label-s1")).toHaveTextContent("R");
    expect(screen.getByTestId("set-label-s2")).toHaveTextContent("1");
    expect(screen.getByTestId("set-label-s3")).toHaveTextContent("2");
    expect(screen.getAllByText("MAX")).toHaveLength(1);
    expect(screen.queryByText("SERIA")).toBeNull();

    await act(async () => fireEvent.press(screen.getByTestId("set-label-s1")));
    expect(props.onPressSetLabel).toHaveBeenCalledWith("lwe_1", "s1");
    await act(async () => fireEvent.press(screen.getByTestId("add-set-lwe_1")));
    expect(props.onAddSet).toHaveBeenCalledWith("lwe_1");
    await act(async () => fireEvent.press(screen.getByTestId("remove-exercise-lwe_1")));
    expect(props.onRemoveExercise).toHaveBeenCalledWith("lwe_1");
    await act(async () => fireEvent.press(screen.getByTestId("exercise-info-lwe_1")));
    expect(props.onShowExercise).toHaveBeenCalledWith("0025");
    await act(async () => fireEvent.press(screen.getByTestId("exercise-progress-lwe_1")));
    expect(props.onShowProgress).toHaveBeenCalledWith({ catalogExerciseId: "0025", name: exercise.name });
    expect(screen.getByTestId("exercise-thumbnail-lwe_1")).toBeTruthy();
  });
});

describe("SetTagDialog", () => {
  it("offers regular, warm-up, drop set, failed and removing the set", async () => {
    const props = { visible: true, currentTag: null, onSelect: jest.fn(), onRemoveSet: jest.fn(), onClose: jest.fn() };
    await render(<SetTagDialog {...props} />);

    expect(screen.getByText("Normalna seria")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("set-tag-warmup")));
    await act(async () => fireEvent.press(screen.getByTestId("set-tag-drop_set")));
    await act(async () => fireEvent.press(screen.getByTestId("set-tag-failed")));
    await act(async () => fireEvent.press(screen.getByTestId("set-tag-regular")));
    await act(async () => fireEvent.press(screen.getByTestId("set-tag-remove")));

    expect(props.onSelect.mock.calls).toEqual([["warmup"], ["drop_set"], ["failed"], [null]]);
    expect(props.onRemoveSet).toHaveBeenCalled();
  });
});

describe("ExercisePickerModal", () => {
  const first = INITIAL_CATALOG_EXERCISES[0]!;

  const renderPicker = async (overrides: Partial<React.ComponentProps<typeof ExercisePickerModal>> = {}) => {
    const props: React.ComponentProps<typeof ExercisePickerModal> = {
      visible: true,
      query: "",
      exercises: INITIAL_CATALOG_EXERCISES.slice(0, 3),
      muscleFilter: "all",
      equipmentFilter: "all",
      hasActiveFilters: false,
      activeFilterCount: 0,
      isFilterSheetOpen: false,
      previewExercise: null,
      onChangeQuery: jest.fn(),
      onSelectMuscle: jest.fn(),
      onSelectEquipment: jest.fn(),
      onResetFilters: jest.fn(),
      onOpenFilterSheet: jest.fn(),
      onCloseFilterSheet: jest.fn(),
      onPreview: jest.fn(),
      onClosePreview: jest.fn(),
      onAdd: jest.fn(),
      onClose: jest.fn(),
      ...overrides,
    };
    await render(<ExercisePickerModal {...props} />);
    return props;
  };

  it("searches, opens the filter sheet from the button and adds an exercise with +", async () => {
    const props = await renderPicker({ activeFilterCount: 2 });

    expect(screen.queryByTestId("picker-muscle-legs")).toBeNull();
    expect(screen.getByTestId("active-filter-badge")).toHaveTextContent("2");
    await act(async () => fireEvent.changeText(screen.getByTestId("exercise-picker-search"), "martwy"));
    await act(async () => fireEvent.press(screen.getByTestId("exercise-picker-filters-button")));
    await act(async () => fireEvent.press(screen.getByTestId(`exercise-picker-add-${first.id}`)));

    expect(props.onChangeQuery).toHaveBeenCalledWith("martwy");
    expect(props.onOpenFilterSheet).toHaveBeenCalled();
    expect(props.onAdd).toHaveBeenCalledWith(first);
  });

  it("chooses muscle group and equipment in the bottom sheet", async () => {
    const props = await renderPicker({ isFilterSheetOpen: true, hasActiveFilters: true });

    expect(screen.getByText("Partia ciała")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("picker-muscle-legs")));
    await act(async () => fireEvent.press(screen.getByTestId("picker-equipment-machine")));
    await act(async () => fireEvent.press(screen.getByTestId("apply-filters-button")));

    expect(props.onSelectMuscle).toHaveBeenCalledWith("legs");
    expect(props.onSelectEquipment).toHaveBeenCalledWith("machine");
    expect(props.onCloseFilterSheet).toHaveBeenCalled();
    expect(screen.getByText("Pokaż ćwiczenia (3)")).toBeTruthy();
  });

  it("opens the preview when the exercise row is pressed", async () => {
    const props = await renderPicker();

    await act(async () => fireEvent.press(screen.getByTestId(`exercise-picker-item-${first.id}`)));
    expect(props.onPreview).toHaveBeenCalledWith(first);
    expect(props.onAdd).not.toHaveBeenCalled();
  });

  it("adds the previewed exercise from the preview", async () => {
    const props = await renderPicker({ previewExercise: first });

    expect(screen.getByText("Dodaj do treningu")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("exercise-preview-action")));
    expect(props.onAdd).toHaveBeenCalledWith(first);
  });

  it("shows an empty result message with a reset button when filters are active", async () => {
    const props = await renderPicker({ query: "zzz", exercises: [], hasActiveFilters: true });

    expect(screen.getByText("Brak ćwiczeń dla wybranych filtrów")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("exercise-picker-reset-filters")));
    expect(props.onResetFilters).toHaveBeenCalled();
  });

  it("wraps the search input in a keyboard-avoiding container", async () => {
    await renderPicker();

    expect(screen.getByTestId("exercise-picker-keyboard-avoiding")).toBeTruthy();
    expect(screen.getByTestId("exercise-picker-search")).toBeTruthy();
  });
});

describe("FilterChipRow", () => {
  it("marks the selected option and reports presses", async () => {
    const onSelect = jest.fn();
    await render(
      <FilterChipRow
        testIDPrefix="picker-equipment"
        accessibilityLabel="Sprzęt"
        options={PICKER_EQUIPMENT_OPTIONS}
        selected="barbell"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByTestId("picker-equipment-barbell").props.accessibilityState).toMatchObject({ selected: true });
    await act(async () => fireEvent.press(screen.getByTestId("picker-equipment-dumbbell")));
    expect(onSelect).toHaveBeenCalledWith("dumbbell");
  });
});

describe("LiveWorkoutEmptyState", () => {
  it("invites the user to add the first exercise", async () => {
    const onAddExercise = jest.fn();
    await render(<LiveWorkoutEmptyState onAddExercise={onAddExercise} />);

    await act(async () => fireEvent.press(screen.getByTestId("empty-add-exercise")));
    expect(onAddExercise).toHaveBeenCalled();
  });
});

describe("FinishPhotoPicker", () => {
  it("picks from the camera or gallery and removes a chosen photo", async () => {
    const props = { photoUri: null, isPicking: false, onPick: jest.fn(), onRemove: jest.fn() };
    const { rerender } = await render(<FinishPhotoPicker {...props} />);

    await act(async () => fireEvent.press(screen.getByTestId("finish-photo-camera")));
    await act(async () => fireEvent.press(screen.getByTestId("finish-photo-library")));
    expect(props.onPick.mock.calls).toEqual([["camera"], ["library"]]);

    await rerender(<FinishPhotoPicker {...props} photoUri="file:///cache/a.jpg" />);
    expect(screen.getByTestId("finish-photo-preview")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("finish-photo-remove")));
    expect(props.onRemove).toHaveBeenCalled();
  });
});

describe("SaveAsRoutineToggle", () => {
  it("toggles saving the workout as a routine", async () => {
    const onToggle = jest.fn();
    await render(<SaveAsRoutineToggle value={false} onToggle={onToggle} />);

    await act(async () => fireEvent(screen.getByTestId("save-as-routine-switch"), "valueChange", true));
    expect(onToggle).toHaveBeenCalled();
  });
});

describe("FinishWorkoutSection", () => {
  const renderSection = async (overrides: Partial<React.ComponentProps<typeof FinishWorkoutSection>> = {}) => {
    const props: React.ComponentProps<typeof FinishWorkoutSection> = {
      visible: true,
      elapsedSeconds: 2700,
      completedSetCount: 5,
      totalVolumeKg: 1200,
      personalRecordCount: 1,
      title: "",
      titlePlaceholder: "Trening – wtorek",
      onChangeTitle: jest.fn(),
      saveAsRoutine: false,
      onToggleSaveAsRoutine: jest.fn(),
      photoUri: null,
      isPickingPhoto: false,
      onPickPhoto: jest.fn(),
      onRemovePhoto: jest.fn(),
      isSaving: false,
      errorMessage: null,
      onSave: jest.fn(),
      onClose: jest.fn(),
      ...overrides,
    };
    await render(<FinishWorkoutSection {...props} />);
    return props;
  };

  it("shows the summary, lets the user name the workout and save it", async () => {
    const props = await renderSection();

    expect(screen.getByText("Podsumowanie treningu")).toBeTruthy();
    expect(screen.getByText("1 nowy rekord 🔥")).toBeTruthy();
    await act(async () => fireEvent.changeText(screen.getByTestId("finish-workout-title"), "Push day"));
    expect(props.onChangeTitle).toHaveBeenCalledWith("Push day");
    await act(async () => fireEvent.press(screen.getByTestId("finish-workout-save")));
    expect(props.onSave).toHaveBeenCalled();
    await act(async () => fireEvent.press(screen.getByTestId("finish-workout-back")));
    expect(props.onClose).toHaveBeenCalled();
  });

  it("disables saving while saving and shows errors", async () => {
    await renderSection({ isSaving: true, errorMessage: "Nie udało się zapisać treningu. Spróbuj ponownie." });

    expect(screen.getByTestId("finish-workout-save").props.accessibilityState).toMatchObject({ disabled: true });
    expect(screen.getByText("Nie udało się zapisać treningu. Spróbuj ponownie.")).toBeTruthy();
  });

  it("wraps the workout title input in a keyboard-avoiding container", async () => {
    await renderSection();

    expect(screen.getByTestId("finish-workout-keyboard-avoiding")).toBeTruthy();
    expect(screen.getByTestId("finish-workout-title")).toBeTruthy();
  });
});

describe("FinishSummaryHeader", () => {
  it.each([
    [0, null],
    [2, "2 nowe rekordy 🔥"],
    [5, "5 nowych rekordów 🔥"],
    [12, "12 nowych rekordów 🔥"],
  ])("describes %d personal records", async (count, expected) => {
    await render(<FinishSummaryHeader personalRecordCount={count} />);
    if (expected) expect(screen.getByText(expected)).toBeTruthy();
    else expect(screen.queryByText(/rekord/)).toBeNull();
  });
});

describe("AddExerciseButton", () => {
  it("opens the exercise picker unless the exercise limit is reached", async () => {
    const onPress = jest.fn();
    await render(<AddExerciseButton disabled={false} onPress={onPress} />);
    await act(async () => fireEvent.press(screen.getByTestId("add-exercise-button")));
    expect(onPress).toHaveBeenCalled();

    await render(<AddExerciseButton disabled onPress={onPress} />);
    expect(screen.getByTestId("add-exercise-button").props.accessibilityState).toMatchObject({ disabled: true });
  });
});

describe("SetRecordBadges", () => {
  it("renders nothing without records and a labelled badge per record type", async () => {
    await render(<SetRecordBadges records={[]} />);
    expect(screen.queryByTestId("set-record-badges")).toBeNull();

    await render(<SetRecordBadges records={["max_reps"]} />);
    expect(screen.getByText("POWT.")).toBeTruthy();
    expect(screen.getByLabelText("Rekord: Najwięcej powtórzeń")).toBeTruthy();
  });
});

describe("ProgressLineChart", () => {
  it("draws a point per workout and labels the latest value", async () => {
    await render(
      <ProgressLineChart
        unit="kg"
        points={[
          { label: "10.09", value: 93.33 },
          { label: "12.09", value: 100 },
        ]}
      />,
    );
    expect(screen.getAllByTestId("progress-chart-point")).toHaveLength(2);
    expect(screen.getByText("100 kg")).toBeTruthy();
    expect(screen.getByText("10.09")).toBeTruthy();
  });

  it("asks for more workouts when there is nothing to draw", async () => {
    await render(<ProgressLineChart unit="kg" points={[{ label: "10.09", value: null }]} />);
    expect(screen.getByText("Brak danych do wykresu")).toBeTruthy();
  });
});

describe("ExerciseProgressSheet", () => {
  const progress: ExerciseProgress = {
    catalogExerciseId: "0025",
    points: [
      { sessionId: "w1", completedAt: new Date(2026, 8, 10), oneRepMaxKg: 93.33, bestSetVolumeKg: 400, maxReps: null },
      { sessionId: "w2", completedAt: new Date(2026, 8, 12), oneRepMaxKg: 93.5, bestSetVolumeKg: 700, maxReps: null },
    ],
    summary: {
      oneRepMaxKg: 93.5,
      heaviestSet: { weightKg: 85, reps: 3 },
      bestSetVolume: { weightKg: 70, reps: 10, volumeKg: 700 },
      maxReps: null,
      workoutCount: 2,
    },
  };

  const renderSheet = async (overrides: Partial<React.ComponentProps<typeof ExerciseProgressSheet>> = {}) => {
    const props: React.ComponentProps<typeof ExerciseProgressSheet> = {
      target: { catalogExerciseId: "0025", name: "Wyciskanie sztangi na ławce poziomej" },
      status: "ready",
      progress,
      availableMetrics: ["one_rep_max", "best_set_volume"],
      metric: "one_rep_max",
      techniqueExercise: null,
      onSelectMetric: jest.fn(),
      onShowTechnique: jest.fn(),
      onCloseTechnique: jest.fn(),
      onClose: jest.fn(),
      ...overrides,
    };
    await render(<ExerciseProgressSheet {...props} />);
    return props;
  };

  it("shows the estimated max, the heaviest set, the best set and the chart", async () => {
    const props = await renderSheet();

    expect(screen.getByText("≈ 93,5 kg")).toBeTruthy();
    expect(screen.getByText("85 kg × 3")).toBeTruthy();
    expect(screen.getByText("700 kg")).toBeTruthy();
    expect(screen.getByText(/2 treningi/)).toBeTruthy();
    expect(screen.getAllByTestId("progress-chart-point")).toHaveLength(2);

    await act(async () => fireEvent.press(screen.getByTestId("progress-metric-best_set_volume")));
    await act(async () => fireEvent.press(screen.getByTestId("progress-show-technique")));
    await act(async () => fireEvent.press(screen.getByTestId("progress-sheet-close")));
    expect(props.onSelectMetric).toHaveBeenCalledWith("best_set_volume");
    expect(props.onShowTechnique).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it("shows most reps for a bodyweight exercise", async () => {
    await renderSheet({
      availableMetrics: ["max_reps"],
      metric: "max_reps",
      progress: {
        ...progress,
        points: [{ sessionId: "w1", completedAt: new Date(2026, 8, 10), oneRepMaxKg: null, bestSetVolumeKg: null, maxReps: 25 }],
        summary: { oneRepMaxKg: null, heaviestSet: null, bestSetVolume: null, maxReps: 25, workoutCount: 1 },
      },
    });
    // Tile "Najwięcej powt." and the latest value on the chart
    expect(screen.getAllByText("25 powt.")).toHaveLength(2);
    expect(screen.queryByText("Twój max")).toBeNull();
  });

  it("shows loading, error and an empty history", async () => {
    await renderSheet({ status: "loading", progress: null });
    expect(screen.getByTestId("progress-sheet-loading")).toBeTruthy();

    await renderSheet({ status: "error", progress: null });
    expect(screen.getByText("Nie udało się wczytać postępów. Spróbuj ponownie.")).toBeTruthy();

    await renderSheet({
      availableMetrics: [],
      progress: { ...progress, points: [], summary: { ...progress.summary, workoutCount: 0 } },
    });
    expect(screen.getByText("Zapisz trening z tym ćwiczeniem, a pokażemy Twoje postępy")).toBeTruthy();
  });
});

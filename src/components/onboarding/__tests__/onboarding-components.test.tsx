import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import {
  MuscleGroupTile,
  OnboardingOptionCard,
  OnboardingStepFooter,
  OnboardingSummaryCard,
  OnboardingSummaryChip,
} from "..";

describe("OnboardingOptionCard", () => {
  it("renders label/description and reports radio selection", async () => {
    const onPress = jest.fn();
    await render(
      <OnboardingOptionCard
        testID="option"
        label="Zaawansowany"
        emoji="🏆"
        description="Ponad rok"
        isSelected
        onPress={onPress}
        selectionType="radio"
      />
    );

    expect(screen.getByText("Ponad rok")).toBeTruthy();
    expect(screen.getByTestId("option").props.accessibilityState).toEqual({ selected: true });

    await act(async () => {
      fireEvent.press(screen.getByText("Zaawansowany"));
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("reports checkbox state for toggles", async () => {
    await render(
      <OnboardingOptionCard
        testID="toggle"
        label="Jeszcze nie wiem"
        emoji="🤔"
        isSelected={false}
        onPress={jest.fn()}
        selectionType="checkbox"
      />
    );
    expect(screen.getByTestId("toggle").props.accessibilityState).toEqual({ checked: false });
  });
});

describe("MuscleGroupTile", () => {
  it("renders the Polish label and passes the group on press", async () => {
    const onPress = jest.fn();
    await render(<MuscleGroupTile group="legs" isSelected={false} onPress={onPress} />);

    await act(async () => {
      fireEvent.press(screen.getByText("Nogi"));
    });
    expect(onPress).toHaveBeenCalledWith("legs");
  });
});

describe("OnboardingStepFooter", () => {
  it("calls back and next handlers", async () => {
    const onBack = jest.fn();
    const onNext = jest.fn();
    await render(<OnboardingStepFooter onBack={onBack} onNext={onNext} nextLabel="Start" />);

    await act(async () => {
      fireEvent.press(screen.getByText("Wstecz"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Start"));
    });
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("does not call next when disabled", async () => {
    const onNext = jest.fn();
    await render(<OnboardingStepFooter onBack={jest.fn()} onNext={onNext} isNextDisabled />);

    await act(async () => {
      fireEvent.press(screen.getByText("Dalej"));
    });
    expect(onNext).not.toHaveBeenCalled();
  });
});

describe("OnboardingSummaryCard", () => {
  it("renders the title and children", async () => {
    await render(
      <OnboardingSummaryCard title="Skupiamy się na">
        <OnboardingSummaryChip emoji="🦵" label="Nogi" />
      </OnboardingSummaryCard>
    );
    expect(screen.getByText("Skupiamy się na")).toBeTruthy();
    expect(screen.getByText("Nogi")).toBeTruthy();
  });
});

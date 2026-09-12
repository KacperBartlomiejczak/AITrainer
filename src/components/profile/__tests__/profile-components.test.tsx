import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { ProfileHeaderCard } from "../ProfileHeaderCard";
import { ProfileNameSection } from "../ProfileNameSection";
import { ProfileGoalSection } from "../ProfileGoalSection";
import { ProfileMuscleGroupsSection } from "../ProfileMuscleGroupsSection";
import { ProfileSettingsSection } from "../ProfileSettingsSection";

describe("ProfileHeaderCard", () => {
  it("renders user name, initials and streak", async () => {
    const { unmount } = await render(
      <ProfileHeaderCard name="Kacper Bartłomiejczak" streakDays={5} level="Średniozaawansowany" />
    );

    expect(screen.getByText("Kacper Bartłomiejczak")).toBeTruthy();
    expect(screen.getByText("KB")).toBeTruthy();
    expect(screen.getByText(/5 dni/)).toBeTruthy();
    expect(screen.getByText("Średniozaawansowany")).toBeTruthy();

    unmount();
  });

  it("handles single-word names and 0 streak days", async () => {
    const { unmount } = await render(
      <ProfileHeaderCard name="Kacper" streakDays={0} />
    );

    expect(screen.getByText("Kacper")).toBeTruthy();
    expect(screen.getByText("K")).toBeTruthy();
    expect(screen.queryByText(/dni/)).toBeNull();

    unmount();
  });
});

describe("ProfileNameSection", () => {
  it("renders text input with current value and handles change", async () => {
    const handleChangeName = jest.fn();
    const { unmount } = await render(
      <ProfileNameSection name="Kacper" onChangeName={handleChangeName} />
    );

    const input = screen.getByDisplayValue("Kacper");
    await act(async () => {
      fireEvent.changeText(input, "Michał");
    });
    expect(handleChangeName).toHaveBeenCalledWith("Michał");

    unmount();
  });

  it("displays validation error when provided", async () => {
    const { unmount } = await render(
      <ProfileNameSection
        name=""
        onChangeName={jest.fn()}
        error="Imię jest wymagane"
      />
    );

    expect(screen.getByText("Imię jest wymagane")).toBeTruthy();

    unmount();
  });
});

describe("ProfileGoalSection", () => {
  it("renders goals and handles goal selection", async () => {
    const handleSelectGoal = jest.fn();
    const { unmount } = await render(
      <ProfileGoalSection
        selectedGoal="muscle_gain"
        onSelectGoal={handleSelectGoal}
      />
    );

    expect(screen.getByText("Masa mięśniowa")).toBeTruthy();
    expect(screen.getByText("Siła")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText("Siła"));
    });
    expect(handleSelectGoal).toHaveBeenCalledWith("strength");

    unmount();
  });

  it("displays error message when provided", async () => {
    const { unmount } = await render(
      <ProfileGoalSection
        selectedGoal={null}
        onSelectGoal={jest.fn()}
        error="Wybierz cel"
      />
    );

    expect(screen.getByText("Wybierz cel")).toBeTruthy();

    unmount();
  });
});

describe("ProfileMuscleGroupsSection", () => {
  it("renders muscle groups and toggles group selection", async () => {
    const handleToggleGroup = jest.fn();
    const { unmount } = await render(
      <ProfileMuscleGroupsSection
        selectedGroups={["chest", "back"]}
        onToggleGroup={handleToggleGroup}
      />
    );

    expect(screen.getByText("Klatka piersiowa")).toBeTruthy();
    expect(screen.getByText("Nogi")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText("Nogi"));
    });
    expect(handleToggleGroup).toHaveBeenCalledWith("legs");

    unmount();
  });

  it("displays error when provided", async () => {
    const { unmount } = await render(
      <ProfileMuscleGroupsSection
        selectedGroups={[]}
        onToggleGroup={jest.fn()}
        error="Wybierz przynajmniej jedną partię ciała"
      />
    );

    expect(screen.getByText("Wybierz przynajmniej jedną partię ciała")).toBeTruthy();

    unmount();
  });
});

describe("ProfileSettingsSection", () => {
  it("renders settings options and triggers actions", async () => {
    const handleExport = jest.fn();
    const handleReset = jest.fn();

    const { unmount } = await render(
      <ProfileSettingsSection
        onExportData={handleExport}
        onResetData={handleReset}
      />
    );

    expect(screen.getByText("Ciemny")).toBeTruthy();
    expect(screen.getByText("Metryczne (kg, cm)")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText("Eksportuj moje dane (JSON)"));
    });
    expect(handleExport).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByText("Zresetuj profil i onboarding"));
    });
    expect(handleReset).toHaveBeenCalled();

    unmount();
  });
});

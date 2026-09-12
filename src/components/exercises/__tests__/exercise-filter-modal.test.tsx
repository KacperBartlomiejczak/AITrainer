import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ExerciseFilterButton } from "../ExerciseFilterButton";
import { ExerciseMuscleFilterSection } from "../ExerciseMuscleFilterSection";
import { ExerciseEquipmentFilterSection } from "../ExerciseEquipmentFilterSection";
import { ExerciseFilterModal } from "../ExerciseFilterModal";

describe("Exercise Filter Components", () => {
  describe("ExerciseFilterButton", () => {
    it("renders without badge when activeCount is 0", async () => {
      const onPressMock = jest.fn();
      const { queryByTestId, getByTestId, unmount } = await render(
        <ExerciseFilterButton onPress={onPressMock} activeCount={0} />
      );

      expect(getByTestId("open-filters-button")).toBeTruthy();
      expect(queryByTestId("active-filter-badge")).toBeNull();

      await act(async () => {
        fireEvent.press(getByTestId("open-filters-button"));
      });
      expect(onPressMock).toHaveBeenCalledTimes(1);

      unmount();
    });

    it("renders badge with count when activeCount > 0", async () => {
      const { getByTestId, getByText, unmount } = await render(
        <ExerciseFilterButton onPress={jest.fn()} activeCount={2} />
      );

      expect(getByTestId("active-filter-badge")).toBeTruthy();
      expect(getByText("2")).toBeTruthy();

      unmount();
    });
  });

  describe("ExerciseMuscleFilterSection", () => {
    it("renders muscle group options and calls onSelectCategory", async () => {
      const onSelectMock = jest.fn();
      const { getByTestId, getByText, unmount } = await render(
        <ExerciseMuscleFilterSection
          selectedCategory="all"
          onSelectCategory={onSelectMock}
        />
      );

      expect(getByText("Partia mięśniowa")).toBeTruthy();
      expect(getByText("Klatka piersiowa")).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId("muscle-filter-chest"));
      });
      expect(onSelectMock).toHaveBeenCalledWith("chest");

      unmount();
    });
  });

  describe("ExerciseEquipmentFilterSection", () => {
    it("renders equipment options including dumbbells, barbells, bodyweight, and kettlebell", async () => {
      const onSelectMock = jest.fn();
      const { getByTestId, getByText, unmount } = await render(
        <ExerciseEquipmentFilterSection
          selectedEquipment="all"
          onSelectEquipment={onSelectMock}
        />
      );

      expect(getByText("Sprzęt treningowy")).toBeTruthy();
      expect(getByText("Hantle")).toBeTruthy();
      expect(getByText("Sztanga")).toBeTruthy();
      expect(getByText("Masa własna")).toBeTruthy();
      expect(getByText("Kettlebell")).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId("equipment-filter-dumbbell"));
      });
      expect(onSelectMock).toHaveBeenCalledWith("dumbbell");

      await act(async () => {
        fireEvent.press(getByTestId("equipment-filter-kettlebell"));
      });
      expect(onSelectMock).toHaveBeenCalledWith("kettlebell");

      unmount();
    });
  });

  describe("ExerciseFilterModal", () => {
    it("renders modal content when visible and handles close", async () => {
      const onCloseMock = jest.fn();
      const onResetMock = jest.fn();
      const { getByText, getByTestId, unmount } = await render(
        <ExerciseFilterModal
          visible={true}
          onClose={onCloseMock}
          selectedCategory="chest"
          onSelectCategory={jest.fn()}
          selectedEquipment="dumbbell"
          onSelectEquipment={jest.fn()}
          onResetFilters={onResetMock}
          totalResultsCount={4}
        />
      );

      expect(getByText("Filtry ćwiczeń")).toBeTruthy();
      expect(getByText("Pokaż ćwiczenia (4)")).toBeTruthy();

      // Reset filters button
      await act(async () => {
        fireEvent.press(getByTestId("reset-filters-button"));
      });
      expect(onResetMock).toHaveBeenCalledTimes(1);

      // Close button
      await act(async () => {
        fireEvent.press(getByTestId("close-filter-modal-button"));
      });
      expect(onCloseMock).toHaveBeenCalledTimes(1);

      // Apply button
      await act(async () => {
        fireEvent.press(getByTestId("apply-filters-button"));
      });
      expect(onCloseMock).toHaveBeenCalledTimes(2);

      // Backdrop press
      await act(async () => {
        fireEvent.press(getByTestId("filter-modal-backdrop"));
      });
      expect(onCloseMock).toHaveBeenCalledTimes(3);

      unmount();
    });
  });
});

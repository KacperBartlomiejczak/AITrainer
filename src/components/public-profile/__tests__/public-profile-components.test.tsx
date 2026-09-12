import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { PublicProfileCard } from "../PublicProfileCard";
import { PublicProfileActions } from "../PublicProfileActions";

describe("Public Profile Components", () => {
  it("renders PublicProfileCard with user name, goal and streak", async () => {
    const { getByText, unmount } = await render(
      <PublicProfileCard
        displayName="Kacper"
        fitnessGoalLabel="Budowa masy mięśniowej"
        streakDays={4}
      />
    );

    expect(getByText("Kacper")).toBeTruthy();
    expect(getByText("Budowa masy mięśniowej")).toBeTruthy();
    expect(getByText("🔥 4 dni serii")).toBeTruthy();

    unmount();
  });

  it("renders PublicProfileActions and triggers onOpenSettings", async () => {
    const onOpenMock = jest.fn();
    const { getByTestId, unmount } = await render(
      <PublicProfileActions onOpenSettings={onOpenMock} />
    );

    const btn = getByTestId("open-settings-button");
    await act(async () => {
      fireEvent.press(btn);
    });

    expect(onOpenMock).toHaveBeenCalledTimes(1);

    unmount();
  });
});

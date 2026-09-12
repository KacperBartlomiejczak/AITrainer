import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import UserProfileScreen from "../user-profile";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("UserProfileScreen", () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      onboardingData: {
        name: "Kacper Bartłomiejczak",
        fitnessGoal: "muscle_gain",
        focusMuscleGroups: ["chest", "back"],
      },
      hasCompletedOnboarding: true,
      isHydrated: true,
    });
  });

  it("renders user profile screen with display name and pill navbar", async () => {
    const router = useRouter();
    const { getByText, getByTestId, unmount } = await render(
      <UserProfileScreen />
    );

    expect(getByText("Twój Profil Publiczny 👤")).toBeTruthy();
    expect(getByText("Kacper Bartłomiejczak")).toBeTruthy();
    expect(getByTestId("pill-navbar")).toBeTruthy();

    const editBtn = getByTestId("open-settings-button");
    await act(async () => {
      fireEvent.press(editBtn);
    });
    expect(router.push).toHaveBeenCalledWith("/profile");

    unmount();
  });
});

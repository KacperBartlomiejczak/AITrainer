import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import UserProfileScreen from "../user-profile";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.setTimeout(60000);

describe("UserProfileScreen", () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      onboardingData: {
        name: "Kacper Bartłomiejczak",
        experienceLevel: "intermediate",
        fitnessGoal: "muscle_gain",
        muscleFocus: { mode: "selected", muscleGroups: ["chest", "back"] },
      },
      hasCompletedOnboarding: true,
      isHydrated: true,
    });
  });

  it("renders full user profile screen with routines photos, badges, intensity chart, routines and recent workouts", async () => {
    const router = useRouter();
    const { getByText, getAllByText, getByTestId, unmount } = await render(
      <UserProfileScreen />
    );

    // Screen title and top bar
    expect(getByText("Twój Profil 👤")).toBeTruthy();
    expect(getByTestId("profile-settings-button")).toBeTruthy();

    // 1. Routine photos at the top (including example past training photo)
    expect(getByTestId("routine-photo-rp_example_01")).toBeTruthy();
    const photoTitles = getAllByText("Ostatni Trening na Siłowni 🔥");
    expect(photoTitles.length).toBeGreaterThanOrEqual(2); // In top carousel and in bottom cards

    // 2. Profile header with streak & diamond league
    expect(getByText("Kacper Bartłomiejczak")).toBeTruthy();
    expect(getByText("🔥 36 dni serii")).toBeTruthy();
    expect(getByText("💎 Diamentowa Liga")).toBeTruthy();
    expect(getByText("100 kg Wyciskanie")).toBeTruthy();

    // 3. Monthly intensity chart
    expect(getByText("Intensywność Treningów")).toBeTruthy();
    expect(getByText("18 lip – 25 lip")).toBeTruthy();

    // 4. User routines (horizontal scrollable)
    expect(getByTestId("routines-horizontal-scroll")).toBeTruthy();
    expect(getByText("Push (Klatka + Barki + Triceps)")).toBeTruthy();

    // 5. Recent completed workouts (synchronized with top photos)
    expect(getAllByText("Push Day — Klatka & Barki").length).toBeGreaterThanOrEqual(2);
    expect(getAllByText("FBW Siła & Stabilizacja").length).toBeGreaterThanOrEqual(2);
    expect(getAllByText("Pull Day — Plecy & Ramiona").length).toBeGreaterThanOrEqual(2);
    expect(getByText("Kondycja & Brzuch (Bez zdjęcia)")).toBeTruthy();

    // Navigation Pill
    expect(getByTestId("pill-navbar")).toBeTruthy();

    // Click photo to open workout modal
    const photoCard = getByTestId("routine-photo-rp_example_01");
    await act(async () => {
      fireEvent.press(photoCard);
    });
    expect(getByTestId("past-workout-modal")).toBeTruthy();
    expect(getAllByText("Wyciskanie sztangi na ławce poziomej").length).toBeGreaterThanOrEqual(1);

    // Close modal
    const closeBtn = getByTestId("close-past-workout-modal");
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    // Settings navigation
    const settingsBtn = getByTestId("profile-settings-button");
    await act(async () => {
      fireEvent.press(settingsBtn);
    });
    expect(router.push).toHaveBeenCalledWith("/profile");

    unmount();
  });
});

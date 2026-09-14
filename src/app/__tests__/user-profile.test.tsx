import React from "react";
import { render, fireEvent, act, screen } from "@testing-library/react-native";
import UserProfileScreen from "../(tabs)/user-profile";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { saveFinishedWorkout } from "@/db/testing/workout-fixtures";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.setTimeout(60000);

describe("UserProfileScreen", () => {
  beforeEach(async () => {
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
    await saveLocalProfile();
  });

  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("renders photos, badges, intensity chart, routines and workouts stored in the database", async () => {
    const router = useRouter();
    const withPhoto = await saveFinishedWorkout({ title: "Trening ze zdjęciem", finishedMinutesAgo: 30, withPhoto: true });
    const withoutPhoto = await saveFinishedWorkout({ title: "Trening bez zdjęcia" });

    const { unmount } = await render(<UserProfileScreen />);

    expect(screen.getByText("Twój Profil 👤")).toBeTruthy();
    expect(screen.getByTestId("profile-settings-button")).toBeTruthy();

    // 1. Only the workout with a photo is in the top carousel (and also in the history below)
    expect(await screen.findByTestId(`routine-photo-${withPhoto.id}`)).toBeTruthy();
    expect(screen.queryByTestId(`routine-photo-${withoutPhoto.id}`)).toBeNull();
    expect(screen.getAllByText("Trening ze zdjęciem").length).toBeGreaterThanOrEqual(2);

    // 2. Profile header with streak & diamond league
    expect(screen.getByText("Kacper Bartłomiejczak")).toBeTruthy();
    expect(screen.getByText("🔥 36 dni serii")).toBeTruthy();
    expect(screen.getByText("💎 Diamentowa Liga")).toBeTruthy();

    // 3. Monthly intensity chart
    expect(screen.getByText("Intensywność Treningów")).toBeTruthy();

    // 4. Basic routines from the database
    expect(screen.getByTestId("routines-horizontal-scroll")).toBeTruthy();
    expect(screen.getByText("FBW A — Całe ciało")).toBeTruthy();
    expect(screen.getByText("FBW B — Całe ciało")).toBeTruthy();

    // 5. Previous workouts, newest first, each can get a photo
    expect(screen.getByText("⏱️ Poprzednie Treningi (2)")).toBeTruthy();
    expect(screen.getByTestId(`manage-photo-${withoutPhoto.id}`)).toBeTruthy();

    // Photo opens the workout details
    await act(async () => {
      fireEvent.press(screen.getByTestId(`routine-photo-${withPhoto.id}`));
    });
    expect(screen.getByTestId("past-workout-modal")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByTestId("close-past-workout-modal"));
    });

    // Settings navigation
    await act(async () => {
      fireEvent.press(screen.getByTestId("profile-settings-button"));
    });
    expect(router.push).toHaveBeenCalledWith("/profile");

    unmount();
  });

  it("opens the camera/gallery sheet for a workout from the history", async () => {
    const workout = await saveFinishedWorkout();
    const { unmount } = await render(<UserProfileScreen />);

    await act(async () => {
      fireEvent.press(await screen.findByTestId(`manage-photo-${workout.id}`));
    });

    expect(screen.getByText("Zdjęcie z treningu")).toBeTruthy();
    expect(screen.getByTestId("photo-source-camera")).toBeTruthy();
    expect(screen.getByTestId("photo-source-library")).toBeTruthy();
    expect(screen.queryByTestId("photo-remove")).toBeNull();

    await act(async () => {
      fireEvent.press(screen.getByText("Anuluj"));
    });
    expect(screen.queryByTestId("photo-source-camera")).toBeNull();
    unmount();
  });

  it("shows empty states for a new user", async () => {
    const { unmount } = await render(<UserProfileScreen />);

    expect(await screen.findByTestId("routine-photos-empty")).toBeTruthy();
    expect(screen.getByTestId("recent-workouts-empty")).toBeTruthy();
    unmount();
  });
});

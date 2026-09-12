import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../index";

// Mock expo-router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("HomeScreen Entrypoint", () => {
  it("renders full home screen with all sections", async () => {
    const { unmount } = await render(<HomeScreen />);

    // Header
    expect(screen.getByText("Cześć, Kacper! 👋")).toBeTruthy();
    expect(screen.getByText("🔥 4 dni")).toBeTruthy();

    // AI Coach
    expect(screen.getByText("🤖 MENTOR AI")).toBeTruthy();
    expect(
      screen.getByText(
        "Świetna seria w tym tygodniu! Dzisiaj skup się na kontroli fazy ekscentrycznej (opuszczania) przy wyciskaniu sztangi. To klucz do budowy stabilności barków."
      )
    ).toBeTruthy();

    // Today Workout
    expect(screen.getByText("DZISIEJSZY TRENING")).toBeTruthy();
    expect(screen.getByText("Klatka + Triceps (FBW A)")).toBeTruthy();
    expect(screen.getByText("Rozpocznij Trening 🔥")).toBeTruthy();

    // Weekly Progress
    expect(screen.getByText("Cel Tygodniowy")).toBeTruthy();
    expect(screen.getByText("3 z 4 treningów ukończone")).toBeTruthy();

    // Quick Actions
    expect(screen.getByText("Szybki Dostęp")).toBeTruthy();
    expect(screen.getByText("Pusty Trening")).toBeTruthy();
    expect(screen.getByText("Baza Ćwiczeń")).toBeTruthy();
    expect(screen.getByText("Plan AI")).toBeTruthy();
    expect(screen.getByText("Historia & Statystyki")).toBeTruthy();

    // Recent Activity
    expect(screen.getByText("Ostatnia Aktywność")).toBeTruthy();
    expect(screen.getByText("Plecy + Biceps (FBW B)")).toBeTruthy();

    unmount();
  });

  it("navigates to /profile when profile avatar is clicked", async () => {
    mockPush.mockClear();
    const { unmount } = await render(<HomeScreen />);

    const profileButton = screen.getByTestId("profile-button");
    fireEvent.press(profileButton);

    expect(mockPush).toHaveBeenCalledWith("/profile");

    unmount();
  });
});

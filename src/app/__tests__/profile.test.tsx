import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import ProfileScreen from "../profile";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Alert } from "react-native";

// Mock router
const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Spy Alert
jest.spyOn(Alert, "alert");

describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOnboardingStore.setState({
      hasCompletedOnboarding: true,
      onboardingData: {
        name: "Kacper",
        fitnessGoal: "muscle_gain",
        focusMuscleGroups: ["chest", "back"],
      },
      isHydrated: true,
    });
  });

  afterEach(() => {
    useOnboardingStore.setState({
      hasCompletedOnboarding: false,
      onboardingData: null,
      isHydrated: true,
    });
  });

  it("renders profile header, input, goals and save button", async () => {
    const { unmount } = await render(<ProfileScreen />);

    expect(screen.getByText("Profil i Ustawienia")).toBeTruthy();
    expect(screen.getByDisplayValue("Kacper")).toBeTruthy();
    expect(screen.getByText("Masa mięśniowa")).toBeTruthy();
    expect(screen.getByText("Klatka piersiowa")).toBeTruthy();
    expect(screen.getByText("Zapisz zmiany")).toBeTruthy();

    unmount();
  });

  it("allows navigating back", async () => {
    const { unmount } = await render(<ProfileScreen />);

    const backButton = screen.getByTestId("back-button");
    await act(async () => {
      fireEvent.press(backButton);
    });
    expect(mockBack).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("saves profile changes when clicking save button", async () => {
    const { unmount } = await render(<ProfileScreen />);

    const nameInput = screen.getByDisplayValue("Kacper");
    await act(async () => {
      fireEvent.changeText(nameInput, "Kacper Pro");
    });

    // Select goal
    await act(async () => {
      fireEvent.press(screen.getByText("Siła"));
    });

    const saveButton = screen.getByText("Zapisz zmiany");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(useOnboardingStore.getState().onboardingData?.name).toBe("Kacper Pro");
    expect(useOnboardingStore.getState().onboardingData?.fitnessGoal).toBe("strength");
    expect(screen.getByText("Zapisano pomyślnie! ✓")).toBeTruthy();

    unmount();
  });

  it("handles export data with Alert", async () => {
    const { unmount } = await render(<ProfileScreen />);

    const exportBtn = screen.getByText("Eksportuj moje dane (JSON)");
    await act(async () => {
      fireEvent.press(exportBtn);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Eksport danych",
      expect.stringContaining("Twoje dane zostały przygotowane"),
      expect.any(Array)
    );

    unmount();
  });

  it("handles reset data confirmation with Alert and redirection", async () => {
    const { unmount } = await render(<ProfileScreen />);

    const resetBtn = screen.getByText("Zresetuj profil i onboarding");
    await act(async () => {
      fireEvent.press(resetBtn);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Resetowanie profilu",
      expect.stringContaining("Czy na pewno chcesz usunąć swoje dane"),
      expect.any(Array)
    );

    unmount();
  });
});

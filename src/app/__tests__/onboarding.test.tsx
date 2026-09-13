import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import StepName from "@/app/(onboarding)/step-name";
import StepExperience from "@/app/(onboarding)/step-experience";
import StepGoal from "@/app/(onboarding)/step-goal";
import StepMuscleGroups from "@/app/(onboarding)/step-muscle-groups";
import StepSummary from "@/app/(onboarding)/step-summary";
import { useOnboardingFormStore } from "@/stores/onboarding-form.store";

// Mock expo-router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  Redirect: () => null,
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock the onboarding store
const mockCompleteOnboarding = jest.fn();
jest.mock("@/stores/onboarding.store", () => ({
  useOnboardingStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      completeOnboarding: mockCompleteOnboarding,
      onboardingData: null,
      hasCompletedOnboarding: false,
    }),
}));

const initialFormState = useOnboardingFormStore.getState();

beforeEach(() => {
  jest.clearAllMocks();
  useOnboardingFormStore.setState(initialFormState, true);
});

describe("StepName", () => {
  it("renders the name input prompt", async () => {
    await render(<StepName />);
    expect(screen.getByText("Jak masz na imię?")).toBeTruthy();
  });

  it("renders a text input for the name", async () => {
    await render(<StepName />);
    expect(screen.getByPlaceholderText("Wpisz swoje imię")).toBeTruthy();
  });

  it("renders the Dalej button", async () => {
    await render(<StepName />);
    expect(screen.getByText("Dalej")).toBeTruthy();
  });
});

describe("StepExperience", () => {
  it("renders the experience prompt and all levels", async () => {
    await render(<StepExperience />);

    expect(screen.getByText("Jak długo trenujesz?")).toBeTruthy();
    expect(screen.getByText("Dopiero zaczynam")).toBeTruthy();
    expect(screen.getByText("Trenuję już trochę")).toBeTruthy();
    expect(screen.getByText("Zaawansowany")).toBeTruthy();
    expect(screen.getByText("Około 5–12 miesięcy")).toBeTruthy();
  });

  it("selects a level and enables moving on", async () => {
    await render(<StepExperience />);

    await act(async () => {
      fireEvent.press(screen.getByText("Trenuję już trochę"));
    });
    expect(useOnboardingFormStore.getState().experienceLevel).toBe("intermediate");
    expect(screen.getByTestId("onboarding-option-intermediate").props.accessibilityState).toEqual({
      selected: true,
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Dalej"));
    });
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/step-goal");
  });

  it("does not move on without a selection", async () => {
    await render(<StepExperience />);
    await act(async () => {
      fireEvent.press(screen.getByText("Dalej"));
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("StepGoal", () => {
  beforeEach(() => {
    useOnboardingFormStore.setState({ name: "Kacper" });
  });

  it("renders the goal selection prompt", async () => {
    await render(<StepGoal />);
    expect(screen.getByText("Co chcesz osiągnąć?")).toBeTruthy();
  });

  it("renders all fitness goal options", async () => {
    await render(<StepGoal />);
    expect(screen.getByText("Schudnąć")).toBeTruthy();
    expect(screen.getByText("Masa mięśniowa")).toBeTruthy();
    expect(screen.getByText("Siła")).toBeTruthy();
    expect(screen.getByText("Ogólna kondycja")).toBeTruthy();
    expect(screen.getByText("Utrzymanie formy")).toBeTruthy();
  });
});

describe("StepMuscleGroups", () => {
  it("renders the muscle group selection prompt", async () => {
    await render(<StepMuscleGroups />);
    expect(screen.getByText("Na czym się skupiamy?")).toBeTruthy();
  });

  it("renders all muscle group options and 'Jeszcze nie wiem'", async () => {
    await render(<StepMuscleGroups />);
    expect(screen.getByText("Klatka piersiowa")).toBeTruthy();
    expect(screen.getByText("Plecy")).toBeTruthy();
    expect(screen.getByText("Nogi")).toBeTruthy();
    expect(screen.getByText("Barki")).toBeTruthy();
    expect(screen.getByText("Ramiona")).toBeTruthy();
    expect(screen.getByText("Brzuch")).toBeTruthy();
    expect(screen.getByText("Jeszcze nie wiem")).toBeTruthy();
  });

  it("'Jeszcze nie wiem' unchecks selected muscle groups and vice versa", async () => {
    await render(<StepMuscleGroups />);

    await act(async () => {
      fireEvent.press(screen.getByText("Klatka piersiowa"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Nogi"));
    });
    expect(screen.getByTestId("muscle-group-chest").props.accessibilityState).toEqual({ checked: true });

    await act(async () => {
      fireEvent.press(screen.getByText("Jeszcze nie wiem"));
    });
    expect(useOnboardingFormStore.getState().muscleFocus).toEqual({ mode: "undecided" });
    expect(screen.getByTestId("muscle-group-chest").props.accessibilityState).toEqual({ checked: false });
    expect(screen.getByTestId("muscle-focus-undecided").props.accessibilityState).toEqual({
      checked: true,
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Plecy"));
    });
    expect(useOnboardingFormStore.getState().muscleFocus).toEqual({
      mode: "selected",
      muscleGroups: ["back"],
    });
    expect(screen.getByTestId("muscle-focus-undecided").props.accessibilityState).toEqual({
      checked: false,
    });
  });

  it("allows moving on with only 'Jeszcze nie wiem'", async () => {
    await render(<StepMuscleGroups />);
    await act(async () => {
      fireEvent.press(screen.getByText("Jeszcze nie wiem"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Dalej"));
    });
    expect(mockPush).toHaveBeenCalledWith("/(onboarding)/step-summary");
  });
});

describe("StepSummary", () => {
  beforeEach(() => {
    useOnboardingFormStore.setState({
      name: "Kacper",
      experienceLevel: "advanced",
      fitnessGoal: "muscle_gain",
      muscleFocus: { mode: "selected", muscleGroups: ["chest", "back"] },
    });
  });

  it("renders the summary with user name", async () => {
    await render(<StepSummary />);
    expect(screen.getByText(/Kacper/)).toBeTruthy();
  });

  it("renders experience, goal and selected muscle groups", async () => {
    await render(<StepSummary />);
    expect(screen.getByText("Zaawansowany")).toBeTruthy();
    expect(screen.getByText("Masa mięśniowa")).toBeTruthy();
    expect(screen.getByText("Klatka piersiowa")).toBeTruthy();
    expect(screen.getByText("Plecy")).toBeTruthy();
  });

  it("renders 'Jeszcze nie wiem' instead of muscle groups when undecided", async () => {
    useOnboardingFormStore.setState({ muscleFocus: { mode: "undecided" } });
    await render(<StepSummary />);
    expect(screen.getByText("Jeszcze nie wiem")).toBeTruthy();
    expect(screen.queryByText("Klatka piersiowa")).toBeNull();
  });

  it("renders the start button and submits the onboarding", async () => {
    await render(<StepSummary />);
    await act(async () => {
      fireEvent.press(screen.getByText("Zaczynamy! 🚀"));
    });
    expect(mockCompleteOnboarding).toHaveBeenCalledWith({
      name: "Kacper",
      experienceLevel: "advanced",
      fitnessGoal: "muscle_gain",
      muscleFocus: { mode: "selected", muscleGroups: ["chest", "back"] },
    });
  });
});

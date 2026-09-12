import React from "react";
import { render, screen } from "@testing-library/react-native";
import StepName from "@/app/(onboarding)/step-name";
import StepGoal from "@/app/(onboarding)/step-goal";
import StepMuscleGroups from "@/app/(onboarding)/step-muscle-groups";
import StepSummary from "@/app/(onboarding)/step-summary";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  Redirect: ({ href }: { href: string }) => null,
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock the onboarding store
jest.mock("@/stores/onboarding.store", () => ({
  useOnboardingStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      completeOnboarding: jest.fn(),
      onboardingData: null,
      hasCompletedOnboarding: false,
    }),
}));

// Mock the form store with controllable state
const mockFormState = {
  name: "",
  fitnessGoal: null as string | null,
  focusMuscleGroups: [] as string[],
  setName: jest.fn(),
  setGoal: jest.fn(),
  toggleMuscleGroup: jest.fn(),
  resetForm: jest.fn(),
};

jest.mock("@/stores/onboarding-form.store", () => ({
  useOnboardingFormStore: (selector: (state: typeof mockFormState) => unknown) =>
    selector(mockFormState),
}));

describe("StepName", () => {
  beforeEach(() => {
    mockFormState.name = "";
    mockFormState.setName = jest.fn();
  });

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

describe("StepGoal", () => {
  beforeEach(() => {
    mockFormState.name = "Kacper";
    mockFormState.fitnessGoal = null;
    mockFormState.setGoal = jest.fn();
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
  beforeEach(() => {
    mockFormState.focusMuscleGroups = [];
    mockFormState.toggleMuscleGroup = jest.fn();
  });

  it("renders the muscle group selection prompt", async () => {
    await render(<StepMuscleGroups />);
    expect(screen.getByText("Na czym się skupiamy?")).toBeTruthy();
  });

  it("renders all muscle group options", async () => {
    await render(<StepMuscleGroups />);
    expect(screen.getByText("Klatka piersiowa")).toBeTruthy();
    expect(screen.getByText("Plecy")).toBeTruthy();
    expect(screen.getByText("Nogi")).toBeTruthy();
    expect(screen.getByText("Barki")).toBeTruthy();
    expect(screen.getByText("Ramiona")).toBeTruthy();
    expect(screen.getByText("Brzuch")).toBeTruthy();
  });
});

describe("StepSummary", () => {
  beforeEach(() => {
    mockFormState.name = "Kacper";
    mockFormState.fitnessGoal = "muscle_gain";
    mockFormState.focusMuscleGroups = ["chest", "back"];
  });

  it("renders the summary with user name", async () => {
    await render(<StepSummary />);
    expect(screen.getByText(/Kacper/)).toBeTruthy();
  });

  it("renders the start button", async () => {
    await render(<StepSummary />);
    expect(screen.getByText("Zaczynamy! 🚀")).toBeTruthy();
  });
});

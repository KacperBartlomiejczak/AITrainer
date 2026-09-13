import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useDatabaseBootstrap } from "../use-database-bootstrap";
import { useOnboardingStore } from "@/stores/onboarding.store";
import type { OnboardingFormData } from "@/schemas/onboarding.schema";

const onboarding: OnboardingFormData = {
  name: "Kacper",
  experienceLevel: "beginner",
  fitnessGoal: "strength",
  muscleFocus: { mode: "undecided" },
};

const mockRepository = {
  load: jest.fn(),
  save: jest.fn(),
  clear: jest.fn(),
};
const mockOpenOnboardingRepository = jest.fn();

jest.mock("@/db/client", () => ({
  openOnboardingRepository: () => mockOpenOnboardingRepository(),
}));

describe("useDatabaseBootstrap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.load.mockResolvedValue(onboarding);
    mockRepository.save.mockResolvedValue(undefined);
    mockRepository.clear.mockResolvedValue(undefined);
    mockOpenOnboardingRepository.mockResolvedValue(mockRepository);
    useOnboardingStore.setState({
      hasCompletedOnboarding: false,
      onboardingData: null,
      isHydrated: false,
    });
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports loading, then ready with the store hydrated from the database", async () => {
    const { result, unmount } = await renderHook(() => useDatabaseBootstrap());

    await waitFor(() => expect(result.current).toBe("ready"));
    expect(useOnboardingStore.getState()).toMatchObject({
      isHydrated: true,
      hasCompletedOnboarding: true,
      onboardingData: onboarding,
    });
    await unmount();
  });

  it("reports error and still hydrates the store when the database fails", async () => {
    mockOpenOnboardingRepository.mockRejectedValue(new Error("no disk"));

    const { result, unmount } = await renderHook(() => useDatabaseBootstrap());

    await waitFor(() => expect(result.current).toBe("error"));
    expect(useOnboardingStore.getState().isHydrated).toBe(true);
    await unmount();
  });

  it("stops persisting store changes after unmount", async () => {
    mockRepository.load.mockResolvedValue(null);
    const { result, unmount } = await renderHook(() => useDatabaseBootstrap());
    await waitFor(() => expect(result.current).toBe("ready"));

    await unmount();
    await act(async () => {
      useOnboardingStore.getState().completeOnboarding(onboarding);
    });

    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});

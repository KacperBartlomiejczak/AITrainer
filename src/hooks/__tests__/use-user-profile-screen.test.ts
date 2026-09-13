import { renderHook, act } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { useUserProfileScreen } from "../use-user-profile-screen";

describe("useUserProfileScreen", () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      onboardingData: {
        name: "Kacper Bartłomiejczak",
        fitnessGoal: "muscle_gain",
        focusMuscleGroups: ["chest", "arms"],
      },
      hasCompletedOnboarding: true,
      isHydrated: true,
    });
  });

  it("returns validated profile stats with streak and diamond league for 100kg bench press", async () => {
    const { result, unmount } = await renderHook(() => useUserProfileScreen());

    expect(result.current.stats.displayName).toBe("Kacper Bartłomiejczak");
    expect(result.current.stats.streakDays).toBe(36);
    expect(result.current.stats.benchPressMaxKg).toBe(100);
    expect(result.current.stats.strengthLeague.id).toBe("diamond");
    expect(result.current.stats.strengthLeague.name).toBe("Diamentowa Liga");
    expect(result.current.stats.strengthLeague.icon).toBe("💎");

    unmount();
  });

  it("provides routine photos including user example past training photo", async () => {
    const { result, unmount } = await renderHook(() => useUserProfileScreen());

    expect(result.current.routinePhotos.length).toBeGreaterThanOrEqual(3);
    const examplePhoto = result.current.routinePhotos.find(
      (p) => p.imageAssetKey === "example_past_photo"
    );
    expect(examplePhoto).toBeDefined();
    expect(examplePhoto?.exercises).toBeDefined();
    expect(examplePhoto?.exercises?.length).toBeGreaterThan(0);

    unmount();
  });

  it("opens and closes workout photo modal with what user did during workout", async () => {
    const { result, unmount } = await renderHook(() => useUserProfileScreen());

    expect(result.current.selectedWorkoutPhoto).toBeNull();

    await act(async () => {
      result.current.openWorkoutPhotoModal("rp_example_01");
    });

    expect(result.current.selectedWorkoutPhoto).toBeDefined();
    expect(result.current.selectedWorkoutPhoto?.id).toBe("rp_example_01");
    expect(result.current.selectedWorkoutPhoto?.exercises?.length).toBeGreaterThan(0);

    await act(async () => {
      result.current.closeWorkoutPhotoModal();
    });

    expect(result.current.selectedWorkoutPhoto).toBeNull();

    unmount();
  });

  it("provides weekly intensity breakdown including the 18 lip – 25 lip 5h week", async () => {
    const { result, unmount } = await renderHook(() => useUserProfileScreen());

    const { monthlyIntensity } = result.current;
    expect(monthlyIntensity.weeks.length).toBe(4);
    const targetWeek = monthlyIntensity.weeks.find((w) =>
      w.weekLabel.includes("18 lip – 25 lip")
    );
    expect(targetWeek).toBeDefined();
    expect(targetWeek?.hours).toBe(5.0);
    expect(monthlyIntensity.totalHours).toBeGreaterThan(0);

    unmount();
  });

  it("provides recent workouts with completed exercises details", async () => {
    const { result, unmount } = await renderHook(() => useUserProfileScreen());

    const { recentWorkouts } = result.current;
    expect(recentWorkouts.length).toBeGreaterThanOrEqual(1);

    const latest = recentWorkouts[0];
    expect(latest.title).toBeTruthy();
    expect(latest.exercises.length).toBeGreaterThan(0);
    const benchExercise = latest.exercises.find((e) =>
      e.name.toLowerCase().includes("wyciskanie")
    );
    expect(benchExercise).toBeDefined();
    expect(benchExercise?.isPersonalRecord).toBe(true);

    unmount();
  });

  it("navigates to settings and routines correctly", async () => {
    const router = useRouter();
    const { result, unmount } = await renderHook(() => useUserProfileScreen());

    await act(async () => {
      result.current.openSettings();
    });
    expect(router.push).toHaveBeenCalledWith("/profile");

    await act(async () => {
      result.current.startRoutine("rtn_push_02");
    });
    expect(router.push).toHaveBeenCalledWith("/workout/rtn_push_02");

    unmount();
  });

  it("synchronizes previous workouts cards with the top routine photos", async () => {
    const { result, unmount } = await renderHook(() => useUserProfileScreen());

    const { routinePhotos, recentWorkouts } = result.current;

    // Check that the first recent workout matches the first top photo
    expect(recentWorkouts[0].id).toBe(routinePhotos[0].id);
    expect(recentWorkouts[0].title).toBe(routinePhotos[0].title);
    expect(recentWorkouts[0].imageAssetKey).toBe(routinePhotos[0].imageAssetKey);
    expect(recentWorkouts[0].completedDate).toBe(routinePhotos[0].completedDate);
    expect(recentWorkouts[0].totalVolumeKg).toBe(routinePhotos[0].totalVolumeKg);

    // Check that all top photos correspond to the same recent workouts in the same order
    routinePhotos.forEach((photo, idx) => {
      const workout = recentWorkouts[idx];
      expect(workout).toBeDefined();
      expect(workout.id).toBe(photo.id);
      expect(workout.title).toBe(photo.title);
      expect(workout.imageAssetKey).toBe(photo.imageAssetKey);
      expect(workout.durationMinutes).toBe(photo.durationMinutes);
    });

    unmount();
  });
});


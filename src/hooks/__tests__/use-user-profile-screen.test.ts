import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { useUserProfileScreen } from "../use-user-profile-screen";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { saveFinishedWorkout } from "@/db/testing/workout-fixtures";
import { getFakeFileSystem } from "@/lib/testing/fake-file-system";
import { pickWorkoutPhoto } from "@/lib/workout-photo-picker";
import { UserProfileScreenDataSchema } from "@/schemas/user-profile-screen.schema";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));
jest.mock("@/lib/workout-photo-picker", () => ({ pickWorkoutPhoto: jest.fn() }));

async function renderLoadedProfile() {
  const rendered = await renderHook(() => useUserProfileScreen());
  await waitFor(() => expect(rendered.result.current.isLoading).toBe(false));
  return rendered;
}

describe("useUserProfileScreen", () => {
  beforeEach(async () => {
    useOnboardingStore.setState({
      onboardingData: {
        name: "Kacper Bartłomiejczak",
        experienceLevel: "intermediate",
        fitnessGoal: "muscle_gain",
        muscleFocus: { mode: "selected", muscleGroups: ["chest", "arms"] },
      },
      hasCompletedOnboarding: true,
      isHydrated: true,
    });
    await saveLocalProfile();
  });

  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("returns validated profile stats with streak and diamond league for 100kg bench press", async () => {
    const { result, unmount } = await renderLoadedProfile();

    expect(result.current.stats.displayName).toBe("Kacper Bartłomiejczak");
    expect(result.current.stats.streakDays).toBe(36);
    expect(result.current.stats.benchPressMaxKg).toBe(100);
    expect(result.current.stats.strengthLeague.id).toBe("diamond");
    expect(result.current.stats.strengthLeague.name).toBe("Diamentowa Liga");
    expect(result.current.stats.strengthLeague.icon).toBe("💎");

    unmount();
  });

  it("shows empty history for a user without workouts", async () => {
    const { result, unmount } = await renderLoadedProfile();

    expect(result.current.recentWorkouts).toEqual([]);
    expect(result.current.routinePhotos).toEqual([]);
    expect(result.current.stats.totalWorkoutsCompleted).toBe(0);
    unmount();
  });

  it("lists the basic routines from the database", async () => {
    const { result, unmount } = await renderLoadedProfile();

    expect(result.current.routines.map((routine) => routine.title)).toEqual([
      "FBW A — Całe ciało",
      "FBW B — Całe ciało",
    ]);
    unmount();
  });

  it("lists completed workouts from the database, newest first", async () => {
    await saveFinishedWorkout({ title: "Starszy", finishedMinutesAgo: 60 * 24 });
    await saveFinishedWorkout({ title: "Najnowszy" });

    const { result, unmount } = await renderLoadedProfile();

    expect(result.current.recentWorkouts.map((workout) => workout.title)).toEqual(["Najnowszy", "Starszy"]);
    expect(result.current.recentWorkouts[0]?.exercises[2]?.setsSummary).toBe("Pominięte");
    expect(result.current.stats.totalWorkoutsCompleted).toBe(2);
    unmount();
  });

  it("shows only workouts with a photo in the top carousel, in the same order as the history", async () => {
    const withPhoto = await saveFinishedWorkout({ title: "Ze zdjęciem", finishedMinutesAgo: 10, withPhoto: true });
    await saveFinishedWorkout({ title: "Bez zdjęcia" });

    const { result, unmount } = await renderLoadedProfile();

    expect(result.current.routinePhotos.map((photo) => photo.id)).toEqual([withPhoto.id]);
    expect(result.current.recentWorkouts[1]?.photoUri).toBe(result.current.routinePhotos[0]?.photoUri);
    expect(
      UserProfileScreenDataSchema.safeParse({
        stats: result.current.stats,
        routinePhotos: result.current.routinePhotos,
        monthlyIntensity: result.current.monthlyIntensity,
        routines: result.current.routines,
        recentWorkouts: result.current.recentWorkouts,
      }).success,
    ).toBe(true);
    unmount();
  });

  it("opens and closes workout photo modal with what user did during workout", async () => {
    const { id } = await saveFinishedWorkout({ withPhoto: true });
    const { result, unmount } = await renderLoadedProfile();

    expect(result.current.selectedWorkoutPhoto).toBeNull();

    await act(async () => {
      result.current.openWorkoutPhotoModal(id);
    });
    expect(result.current.selectedWorkoutPhoto?.id).toBe(id);
    expect(result.current.selectedWorkoutPhoto?.exercises.length).toBeGreaterThan(0);

    await act(async () => {
      result.current.closeWorkoutPhotoModal();
    });
    expect(result.current.selectedWorkoutPhoto).toBeNull();

    unmount();
  });

  it("adds a photo to a workout from the history and refreshes the screen", async () => {
    const { id } = await saveFinishedWorkout();
    const pickedUri = "file:///cache/ImagePicker/later.jpg";
    getFakeFileSystem().addFile(pickedUri);
    jest.mocked(pickWorkoutPhoto).mockResolvedValueOnce({ status: "picked", uri: pickedUri });
    const { result, unmount } = await renderLoadedProfile();

    await act(async () => result.current.managePhoto(id));
    expect(result.current.photoSheet.isOpen).toBe(true);
    expect(result.current.photoSheet.hasPhoto).toBe(false);

    await act(async () => {
      await result.current.photoSheet.selectSource("library");
    });

    await waitFor(() => expect(result.current.routinePhotos.map((photo) => photo.id)).toEqual([id]));
    expect(result.current.photoSheet.isOpen).toBe(false);
    unmount();
  });

  it("provides weekly intensity breakdown including the 18 lip – 25 lip 5h week", async () => {
    const { result, unmount } = await renderLoadedProfile();

    const { monthlyIntensity } = result.current;
    expect(monthlyIntensity.weeks.length).toBe(4);
    const targetWeek = monthlyIntensity.weeks.find((w) => w.weekLabel.includes("18 lip – 25 lip"));
    expect(targetWeek).toBeDefined();
    expect(targetWeek?.hours).toBe(5.0);
    expect(monthlyIntensity.totalHours).toBeGreaterThan(0);

    unmount();
  });

  it("navigates to settings and routines correctly", async () => {
    const router = useRouter();
    const { result, unmount } = await renderLoadedProfile();

    await act(async () => {
      result.current.openSettings();
    });
    expect(router.push).toHaveBeenCalledWith("/profile");

    await act(async () => {
      result.current.startRoutine("rtn_fbw_b");
    });
    expect(router.push).toHaveBeenCalledWith("/workout/rtn_fbw_b");

    unmount();
  });
});

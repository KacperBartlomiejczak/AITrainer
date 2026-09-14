import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { loadRoutines, loadWorkoutHistory } from "@/db/workout-history";
import { getFakeFileSystem } from "@/lib/testing/fake-file-system";
import { pickWorkoutPhoto } from "@/lib/workout-photo-picker";
import type { LiveWorkoutExercise, PersonalRecordHits } from "@/schemas/live-workout.schema";
import { useLiveWorkoutStore } from "@/stores/live-workout.store";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { FINISH_WORKOUT_MESSAGES, useFinishLiveWorkout } from "../use-finish-live-workout";
import { WORKOUT_PHOTO_MESSAGES } from "../use-workout-photo";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));
jest.mock("@/lib/workout-photo-picker", () => ({ pickWorkoutPhoto: jest.fn() }));

const PICKED_URI = "file:///cache/ImagePicker/finish.jpg";

const loggedExercise = (isCompleted: boolean): LiveWorkoutExercise => ({
  id: "lwe_1",
  catalogExerciseId: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  targetMuscle: "Klatka piersiowa",
  primaryMuscles: ["chest"],
  secondaryMuscles: ["triceps"],
  sets: [{ id: "lws_1", weightKg: 80, reps: 5, tag: null, isCompleted }],
});

function startSession(isCompleted = true) {
  useLiveWorkoutStore.setState({
    session: { startedAt: Date.now() - 45 * 60 * 1000, exercises: [loggedExercise(isCompleted)] },
  });
}

async function renderFinish(personalRecordHits: PersonalRecordHits = new Map()) {
  return renderHook(() => useFinishLiveWorkout({ personalRecordHits }));
}

describe("useFinishLiveWorkout", () => {
  beforeEach(async () => {
    jest.mocked(pickWorkoutPhoto).mockReset();
    useLiveWorkoutStore.getState().discardWorkout();
    await saveLocalProfile();
    getFakeFileSystem().addFile(PICKED_URI);
  });

  afterEach(() => {
    resetInMemoryDatabase();
    jest.restoreAllMocks();
  });

  it("does not open the summary without a completed set", async () => {
    startSession(false);
    const { result, unmount } = await renderFinish();

    await act(async () => result.current.openSummary());

    expect(result.current.isSummaryOpen).toBe(false);
    expect(result.current.errorMessage).toBe(FINISH_WORKOUT_MESSAGES.noCompletedSets);
    unmount();
  });

  it("saves the workout with a custom name, record flags and goes to the profile", async () => {
    const router = useRouter();
    startSession();
    const { result, unmount } = await renderFinish(new Map([["lws_1", ["one_rep_max", "best_set_volume"]]]));

    await act(async () => result.current.openSummary());
    expect(result.current.isSummaryOpen).toBe(true);
    await act(async () => result.current.setTitle("Klatka i triceps"));
    await act(async () => {
      await result.current.save();
    });

    const [entry] = await loadWorkoutHistory();
    expect(entry).toMatchObject({ title: "Klatka i triceps", routineId: null, photoUri: null });
    expect(entry?.exercises[0]?.loggedSets[0]).toMatchObject({
      weightKg: 80,
      reps: 5,
      isOneRepMaxRecord: true,
      isBestSetVolumeRecord: true,
      isMaxRepsRecord: false,
    });
    expect(useLiveWorkoutStore.getState().session).toBeNull();
    expect(router.replace).toHaveBeenCalledWith("/user-profile");
    unmount();
  });

  it("saves the workout as a routine at the user's level and attaches the picked photo", async () => {
    useOnboardingStore.setState({
      onboardingData: {
        name: "Kacper",
        experienceLevel: "intermediate",
        fitnessGoal: "strength",
        muscleFocus: { mode: "undecided" },
      },
    });
    jest.mocked(pickWorkoutPhoto).mockResolvedValue({ status: "picked", uri: PICKED_URI });
    startSession();
    const { result, unmount } = await renderFinish();

    await act(async () => result.current.openSummary());
    await act(async () => result.current.toggleSaveAsRoutine());
    await act(async () => {
      await result.current.pickPhoto("library");
    });
    expect(result.current.photoUri).toBe(PICKED_URI);
    await act(async () => {
      await result.current.save();
    });

    const [entry] = await loadWorkoutHistory();
    expect(entry?.photoUri).not.toBeNull();
    const userRoutine = (await loadRoutines()).find((routine) => routine.userId !== null);
    expect(userRoutine).toMatchObject({ level: "intermediate", daysPerWeek: 1 });
    expect(userRoutine?.exercises[0]).toMatchObject({ sets: 1, targetReps: "5", restSeconds: 90 });
    unmount();
  });

  it("shows a permission message when the camera is denied and allows removing the photo", async () => {
    startSession();
    const { result, unmount } = await renderFinish();

    jest.mocked(pickWorkoutPhoto).mockResolvedValueOnce({ status: "permission_denied" });
    await act(async () => {
      await result.current.pickPhoto("camera");
    });
    expect(result.current.errorMessage).toBe(WORKOUT_PHOTO_MESSAGES.cameraPermissionDenied);

    jest.mocked(pickWorkoutPhoto).mockResolvedValueOnce({ status: "picked", uri: PICKED_URI });
    await act(async () => {
      await result.current.pickPhoto("camera");
    });
    expect(result.current).toMatchObject({ photoUri: PICKED_URI, errorMessage: null });

    await act(async () => result.current.removePhoto());
    expect(result.current.photoUri).toBeNull();
    unmount();
  });

  it("warns (but keeps the workout) when the photo could not be saved", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.mocked(pickWorkoutPhoto).mockResolvedValue({ status: "picked", uri: "file:///cache/ImagePicker/gone.jpg" });
    startSession();
    const { result, unmount } = await renderFinish();

    await act(async () => {
      await result.current.pickPhoto("library");
    });
    await act(async () => {
      await result.current.save();
    });

    expect(await loadWorkoutHistory()).toHaveLength(1);
    expect(alertSpy).toHaveBeenCalledWith("Trening zapisany", FINISH_WORKOUT_MESSAGES.photoNotSaved);
    unmount();
  });

  it("keeps the workout in progress and shows a retry message when saving fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    resetInMemoryDatabase(); // no profile → the session violates its foreign key
    startSession();
    const { result, unmount } = await renderFinish();

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.errorMessage).toBe(FINISH_WORKOUT_MESSAGES.saveFailed);
    expect(useLiveWorkoutStore.getState().session).not.toBeNull();
    unmount();
  });
});

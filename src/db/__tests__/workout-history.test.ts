import {
  attachPhotoToWorkout,
  createRoutine,
  deleteRoutine,
  deleteWorkoutHistory,
  exportWorkoutSessions,
  loadExerciseProgress,
  loadPersonalBests,
  loadRoutines,
  loadWorkoutHistory,
  removePhotoFromWorkout,
  saveLiveWorkout,
  saveWorkoutSession,
} from "../workout-history";
import { resetInMemoryDatabase, saveLocalProfile } from "../testing/in-memory-client";
import { FAKE_WORKOUT_PHOTOS_URI, getFakeFileSystem } from "@/lib/testing/fake-file-system";
import type { NewUserRoutine, NewWorkoutSession } from "@/schemas/workout-history.schema";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

const PICKED_URI = "file:///cache/ImagePicker/picked.jpg";

const finishedWorkout: NewWorkoutSession = {
  routineId: "rtn_fbw_a",
  title: "FBW A — Całe ciało",
  startedAt: new Date("2026-09-13T17:00:00.000Z"),
  completedAt: new Date("2026-09-13T17:45:00.000Z"),
  exercises: [{ name: "Przysiad ze sztangą", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true }],
};

const loggedWorkout: NewWorkoutSession = {
  routineId: null,
  title: "Push day",
  startedAt: new Date("2026-09-13T17:00:00.000Z"),
  completedAt: new Date("2026-09-13T17:50:00.000Z"),
  exercises: [
    {
      catalogExerciseId: "0025",
      name: "Wyciskanie sztangi",
      targetMuscle: "Klatka piersiowa",
      sets: 1,
      targetReps: "5",
      completed: true,
      loggedSets: [{ weightKg: 80, reps: 5, tag: null, isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false }],
    },
  ],
};

const routineFromWorkout: NewUserRoutine = {
  id: "rtn_user_push",
  title: "Push day",
  description: "Rutyna zapisana z treningu 13.09.2026",
  level: "beginner",
  daysPerWeek: 1,
  durationMinutes: 50,
  exercises: [
    { id: "rtx_1", name: "Wyciskanie sztangi", targetMuscle: "Klatka piersiowa", sets: 1, targetReps: "5", restSeconds: 90 },
  ],
};

describe("workout history service", () => {
  const fileSystem = getFakeFileSystem();

  beforeEach(async () => {
    await saveLocalProfile();
    fileSystem.addFile(PICKED_URI);
  });

  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("loads the two seeded built-in routines", async () => {
    const routines = await loadRoutines();
    expect(routines.map((routine) => routine.id)).toEqual(["rtn_fbw_a", "rtn_fbw_b"]);
  });

  it("returns an empty history for a new user", async () => {
    await expect(loadWorkoutHistory()).resolves.toEqual([]);
  });

  it("saves a workout without a photo", async () => {
    const saved = await saveWorkoutSession(finishedWorkout);
    const [entry] = await loadWorkoutHistory();

    expect(entry?.id).toBe(saved.id);
    expect(entry?.photoUri).toBeNull();
  });

  it("attaches a photo from the picker and resolves its uri", async () => {
    const { id } = await saveWorkoutSession(finishedWorkout);
    await attachPhotoToWorkout(id, PICKED_URI);

    const [entry] = await loadWorkoutHistory();
    expect(entry?.photoUri).toMatch(new RegExp(`^${FAKE_WORKOUT_PHOTOS_URI}${id}-\\d+\\.jpg$`));
    expect(fileSystem.hasFile(entry?.photoUri ?? "")).toBe(true);
  });

  it("removes a photo together with its file", async () => {
    const { id } = await saveWorkoutSession(finishedWorkout);
    await attachPhotoToWorkout(id, PICKED_URI);
    const [withPhoto] = await loadWorkoutHistory();

    await removePhotoFromWorkout(id);

    const [entry] = await loadWorkoutHistory();
    expect(entry?.photoUri).toBeNull();
    expect(fileSystem.hasFile(withPhoto?.photoUri ?? "")).toBe(false);
  });

  it("shows no photo when the file was removed outside the app", async () => {
    const { id } = await saveWorkoutSession(finishedWorkout);
    await attachPhotoToWorkout(id, PICKED_URI);
    fileSystem.reset();

    const [entry] = await loadWorkoutHistory();
    expect(entry?.photoUri).toBeNull();
  });

  it("saves a logged workout with its routine and photo", async () => {
    const result = await saveLiveWorkout({ session: loggedWorkout, routine: routineFromWorkout, photoUri: PICKED_URI });

    expect(result).toMatchObject({ routineSaved: true, photoSaved: true });
    const [entry] = await loadWorkoutHistory();
    expect(entry?.id).toBe(result.session.id);
    expect(entry?.photoUri).not.toBeNull();
    expect(entry?.exercises[0]?.loggedSets).toHaveLength(1);
    expect((await loadRoutines()).map((routine) => routine.id)).toContain("rtn_user_push");
    await expect(loadExerciseProgress("0025")).resolves.toMatchObject({
      points: [expect.objectContaining({ oneRepMaxKg: 93.33, bestSetVolumeKg: 400 })],
      summary: { heaviestSet: { weightKg: 80, reps: 5 }, workoutCount: 1 },
    });
    await expect(loadPersonalBests(["0025"])).resolves.toEqual([
      { catalogExerciseId: "0025", oneRepMaxKg: 93.33, bestSetVolumeKg: 400, maxReps: null },
    ]);
  });

  it("keeps the saved workout when the photo cannot be stored", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await saveLiveWorkout({
      session: loggedWorkout,
      routine: null,
      photoUri: "file:///cache/ImagePicker/missing.jpg",
    });

    expect(result).toMatchObject({ routineSaved: false, photoSaved: false });
    const [entry] = await loadWorkoutHistory();
    expect(entry?.id).toBe(result.session.id);
    expect(entry?.photoUri).toBeNull();
    expect(console.error).toHaveBeenCalled();
    jest.mocked(console.error).mockRestore();
  });

  it("rejects an invalid workout without saving the routine", async () => {
    await expect(
      saveLiveWorkout({
        session: { ...loggedWorkout, exercises: [] },
        routine: routineFromWorkout,
        photoUri: null,
      }),
    ).rejects.toThrow();
    expect((await loadRoutines()).map((routine) => routine.id)).not.toContain("rtn_user_push");
    await expect(loadWorkoutHistory()).resolves.toEqual([]);
  });

  it("exports sessions without photo file paths", async () => {
    const { id } = await saveWorkoutSession(finishedWorkout);
    await attachPhotoToWorkout(id, PICKED_URI);

    const [exported] = await exportWorkoutSessions();
    expect(exported).toMatchObject({ id, hasPhoto: true, startedAt: "2026-09-13T17:00:00.000Z" });
    expect(JSON.stringify(exported)).not.toContain("file://");
  });

  it("creates a user routine and lets the user delete it, but never a built-in one", async () => {
    const created = await createRoutine(routineFromWorkout);
    expect((await loadRoutines()).map((routine) => routine.id)).toContain(created.id);

    await expect(deleteRoutine(created.id)).resolves.toBe(true);
    expect((await loadRoutines()).map((routine) => routine.id)).not.toContain(created.id);

    const [builtin] = await loadRoutines();
    await expect(deleteRoutine(builtin!.id)).resolves.toBe(false);
  });

  it("deletes the whole history and every photo file", async () => {
    const { id } = await saveWorkoutSession(finishedWorkout);
    await attachPhotoToWorkout(id, PICKED_URI);

    await deleteWorkoutHistory();

    await expect(loadWorkoutHistory()).resolves.toEqual([]);
    expect(fileSystem.listFiles()).toEqual([PICKED_URI]);
  });
});

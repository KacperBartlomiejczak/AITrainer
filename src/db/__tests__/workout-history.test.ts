import {
  attachPhotoToWorkout,
  deleteWorkoutHistory,
  exportWorkoutSessions,
  loadRoutines,
  loadWorkoutHistory,
  removePhotoFromWorkout,
  saveWorkoutSession,
} from "../workout-history";
import { resetInMemoryDatabase, saveLocalProfile } from "../testing/in-memory-client";
import { FAKE_WORKOUT_PHOTOS_URI, getFakeFileSystem } from "@/lib/testing/fake-file-system";
import type { NewWorkoutSession } from "@/schemas/workout-history.schema";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

const PICKED_URI = "file:///cache/ImagePicker/picked.jpg";

const finishedWorkout: NewWorkoutSession = {
  routineId: "rtn_fbw_a",
  title: "FBW A — Całe ciało",
  startedAt: new Date("2026-09-13T17:00:00.000Z"),
  completedAt: new Date("2026-09-13T17:45:00.000Z"),
  exercises: [{ name: "Przysiad ze sztangą", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true }],
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

  it("exports sessions without photo file paths", async () => {
    const { id } = await saveWorkoutSession(finishedWorkout);
    await attachPhotoToWorkout(id, PICKED_URI);

    const [exported] = await exportWorkoutSessions();
    expect(exported).toMatchObject({ id, hasPhoto: true, startedAt: "2026-09-13T17:00:00.000Z" });
    expect(JSON.stringify(exported)).not.toContain("file://");
  });

  it("deletes the whole history and every photo file", async () => {
    const { id } = await saveWorkoutSession(finishedWorkout);
    await attachPhotoToWorkout(id, PICKED_URI);

    await deleteWorkoutHistory();

    await expect(loadWorkoutHistory()).resolves.toEqual([]);
    expect(fileSystem.listFiles()).toEqual([PICKED_URI]);
  });
});

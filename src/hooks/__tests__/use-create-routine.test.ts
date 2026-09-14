import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useCreateRoutine, CREATE_ROUTINE_MESSAGES } from "../use-create-routine";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { loadRoutines } from "@/db/workout-history";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

const benchPress: CatalogExercise = {
  id: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  bodyPart: "chest",
  category: "chest",
  target: "Klatka piersiowa",
  equipment: "barbell",
  instructionsPl: "Opis ćwiczenia",
  imageFile: "img.jpg",
  gifFile: "img.gif",
  muscleGroup: "chest",
  secondaryMuscles: [],
};

describe("useCreateRoutine", () => {
  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("cannot save an empty draft", async () => {
    const { result, unmount } = await renderHook(() => useCreateRoutine());
    expect(result.current.canSave).toBe(false);
    unmount();
  });

  it("adds a picked exercise with sensible defaults and closes the picker", async () => {
    const { result, unmount } = await renderHook(() => useCreateRoutine());
    await act(async () => result.current.picker.open());
    expect(result.current.picker.isOpen).toBe(true);

    await act(async () => result.current.addExercise(benchPress));

    expect(result.current.exercises).toEqual([
      expect.objectContaining({
        catalogExerciseId: "0025",
        name: benchPress.name,
        targetMuscle: "Klatka piersiowa",
        sets: 3,
        targetReps: "8-12",
        restSeconds: 90,
      }),
    ]);
    expect(result.current.picker.isOpen).toBe(false);
    unmount();
  });

  it("updates and removes a draft exercise", async () => {
    const { result, unmount } = await renderHook(() => useCreateRoutine());
    await act(async () => result.current.addExercise(benchPress));
    const rowId = result.current.exercises[0]!.id;

    await act(async () => result.current.updateExercise(rowId, { sets: 5, targetReps: "5", restSeconds: 120 }));
    expect(result.current.exercises[0]).toMatchObject({ sets: 5, targetReps: "5", restSeconds: 120 });

    await act(async () => result.current.removeExercise(rowId));
    expect(result.current.exercises).toEqual([]);
    unmount();
  });

  it("requires a title, description and at least one exercise before saving", async () => {
    const { result, unmount } = await renderHook(() => useCreateRoutine());
    await act(async () => result.current.addExercise(benchPress));
    expect(result.current.canSave).toBe(false); // no title/description yet

    await act(async () => result.current.setTitle("Push day"));
    await act(async () => result.current.setDescription("Klatka i triceps"));
    expect(result.current.canSave).toBe(true);
    unmount();
  });

  it("saves a valid routine to the database and navigates back", async () => {
    await saveLocalProfile();
    const router = useRouter();
    const { result, unmount } = await renderHook(() => useCreateRoutine());

    await act(async () => result.current.addExercise(benchPress));
    await act(async () => result.current.setTitle("Push day"));
    await act(async () => result.current.setDescription("Klatka i triceps"));
    await act(async () => result.current.save());

    await waitFor(() => expect(router.back).toHaveBeenCalled());
    const routines = await loadRoutines();
    expect(routines.map((routine) => routine.title)).toContain("Push day");
    unmount();
  });

  it("shows an error and does not navigate when the draft is invalid", async () => {
    const router = useRouter();
    const { result, unmount } = await renderHook(() => useCreateRoutine());

    // No exercises, no title: save() must refuse instead of writing an invalid routine
    await act(async () => result.current.save());

    expect(result.current.errorMessage).toBeTruthy();
    expect(router.back).not.toHaveBeenCalled();
    unmount();
  });

  it("surfaces a save failure without crashing", async () => {
    // No local profile saved → the FK constraint on routines.user_id rejects the insert
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    const router = useRouter();
    const { result, unmount } = await renderHook(() => useCreateRoutine());
    await act(async () => result.current.addExercise(benchPress));
    await act(async () => result.current.setTitle("Push day"));
    await act(async () => result.current.setDescription("Klatka i triceps"));

    await act(async () => result.current.save());

    await waitFor(() => expect(result.current.errorMessage).toBe(CREATE_ROUTINE_MESSAGES.saveFailed));
    expect(router.back).not.toHaveBeenCalled();
    jest.mocked(console.error).mockRestore();
    unmount();
  });
});

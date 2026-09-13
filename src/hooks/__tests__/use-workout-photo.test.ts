import { act, renderHook } from "@testing-library/react-native";
import { WORKOUT_PHOTO_MESSAGES, useWorkoutPhoto } from "../use-workout-photo";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { attachPhotoToWorkout, loadWorkoutHistory, saveWorkoutSession } from "@/db/workout-history";
import { getFakeFileSystem } from "@/lib/testing/fake-file-system";
import { pickWorkoutPhoto } from "@/lib/workout-photo-picker";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));
jest.mock("@/lib/workout-photo-picker", () => ({ pickWorkoutPhoto: jest.fn() }));

const mockedPick = jest.mocked(pickWorkoutPhoto);
const PICKED_URI = "file:///cache/ImagePicker/picked.jpg";

async function createSession(): Promise<string> {
  const session = await saveWorkoutSession({
    routineId: "rtn_fbw_a",
    title: "FBW A — Całe ciało",
    startedAt: new Date("2026-09-13T17:00:00.000Z"),
    completedAt: new Date("2026-09-13T17:45:00.000Z"),
    exercises: [{ name: "Przysiad", targetMuscle: "Nogi", sets: 3, targetReps: "8", completed: true }],
  });
  return session.id;
}

describe("useWorkoutPhoto", () => {
  let sessionId: string;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockedPick.mockReset();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    await saveLocalProfile();
    sessionId = await createSession();
    getFakeFileSystem().addFile(PICKED_URI);
  });

  afterEach(() => {
    errorSpy.mockRestore();
    resetInMemoryDatabase();
  });

  it("opens and closes the photo sheet for a workout", async () => {
    const { result } = await renderHook(() => useWorkoutPhoto());
    expect(result.current.isPhotoSheetOpen).toBe(false);

    await act(async () => result.current.openPhotoSheet(sessionId));
    expect(result.current.isPhotoSheetOpen).toBe(true);
    expect(result.current.targetSessionId).toBe(sessionId);

    await act(async () => result.current.closePhotoSheet());
    expect(result.current.isPhotoSheetOpen).toBe(false);
  });

  it.each(["camera", "library"] as const)("attaches a photo chosen from %s", async (source) => {
    mockedPick.mockResolvedValueOnce({ status: "picked", uri: PICKED_URI });
    const onPhotoChanged = jest.fn();
    const { result } = await renderHook(() => useWorkoutPhoto({ onPhotoChanged }));

    await act(async () => result.current.openPhotoSheet(sessionId));
    await act(async () => {
      await result.current.selectPhotoSource(source);
    });

    expect(mockedPick).toHaveBeenCalledWith(source);
    expect((await loadWorkoutHistory())[0]?.photoUri).not.toBeNull();
    expect(result.current.isPhotoSheetOpen).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(onPhotoChanged).toHaveBeenCalledTimes(1);
  });

  it("keeps the sheet open without an error when the user cancels the picker", async () => {
    mockedPick.mockResolvedValueOnce({ status: "canceled" });
    const onPhotoChanged = jest.fn();
    const { result } = await renderHook(() => useWorkoutPhoto({ onPhotoChanged }));

    await act(async () => result.current.openPhotoSheet(sessionId));
    await act(async () => {
      await result.current.selectPhotoSource("library");
    });

    expect(result.current.isPhotoSheetOpen).toBe(true);
    expect(result.current.errorMessage).toBeNull();
    expect(onPhotoChanged).not.toHaveBeenCalled();
  });

  it("explains a denied camera permission in Polish", async () => {
    mockedPick.mockResolvedValueOnce({ status: "permission_denied" });
    const { result } = await renderHook(() => useWorkoutPhoto());

    await act(async () => result.current.openPhotoSheet(sessionId));
    await act(async () => {
      await result.current.selectPhotoSource("camera");
    });

    expect(result.current.errorMessage).toBe(WORKOUT_PHOTO_MESSAGES.cameraPermissionDenied);
  });

  it("shows a retry message when picking fails", async () => {
    mockedPick.mockResolvedValueOnce({ status: "failed" });
    const { result } = await renderHook(() => useWorkoutPhoto());

    await act(async () => result.current.openPhotoSheet(sessionId));
    await act(async () => {
      await result.current.selectPhotoSource("camera");
    });

    expect(result.current.errorMessage).toBe(WORKOUT_PHOTO_MESSAGES.pickFailed);
  });

  it("shows a retry message when saving the photo fails", async () => {
    mockedPick.mockResolvedValueOnce({ status: "picked", uri: "file:///cache/missing.jpg" });
    const { result } = await renderHook(() => useWorkoutPhoto());

    await act(async () => result.current.openPhotoSheet(sessionId));
    await act(async () => {
      await result.current.selectPhotoSource("library");
    });

    expect(result.current.errorMessage).toBe(WORKOUT_PHOTO_MESSAGES.saveFailed);
    expect(result.current.isPhotoSheetOpen).toBe(true);
    expect(result.current.isSaving).toBe(false);
  });

  it("removes an existing photo", async () => {
    await attachPhotoToWorkout(sessionId, PICKED_URI);
    const onPhotoChanged = jest.fn();
    const { result } = await renderHook(() => useWorkoutPhoto({ onPhotoChanged }));

    await act(async () => result.current.openPhotoSheet(sessionId));
    await act(async () => {
      await result.current.removePhoto();
    });

    expect((await loadWorkoutHistory())[0]?.photoUri).toBeNull();
    expect(result.current.isPhotoSheetOpen).toBe(false);
    expect(onPhotoChanged).toHaveBeenCalledTimes(1);
  });
});

import { attachWorkoutPhoto, clearWorkoutHistory, removeWorkoutPhoto } from "../workout-photo-service";
import type { WorkoutPhotoStorage } from "../workout-photo-storage";

function createStorage(overrides: Partial<WorkoutPhotoStorage> = {}): jest.Mocked<WorkoutPhotoStorage> {
  return {
    save: jest.fn(async () => "wks_1-2.jpg"),
    resolveUri: jest.fn(() => null),
    remove: jest.fn(),
    removeAll: jest.fn(),
    ...overrides,
  } as jest.Mocked<WorkoutPhotoStorage>;
}

describe("attachWorkoutPhoto", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("stores the file, links it to the session and deletes the replaced photo", async () => {
    const storage = createStorage();
    const repository = { setPhoto: jest.fn(async () => "wks_1-1.jpg") };

    await attachWorkoutPhoto({ repository, storage, sessionId: "wks_1", sourceUri: "file:///cache/a.jpg" });

    expect(storage.save).toHaveBeenCalledWith("file:///cache/a.jpg", "wks_1");
    expect(repository.setPhoto).toHaveBeenCalledWith("wks_1", "wks_1-2.jpg");
    expect(storage.remove).toHaveBeenCalledWith("wks_1-1.jpg");
  });

  it("does not delete anything when the session had no photo", async () => {
    const storage = createStorage();
    const repository = { setPhoto: jest.fn(async () => null) };

    await attachWorkoutPhoto({ repository, storage, sessionId: "wks_1", sourceUri: "file:///cache/a.jpg" });
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("rolls back the copied file when the database update fails", async () => {
    const storage = createStorage();
    const repository = { setPhoto: jest.fn(async () => Promise.reject(new Error("db down"))) };

    await expect(
      attachWorkoutPhoto({ repository, storage, sessionId: "wks_1", sourceUri: "file:///cache/a.jpg" }),
    ).rejects.toThrow("db down");
    expect(storage.remove).toHaveBeenCalledWith("wks_1-2.jpg");
  });

  it("keeps the new photo when cleaning up the old file fails", async () => {
    const storage = createStorage({
      remove: jest.fn(() => {
        throw new Error("fs error");
      }),
    });
    const repository = { setPhoto: jest.fn(async () => "wks_1-1.jpg") };

    await expect(
      attachWorkoutPhoto({ repository, storage, sessionId: "wks_1", sourceUri: "file:///cache/a.jpg" }),
    ).resolves.toBeUndefined();
  });
});

describe("removeWorkoutPhoto", () => {
  it("unlinks the photo and deletes its file", async () => {
    const storage = createStorage();
    const repository = { setPhoto: jest.fn(async () => "wks_1-1.jpg") };

    await removeWorkoutPhoto({ repository, storage, sessionId: "wks_1" });

    expect(repository.setPhoto).toHaveBeenCalledWith("wks_1", null);
    expect(storage.remove).toHaveBeenCalledWith("wks_1-1.jpg");
  });
});

describe("clearWorkoutHistory", () => {
  it("deletes sessions and every photo file", async () => {
    const storage = createStorage();
    const repository = { clearAll: jest.fn(async () => undefined) };

    await clearWorkoutHistory({ repository, storage });

    expect(repository.clearAll).toHaveBeenCalled();
    expect(storage.removeAll).toHaveBeenCalled();
  });

  it("still deletes photo files when the database is unavailable", async () => {
    const storage = createStorage();
    const repository = { clearAll: jest.fn(async () => Promise.reject(new Error("db down"))) };

    await expect(clearWorkoutHistory({ repository, storage })).rejects.toThrow("db down");
    expect(storage.removeAll).toHaveBeenCalled();
  });
});

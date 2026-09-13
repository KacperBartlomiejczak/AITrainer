import { createWorkoutPhotoStorage } from "../workout-photo-storage";
import { FAKE_WORKOUT_PHOTOS_URI, getFakeFileSystem } from "../testing/fake-file-system";

const PICKER_CACHE_URI = "file:///cache/ImagePicker/ABC.jpeg";

describe("createWorkoutPhotoStorage", () => {
  const fileSystem = getFakeFileSystem();
  const storage = createWorkoutPhotoStorage({ now: () => 1726246800000 });

  beforeEach(() => {
    fileSystem.addFile(PICKER_CACHE_URI);
  });

  it("copies the picked photo out of the temporary cache into the app photo directory", async () => {
    const fileName = await storage.save(PICKER_CACHE_URI, "wks_1");

    expect(fileName).toBe("wks_1-1726246800000.jpeg");
    expect(fileSystem.hasFile(`${FAKE_WORKOUT_PHOTOS_URI}${fileName}`)).toBe(true);
  });

  it("falls back to .jpg when the source has no known image extension", async () => {
    fileSystem.addFile("file:///cache/photo");
    await expect(storage.save("file:///cache/photo", "wks_1")).resolves.toBe("wks_1-1726246800000.jpg");
  });

  it("rejects a session id that would produce an unsafe file name", async () => {
    await expect(storage.save(PICKER_CACHE_URI, "../wks")).rejects.toThrow();
    expect(fileSystem.listFiles()).toEqual([PICKER_CACHE_URI]);
  });

  it("rejects when the picked file no longer exists", async () => {
    await expect(storage.save("file:///cache/gone.jpg", "wks_1")).rejects.toThrow();
  });

  it("resolves a stored file name to its uri, or null when the file is missing", async () => {
    const fileName = await storage.save(PICKER_CACHE_URI, "wks_1");

    expect(storage.resolveUri(fileName)).toBe(`${FAKE_WORKOUT_PHOTOS_URI}${fileName}`);
    expect(storage.resolveUri("wks_2-1.jpg")).toBeNull();
    expect(storage.resolveUri("../escape.jpg")).toBeNull();
  });

  it("removes a single photo and ignores a missing one", async () => {
    const fileName = await storage.save(PICKER_CACHE_URI, "wks_1");

    storage.remove(fileName);
    expect(storage.resolveUri(fileName)).toBeNull();
    expect(() => storage.remove(fileName)).not.toThrow();
  });

  it("removes every workout photo (delete my data)", async () => {
    await storage.save(PICKER_CACHE_URI, "wks_1");
    await storage.save(PICKER_CACHE_URI, "wks_2");

    storage.removeAll();
    expect(fileSystem.listFiles()).toEqual([PICKER_CACHE_URI]);
    expect(() => storage.removeAll()).not.toThrow();
  });
});

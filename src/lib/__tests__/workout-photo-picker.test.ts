import * as ImagePicker from "expo-image-picker";
import { pickWorkoutPhoto } from "../workout-photo-picker";

const mockedPicker = jest.mocked(ImagePicker);

type PermissionResponse = Awaited<ReturnType<typeof ImagePicker.requestCameraPermissionsAsync>>;
type PickerResult = Awaited<ReturnType<typeof ImagePicker.launchCameraAsync>>;

function permission(granted: boolean): PermissionResponse {
  return { granted } as PermissionResponse;
}

function pickerResult(value: unknown): PickerResult {
  return value as PickerResult;
}

describe("pickWorkoutPhoto", () => {
  let consoleSpies: jest.SpyInstance[];

  beforeEach(() => {
    // clearAllMocks keeps the default implementations from jest.setup.js (restoreAllMocks would drop them)
    jest.clearAllMocks();
    consoleSpies = [
      jest.spyOn(console, "warn").mockImplementation(() => undefined),
      jest.spyOn(console, "error").mockImplementation(() => undefined),
    ];
  });

  afterEach(() => {
    consoleSpies.forEach((spy) => spy.mockRestore());
  });

  it("takes a photo with the camera after camera permission is granted", async () => {
    mockedPicker.requestCameraPermissionsAsync.mockResolvedValueOnce(permission(true));
    mockedPicker.launchCameraAsync.mockResolvedValueOnce(
      pickerResult({ canceled: false, assets: [{ uri: "file:///cache/camera.jpg" }] }),
    );

    await expect(pickWorkoutPhoto("camera")).resolves.toEqual({
      status: "picked",
      uri: "file:///cache/camera.jpg",
    });
    expect(mockedPicker.launchCameraAsync).toHaveBeenCalledWith(
      expect.objectContaining({ mediaTypes: ["images"] }),
    );
    expect(mockedPicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it("picks a photo from the gallery", async () => {
    mockedPicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce(permission(true));
    mockedPicker.launchImageLibraryAsync.mockResolvedValueOnce(
      pickerResult({ canceled: false, assets: [{ uri: "file:///cache/gallery.jpg" }] }),
    );

    await expect(pickWorkoutPhoto("library")).resolves.toEqual({
      status: "picked",
      uri: "file:///cache/gallery.jpg",
    });
  });

  it("reports canceled when the user closes the picker", async () => {
    mockedPicker.launchImageLibraryAsync.mockResolvedValueOnce(pickerResult({ canceled: true, assets: null }));
    await expect(pickWorkoutPhoto("library")).resolves.toEqual({ status: "canceled" });
  });

  it("does not open the camera when permission is denied", async () => {
    mockedPicker.requestCameraPermissionsAsync.mockResolvedValueOnce(permission(false));

    await expect(pickWorkoutPhoto("camera")).resolves.toEqual({ status: "permission_denied" });
    expect(mockedPicker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it("fails gracefully on a malformed picker payload", async () => {
    mockedPicker.launchCameraAsync.mockResolvedValueOnce(pickerResult({ canceled: false, assets: [] }));
    await expect(pickWorkoutPhoto("camera")).resolves.toEqual({ status: "failed" });
  });

  it("fails gracefully when the picker throws (e.g. no camera on a simulator)", async () => {
    mockedPicker.launchCameraAsync.mockRejectedValueOnce(new Error("Camera not available"));
    await expect(pickWorkoutPhoto("camera")).resolves.toEqual({ status: "failed" });
  });
});

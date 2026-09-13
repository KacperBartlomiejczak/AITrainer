import * as ImagePicker from "expo-image-picker";
import {
  PickedImageResultSchema,
  type PickWorkoutPhotoResult,
  type WorkoutPhotoSource,
} from "@/schemas/workout-history.schema";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [3, 4],
  // Keeps files small on disk; a workout photo does not need full camera resolution
  quality: 0.7,
};

async function requestPermission(source: WorkoutPhotoSource): Promise<boolean> {
  const response =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  return response.granted;
}

/**
 * Lets the user take a photo or pick one from the gallery.
 * Never rejects: every outcome (including a missing camera on a simulator) is a typed result.
 */
export async function pickWorkoutPhoto(source: WorkoutPhotoSource): Promise<PickWorkoutPhotoResult> {
  try {
    if (!(await requestPermission(source))) {
      return { status: "permission_denied" };
    }

    const rawResult: unknown =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

    const result = PickedImageResultSchema.safeParse(rawResult);
    if (!result.success) {
      console.warn("[photos] Unexpected image picker result", { raw: rawResult });
      return { status: "failed" };
    }
    if (result.data.canceled) {
      return { status: "canceled" };
    }

    const uri = result.data.assets?.[0]?.uri;
    if (!uri) {
      console.warn("[photos] Image picker returned no asset", { raw: rawResult });
      return { status: "failed" };
    }
    return { status: "picked", uri };
  } catch (error: unknown) {
    console.error(`[photos] Failed to pick a workout photo from ${source}`, error);
    return { status: "failed" };
  }
}

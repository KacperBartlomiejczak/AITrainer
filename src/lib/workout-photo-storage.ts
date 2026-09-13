import { Directory, File, Paths } from "expo-file-system";
import {
  WorkoutPhotoFileNameSchema,
  type WorkoutPhotoFileName,
  type WorkoutSessionId,
} from "@/schemas/workout-history.schema";

const PHOTO_DIRECTORY_NAME = "workout-photos";
const DEFAULT_EXTENSION = "jpg";
const EXTENSION_PATTERN = /\.(jpe?g|png|webp|heic)$/i;

/**
 * Workout photos live as files in the app's document directory (not in SQLite).
 * The database stores only the file name: the absolute document path changes between app updates on iOS.
 */
export interface WorkoutPhotoStorage {
  /** Copies a picked photo out of the picker's temporary cache and resolves with its new file name. */
  save: (sourceUri: string, sessionId: WorkoutSessionId) => Promise<WorkoutPhotoFileName>;
  /** Current URI of a stored photo, or null when the name is invalid or the file is gone. */
  resolveUri: (fileName: string) => string | null;
  remove: (fileName: string) => void;
  /** Deletes every workout photo (used by "delete my data"). */
  removeAll: () => void;
}

export interface WorkoutPhotoStorageOptions {
  now?: () => number;
}

function getPhotoDirectory(): Directory {
  return new Directory(Paths.document, PHOTO_DIRECTORY_NAME);
}

/** Only validated file names are turned into paths, so nothing can escape the photo directory. */
function getPhotoFile(fileName: string): File | null {
  const parsed = WorkoutPhotoFileNameSchema.safeParse(fileName);
  return parsed.success ? new File(getPhotoDirectory(), parsed.data) : null;
}

export function createWorkoutPhotoStorage({
  now = () => Date.now(),
}: WorkoutPhotoStorageOptions = {}): WorkoutPhotoStorage {
  return {
    async save(sourceUri, sessionId) {
      const extension = EXTENSION_PATTERN.exec(sourceUri)?.[1]?.toLowerCase() ?? DEFAULT_EXTENSION;
      // Timestamp in the name: a replaced photo gets a new URI, so image caches never show the old one
      const fileName = WorkoutPhotoFileNameSchema.safeParse(`${sessionId}-${now()}.${extension}`);
      if (!fileName.success) {
        throw new Error(`[photos] Cannot build a safe photo file name for session "${sessionId}"`);
      }

      const directory = getPhotoDirectory();
      directory.create({ idempotent: true, intermediates: true });
      await new File(sourceUri).copy(new File(directory, fileName.data));
      return fileName.data;
    },

    resolveUri(fileName) {
      const file = getPhotoFile(fileName);
      return file?.exists ? file.uri : null;
    },

    remove(fileName) {
      const file = getPhotoFile(fileName);
      if (file?.exists) file.delete();
    },

    removeAll() {
      const directory = getPhotoDirectory();
      if (directory.exists) directory.delete();
    },
  };
}

export const workoutPhotoStorage = createWorkoutPhotoStorage();

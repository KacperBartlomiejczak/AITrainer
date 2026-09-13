import { getFakeFileSystem } from "@/lib/testing/fake-file-system";
import type { WorkoutSession } from "@/schemas/workout-history.schema";
import { attachPhotoToWorkout, saveWorkoutSession } from "../workout-history";

/** Test-only: saves a finished workout through the real service (needs the in-memory client mock). */
export interface FinishedWorkoutFixture {
  title?: string;
  finishedMinutesAgo?: number;
  withPhoto?: boolean;
}

export async function saveFinishedWorkout({
  title = "FBW A — Całe ciało",
  finishedMinutesAgo = 0,
  withPhoto = false,
}: FinishedWorkoutFixture = {}): Promise<WorkoutSession> {
  const completedAt = new Date(Date.now() - finishedMinutesAgo * 60 * 1000);
  const session = await saveWorkoutSession({
    routineId: "rtn_fbw_a",
    title,
    startedAt: new Date(completedAt.getTime() - 45 * 60 * 1000),
    completedAt,
    exercises: [
      { name: "Przysiad ze sztangą", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true },
      { name: "Wyciskanie sztangi leżąc", targetMuscle: "Klatka piersiowa", sets: 3, targetReps: "8-10", completed: true },
      { name: "Plank (deska)", targetMuscle: "Brzuch", sets: 3, targetReps: "30-45 sek", completed: false },
    ],
  });

  if (withPhoto) {
    const pickedUri = `file:///cache/ImagePicker/${session.id}.jpg`;
    getFakeFileSystem().addFile(pickedUri);
    await attachPhotoToWorkout(session.id, pickedUri);
  }
  return session;
}

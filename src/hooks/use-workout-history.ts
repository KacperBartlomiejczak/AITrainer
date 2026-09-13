import { loadWorkoutHistory } from "@/db/workout-history";
import type { WorkoutHistoryEntry } from "@/schemas/workout-history.schema";
import { useAsyncResource, type AsyncResourceStatus } from "./use-async-resource";

const NO_WORKOUTS: WorkoutHistoryEntry[] = [];

export interface WorkoutHistory {
  status: AsyncResourceStatus;
  /** Completed workouts, newest first */
  entries: WorkoutHistoryEntry[];
  reload: () => Promise<void>;
}

export function useWorkoutHistory(): WorkoutHistory {
  const { status, data, reload } = useAsyncResource(loadWorkoutHistory, NO_WORKOUTS, "workout history");
  return { status, entries: data, reload };
}

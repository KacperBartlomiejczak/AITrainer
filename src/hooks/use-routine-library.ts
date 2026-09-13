import { loadRoutines } from "@/db/workout-history";
import type { Routine } from "@/schemas/workout-history.schema";
import { useAsyncResource, type AsyncResourceStatus } from "./use-async-resource";

const NO_ROUTINES: Routine[] = [];

export interface RoutineLibrary {
  status: AsyncResourceStatus;
  routines: Routine[];
  reload: () => Promise<void>;
}

export function useRoutineLibrary(): RoutineLibrary {
  const { status, data, reload } = useAsyncResource(loadRoutines, NO_ROUTINES, "routines");
  return { status, routines: data, reload };
}

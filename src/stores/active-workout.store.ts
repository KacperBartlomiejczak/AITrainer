import { create } from "zustand";

interface ActiveWorkoutState {
  activeRoutineId: string | null;
  isActive: boolean;
  /** Epoch ms when the workout started (used to store its duration) */
  startedAt: number | null;
  completedExerciseIds: string[];
  startWorkout: (routineId: string, startedAt?: number) => void;
  finishWorkout: () => void;
  toggleExerciseCompleted: (exerciseId: string) => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set) => ({
  activeRoutineId: null,
  isActive: false,
  startedAt: null,
  completedExerciseIds: [],
  startWorkout: (routineId: string, startedAt: number = Date.now()) =>
    set({
      activeRoutineId: routineId,
      isActive: true,
      startedAt,
      completedExerciseIds: [],
    }),
  finishWorkout: () =>
    set({
      activeRoutineId: null,
      isActive: false,
      startedAt: null,
      completedExerciseIds: [],
    }),
  toggleExerciseCompleted: (exerciseId: string) =>
    set((state) => {
      const exists = state.completedExerciseIds.includes(exerciseId);
      return {
        completedExerciseIds: exists
          ? state.completedExerciseIds.filter((id) => id !== exerciseId)
          : [...state.completedExerciseIds, exerciseId],
      };
    }),
}));

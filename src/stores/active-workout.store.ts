import { create } from "zustand";

interface ActiveWorkoutState {
  activeRoutineId: string | null;
  isActive: boolean;
  completedExerciseIds: string[];
  startWorkout: (routineId: string) => void;
  finishWorkout: () => void;
  toggleExerciseCompleted: (exerciseId: string) => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set) => ({
  activeRoutineId: null,
  isActive: false,
  completedExerciseIds: [],
  startWorkout: (routineId: string) =>
    set({
      activeRoutineId: routineId,
      isActive: true,
      completedExerciseIds: [],
    }),
  finishWorkout: () =>
    set({
      activeRoutineId: null,
      isActive: false,
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

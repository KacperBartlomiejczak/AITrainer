import { useActiveWorkoutStore } from "../active-workout.store";

describe("useActiveWorkoutStore", () => {
  afterEach(() => {
    useActiveWorkoutStore.getState().finishWorkout();
  });

  it("records when the workout started, so its duration can be saved", () => {
    useActiveWorkoutStore.getState().startWorkout("rtn_fbw_a", 1726246800000);

    expect(useActiveWorkoutStore.getState()).toMatchObject({
      activeRoutineId: "rtn_fbw_a",
      isActive: true,
      startedAt: 1726246800000,
      completedExerciseIds: [],
    });
  });

  it("uses the current time by default", () => {
    jest.spyOn(Date, "now").mockReturnValue(42);
    useActiveWorkoutStore.getState().startWorkout("rtn_fbw_a");
    expect(useActiveWorkoutStore.getState().startedAt).toBe(42);
    jest.spyOn(Date, "now").mockRestore();
  });

  it("clears the session when the workout finishes", () => {
    useActiveWorkoutStore.getState().startWorkout("rtn_fbw_a", 1);
    useActiveWorkoutStore.getState().toggleExerciseCompleted("ex_1");
    useActiveWorkoutStore.getState().finishWorkout();

    expect(useActiveWorkoutStore.getState()).toMatchObject({
      activeRoutineId: null,
      isActive: false,
      startedAt: null,
      completedExerciseIds: [],
    });
  });
});

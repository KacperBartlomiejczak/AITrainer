import {
  routineExercises,
  routines,
  userFocusMuscleGroups,
  userProfiles,
  workoutSessionExercises,
  workoutSessions,
} from "../schema";
import { RoutineLevelSchema } from "@/schemas/routine.schema";
import type {
  RoutineExerciseRow,
  RoutineRow,
  WorkoutSessionExerciseRow,
  WorkoutSessionRow,
} from "@/schemas/workout-history.schema";
import {
  FitnessGoalSchema,
  MuscleGroupSchema,
} from "@/schemas/onboarding.schema";
import type {
  UserFocusMuscleGroupRow,
  UserProfileRow,
} from "@/schemas/database.schema";

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// Compile-time guards (checked by `tsc --noEmit`): Drizzle rows must match the Zod types exactly
const profileRowParity: Equals<typeof userProfiles.$inferSelect, UserProfileRow> = true;
const focusRowParity: Equals<
  typeof userFocusMuscleGroups.$inferSelect,
  UserFocusMuscleGroupRow
> = true;

const routineRowParity: Equals<typeof routines.$inferSelect, RoutineRow> = true;
const routineExerciseRowParity: Equals<typeof routineExercises.$inferSelect, RoutineExerciseRow> = true;
const sessionRowParity: Equals<typeof workoutSessions.$inferSelect, WorkoutSessionRow> = true;
const sessionExerciseRowParity: Equals<
  typeof workoutSessionExercises.$inferSelect,
  WorkoutSessionExerciseRow
> = true;

describe("drizzle schema ↔ zod parity", () => {
  it("keeps routine and workout history row types identical to Zod row types", () => {
    expect(routineRowParity).toBe(true);
    expect(routineExerciseRowParity).toBe(true);
    expect(sessionRowParity).toBe(true);
    expect(sessionExerciseRowParity).toBe(true);
  });

  it("derives routine level enum values from RoutineLevelSchema", () => {
    expect(routines.level.enumValues).toEqual(RoutineLevelSchema.options);
  });

  it("keeps Drizzle row types identical to Zod row types", () => {
    expect(profileRowParity).toBe(true);
    expect(focusRowParity).toBe(true);
  });

  it("derives fitness_goal enum values from FitnessGoalSchema", () => {
    expect(userProfiles.fitnessGoal.enumValues).toEqual(FitnessGoalSchema.options);
  });

  it("derives muscle_group enum values from MuscleGroupSchema", () => {
    expect(userFocusMuscleGroups.muscleGroup.enumValues).toEqual(
      MuscleGroupSchema.options,
    );
  });
});

import { userFocusMuscleGroups, userProfiles } from "../schema";
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

describe("drizzle schema ↔ zod parity", () => {
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

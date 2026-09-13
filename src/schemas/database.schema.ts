import { z } from "zod";
// Relative import on purpose: drizzle-kit loads this file without tsconfig path aliases
import {
  ExperienceLevelSchema,
  FitnessGoalSchema,
  MuscleFocusModeSchema,
  MuscleGroupSchema,
  OnboardingFormSchema,
} from "./onboarding.schema";

/**
 * Zod is the single source of truth for everything stored in the local database.
 * Drizzle tables (`src/db/schema.ts`) derive their enums from these schemas, and
 * every row read back from SQLite is validated here before it reaches the app.
 */

// ── Identifiers ───────────────────────────────────────────────
/** Id of the on-device user until Clerk auth provides a real user id. */
export const LOCAL_USER_ID = "local";

export const UserIdSchema = z.string().min(1, "User id is required");

// ── Table rows (camelCase — Drizzle maps them to snake_case columns) ──
export const UserProfileRowSchema = z.object({
  id: UserIdSchema,
  name: OnboardingFormSchema.shape.name,
  experienceLevel: ExperienceLevelSchema,
  fitnessGoal: FitnessGoalSchema,
  muscleFocusMode: MuscleFocusModeSchema,
  onboardingCompletedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserFocusMuscleGroupRowSchema = z.object({
  userId: UserIdSchema,
  muscleGroup: MuscleGroupSchema,
});

export const UserFocusMuscleGroupRowListSchema = z.array(
  UserFocusMuscleGroupRowSchema,
);

// ── Bootstrap ─────────────────────────────────────────────────
export const DatabaseBootstrapStatusSchema = z.enum([
  "loading",
  "ready",
  "error",
]);

// ── Exported Types ────────────────────────────────────────────
export type UserId = z.infer<typeof UserIdSchema>;
export type UserProfileRow = z.infer<typeof UserProfileRowSchema>;
export type UserFocusMuscleGroupRow = z.infer<
  typeof UserFocusMuscleGroupRowSchema
>;
export type DatabaseBootstrapStatus = z.infer<
  typeof DatabaseBootstrapStatusSchema
>;

import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
// Relative imports on purpose: drizzle-kit loads this file without tsconfig path aliases
import {
  ExperienceLevelSchema,
  FitnessGoalSchema,
  MuscleFocusModeSchema,
  MuscleGroupSchema,
} from "../schemas/onboarding.schema";

/** Zod enum options as the non-empty tuple Drizzle requires for `text({ enum })`. */
function toEnumValues<T extends string>(values: readonly T[]): [T, ...T[]] {
  const [first, ...rest] = values;
  if (first === undefined) {
    throw new Error("A database enum needs at least one value");
  }
  return [first, ...rest];
}

/**
 * Drizzle table definitions. Column enums come from the Zod schemas so the
 * database can never drift from `src/schemas/database.schema.ts`.
 */

export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  experienceLevel: text("experience_level", {
    enum: toEnumValues(ExperienceLevelSchema.options),
  }).notNull(),
  fitnessGoal: text("fitness_goal", { enum: toEnumValues(FitnessGoalSchema.options) }).notNull(),
  // "selected" = rows in user_focus_muscle_groups, "undecided" = user picked "Jeszcze nie wiem"
  muscleFocusMode: text("muscle_focus_mode", {
    enum: toEnumValues(MuscleFocusModeSchema.options),
  }).notNull(),
  onboardingCompletedAt: integer("onboarding_completed_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const userFocusMuscleGroups = sqliteTable(
  "user_focus_muscle_groups",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    muscleGroup: text("muscle_group", { enum: toEnumValues(MuscleGroupSchema.options) }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.muscleGroup] })],
);

import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
// Relative imports on purpose: drizzle-kit loads this file without tsconfig path aliases
import {
  ExperienceLevelSchema,
  FitnessGoalSchema,
  MuscleFocusModeSchema,
  MuscleGroupSchema,
} from "../schemas/onboarding.schema";
import { RoutineLevelSchema } from "../schemas/routine.schema";
import { SetTagSchema } from "../schemas/workout-history.schema";

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

// ── Routines ──────────────────────────────────────────────────
export const routines = sqliteTable("routines", {
  id: text("id").primaryKey(),
  // null = built-in routine shipped with the app, so "delete my data" keeps it
  userId: text("user_id").references(() => userProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level", { enum: toEnumValues(RoutineLevelSchema.options) }).notNull(),
  daysPerWeek: integer("days_per_week").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const routineExercises = sqliteTable(
  "routine_exercises",
  {
    id: text("id").primaryKey(),
    routineId: text("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    name: text("name").notNull(),
    targetMuscle: text("target_muscle").notNull(),
    sets: integer("sets").notNull(),
    targetReps: text("target_reps").notNull(),
    restSeconds: integer("rest_seconds").notNull(),
  },
  (table) => [uniqueIndex("routine_exercises_routine_position_idx").on(table.routineId, table.position)],
);

// ── Workout history ───────────────────────────────────────────
export const workoutSessions = sqliteTable(
  "workout_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    // Sessions keep their own snapshot, so history survives deleting the routine
    routineId: text("routine_id").references(() => routines.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    // File name inside the app's workout photo directory (never an absolute URI)
    photoFileName: text("photo_file_name"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("workout_sessions_user_completed_idx").on(table.userId, table.completedAt)],
);

export const workoutSessionExercises = sqliteTable(
  "workout_session_exercises",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    // Catalog exercise the sets belong to (used for personal records); null for routine workouts
    catalogExerciseId: text("catalog_exercise_id"),
    name: text("name").notNull(),
    targetMuscle: text("target_muscle").notNull(),
    sets: integer("sets").notNull(),
    targetReps: text("target_reps").notNull(),
    completed: integer("completed", { mode: "boolean" }).notNull(),
  },
  (table) => [
    uniqueIndex("workout_session_exercises_session_position_idx").on(table.sessionId, table.position),
  ],
);

// Only completed sets of a logged workout are stored
export const workoutSessionSets = sqliteTable(
  "workout_session_sets",
  {
    id: text("id").primaryKey(),
    sessionExerciseId: text("session_exercise_id")
      .notNull()
      .references(() => workoutSessionExercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    weightKg: real("weight_kg").notNull(),
    reps: integer("reps").notNull(),
    // null = regular working set
    tag: text("tag", { enum: toEnumValues(SetTagSchema.options) }),
    // Snapshots of the records the set beat when the workout was saved
    isOneRepMaxRecord: integer("is_one_rep_max_record", { mode: "boolean" }).notNull().default(false),
    isBestSetVolumeRecord: integer("is_best_set_volume_record", { mode: "boolean" }).notNull().default(false),
    isMaxRepsRecord: integer("is_max_reps_record", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    uniqueIndex("workout_session_sets_exercise_position_idx").on(table.sessionExerciseId, table.position),
  ],
);

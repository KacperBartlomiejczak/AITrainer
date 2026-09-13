import { z } from "zod";
// Relative imports on purpose: drizzle-kit loads this file without tsconfig path aliases
import { UserIdSchema } from "./database.schema";
import { RoutineLevelSchema } from "./routine.schema";

/**
 * Routines and completed workouts stored in the local database.
 * Row schemas mirror the Drizzle tables in `src/db/schema.ts` 1:1 (camelCase),
 * domain schemas are what repositories hand to the rest of the app.
 */

// ── Shared fields ─────────────────────────────────────────────
const EntityIdSchema = z.string().min(1).max(64);
const PositionSchema = z.number().int().nonnegative();
const LabelSchema = z.string().trim().min(1).max(120);

export const RoutineIdSchema = EntityIdSchema;
export const WorkoutSessionIdSchema = EntityIdSchema;

/**
 * File name of a workout photo inside the app's photo directory.
 * Never a path: rejects separators and `..` so a stored value cannot escape that directory.
 */
export const WorkoutPhotoFileNameSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|heic)$/, "Invalid workout photo file name");

export const WorkoutPhotoSourceSchema = z.enum(["camera", "library"]);

// ── Table rows ────────────────────────────────────────────────
export const RoutineRowSchema = z.object({
  id: RoutineIdSchema,
  /** null = built-in routine shipped with the app (not owned by any profile) */
  userId: UserIdSchema.nullable(),
  title: LabelSchema,
  description: z.string().trim().min(1).max(500),
  level: RoutineLevelSchema,
  daysPerWeek: z.number().int().min(1).max(7),
  durationMinutes: z.number().int().positive().max(600),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RoutineExerciseRowSchema = z.object({
  id: EntityIdSchema,
  routineId: RoutineIdSchema,
  position: PositionSchema,
  name: LabelSchema,
  targetMuscle: LabelSchema,
  sets: z.number().int().positive().max(20),
  targetReps: z.string().trim().min(1).max(40),
  restSeconds: z.number().int().nonnegative().max(900),
});

export const WorkoutSessionRowSchema = z.object({
  id: WorkoutSessionIdSchema,
  userId: UserIdSchema,
  /** null = the routine was deleted later (the session keeps its own snapshot) */
  routineId: RoutineIdSchema.nullable(),
  title: LabelSchema,
  startedAt: z.date(),
  completedAt: z.date(),
  durationSeconds: z.number().int().nonnegative(),
  photoFileName: WorkoutPhotoFileNameSchema.nullable(),
  createdAt: z.date(),
});

export const WorkoutSessionExerciseRowSchema = z.object({
  id: EntityIdSchema,
  sessionId: WorkoutSessionIdSchema,
  position: PositionSchema,
  name: LabelSchema,
  targetMuscle: LabelSchema,
  sets: RoutineExerciseRowSchema.shape.sets,
  targetReps: RoutineExerciseRowSchema.shape.targetReps,
  completed: z.boolean(),
});

// ── Domain ────────────────────────────────────────────────────
const RoutineExerciseSchema = RoutineExerciseRowSchema.omit({ routineId: true, position: true });

export const RoutineSchema = RoutineRowSchema.extend({
  exercises: z.array(RoutineExerciseSchema).min(1),
});

/** Definition used to seed/insert a routine; timestamps are set by the repository. */
export const NewRoutineSchema = RoutineRowSchema.omit({ createdAt: true, updatedAt: true }).extend({
  exercises: z.array(RoutineExerciseSchema).min(1),
});

const WorkoutSessionExerciseSchema = WorkoutSessionExerciseRowSchema.omit({
  sessionId: true,
  position: true,
});

export const WorkoutSessionSchema = WorkoutSessionRowSchema.extend({
  exercises: z.array(WorkoutSessionExerciseSchema).min(1),
});

/** A finished workout as reported by the workout screen, before it gets ids and a duration. */
export const NewWorkoutSessionSchema = z
  .object({
    routineId: RoutineIdSchema.nullable(),
    title: LabelSchema,
    startedAt: z.date(),
    completedAt: z.date(),
    exercises: z
      .array(WorkoutSessionExerciseRowSchema.pick({ name: true, targetMuscle: true, sets: true, targetReps: true, completed: true }))
      .min(1),
  })
  .refine((session) => session.completedAt.getTime() >= session.startedAt.getTime(), {
    message: "Trening nie może zakończyć się przed rozpoczęciem",
    path: ["completedAt"],
  })
  .refine((session) => session.exercises.some((exercise) => exercise.completed), {
    message: "Odhacz przynajmniej jedno ćwiczenie, aby zapisać trening",
    path: ["exercises"],
  });

/** A stored session plus the resolved local URI of its photo (null = no photo or file missing). */
export const WorkoutHistoryEntrySchema = WorkoutSessionSchema.extend({
  photoUri: z.string().min(1).nullable(),
});

// ── Photo picking (expo-image-picker result is external data) ──
export const PickedImageResultSchema = z.object({
  canceled: z.boolean(),
  assets: z.array(z.object({ uri: z.string().min(1) })).nullable(),
});

export const PickWorkoutPhotoResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("picked"), uri: z.string().min(1) }),
  z.object({ status: z.literal("canceled") }),
  z.object({ status: z.literal("permission_denied") }),
  z.object({ status: z.literal("failed") }),
]);

// ── Export (GDPR-style data export) ───────────────────────────
export const WorkoutSessionExportSchema = z.object({
  id: WorkoutSessionIdSchema,
  routineId: RoutineIdSchema.nullable(),
  title: LabelSchema,
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime(),
  durationSeconds: z.number().int().nonnegative(),
  hasPhoto: z.boolean(),
  exercises: z.array(WorkoutSessionExerciseSchema.omit({ id: true })),
});

// ── Exported Types ────────────────────────────────────────────
export type RoutineId = z.infer<typeof RoutineIdSchema>;
export type WorkoutSessionId = z.infer<typeof WorkoutSessionIdSchema>;
export type WorkoutPhotoFileName = z.infer<typeof WorkoutPhotoFileNameSchema>;
export type WorkoutPhotoSource = z.infer<typeof WorkoutPhotoSourceSchema>;
export type RoutineRow = z.infer<typeof RoutineRowSchema>;
export type RoutineExerciseRow = z.infer<typeof RoutineExerciseRowSchema>;
export type WorkoutSessionRow = z.infer<typeof WorkoutSessionRowSchema>;
export type WorkoutSessionExerciseRow = z.infer<typeof WorkoutSessionExerciseRowSchema>;
export type Routine = z.infer<typeof RoutineSchema>;
export type NewRoutine = z.infer<typeof NewRoutineSchema>;
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;
export type NewWorkoutSession = z.infer<typeof NewWorkoutSessionSchema>;
export type WorkoutHistoryEntry = z.infer<typeof WorkoutHistoryEntrySchema>;
export type PickWorkoutPhotoResult = z.infer<typeof PickWorkoutPhotoResultSchema>;
export type WorkoutSessionExport = z.infer<typeof WorkoutSessionExportSchema>;

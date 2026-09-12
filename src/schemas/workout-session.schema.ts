import { z } from "zod";
import { RoutineLevelSchema } from "./routine.schema";

export const WorkoutExerciseItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  targetMuscle: z.string().min(1),
  sets: z.number().int().positive(),
  targetReps: z.string().min(1),
  restSeconds: z.number().int().nonnegative().default(60),
  completed: z.boolean().default(false),
});

export const WorkoutDetailSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  level: RoutineLevelSchema,
  targetMuscleGroups: z.array(z.string()).min(1),
  exercises: z.array(WorkoutExerciseItemSchema).min(1),
});

export const ActiveWorkoutSessionSchema = z.object({
  routineId: z.string().min(1),
  startedAt: z.string().datetime(),
  isPaused: z.boolean().default(false),
  elapsedSeconds: z.number().int().nonnegative().default(0),
  currentExerciseIndex: z.number().int().nonnegative().default(0),
  completedExerciseIds: z.array(z.string()).default([]),
  isFinished: z.boolean().default(false),
});

export type WorkoutExerciseItem = z.infer<typeof WorkoutExerciseItemSchema>;
export type WorkoutDetail = z.infer<typeof WorkoutDetailSchema>;
export type ActiveWorkoutSession = z.infer<typeof ActiveWorkoutSessionSchema>;

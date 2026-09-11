import { z } from "zod";

export const ExercisePreviewSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sets: z.number().int().positive(),
  targetReps: z.string().min(1),
  muscleGroup: z.string().min(1),
});

export const WorkoutSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  targetMuscleGroups: z.array(z.string()).min(1),
  estimatedDurationMinutes: z.number().int().positive(),
  exerciseCount: z.number().int().positive(),
  difficulty: z.enum(["easy", "moderate", "challenging"]).default("moderate"),
  status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
  exercisesPreview: z.array(ExercisePreviewSchema).optional(),
});

export const RecentActivitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  completedAt: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  totalVolumeKg: z.number().nonnegative(),
  personalRecordsCount: z.number().int().nonnegative().default(0),
});

export type ExercisePreview = z.infer<typeof ExercisePreviewSchema>;
export type WorkoutSummary = z.infer<typeof WorkoutSummarySchema>;
export type RecentActivity = z.infer<typeof RecentActivitySchema>;

import { z } from "zod";

export const RoutineLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

export const RoutineItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  daysPerWeek: z.number().int().positive(),
  level: RoutineLevelSchema,
  targetMuscleGroups: z.array(z.string().min(1)).min(1),
  exerciseCount: z.number().int().positive(),
  isPopular: z.boolean().optional().default(false),
});

export const RoutineListSchema = z.array(RoutineItemSchema);

export type RoutineLevel = z.infer<typeof RoutineLevelSchema>;
export type RoutineItem = z.infer<typeof RoutineItemSchema>;
export type RoutineList = z.infer<typeof RoutineListSchema>;

export const ROUTINE_LEVEL_LABELS: Record<RoutineLevel, { label: string }> = {
  beginner: { label: "Początkujący" },
  intermediate: { label: "Średni" },
  advanced: { label: "Zaawansowany" },
};



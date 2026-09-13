import { z } from "zod";

export const ExerciseCategoryFilterSchema = z.enum([
  "all",
  "chest",
  "back",
  "upper legs",
  "upper arms",
  "shoulders",
  "waist",
  "cardio",
  "lower legs",
  "lower arms",
]);

export const CatalogExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bodyPart: z.string().min(1),
  category: z.string().min(1),
  target: z.string().min(1),
  equipment: z.string().min(1),
  instructionsPl: z.string().min(1),
  instructionStepsPl: z.array(z.string()).optional(),
  imageFile: z.string().min(1),
  gifFile: z.string().min(1),
  muscleGroup: z.string().default("other"),
  secondaryMuscles: z.array(z.string()).default([]),
});

export const ExerciseCatalogListSchema = z.array(CatalogExerciseSchema);

export type ExerciseCategoryFilter = z.infer<typeof ExerciseCategoryFilterSchema>;
export type CatalogExercise = z.infer<typeof CatalogExerciseSchema>;
export type ExerciseCatalogList = z.infer<typeof ExerciseCatalogListSchema>;


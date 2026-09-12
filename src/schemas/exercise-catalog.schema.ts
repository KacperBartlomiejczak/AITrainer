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

export const ExerciseEquipmentFilterSchema = z.enum([
  "all",
  "dumbbell",
  "barbell",
  "bodyweight",
  "kettlebell",
  "machine",
  "band",
]);

export const ExerciseFilterStateSchema = z.object({
  category: ExerciseCategoryFilterSchema,
  equipment: ExerciseEquipmentFilterSchema,
  searchQuery: z.string(),
});

export const EQUIPMENT_FILTER_OPTIONS: {
  id: z.infer<typeof ExerciseEquipmentFilterSchema>;
  label: string;
  emoji: string;
}[] = [

  { id: "all", label: "Wszystkie", emoji: "🏋️" },
  { id: "dumbbell", label: "Hantle", emoji: "🔩" },
  { id: "barbell", label: "Sztanga", emoji: "🏋️‍♂️" },
  { id: "bodyweight", label: "Masa własna", emoji: "🤸" },
  { id: "kettlebell", label: "Kettlebell", emoji: "🔔" },
  { id: "machine", label: "Maszyny", emoji: "⚙️" },
  { id: "band", label: "Taśmy", emoji: "🎗️" },
];

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
export type ExerciseEquipmentFilter = z.infer<typeof ExerciseEquipmentFilterSchema>;
export type ExerciseFilterState = z.infer<typeof ExerciseFilterStateSchema>;
export type CatalogExercise = z.infer<typeof CatalogExerciseSchema>;
export type ExerciseCatalogList = z.infer<typeof ExerciseCatalogListSchema>;



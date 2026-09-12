import { z } from "zod";

// ── Fitness Goal ──────────────────────────────────────────────
export const FitnessGoalSchema = z.enum([
  "weight_loss",
  "muscle_gain",
  "strength",
  "general_fitness",
  "maintenance",
]);

// ── Muscle Group ──────────────────────────────────────────────
export const MuscleGroupSchema = z.enum([
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "abs",
]);

// ── Onboarding Form Data ──────────────────────────────────────
export const OnboardingFormSchema = z.object({
  name: z
    .string()
    .min(1, "Imię jest wymagane")
    .max(50, "Imię może mieć maksymalnie 50 znaków"),
  fitnessGoal: FitnessGoalSchema,
  focusMuscleGroups: z
    .array(MuscleGroupSchema)
    .min(1, "Wybierz przynajmniej jedną partię ciała"),
});

// ── Polish UI Labels ──────────────────────────────────────────
export const FITNESS_GOAL_LABELS: Record<FitnessGoal, { label: string; emoji: string; description: string }> = {
  weight_loss: { label: "Schudnąć", emoji: "🔥", description: "Redukcja tkanki tłuszczowej" },
  muscle_gain: { label: "Masa mięśniowa", emoji: "💪", description: "Budowa sylwetki" },
  strength: { label: "Siła", emoji: "🏋️", description: "Powerlifting i rekordy" },
  general_fitness: { label: "Ogólna kondycja", emoji: "🏃", description: "Zdrowie i wytrzymałość" },
  maintenance: { label: "Utrzymanie formy", emoji: "⚖️", description: "Nie trać tego co masz" },
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, { label: string; emoji: string }> = {
  chest: { label: "Klatka piersiowa", emoji: "🫁" },
  back: { label: "Plecy", emoji: "🔙" },
  legs: { label: "Nogi", emoji: "🦵" },
  shoulders: { label: "Barki", emoji: "🤸" },
  arms: { label: "Ramiona", emoji: "💪" },
  abs: { label: "Brzuch", emoji: "🎯" },
};

// ── Exported Types ────────────────────────────────────────────
export type FitnessGoal = z.infer<typeof FitnessGoalSchema>;
export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;
export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>;

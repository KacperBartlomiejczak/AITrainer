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

// ── Training Experience ───────────────────────────────────────
export const ExperienceLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

// ── Muscle Focus (priorities) ─────────────────────────────────
export const MuscleFocusModeSchema = z.enum(["undecided", "selected"]);

export const MUSCLE_FOCUS_REQUIRED_MESSAGE =
  "Wybierz przynajmniej jedną partię ciała lub „Jeszcze nie wiem”";

/**
 * Either "not sure yet" OR at least one muscle group — never both.
 * Strict objects reject payloads that mix the two shapes instead of silently stripping keys.
 */
export const MuscleFocusSchema = z.discriminatedUnion(
  "mode",
  [
    z.strictObject({ mode: z.literal(MuscleFocusModeSchema.enum.undecided) }),
    z.strictObject({
      mode: z.literal(MuscleFocusModeSchema.enum.selected),
      muscleGroups: z.array(MuscleGroupSchema).min(1, MUSCLE_FOCUS_REQUIRED_MESSAGE),
    }),
  ],
  { error: MUSCLE_FOCUS_REQUIRED_MESSAGE },
);

// ── Onboarding Form Data ──────────────────────────────────────
export const OnboardingFormSchema = z.object({
  name: z
    .string()
    .min(1, "Imię jest wymagane")
    .max(50, "Imię może mieć maksymalnie 50 znaków"),
  experienceLevel: ExperienceLevelSchema,
  fitnessGoal: FitnessGoalSchema,
  muscleFocus: MuscleFocusSchema,
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

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, { label: string; emoji: string; description: string }> = {
  beginner: { label: "Dopiero zaczynam", emoji: "🌱", description: "Mniej niż 5 miesięcy treningów" },
  intermediate: { label: "Trenuję już trochę", emoji: "💪", description: "Około 5–12 miesięcy" },
  advanced: { label: "Zaawansowany", emoji: "🏆", description: "Ponad rok regularnych treningów" },
};

export const UNDECIDED_MUSCLE_FOCUS_LABEL = {
  label: "Jeszcze nie wiem",
  emoji: "🤔",
  description: "Dobierzemy partie za Ciebie",
} as const;

// ── Exported Types ────────────────────────────────────────────
export type FitnessGoal = z.infer<typeof FitnessGoalSchema>;
export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
export type MuscleFocusMode = z.infer<typeof MuscleFocusModeSchema>;
export type MuscleFocus = z.infer<typeof MuscleFocusSchema>;
export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>;

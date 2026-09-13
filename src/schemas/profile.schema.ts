import { z } from "zod";
import {
  ExperienceLevelSchema,
  FitnessGoalSchema,
  MuscleFocusSchema,
  type ExperienceLevel,
  type FitnessGoal,
  type MuscleFocus,
  type MuscleGroup,
} from "./onboarding.schema";

// ── Profile Form Data (Editable from Profile/Settings) ───────
export const ProfileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Imię jest wymagane")
    .max(50, "Imię może mieć maksymalnie 50 znaków"),
  experienceLevel: ExperienceLevelSchema,
  fitnessGoal: FitnessGoalSchema,
  muscleFocus: MuscleFocusSchema,
});

// ── App Settings Preferences ──────────────────────────────────
export const AppSettingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).default("dark"),
  soundEnabled: z.boolean().default(true),
  hapticsEnabled: z.boolean().default(true),
  units: z.enum(["metric", "imperial"]).default("metric"),
});

// ── Export Sensitive User Data Schema ─────────────────────────
export const UserDataExportSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  profile: ProfileFormSchema,
  appSettings: AppSettingsSchema,
});

// ── Exported Types ────────────────────────────────────────────
export type ProfileFormData = z.infer<typeof ProfileFormSchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
export type UserDataExport = z.infer<typeof UserDataExportSchema>;

export { type ExperienceLevel, type FitnessGoal, type MuscleFocus, type MuscleGroup };

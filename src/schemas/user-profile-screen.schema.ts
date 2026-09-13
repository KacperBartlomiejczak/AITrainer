import { z } from "zod";

// ── Strength League / Ranks System ─────────────────────────────
export const StrengthLeagueIdSchema = z.enum([
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "master",
  "titan",
]);

export const StrengthLeagueSchema = z.object({
  id: StrengthLeagueIdSchema,
  name: z.string().min(1),
  minKg: z.number().nonnegative(),
  icon: z.string().min(1),
  badgeColor: z.string().min(1),
  description: z.string().min(1),
});

export type StrengthLeagueId = z.infer<typeof StrengthLeagueIdSchema>;
export type StrengthLeague = z.infer<typeof StrengthLeagueSchema>;

export const STRENGTH_LEAGUES: Record<StrengthLeagueId, StrengthLeague> = {
  bronze: {
    id: "bronze",
    name: "Brązowa Liga",
    minKg: 0,
    icon: "🥉",
    badgeColor: "#CD7F32",
    description: "Start przygody z ciężarami (<50 kg)",
  },
  silver: {
    id: "silver",
    name: "Srebrna Liga",
    minKg: 50,
    icon: "🥈",
    badgeColor: "#C0C0C0",
    description: "Solidny fundament siły (50-69 kg)",
  },
  gold: {
    id: "gold",
    name: "Złota Liga",
    minKg: 70,
    icon: "🥇",
    badgeColor: "#F59E0B",
    description: "Ponadprzeciętna siła (70-89 kg)",
  },
  platinum: {
    id: "platinum",
    name: "Platynowa Liga",
    minKg: 90,
    icon: "🛡️",
    badgeColor: "#38BDF8",
    description: "Krok od elity (90-99 kg)",
  },
  diamond: {
    id: "diamond",
    name: "Diamentowa Liga",
    minKg: 100,
    icon: "💎",
    badgeColor: "#818CF8",
    description: "Magiczna bariera 100 kg na klatę! (100-119 kg)",
  },
  master: {
    id: "master",
    name: "Mistrzowska Liga",
    minKg: 120,
    icon: "👑",
    badgeColor: "#EC4899",
    description: "Elitarny poziom zaawansowania (120-139 kg)",
  },
  titan: {
    id: "titan",
    name: "Tytanowa Liga",
    minKg: 140,
    icon: "⚡",
    badgeColor: "#F43F5E",
    description: "Absolutna potęga (140+ kg)",
  },
};

export function calculateStrengthLeague(benchPressKg: number): StrengthLeague {
  const safeKg = Math.max(0, benchPressKg);
  if (safeKg >= 140) return STRENGTH_LEAGUES.titan;
  if (safeKg >= 120) return STRENGTH_LEAGUES.master;
  if (safeKg >= 100) return STRENGTH_LEAGUES.diamond;
  if (safeKg >= 90) return STRENGTH_LEAGUES.platinum;
  if (safeKg >= 70) return STRENGTH_LEAGUES.gold;
  if (safeKg >= 50) return STRENGTH_LEAGUES.silver;
  return STRENGTH_LEAGUES.bronze;
}

// ── Top Routine / Past Workout Photos Schema ───────────────────
export const WorkoutExerciseItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  setsSummary: z.string().min(1),
  imageAssetKey: z.string().min(1),
  isPersonalRecord: z.boolean().default(false),
  recordNote: z.string().optional(),
});

export const RoutinePhotoItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  imageAssetKey: z.string().min(1),
  routineId: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  daysPerWeek: z.number().int().positive(),
  completedDate: z.string().optional(),
  totalVolumeKg: z.number().nonnegative().optional(),
  exercises: z.array(WorkoutExerciseItemSchema).optional(),
});

// ── Profile Stats & Badges Schema ──────────────────────────────
export const ProfileStatsSchema = z.object({
  displayName: z.string().min(1),
  fitnessGoalLabel: z.string().min(1),
  streakDays: z.number().int().nonnegative(),
  benchPressMaxKg: z.number().nonnegative(),
  strengthLeague: StrengthLeagueSchema,
  totalWorkoutsCompleted: z.number().int().nonnegative(),
});

// ── Monthly Workout Intensity Breakdown Schema ─────────────────
export const WeeklyIntensitySchema = z.object({
  id: z.string().min(1),
  weekLabel: z.string().min(1), // np. "18 lip – 25 lip"
  hours: z.number().nonnegative(), // np. 5.0
  workoutCount: z.number().int().nonnegative(),
  targetHours: z.number().positive(),
  isCurrentWeek: z.boolean().default(false),
});

export const MonthlyIntensitySchema = z.object({
  monthLabel: z.string().min(1), // np. "Lipiec 2026"
  totalHours: z.number().nonnegative(),
  targetTotalHours: z.number().positive(),
  weeks: z.array(WeeklyIntensitySchema).min(1),
});

// ── User Routines Card Schema ──────────────────────────────────
export const UserRoutineCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  targetMuscleGroups: z.array(z.string().min(1)).min(1),
  daysPerWeek: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  exerciseCount: z.number().int().positive(),
  levelLabel: z.string().min(1),
});

// ── Recent Completed Workout & Exercises Details Schema ────────
export const CompletedWorkoutExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  setsSummary: z.string().min(1),
  imageAssetKey: z.string().optional(),
  isPersonalRecord: z.boolean().default(false),
  recordNote: z.string().optional(),
});

export const CompletedWorkoutAchievementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  badgeColor: z.string().default("#F59E0B"),
});

export const CompletedWorkoutDetailSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  completedDate: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  totalVolumeKg: z.number().nonnegative(),
  imageAssetKey: z.string().optional().or(z.literal("")),
  exercises: z.array(CompletedWorkoutExerciseSchema).min(1),
  achievements: z.array(CompletedWorkoutAchievementSchema).default([]),
});

// ── Root Screen Data Schema ────────────────────────────────────
export const UserProfileScreenDataSchema = z.object({
  stats: ProfileStatsSchema,
  routinePhotos: z.array(RoutinePhotoItemSchema).min(1),
  monthlyIntensity: MonthlyIntensitySchema,
  routines: z.array(UserRoutineCardSchema).min(1),
  recentWorkouts: z.array(CompletedWorkoutDetailSchema).min(1),
});

// ── Inferred TypeScript Types ─────────────────────────────────
export type RoutinePhotoItem = z.infer<typeof RoutinePhotoItemSchema>;
export type WorkoutExerciseItem = z.infer<typeof WorkoutExerciseItemSchema>;
export type ProfileStats = z.infer<typeof ProfileStatsSchema>;
export type WeeklyIntensity = z.infer<typeof WeeklyIntensitySchema>;
export type MonthlyIntensity = z.infer<typeof MonthlyIntensitySchema>;
export type UserRoutineCard = z.infer<typeof UserRoutineCardSchema>;
export type CompletedWorkoutExercise = z.infer<
  typeof CompletedWorkoutExerciseSchema
>;
export type CompletedWorkoutAchievement = z.infer<
  typeof CompletedWorkoutAchievementSchema
>;
export type CompletedWorkoutDetail = z.infer<
  typeof CompletedWorkoutDetailSchema
>;
export type UserProfileScreenData = z.infer<
  typeof UserProfileScreenDataSchema
>;

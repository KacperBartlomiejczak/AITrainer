import { z } from "zod";
import {
  StrengthLeagueSchema,
  STRENGTH_LEAGUES,
  type StrengthLeagueId,
  type StrengthLeague,
} from "./user-profile-screen.schema";

// ── Ranking Muscle Groups (Biceps front, Triceps back) ──────────
export const RankingMuscleGroupSchema = z.enum([
  "chest",
  "back",
  "legs",
  "shoulders",
  "biceps",
  "triceps",
  "abs",
]);

export type RankingMuscleGroup = z.infer<typeof RankingMuscleGroupSchema>;

// ── Muscle Standards Configuration ──────────────────────────────
export interface MuscleBenchmarkConfig {
  muscle: RankingMuscleGroup;
  namePl: string;
  emoji: string;
  exerciseName: string;
  viewSide: "front" | "back";
  thresholds: Record<StrengthLeagueId, number>;
}

export const MUSCLE_BENCHMARK_CONFIGS: Record<RankingMuscleGroup, MuscleBenchmarkConfig> = {
  chest: {
    muscle: "chest",
    namePl: "Klatka piersiowa",
    emoji: "🫁",
    exerciseName: "Wyciskanie sztangi leżąc",
    viewSide: "front",
    thresholds: {
      bronze: 0,
      silver: 50,
      gold: 70,
      platinum: 90,
      diamond: 100, // 100 kg na klatę = Diamentowa Liga!
      master: 120,
      titan: 140,
    },
  },
  back: {
    muscle: "back",
    namePl: "Plecy",
    emoji: "🔙",
    exerciseName: "Martwy ciąg",
    viewSide: "back",
    thresholds: {
      bronze: 0,
      silver: 70,
      gold: 100,
      platinum: 130,
      diamond: 150,
      master: 180,
      titan: 210,
    },
  },
  legs: {
    muscle: "legs",
    namePl: "Nogi",
    emoji: "🦵",
    exerciseName: "Przysiad ze sztangą",
    viewSide: "front",
    thresholds: {
      bronze: 0,
      silver: 60,
      gold: 90,
      platinum: 115,
      diamond: 130,
      master: 160,
      titan: 190,
    },
  },
  shoulders: {
    muscle: "shoulders",
    namePl: "Barki",
    emoji: "🤸",
    exerciseName: "Wyciskanie żołnierskie (OHP)",
    viewSide: "front",
    thresholds: {
      bronze: 0,
      silver: 30,
      gold: 45,
      platinum: 60,
      diamond: 70,
      master: 85,
      titan: 100,
    },
  },
  biceps: {
    muscle: "biceps",
    namePl: "Biceps",
    emoji: "💪",
    exerciseName: "Uginanie ramion ze sztangą",
    viewSide: "front",
    thresholds: {
      bronze: 0,
      silver: 20,
      gold: 30,
      platinum: 40,
      diamond: 50,
      master: 60,
      titan: 70,
    },
  },
  triceps: {
    muscle: "triceps",
    namePl: "Triceps",
    emoji: "🦾",
    exerciseName: "Dipsy na poręczach z obciążeniem",
    viewSide: "back",
    thresholds: {
      bronze: 0,
      silver: 25,
      gold: 40,
      platinum: 55,
      diamond: 65,
      master: 80,
      titan: 95,
    },
  },
  abs: {
    muscle: "abs",
    namePl: "Brzuch",
    emoji: "🎯",
    exerciseName: "Allahy na wyciągu klęcząc",
    viewSide: "front",
    thresholds: {
      bronze: 0,
      silver: 35,
      gold: 50,
      platinum: 65,
      diamond: 80,
      master: 95,
      titan: 110,
    },
  },
};

const LEAGUE_ORDER: StrengthLeagueId[] = [
  "titan",
  "master",
  "diamond",
  "platinum",
  "gold",
  "silver",
  "bronze",
];

const LEAGUE_POINTS: Record<StrengthLeagueId, number> = {
  bronze: 100,
  silver: 250,
  gold: 450,
  platinum: 650,
  diamond: 850,
  master: 1100,
  titan: 1400,
};

// ── Slug to Ranking Muscle Mapper ───────────────────────────────
export function mapSlugToRankingMuscle(slug: string): RankingMuscleGroup | null {
  switch (slug) {
    case "chest":
      return "chest";
    case "deltoids":
      return "shoulders";
    case "biceps":
      return "biceps";
    case "triceps":
      return "triceps";
    case "abs":
    case "obliques":
      return "abs";
    case "upper-back":
    case "lower-back":
    case "trapezius":
      return "back";
    case "quadriceps":
    case "calves":
    case "gluteal":
    case "hamstring":
    case "adductors":
    case "abductors":
    case "tibialis":
      return "legs";
    default:
      return null;
  }
}

// ── League Calculator Functions ──────────────────────────────────
export function calculateMuscleLeague(
  muscle: RankingMuscleGroup,
  currentKg: number,
): StrengthLeague {
  const config = MUSCLE_BENCHMARK_CONFIGS[muscle];
  const safeKg = Math.max(0, currentKg);

  for (const leagueId of LEAGUE_ORDER) {
    if (safeKg >= config.thresholds[leagueId]) {
      return STRENGTH_LEAGUES[leagueId];
    }
  }

  return STRENGTH_LEAGUES.bronze;
}

export function calculateNextLeagueProgress(
  muscle: RankingMuscleGroup,
  currentKg: number,
): {
  currentLeague: StrengthLeague;
  nextLeague: StrengthLeague | null;
  kgRemaining: number;
  progressPercent: number;
} {
  const config = MUSCLE_BENCHMARK_CONFIGS[muscle];
  const safeKg = Math.max(0, currentKg);
  const currentLeague = calculateMuscleLeague(muscle, safeKg);

  const ascendingLeagues: StrengthLeagueId[] = [
    "bronze",
    "silver",
    "gold",
    "platinum",
    "diamond",
    "master",
    "titan",
  ];

  const currentIndex = ascendingLeagues.indexOf(currentLeague.id);
  if (currentIndex === ascendingLeagues.length - 1) {
    return {
      currentLeague,
      nextLeague: null,
      kgRemaining: 0,
      progressPercent: 100,
    };
  }

  const nextLeagueId = ascendingLeagues[currentIndex + 1];
  const nextLeague = STRENGTH_LEAGUES[nextLeagueId];
  const currentThreshold = config.thresholds[currentLeague.id];
  const nextThreshold = config.thresholds[nextLeagueId];

  const kgRemaining = Math.max(0, nextThreshold - safeKg);
  const span = Math.max(1, nextThreshold - currentThreshold);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((safeKg - currentThreshold) / span) * 100)),
  );

  return {
    currentLeague,
    nextLeague,
    kgRemaining,
    progressPercent,
  };
}

export function calculateOverallRank(
  records: Record<RankingMuscleGroup, number>,
): {
  overallLeague: StrengthLeague;
  totalScore: number;
} {
  let totalScore = 0;
  const leagueCounts: Partial<Record<StrengthLeagueId, number>> = {};

  (Object.keys(records) as RankingMuscleGroup[]).forEach((muscle) => {
    const kg = records[muscle] ?? 0;
    const league = calculateMuscleLeague(muscle, kg);
    totalScore += LEAGUE_POINTS[league.id] + Math.round(kg);
    leagueCounts[league.id] = (leagueCounts[league.id] ?? 0) + 1;
  });

  // Dominant league determination
  let dominantLeagueId: StrengthLeagueId | null = null;
  for (const leagueId of LEAGUE_ORDER) {
    if ((leagueCounts[leagueId] ?? 0) >= 2) {
      dominantLeagueId = leagueId;
      break;
    }
  }

  // If no 2+ match, check top league achieved
  if (!dominantLeagueId) {
    for (const leagueId of LEAGUE_ORDER) {
      if ((leagueCounts[leagueId] ?? 0) >= 1) {
        dominantLeagueId = leagueId;
        break;
      }
    }
  }

  return {
    overallLeague: STRENGTH_LEAGUES[dominantLeagueId ?? "bronze"],
    totalScore,
  };
}

// ── Zod Schemas ─────────────────────────────────────────────────
export const MuscleRankItemSchema = z.object({
  muscle: RankingMuscleGroupSchema,
  namePl: z.string().min(1),
  emoji: z.string().min(1),
  benchmarkExercise: z.string().min(1),
  viewSide: z.enum(["front", "back"]),
  currentKg: z.number().nonnegative(),
  league: StrengthLeagueSchema,
  nextLeague: StrengthLeagueSchema.nullable(),
  kgRemaining: z.number().nonnegative(),
  progressPercent: z.number().min(0).max(100),
});

export const LeaderboardUserSchema = z.object({
  id: z.string().min(1),
  rank: z.number().int().positive(),
  displayName: z.string().min(1),
  league: StrengthLeagueSchema,
  totalScore: z.number().nonnegative(),
  topMuscleNamePl: z.string().min(1),
  topRecordSummary: z.string().min(1),
  isCurrentUser: z.boolean().default(false),
});

export const RankingScreenDataSchema = z.object({
  overallLeague: StrengthLeagueSchema,
  totalScore: z.number().nonnegative(),
  selectedMuscle: RankingMuscleGroupSchema,
  muscleRanks: z
    .array(MuscleRankItemSchema)
    .length(7)
    .refine(
      (items) => new Set(items.map((i) => i.muscle)).size === 7,
      { message: "All 7 muscle groups must be unique" },
    ),
  leaderboard: z.array(LeaderboardUserSchema).min(1),
});

export type MuscleRankItem = z.infer<typeof MuscleRankItemSchema>;
export type LeaderboardUser = z.infer<typeof LeaderboardUserSchema>;
export type RankingScreenData = z.infer<typeof RankingScreenDataSchema>;

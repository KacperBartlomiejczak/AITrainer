import {
  calculateMuscleLeague,
  calculateNextLeagueProgress,
  calculateOverallRank,
  mapSlugToRankingMuscle,
  MuscleRankItemSchema,
  LeaderboardUserSchema,
  RankingScreenDataSchema,
  MUSCLE_BENCHMARK_CONFIGS,
  type RankingMuscleGroup,
} from "../ranking.schema";
import { STRENGTH_LEAGUES } from "../user-profile-screen.schema";

describe("ranking.schema", () => {
  describe("calculateMuscleLeague", () => {
    it("assigns diamond league to 100 kg bench press (chest)", () => {
      const league = calculateMuscleLeague("chest", 100);
      expect(league.id).toBe("diamond");
      expect(league.name).toBe("Diamentowa Liga");
      expect(league.badgeColor).toBe("#818CF8");
    });

    it("evaluates biceps (front) standards accurately", () => {
      expect(calculateMuscleLeague("biceps", 15).id).toBe("bronze");
      expect(calculateMuscleLeague("biceps", 30).id).toBe("gold");
      expect(calculateMuscleLeague("biceps", 50).id).toBe("diamond");
      expect(calculateMuscleLeague("biceps", 60).id).toBe("master");
    });

    it("evaluates triceps (back) standards accurately", () => {
      expect(calculateMuscleLeague("triceps", 20).id).toBe("bronze");
      expect(calculateMuscleLeague("triceps", 40).id).toBe("gold");
      expect(calculateMuscleLeague("triceps", 65).id).toBe("diamond");
      expect(calculateMuscleLeague("triceps", 80).id).toBe("master");
    });

    it("correctly evaluates all 7 muscle groups according to benchmark configs", () => {
      expect(calculateMuscleLeague("chest", 100).id).toBe("diamond");
      expect(calculateMuscleLeague("back", 150).id).toBe("diamond");
      expect(calculateMuscleLeague("legs", 130).id).toBe("diamond");
      expect(calculateMuscleLeague("shoulders", 70).id).toBe("diamond");
      expect(calculateMuscleLeague("biceps", 50).id).toBe("diamond");
      expect(calculateMuscleLeague("triceps", 65).id).toBe("diamond");
      expect(calculateMuscleLeague("abs", 80).id).toBe("diamond");
    });
  });

  describe("mapSlugToRankingMuscle", () => {
    it("maps body-highlighter slugs to ranking muscle groups", () => {
      expect(mapSlugToRankingMuscle("chest")).toBe("chest");
      expect(mapSlugToRankingMuscle("deltoids")).toBe("shoulders");
      expect(mapSlugToRankingMuscle("biceps")).toBe("biceps");
      expect(mapSlugToRankingMuscle("triceps")).toBe("triceps");
      expect(mapSlugToRankingMuscle("abs")).toBe("abs");
      expect(mapSlugToRankingMuscle("obliques")).toBe("abs");
      expect(mapSlugToRankingMuscle("upper-back")).toBe("back");
      expect(mapSlugToRankingMuscle("lower-back")).toBe("back");
      expect(mapSlugToRankingMuscle("trapezius")).toBe("back");
      expect(mapSlugToRankingMuscle("quadriceps")).toBe("legs");
      expect(mapSlugToRankingMuscle("calves")).toBe("legs");
      expect(mapSlugToRankingMuscle("gluteal")).toBe("legs");
      expect(mapSlugToRankingMuscle("unknown")).toBeNull();
    });
  });

  describe("calculateNextLeagueProgress", () => {
    it("calculates remaining kg and progress percent for 100 kg chest (to Master 120 kg)", () => {
      const progress = calculateNextLeagueProgress("chest", 100);
      expect(progress.currentLeague.id).toBe("diamond");
      expect(progress.nextLeague?.id).toBe("master");
      expect(progress.kgRemaining).toBe(20);
      expect(progress.progressPercent).toBe(0);
    });

    it("calculates progress for biceps", () => {
      const progress = calculateNextLeagueProgress("biceps", 35);
      expect(progress.currentLeague.id).toBe("gold");
      expect(progress.nextLeague?.id).toBe("platinum");
      expect(progress.kgRemaining).toBe(5);
      expect(progress.progressPercent).toBe(50);
    });
  });

  describe("calculateOverallRank", () => {
    it("computes overall rank and total score for 7 muscles", () => {
      const records = {
        chest: 100, // Diamond
        back: 110, // Gold
        legs: 130, // Diamond
        shoulders: 50, // Gold
        biceps: 35, // Gold
        triceps: 45, // Gold
        abs: 55, // Gold
      };
      const result = calculateOverallRank(records);
      expect(result.overallLeague.id).toBe("diamond");
      expect(result.totalScore).toBeGreaterThan(3000);
    });

    it("correctly assigns bronze league when 6 muscles are bronze and 1 is silver", () => {
      const records = {
        chest: 50, // Silver (min 50)
        back: 0, // Bronze
        legs: 0, // Bronze
        shoulders: 0, // Bronze
        biceps: 0, // Bronze
        triceps: 0, // Bronze
        abs: 0, // Bronze
      };
      const result = calculateOverallRank(records);
      expect(result.overallLeague.id).toBe("bronze");
    });
  });

  describe("Zod validation schemas", () => {
    it("validates a valid MuscleRankItem", () => {
      const item = {
        muscle: "biceps" as const,
        namePl: "Biceps",
        emoji: "💪",
        benchmarkExercise: "Uginanie ramion ze sztangą",
        viewSide: "front" as const,
        currentKg: 35,
        league: STRENGTH_LEAGUES.gold,
        nextLeague: STRENGTH_LEAGUES.platinum,
        kgRemaining: 5,
        progressPercent: 50,
      };
      const parsed = MuscleRankItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
    });

    it("validates a valid LeaderboardUser", () => {
      const user = {
        id: "u_1",
        rank: 1,
        displayName: "Kacper (Ty)",
        league: STRENGTH_LEAGUES.diamond,
        totalScore: 5490,
        topMuscleNamePl: "Klatka piersiowa",
        topRecordSummary: "100 kg",
        isCurrentUser: true,
      };
      const parsed = LeaderboardUserSchema.safeParse(user);
      expect(parsed.success).toBe(true);
    });

    it("validates full RankingScreenData for 7 muscles", () => {
      const muscles = Object.keys(MUSCLE_BENCHMARK_CONFIGS) as RankingMuscleGroup[];
      const muscleRanks = muscles.map((m) => ({
        muscle: m,
        namePl: MUSCLE_BENCHMARK_CONFIGS[m].namePl,
        emoji: MUSCLE_BENCHMARK_CONFIGS[m].emoji,
        benchmarkExercise: MUSCLE_BENCHMARK_CONFIGS[m].exerciseName,
        viewSide: MUSCLE_BENCHMARK_CONFIGS[m].viewSide,
        currentKg: 100,
        league: STRENGTH_LEAGUES.diamond,
        nextLeague: STRENGTH_LEAGUES.master,
        kgRemaining: 20,
        progressPercent: 10,
      }));

      const screenData = {
        overallLeague: STRENGTH_LEAGUES.diamond,
        totalScore: 4200,
        selectedMuscle: "biceps" as const,
        muscleRanks,
        leaderboard: [
          {
            id: "user_1",
            rank: 1,
            displayName: "Kacper (Ty)",
            league: STRENGTH_LEAGUES.diamond,
            totalScore: 4200,
            topMuscleNamePl: "Klatka piersiowa",
            topRecordSummary: "100 kg",
            isCurrentUser: true,
          },
        ],
      };

      const parsed = RankingScreenDataSchema.safeParse(screenData);
      expect(parsed.success).toBe(true);
    });

    it("rejects RankingScreenData when muscleRanks has duplicates", () => {
      const muscles = Object.keys(MUSCLE_BENCHMARK_CONFIGS) as RankingMuscleGroup[];
      // Replace abs with chest to make a duplicate
      const duplicateMuscles = muscles.map((m) => (m === "abs" ? "chest" : m));
      const muscleRanks = duplicateMuscles.map((m) => ({
        muscle: m,
        namePl: MUSCLE_BENCHMARK_CONFIGS[m].namePl,
        emoji: MUSCLE_BENCHMARK_CONFIGS[m].emoji,
        benchmarkExercise: MUSCLE_BENCHMARK_CONFIGS[m].exerciseName,
        viewSide: MUSCLE_BENCHMARK_CONFIGS[m].viewSide,
        currentKg: 100,
        league: STRENGTH_LEAGUES.diamond,
        nextLeague: STRENGTH_LEAGUES.master,
        kgRemaining: 20,
        progressPercent: 10,
      }));

      const screenData = {
        overallLeague: STRENGTH_LEAGUES.diamond,
        totalScore: 4200,
        selectedMuscle: "biceps" as const,
        muscleRanks,
        leaderboard: [
          {
            id: "user_1",
            rank: 1,
            displayName: "Kacper (Ty)",
            league: STRENGTH_LEAGUES.diamond,
            totalScore: 4200,
            topMuscleNamePl: "Klatka piersiowa",
            topRecordSummary: "100 kg",
            isCurrentUser: true,
          },
        ],
      };

      const parsed = RankingScreenDataSchema.safeParse(screenData);
      expect(parsed.success).toBe(false);
    });
  });
});

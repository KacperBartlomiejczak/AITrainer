import {
  calculateMuscleLeague,
  calculateNextLeagueProgress,
  calculateOverallRank,
  MuscleRankItemSchema,
  LeaderboardUserSchema,
  RankingScreenDataSchema,
  MUSCLE_BENCHMARK_CONFIGS,
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

    it("assigns bronze league to <50 kg on chest", () => {
      const league = calculateMuscleLeague("chest", 45);
      expect(league.id).toBe("bronze");
    });

    it("assigns gold league to 70 kg on chest", () => {
      const league = calculateMuscleLeague("chest", 70);
      expect(league.id).toBe("gold");
    });

    it("assigns master league to 120 kg on chest", () => {
      const league = calculateMuscleLeague("chest", 120);
      expect(league.id).toBe("master");
    });

    it("assigns titan league to 140+ kg on chest", () => {
      const league = calculateMuscleLeague("chest", 150);
      expect(league.id).toBe("titan");
    });

    it("correctly evaluates other muscle groups according to benchmark configs", () => {
      // Deadlift 150kg -> Diamond for back
      expect(calculateMuscleLeague("back", 150).id).toBe("diamond");
      // Squat 130kg -> Diamond for legs
      expect(calculateMuscleLeague("legs", 130).id).toBe("diamond");
      // OHP 70kg -> Diamond for shoulders
      expect(calculateMuscleLeague("shoulders", 70).id).toBe("diamond");
      // Curl 50kg -> Diamond for arms
      expect(calculateMuscleLeague("arms", 50).id).toBe("diamond");
      // Abs 80kg -> Diamond for abs
      expect(calculateMuscleLeague("abs", 80).id).toBe("diamond");
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

    it("calculates midpoint progress (110 kg chest -> 50% towards Master)", () => {
      const progress = calculateNextLeagueProgress("chest", 110);
      expect(progress.currentLeague.id).toBe("diamond");
      expect(progress.nextLeague?.id).toBe("master");
      expect(progress.kgRemaining).toBe(10);
      expect(progress.progressPercent).toBe(50);
    });

    it("handles top league (titan) with no next league", () => {
      const progress = calculateNextLeagueProgress("chest", 150);
      expect(progress.currentLeague.id).toBe("titan");
      expect(progress.nextLeague).toBeNull();
      expect(progress.kgRemaining).toBe(0);
      expect(progress.progressPercent).toBe(100);
    });
  });

  describe("calculateOverallRank", () => {
    it("computes overall rank and total score for typical user records", () => {
      const records = {
        chest: 100, // Diamond
        back: 110, // Gold
        legs: 130, // Diamond
        shoulders: 50, // Gold
        arms: 35, // Gold
        abs: 55, // Gold
      };
      const result = calculateOverallRank(records);
      // Chest (Diamond) & Legs (Diamond) -> 2 Diamond matches -> dominant is diamond
      expect(result.overallLeague.id).toBe("diamond");
      expect(result.totalScore).toBeGreaterThan(3000);
    });
  });

  describe("Zod validation schemas", () => {
    it("validates a valid MuscleRankItem", () => {
      const item = {
        muscle: "chest",
        namePl: "Klatka piersiowa",
        emoji: "🫁",
        benchmarkExercise: "Wyciskanie sztangi leżąc",
        currentKg: 100,
        league: STRENGTH_LEAGUES.diamond,
        nextLeague: STRENGTH_LEAGUES.master,
        kgRemaining: 20,
        progressPercent: 0,
      };
      const parsed = MuscleRankItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
    });

    it("validates a LeaderboardUser", () => {
      const user = {
        id: "user_1",
        rank: 1,
        displayName: "Kacper B.",
        league: STRENGTH_LEAGUES.diamond,
        totalScore: 4850,
        topMuscleNamePl: "Klatka piersiowa",
        topRecordSummary: "100 kg",
        isCurrentUser: true,
      };
      const parsed = LeaderboardUserSchema.safeParse(user);
      expect(parsed.success).toBe(true);
    });

    it("validates full RankingScreenData", () => {
      const muscles = Object.keys(MUSCLE_BENCHMARK_CONFIGS) as (keyof typeof MUSCLE_BENCHMARK_CONFIGS)[];
      const muscleRanks = muscles.map((m) => ({
        muscle: m,
        namePl: MUSCLE_BENCHMARK_CONFIGS[m].namePl,
        emoji: MUSCLE_BENCHMARK_CONFIGS[m].emoji,
        benchmarkExercise: MUSCLE_BENCHMARK_CONFIGS[m].exerciseName,
        currentKg: 100,
        league: STRENGTH_LEAGUES.diamond,
        nextLeague: STRENGTH_LEAGUES.master,
        kgRemaining: 20,
        progressPercent: 10,
      }));

      const screenData = {
        overallLeague: STRENGTH_LEAGUES.diamond,
        totalScore: 4200,
        selectedMuscle: "chest",
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
  });
});

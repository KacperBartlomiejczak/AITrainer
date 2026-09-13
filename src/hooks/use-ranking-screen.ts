import { useState, useMemo, useCallback } from "react";
import { useOnboardingStore } from "@/stores/onboarding.store";
import {
  STRENGTH_LEAGUES,
  type StrengthLeagueId,
} from "@/schemas/user-profile-screen.schema";
import {
  MUSCLE_BENCHMARK_CONFIGS,
  calculateNextLeagueProgress,
  calculateOverallRank,
  type RankingMuscleGroup,
  type MuscleRankItem,
  type LeaderboardUser,
} from "@/schemas/ranking.schema";

export type RankingActiveView = "chart" | "leaderboard" | "standards";
export type BodyOrientation = "front" | "back";

export const INITIAL_MUSCLE_RECORDS: Record<RankingMuscleGroup, number> = {
  chest: 100, // 100 kg na klatę = Diamentowa Liga!
  back: 110,
  legs: 130,
  shoulders: 50,
  biceps: 35,
  triceps: 45,
  abs: 55,
};

const DEFAULT_LEADERBOARD_USERS: LeaderboardUser[] = [
  {
    id: "user_cur",
    rank: 1,
    displayName: "Kacper (Ty)",
    league: STRENGTH_LEAGUES.diamond,
    totalScore: 5490,
    topMuscleNamePl: "Klatka piersiowa",
    topRecordSummary: "100 kg (Diament)",
    isCurrentUser: true,
  },
  {
    id: "user_02",
    rank: 2,
    displayName: "Mateusz K.",
    league: STRENGTH_LEAGUES.diamond,
    totalScore: 5320,
    topMuscleNamePl: "Klatka piersiowa",
    topRecordSummary: "105 kg (Diament)",
    isCurrentUser: false,
  },
  {
    id: "user_03",
    rank: 3,
    displayName: "Jakub W.",
    league: STRENGTH_LEAGUES.master,
    totalScore: 5810,
    topMuscleNamePl: "Plecy",
    topRecordSummary: "185 kg (Mistrz)",
    isCurrentUser: false,
  },
  {
    id: "user_04",
    rank: 4,
    displayName: "Michał S.",
    league: STRENGTH_LEAGUES.platinum,
    totalScore: 4650,
    topMuscleNamePl: "Nogi",
    topRecordSummary: "125 kg (Platyna)",
    isCurrentUser: false,
  },
  {
    id: "user_05",
    rank: 5,
    displayName: "Tomasz Z.",
    league: STRENGTH_LEAGUES.gold,
    totalScore: 3900,
    topMuscleNamePl: "Klatka piersiowa",
    topRecordSummary: "85 kg (Złoto)",
    isCurrentUser: false,
  },
  {
    id: "user_06",
    rank: 6,
    displayName: "Piotr N.",
    league: STRENGTH_LEAGUES.gold,
    totalScore: 3780,
    topMuscleNamePl: "Plecy",
    topRecordSummary: "115 kg (Złoto)",
    isCurrentUser: false,
  },
  {
    id: "user_07",
    rank: 7,
    displayName: "Adam L.",
    league: STRENGTH_LEAGUES.silver,
    totalScore: 3150,
    topMuscleNamePl: "Nogi",
    topRecordSummary: "75 kg (Srebro)",
    isCurrentUser: false,
  },
];

export function useRankingScreen() {
  const [activeView, setActiveView] = useState<RankingActiveView>("chart");
  const [bodyOrientation, setBodyOrientation] =
    useState<BodyOrientation>("front");
  const [selectedMuscle, setSelectedMuscle] =
    useState<RankingMuscleGroup>("chest");
  const [muscleRecords, setMuscleRecords] = useState<
    Record<RankingMuscleGroup, number>
  >(INITIAL_MUSCLE_RECORDS);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<
    "all" | StrengthLeagueId
  >("all");
  const [isStandardsModalOpen, setIsStandardsModalOpen] =
    useState<boolean>(false);

  const rawOnboarding = useOnboardingStore((s) => s.onboardingData);
  const userDisplayName = rawOnboarding?.name?.trim() || "Kacper";

  const toggleBodyOrientation = useCallback(() => {
    setBodyOrientation((prev) => (prev === "front" ? "back" : "front"));
  }, []);

  const selectMuscleWithSideSync = useCallback(
    (muscle: RankingMuscleGroup) => {
      setSelectedMuscle(muscle);
      const config = MUSCLE_BENCHMARK_CONFIGS[muscle];
      if (config && config.viewSide !== bodyOrientation) {
        setBodyOrientation(config.viewSide);
      }
    },
    [bodyOrientation],
  );

  const updateMuscleRecord = useCallback(
    (muscle: RankingMuscleGroup, value: number, isDelta = false) => {
      setMuscleRecords((prev) => {
        const current = prev[muscle] ?? 0;
        const nextVal = isDelta ? Math.max(0, current + value) : Math.max(0, value);
        return {
          ...prev,
          [muscle]: nextVal,
        };
      });
    },
    [],
  );

  const resetMuscleRecords = useCallback(() => {
    setMuscleRecords(INITIAL_MUSCLE_RECORDS);
  }, []);

  const muscleRanks = useMemo<MuscleRankItem[]>(() => {
    const orderedMuscles: RankingMuscleGroup[] = [
      "chest",
      "shoulders",
      "biceps",
      "triceps",
      "abs",
      "back",
      "legs",
    ];

    return orderedMuscles.map((muscle) => {
      const config = MUSCLE_BENCHMARK_CONFIGS[muscle];
      const kg = muscleRecords[muscle] ?? 0;
      const progress = calculateNextLeagueProgress(muscle, kg);

      return {
        muscle,
        namePl: config.namePl,
        emoji: config.emoji,
        benchmarkExercise: config.exerciseName,
        viewSide: config.viewSide,
        currentKg: kg,
        league: progress.currentLeague,
        nextLeague: progress.nextLeague,
        kgRemaining: progress.kgRemaining,
        progressPercent: progress.progressPercent,
      };
    });
  }, [muscleRecords]);

  const selectedMuscleRank = useMemo<MuscleRankItem>(() => {
    const found = muscleRanks.find((m) => m.muscle === selectedMuscle);
    return found ?? muscleRanks[0];
  }, [muscleRanks, selectedMuscle]);

  const overallRank = useMemo(() => {
    return calculateOverallRank(muscleRecords);
  }, [muscleRecords]);

  const leaderboard = useMemo<LeaderboardUser[]>(() => {
    return DEFAULT_LEADERBOARD_USERS.map((user) => {
      if (user.isCurrentUser) {
        return {
          ...user,
          displayName: `${userDisplayName} (Ty)`,
          league: overallRank.overallLeague,
          totalScore: overallRank.totalScore,
          topRecordSummary: `${muscleRecords.chest} kg (${selectedMuscleRank.league.name.replace(" Liga", "")})`,
        };
      }
      return user;
    });
  }, [
    userDisplayName,
    overallRank,
    muscleRecords.chest,
    selectedMuscleRank.league.name,
  ]);

  const filteredLeaderboard = useMemo(() => {
    if (selectedLeagueFilter === "all") return leaderboard;
    return leaderboard.filter((u) => u.league.id === selectedLeagueFilter);
  }, [leaderboard, selectedLeagueFilter]);

  const openStandardsModal = useCallback(() => {
    setIsStandardsModalOpen(true);
  }, []);

  const closeStandardsModal = useCallback(() => {
    setIsStandardsModalOpen(false);
  }, []);

  return {
    activeView,
    setActiveView,
    bodyOrientation,
    setBodyOrientation,
    toggleBodyOrientation,
    selectedMuscle,
    setSelectedMuscle: selectMuscleWithSideSync,
    muscleRecords,
    updateMuscleRecord,
    resetMuscleRecords,
    muscleRanks,
    selectedMuscleRank,
    overallRank,
    leaderboard,
    filteredLeaderboard,
    selectedLeagueFilter,
    setSelectedLeagueFilter,
    isStandardsModalOpen,
    openStandardsModal,
    closeStandardsModal,
    userDisplayName,
  };
}

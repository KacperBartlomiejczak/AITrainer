import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { HumanBodyDiagram } from "../HumanBodyDiagram";
import { MuscleRankCard } from "../MuscleRankCard";
import { MuscleSelectorPills } from "../MuscleSelectorPills";
import { RankingLeaderboard } from "../RankingLeaderboard";
import { RankingHeader } from "../RankingHeader";
import { LeagueStandardsModal } from "../LeagueStandardsModal";
import { MuscleStandardCard } from "../MuscleStandardCard";
import { RankingStandardsView } from "../RankingStandardsView";
import { STRENGTH_LEAGUES } from "@/schemas/user-profile-screen.schema";
import {
  MUSCLE_BENCHMARK_CONFIGS,
  type MuscleRankItem,
  type LeaderboardUser,
} from "@/schemas/ranking.schema";

const MOCK_CHEST_RANK: MuscleRankItem = {
  muscle: "chest",
  namePl: "Klatka piersiowa",
  emoji: "🫁",
  benchmarkExercise: "Wyciskanie sztangi leżąc",
  viewSide: "front",
  currentKg: 100,
  league: STRENGTH_LEAGUES.diamond,
  nextLeague: STRENGTH_LEAGUES.master,
  kgRemaining: 20,
  progressPercent: 0,
};

const MOCK_RANKS: MuscleRankItem[] = [
  MOCK_CHEST_RANK,
  {
    muscle: "back",
    namePl: "Plecy",
    emoji: "🔙",
    benchmarkExercise: "Martwy ciąg",
    viewSide: "back",
    currentKg: 110,
    league: STRENGTH_LEAGUES.gold,
    nextLeague: STRENGTH_LEAGUES.platinum,
    kgRemaining: 20,
    progressPercent: 33,
  },
  {
    muscle: "legs",
    namePl: "Nogi",
    emoji: "🦵",
    benchmarkExercise: "Przysiad ze sztangą",
    viewSide: "front",
    currentKg: 130,
    league: STRENGTH_LEAGUES.diamond,
    nextLeague: STRENGTH_LEAGUES.master,
    kgRemaining: 30,
    progressPercent: 0,
  },
  {
    muscle: "shoulders",
    namePl: "Barki",
    emoji: "🤸",
    benchmarkExercise: "Wyciskanie żołnierskie (OHP)",
    viewSide: "front",
    currentKg: 50,
    league: STRENGTH_LEAGUES.gold,
    nextLeague: STRENGTH_LEAGUES.platinum,
    kgRemaining: 10,
    progressPercent: 33,
  },
  {
    muscle: "biceps",
    namePl: "Biceps",
    emoji: "💪",
    benchmarkExercise: "Uginanie ramion ze sztangą",
    viewSide: "front",
    currentKg: 35,
    league: STRENGTH_LEAGUES.gold,
    nextLeague: STRENGTH_LEAGUES.platinum,
    kgRemaining: 5,
    progressPercent: 50,
  },
  {
    muscle: "triceps",
    namePl: "Triceps",
    emoji: "🦾",
    benchmarkExercise: "Dipsy na poręczach z obciążeniem",
    viewSide: "back",
    currentKg: 45,
    league: STRENGTH_LEAGUES.gold,
    nextLeague: STRENGTH_LEAGUES.platinum,
    kgRemaining: 10,
    progressPercent: 33,
  },
  {
    muscle: "abs",
    namePl: "Brzuch",
    emoji: "🎯",
    benchmarkExercise: "Allahy na wyciągu klęcząc",
    viewSide: "front",
    currentKg: 55,
    league: STRENGTH_LEAGUES.gold,
    nextLeague: STRENGTH_LEAGUES.platinum,
    kgRemaining: 10,
    progressPercent: 33,
  },
];

const MOCK_USERS: LeaderboardUser[] = [
  {
    id: "u1",
    rank: 1,
    displayName: "Kacper (Ty)",
    league: STRENGTH_LEAGUES.diamond,
    totalScore: 4890,
    topMuscleNamePl: "Klatka piersiowa",
    topRecordSummary: "100 kg (Diament)",
    isCurrentUser: true,
  },
  {
    id: "u2",
    rank: 2,
    displayName: "Mateusz K.",
    league: STRENGTH_LEAGUES.gold,
    totalScore: 3600,
    topMuscleNamePl: "Klatka piersiowa",
    topRecordSummary: "85 kg (Złoto)",
    isCurrentUser: false,
  },
];

describe("Ranking Components", () => {
  describe("HumanBodyDiagram", () => {
    it("renders body diagram and handles muscle selection", async () => {
      const onSelectMock = jest.fn();
      const onToggleMock = jest.fn();

      const { getByTestId, unmount } = await render(
        <HumanBodyDiagram
          orientation="front"
          selectedMuscle="chest"
          muscleRanks={MOCK_RANKS}
          onSelectMuscle={onSelectMock}
          onToggleOrientation={onToggleMock}
        />,
      );

      expect(getByTestId("body-diagram")).toBeTruthy();
      expect(getByTestId("muscle-path-chest")).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId("muscle-path-chest"));
      });
      expect(onSelectMock).toHaveBeenCalledWith("chest");

      await act(async () => {
        fireEvent.press(getByTestId("body-orientation-toggle"));
      });
      expect(onToggleMock).toHaveBeenCalledTimes(1);

      unmount();
    });
  });

  describe("MuscleRankCard", () => {
    it("displays muscle information and allows delta changes", async () => {
      const onUpdateKgMock = jest.fn();

      const { getByTestId, getByText, unmount } = await render(
        <MuscleRankCard
          item={MOCK_CHEST_RANK}
          onUpdateKg={onUpdateKgMock}
        />,
      );

      expect(getByText("Klatka piersiowa")).toBeTruthy();
      expect(getByText(/100 kg/)).toBeTruthy();
      expect(getByText(/Diamentowa Liga/)).toBeTruthy();
      expect(getByText(/Wyciskanie sztangi leżąc/)).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId("btn-increase-kg"));
      });
      expect(onUpdateKgMock).toHaveBeenCalledWith("chest", 5, true);

      await act(async () => {
        fireEvent.press(getByTestId("btn-decrease-kg"));
      });
      expect(onUpdateKgMock).toHaveBeenCalledWith("chest", -5, true);

      unmount();
    });
  });

  describe("MuscleSelectorPills", () => {
    it("renders all 6 muscle pills and calls onSelect", async () => {
      const onSelectMock = jest.fn();

      const { getByTestId, unmount } = await render(
        <MuscleSelectorPills
          ranks={MOCK_RANKS}
          selectedMuscle="chest"
          onSelectMuscle={onSelectMock}
        />,
      );

      expect(getByTestId("muscle-pill-chest")).toBeTruthy();
      expect(getByTestId("muscle-pill-legs")).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId("muscle-pill-legs"));
      });
      expect(onSelectMock).toHaveBeenCalledWith("legs");

      unmount();
    });
  });

  describe("RankingLeaderboard", () => {
    it("renders leaderboard users and handles filter changes", async () => {
      const onFilterMock = jest.fn();

      const { getByText, getByTestId, unmount } = await render(
        <RankingLeaderboard
          users={MOCK_USERS}
          selectedFilter="all"
          onSelectFilter={onFilterMock}
        />,
      );

      expect(getByText("Kacper (Ty)")).toBeTruthy();
      expect(getByText("Mateusz K.")).toBeTruthy();
      expect(getByTestId("leaderboard-filter-diamond")).toBeTruthy();
      expect(getByTestId("leaderboard-filter-titan")).toBeTruthy();
      expect(getByTestId("leaderboard-filter-bronze")).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId("leaderboard-filter-diamond"));
      });
      expect(onFilterMock).toHaveBeenCalledWith("diamond");

      await act(async () => {
        fireEvent.press(getByTestId("leaderboard-filter-titan"));
      });
      expect(onFilterMock).toHaveBeenCalledWith("titan");

      await act(async () => {
        fireEvent.press(getByTestId("leaderboard-filter-bronze"));
      });
      expect(onFilterMock).toHaveBeenCalledWith("bronze");

      unmount();
    });
  });

  describe("RankingHeader", () => {
    it("renders overall league, score and view switcher", async () => {
      const onViewChangeMock = jest.fn();
      const onOpenStandardsMock = jest.fn();

      const { getByText, getByTestId, unmount } = await render(
        <RankingHeader
          overallLeague={STRENGTH_LEAGUES.diamond}
          totalScore={4890}
          activeView="chart"
          onViewChange={onViewChangeMock}
          onOpenStandards={onOpenStandardsMock}
        />,
      );

      expect(getByText(/Diamentowa Liga/)).toBeTruthy();
      expect(getByText(/4.*890/)).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId("view-tab-leaderboard"));
      });
      expect(onViewChangeMock).toHaveBeenCalledWith("leaderboard");

      await act(async () => {
        fireEvent.press(getByTestId("btn-open-standards"));
      });
      expect(onOpenStandardsMock).toHaveBeenCalledTimes(1);

      unmount();
    });
  });

  describe("LeagueStandardsModal", () => {
    it("renders all league tiers when visible", async () => {
      const onCloseMock = jest.fn();

      const { getByText, getByTestId, unmount } = await render(
        <LeagueStandardsModal
          visible={true}
          onClose={onCloseMock}
        />,
      );

      expect(getByText("Diamentowa Liga")).toBeTruthy();
      expect(getByText("Mistrzowska Liga")).toBeTruthy();
      expect(getByText("Tytanowa Liga")).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId("btn-close-standards-modal"));
      });
      expect(onCloseMock).toHaveBeenCalledTimes(1);

      unmount();
    });
  });

  describe("MuscleStandardCard", () => {
    it("renders muscle benchmark config and threshold weights", async () => {
      const { getByText, getByTestId, unmount } = await render(
        <MuscleStandardCard config={MUSCLE_BENCHMARK_CONFIGS.chest} />,
      );

      expect(getByTestId("standard-card-chest")).toBeTruthy();
      expect(getByText("Klatka piersiowa")).toBeTruthy();
      expect(getByText("Wyciskanie sztangi leżąc")).toBeTruthy();
      expect(getByText("Przód")).toBeTruthy();
      expect(getByText("≥ 100 kg")).toBeTruthy();

      unmount();
    });
  });

  describe("RankingStandardsView", () => {
    it("renders all standards and filters by selected muscle chip", async () => {
      const { getByText, getByTestId, queryByTestId, unmount } = await render(
        <RankingStandardsView />,
      );

      expect(getByTestId("ranking-standards-view")).toBeTruthy();
      expect(getByText(/Oficjalne Standardy Siłowe/)).toBeTruthy();
      expect(getByTestId("standard-card-chest")).toBeTruthy();
      expect(getByTestId("standard-card-legs")).toBeTruthy();
      expect(getByTestId("standard-card-back")).toBeTruthy();

      // Filter by biceps
      await act(async () => {
        fireEvent.press(getByTestId("standards-filter-biceps"));
      });

      expect(getByTestId("standard-card-biceps")).toBeTruthy();
      expect(queryByTestId("standard-card-chest")).toBeNull();

      // Filter back to all
      await act(async () => {
        fireEvent.press(getByTestId("standards-filter-all"));
      });

      expect(getByTestId("standard-card-chest")).toBeTruthy();
      expect(getByTestId("standard-card-biceps")).toBeTruthy();

      unmount();
    });
  });
});


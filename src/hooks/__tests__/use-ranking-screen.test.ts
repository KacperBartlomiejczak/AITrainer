import { act, renderHook } from "@testing-library/react-native";
import { useRankingScreen } from "../use-ranking-screen";

describe("useRankingScreen", () => {
  it("initializes with default chest record at 100 kg in Diamond League", async () => {
    const { result, unmount } = await renderHook(() => useRankingScreen());

    expect(result.current.selectedMuscle).toBe("chest");
    expect(result.current.selectedMuscleRank.currentKg).toBe(100);
    expect(result.current.selectedMuscleRank.league.id).toBe("diamond");
    expect(result.current.selectedMuscleRank.league.name).toBe("Diamentowa Liga");
    expect(result.current.selectedMuscleRank.nextLeague?.id).toBe("master");
    expect(result.current.selectedMuscleRank.kgRemaining).toBe(20);

    unmount();
  });

  it("switches active views (chart, leaderboard, standards)", async () => {
    const { result, unmount } = await renderHook(() => useRankingScreen());

    expect(result.current.activeView).toBe("chart");

    await act(async () => {
      result.current.setActiveView("leaderboard");
    });
    expect(result.current.activeView).toBe("leaderboard");

    await act(async () => {
      result.current.setActiveView("standards");
    });
    expect(result.current.activeView).toBe("standards");

    unmount();
  });

  it("toggles body orientation between front and back", async () => {
    const { result, unmount } = await renderHook(() => useRankingScreen());

    expect(result.current.bodyOrientation).toBe("front");

    await act(async () => {
      result.current.toggleBodyOrientation();
    });
    expect(result.current.bodyOrientation).toBe("back");

    await act(async () => {
      result.current.toggleBodyOrientation();
    });
    expect(result.current.bodyOrientation).toBe("front");

    unmount();
  });

  it("allows selecting different muscle groups", async () => {
    const { result, unmount } = await renderHook(() => useRankingScreen());

    await act(async () => {
      result.current.setSelectedMuscle("legs");
    });
    expect(result.current.selectedMuscle).toBe("legs");
    expect(result.current.selectedMuscleRank.muscle).toBe("legs");
    expect(result.current.selectedMuscleRank.currentKg).toBe(130);
    expect(result.current.selectedMuscleRank.league.id).toBe("diamond");

    unmount();
  });

  it("updates muscle record and recalculates league live", async () => {
    const { result, unmount } = await renderHook(() => useRankingScreen());

    // Increase chest from 100kg to 120kg (promotes to Master)
    await act(async () => {
      result.current.updateMuscleRecord("chest", 120, false);
    });
    expect(result.current.selectedMuscleRank.currentKg).toBe(120);
    expect(result.current.selectedMuscleRank.league.id).toBe("master");
    expect(result.current.selectedMuscleRank.league.name).toBe("Mistrzowska Liga");

    // Decrease chest by 40kg (down to 80kg -> Gold League)
    await act(async () => {
      result.current.updateMuscleRecord("chest", -40, true);
    });
    expect(result.current.selectedMuscleRank.currentKg).toBe(80);
    expect(result.current.selectedMuscleRank.league.id).toBe("gold");

    unmount();
  });

  it("filters leaderboard by league", async () => {
    const { result, unmount } = await renderHook(() => useRankingScreen());

    expect(result.current.selectedLeagueFilter).toBe("all");
    const allCount = result.current.filteredLeaderboard.length;
    expect(allCount).toBeGreaterThan(0);

    await act(async () => {
      result.current.setSelectedLeagueFilter("diamond");
    });
    expect(result.current.selectedLeagueFilter).toBe("diamond");
    expect(
      result.current.filteredLeaderboard.every((u) => u.league.id === "diamond"),
    ).toBe(true);

    unmount();
  });

  it("manages standards modal visibility", async () => {
    const { result, unmount } = await renderHook(() => useRankingScreen());

    expect(result.current.isStandardsModalOpen).toBe(false);

    await act(async () => {
      result.current.openStandardsModal();
    });
    expect(result.current.isStandardsModalOpen).toBe(true);

    await act(async () => {
      result.current.closeStandardsModal();
    });
    expect(result.current.isStandardsModalOpen).toBe(false);

    unmount();
  });
});

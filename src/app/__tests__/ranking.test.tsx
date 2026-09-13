import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import RankingScreen from "../ranking";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("RankingScreen", () => {
  it("renders ranking screen with header, body diagram, and pill navbar", async () => {
    const { getByText, getAllByText, getByTestId, unmount } = await render(<RankingScreen />);

    expect(getByText("System Rankingowy 🏆")).toBeTruthy();
    expect(getByText(/Twoja Ogólna Ranga Siłowa/)).toBeTruthy();
    expect(getByTestId("pill-navbar")).toBeTruthy();
    expect(getByTestId("pill-nav-ranking")).toBeTruthy();
    expect(getByTestId("body-diagram")).toBeTruthy();
    expect(getAllByText("Klatka piersiowa").length).toBeGreaterThanOrEqual(1);

    unmount();
  });

  it("switches to leaderboard view on tab press", async () => {
    const { getByTestId, getByText, unmount } = await render(<RankingScreen />);

    const leaderboardTab = getByTestId("view-tab-leaderboard");
    await act(async () => {
      fireEvent.press(leaderboardTab);
    });

    expect(getByText(/Wszyscy 🌍/)).toBeTruthy();
    expect(getByText(/Kacper \(Ty\)/)).toBeTruthy();

    unmount();
  });

  it("switches to standards view and renders all muscle standards", async () => {
    const { getByTestId, getByText, unmount } = await render(<RankingScreen />);

    const standardsTab = getByTestId("view-tab-standards");
    await act(async () => {
      fireEvent.press(standardsTab);
    });

    expect(getByTestId("ranking-standards-view")).toBeTruthy();
    expect(getByText(/Oficjalne Standardy Siłowe AI Trainer/)).toBeTruthy();
    expect(getByTestId("standard-card-chest")).toBeTruthy();

    unmount();
  });

  it("switches to standards view and allows opening modal", async () => {
    const { getByTestId, getByText, unmount } = await render(<RankingScreen />);

    const standardsBtn = getByTestId("btn-open-standards");
    await act(async () => {
      fireEvent.press(standardsBtn);
    });

    expect(getByText("Zasady Lig i Rang Siłowych")).toBeTruthy();

    const closeBtn = getByTestId("btn-close-standards-modal");
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    unmount();
  });

  it("navigates to leaderboard and standards from quick-jump cards in chart view", async () => {
    const { getByTestId, unmount } = await render(<RankingScreen />);

    // Jump to leaderboard from shortcut
    const shortcutLeaderboard = getByTestId("shortcut-to-leaderboard");
    await act(async () => {
      fireEvent.press(shortcutLeaderboard);
    });
    expect(getByTestId("ranking-leaderboard-view")).toBeTruthy();

    // Switch back to chart
    await act(async () => {
      fireEvent.press(getByTestId("view-tab-chart"));
    });

    // Jump to standards from shortcut
    const shortcutStandards = getByTestId("shortcut-to-standards");
    await act(async () => {
      fireEvent.press(shortcutStandards);
    });
    expect(getByTestId("ranking-standards-view")).toBeTruthy();

    unmount();
  });
});


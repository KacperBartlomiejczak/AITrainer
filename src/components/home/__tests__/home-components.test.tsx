import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { HomeHeader } from "../HomeHeader";
import { AiCoachCard } from "../AiCoachCard";
import { TodayWorkoutCard } from "../TodayWorkoutCard";
import { WeeklyProgressCard } from "../WeeklyProgressCard";
import { QuickActionsGrid } from "../QuickActionsGrid";
import { RecentActivitySection } from "../RecentActivitySection";
import { FriendsWorkoutFeed } from "../FriendsWorkoutFeed";
import { MOCK_FRIENDS_FEED } from "@/lib/mock-friends-feed";

describe("Home Screen Components", () => {
  const mockUser = {
    id: "usr_1",
    name: "Kacper Bartłomiejczak",
    avatarUrl: "",
    streakDays: 5,
    weeklyGoal: 4,
    completedWorkoutsThisWeek: 3,
    experienceLevel: "beginner" as const,
  };

  it("renders HomeHeader with greeting, streak and user initials", async () => {
    await render(<HomeHeader user={mockUser} />);
    expect(screen.getByText("Cześć, Kacper Bartłomiejczak! 👋")).toBeTruthy();
    expect(screen.getByText("🔥 5 dni")).toBeTruthy();
    expect(screen.getByText("KB")).toBeTruthy();
  });

  it("triggers onPressProfile when clicking avatar in HomeHeader", async () => {
    const onPressProfileMock = jest.fn();
    await render(<HomeHeader user={mockUser} onPressProfile={onPressProfileMock} />);
    const profileButton = screen.getByTestId("profile-button");
    fireEvent.press(profileButton);
    expect(onPressProfileMock).toHaveBeenCalledTimes(1);
  });

  it("renders AiCoachCard and handles coach action", async () => {
    const onAskCoachMock = jest.fn();
    const mockTip = {
      id: "tip_1",
      title: "Wskazówka",
      message: "Kontroluj fazę negatywną!",
      category: "technique" as const,
      suggestedAction: "Zapytaj Trenera",
    };

    await render(<AiCoachCard tip={mockTip} onAskCoach={onAskCoachMock} />);
    expect(screen.getByText("Kontroluj fazę negatywną!")).toBeTruthy();

    const askButton = screen.getByText("💬 Zapytaj Trenera");
    fireEvent.press(askButton);
    expect(onAskCoachMock).toHaveBeenCalledTimes(1);
  });

  it("renders TodayWorkoutCard with muscle groups and handles start workout", async () => {
    const onStartMock = jest.fn();
    const mockWorkout = {
      id: "wkt_1",
      title: "Klatka + Triceps (FBW A)",
      subtitle: "Trening siłowy",
      targetMuscleGroups: ["Klatka piersiowa", "Triceps"],
      estimatedDurationMinutes: 50,
      exerciseCount: 4,
      difficulty: "moderate" as const,
      status: "not_started" as const,
    };

    await render(
      <TodayWorkoutCard workout={mockWorkout} onStartWorkout={onStartMock} />
    );
    expect(screen.getByText("Klatka + Triceps (FBW A)")).toBeTruthy();
    expect(screen.getByText("Klatka piersiowa")).toBeTruthy();
    expect(screen.getByText("Triceps")).toBeTruthy();

    const startButton = screen.getByText("Rozpocznij Trening 🔥");
    fireEvent.press(startButton);
    expect(onStartMock).toHaveBeenCalledWith("wkt_1");
  });

  it("renders WeeklyProgressCard with completion progress", async () => {
    const mockDays = [
      { dayLabel: "Pn", dateNumber: 8, status: "completed" as const, isToday: false },
      { dayLabel: "Wt", dateNumber: 9, status: "rest" as const, isToday: false },
      { dayLabel: "Śr", dateNumber: 10, status: "completed" as const, isToday: false },
      { dayLabel: "Czw", dateNumber: 11, status: "completed" as const, isToday: false },
      { dayLabel: "Pt", dateNumber: 12, status: "today_pending" as const, isToday: true },
      { dayLabel: "Sob", dateNumber: 13, status: "upcoming" as const, isToday: false },
      { dayLabel: "Nd", dateNumber: 14, status: "rest" as const, isToday: false },
    ];

    await render(
      <WeeklyProgressCard completedCount={3} targetCount={4} days={mockDays} />
    );
    expect(
      screen.getByText("3 z 4 treningów ukończone")
    ).toBeTruthy();
    expect(screen.getByText("75%")).toBeTruthy();
  });

  it("renders QuickActionsGrid and handles navigation press", async () => {
    const onSelectMock = jest.fn();
    const mockActions = [
      {
        id: "qa_1",
        title: "Pusty Trening",
        description: "Zapisuj serie",
        iconName: "PlusCircle",
        route: "/workout/active",
      },
    ];

    await render(
      <QuickActionsGrid actions={mockActions} onSelectAction={onSelectMock} />
    );
    expect(screen.getByText("Pusty Trening")).toBeTruthy();

    fireEvent.press(screen.getByText("Pusty Trening"));
    expect(onSelectMock).toHaveBeenCalledWith("/workout/active");
  });

  it("renders RecentActivitySection with duration, completed exercises and the workout photo", async () => {
    const mockActivity = {
      id: "wks_1",
      title: "FBW B — Całe ciało",
      completedAt: "Wczoraj, 19:15",
      durationMinutes: 58,
      completedExerciseCount: 4,
      totalExerciseCount: 5,
      photoUri: "file:///document/workout-photos/wks_1-1.jpg",
    };

    await render(<RecentActivitySection activity={mockActivity} />);
    expect(screen.getByText("FBW B — Całe ciało")).toBeTruthy();
    expect(screen.getByText("58 min")).toBeTruthy();
    expect(screen.getByText("4/5 ćwiczeń")).toBeTruthy();
    expect(screen.getByTestId("recent-activity-photo").props.source).toEqual({ uri: mockActivity.photoUri });
  });

  it("renders RecentActivitySection without a photo when the workout has none", async () => {
    await render(
      <RecentActivitySection
        activity={{
          id: "wks_2",
          title: "FBW A — Całe ciało",
          completedAt: "Dziś, 08:00",
          durationMinutes: 40,
          completedExerciseCount: 5,
          totalExerciseCount: 5,
          photoUri: null,
        }}
      />,
    );
    expect(screen.getByText("FBW A — Całe ciało")).toBeTruthy();
    expect(screen.queryByTestId("recent-activity-photo")).toBeNull();
  });

  it("renders an empty RecentActivitySection for a user without workouts", async () => {
    await render(<RecentActivitySection activity={null} />);
    expect(screen.getByTestId("recent-activity-empty")).toBeTruthy();
    expect(screen.getByText("Brak treningów")).toBeTruthy();
  });

  it("renders the friends feed with photos, highlights and reactions", async () => {
    await render(<FriendsWorkoutFeed items={[...MOCK_FRIENDS_FEED]} />);

    expect(screen.getByText("Treningi Znajomych")).toBeTruthy();
    expect(screen.getByText("Ola Nowak")).toBeTruthy();
    expect(screen.getByText("Pierwszy raz przysiad z 60 kg! 🎉")).toBeTruthy();
    expect(screen.getByTestId("friend-feed-photo-feed_ola_01")).toBeTruthy();
    expect(screen.queryByTestId("friend-feed-photo-feed_kasia_01")).toBeNull();
    expect(screen.getByText("❤️ 14")).toBeTruthy();
    expect(screen.getByText("48 min • 5 ćwiczeń")).toBeTruthy();
  });

  it("renders nothing for an empty friends feed", async () => {
    await render(<FriendsWorkoutFeed items={[]} />);
    expect(screen.queryByText("Treningi Znajomych")).toBeNull();
  });
});

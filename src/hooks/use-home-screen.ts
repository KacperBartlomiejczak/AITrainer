import { useState, useCallback, useMemo } from "react";
import { MOCK_FRIENDS_FEED } from "@/lib/mock-friends-feed";
import { toRecentActivity } from "@/lib/workout-history-mappers";
import { HomeScreenDataSchema, type HomeScreenData } from "@/schemas/home.schema";
import type { WorkoutHistoryEntry } from "@/schemas/workout-history.schema";
import { useWorkoutHistory } from "./use-workout-history";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { OnboardingFormSchema } from "@/schemas/onboarding.schema";

/** Sections without a data source yet stay mocked; recent activity comes from the database. */
const INITIAL_MOCK_HOME_DATA: Omit<HomeScreenData, "recentActivity" | "friendsFeed"> = {
  user: {
    id: "usr_kacper_01",
    name: "Kacper",
    avatarUrl: "",
    streakDays: 4,
    weeklyGoal: 4,
    completedWorkoutsThisWeek: 3,
    experienceLevel: "beginner",
  },
  todayWorkout: {
    id: "wkt_today_01",
    title: "Klatka + Triceps (FBW A)",
    subtitle: "Trening siłowy • 4 ćwiczenia",
    targetMuscleGroups: ["Klatka piersiowa", "Triceps", "Barki"],
    estimatedDurationMinutes: 50,
    exerciseCount: 4,
    difficulty: "moderate",
    status: "not_started",
    exercisesPreview: [
      {
        id: "ex_1",
        name: "Wyciskanie sztangi na ławce poziomej",
        sets: 4,
        targetReps: "8-10",
        muscleGroup: "Klatka piersiowa",
      },
      {
        id: "ex_2",
        name: "Wyciskanie hantli na skosie dodatnim",
        sets: 3,
        targetReps: "10-12",
        muscleGroup: "Klatka piersiowa",
      },
      {
        id: "ex_3",
        name: "Wznosy ramion bokiem z hantlami",
        sets: 4,
        targetReps: "12-15",
        muscleGroup: "Barki",
      },
      {
        id: "ex_4",
        name: "Prostowanie ramion na wyciągu (triceps)",
        sets: 3,
        targetReps: "10-12",
        muscleGroup: "Triceps",
      },
    ],
  },
  weeklyProgress: {
    completedCount: 3,
    targetCount: 4,
    days: [
      { dayLabel: "Pn", dateNumber: 8, status: "completed", isToday: false },
      { dayLabel: "Wt", dateNumber: 9, status: "rest", isToday: false },
      { dayLabel: "Śr", dateNumber: 10, status: "completed", isToday: false },
      { dayLabel: "Czw", dateNumber: 11, status: "completed", isToday: false },
      { dayLabel: "Pt", dateNumber: 12, status: "today_pending", isToday: true },
      { dayLabel: "Sob", dateNumber: 13, status: "upcoming", isToday: false },
      { dayLabel: "Nd", dateNumber: 14, status: "rest", isToday: false },
    ],
  },
  aiCoachTip: {
    id: "tip_daily_01",
    title: "Porada Twojego Trenera AI",
    message:
      "Świetna seria w tym tygodniu! Dzisiaj skup się na kontroli fazy ekscentrycznej (opuszczania) przy wyciskaniu sztangi. To klucz do budowy stabilności barków.",
    category: "technique",
    suggestedAction: "Zapytaj trenera AI o szczegóły",
  },
  quickActions: [
    {
      id: "qa_quick_workout",
      title: "Pusty Trening",
      description: "Zapisuj serie na bieżąco",
      iconName: "PlusCircle",
      route: "/workout/active",
      badgeText: "Szybki start",
    },
    {
      id: "qa_exercises_catalog",
      title: "Baza Ćwiczeń",
      description: "Instrukcje wideo i atlas",
      iconName: "Dumbbell",
      route: "/exercises",
    },
    {
      id: "qa_ai_planner",
      title: "Plan AI",
      description: "Personalizowany harmonogram",
      iconName: "Sparkles",
      route: "/ai-plan",
      badgeText: "AI",
    },
    {
      id: "qa_workout_history",
      title: "Historia & Statystyki",
      description: "Wykresy i progres",
      iconName: "History",
      route: "/history",
    },
  ],
};

function buildHomeScreenData(
  latestWorkout: WorkoutHistoryEntry | undefined,
  now: Date,
): HomeScreenData {
  const candidate: HomeScreenData = {
    ...INITIAL_MOCK_HOME_DATA,
    recentActivity: latestWorkout ? toRecentActivity(latestWorkout, now) : null,
    friendsFeed: [...MOCK_FRIENDS_FEED],
  };
  const parsed = HomeScreenDataSchema.safeParse(candidate);
  if (!parsed.success) {
    console.warn("[home] Home screen data failed validation", { raw: candidate });
  }
  return parsed.success ? parsed.data : candidate;
}

export function useHomeScreen() {
  const history = useWorkoutHistory();
  const { reload: reloadHistory } = history;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const latestWorkout = history.entries[0];

  const data = useMemo(() => buildHomeScreenData(latestWorkout, new Date()), [latestWorkout]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await reloadHistory();
    } finally {
      setIsRefreshing(false);
    }
  }, [reloadHistory]);

  const rawOnboardingData = useOnboardingStore((s) => s.onboardingData);

  const personalizedData = useMemo(() => {
    if (!rawOnboardingData) return data;

    // Runtime validation with Zod to prevent crashes on a corrupt/stale persisted payload
    const parsed = OnboardingFormSchema.safeParse(rawOnboardingData);
    if (!parsed.success) {
      return data;
    }

    return {
      ...data,
      user: {
        ...data.user,
        name: parsed.data.name,
      },
    };
  }, [data, rawOnboardingData]);

  return {
    data: personalizedData,
    isLoading: history.status === "loading" || isRefreshing,
    error: history.status === "error" ? "Nie udało się wczytać historii treningów. Spróbuj ponownie." : null,
    refreshData,
  };
}

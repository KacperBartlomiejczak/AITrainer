import { useState, useCallback, useMemo } from "react";
import { HomeScreenDataSchema, type HomeScreenData } from "@/schemas/home.schema";
import { useOnboardingStore } from "@/stores/onboarding.store";

const INITIAL_MOCK_HOME_DATA: HomeScreenData = {
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
  recentActivity: {
    id: "rec_prev_01",
    title: "Plecy + Biceps (FBW B)",
    completedAt: "Wczoraj, 19:15",
    durationMinutes: 58,
    totalVolumeKg: 4850,
    personalRecordsCount: 2,
  },
};

export function useHomeScreen() {
  const [data, setData] = useState<HomeScreenData>(() => {
    const parsed = HomeScreenDataSchema.safeParse(INITIAL_MOCK_HOME_DATA);
    if (parsed.success) {
      return parsed.data;
    }
    // Fallback safe defaults if validation fails
    return INITIAL_MOCK_HOME_DATA;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate network / storage delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const parsed = HomeScreenDataSchema.safeParse(INITIAL_MOCK_HOME_DATA);
      if (parsed.success) {
        setData(parsed.data);
      } else {
        console.warn("HomeScreenData validation warning:", parsed.error);
        setError("Nie udało się zaktualizować danych. Spróbuj ponownie.");
      }
    } catch {
      setError("Wystąpił błąd podczas pobierania danych.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onboardingData = useOnboardingStore((s) => s.onboardingData);

  const personalizedData = useMemo(() => {
    if (!onboardingData?.name) return data;
    return {
      ...data,
      user: {
        ...data.user,
        name: onboardingData.name,
      },
    };
  }, [data, onboardingData]);

  return {
    data: personalizedData,
    isLoading,
    error,
    refreshData,
  };
}

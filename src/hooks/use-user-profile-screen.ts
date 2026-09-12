import { useState, useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";
import {
  FITNESS_GOAL_LABELS,
  OnboardingFormSchema,
} from "@/schemas/onboarding.schema";
import {
  calculateStrengthLeague,
  type ProfileStats,
  type RoutinePhotoItem,
  type MonthlyIntensity,
  type UserRoutineCard,
  type CompletedWorkoutDetail,
  UserProfileScreenDataSchema,
} from "@/schemas/user-profile-screen.schema";

const DEFAULT_RECENT_WORKOUTS: CompletedWorkoutDetail[] = [
  {
    id: "rp_example_01",
    title: "Ostatni Trening na Siłowni 🔥",
    subtitle: "Klatka, Barki & Biceps",
    completedDate: "Wczoraj, 18:30",
    durationMinutes: 58,
    totalVolumeKg: 6450,
    imageAssetKey: "example_past_photo",
    exercises: [
      {
        id: "ex_p1",
        name: "Wyciskanie sztangi na ławce poziomej",
        setsSummary: "4 serie: 80kg×10, 90kg×8, 95kg×6, 100kg×4",
        imageAssetKey: "0025",
        isPersonalRecord: true,
        recordNote: "🔥 Nowy PR: 100 kg na klatę! Diamentowa Liga",
      },
      {
        id: "ex_p2",
        name: "Wyciskanie hantli na skosie dodatnim",
        setsSummary: "3 serie: 28kg×10, 30kg×8, 30kg×8",
        imageAssetKey: "0047",
        isPersonalRecord: false,
      },
      {
        id: "ex_p3",
        name: "Wznosy hantli bokiem",
        setsSummary: "4 serie: 12kg×15, 14kg×12, 14kg×12, 12kg×15",
        imageAssetKey: "0977",
        isPersonalRecord: false,
      },
      {
        id: "ex_p4",
        name: "Dipsy na poręczach z masą ciała",
        setsSummary: "3 serie do upadku: 12, 11, 10 powtórzeń",
        imageAssetKey: "0022",
        isPersonalRecord: false,
      },
    ],
    achievements: [
      {
        id: "ach_01",
        title: "Rekord PR 100 kg!",
        description: "Wyciskanie na klatę • Awans do Diamentowej Ligi",
        icon: "💎",
        badgeColor: "#818CF8",
      },
      {
        id: "ach_02",
        title: "Tonaż Mistrza",
        description: "Ponad 6,450 kg przeniesionego obciążenia",
        icon: "⚡",
        badgeColor: "#38BDF8",
      },
      {
        id: "ach_03",
        title: "Seria 36 dni",
        description: "Nieprzerwana regularność treningowa",
        icon: "🔥",
        badgeColor: "#F59E0B",
      },
    ],
  },
  {
    id: "rp_01",
    title: "Push Day — Klatka & Barki",
    subtitle: "Hipertrofia & Siła",
    completedDate: "3 dni temu, 19:15",
    durationMinutes: 55,
    totalVolumeKg: 5820,
    imageAssetKey: "0025",
    exercises: [
      {
        id: "ex_p5",
        name: "Wyciskanie sztangielek na ławce",
        setsSummary: "4 serie: 32kg×10, 34kg×8, 34kg×8, 32kg×10",
        imageAssetKey: "0033",
        isPersonalRecord: false,
      },
      {
        id: "ex_p6",
        name: "Rozpiętki z hantlami na skosie",
        setsSummary: "3 serie: 16kg×12, 18kg×10, 18kg×10",
        imageAssetKey: "0035",
        isPersonalRecord: false,
      },
    ],
    achievements: [
      {
        id: "ach_04",
        title: "Pompa Klatki",
        description: "Maksymalne rozciągnięcie na hantlach",
        icon: "🎯",
        badgeColor: "#38BDF8",
      },
      {
        id: "ach_05",
        title: "Intensywność 100%",
        description: "Krótkie 60s przerwy między seriami",
        icon: "⏱️",
        badgeColor: "#F59E0B",
      },
    ],
  },
  {
    id: "rp_02",
    title: "FBW Siła & Stabilizacja",
    subtitle: "Całe ciało wolne ciężary",
    completedDate: "5 dni temu, 17:45",
    durationMinutes: 45,
    totalVolumeKg: 7200,
    imageAssetKey: "0047",
    exercises: [
      {
        id: "ex_p7",
        name: "Przysiad ze sztangą na plecach",
        setsSummary: "4 serie: 100kg×8, 110kg×6, 115kg×5, 120kg×3",
        imageAssetKey: "0043",
        isPersonalRecord: true,
        recordNote: "🔥 Nowy PR: 120 kg w przysiadzie!",
      },
      {
        id: "ex_p8",
        name: "Martwy ciąg klasyczny",
        setsSummary: "3 serie: 120kg×6, 130kg×5, 140kg×4",
        imageAssetKey: "0045",
        isPersonalRecord: false,
      },
    ],
    achievements: [
      {
        id: "ach_06",
        title: "Nowy PR 120 kg!",
        description: "Rekord życiowy w przysiadzie ze sztangą",
        icon: "🏆",
        badgeColor: "#F59E0B",
      },
      {
        id: "ach_07",
        title: "Tytanowy Tonaż 7,200 kg",
        description: "Potężny fundament siły nóg i pleców",
        icon: "👑",
        badgeColor: "#EC4899",
      },
    ],
  },
  {
    id: "rp_03",
    title: "Pull Day — Plecy & Ramiona",
    subtitle: "Szerokość i gęstość grzbietu",
    completedDate: "Tydzień temu, 18:00",
    durationMinutes: 50,
    totalVolumeKg: 6100,
    imageAssetKey: "0007",
    exercises: [
      {
        id: "ex_p9",
        name: "Podciąganie na drążku z obciążeniem",
        setsSummary: "4 serie: +10kg×8, +10kg×7, +10kg×6, +5kg×8",
        imageAssetKey: "0007",
        isPersonalRecord: false,
      },
      {
        id: "ex_p10",
        name: "Wiosłowanie sztangą w opadzie",
        setsSummary: "4 serie: 75kg×10, 80kg×8, 80kg×8, 75kg×10",
        imageAssetKey: "0026",
        isPersonalRecord: false,
      },
    ],
    achievements: [
      {
        id: "ach_08",
        title: "Żelazny Grzbiet",
        description: "Wiosłowanie 80 kg w seriach roboczych",
        icon: "🥇",
        badgeColor: "#F59E0B",
      },
      {
        id: "ach_09",
        title: "Siła Chwytu",
        description: "Podciąganie z dodatkowym ciężarem +10 kg",
        icon: "🦾",
        badgeColor: "#38BDF8",
      },
    ],
  },
  {
    id: "cw_05",
    title: "Kondycja & Brzuch (Bez zdjęcia)",
    subtitle: "Core & Stabilizacja",
    completedDate: "9 dni temu, 08:30",
    durationMinutes: 30,
    totalVolumeKg: 0,
    imageAssetKey: "",
    exercises: [
      {
        id: "ex_p11",
        name: "Deska / Plank",
        setsSummary: "3 serie po 60 sekund",
        isPersonalRecord: false,
      },
      {
        id: "ex_p12",
        name: "Allahy na wyciągu klęcząc",
        setsSummary: "4 serie: 35kg×15, 40kg×12, 40kg×12, 35kg×15",
        isPersonalRecord: false,
      },
    ],
    achievements: [
      {
        id: "ach_10",
        title: "Stalowy Brzuch",
        description: "Brak przerw w seriach deski",
        icon: "⚡",
        badgeColor: "#F59E0B",
      },
    ],
  },
];

const DEFAULT_ROUTINE_PHOTOS: RoutinePhotoItem[] = DEFAULT_RECENT_WORKOUTS
  .filter(
    (w): w is CompletedWorkoutDetail & { imageAssetKey: string } =>
      Boolean(w.imageAssetKey && w.imageAssetKey.length > 0)
  )
  .map((w) => ({
    id: w.id,
    title: w.title,
    subtitle: w.subtitle ?? "Trening siłowy",
    imageAssetKey: w.imageAssetKey,
    routineId: "rtn_push_02",
    durationMinutes: w.durationMinutes,
    daysPerWeek: 4,
    completedDate: w.completedDate,
    totalVolumeKg: w.totalVolumeKg,
    exercises: w.exercises.map((e) => ({
      id: e.id,
      name: e.name,
      setsSummary: e.setsSummary,
      imageAssetKey: e.imageAssetKey || "0025",
      isPersonalRecord: e.isPersonalRecord,
      recordNote: e.recordNote,
    })),
  }));

const DEFAULT_MONTHLY_INTENSITY: MonthlyIntensity = {
  monthLabel: "Lipiec 2026",
  totalHours: 19.5,
  targetTotalHours: 24.0,
  weeks: [
    {
      id: "w_1",
      weekLabel: "18 lip – 25 lip",
      hours: 5.0,
      workoutCount: 4,
      targetHours: 6.0,
      isCurrentWeek: true,
    },
    {
      id: "w_2",
      weekLabel: "11 lip – 17 lip",
      hours: 4.5,
      workoutCount: 3,
      targetHours: 6.0,
      isCurrentWeek: false,
    },
    {
      id: "w_3",
      weekLabel: "4 lip – 10 lip",
      hours: 6.0,
      workoutCount: 4,
      targetHours: 6.0,
      isCurrentWeek: false,
    },
    {
      id: "w_4",
      weekLabel: "27 cze – 3 lip",
      hours: 4.0,
      workoutCount: 3,
      targetHours: 6.0,
      isCurrentWeek: false,
    },
  ],
};

const DEFAULT_USER_ROUTINES: UserRoutineCard[] = [
  {
    id: "rtn_push_02",
    title: "Push (Klatka + Barki + Triceps)",
    targetMuscleGroups: ["Klatka", "Barki", "Triceps"],
    daysPerWeek: 4,
    durationMinutes: 55,
    exerciseCount: 6,
    levelLabel: "Średni",
  },
  {
    id: "rtn_pull_03",
    title: "Pull (Plecy + Tył barku + Biceps)",
    targetMuscleGroups: ["Plecy", "Biceps"],
    daysPerWeek: 4,
    durationMinutes: 50,
    exerciseCount: 5,
    levelLabel: "Średni",
  },
  {
    id: "rtn_fbw_01",
    title: "FBW dla Początkujących",
    targetMuscleGroups: ["Klatka", "Plecy", "Nogi", "Barki"],
    daysPerWeek: 3,
    durationMinutes: 45,
    exerciseCount: 5,
    levelLabel: "Początkujący",
  },
];

export function useUserProfileScreen() {
  const router = useRouter();
  const rawOnboardingData = useOnboardingStore((s) => s.onboardingData);
  const [selectedWorkoutPhoto, setSelectedWorkoutPhoto] =
    useState<RoutinePhotoItem | null>(null);

  const validatedOnboarding = useMemo(() => {
    if (!rawOnboardingData) return null;
    const parsed = OnboardingFormSchema.safeParse(rawOnboardingData);
    return parsed.success ? parsed.data : null;
  }, [rawOnboardingData]);

  const stats = useMemo<ProfileStats>(() => {
    const displayName = validatedOnboarding?.name?.trim() || "Kacper";
    const goalKey = validatedOnboarding?.fitnessGoal;
    const fitnessGoalLabel = goalKey
      ? FITNESS_GOAL_LABELS[goalKey]?.label ?? "Budowa sylwetki"
      : "Budowa sylwetki";
    const streakDays = 36;
    const benchPressMaxKg = 100;
    const strengthLeague = calculateStrengthLeague(benchPressMaxKg);

    return {
      displayName,
      fitnessGoalLabel,
      streakDays,
      benchPressMaxKg,
      strengthLeague,
      totalWorkoutsCompleted: 48,
    };
  }, [validatedOnboarding]);

  const fullData = useMemo(() => {
    const candidate = {
      stats,
      routinePhotos: DEFAULT_ROUTINE_PHOTOS,
      monthlyIntensity: DEFAULT_MONTHLY_INTENSITY,
      routines: DEFAULT_USER_ROUTINES,
      recentWorkouts: DEFAULT_RECENT_WORKOUTS,
    };
    const parsed = UserProfileScreenDataSchema.safeParse(candidate);
    return parsed.success ? parsed.data : candidate;
  }, [stats]);

  const openWorkoutPhotoModal = useCallback(
    (photoId: string) => {
      const found = fullData.routinePhotos.find((p) => p.id === photoId);
      if (found) {
        setSelectedWorkoutPhoto(found);
      }
    },
    [fullData.routinePhotos]
  );

  const closeWorkoutPhotoModal = useCallback(() => {
    setSelectedWorkoutPhoto(null);
  }, []);

  const openSettings = useCallback(() => {
    router.push("/profile" as never);
  }, [router]);

  const startRoutine = useCallback(
    (routineId: string) => {
      router.push(`/workout/${routineId}` as never);
    },
    [router]
  );

  const openExercisesAtlas = useCallback(() => {
    router.push("/exercises" as never);
  }, [router]);

  return {
    stats: fullData.stats,
    routinePhotos: fullData.routinePhotos,
    monthlyIntensity: fullData.monthlyIntensity,
    routines: fullData.routines,
    recentWorkouts: fullData.recentWorkouts,
    selectedWorkoutPhoto,
    openWorkoutPhotoModal,
    closeWorkoutPhotoModal,
    openSettings,
    startRoutine,
    openExercisesAtlas,
  };
}

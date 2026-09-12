import {
  calculateStrengthLeague,
  STRENGTH_LEAGUES,
  StrengthLeagueSchema,
  RoutinePhotoItemSchema,
  WeeklyIntensitySchema,
  MonthlyIntensitySchema,
  UserRoutineCardSchema,
  CompletedWorkoutDetailSchema,
  UserProfileScreenDataSchema,
} from "../user-profile-screen.schema";

describe("user-profile-screen.schema", () => {
  describe("calculateStrengthLeague", () => {
    it("assigns diamond league when bench press is 100 kg", () => {
      const league = calculateStrengthLeague(100);
      expect(league.id).toBe("diamond");
      expect(league.name).toBe("Diamentowa Liga");
      expect(league.icon).toBe("💎");
    });

    it("handles all tier boundaries accurately", () => {
      expect(calculateStrengthLeague(0).id).toBe("bronze");
      expect(calculateStrengthLeague(45).id).toBe("bronze");
      expect(calculateStrengthLeague(50).id).toBe("silver");
      expect(calculateStrengthLeague(69).id).toBe("silver");
      expect(calculateStrengthLeague(70).id).toBe("gold");
      expect(calculateStrengthLeague(89).id).toBe("gold");
      expect(calculateStrengthLeague(90).id).toBe("platinum");
      expect(calculateStrengthLeague(99).id).toBe("platinum");
      expect(calculateStrengthLeague(105).id).toBe("diamond");
      expect(calculateStrengthLeague(119).id).toBe("diamond");
      expect(calculateStrengthLeague(120).id).toBe("master");
      expect(calculateStrengthLeague(139).id).toBe("master");
      expect(calculateStrengthLeague(140).id).toBe("titan");
      expect(calculateStrengthLeague(180).id).toBe("titan");
    });

    it("handles negative values safely by clamping to bronze", () => {
      expect(calculateStrengthLeague(-10).id).toBe("bronze");
    });
  });

  describe("Zod validation schemas", () => {
    it("validates StrengthLeagueSchema", () => {
      const parsed = StrengthLeagueSchema.safeParse(STRENGTH_LEAGUES.diamond);
      expect(parsed.success).toBe(true);
    });

    it("validates RoutinePhotoItemSchema", () => {
      const item = {
        id: "rp_01",
        title: "Push Day - Siła",
        subtitle: "Klatka, Barki, Triceps",
        imageAssetKey: "0025",
        routineId: "rtn_push_02",
        durationMinutes: 55,
        daysPerWeek: 4,
      };
      expect(RoutinePhotoItemSchema.safeParse(item).success).toBe(true);
      expect(RoutinePhotoItemSchema.safeParse({ id: "" }).success).toBe(false);
    });

    it("validates UserRoutineCardSchema", () => {
      const card = {
        id: "rtn_01",
        title: "Push Day",
        targetMuscleGroups: ["Klatka", "Barki"],
        daysPerWeek: 4,
        durationMinutes: 50,
        exerciseCount: 5,
        levelLabel: "Średni",
      };
      expect(UserRoutineCardSchema.safeParse(card).success).toBe(true);
      expect(UserRoutineCardSchema.safeParse({ id: "" }).success).toBe(false);
    });

    it("validates WeeklyIntensitySchema & MonthlyIntensitySchema", () => {
      const week = {
        id: "w_1",
        weekLabel: "18 lip – 25 lip",
        hours: 5.0,
        workoutCount: 4,
        targetHours: 6.0,
        isCurrentWeek: true,
      };
      expect(WeeklyIntensitySchema.safeParse(week).success).toBe(true);

      const month = {
        monthLabel: "Lipiec 2026",
        totalHours: 19.5,
        targetTotalHours: 24.0,
        weeks: [week],
      };
      expect(MonthlyIntensitySchema.safeParse(month).success).toBe(true);
    });

    it("validates CompletedWorkoutDetailSchema with and without photo and with achievements", () => {
      const workoutWithPhoto = {
        id: "cw_01",
        title: "Klatka & Triceps (Hipertrofia)",
        completedDate: "Wczoraj, 18:30",
        durationMinutes: 58,
        totalVolumeKg: 6450,
        imageAssetKey: "0025",
        exercises: [
          {
            id: "e1",
            name: "Wyciskanie sztangi leżąc",
            setsSummary: "4 serie: 80kg x 10, 90kg x 8, 95kg x 6, 100kg x 4",
            isPersonalRecord: true,
            recordNote: "Nowy rekord: 100 kg!",
          },
        ],
        achievements: [
          {
            id: "ach_01",
            title: "Rekord PR 100 kg!",
            description: "Wyciskanie sztangi na ławce poziomej",
            icon: "💎",
            badgeColor: "#818CF8",
          },
        ],
      };
      expect(CompletedWorkoutDetailSchema.safeParse(workoutWithPhoto).success).toBe(true);

      const workoutWithoutPhoto = {
        id: "cw_02",
        title: "Kondycja & Core",
        completedDate: "4 dni temu",
        durationMinutes: 35,
        totalVolumeKg: 0,
        imageAssetKey: "",
        exercises: [
          {
            id: "e2",
            name: "Plank & Brzuszki",
            setsSummary: "3 serie po 60s",
            isPersonalRecord: false,
          },
        ],
      };
      expect(CompletedWorkoutDetailSchema.safeParse(workoutWithoutPhoto).success).toBe(true);
    });

    it("validates complete UserProfileScreenDataSchema", () => {
      const fullData = {
        stats: {
          displayName: "Kacper",
          fitnessGoalLabel: "Budowa sylwetki",
          streakDays: 36,
          benchPressMaxKg: 100,
          strengthLeague: STRENGTH_LEAGUES.diamond,
          totalWorkoutsCompleted: 48,
        },
        routinePhotos: [
          {
            id: "rp_01",
            title: "Push Day",
            subtitle: "Klatka & Barki",
            imageAssetKey: "0025",
            routineId: "rtn_01",
            durationMinutes: 55,
            daysPerWeek: 4,
          },
        ],
        monthlyIntensity: {
          monthLabel: "Lipiec 2026",
          totalHours: 19.5,
          targetTotalHours: 24.0,
          weeks: [
            {
              id: "w1",
              weekLabel: "18 lip – 25 lip",
              hours: 5.0,
              workoutCount: 4,
              targetHours: 6.0,
              isCurrentWeek: true,
            },
          ],
        },
        routines: [
          {
            id: "rtn_01",
            title: "Push Day",
            targetMuscleGroups: ["Klatka", "Barki", "Triceps"],
            daysPerWeek: 4,
            durationMinutes: 55,
            exerciseCount: 6,
            levelLabel: "Średni",
          },
        ],
        recentWorkouts: [
          {
            id: "cw_01",
            title: "Trening Klatki",
            completedDate: "Wczoraj, 18:30",
            durationMinutes: 58,
            totalVolumeKg: 6450,
            imageAssetKey: "0025",
            exercises: [
              {
                id: "e1",
                name: "Wyciskanie sztangi",
                setsSummary: "4 serie do 100kg",
                isPersonalRecord: true,
              },
            ],
          },
        ],
      };

      const result = UserProfileScreenDataSchema.safeParse(fullData);
      expect(result.success).toBe(true);
    });
  });
});

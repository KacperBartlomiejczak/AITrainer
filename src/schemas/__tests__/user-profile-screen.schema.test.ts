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

    it("validates RoutinePhotoItemSchema (only workouts with a user photo)", () => {
      const item = {
        id: "wks_1",
        title: "FBW A — Całe ciało",
        subtitle: "Nogi, Klatka piersiowa",
        photoUri: "file:///document/workout-photos/wks_1-1.jpg",
        completedDate: "Wczoraj, 18:30",
        durationMinutes: 45,
        exercises: [
          { id: "wse_1", name: "Przysiad ze sztangą", setsSummary: "3 serie × 8-10", completed: true },
        ],
      };
      expect(RoutinePhotoItemSchema.safeParse(item).success).toBe(true);
      expect(RoutinePhotoItemSchema.safeParse({ ...item, photoUri: null }).success).toBe(false);
      expect(RoutinePhotoItemSchema.safeParse({ ...item, photoUri: "" }).success).toBe(false);
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
      expect(UserRoutineCardSchema.safeParse({ ...card, daysPerWeek: 7 }).success).toBe(true);
      expect(UserRoutineCardSchema.safeParse({ ...card, daysPerWeek: 8 }).success).toBe(false);
      expect(UserRoutineCardSchema.safeParse({ ...card, daysPerWeek: 0 }).success).toBe(false);
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

    it("validates CompletedWorkoutDetailSchema with and without the optional photo", () => {
      const workoutWithPhoto = {
        id: "wks_1",
        title: "FBW A — Całe ciało",
        completedDate: "Wczoraj, 18:30",
        durationMinutes: 58,
        completedExerciseCount: 1,
        photoUri: "file:///document/workout-photos/wks_1-1.jpg",
        exercises: [
          { id: "e1", name: "Wyciskanie sztangi leżąc", setsSummary: "3 serie × 8-10", completed: true },
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
        id: "wks_2",
        title: "FBW B — Całe ciało",
        completedDate: "4 dni temu",
        durationMinutes: 35,
        completedExerciseCount: 0,
        photoUri: null,
        exercises: [{ id: "e2", name: "Plank (deska)", setsSummary: "Pominięte", completed: false }],
      };
      const parsed = CompletedWorkoutDetailSchema.safeParse(workoutWithoutPhoto);
      expect(parsed.success).toBe(true);
      expect(parsed.data?.achievements).toEqual([]);
      expect(CompletedWorkoutDetailSchema.safeParse({ ...workoutWithoutPhoto, exercises: [] }).success).toBe(false);
    });

    it("accepts an empty profile for a new user without workouts", () => {
      const result = UserProfileScreenDataSchema.safeParse({
        stats: {
          displayName: "Kacper",
          fitnessGoalLabel: "Budowa sylwetki",
          streakDays: 0,
          benchPressMaxKg: 0,
          strengthLeague: STRENGTH_LEAGUES.bronze,
          totalWorkoutsCompleted: 0,
        },
        routinePhotos: [],
        monthlyIntensity: {
          monthLabel: "Wrzesień 2026",
          totalHours: 0,
          targetTotalHours: 24,
          weeks: [
            { id: "w1", weekLabel: "7 wrz – 13 wrz", hours: 0, workoutCount: 0, targetHours: 6, isCurrentWeek: true },
          ],
        },
        routines: [],
        recentWorkouts: [],
      });
      expect(result.success).toBe(true);
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
            id: "wks_1",
            title: "Trening Klatki",
            subtitle: "Klatka & Barki",
            photoUri: "file:///document/workout-photos/wks_1-1.jpg",
            completedDate: "Wczoraj, 18:30",
            durationMinutes: 58,
            exercises: [
              { id: "e1", name: "Wyciskanie sztangi", setsSummary: "4 serie × 8", completed: true },
            ],
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
            id: "wks_1",
            title: "Trening Klatki",
            completedDate: "Wczoraj, 18:30",
            durationMinutes: 58,
            completedExerciseCount: 1,
            photoUri: "file:///document/workout-photos/wks_1-1.jpg",
            exercises: [
              { id: "e1", name: "Wyciskanie sztangi", setsSummary: "4 serie × 8", completed: true },
            ],
          },
        ],
      };

      const result = UserProfileScreenDataSchema.safeParse(fullData);
      expect(result.success).toBe(true);
    });
  });
});

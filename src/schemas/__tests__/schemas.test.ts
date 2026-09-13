import { MOCK_FRIENDS_FEED } from "@/lib/mock-friends-feed";
import { UserProfileSchema } from "../user.schema";
import { WorkoutSummarySchema, RecentActivitySchema } from "../workout.schema";
import { AiCoachTipSchema } from "../ai-coach.schema";
import { HomeScreenDataSchema } from "../home.schema";

describe("Domain Zod Schemas Validation", () => {
  describe("UserProfileSchema", () => {
    it("should validate a valid user profile", () => {
      const validUser = {
        id: "usr_123",
        name: "Kacper",
        avatarUrl: "https://example.com/avatar.jpg",
        streakDays: 4,
        weeklyGoal: 4,
        completedWorkoutsThisWeek: 3,
        experienceLevel: "beginner" as const,
      };

      const result = UserProfileSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Kacper");
        expect(result.data.streakDays).toBe(4);
      }
    });

    it("should fail on invalid streakDays (negative number)", () => {
      const invalidUser = {
        id: "usr_123",
        name: "Kacper",
        streakDays: -1,
      };

      const result = UserProfileSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe("WorkoutSummarySchema & RecentActivitySchema", () => {
    it("should validate a valid workout summary", () => {
      const validWorkout = {
        id: "wkt_001",
        title: "Klatka + Triceps (FBW A)",
        targetMuscleGroups: ["Klatka piersiowa", "Triceps", "Barki"],
        estimatedDurationMinutes: 55,
        exerciseCount: 5,
        difficulty: "moderate" as const,
        status: "not_started" as const,
        exercisesPreview: [
          {
            id: "ex_1",
            name: "Wyciskanie sztangi leżąc",
            sets: 4,
            targetReps: "8-10",
            muscleGroup: "Klatka",
          },
        ],
      };

      const result = WorkoutSummarySchema.safeParse(validWorkout);
      expect(result.success).toBe(true);
    });

    it("should validate a valid recent activity recap", () => {
      const validActivity = {
        id: "rec_1",
        title: "Plecy + Biceps",
        completedAt: "Wczoraj, 19:15",
        durationMinutes: 58,
        completedExerciseCount: 4,
        totalExerciseCount: 5,
        photoUri: null,
      };

      const result = RecentActivitySchema.safeParse(validActivity);
      expect(result.success).toBe(true);
      expect(
        RecentActivitySchema.safeParse({ ...validActivity, photoUri: "file:///document/workout-photos/a-1.jpg" })
          .success,
      ).toBe(true);
      expect(RecentActivitySchema.safeParse({ ...validActivity, totalExerciseCount: 0 }).success).toBe(false);
    });
  });

  describe("AiCoachTipSchema", () => {
    it("should safely validate an AI tip payload using safeParse", () => {
      const validTip = {
        id: "tip_99",
        title: "Pamiętaj o rozgrzewce rotatora barku!",
        message: "Dzisiaj w planie wyciskanie na ławce poziomej. Zrób 2 serie rozgrzewkowe z gumą oporową.",
        category: "technique" as const,
        suggestedAction: "Zobacz rozgrzewkę",
      };

      const result = AiCoachTipSchema.safeParse(validTip);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe("technique");
      }
    });

    it("should gracefully handle malformed AI response and fail validation without crashing", () => {
      const malformedAiPayload = {
        randomGarbage: 12345,
      };

      const result = AiCoachTipSchema.safeParse(malformedAiPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("HomeScreenDataSchema", () => {
    it("should validate complete home screen data payload", () => {
      const homeData = {
        user: {
          id: "usr_1",
          name: "Kacper",
          avatarUrl: "",
          streakDays: 4,
          weeklyGoal: 4,
          completedWorkoutsThisWeek: 3,
          experienceLevel: "beginner" as const,
        },
        todayWorkout: {
          id: "wkt_1",
          title: "Klatka + Triceps",
          targetMuscleGroups: ["Klatka", "Triceps"],
          estimatedDurationMinutes: 50,
          exerciseCount: 4,
          difficulty: "moderate" as const,
          status: "not_started" as const,
        },
        weeklyProgress: {
          completedCount: 3,
          targetCount: 4,
          days: [
            { dayLabel: "Pn", dateNumber: 8, status: "completed" as const, isToday: false },
            { dayLabel: "Wt", dateNumber: 9, status: "rest" as const, isToday: false },
            { dayLabel: "Śr", dateNumber: 10, status: "completed" as const, isToday: false },
            { dayLabel: "Czw", dateNumber: 11, status: "completed" as const, isToday: false },
            { dayLabel: "Pt", dateNumber: 12, status: "today_pending" as const, isToday: true },
            { dayLabel: "Sob", dateNumber: 13, status: "upcoming" as const, isToday: false },
            { dayLabel: "Nd", dateNumber: 14, status: "rest" as const, isToday: false },
          ],
        },
        aiCoachTip: {
          id: "tip_1",
          title: "Świetna passa!",
          message: "Ukończyłeś już 3 z 4 treningów w tym tygodniu. Ostatni krok do 100% celu!",
          category: "motivation" as const,
        },
        quickActions: [
          {
            id: "qa_1",
            title: "Pusty Trening",
            description: "Zacznij od zera",
            iconName: "PlusCircle",
            route: "/workout/new",
          },
        ],
        recentActivity: {
          id: "rec_1",
          title: "Plecy + Biceps",
          completedAt: "Wczoraj, 18:30",
          durationMinutes: 62,
          completedExerciseCount: 5,
          totalExerciseCount: 5,
          photoUri: null,
        },
        friendsFeed: [...MOCK_FRIENDS_FEED],
      };

      const result = HomeScreenDataSchema.safeParse(homeData);
      expect(result.success).toBe(true);
    });
  });
});

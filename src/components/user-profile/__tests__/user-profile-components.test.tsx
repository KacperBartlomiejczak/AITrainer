import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { RoutinePhotoCarousel } from "../RoutinePhotoCarousel";
import { ProfileHeaderWithBadges } from "../ProfileHeaderWithBadges";
import { MonthlyIntensityChart } from "../MonthlyIntensityChart";
import { UserRoutinesList } from "../UserRoutinesList";
import { RecentCompletedWorkouts } from "../RecentCompletedWorkouts";
import { PastWorkoutModal } from "../PastWorkoutModal";
import { STRENGTH_LEAGUES } from "@/schemas/user-profile-screen.schema";

describe("User Profile UI Components", () => {
  const photoExercises = [
    {
      id: "wse_1",
      name: "Przysiad ze sztangą",
      setsSummary: "3 serie × 8-10",
      completed: true,
      isPersonalRecord: false,
    },
    {
      id: "wse_2",
      name: "Plank (deska)",
      setsSummary: "Pominięte",
      completed: false,
      isPersonalRecord: false,
    },
  ];

  describe("RoutinePhotoCarousel", () => {
    const mockPhotos = [
      {
        id: "wks_1",
        title: "FBW A — Całe ciało",
        subtitle: "Nogi, Brzuch",
        photoUri: "file:///document/workout-photos/wks_1-1.jpg",
        completedDate: "Wczoraj, 18:30",
        durationMinutes: 45,
        exercises: photoExercises,
      },
      {
        id: "wks_2",
        title: "FBW B — Całe ciało",
        subtitle: "Nogi, Plecy",
        photoUri: "file:///document/workout-photos/wks_2-1.jpg",
        completedDate: "3 dni temu",
        durationMinutes: 41,
        exercises: photoExercises,
      },
    ];

    it("renders the user's workout photos and triggers onSelectPhoto", async () => {
      const onSelect = jest.fn();
      const { getByText, getByTestId, unmount } = await render(
        <RoutinePhotoCarousel photos={mockPhotos} onSelectPhoto={onSelect} />
      );

      expect(getByText("FBW A — Całe ciało")).toBeTruthy();
      expect(getByText("FBW B — Całe ciało")).toBeTruthy();
      expect(getByTestId("routine-photo-image-wks_1").props.source).toEqual({ uri: mockPhotos[0].photoUri });

      const item = getByTestId("routine-photo-wks_1");
      await act(async () => {
        fireEvent.press(item);
      });
      expect(onSelect).toHaveBeenCalledWith("wks_1");

      unmount();
    });

    it("renders an empty state when no workout has a photo yet", async () => {
      const { getByTestId, getByText, unmount } = await render(
        <RoutinePhotoCarousel photos={[]} onSelectPhoto={jest.fn()} />
      );

      expect(getByTestId("routine-photos-empty")).toBeTruthy();
      expect(getByText("Brak zdjęć z treningów")).toBeTruthy();
      unmount();
    });
  });

  describe("PastWorkoutModal", () => {
    const mockWorkout = {
      id: "wks_1",
      title: "FBW A — Całe ciało",
      subtitle: "Nogi, Brzuch",
      photoUri: "file:///document/workout-photos/wks_1-1.jpg",
      completedDate: "Wczoraj, 18:30",
      durationMinutes: 45,
      exercises: photoExercises,
    };

    it("renders modal with workout details, exercises, and handles close", async () => {
      const onClose = jest.fn();
      const { getByText, getByTestId, unmount } = await render(
        <PastWorkoutModal
          workout={mockWorkout}
          visible={true}
          onClose={onClose}
        />
      );

      expect(getByTestId("past-workout-modal")).toBeTruthy();
      expect(getByText("FBW A — Całe ciało")).toBeTruthy();
      expect(getByTestId("past-workout-photo").props.source).toEqual({ uri: mockWorkout.photoUri });
      expect(getByText("Przysiad ze sztangą")).toBeTruthy();
      expect(getByText("3 serie × 8-10")).toBeTruthy();
      expect(getByText("Pominięte")).toBeTruthy();

      const closeBtn = getByTestId("close-past-workout-modal");
      expect(closeBtn.props.accessibilityRole).toBe("button");
      expect(closeBtn.props.accessibilityLabel).toBe("Zamknij podgląd treningu");
      await act(async () => {
        fireEvent.press(closeBtn);
      });
      expect(onClose).toHaveBeenCalled();

      unmount();
    });
  });

  describe("ProfileHeaderWithBadges", () => {
    const mockStats = {
      displayName: "Kacper Bartłomiejczak",
      fitnessGoalLabel: "Budowa sylwetki",
      streakDays: 36,
      benchPressMaxKg: 100,
      strengthLeague: STRENGTH_LEAGUES.diamond,
      totalWorkoutsCompleted: 48,
    };

    it("renders name, streak 36 dni and diamond league for 100 kg bench", async () => {
      const { getByText, unmount } = await render(
        <ProfileHeaderWithBadges stats={mockStats} />
      );

      expect(getByText("Kacper Bartłomiejczak")).toBeTruthy();
      expect(getByText("🔥 36 dni serii")).toBeTruthy();
      expect(getByText("💎 Diamentowa Liga")).toBeTruthy();
      expect(getByText("100 kg Wyciskanie")).toBeTruthy();
      expect(getByText("Budowa sylwetki")).toBeTruthy();

      unmount();
    });
  });

  describe("MonthlyIntensityChart", () => {
    const mockIntensity = {
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
      ],
    };

    it("renders monthly intensity breakdown with 18 lip - 25 lip 5.0h", async () => {
      const { getByText, unmount } = await render(
        <MonthlyIntensityChart intensity={mockIntensity} />
      );

      expect(getByText("Intensywność Treningów")).toBeTruthy();
      expect(getByText("19.5h")).toBeTruthy();
      expect(getByText("18 lip – 25 lip")).toBeTruthy();
      expect(getByText("5.0h")).toBeTruthy();

      unmount();
    });
  });

  describe("UserRoutinesList", () => {
    const mockRoutines = [
      {
        id: "rtn_push_02",
        title: "Push (Klatka + Barki + Triceps)",
        targetMuscleGroups: ["Klatka", "Barki", "Triceps"],
        daysPerWeek: 4,
        durationMinutes: 55,
        exerciseCount: 6,
        levelLabel: "Średni",
      },
    ];

    it("renders horizontal scrollable routines and triggers onStartRoutine", async () => {
      const onStart = jest.fn();
      const { getByText, getByTestId, unmount } = await render(
        <UserRoutinesList routines={mockRoutines} onStartRoutine={onStart} />
      );

      expect(getByTestId("routines-horizontal-scroll")).toBeTruthy();
      expect(getByText("Push (Klatka + Barki + Triceps)")).toBeTruthy();
      expect(getByText("4x w tyg • 55 min")).toBeTruthy();

      const btn = getByTestId("start-routine-rtn_push_02");
      await act(async () => {
        fireEvent.press(btn);
      });
      expect(onStart).toHaveBeenCalledWith("rtn_push_02");

      unmount();
    });
  });

  describe("RecentCompletedWorkouts", () => {
    const mockWorkouts = [
      {
        id: "cw_01",
        title: "FBW A — Całe ciało",
        completedDate: "Wczoraj, 18:30",
        durationMinutes: 58,
        completedExerciseCount: 1,
        photoUri: "file:///document/workout-photos/cw_01-1.jpg",
        exercises: photoExercises,
        achievements: [
          {
            id: "ach_01",
            title: "Rekord PR 100 kg!",
            description: "Wyciskanie na klatę • Diamentowa Liga",
            icon: "💎",
            badgeColor: "#818CF8",
          },
        ],
      },
      {
        id: "cw_02",
        title: "Kondycja & Brzuch (Bez zdjęcia)",
        completedDate: "4 dni temu",
        durationMinutes: 30,
        completedExerciseCount: 1,
        photoUri: null,
        exercises: [
          {
            id: "e_02",
            name: "Deska / Plank",
            setsSummary: "3 serie × 60 sek",
            completed: true,
            isPersonalRecord: false,
          },
        ],
        achievements: [],
      },
    ];

    it("renders workout with photo having slides: photo -> exercises -> achievements", async () => {
      const { getByText, getByTestId, unmount } = await render(
        <RecentCompletedWorkouts workouts={mockWorkouts} />
      );

      expect(getByTestId("completed-workout-cw_01")).toBeTruthy();
      expect(getByTestId("workout-cover-image-cw_01").props.source).toEqual({ uri: mockWorkouts[0].photoUri });
      expect(getByText("1/2 ćwiczeń")).toBeTruthy();
      expect(getByTestId("exercises-slide-cw_01")).toBeTruthy();
      expect(getByTestId("achievements-slide-cw_01")).toBeTruthy();
      expect(getByText("Przysiad ze sztangą")).toBeTruthy();
      expect(getByText("Rekord PR 100 kg!")).toBeTruthy();

      unmount();
    });

    it("renders a workout without photo and achievements as a single exercises slide", async () => {
      const { getByText, getByTestId, queryByTestId, unmount } = await render(
        <RecentCompletedWorkouts workouts={mockWorkouts} />
      );

      expect(getByTestId("completed-workout-cw_02")).toBeTruthy();
      expect(queryByTestId("workout-cover-image-cw_02")).toBeNull();
      expect(getByTestId("exercises-slide-cw_02")).toBeTruthy();
      expect(queryByTestId("achievements-slide-cw_02")).toBeNull();
      expect(getByText("Kondycja & Brzuch (Bez zdjęcia)")).toBeTruthy();
      expect(getByText("Deska / Plank")).toBeTruthy();

      unmount();
    });

    it("lets the user add a photo to a workout without one, or change an existing photo", async () => {
      const onManagePhoto = jest.fn();
      const { getByTestId, getByText, unmount } = await render(
        <RecentCompletedWorkouts workouts={mockWorkouts} onManagePhoto={onManagePhoto} />
      );

      expect(getByText("📷 Zmień zdjęcie")).toBeTruthy();
      expect(getByText("📷 Dodaj zdjęcie")).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByTestId("manage-photo-cw_02"));
      });
      expect(onManagePhoto).toHaveBeenCalledWith("cw_02");

      unmount();
    });

    it("renders an empty state for a user without completed workouts", async () => {
      const { getByTestId, getByText, unmount } = await render(<RecentCompletedWorkouts workouts={[]} />);

      expect(getByTestId("recent-workouts-empty")).toBeTruthy();
      expect(getByText("Brak ukończonych treningów")).toBeTruthy();
      unmount();
    });

    it("configures scrollview for smooth paging and updates slide on scroll", async () => {
      const { getByTestId, findByText, unmount } = await render(
        <RecentCompletedWorkouts workouts={mockWorkouts} />
      );

      const scrollView = getByTestId("workout-card-scroll-cw_01");
      expect(scrollView.props.pagingEnabled).toBe(true);
      expect(scrollView.props.nestedScrollEnabled).toBe(true);

      // Simulate scrolling to slide 2
      await act(async () => {
        fireEvent.scroll(scrollView, {
          nativeEvent: {
            contentOffset: { x: 360, y: 0 },
            contentSize: { width: 1080, height: 300 },
            layoutMeasurement: { width: 360, height: 300 },
          },
        });
      });

      // Pagination indicator shows active slide
      expect(await findByText("Slajd 2 z 3")).toBeTruthy();

      unmount();
    });
  });
});

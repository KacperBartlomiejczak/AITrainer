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
  describe("RoutinePhotoCarousel", () => {
    const mockPhotos = [
      {
        id: "rp_01",
        title: "Push Day — Klatka & Barki",
        subtitle: "Hipertrofia & Siła",
        imageAssetKey: "0025",
        routineId: "rtn_push_02",
        durationMinutes: 55,
        daysPerWeek: 4,
      },
      {
        id: "rp_02",
        title: "FBW Siła & Stabilizacja",
        subtitle: "Całe ciało",
        imageAssetKey: "0047",
        routineId: "rtn_fbw_01",
        durationMinutes: 45,
        daysPerWeek: 3,
      },
    ];

    it("renders vertical rectangle photos and triggers onSelectPhoto", async () => {
      const onSelect = jest.fn();
      const { getByText, getByTestId, unmount } = await render(
        <RoutinePhotoCarousel photos={mockPhotos} onSelectPhoto={onSelect} />
      );

      expect(getByText("Push Day — Klatka & Barki")).toBeTruthy();
      expect(getByText("FBW Siła & Stabilizacja")).toBeTruthy();

      const item = getByTestId("routine-photo-rp_01");
      await act(async () => {
        fireEvent.press(item);
      });
      expect(onSelect).toHaveBeenCalledWith("rp_01");

      unmount();
    });
  });

  describe("PastWorkoutModal", () => {
    const mockWorkout = {
      id: "rp_example_01",
      title: "Ostatni Trening na Siłowni 🔥",
      subtitle: "Klatka, Barki & Biceps",
      imageAssetKey: "example_past_photo",
      routineId: "rtn_push_02",
      durationMinutes: 58,
      daysPerWeek: 4,
      completedDate: "Wczoraj, 18:30",
      totalVolumeKg: 6450,
      exercises: [
        {
          id: "ex_p1",
          name: "Wyciskanie sztangi na ławce poziomej",
          setsSummary: "4 serie: 80kg×10, 90kg×8, 95kg×6, 100kg×4",
          imageAssetKey: "0025",
          isPersonalRecord: true,
          recordNote: "🔥 Nowy PR: 100 kg na klatę!",
        },
      ],
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
      expect(getByText("Ostatni Trening na Siłowni 🔥")).toBeTruthy();
      expect(getByText("Wyciskanie sztangi na ławce poziomej")).toBeTruthy();
      expect(getByText("4 serie: 80kg×10, 90kg×8, 95kg×6, 100kg×4")).toBeTruthy();

      const closeBtn = getByTestId("close-past-workout-modal");
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
        title: "Sesja Pchająca: Klatka & Barki",
        completedDate: "Wczoraj, 18:30",
        durationMinutes: 58,
        totalVolumeKg: 6450,
        imageAssetKey: "0025",
        exercises: [
          {
            id: "e_01",
            name: "Wyciskanie sztangi leżąc",
            setsSummary: "4 serie: 80kg×10, 90kg×8, 95kg×6, 100kg×4",
            isPersonalRecord: true,
            recordNote: "🔥 Nowy PR: 100 kg na klatę!",
          },
        ],
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
        totalVolumeKg: 0,
        imageAssetKey: "",
        exercises: [
          {
            id: "e_02",
            name: "Deska / Plank",
            setsSummary: "3 serie po 60 sekund",
            isPersonalRecord: false,
          },
        ],
        achievements: [
          {
            id: "ach_02",
            title: "Stalowy Brzuch",
            description: "Brak przerw w seriach deski",
            icon: "⚡",
            badgeColor: "#F59E0B",
          },
        ],
      },
    ];

    it("renders workout with photo having slides: photo -> exercises -> achievements", async () => {
      const { getByText, getByTestId, unmount } = await render(
        <RecentCompletedWorkouts workouts={mockWorkouts} />
      );

      // Card with photo
      expect(getByTestId("completed-workout-cw_01")).toBeTruthy();
      expect(getByTestId("workout-cover-image-cw_01")).toBeTruthy();
      expect(getByTestId("exercises-slide-cw_01")).toBeTruthy();
      expect(getByTestId("achievements-slide-cw_01")).toBeTruthy();
      expect(getByText("Wyciskanie sztangi leżąc")).toBeTruthy();
      expect(getByText("Rekord PR 100 kg!")).toBeTruthy();

      // Card WITHOUT photo renders exercises directly first and achievements next
      expect(getByTestId("completed-workout-cw_02")).toBeTruthy();
      expect(getByTestId("exercises-slide-cw_02")).toBeTruthy();
      expect(getByTestId("achievements-slide-cw_02")).toBeTruthy();
      expect(getByText("Kondycja & Brzuch (Bez zdjęcia)")).toBeTruthy();
      expect(getByText("Deska / Plank")).toBeTruthy();
      expect(getByText("Stalowy Brzuch")).toBeTruthy();

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

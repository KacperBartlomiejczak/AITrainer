import type { MonthlyIntensity } from "@/schemas/user-profile-screen.schema";

/** Placeholder monthly intensity chart for the profile screen (not derived from workout history yet). */
export const MOCK_MONTHLY_INTENSITY: MonthlyIntensity = {
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

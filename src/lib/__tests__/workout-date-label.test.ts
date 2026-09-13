import { formatDurationMinutes, formatWorkoutDateLabel } from "../workout-date-label";

// Local-time dates so the test does not depend on the machine's time zone
const now = new Date(2026, 8, 13, 20, 0);

describe("formatWorkoutDateLabel", () => {
  it("labels a workout from today", () => {
    expect(formatWorkoutDateLabel(new Date(2026, 8, 13, 7, 5), now)).toBe("Dziś, 07:05");
  });

  it("labels a workout from yesterday, also right after midnight", () => {
    expect(formatWorkoutDateLabel(new Date(2026, 8, 12, 18, 30), now)).toBe("Wczoraj, 18:30");
    expect(formatWorkoutDateLabel(new Date(2026, 8, 12, 23, 59), new Date(2026, 8, 13, 0, 1))).toBe(
      "Wczoraj, 23:59",
    );
  });

  it("uses relative days within the last week", () => {
    expect(formatWorkoutDateLabel(new Date(2026, 8, 11, 18, 0), now)).toBe("2 dni temu");
    expect(formatWorkoutDateLabel(new Date(2026, 8, 7, 18, 0), now)).toBe("6 dni temu");
  });

  it("uses a short Polish date for older workouts", () => {
    expect(formatWorkoutDateLabel(new Date(2026, 8, 6, 9, 15), now)).toBe("6 wrz, 09:15");
    expect(formatWorkoutDateLabel(new Date(2025, 11, 31, 18, 0), now)).toBe("31 gru 2025");
  });

  it("does not produce a negative label for a date slightly in the future", () => {
    expect(formatWorkoutDateLabel(new Date(2026, 8, 13, 20, 5), now)).toBe("Dziś, 20:05");
  });
});

describe("formatDurationMinutes", () => {
  it("rounds to whole minutes with a minimum of one", () => {
    expect(formatDurationMinutes(0)).toBe(1);
    expect(formatDurationMinutes(89)).toBe(1);
    expect(formatDurationMinutes(90)).toBe(2);
    expect(formatDurationMinutes(2730)).toBe(46);
  });
});

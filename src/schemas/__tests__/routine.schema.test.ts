import {
  RoutineLevelSchema,
  RoutineItemSchema,
  RoutineListSchema,
} from "../routine.schema";

describe("routine.schema", () => {
  it("validates routine difficulty levels", () => {
    expect(RoutineLevelSchema.safeParse("beginner").success).toBe(true);
    expect(RoutineLevelSchema.safeParse("intermediate").success).toBe(true);
    expect(RoutineLevelSchema.safeParse("advanced").success).toBe(true);
    expect(RoutineLevelSchema.safeParse("expert").success).toBe(false);
  });

  it("validates valid routine item", () => {
    const routine = {
      id: "rtn_fbw_01",
      title: "FBW dla Początkujących",
      description: "Idealny plan na start z wolnymi ciężarami i maszynami.",
      durationMinutes: 45,
      daysPerWeek: 3,
      level: "beginner",
      targetMuscleGroups: ["Klatka", "Plecy", "Nogi"],
      exerciseCount: 5,
      isPopular: true,
    };
    const parsed = RoutineItemSchema.safeParse(routine);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid routine data", () => {
    const invalidRoutine = {
      id: "",
      title: "Plan",
      durationMinutes: -10, // negative duration
      daysPerWeek: 0,
      level: "unknown",
      targetMuscleGroups: [],
      exerciseCount: 0,
    };
    const parsed = RoutineItemSchema.safeParse(invalidRoutine);
    expect(parsed.success).toBe(false);
  });

  it("validates routine list array", () => {
    const list = [
      {
        id: "rtn_1",
        title: "Push",
        description: "Trening klatki i tricepsa",
        durationMinutes: 50,
        daysPerWeek: 4,
        level: "intermediate",
        targetMuscleGroups: ["Klatka"],
        exerciseCount: 4,
      },
    ];
    expect(RoutineListSchema.safeParse(list).success).toBe(true);
  });
});

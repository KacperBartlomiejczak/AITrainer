import { RoutineDraftExerciseSchema, RoutineDraftSchema } from "../routine-form.schema";

const validExercise = {
  id: "row_1",
  catalogExerciseId: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  targetMuscle: "Klatka piersiowa",
  sets: 3,
  targetReps: "8-12",
  restSeconds: 90,
};

const validDraft = {
  title: "Moja rutyna push",
  description: "Klatka, barki, triceps",
  level: "intermediate" as const,
  daysPerWeek: 3,
  durationMinutes: 45,
  exercises: [validExercise],
};

describe("routine-form.schema", () => {
  it("validates a well-formed draft exercise", () => {
    expect(RoutineDraftExerciseSchema.safeParse(validExercise).success).toBe(true);
  });

  it("rejects a draft exercise with zero sets or an empty rep target", () => {
    expect(RoutineDraftExerciseSchema.safeParse({ ...validExercise, sets: 0 }).success).toBe(false);
    expect(RoutineDraftExerciseSchema.safeParse({ ...validExercise, targetReps: "" }).success).toBe(false);
  });

  it("validates a well-formed routine draft", () => {
    expect(RoutineDraftSchema.safeParse(validDraft).success).toBe(true);
  });

  it("trims the title and description", () => {
    const parsed = RoutineDraftSchema.parse({ ...validDraft, title: "  Push  ", description: "  Opis  " });
    expect(parsed.title).toBe("Push");
    expect(parsed.description).toBe("Opis");
  });

  it("rejects a draft with no exercises", () => {
    expect(RoutineDraftSchema.safeParse({ ...validDraft, exercises: [] }).success).toBe(false);
  });

  it("rejects an empty title or out-of-range daysPerWeek", () => {
    expect(RoutineDraftSchema.safeParse({ ...validDraft, title: "   " }).success).toBe(false);
    expect(RoutineDraftSchema.safeParse({ ...validDraft, daysPerWeek: 8 }).success).toBe(false);
    expect(RoutineDraftSchema.safeParse({ ...validDraft, daysPerWeek: 0 }).success).toBe(false);
  });
});

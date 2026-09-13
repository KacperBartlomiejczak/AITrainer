import {
  UNDECIDED_MUSCLE_FOCUS,
  areMuscleFocusesEqual,
  getSelectedMuscleGroups,
  isUndecidedMuscleFocus,
  toggleMuscleGroupInFocus,
  toggleUndecidedMuscleFocus,
} from "../muscle-focus";
import type { MuscleFocus } from "@/schemas/onboarding.schema";

const chestAndBack: MuscleFocus = { mode: "selected", muscleGroups: ["chest", "back"] };

describe("toggleMuscleGroupInFocus", () => {
  it("starts a selection when nothing is chosen", () => {
    expect(toggleMuscleGroupInFocus(null, "legs")).toEqual({ mode: "selected", muscleGroups: ["legs"] });
  });

  it("replaces 'not sure yet' with the picked muscle group", () => {
    expect(toggleMuscleGroupInFocus(UNDECIDED_MUSCLE_FOCUS, "abs")).toEqual({
      mode: "selected",
      muscleGroups: ["abs"],
    });
  });

  it("adds and removes groups in an existing selection", () => {
    expect(toggleMuscleGroupInFocus(chestAndBack, "legs")).toEqual({
      mode: "selected",
      muscleGroups: ["chest", "back", "legs"],
    });
    expect(toggleMuscleGroupInFocus(chestAndBack, "chest")).toEqual({
      mode: "selected",
      muscleGroups: ["back"],
    });
  });

  it("returns null when the last group is removed", () => {
    expect(toggleMuscleGroupInFocus({ mode: "selected", muscleGroups: ["arms"] }, "arms")).toBeNull();
  });
});

describe("toggleUndecidedMuscleFocus", () => {
  it("clears selected muscle groups when 'not sure yet' is picked", () => {
    expect(toggleUndecidedMuscleFocus(chestAndBack)).toEqual(UNDECIDED_MUSCLE_FOCUS);
    expect(toggleUndecidedMuscleFocus(null)).toEqual(UNDECIDED_MUSCLE_FOCUS);
  });

  it("unchecks 'not sure yet' when pressed again", () => {
    expect(toggleUndecidedMuscleFocus(UNDECIDED_MUSCLE_FOCUS)).toBeNull();
  });
});

describe("selectors", () => {
  it("getSelectedMuscleGroups returns groups only for a selection", () => {
    expect(getSelectedMuscleGroups(chestAndBack)).toEqual(["chest", "back"]);
    expect(getSelectedMuscleGroups(UNDECIDED_MUSCLE_FOCUS)).toEqual([]);
    expect(getSelectedMuscleGroups(null)).toEqual([]);
  });

  it("isUndecidedMuscleFocus detects 'not sure yet'", () => {
    expect(isUndecidedMuscleFocus(UNDECIDED_MUSCLE_FOCUS)).toBe(true);
    expect(isUndecidedMuscleFocus(chestAndBack)).toBe(false);
    expect(isUndecidedMuscleFocus(null)).toBe(false);
  });
});

describe("areMuscleFocusesEqual", () => {
  it("ignores muscle group order", () => {
    expect(
      areMuscleFocusesEqual(chestAndBack, { mode: "selected", muscleGroups: ["back", "chest"] }),
    ).toBe(true);
  });

  it("detects different modes, groups and null", () => {
    expect(areMuscleFocusesEqual(chestAndBack, UNDECIDED_MUSCLE_FOCUS)).toBe(false);
    expect(areMuscleFocusesEqual(chestAndBack, { mode: "selected", muscleGroups: ["chest"] })).toBe(false);
    expect(areMuscleFocusesEqual(null, null)).toBe(true);
    expect(areMuscleFocusesEqual(null, UNDECIDED_MUSCLE_FOCUS)).toBe(false);
    expect(areMuscleFocusesEqual(UNDECIDED_MUSCLE_FOCUS, { mode: "undecided" })).toBe(true);
  });
});

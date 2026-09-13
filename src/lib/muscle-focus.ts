import type { MuscleFocus, MuscleGroup } from "@/schemas/onboarding.schema";

/**
 * Pure helpers for the exclusive "Jeszcze nie wiem" vs. muscle groups choice.
 * `null` means the user has not picked anything yet (form state only — never persisted).
 */

export const UNDECIDED_MUSCLE_FOCUS: MuscleFocus = { mode: "undecided" };

export function getSelectedMuscleGroups(focus: MuscleFocus | null): MuscleGroup[] {
  return focus?.mode === "selected" ? focus.muscleGroups : [];
}

export function isUndecidedMuscleFocus(focus: MuscleFocus | null): boolean {
  return focus?.mode === "undecided";
}

/** Picking a muscle group always leaves "not sure yet"; removing the last group clears the choice. */
export function toggleMuscleGroupInFocus(
  focus: MuscleFocus | null,
  group: MuscleGroup,
): MuscleFocus | null {
  const selected = getSelectedMuscleGroups(focus);
  const muscleGroups = selected.includes(group)
    ? selected.filter((selectedGroup) => selectedGroup !== group)
    : [...selected, group];

  return muscleGroups.length > 0 ? { mode: "selected", muscleGroups } : null;
}

/** "Not sure yet" replaces any selected groups; pressing it again unchecks it. */
export function toggleUndecidedMuscleFocus(focus: MuscleFocus | null): MuscleFocus | null {
  return isUndecidedMuscleFocus(focus) ? null : UNDECIDED_MUSCLE_FOCUS;
}

export function areMuscleFocusesEqual(a: MuscleFocus | null, b: MuscleFocus | null): boolean {
  if (a === null || b === null) return a === b;
  if (a.mode !== b.mode) return false;

  const groupsA = getSelectedMuscleGroups(a);
  const groupsB = getSelectedMuscleGroups(b);
  return groupsA.length === groupsB.length && groupsA.every((group) => groupsB.includes(group));
}

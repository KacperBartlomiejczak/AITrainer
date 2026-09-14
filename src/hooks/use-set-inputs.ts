import { useCallback, useState } from "react";
import type { z } from "zod";
import {
  RepsTextSchema,
  WeightTextSchema,
  type LiveWorkoutSet,
  type LiveWorkoutSetPatch,
} from "@/schemas/live-workout.schema";

const toWeightText = (weightKg: number | null) => (weightKg === null ? "" : String(weightKg).replace(".", ","));
const toRepsText = (reps: number | null) => (reps === null ? "" : String(reps));

/** null = empty field, undefined = text that is not a valid value (yet), e.g. "62," */
function parseFieldText(schema: z.ZodType<number, string>, text: string): number | null | undefined {
  if (text.trim() === "") return null;
  const parsed = schema.safeParse(text);
  return parsed.success ? parsed.data : undefined;
}

/**
 * Text of one numeric field kept in sync with the store value:
 * a value changed elsewhere (e.g. weight copied from another set) replaces the text,
 * unless the text already means that value (so typing "62,5" is never reformatted).
 */
function useSyncedFieldText(
  value: number | null,
  schema: z.ZodType<number, string>,
  toText: (value: number | null) => string,
  onValue: (value: number | null) => void,
) {
  const [field, setField] = useState({ text: toText(value), syncedValue: value });

  if (value !== field.syncedValue) {
    // Adjusting state during render (React pattern for syncing with props) — no extra effect pass
    const localValue = parseFieldText(schema, field.text);
    setField({ text: localValue === value ? field.text : toText(value), syncedValue: value });
  }

  const change = useCallback(
    (text: string) => {
      const parsed = parseFieldText(schema, text);
      setField((current) => ({ text, syncedValue: parsed === undefined ? current.syncedValue : parsed }));
      if (parsed !== undefined) onValue(parsed);
    },
    [schema, onValue],
  );

  return { text: field.text, change, isInvalid: parseFieldText(schema, field.text) === undefined };
}

/**
 * Text fields of one set row. Only values accepted by the shared Zod schemas reach the workout store.
 */
export function useSetInputs(set: LiveWorkoutSet, onUpdate: (patch: LiveWorkoutSetPatch) => void) {
  const updateWeight = useCallback((weightKg: number | null) => onUpdate({ weightKg }), [onUpdate]);
  const updateReps = useCallback((reps: number | null) => onUpdate({ reps }), [onUpdate]);
  const weight = useSyncedFieldText(set.weightKg, WeightTextSchema, toWeightText, updateWeight);
  const reps = useSyncedFieldText(set.reps, RepsTextSchema, toRepsText, updateReps);

  return {
    weightText: weight.text,
    repsText: reps.text,
    changeWeight: weight.change,
    changeReps: reps.change,
    isWeightInvalid: weight.isInvalid,
    isRepsInvalid: reps.isInvalid,
  };
}

import type {
  CompletedWorkoutAchievement,
  CompletedWorkoutDetail,
  CompletedWorkoutExercise,
  RoutinePhotoItem,
} from "@/schemas/user-profile-screen.schema";
import type { RecentActivity } from "@/schemas/workout.schema";
import { PERSONAL_RECORD_META } from "@/schemas/live-workout.schema";
import {
  PersonalRecordTypeSchema,
  type PersonalRecordType,
  type WorkoutHistoryEntry,
  type WorkoutSession,
  type WorkoutSessionExerciseRow,
  type WorkoutSessionExport,
  type WorkoutSessionSet,
} from "@/schemas/workout-history.schema";
import { computeVolumeKg, formatEstimatedKg, formatKg } from "./live-workout-stats";
import { estimateOneRepMaxKg, isBetterSet, TAGS_EXCLUDED_FROM_RECORDS } from "./personal-records";
import { formatDurationMinutes, formatWorkoutDateLabel } from "./workout-date-label";

/** Stored workout sessions → view models for the home and profile screens. */

function pluralizeSets(count: number): string {
  if (count === 1) return "seria";
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14) ? "serie" : "serii";
}

export function formatSetsSummary(
  exercise: Pick<WorkoutSessionExerciseRow, "sets" | "targetReps" | "completed">,
): string {
  if (!exercise.completed) return "Pominięte";
  return `${exercise.sets} ${pluralizeSets(exercise.sets)} × ${exercise.targetReps}`;
}

type SessionExercise = WorkoutSession["exercises"][number];

function formatSetResult(set: Pick<WorkoutSessionSet, "weightKg" | "reps">): string {
  return set.weightKg > 0 ? `${formatKg(set.weightKg)} × ${set.reps}` : `${set.reps} powt.`;
}

/** Heaviest set that counts as real work (warm-ups and failed sets only when nothing else was logged). */
function findTopSet(sets: readonly WorkoutSessionSet[]): WorkoutSessionSet | null {
  const workingSets = sets.filter((set) => !set.tag || !TAGS_EXCLUDED_FROM_RECORDS.includes(set.tag));
  const candidates = workingSets.length > 0 ? workingSets : sets;
  return candidates.reduce<WorkoutSessionSet | null>(
    (top, set) => (!top || isBetterSet(set, top) ? set : top),
    null,
  );
}

const RECORD_FLAG = {
  one_rep_max: "isOneRepMaxRecord",
  best_set_volume: "isBestSetVolumeRecord",
  max_reps: "isMaxRepsRecord",
} as const satisfies Record<PersonalRecordType, keyof WorkoutSessionSet>;

/** Record types a stored set beat, in badge order (MAX, SERIA, POWT.) */
function recordTypesOf(set: WorkoutSessionSet): PersonalRecordType[] {
  return PersonalRecordTypeSchema.options.filter((type) => set[RECORD_FLAG[type]]);
}

const RECORD_ICONS: Record<PersonalRecordType, string> = { one_rep_max: "🏆", best_set_volume: "🔥", max_reps: "💪" };

interface RecordEntry {
  type: PersonalRecordType;
  set: WorkoutSessionSet;
}

function findRecords(exercise: SessionExercise): RecordEntry[] {
  return exercise.loggedSets.flatMap((set) => recordTypesOf(set).map((type) => ({ type, set })));
}

/** 1RM is an estimate, so it is shown rounded to 0,5 kg */
const formatOneRepMax = ({ weightKg, reps }: WorkoutSessionSet) =>
  reps === 1 ? formatKg(weightKg) : formatEstimatedKg(estimateOneRepMaxKg(weightKg, reps));

function formatRecordNote({ type, set }: RecordEntry): string {
  switch (type) {
    case "one_rep_max":
      return set.reps === 1 ? `Max: ${formatOneRepMax(set)}` : `Max ${formatOneRepMax(set)}`;
    case "best_set_volume":
      return `Rekordowa seria: ${formatKg(set.weightKg * set.reps)}`;
    case "max_reps":
      return `Najwięcej powtórzeń: ${set.reps}`;
  }
}

function toRecordAchievement(exercise: SessionExercise, { type, set }: RecordEntry): CompletedWorkoutAchievement {
  const setResult = `(${formatKg(set.weightKg)} × ${set.reps})`;
  const content = {
    one_rep_max: {
      title: `Nowy max – ${exercise.name}`,
      description: set.reps === 1 ? `${formatKg(set.weightKg)} (1 powt.)` : `${formatOneRepMax(set)} ${setResult}`,
    },
    best_set_volume: {
      title: `Rekordowa seria – ${exercise.name}`,
      description: `${formatKg(set.weightKg * set.reps)} ${setResult}`,
    },
    max_reps: { title: `Najwięcej powtórzeń – ${exercise.name}`, description: `${set.reps} powt.` },
  }[type];
  return {
    id: `pr-${type}-${exercise.id}`,
    ...content,
    icon: RECORD_ICONS[type],
    badgeColor: PERSONAL_RECORD_META[type].color,
  };
}

function toCompletedWorkoutExercise(exercise: SessionExercise): CompletedWorkoutExercise {
  const base = { id: exercise.id, name: exercise.name, completed: exercise.completed };
  const topSet = findTopSet(exercise.loggedSets);
  if (!topSet) {
    return { ...base, setsSummary: formatSetsSummary(exercise), isPersonalRecord: false };
  }

  const setCount = exercise.loggedSets.length;
  const setsSummary = `${setCount} ${pluralizeSets(setCount)} • maks. ${formatSetResult(topSet)}`;
  const records = findRecords(exercise);
  return records.length > 0
    ? { ...base, setsSummary, isPersonalRecord: true, recordNote: records.map(formatRecordNote).join(" • ") }
    : { ...base, setsSummary, isPersonalRecord: false };
}

function toAchievements(session: WorkoutSession): CompletedWorkoutAchievement[] {
  const records = session.exercises.flatMap((exercise) =>
    findRecords(exercise).map((record) => toRecordAchievement(exercise, record)),
  );

  // Same volume rule as the live workout header (stored sets are always completed)
  const totalVolumeKg = computeVolumeKg(session.exercises.flatMap((exercise) => exercise.loggedSets));
  const volume =
    totalVolumeKg > 0
      ? [{ id: "volume", title: "Tonaż treningu", description: formatKg(totalVolumeKg), icon: "🏋️", badgeColor: "#007AFF" }]
      : [];

  return [...records, ...volume];
}

function uniqueTargetMuscles(session: WorkoutSession): string[] {
  return [...new Set(session.exercises.map((exercise) => exercise.targetMuscle))];
}

function countCompleted(session: WorkoutSession): number {
  return session.exercises.filter((exercise) => exercise.completed).length;
}

export function toCompletedWorkoutDetail(entry: WorkoutHistoryEntry, now: Date): CompletedWorkoutDetail {
  return {
    id: entry.id,
    title: entry.title,
    subtitle: uniqueTargetMuscles(entry).join(", "),
    completedDate: formatWorkoutDateLabel(entry.completedAt, now),
    durationMinutes: formatDurationMinutes(entry.durationSeconds),
    completedExerciseCount: countCompleted(entry),
    photoUri: entry.photoUri,
    exercises: entry.exercises.map(toCompletedWorkoutExercise),
    // Only workouts with logged sets have records and volume
    achievements: toAchievements(entry),
  };
}

/** Top carousel item — only workouts that have a photo. */
export function toRoutinePhotoItem(workout: CompletedWorkoutDetail): RoutinePhotoItem | null {
  if (!workout.photoUri) return null;
  return {
    id: workout.id,
    title: workout.title,
    subtitle: workout.subtitle || "Trening siłowy",
    photoUri: workout.photoUri,
    completedDate: workout.completedDate,
    durationMinutes: workout.durationMinutes,
    exercises: workout.exercises,
  };
}

export function toRecentActivity(entry: WorkoutHistoryEntry, now: Date): RecentActivity {
  return {
    id: entry.id,
    title: entry.title,
    completedAt: formatWorkoutDateLabel(entry.completedAt, now),
    durationMinutes: formatDurationMinutes(entry.durationSeconds),
    completedExerciseCount: countCompleted(entry),
    totalExerciseCount: entry.exercises.length,
    photoUri: entry.photoUri,
  };
}

export function toWorkoutSessionExport(session: WorkoutSession): WorkoutSessionExport {
  return {
    id: session.id,
    routineId: session.routineId,
    title: session.title,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt.toISOString(),
    durationSeconds: session.durationSeconds,
    hasPhoto: session.photoFileName !== null,
    exercises: session.exercises.map(({ name, targetMuscle, sets, targetReps, completed, loggedSets }) => ({
      name,
      targetMuscle,
      sets,
      targetReps,
      completed,
      // Internal row ids are not part of the user's data export
      loggedSets: loggedSets.map((set) => ({
        weightKg: set.weightKg,
        reps: set.reps,
        tag: set.tag,
        isOneRepMaxRecord: set.isOneRepMaxRecord,
        isBestSetVolumeRecord: set.isBestSetVolumeRecord,
        isMaxRepsRecord: set.isMaxRepsRecord,
      })),
    })),
  };
}

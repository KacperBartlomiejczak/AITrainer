import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import type { LiveWorkoutExercise, LiveWorkoutSet, PersonalRecordHits } from "@/schemas/live-workout.schema";
import type { RoutineLevel } from "@/schemas/routine.schema";
import type { NewUserRoutine, NewWorkoutSession } from "@/schemas/workout-history.schema";
import { mapCatalogExerciseMuscles } from "./catalog-muscles";

/** Catalog → live workout, and a finished live workout → a stored session / a user routine. */

type CreateId = (prefix: string) => string;

const ROUTINE_REST_SECONDS = 90;
const WEEKDAYS_PL = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"] as const;

export function getDefaultWorkoutTitle(date: Date): string {
  return `Trening – ${WEEKDAYS_PL[date.getDay()]}`;
}

/** The next set copies the previous weight and reps, so the user usually only ticks it. */
export function createNextSet(previous: LiveWorkoutSet | undefined, createId: CreateId): LiveWorkoutSet {
  return {
    id: createId("lws"),
    weightKg: previous?.weightKg ?? null,
    reps: previous?.reps ?? null,
    tag: null,
    isCompleted: false,
  };
}

/** null = the exercise has no muscle group we can show on the body diagram. */
export function createLiveExercise(exercise: CatalogExercise, createId: CreateId): LiveWorkoutExercise | null {
  const muscles = mapCatalogExerciseMuscles(exercise);
  if (!muscles) return null;
  return {
    id: createId("lwe"),
    catalogExerciseId: exercise.id,
    name: exercise.name,
    targetMuscle: exercise.target,
    ...muscles,
    sets: [createNextSet(undefined, createId)],
  };
}

export function formatRepsRange(reps: readonly number[]): string {
  if (reps.length === 0) return "—";
  const min = Math.min(...reps);
  const max = Math.max(...reps);
  return min === max ? String(min) : `${min}–${max}`;
}

const repsOf = (sets: readonly LiveWorkoutSet[]) => sets.flatMap((set) => (set.reps === null ? [] : [set.reps]));

export interface BuildSessionFromLiveWorkoutInput {
  exercises: readonly LiveWorkoutExercise[];
  title: string;
  startedAt: Date;
  completedAt: Date;
  personalRecordHits: PersonalRecordHits;
}

/** Candidate for `NewWorkoutSessionSchema` — the caller validates it. */
export function buildSessionFromLiveWorkout({
  exercises,
  title,
  startedAt,
  completedAt,
  personalRecordHits,
}: BuildSessionFromLiveWorkoutInput): NewWorkoutSession {
  return {
    routineId: null,
    title: title.trim() || getDefaultWorkoutTitle(completedAt),
    startedAt,
    completedAt,
    exercises: exercises.map((exercise) => {
      const completedSets = exercise.sets.filter((set) => set.isCompleted && set.reps !== null);
      const summarySets = completedSets.length > 0 ? completedSets : exercise.sets;
      return {
        catalogExerciseId: exercise.catalogExerciseId,
        name: exercise.name,
        targetMuscle: exercise.targetMuscle,
        sets: Math.max(1, summarySets.length),
        targetReps: formatRepsRange(repsOf(summarySets)),
        completed: completedSets.length > 0,
        loggedSets: completedSets.map((set) => {
          const records = personalRecordHits.get(set.id) ?? [];
          return {
            weightKg: set.weightKg ?? 0,
            reps: set.reps ?? 0,
            tag: set.tag,
            isOneRepMaxRecord: records.includes("one_rep_max"),
            isBestSetVolumeRecord: records.includes("best_set_volume"),
            isMaxRepsRecord: records.includes("max_reps"),
          };
        }),
      };
    }),
  };
}

export interface BuildRoutineFromLiveWorkoutInput {
  exercises: readonly LiveWorkoutExercise[];
  title: string;
  level: RoutineLevel;
  durationSeconds: number;
  completedAt: Date;
  createId: CreateId;
}

const formatDatePl = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;

/** Candidate for `NewUserRoutineSchema`: exercises the user actually did, working sets only. */
export function buildRoutineFromLiveWorkout({
  exercises,
  title,
  level,
  durationSeconds,
  completedAt,
  createId,
}: BuildRoutineFromLiveWorkoutInput): NewUserRoutine {
  const routineId = createId("rtn");
  return {
    id: routineId,
    title: title.trim() || getDefaultWorkoutTitle(completedAt),
    description: `Rutyna zapisana z treningu ${formatDatePl(completedAt)}`,
    level,
    daysPerWeek: 1,
    durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
    exercises: exercises.flatMap((exercise) => {
      const completedSets = exercise.sets.filter((set) => set.isCompleted && set.reps !== null);
      if (completedSets.length === 0) return [];
      const workingSets = completedSets.filter((set) => set.tag !== "warmup");
      const planSets = workingSets.length > 0 ? workingSets : completedSets;
      return [
        {
          id: createId("rtx"),
          name: exercise.name,
          targetMuscle: exercise.targetMuscle,
          sets: planSets.length,
          targetReps: formatRepsRange(repsOf(planSets)),
          restSeconds: ROUTINE_REST_SECONDS,
        },
      ];
    }),
  };
}

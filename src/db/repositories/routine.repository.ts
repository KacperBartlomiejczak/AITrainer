import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { LOCAL_USER_ID, type UserId } from "@/schemas/database.schema";
import {
  NewRoutineSchema,
  NewUserRoutineSchema,
  RoutineExerciseRowSchema,
  RoutineRowSchema,
  RoutineSchema,
  type NewRoutine,
  type NewUserRoutine,
  type Routine,
  type RoutineId,
} from "@/schemas/workout-history.schema";
import { routineExercises, routines } from "../schema";
import type { AppDatabase } from "../types";
import { parseOrThrow } from "./parse-or-throw";

const RoutineExerciseRowListSchema = z.array(RoutineExerciseRowSchema);

export interface RoutineRepository {
  /** Built-in routines plus the user's own, oldest first. Corrupted rows are skipped. */
  list: () => Promise<Routine[]>;
  getById: (id: RoutineId) => Promise<Routine | null>;
  /** Stores a routine owned by the user (e.g. saved from a finished workout). Rejects invalid data. */
  create: (routine: NewUserRoutine) => Promise<Routine>;
  /** Inserts routines that do not exist yet (safe to call on every app start). Rejects invalid definitions. */
  seed: (definitions: readonly NewRoutine[]) => Promise<void>;
}

export interface RoutineRepositoryOptions {
  userId?: UserId;
  now?: () => Date;
}

export function createRoutineRepository(
  db: AppDatabase,
  { userId = LOCAL_USER_ID, now = () => new Date() }: RoutineRepositoryOptions = {},
): RoutineRepository {
  const readRoutines = (routineIds?: readonly RoutineId[]): Routine[] => {
    const visibleToUser = or(isNull(routines.userId), eq(routines.userId, userId));
    const rawRoutines = db
      .select()
      .from(routines)
      .where(routineIds ? and(visibleToUser, inArray(routines.id, [...routineIds])) : visibleToUser)
      .orderBy(asc(routines.createdAt), asc(routines.id))
      .all();
    if (rawRoutines.length === 0) return [];

    const rawExercises = db
      .select()
      .from(routineExercises)
      .where(inArray(routineExercises.routineId, rawRoutines.map((routine) => routine.id)))
      .orderBy(asc(routineExercises.position))
      .all();

    return rawRoutines.flatMap((rawRoutine) => {
      // Rows are external data: Drizzle does not enforce enums or ranges at runtime
      const rawRoutineExercises = rawExercises.filter((exercise) => exercise.routineId === rawRoutine.id);
      const row = RoutineRowSchema.safeParse(rawRoutine);
      const exerciseRows = RoutineExerciseRowListSchema.safeParse(rawRoutineExercises);
      const routine =
        row.success && exerciseRows.success
          ? RoutineSchema.safeParse({ ...row.data, exercises: exerciseRows.data })
          : null;
      if (!routine?.success) {
        console.warn("[db] Stored routine failed validation", {
          raw: rawRoutine,
          rawExercises: rawRoutineExercises,
        });
        return [];
      }
      return [routine.data];
    });
  };

  return {
    async list() {
      return readRoutines();
    },

    async getById(id) {
      const [routine] = readRoutines([id]);
      return routine ?? null;
    },

    async create(input) {
      const timestamp = now();
      const { exercises, ...routine } = parseOrThrow(NewUserRoutineSchema, input, "user routine");
      const routineRow = parseOrThrow(
        RoutineRowSchema,
        { ...routine, userId, createdAt: timestamp, updatedAt: timestamp },
        "user routine row",
      );
      const exerciseRows = parseOrThrow(
        RoutineExerciseRowListSchema,
        exercises.map((exercise, position) => ({ ...exercise, routineId: routineRow.id, position })),
        "user routine exercise rows",
      );

      db.transaction((tx) => {
        tx.insert(routines).values(routineRow).run();
        tx.insert(routineExercises).values(exerciseRows).run();
      });

      return parseOrThrow(RoutineSchema, { ...routineRow, exercises: exerciseRows }, "user routine");
    },

    async seed(definitions) {
      const timestamp = now();
      const validDefinitions = definitions.map((definition) =>
        parseOrThrow(NewRoutineSchema, definition, `routine definition "${definition.id}"`),
      );

      db.transaction((tx) => {
        for (const { exercises, ...routine } of validDefinitions) {
          tx.insert(routines)
            .values({ ...routine, createdAt: timestamp, updatedAt: timestamp })
            .onConflictDoNothing({ target: routines.id })
            .run();
          tx.insert(routineExercises)
            .values(exercises.map((exercise, position) => ({ ...exercise, routineId: routine.id, position })))
            .onConflictDoNothing({ target: routineExercises.id })
            .run();
        }
      });
    },
  };
}

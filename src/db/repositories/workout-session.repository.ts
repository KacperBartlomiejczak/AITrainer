import { and, asc, desc, eq, inArray, isNull, notInArray, or } from "drizzle-orm";
import { z } from "zod";
import { createId as defaultCreateId } from "@/lib/create-id";
import { buildExerciseProgress, type ProgressSessionSets } from "@/lib/exercise-progress";
import { computePersonalBest, TAGS_EXCLUDED_FROM_RECORDS } from "@/lib/personal-records";
import type { ExerciseProgress } from "@/schemas/exercise-progress.schema";
import { LOCAL_USER_ID, type UserId } from "@/schemas/database.schema";
import type { PersonalBest } from "@/schemas/live-workout.schema";
import {
  CatalogExerciseIdSchema,
  NewWorkoutSessionSchema,
  WorkoutPhotoFileNameSchema,
  WorkoutSessionExerciseRowSchema,
  WorkoutSessionRowSchema,
  WorkoutSessionSchema,
  WorkoutSessionSetRowSchema,
  type CatalogExerciseId,
  type NewWorkoutSession,
  type WorkoutPhotoFileName,
  type WorkoutSession,
  type WorkoutSessionId,
} from "@/schemas/workout-history.schema";
import { workoutSessionExercises, workoutSessionSets, workoutSessions } from "../schema";
import type { AppDatabase } from "../types";
import { parseOrThrow } from "./parse-or-throw";

const SessionExerciseRowListSchema = z.array(WorkoutSessionExerciseRowSchema);
const SessionSetRowListSchema = z.array(WorkoutSessionSetRowSchema);
const RecordSourceSetSchema = WorkoutSessionSetRowSchema.pick({ weightKg: true, reps: true, tag: true }).extend({
  catalogExerciseId: CatalogExerciseIdSchema,
});
type RecordSourceSet = Omit<z.infer<typeof RecordSourceSetSchema>, "catalogExerciseId">;
const ProgressSourceSetSchema = WorkoutSessionSetRowSchema.pick({ weightKg: true, reps: true, tag: true }).extend({
  sessionId: WorkoutSessionRowSchema.shape.id,
  completedAt: WorkoutSessionRowSchema.shape.completedAt,
});

type SessionExerciseRow = z.infer<typeof WorkoutSessionExerciseRowSchema>;
type SessionSetRow = z.infer<typeof WorkoutSessionSetRowSchema>;

function withLoggedSets(exercises: SessionExerciseRow[], sets: SessionSetRow[]) {
  return exercises.map((exercise) => ({
    ...exercise,
    loggedSets: sets.filter((set) => set.sessionExerciseId === exercise.id),
  }));
}

export interface WorkoutSessionRepository {
  /** The user's completed workouts, newest first. Corrupted rows are skipped. */
  list: () => Promise<WorkoutSession[]>;
  /** Stores a finished workout (without a photo). Rejects invalid data. */
  save: (session: NewWorkoutSession) => Promise<WorkoutSession>;
  /** Sets or clears the optional photo and resolves with the previous file name (to delete its file). */
  setPhoto: (
    sessionId: WorkoutSessionId,
    photoFileName: WorkoutPhotoFileName | null,
  ) => Promise<WorkoutPhotoFileName | null>;
  /** Best working set (heaviest, then most reps) per catalog exercise across the user's history. */
  getPersonalBests: (catalogExerciseIds: readonly CatalogExerciseId[]) => Promise<PersonalBest[]>;
  /** Results of one catalog exercise per saved workout (chart) and the all-time summary. */
  getExerciseProgress: (catalogExerciseId: CatalogExerciseId) => Promise<ExerciseProgress>;
  /** Deletes the user's whole workout history (GDPR-style data deletion). */
  clearAll: () => Promise<void>;
}

export interface WorkoutSessionRepositoryOptions {
  userId?: UserId;
  now?: () => Date;
  createId?: (prefix: string) => string;
}

export function createWorkoutSessionRepository(
  db: AppDatabase,
  {
    userId = LOCAL_USER_ID,
    now = () => new Date(),
    createId = defaultCreateId,
  }: WorkoutSessionRepositoryOptions = {},
): WorkoutSessionRepository {
  const findSessionRow = (sessionId: WorkoutSessionId) =>
    db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)))
      .get();

  return {
    async list() {
      const rawSessions = db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.userId, userId))
        .orderBy(desc(workoutSessions.completedAt), desc(workoutSessions.createdAt))
        .all();
      if (rawSessions.length === 0) return [];

      const rawExercises = db
        .select()
        .from(workoutSessionExercises)
        .where(inArray(workoutSessionExercises.sessionId, rawSessions.map((session) => session.id)))
        .orderBy(asc(workoutSessionExercises.position))
        .all();

      const rawSets = db
        .select()
        .from(workoutSessionSets)
        .where(inArray(workoutSessionSets.sessionExerciseId, rawExercises.map((exercise) => exercise.id)))
        .orderBy(asc(workoutSessionSets.position))
        .all();

      return rawSessions.flatMap((rawSession) => {
        const rawSessionExercises = rawExercises.filter((exercise) => exercise.sessionId === rawSession.id);
        const exerciseIds = new Set(rawSessionExercises.map((exercise) => exercise.id));
        const rawSessionSets = rawSets.filter((set) => exerciseIds.has(set.sessionExerciseId));
        // Rows are external data: Drizzle does not enforce enums, ranges or file name rules at runtime
        const row = WorkoutSessionRowSchema.safeParse(rawSession);
        const exerciseRows = SessionExerciseRowListSchema.safeParse(rawSessionExercises);
        const setRows = SessionSetRowListSchema.safeParse(rawSessionSets);
        const session =
          row.success && exerciseRows.success && setRows.success
            ? WorkoutSessionSchema.safeParse({
                ...row.data,
                exercises: withLoggedSets(exerciseRows.data, setRows.data),
              })
            : null;
        if (!session?.success) {
          console.warn("[db] Stored workout session failed validation", {
            raw: rawSession,
            rawExercises: rawSessionExercises,
            rawSets: rawSessionSets,
          });
          return [];
        }
        return [session.data];
      });
    },

    async save(input) {
      const { exercises, ...session } = parseOrThrow(NewWorkoutSessionSchema, input, "workout session");
      const sessionRow = parseOrThrow(
        WorkoutSessionRowSchema,
        {
          ...session,
          id: createId("wks"),
          userId,
          durationSeconds: Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000),
          photoFileName: null,
          createdAt: now(),
        },
        "workout session row",
      );
      const exercisesWithIds = exercises.map(({ loggedSets = [], catalogExerciseId = null, ...exercise }, position) => ({
        row: {
          ...exercise,
          id: createId("wse"),
          sessionId: sessionRow.id,
          position,
          catalogExerciseId,
        },
        loggedSets,
      }));
      const exerciseRows = parseOrThrow(
        SessionExerciseRowListSchema,
        exercisesWithIds.map(({ row }) => row),
        "workout session exercise rows",
      );
      const setRows = parseOrThrow(
        SessionSetRowListSchema,
        exercisesWithIds.flatMap(({ row, loggedSets }) =>
          loggedSets.map((set, position) => ({ ...set, id: createId("wss"), sessionExerciseId: row.id, position })),
        ),
        "workout session set rows",
      );

      db.transaction((tx) => {
        tx.insert(workoutSessions).values(sessionRow).run();
        tx.insert(workoutSessionExercises).values(exerciseRows).run();
        if (setRows.length > 0) {
          tx.insert(workoutSessionSets).values(setRows).run();
        }
      });

      return parseOrThrow(
        WorkoutSessionSchema,
        { ...sessionRow, exercises: withLoggedSets(exerciseRows, setRows) },
        "workout session",
      );
    },

    async setPhoto(sessionId, photoFileName) {
      const nextFileName =
        photoFileName === null
          ? null
          : parseOrThrow(WorkoutPhotoFileNameSchema, photoFileName, "workout photo file name");
      const existing = findSessionRow(sessionId);
      if (!existing) {
        throw new Error(`[db] Workout session "${sessionId}" does not exist`);
      }

      db.update(workoutSessions)
        .set({ photoFileName: nextFileName })
        .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)))
        .run();

      const previous = WorkoutPhotoFileNameSchema.safeParse(existing.photoFileName);
      // An invalid stored value is never handed out, so a caller cannot delete a file outside the photo directory
      return previous.success ? previous.data : null;
    },

    async getPersonalBests(catalogExerciseIds) {
      if (catalogExerciseIds.length === 0) return [];

      const rawSets = db
        .select({
          catalogExerciseId: workoutSessionExercises.catalogExerciseId,
          weightKg: workoutSessionSets.weightKg,
          reps: workoutSessionSets.reps,
          tag: workoutSessionSets.tag,
        })
        .from(workoutSessionSets)
        .innerJoin(workoutSessionExercises, eq(workoutSessionSets.sessionExerciseId, workoutSessionExercises.id))
        .innerJoin(workoutSessions, eq(workoutSessionExercises.sessionId, workoutSessions.id))
        .where(
          and(
            eq(workoutSessions.userId, userId),
            inArray(workoutSessionExercises.catalogExerciseId, [...catalogExerciseIds]),
            or(isNull(workoutSessionSets.tag), notInArray(workoutSessionSets.tag, [...TAGS_EXCLUDED_FROM_RECORDS])),
          ),
        )
        .all();

      const setsByExercise = new Map<CatalogExerciseId, RecordSourceSet[]>();
      for (const rawSet of rawSets) {
        // Rows are external data: skip anything that does not match the stored set rules
        const set = RecordSourceSetSchema.safeParse(rawSet);
        if (!set.success) {
          console.warn("[db] Stored workout set failed validation", { raw: rawSet });
          continue;
        }
        const { catalogExerciseId, ...result } = set.data;
        setsByExercise.set(catalogExerciseId, [...(setsByExercise.get(catalogExerciseId) ?? []), result]);
      }

      return catalogExerciseIds.flatMap((id) => {
        const best = computePersonalBest(id, setsByExercise.get(id) ?? []);
        return best ? [best] : [];
      });
    },

    async getExerciseProgress(catalogExerciseId) {
      const rawSets = db
        .select({
          sessionId: workoutSessions.id,
          completedAt: workoutSessions.completedAt,
          weightKg: workoutSessionSets.weightKg,
          reps: workoutSessionSets.reps,
          tag: workoutSessionSets.tag,
        })
        .from(workoutSessionSets)
        .innerJoin(workoutSessionExercises, eq(workoutSessionSets.sessionExerciseId, workoutSessionExercises.id))
        .innerJoin(workoutSessions, eq(workoutSessionExercises.sessionId, workoutSessions.id))
        .where(
          and(
            eq(workoutSessions.userId, userId),
            eq(workoutSessionExercises.catalogExerciseId, catalogExerciseId),
            or(isNull(workoutSessionSets.tag), notInArray(workoutSessionSets.tag, [...TAGS_EXCLUDED_FROM_RECORDS])),
          ),
        )
        .all();

      const sessions = new Map<string, ProgressSessionSets & { sets: RecordSourceSet[] }>();
      for (const rawSet of rawSets) {
        const set = ProgressSourceSetSchema.safeParse(rawSet);
        if (!set.success) {
          console.warn("[db] Stored workout set failed validation", { raw: rawSet });
          continue;
        }
        const { sessionId, completedAt, ...result } = set.data;
        const session = sessions.get(sessionId) ?? { sessionId, completedAt, sets: [] };
        session.sets.push(result);
        sessions.set(sessionId, session);
      }
      return buildExerciseProgress(catalogExerciseId, [...sessions.values()]);
    },

    async clearAll() {
      // Session exercises and their sets are removed by ON DELETE CASCADE
      db.delete(workoutSessions).where(eq(workoutSessions.userId, userId)).run();
    },
  };
}

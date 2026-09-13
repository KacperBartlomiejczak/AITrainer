import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { createId as defaultCreateId } from "@/lib/create-id";
import { LOCAL_USER_ID, type UserId } from "@/schemas/database.schema";
import {
  NewWorkoutSessionSchema,
  WorkoutPhotoFileNameSchema,
  WorkoutSessionExerciseRowSchema,
  WorkoutSessionRowSchema,
  WorkoutSessionSchema,
  type NewWorkoutSession,
  type WorkoutPhotoFileName,
  type WorkoutSession,
  type WorkoutSessionId,
} from "@/schemas/workout-history.schema";
import { workoutSessionExercises, workoutSessions } from "../schema";
import type { AppDatabase } from "../types";
import { parseOrThrow } from "./parse-or-throw";

const SessionExerciseRowListSchema = z.array(WorkoutSessionExerciseRowSchema);

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

      return rawSessions.flatMap((rawSession) => {
        const rawSessionExercises = rawExercises.filter((exercise) => exercise.sessionId === rawSession.id);
        // Rows are external data: Drizzle does not enforce enums, ranges or file name rules at runtime
        const row = WorkoutSessionRowSchema.safeParse(rawSession);
        const exerciseRows = SessionExerciseRowListSchema.safeParse(rawSessionExercises);
        const session =
          row.success && exerciseRows.success
            ? WorkoutSessionSchema.safeParse({ ...row.data, exercises: exerciseRows.data })
            : null;
        if (!session?.success) {
          console.warn("[db] Stored workout session failed validation", {
            raw: rawSession,
            rawExercises: rawSessionExercises,
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
      const exerciseRows = parseOrThrow(
        SessionExerciseRowListSchema,
        exercises.map((exercise, position) => ({
          ...exercise,
          id: createId("wse"),
          sessionId: sessionRow.id,
          position,
        })),
        "workout session exercise rows",
      );

      db.transaction((tx) => {
        tx.insert(workoutSessions).values(sessionRow).run();
        tx.insert(workoutSessionExercises).values(exerciseRows).run();
      });

      return parseOrThrow(WorkoutSessionSchema, { ...sessionRow, exercises: exerciseRows }, "workout session");
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

    async clearAll() {
      // Session exercises are removed by ON DELETE CASCADE
      db.delete(workoutSessions).where(eq(workoutSessions.userId, userId)).run();
    },
  };
}

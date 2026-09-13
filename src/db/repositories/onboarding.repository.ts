import { eq } from "drizzle-orm";
import { getSelectedMuscleGroups } from "@/lib/muscle-focus";
import {
  LOCAL_USER_ID,
  UserFocusMuscleGroupRowListSchema,
  UserProfileRowSchema,
  type UserId,
} from "@/schemas/database.schema";
import {
  MuscleGroupSchema,
  OnboardingFormSchema,
  type MuscleGroup,
  type OnboardingFormData,
} from "@/schemas/onboarding.schema";
import { userFocusMuscleGroups, userProfiles } from "../schema";
import type { AppDatabase } from "../types";
import { parseOrThrow } from "./parse-or-throw";

export interface OnboardingRepository {
  /** Completed onboarding for the user, or null when missing / unreadable. */
  load: () => Promise<OnboardingFormData | null>;
  /** Insert or update the user's onboarding data. Rejects invalid data. */
  save: (data: OnboardingFormData) => Promise<void>;
  /** Delete all onboarding data for the user (GDPR-style data deletion). */
  clear: () => Promise<void>;
}

export interface OnboardingRepositoryOptions {
  userId?: UserId;
  now?: () => Date;
}

/** Muscle groups deduplicated and ordered like `MuscleGroupSchema` for stable reads/writes. */
function toCanonicalMuscleGroups(groups: readonly MuscleGroup[]): MuscleGroup[] {
  return MuscleGroupSchema.options.filter((group) => groups.includes(group));
}

export function createOnboardingRepository(
  db: AppDatabase,
  { userId = LOCAL_USER_ID, now = () => new Date() }: OnboardingRepositoryOptions = {},
): OnboardingRepository {
  return {
    async load() {
      const rawProfile = db.select().from(userProfiles).where(eq(userProfiles.id, userId)).get();
      if (!rawProfile) return null;

      const rawMuscleGroups = db
        .select()
        .from(userFocusMuscleGroups)
        .where(eq(userFocusMuscleGroups.userId, userId))
        .all();

      // Rows are external data: Drizzle does not enforce enums or dates at runtime
      const profile = UserProfileRowSchema.safeParse(rawProfile);
      const muscleGroups = UserFocusMuscleGroupRowListSchema.safeParse(rawMuscleGroups);
      if (!profile.success || !muscleGroups.success) {
        console.warn("[db] Stored onboarding rows failed validation", {
          raw: rawProfile,
          rawMuscleGroups,
        });
        return null;
      }

      const storedGroups = toCanonicalMuscleGroups(muscleGroups.data.map((row) => row.muscleGroup));
      // Only attach groups when rows exist, so Zod's strict union rejects
      // "undecided" with rows and "selected" without rows
      const muscleFocusCandidate =
        storedGroups.length > 0
          ? { mode: profile.data.muscleFocusMode, muscleGroups: storedGroups }
          : { mode: profile.data.muscleFocusMode };

      const onboarding = OnboardingFormSchema.safeParse({
        name: profile.data.name,
        experienceLevel: profile.data.experienceLevel,
        fitnessGoal: profile.data.fitnessGoal,
        muscleFocus: muscleFocusCandidate,
      });
      if (!onboarding.success) {
        console.warn("[db] Stored onboarding is incomplete", {
          raw: rawProfile,
          rawMuscleGroups,
        });
        return null;
      }
      return onboarding.data;
    },

    async save(data) {
      const onboarding = parseOrThrow(OnboardingFormSchema, data, "onboarding data");
      const timestamp = now();

      const profileRow = parseOrThrow(
        UserProfileRowSchema,
        {
          id: userId,
          name: onboarding.name,
          experienceLevel: onboarding.experienceLevel,
          fitnessGoal: onboarding.fitnessGoal,
          muscleFocusMode: onboarding.muscleFocus.mode,
          onboardingCompletedAt: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        "user profile row",
      );
      const muscleGroupRows = parseOrThrow(
        UserFocusMuscleGroupRowListSchema,
        toCanonicalMuscleGroups(getSelectedMuscleGroups(onboarding.muscleFocus)).map((muscleGroup) => ({
          userId,
          muscleGroup,
        })),
        "focus muscle group rows",
      );

      db.transaction((tx) => {
        tx.insert(userProfiles)
          .values(profileRow)
          .onConflictDoUpdate({
            target: userProfiles.id,
            // created_at and onboarding_completed_at keep their first values
            set: {
              name: profileRow.name,
              experienceLevel: profileRow.experienceLevel,
              fitnessGoal: profileRow.fitnessGoal,
              muscleFocusMode: profileRow.muscleFocusMode,
              updatedAt: profileRow.updatedAt,
            },
          })
          .run();
        tx.delete(userFocusMuscleGroups).where(eq(userFocusMuscleGroups.userId, userId)).run();
        if (muscleGroupRows.length > 0) {
          tx.insert(userFocusMuscleGroups).values(muscleGroupRows).run();
        }
      });
    },

    async clear() {
      db.transaction((tx) => {
        tx.delete(userFocusMuscleGroups).where(eq(userFocusMuscleGroups.userId, userId)).run();
        tx.delete(userProfiles).where(eq(userProfiles.id, userId)).run();
      });
    },
  };
}

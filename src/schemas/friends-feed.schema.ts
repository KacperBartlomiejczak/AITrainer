import { z } from "zod";

/**
 * Friends' workout feed on the home screen.
 * Mock data only for now (`src/lib/mock-friends-feed.ts`) — not stored in the database.
 */
export const FriendWorkoutFeedItemSchema = z.object({
  id: z.string().min(1),
  friendName: z.string().trim().min(1).max(60),
  friendInitials: z.string().trim().min(1).max(2),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  workoutTitle: z.string().trim().min(1).max(120),
  completedAtLabel: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  exerciseCount: z.number().int().positive(),
  /** Key from `EXERCISE_ASSET_MAP`; null = post without a photo */
  photoAssetKey: z.string().min(1).nullable(),
  highlight: z.string().trim().min(1).max(120).nullable(),
  likesCount: z.number().int().nonnegative(),
  commentsCount: z.number().int().nonnegative(),
});

export const FriendWorkoutFeedSchema = z.array(FriendWorkoutFeedItemSchema);

export type FriendWorkoutFeedItem = z.infer<typeof FriendWorkoutFeedItemSchema>;

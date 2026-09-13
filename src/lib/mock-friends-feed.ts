import type { FriendWorkoutFeedItem } from "@/schemas/friends-feed.schema";

/**
 * Placeholder feed of friends' workouts for the home screen.
 * Mock only — there is no friends feature or backend yet, so nothing here is stored in the database.
 */
export const MOCK_FRIENDS_FEED: readonly FriendWorkoutFeedItem[] = [
  {
    id: "feed_ola_01",
    friendName: "Ola Nowak",
    friendInitials: "ON",
    avatarColor: "#EC4899",
    workoutTitle: "FBW A — Całe ciało",
    completedAtLabel: "35 min temu",
    durationMinutes: 48,
    exerciseCount: 5,
    photoAssetKey: "example_past_photo",
    highlight: "Pierwszy raz przysiad z 60 kg! 🎉",
    likesCount: 14,
    commentsCount: 3,
  },
  {
    id: "feed_michal_01",
    friendName: "Michał Wiśniewski",
    friendInitials: "MW",
    avatarColor: "#38BDF8",
    workoutTitle: "Plecy + Biceps",
    completedAtLabel: "Dziś, 07:10",
    durationMinutes: 62,
    exerciseCount: 6,
    photoAssetKey: "0007",
    highlight: null,
    likesCount: 8,
    commentsCount: 1,
  },
  {
    id: "feed_kasia_01",
    friendName: "Kasia Zielińska",
    friendInitials: "KZ",
    avatarColor: "#22C55E",
    workoutTitle: "FBW B — Całe ciało",
    completedAtLabel: "Wczoraj, 19:40",
    durationMinutes: 41,
    exerciseCount: 5,
    photoAssetKey: null,
    highlight: "4 treningi w tym tygodniu 💪",
    likesCount: 21,
    commentsCount: 5,
  },
];

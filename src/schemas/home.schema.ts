import { z } from "zod";
import { UserProfileSchema } from "./user.schema";
import { WorkoutSummarySchema, RecentActivitySchema } from "./workout.schema";
import { AiCoachTipSchema } from "./ai-coach.schema";
import { FriendWorkoutFeedSchema } from "./friends-feed.schema";

export const DayStatusSchema = z.enum(["completed", "today_pending", "rest", "upcoming", "missed"]);

export const WeeklyDayProgressSchema = z.object({
  dayLabel: z.string().min(1), // e.g. "Pn", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"
  dateNumber: z.number().int().positive(),
  status: DayStatusSchema,
  isToday: z.boolean().default(false),
});

export const QuickActionItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  iconName: z.string().min(1),
  route: z.string().min(1),
  badgeText: z.string().optional(),
});

export const HomeScreenDataSchema = z.object({
  user: UserProfileSchema,
  todayWorkout: WorkoutSummarySchema.nullable(),
  weeklyProgress: z.object({
    completedCount: z.number().int().nonnegative(),
    targetCount: z.number().int().positive(),
    days: z.array(WeeklyDayProgressSchema).length(7),
  }),
  aiCoachTip: AiCoachTipSchema.nullable(),
  quickActions: z.array(QuickActionItemSchema),
  recentActivity: RecentActivitySchema.nullable(),
  friendsFeed: FriendWorkoutFeedSchema,
});

export type DayStatus = z.infer<typeof DayStatusSchema>;
export type WeeklyDayProgress = z.infer<typeof WeeklyDayProgressSchema>;
export type QuickActionItem = z.infer<typeof QuickActionItemSchema>;
export type HomeScreenData = z.infer<typeof HomeScreenDataSchema>;

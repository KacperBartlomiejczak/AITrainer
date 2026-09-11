import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  streakDays: z.number().int().nonnegative().default(0),
  weeklyGoal: z.number().int().positive().default(4),
  completedWorkoutsThisWeek: z.number().int().nonnegative().default(0),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

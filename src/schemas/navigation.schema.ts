import { z } from "zod";

export const NavTabIdSchema = z.enum(["home", "workouts", "ranking", "profile"]);

export const NavItemSchema = z.object({
  id: NavTabIdSchema,
  label: z.string().min(1),
  iconName: z.enum(["Home", "Dumbbell", "Trophy", "User"]),
  route: z.string().min(1),
  testID: z.string().min(1),
});

export const NavTabListSchema = z.array(NavItemSchema).min(3).max(5);

export type NavTabId = z.infer<typeof NavTabIdSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
export type NavTabList = z.infer<typeof NavTabListSchema>;

import { z } from "zod";

export const NavTabIdSchema = z.enum([
  "home",
  "workouts",
  "ai-mentor",
  "ranking",
  "profile",
]);

export const NavItemSchema = z.object({
  id: NavTabIdSchema,
  label: z.string().min(1),
  iconName: z.enum(["Home", "Dumbbell", "Sparkles", "Trophy", "User"]),
  route: z.string().min(1),
  testID: z.string().min(1),
});

export const NavTabListSchema = z.array(NavItemSchema).min(3).max(5);

/** Measured position/size of a single nav item, reported once via `onLayout`. */
export const NavItemLayoutSchema = z.object({
  x: z.number().min(0),
  width: z.number().positive(),
});

export type NavTabId = z.infer<typeof NavTabIdSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
export type NavTabList = z.infer<typeof NavTabListSchema>;
export type NavItemLayout = z.infer<typeof NavItemLayoutSchema>;

/** Routes the root onboarding guard is allowed to redirect to. */
export const OnboardingRedirectRouteSchema = z.enum(["/", "/(onboarding)/step-name"]);

/** Snapshot of app state the root onboarding guard decides on. */
export const OnboardingGuardInputSchema = z.object({
  isHydrated: z.boolean(),
  isSplashActive: z.boolean(),
  hasCompletedOnboarding: z.boolean(),
  segments: z.array(z.string()),
});

export type OnboardingRedirectRoute = z.infer<typeof OnboardingRedirectRouteSchema>;
export type OnboardingGuardInput = z.infer<typeof OnboardingGuardInputSchema>;

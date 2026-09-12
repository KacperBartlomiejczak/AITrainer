import { z } from "zod";

/**
 * Zod schema for SplashScreen configuration.
 * Validates duration and overlay presentation parameters.
 */
export const SplashScreenConfigSchema = z.object({
  durationMs: z.number().positive().default(1800),
  isOverlay: z.boolean().default(false),
});

export type SplashScreenConfig = z.infer<typeof SplashScreenConfigSchema>;

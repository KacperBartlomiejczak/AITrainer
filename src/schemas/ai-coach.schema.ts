import { z } from "zod";

export const AiCoachTipCategorySchema = z.enum([
  "motivation",
  "recovery",
  "technique",
  "plan_adjustment",
  "nutrition",
]);

export const AiCoachTipSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  category: AiCoachTipCategorySchema.default("motivation"),
  suggestedAction: z.string().optional(),
  actionRoute: z.string().optional(),
  timestamp: z.string().optional(),
});

export type AiCoachTipCategory = z.infer<typeof AiCoachTipCategorySchema>;
export type AiCoachTip = z.infer<typeof AiCoachTipSchema>;

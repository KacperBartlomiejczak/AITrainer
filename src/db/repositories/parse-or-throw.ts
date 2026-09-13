import { z } from "zod";

/** Validates data before it is written; invalid data is a programming error, so it throws. */
export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown, label: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`[db] Invalid ${label}: ${z.prettifyError(result.error)}`);
  }
  return result.data;
}

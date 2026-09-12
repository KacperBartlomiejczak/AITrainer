import { SplashScreenConfigSchema } from "../splash.schema";

describe("SplashScreenConfigSchema", () => {
  it("applies default values for durationMs and isOverlay", () => {
    const result = SplashScreenConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMs).toBe(1800);
      expect(result.data.isOverlay).toBe(false);
    }
  });

  it("accepts valid custom durationMs and isOverlay", () => {
    const result = SplashScreenConfigSchema.safeParse({
      durationMs: 2500,
      isOverlay: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMs).toBe(2500);
      expect(result.data.isOverlay).toBe(true);
    }
  });

  it("rejects non-positive durationMs", () => {
    const negativeResult = SplashScreenConfigSchema.safeParse({ durationMs: -100 });
    expect(negativeResult.success).toBe(false);

    const zeroResult = SplashScreenConfigSchema.safeParse({ durationMs: 0 });
    expect(zeroResult.success).toBe(false);
  });
});

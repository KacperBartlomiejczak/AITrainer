import { RankingMuscleGroupSchema, mapSlugToRankingMuscle } from "@/schemas/ranking.schema";
import { RANKING_MUSCLE_SLUGS, toTrainedBodyParts, TRAINED_MUSCLE_COLORS } from "../body-highlighter-slugs";

describe("RANKING_MUSCLE_SLUGS", () => {
  it("covers every ranking muscle group with slugs that map back to it", () => {
    for (const muscle of RankingMuscleGroupSchema.options) {
      const slugs = RANKING_MUSCLE_SLUGS[muscle];
      expect(slugs.length).toBeGreaterThan(0);
      for (const slug of slugs) {
        expect(mapSlugToRankingMuscle(slug)).toBe(muscle);
      }
    }
  });
});

describe("toTrainedBodyParts", () => {
  it("returns no highlighted parts for an empty workout", () => {
    expect(toTrainedBodyParts([])).toEqual([]);
  });

  it("colors primary muscles fully and secondary muscles dimmed", () => {
    const parts = toTrainedBodyParts([
      { muscle: "biceps", intensity: "primary" },
      { muscle: "abs", intensity: "secondary" },
    ]);

    expect(parts).toEqual([
      { slug: "biceps", styles: { fill: TRAINED_MUSCLE_COLORS.primary } },
      { slug: "abs", styles: { fill: TRAINED_MUSCLE_COLORS.secondary } },
      { slug: "obliques", styles: { fill: TRAINED_MUSCLE_COLORS.secondary } },
    ]);
  });
});

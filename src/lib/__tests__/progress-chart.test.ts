import { buildChartGeometry, formatChartDate } from "../progress-chart";

const box = { width: 300, height: 120, padding: 10 };

describe("buildChartGeometry", () => {
  it("returns no points when there is nothing to draw", () => {
    expect(buildChartGeometry([], box)).toEqual({ points: [], path: "", minValue: null, maxValue: null });
    expect(buildChartGeometry([{ label: "10.09", value: null }], box).points).toEqual([]);
  });

  it("spreads points over the width and puts higher values higher", () => {
    const geometry = buildChartGeometry(
      [
        { label: "10.09", value: 80 },
        { label: "12.09", value: null },
        { label: "14.09", value: 100 },
      ],
      box,
    );

    expect(geometry.points.map((point) => point.label)).toEqual(["10.09", "14.09"]);
    expect(geometry.points[0]?.x).toBe(10);
    expect(geometry.points[1]?.x).toBe(290);
    expect(geometry.points[1]!.y).toBeLessThan(geometry.points[0]!.y);
    expect(geometry.points.every((point) => point.y >= 10 && point.y <= 110)).toBe(true);
    expect(geometry.path).toMatch(/^M10(\.\d+)? [\d.]+ L290 [\d.]+$/);
    expect(geometry).toMatchObject({ minValue: 80, maxValue: 100 });
  });

  it("centers a single point and draws a flat line in the middle for equal values", () => {
    expect(buildChartGeometry([{ label: "10.09", value: 80 }], box).points).toEqual([
      { x: 150, y: 60, value: 80, label: "10.09" },
    ]);
    const flat = buildChartGeometry(
      [
        { label: "a", value: 50 },
        { label: "b", value: 50 },
      ],
      box,
    );
    expect(flat.points.map((point) => point.y)).toEqual([60, 60]);
  });
});

describe("formatChartDate", () => {
  it("formats dd.mm", () => {
    expect(formatChartDate(new Date(2026, 8, 5))).toBe("05.09");
  });
});

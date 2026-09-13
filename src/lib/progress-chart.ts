/** Pure geometry for the progress line chart (drawn with react-native-svg). */

export interface ChartInputPoint {
  label: string;
  /** null = no value for this workout (skipped) */
  value: number | null;
}

export interface ChartPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

export interface ChartBox {
  width: number;
  height: number;
  padding: number;
}

export interface ChartGeometry {
  points: ChartPoint[];
  /** SVG path "M x y L x y …" */
  path: string;
  minValue: number | null;
  maxValue: number | null;
}

const round = (value: number) => Math.round(value * 100) / 100;

export function buildChartGeometry(input: readonly ChartInputPoint[], { width, height, padding }: ChartBox): ChartGeometry {
  const values = input.flatMap((point) => (point.value === null ? [] : [{ label: point.label, value: point.value }]));
  if (values.length === 0) return { points: [], path: "", minValue: null, maxValue: null };

  const minValue = Math.min(...values.map((point) => point.value));
  const maxValue = Math.max(...values.map((point) => point.value));
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = values.map(({ label, value }, index) => ({
    x: round(values.length === 1 ? width / 2 : padding + (innerWidth * index) / (values.length - 1)),
    // Equal values sit in the middle; otherwise the lowest value is at the bottom
    y: round(maxValue === minValue ? height / 2 : padding + innerHeight * (1 - (value - minValue) / (maxValue - minValue))),
    value,
    label,
  }));

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  return { points, path, minValue, maxValue };
}

export function formatChartDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

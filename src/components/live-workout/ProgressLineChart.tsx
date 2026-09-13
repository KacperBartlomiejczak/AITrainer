import React, { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { formatKg } from "@/lib/live-workout-stats";
import { buildChartGeometry, type ChartInputPoint } from "@/lib/progress-chart";

interface ProgressLineChartProps {
  points: readonly ChartInputPoint[];
  unit: "kg" | "powt.";
  color?: string;
}

const BOX = { width: 320, height: 140, padding: 14 };

const formatValue = (value: number, unit: ProgressLineChartProps["unit"]) =>
  unit === "kg" ? formatKg(value) : `${value} powt.`;

/** Line chart of the user's results per saved workout (oldest → newest). */
export function ProgressLineChart({ points, unit, color = "#38BDF8" }: ProgressLineChartProps) {
  const geometry = useMemo(() => buildChartGeometry(points, BOX), [points]);
  const first = geometry.points[0];
  const last = geometry.points.at(-1);

  if (!first || !last) {
    return (
      <View className="h-36 items-center justify-center rounded-2xl bg-[#121214] border border-[#27272A]">
        <Text className="text-xs text-[#71717A]">Brak danych do wykresu</Text>
      </View>
    );
  }

  return (
    <View testID="progress-chart" className="rounded-2xl bg-[#121214] border border-[#27272A] p-3 gap-1">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-[11px] text-[#71717A]">Ostatni trening</Text>
        <Text className="text-base font-black text-white">{formatValue(last.value, unit)}</Text>
      </View>
      <Svg width="100%" height={BOX.height} viewBox={`0 0 ${BOX.width} ${BOX.height}`}>
        <Line x1={BOX.padding} x2={BOX.width - BOX.padding} y1={BOX.height - BOX.padding} y2={BOX.height - BOX.padding} stroke="#27272A" strokeWidth={1} />
        <Path d={geometry.path} stroke={color} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {geometry.points.map((point, index) => (
          <Circle
            key={`${point.label}-${index}`}
            testID="progress-chart-point"
            cx={point.x}
            cy={point.y}
            r={point === last ? 5.5 : 4}
            fill={point === last ? color : "#0A0A0C"}
            stroke={color}
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View className="flex-row justify-between">
        <Text className="text-[10px] text-[#71717A]">{first.label}</Text>
        {last !== first ? <Text className="text-[10px] text-[#71717A]">{last.label}</Text> : null}
      </View>
    </View>
  );
}

import React, { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import type { ProgressSheetStatus } from "@/hooks/use-exercise-progress-sheet";
import { getProgressValue } from "@/lib/exercise-progress";
import { formatChartDate } from "@/lib/progress-chart";
import type { FilterOption } from "@/schemas/exercise-picker.schema";
import { PROGRESS_METRIC_LABELS, type ExerciseProgress, type ProgressMetric } from "@/schemas/exercise-progress.schema";
import { PERSONAL_RECORD_META } from "@/schemas/live-workout.schema";
import { ExerciseProgressSummaryTiles } from "./ExerciseProgressSummaryTiles";
import { FilterChipRow } from "./FilterChipRow";
import { ProgressLineChart } from "./ProgressLineChart";

interface ExerciseProgressBodyProps {
  status: ProgressSheetStatus;
  progress: ExerciseProgress | null;
  availableMetrics: readonly ProgressMetric[];
  metric: ProgressMetric;
  onSelectMetric: (metric: ProgressMetric) => void;
}

const METRIC_EMOJI: Record<ProgressMetric, string> = { one_rep_max: "🏆", best_set_volume: "🔥", max_reps: "💪" };

function formatWorkoutCount(count: number): string {
  if (count === 1) return "1 trening";
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  const isFew = lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14);
  return `${count} ${isFew ? "treningi" : "treningów"}`;
}

export function ExerciseProgressBody({ status, progress, availableMetrics, metric, onSelectMetric }: ExerciseProgressBodyProps) {
  const metricOptions = useMemo<FilterOption<ProgressMetric>[]>(
    () => availableMetrics.map((id) => ({ id, label: PROGRESS_METRIC_LABELS[id].label, emoji: METRIC_EMOJI[id] })),
    [availableMetrics],
  );
  const chartPoints = useMemo(
    () =>
      (progress?.points ?? []).map((point) => ({
        label: formatChartDate(point.completedAt),
        value: getProgressValue(point, metric),
      })),
    [progress, metric],
  );

  if (status === "loading" || status === "idle") {
    return <ActivityIndicator testID="progress-sheet-loading" color="#38BDF8" className="py-10" />;
  }
  if (status === "error" || !progress) {
    return <Text className="text-sm text-center text-[#F87171] py-8">Nie udało się wczytać postępów. Spróbuj ponownie.</Text>;
  }
  if (progress.summary.workoutCount === 0) {
    return (
      <Text className="text-sm text-center text-[#71717A] py-8">Zapisz trening z tym ćwiczeniem, a pokażemy Twoje postępy</Text>
    );
  }

  return (
    <View className="gap-3">
      <Text className="text-xs text-[#71717A]">Na podstawie: {formatWorkoutCount(progress.summary.workoutCount)}</Text>
      <ExerciseProgressSummaryTiles summary={progress.summary} />
      <FilterChipRow
        testIDPrefix="progress-metric"
        accessibilityLabel="Wybierz wykres"
        options={metricOptions}
        selected={metric}
        onSelect={onSelectMetric}
      />
      <ProgressLineChart points={chartPoints} unit={PROGRESS_METRIC_LABELS[metric].unit} color={PERSONAL_RECORD_META[metric].color} />
    </View>
  );
}

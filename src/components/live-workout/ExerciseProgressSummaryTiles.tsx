import React from "react";
import { View } from "react-native";
import { formatEstimatedKg, formatKg } from "@/lib/live-workout-stats";
import type { ExerciseProgressSummary } from "@/schemas/exercise-progress.schema";
import { PERSONAL_RECORD_META } from "@/schemas/live-workout.schema";
import { ProgressStatTile } from "./ProgressStatTile";

interface ExerciseProgressSummaryTilesProps {
  summary: ExerciseProgressSummary;
}

/** "Ile mogę mieć maxa" (estimated 1RM) and "ile najwięcej zrobiłem" (heaviest set, best set, most reps). */
export function ExerciseProgressSummaryTiles({ summary }: ExerciseProgressSummaryTilesProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {summary.oneRepMaxKg !== null ? (
        <ProgressStatTile
          label="Twój max"
          value={formatEstimatedKg(summary.oneRepMaxKg)}
          detail="szacowany 1RM"
          accentColor={PERSONAL_RECORD_META.one_rep_max.color}
        />
      ) : null}
      {summary.heaviestSet ? (
        <ProgressStatTile label="Najcięższy" value={`${formatKg(summary.heaviestSet.weightKg)} × ${summary.heaviestSet.reps}`} />
      ) : null}
      {summary.bestSetVolume ? (
        <ProgressStatTile
          label="Rekordowa seria"
          value={formatKg(summary.bestSetVolume.volumeKg)}
          detail={`${formatKg(summary.bestSetVolume.weightKg)} × ${summary.bestSetVolume.reps}`}
          accentColor={PERSONAL_RECORD_META.best_set_volume.color}
        />
      ) : null}
      {summary.maxReps !== null ? (
        <ProgressStatTile
          label="Najwięcej powt."
          value={`${summary.maxReps} powt.`}
          accentColor={PERSONAL_RECORD_META.max_reps.color}
        />
      ) : null}
    </View>
  );
}

import React, { useMemo } from "react";
import { Text, View } from "react-native";
import Body from "react-native-body-highlighter";
import { toTrainedBodyParts, TRAINED_MUSCLE_COLORS } from "@/lib/body-highlighter-slugs";
import type { TrainedMuscle } from "@/schemas/live-workout.schema";
import { MUSCLE_BENCHMARK_CONFIGS } from "@/schemas/ranking.schema";

interface WorkoutMuscleMapProps {
  trainedMuscles: readonly TrainedMuscle[];
}

const BODY_SIDES = ["front", "back"] as const;

/** Body diagram (same as the ranking screen) with the muscle groups trained in this workout. */
export function WorkoutMuscleMap({ trainedMuscles }: WorkoutMuscleMapProps) {
  const bodyParts = useMemo(() => toTrainedBodyParts(trainedMuscles), [trainedMuscles]);

  return (
    <View testID="workout-muscle-map" className="rounded-3xl bg-[#121214] border border-[#27272A] p-3 gap-2">
      <View className="flex-row justify-around">
        {BODY_SIDES.map((side) => (
          <View key={side} testID={`workout-muscle-map-${side}`} className="items-center">
            <Body
              data={bodyParts}
              side={side}
              gender="male"
              scale={0.7}
              border="#27272A"
              defaultFill="#1E1E22"
              defaultStroke="#27272A"
              defaultStrokeWidth={1}
            />
          </View>
        ))}
      </View>

      {trainedMuscles.length === 0 ? (
        <Text className="text-xs text-center text-[#71717A]">Odhacz serię, aby zobaczyć trenowane partie</Text>
      ) : (
        <View className="flex-row flex-wrap justify-center gap-1.5">
          {trainedMuscles.map(({ muscle, intensity }) => (
            <View
              key={muscle}
              className="flex-row items-center gap-1.5 rounded-full bg-[#1E1E22] px-2.5 py-1 border border-[#27272A]"
            >
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: TRAINED_MUSCLE_COLORS[intensity] }} />
              <Text className={`text-[11px] font-semibold ${intensity === "primary" ? "text-white" : "text-[#71717A]"}`}>
                {MUSCLE_BENCHMARK_CONFIGS[muscle].namePl}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

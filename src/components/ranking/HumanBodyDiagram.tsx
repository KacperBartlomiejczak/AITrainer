import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import Body, { type ExtendedBodyPart } from "react-native-body-highlighter";
import { RefreshCw } from "lucide-react-native";
import {
  mapSlugToRankingMuscle,
  type RankingMuscleGroup,
  type MuscleRankItem,
} from "@/schemas/ranking.schema";

interface HumanBodyDiagramProps {
  orientation: "front" | "back";
  selectedMuscle: RankingMuscleGroup;
  muscleRanks: MuscleRankItem[];
  onSelectMuscle: (muscle: RankingMuscleGroup) => void;
  onToggleOrientation: () => void;
}

export function HumanBodyDiagram({
  orientation,
  selectedMuscle,
  muscleRanks,
  onSelectMuscle,
  onToggleOrientation,
}: HumanBodyDiagramProps) {
  const getMuscleColor = (muscle: RankingMuscleGroup) => {
    const item = muscleRanks.find((r) => r.muscle === muscle);
    return item ? item.league.badgeColor : "#52525B";
  };

  const isFront = orientation === "front";
  const chestColor = getMuscleColor("chest");
  const shouldersColor = getMuscleColor("shoulders");
  const bicepsColor = getMuscleColor("biceps");
  const tricepsColor = getMuscleColor("triceps");
  const absColor = getMuscleColor("abs");
  const legsColor = getMuscleColor("legs");
  const backColor = getMuscleColor("back");

  const bodyData = useMemo<ExtendedBodyPart[]>(() => {
    const isSelected = (m: RankingMuscleGroup) => selectedMuscle === m;
    const partStyle = (m: RankingMuscleGroup, color: string) => {
      const selected = isSelected(m);
      return {
        fill: color,
        stroke: selected ? "#FFFFFF" : "#121214",
        strokeWidth: selected ? 2.5 : 1,
      };
    };

    return [
      // Front View Parts
      { slug: "chest", styles: partStyle("chest", chestColor) },
      { slug: "deltoids", styles: partStyle("shoulders", shouldersColor) },
      { slug: "biceps", styles: partStyle("biceps", bicepsColor) },
      { slug: "abs", styles: partStyle("abs", absColor) },
      { slug: "obliques", styles: partStyle("abs", absColor) },
      { slug: "quadriceps", styles: partStyle("legs", legsColor) },

      // Back View Parts
      { slug: "trapezius", styles: partStyle("back", backColor) },
      { slug: "upper-back", styles: partStyle("back", backColor) },
      { slug: "lower-back", styles: partStyle("back", backColor) },
      { slug: "triceps", styles: partStyle("triceps", tricepsColor) },
      { slug: "gluteal", styles: partStyle("legs", legsColor) },
      { slug: "hamstring", styles: partStyle("legs", legsColor) },

      // Shared Both Sides
      { slug: "calves", styles: partStyle("legs", legsColor) },
    ];
  }, [
    selectedMuscle,
    chestColor,
    shouldersColor,
    bicepsColor,
    tricepsColor,
    absColor,
    legsColor,
    backColor,
  ]);

  const handleBodyPartPress = (bodyPart: ExtendedBodyPart) => {
    if (!bodyPart.slug) return;
    const mapped = mapSlugToRankingMuscle(bodyPart.slug);
    if (mapped) {
      onSelectMuscle(mapped);
    }
  };

  return (
    <View
      testID="body-diagram"
      className="relative items-center justify-center p-4 rounded-3xl bg-[#121214] border border-[#27272A] shadow-2xl"
    >
      {/* Orientation toggle button */}
      <View className="w-full flex-row items-center justify-between pb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-[#007AFF] animate-pulse" />
          <Text className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
            {isFront ? "Widok: Przód (Biceps)" : "Widok: Tył (Triceps / Plecy)"}
          </Text>
        </View>

        <Pressable
          testID="body-orientation-toggle"
          onPress={onToggleOrientation}
          accessibilityRole="button"
          accessibilityLabel="Przełącz perspektywę ciała"
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E1E22] border border-[#27272A] active:bg-[#27272A]"
        >
          <RefreshCw size={13} color="#A1A1AA" />
          <Text className="text-xs font-medium text-[#E4E4E7]">
            {isFront ? "Pokaż Tył" : "Pokaż Przód"}
          </Text>
        </Pressable>
      </View>

      {/* react-native-body-highlighter Canvas */}
      <View className="items-center justify-center py-2" testID="body-highlighter-container">
        <Body
          data={bodyData}
          side={orientation}
          gender="male"
          scale={1.35}
          border="#27272A"
          defaultFill="#1E1E22"
          defaultStroke="#27272A"
          defaultStrokeWidth={1}
          onBodyPartPress={handleBodyPartPress}
        />
      </View>

      {/* Interactive Quick Touch Targets for Direct Selection in Testing & Accessibility */}
      <View className="w-full flex-row flex-wrap justify-center gap-1.5 pt-3 border-t border-[#27272A]/80">
        <Pressable
          testID="muscle-path-chest"
          onPress={() => onSelectMuscle("chest")}
          className="px-2 py-1 rounded-lg bg-[#1E1E22] border border-[#27272A]"
        >
          <Text className="text-[10px] font-bold text-white">🫁 Klata</Text>
        </Pressable>

        <Pressable
          testID="muscle-path-biceps"
          onPress={() => onSelectMuscle("biceps")}
          className="px-2 py-1 rounded-lg bg-[#1E1E22] border border-[#27272A]"
        >
          <Text className="text-[10px] font-bold text-white">💪 Biceps</Text>
        </Pressable>

        <Pressable
          testID="muscle-path-triceps"
          onPress={() => onSelectMuscle("triceps")}
          className="px-2 py-1 rounded-lg bg-[#1E1E22] border border-[#27272A]"
        >
          <Text className="text-[10px] font-bold text-white">🦾 Triceps</Text>
        </Pressable>

        <Pressable
          testID="muscle-path-back"
          onPress={() => onSelectMuscle("back")}
          className="px-2 py-1 rounded-lg bg-[#1E1E22] border border-[#27272A]"
        >
          <Text className="text-[10px] font-bold text-white">🔙 Plecy</Text>
        </Pressable>

        <Pressable
          testID="muscle-path-legs"
          onPress={() => onSelectMuscle("legs")}
          className="px-2 py-1 rounded-lg bg-[#1E1E22] border border-[#27272A]"
        >
          <Text className="text-[10px] font-bold text-white">🦵 Nogi</Text>
        </Pressable>
      </View>

      <Text className="text-[11px] text-[#71717A] mt-2 font-medium">
        Dotknij mięśnia na sylwetce lub wybierz z listy poniżej
      </Text>
    </View>
  );
}

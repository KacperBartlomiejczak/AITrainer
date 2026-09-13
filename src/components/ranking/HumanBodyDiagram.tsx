import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { RefreshCw } from "lucide-react-native";
import type { MuscleGroup } from "@/schemas/onboarding.schema";
import type { MuscleRankItem } from "@/schemas/ranking.schema";

interface HumanBodyDiagramProps {
  orientation: "front" | "back";
  selectedMuscle: MuscleGroup;
  muscleRanks: MuscleRankItem[];
  onSelectMuscle: (muscle: MuscleGroup) => void;
  onToggleOrientation: () => void;
}

export function HumanBodyDiagram({
  orientation,
  selectedMuscle,
  muscleRanks,
  onSelectMuscle,
  onToggleOrientation,
}: HumanBodyDiagramProps) {
  const getMuscleColor = (muscle: MuscleGroup) => {
    const item = muscleRanks.find((r) => r.muscle === muscle);
    return item ? item.league.badgeColor : "#52525B";
  };

  const isFront = orientation === "front";
  const chestColor = getMuscleColor("chest");
  const shouldersColor = getMuscleColor("shoulders");
  const armsColor = getMuscleColor("arms");
  const absColor = getMuscleColor("abs");
  const legsColor = getMuscleColor("legs");
  const backColor = getMuscleColor("back");

  return (
    <View
      testID="body-diagram"
      className="relative items-center justify-center p-4 rounded-3xl bg-[#121214] border border-[#27272A] shadow-2xl"
    >
      {/* Orientation toggle button */}
      <View className="w-full flex-row items-center justify-between pb-2">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-[#007AFF] animate-pulse" />
          <Text className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
            {isFront ? "Widok: Przód" : "Widok: Tył"}
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

      {/* SVG Canvas (Width: 260, Height: 320, ViewBox: 0 0 260 320) */}
      <Svg width="260" height="320" viewBox="0 0 260 320">
        {/* Head & Neck */}
        <Circle cx="130" cy="30" r="18" fill="#27272A" />
        <Rect x="123" y="47" width="14" height="12" rx="4" fill="#27272A" />

        {isFront ? (
          /* ── FRONT VIEW ────────────────────────── */
          <G>
            {/* Shoulders */}
            <G
              testID="muscle-path-shoulders"
              onPress={() => onSelectMuscle("shoulders")}
            >
              <Path
                d="M80 60 C90 55, 105 57, 108 67 C100 80, 80 84, 75 75 Z"
                fill={shouldersColor}
                opacity={selectedMuscle === "shoulders" ? 1 : 0.85}
                stroke={selectedMuscle === "shoulders" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "shoulders" ? 2 : 1}
              />
              <Path
                d="M180 60 C170 55, 155 57, 152 67 C160 80, 180 84, 185 75 Z"
                fill={shouldersColor}
                opacity={selectedMuscle === "shoulders" ? 1 : 0.85}
                stroke={selectedMuscle === "shoulders" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "shoulders" ? 2 : 1}
              />
            </G>

            {/* Chest */}
            <G testID="muscle-path-chest" onPress={() => onSelectMuscle("chest")}>
              <Path
                d="M109 68 C115 67, 126 68, 127 88 C116 92, 100 89, 96 80 Z"
                fill={chestColor}
                opacity={selectedMuscle === "chest" ? 1 : 0.85}
                stroke={selectedMuscle === "chest" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "chest" ? 2 : 1}
              />
              <Path
                d="M151 68 C145 67, 134 68, 133 88 C144 92, 160 89, 164 80 Z"
                fill={chestColor}
                opacity={selectedMuscle === "chest" ? 1 : 0.85}
                stroke={selectedMuscle === "chest" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "chest" ? 2 : 1}
              />
            </G>

            {/* Arms (Biceps & Forearms) */}
            <G testID="muscle-path-arms" onPress={() => onSelectMuscle("arms")}>
              <Path
                d="M72 78 C78 84, 75 105, 68 115 C62 108, 62 90, 68 80 Z"
                fill={armsColor}
                opacity={selectedMuscle === "arms" ? 1 : 0.85}
                stroke={selectedMuscle === "arms" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "arms" ? 2 : 1}
              />
              <Path
                d="M188 78 C182 84, 185 105, 192 115 C198 108, 198 90, 192 80 Z"
                fill={armsColor}
                opacity={selectedMuscle === "arms" ? 1 : 0.85}
                stroke={selectedMuscle === "arms" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "arms" ? 2 : 1}
              />
              <Path
                d="M66 117 C70 128, 64 150, 56 156 C52 148, 54 130, 61 118 Z"
                fill={armsColor}
                opacity={selectedMuscle === "arms" ? 0.9 : 0.7}
              />
              <Path
                d="M194 117 C190 128, 196 150, 204 156 C208 148, 206 130, 199 118 Z"
                fill={armsColor}
                opacity={selectedMuscle === "arms" ? 0.9 : 0.7}
              />
            </G>

            {/* Abs / Core */}
            <G testID="muscle-path-abs" onPress={() => onSelectMuscle("abs")}>
              <Rect
                x="115"
                y="94"
                width="13"
                height="12"
                rx="2"
                fill={absColor}
                opacity={selectedMuscle === "abs" ? 1 : 0.85}
                stroke={selectedMuscle === "abs" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "abs" ? 1.5 : 0.5}
              />
              <Rect
                x="132"
                y="94"
                width="13"
                height="12"
                rx="2"
                fill={absColor}
                opacity={selectedMuscle === "abs" ? 1 : 0.85}
                stroke={selectedMuscle === "abs" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "abs" ? 1.5 : 0.5}
              />
              <Rect
                x="116"
                y="108"
                width="12"
                height="12"
                rx="2"
                fill={absColor}
                opacity={selectedMuscle === "abs" ? 1 : 0.85}
                stroke={selectedMuscle === "abs" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "abs" ? 1.5 : 0.5}
              />
              <Rect
                x="132"
                y="108"
                width="12"
                height="12"
                rx="2"
                fill={absColor}
                opacity={selectedMuscle === "abs" ? 1 : 0.85}
                stroke={selectedMuscle === "abs" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "abs" ? 1.5 : 0.5}
              />
              <Rect
                x="117"
                y="122"
                width="11"
                height="12"
                rx="2"
                fill={absColor}
                opacity={selectedMuscle === "abs" ? 1 : 0.85}
                stroke={selectedMuscle === "abs" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "abs" ? 1.5 : 0.5}
              />
              <Rect
                x="132"
                y="122"
                width="11"
                height="12"
                rx="2"
                fill={absColor}
                opacity={selectedMuscle === "abs" ? 1 : 0.85}
                stroke={selectedMuscle === "abs" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "abs" ? 1.5 : 0.5}
              />
            </G>

            {/* Pelvis neutral */}
            <Path d="M112 136 H148 L142 154 H118 Z" fill="#27272A" />

            {/* Legs (Quads & Calves) */}
            <G testID="muscle-path-legs" onPress={() => onSelectMuscle("legs")}>
              {/* Left thigh */}
              <Path
                d="M106 156 C115 156, 126 156, 124 210 C114 212, 98 205, 96 180 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 1 : 0.85}
                stroke={selectedMuscle === "legs" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "legs" ? 2 : 1}
              />
              {/* Right thigh */}
              <Path
                d="M154 156 C145 156, 134 156, 136 210 C146 212, 162 205, 164 180 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 1 : 0.85}
                stroke={selectedMuscle === "legs" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "legs" ? 2 : 1}
              />
              {/* Left Calf */}
              <Path
                d="M103 220 C111 220, 119 228, 114 285 C107 286, 100 270, 98 250 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 0.9 : 0.75}
              />
              {/* Right Calf */}
              <Path
                d="M157 220 C149 220, 141 228, 146 285 C153 286, 160 270, 162 250 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 0.9 : 0.75}
              />
            </G>
          </G>
        ) : (
          /* ── BACK VIEW ─────────────────────────── */
          <G>
            {/* Upper Back & Trapezius / Lats */}
            <G testID="muscle-path-back" onPress={() => onSelectMuscle("back")}>
              <Path
                d="M104 60 C116 54, 144 54, 156 60 C162 76, 152 110, 145 130 C138 126, 122 126, 115 130 C108 110, 98 76, 104 60 Z"
                fill={backColor}
                opacity={selectedMuscle === "back" ? 1 : 0.85}
                stroke={selectedMuscle === "back" ? "#FFFFFF" : "#000000"}
                strokeWidth={selectedMuscle === "back" ? 2 : 1}
              />
            </G>

            {/* Rear Shoulders */}
            <G
              testID="muscle-path-shoulders-back"
              onPress={() => onSelectMuscle("shoulders")}
            >
              <Path
                d="M80 62 C88 56, 102 58, 104 68 C96 82, 78 84, 75 75 Z"
                fill={shouldersColor}
                opacity={selectedMuscle === "shoulders" ? 1 : 0.85}
              />
              <Path
                d="M180 62 C172 56, 158 58, 156 68 C164 82, 182 84, 185 75 Z"
                fill={shouldersColor}
                opacity={selectedMuscle === "shoulders" ? 1 : 0.85}
              />
            </G>

            {/* Arms (Triceps) */}
            <G
              testID="muscle-path-arms-back"
              onPress={() => onSelectMuscle("arms")}
            >
              <Path
                d="M72 78 C78 84, 75 106, 68 116 C61 108, 62 90, 68 80 Z"
                fill={armsColor}
                opacity={selectedMuscle === "arms" ? 1 : 0.85}
              />
              <Path
                d="M188 78 C182 84, 185 106, 192 116 C199 108, 198 90, 192 80 Z"
                fill={armsColor}
                opacity={selectedMuscle === "arms" ? 1 : 0.85}
              />
            </G>

            {/* Glutes & Hamstrings */}
            <G
              testID="muscle-path-legs-back"
              onPress={() => onSelectMuscle("legs")}
            >
              <Path
                d="M104 140 C116 138, 126 142, 125 180 C114 184, 98 178, 96 158 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 1 : 0.85}
              />
              <Path
                d="M156 140 C144 138, 134 142, 135 180 C146 184, 162 178, 164 158 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 1 : 0.85}
              />
              {/* Hamstrings */}
              <Path
                d="M103 184 C112 184, 124 186, 121 216 C112 216, 102 210, 99 196 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 0.95 : 0.8}
              />
              <Path
                d="M157 184 C148 184, 136 186, 139 216 C148 216, 158 210, 161 196 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 0.95 : 0.8}
              />
              {/* Calves back */}
              <Path
                d="M102 224 C110 224, 118 230, 113 285 C107 286, 100 270, 97 250 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 0.85 : 0.7}
              />
              <Path
                d="M158 224 C150 224, 142 230, 147 285 C153 286, 160 270, 163 250 Z"
                fill={legsColor}
                opacity={selectedMuscle === "legs" ? 0.85 : 0.7}
              />
            </G>
          </G>
        )}
      </Svg>

      <Text className="text-[11px] text-[#71717A] mt-2 font-medium">
        Dotknij partii na sylwetce, aby sprawdzić rangę i rekord
      </Text>
    </View>
  );
}

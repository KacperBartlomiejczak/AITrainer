import React from "react";
import { Alert, View, Text, Pressable } from "react-native";
import { Clock, Calendar, Flame, ChevronRight } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import type { RoutineItem, RoutineLevel } from "@/schemas/routine.schema";

interface RoutineCardProps {
  routine: RoutineItem;
  onStart: (id: string) => void;
  /** Only asked for a user-created routine — built-in routines never offer to delete. */
  onDelete?: (id: string) => void;
}

const LEVEL_LABELS: Record<RoutineLevel, string> = {
  beginner: "Początkujący",
  intermediate: "Średni",
  advanced: "Zaawansowany",
};

export function RoutineCard({ routine, onStart, onDelete }: RoutineCardProps) {
  const canDelete = routine.isUserCreated && onDelete !== undefined;

  const handleLongPress = () => {
    if (!canDelete) return;
    Alert.alert(
      "Usuń rutynę",
      `Czy na pewno chcesz usunąć „${routine.title}”? Tej operacji nie można cofnąć.`,
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Usuń", style: "destructive", onPress: () => onDelete?.(routine.id) },
      ],
    );
  };

  return (
    <Pressable
      testID={`routine-card-${routine.id}`}
      onLongPress={handleLongPress}
      accessibilityHint={canDelete ? "Przytrzymaj, aby usunąć rutynę" : undefined}
      className="rounded-2xl bg-[#121214] border border-[#27272A] p-4 flex-col gap-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Badge variant="default" size="sm" className="bg-[#1E1E22] border-[#27272A]">
            <Text className="text-[11px] font-semibold text-[#A1A1AA]">
              {LEVEL_LABELS[routine.level]}
            </Text>
          </Badge>
          {routine.isPopular && (
            <Badge variant="default" size="sm" className="bg-[#F59E0B]/15 border-[#F59E0B]/30">
              <Text className="text-[10px] font-bold text-[#F59E0B]">POPULARNY</Text>
            </Badge>
          )}
        </View>

        <View className="flex-row items-center gap-1">
          <Flame size={14} color="#007AFF" />
          <Text className="text-xs font-semibold text-[#007AFF]">
            {routine.exerciseCount} ćwiczeń
          </Text>
        </View>
      </View>

      <View className="flex-col gap-1">
        <Text className="text-base font-bold text-white tracking-tight">
          {routine.title}
        </Text>
        <Text className="text-xs text-[#71717A] leading-relaxed" numberOfLines={2}>
          {routine.description}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-1.5 pt-1">
        {routine.targetMuscleGroups.map((group) => (
          <View key={group} className="rounded-lg bg-[#1E1E22] px-2 py-0.5 border border-[#27272A]">
            <Text className="text-[11px] text-[#A1A1AA]">{group}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between pt-2 border-t border-[#1E1E22]">
        <View className="flex-row items-center gap-3 text-[#71717A]">
          <View className="flex-row items-center gap-1">
            <Clock size={13} color="#71717A" />
            <Text className="text-xs text-[#71717A]">{routine.durationMinutes} min</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Calendar size={13} color="#71717A" />
            <Text className="text-xs text-[#71717A]">{routine.daysPerWeek} dni / tydz.</Text>
          </View>
        </View>

        <Pressable
          testID={`start-routine-${routine.id}`}
          onPress={() => onStart(routine.id)}
          accessibilityRole="button"
          className="flex-row items-center bg-[#007AFF]/15 border border-[#007AFF]/30 px-3 py-1.5 rounded-xl gap-1 active:bg-[#007AFF]/30"
        >
          <Text className="text-xs font-bold text-[#007AFF]">Rozpocznij</Text>
          <ChevronRight size={13} color="#007AFF" />
        </Pressable>
      </View>
    </Pressable>
  );
}

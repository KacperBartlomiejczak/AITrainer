import React from "react";
import { View, Text } from "react-native";
import { RoutineCard } from "./RoutineCard";
import type { RoutineItem } from "@/schemas/routine.schema";

interface RoutineListSectionProps {
  routines: RoutineItem[];
  onStartRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
}

export function RoutineListSection({
  routines,
  onStartRoutine,
  onDeleteRoutine,
}: RoutineListSectionProps) {
  return (
    <View className="flex-col gap-3.5">
      <View className="flex-col gap-0.5">
        <Text className="text-base font-black text-white tracking-tight">
          Gotowe Rutyny Treningowe
        </Text>
        <Text className="text-xs text-[#71717A]">
          Wybierz plan dopasowany do Twoich celów i poziomu
        </Text>
      </View>

      <View className="flex-col gap-3">
        {routines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            onStart={onStartRoutine}
            onDelete={onDeleteRoutine}
          />
        ))}
      </View>
    </View>
  );
}

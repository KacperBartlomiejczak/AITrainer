import * as React from "react";
import { View, Text, Pressable } from "react-native";
import type { QuickActionItem } from "@/schemas/home.schema";
import { Badge } from "@/components/ui/badge";

interface QuickActionsGridProps {
  actions: QuickActionItem[];
  onSelectAction?: (route: string) => void;
}

const ACTION_ICONS: Record<string, string> = {
  PlusCircle: "➕",
  Dumbbell: "🏋️",
  Sparkles: "✨",
  History: "📊",
};

export function QuickActionsGrid({ actions, onSelectAction }: QuickActionsGridProps) {
  return (
    <View className="flex-col gap-2.5">
      <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
        Szybki Dostęp
      </Text>

      <View className="flex-row flex-wrap gap-2.5">
        {actions.map((action) => {
          const icon = ACTION_ICONS[action.iconName] || "⚡";

          return (
            <Pressable
              key={action.id}
              onPress={() => onSelectAction?.(action.route)}
              className="flex-1 min-w-[45%] rounded-2xl bg-[#121214] border border-[#27272A] p-3.5 active:bg-[#1E1E22] flex-col justify-between h-28"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl">{icon}</Text>
                {action.badgeText && (
                  <Badge variant="default" size="sm" className="bg-[#007AFF]/15 border-[#007AFF]/30 px-2 py-0.5">
                    <Text className="text-[10px] font-bold text-[#007AFF]">
                      {action.badgeText}
                    </Text>
                  </Badge>
                )}
              </View>

              <View className="flex-col gap-0.5">
                <Text className="text-sm font-bold text-white tracking-tight">
                  {action.title}
                </Text>
                {action.description && (
                  <Text className="text-[11px] text-[#71717A] leading-tight" numberOfLines={1}>
                    {action.description}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

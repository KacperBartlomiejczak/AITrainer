import * as React from "react";
import { View, Text } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AiCoachTip } from "@/schemas/ai-coach.schema";

interface AiCoachCardProps {
  tip: AiCoachTip | null;
  onAskCoach?: () => void;
}

export function AiCoachCard({ tip, onAskCoach }: AiCoachCardProps) {
  if (!tip) return null;

  return (
    <Card className="border border-[#007AFF]/30 bg-[#121214] overflow-hidden rounded-2xl relative">
      <View className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#007AFF]/10 blur-xl" />
      
      <CardContent className="flex-col gap-3 p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Badge variant="default" className="bg-[#007AFF]/20 border-[#007AFF]/40 px-2.5 py-0.5">
              <Text className="text-[11px] font-black tracking-wider text-[#007AFF]">
                🤖 MENTOR AI
              </Text>
            </Badge>
            <Text className="text-xs font-semibold text-[#A1A1AA]">
              {tip.category === "technique" ? "Wskazówka techniczna" : "Wskazówka dnia"}
            </Text>
          </View>
        </View>

        <Text className="text-sm font-semibold text-white leading-relaxed">
          {tip.message}
        </Text>

        <Button
          variant="secondary"
          size="sm"
          onPress={onAskCoach}
          className="self-start rounded-lg border border-[#27272A] bg-[#1E1E22] px-3.5 py-2 mt-1"
        >
          <Text className="text-xs font-bold text-[#007AFF]">
            💬 {tip.suggestedAction || "Zapytaj Trenera"}
          </Text>
        </Button>
      </CardContent>
    </Card>
  );
}

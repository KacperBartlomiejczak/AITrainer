import React from "react";
import { Text, View } from "react-native";

interface ProgressStatTileProps {
  label: string;
  value: string;
  detail?: string;
  accentColor?: string;
}

export function ProgressStatTile({ label, value, detail, accentColor = "#FFFFFF" }: ProgressStatTileProps) {
  return (
    <View className="flex-1 min-w-[30%] rounded-2xl bg-[#121214] border border-[#27272A] px-3 py-2.5 gap-0.5">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">{label}</Text>
      <Text className="text-base font-black" style={{ color: accentColor }}>
        {value}
      </Text>
      {detail ? <Text className="text-[11px] text-[#A1A1AA]">{detail}</Text> : null}
    </View>
  );
}

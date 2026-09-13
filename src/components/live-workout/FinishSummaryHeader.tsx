import React from "react";
import { Text, View } from "react-native";

interface FinishSummaryHeaderProps {
  personalRecordCount: number;
}

function formatRecords(count: number): string {
  if (count === 1) return "1 nowy rekord 🔥";
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  const isFew = lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14);
  return `${count} ${isFew ? "nowe rekordy" : "nowych rekordów"} 🔥`;
}

export function FinishSummaryHeader({ personalRecordCount }: FinishSummaryHeaderProps) {
  return (
    <View className="gap-1">
      <Text className="text-xl font-black text-white">Podsumowanie treningu</Text>
      {personalRecordCount > 0 ? (
        <Text className="text-sm font-bold text-[#F59E0B]">{formatRecords(personalRecordCount)}</Text>
      ) : null}
    </View>
  );
}

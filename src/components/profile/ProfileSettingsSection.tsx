import * as React from "react";
import { View, Text, Pressable } from "react-native";

interface ProfileSettingsSectionProps {
  onExportData: () => void;
  onResetData: () => void;
}

export function ProfileSettingsSection({
  onExportData,
  onResetData,
}: ProfileSettingsSectionProps) {
  return (
    <View className="flex-col gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
        Ustawienia Aplikacji & Prywatność
      </Text>

      <View className="rounded-2xl bg-[#121214] border border-[#27272A] divide-y divide-[#27272A] overflow-hidden">
        {/* Motyw */}
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-col">
            <Text className="text-sm font-bold text-white">Motyw wizualny</Text>
            <Text className="text-xs text-[#71717A]">Tryb interfejsu</Text>
          </View>
          <Text className="text-sm font-semibold text-[#007AFF]">Ciemny</Text>
        </View>

        {/* Jednostki */}
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-col">
            <Text className="text-sm font-bold text-white">Jednostki miary</Text>
            <Text className="text-xs text-[#71717A]">Ciężar i wymiary</Text>
          </View>
          <Text className="text-sm font-semibold text-[#A1A1AA]">Metryczne (kg, cm)</Text>
        </View>

        {/* Eksport danych */}
        <Pressable
          onPress={onExportData}
          className="flex-row items-center justify-between p-4 active:bg-[#1E1E22]"
        >
          <View className="flex-col">
            <Text className="text-sm font-bold text-white">Eksportuj moje dane (JSON)</Text>
            <Text className="text-xs text-[#71717A]">Pobierz kopię profilu i postępów</Text>
          </View>
          <Text className="text-sm font-bold text-[#007AFF]">⬇️ Eksport</Text>
        </Pressable>

        {/* Reset danych */}
        <Pressable
          onPress={onResetData}
          className="flex-row items-center justify-between p-4 active:bg-[#2A1515]"
        >
          <View className="flex-col">
            <Text className="text-sm font-bold text-red-500">Zresetuj profil i onboarding</Text>
            <Text className="text-xs text-[#71717A]">Wyczyść dane i rozpocznij na nowo</Text>
          </View>
          <Text className="text-sm font-bold text-red-500">Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

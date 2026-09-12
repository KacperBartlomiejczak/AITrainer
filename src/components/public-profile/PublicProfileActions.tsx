import React from "react";
import { View, Text, Pressable } from "react-native";
import { Settings, ChevronRight } from "lucide-react-native";

interface PublicProfileActionsProps {
  onOpenSettings: () => void;
}

export function PublicProfileActions({
  onOpenSettings,
}: PublicProfileActionsProps) {
  return (
    <View className="flex-col gap-2.5">
      <Pressable
        testID="open-settings-button"
        onPress={onOpenSettings}
        accessibilityRole="button"
        className="flex-row items-center justify-between bg-[#121214] border border-[#27272A] rounded-2xl p-4 active:bg-[#18181B]"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-[#1E1E22] items-center justify-center border border-[#27272A]">
            <Settings size={20} color="#A1A1AA" />
          </View>
          <View>
            <Text className="text-sm font-bold text-white">
              Edytuj profil i ustawienia
            </Text>
            <Text className="text-xs text-[#71717A]">
              Zmień imię, cel treningowy i partie mięśniowe
            </Text>
          </View>
        </View>

        <ChevronRight size={18} color="#71717A" />
      </Pressable>
    </View>
  );
}

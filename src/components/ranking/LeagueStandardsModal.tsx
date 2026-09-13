import React from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { X, ShieldCheck } from "lucide-react-native";
import { STRENGTH_LEAGUES, type StrengthLeagueId } from "@/schemas/user-profile-screen.schema";

interface LeagueStandardsModalProps {
  visible: boolean;
  onClose: () => void;
}

const LEAGUES_ORDER: StrengthLeagueId[] = [
  "titan",
  "master",
  "diamond",
  "platinum",
  "gold",
  "silver",
  "bronze",
];

export function LeagueStandardsModal({
  visible,
  onClose,
}: LeagueStandardsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 items-center justify-center p-4">
        <View className="w-full max-w-lg max-h-[85%] rounded-3xl bg-[#121214] border border-[#27272A] p-5 flex-col gap-4 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-2 border-b border-[#27272A]">
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={22} color="#007AFF" />
              <Text className="text-lg font-black text-white">
                Zasady Lig i Rang Siłowych
              </Text>
            </View>

            <Pressable
              testID="btn-close-standards-modal"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Zamknij modal"
              className="w-9 h-9 rounded-full bg-[#1E1E22] items-center justify-center active:bg-[#27272A]"
            >
              <X size={18} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* Description */}
          <Text className="text-xs text-[#A1A1AA] leading-relaxed">
            Każda partia mięśniowa na modelu ciała posiada własną rangę wyliczaną na podstawie Twoich rekordów (PR) w kluczowych ćwiczeniach bazowych.
          </Text>

          {/* League Tiers List */}
          <ScrollView showsVerticalScrollIndicator={false} className="flex-col">
            <View className="flex-col gap-3 pb-2">
              {LEAGUES_ORDER.map((leagueId) => {
                const league = STRENGTH_LEAGUES[leagueId];
                return (
                  <View
                    key={league.id}
                    className="p-3.5 rounded-2xl bg-[#1E1E22] border flex-col gap-1"
                    style={{ borderColor: `${league.badgeColor}40` }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xl">{league.icon}</Text>
                        <Text
                          className="text-sm font-black"
                          style={{ color: league.badgeColor }}
                        >
                          {league.name}
                        </Text>
                      </View>
                      <Text className="text-xs font-bold text-white">
                        min. {league.minKg} kg na klatę
                      </Text>
                    </View>
                    <Text className="text-xs text-[#71717A]">
                      {league.description}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

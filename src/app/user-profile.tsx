import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePublicProfile } from "@/hooks/use-public-profile";
import {
  PublicProfileCard,
  PublicProfileActions,
} from "@/components/public-profile";
import { PillNavbar } from "@/components/navigation";

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { displayName, fitnessGoalLabel, streakDays, openSettings } =
    usePublicProfile();

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 24) + 80,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-col gap-6">
          <View className="flex-col gap-1">
            <Text className="text-2xl font-black text-white tracking-tight">
              Twój Profil Publiczny 👤
            </Text>
            <Text className="text-xs text-[#71717A]">
              Tak Twój profil i osiągnięcia są widoczne dla innych
            </Text>
          </View>

          {/* Profile Card */}
          <PublicProfileCard
            displayName={displayName}
            fitnessGoalLabel={fitnessGoalLabel}
            streakDays={streakDays}
          />

          {/* Quick Action to Settings & Edit */}
          <PublicProfileActions onOpenSettings={openSettings} />
        </View>
      </ScrollView>

      {/* Floating Pill Navigation */}
      <PillNavbar activeTab="profile" />
    </View>
  );
}

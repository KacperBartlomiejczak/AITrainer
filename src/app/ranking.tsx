import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRankingScreen } from "@/hooks/use-ranking-screen";
import {
  RankingHeader,
  MuscleSelectorPills,
  HumanBodyDiagram,
  MuscleRankCard,
  RankingLeaderboard,
  LeagueStandardsModal,
} from "@/components/ranking";
import { PillNavbar } from "@/components/navigation";
import { STRENGTH_LEAGUES } from "@/schemas/user-profile-screen.schema";

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeView,
    setActiveView,
    bodyOrientation,
    toggleBodyOrientation,
    selectedMuscle,
    setSelectedMuscle,
    updateMuscleRecord,
    muscleRanks,
    selectedMuscleRank,
    overallRank,
    filteredLeaderboard,
    selectedLeagueFilter,
    setSelectedLeagueFilter,
    isStandardsModalOpen,
    openStandardsModal,
    closeStandardsModal,
  } = useRankingScreen();

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
          {/* Top Title */}
          <View className="flex-col gap-1">
            <Text className="text-2xl font-black text-white tracking-tight">
              System Rankingowy 🏆
            </Text>
            <Text className="text-xs text-[#71717A]">
              Rangi ligowe, wektorowy model ciała i standardy siłowe
            </Text>
          </View>

          {/* User Overall Strength Card & View Switcher */}
          <RankingHeader
            overallLeague={overallRank.overallLeague}
            totalScore={overallRank.totalScore}
            activeView={activeView}
            onViewChange={setActiveView}
            onOpenStandards={openStandardsModal}
          />

          {/* View 1: Wykres Ciała (Body Chart & Muscle Ranks) */}
          {activeView === "chart" && (
            <View className="flex-col gap-5">
              {/* Muscle selector chips */}
              <MuscleSelectorPills
                ranks={muscleRanks}
                selectedMuscle={selectedMuscle}
                onSelectMuscle={setSelectedMuscle}
              />

              {/* Interactive Vector Human Body Diagram */}
              <HumanBodyDiagram
                orientation={bodyOrientation}
                selectedMuscle={selectedMuscle}
                muscleRanks={muscleRanks}
                onSelectMuscle={setSelectedMuscle}
                onToggleOrientation={toggleBodyOrientation}
              />

              {/* Selected Muscle Details & PR Simulator */}
              <MuscleRankCard
                item={selectedMuscleRank}
                onUpdateKg={updateMuscleRecord}
              />
            </View>
          )}

          {/* View 2: Tabela Ligi (Community Leaderboard) */}
          {activeView === "leaderboard" && (
            <RankingLeaderboard
              users={filteredLeaderboard}
              selectedFilter={selectedLeagueFilter}
              onSelectFilter={setSelectedLeagueFilter}
            />
          )}

          {/* View 3: Standardy Lig (Standards Overview) */}
          {activeView === "standards" && (
            <View className="flex-col gap-3">
              <Text className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Wszystkie Ligi Siłowe w AI Trainer:
              </Text>
              {Object.values(STRENGTH_LEAGUES).reverse().map((league) => (
                <View
                  key={league.id}
                  className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex-col gap-1.5"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-2xl">{league.icon}</Text>
                      <Text
                        className="text-base font-black"
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
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Standards Modal */}
      <LeagueStandardsModal
        visible={isStandardsModalOpen}
        onClose={closeStandardsModal}
      />

      {/* Floating Pill Navigation */}
      <PillNavbar activeTab="ranking" />
    </View>
  );
}

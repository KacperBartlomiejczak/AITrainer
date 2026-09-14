import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRankingScreen } from "@/hooks/use-ranking-screen";
import {
  RankingHeader,
  MuscleSelectorPills,
  HumanBodyDiagram,
  MuscleRankCard,
  RankingLeaderboard,
  LeagueStandardsModal,
  RankingStandardsView,
} from "@/components/ranking";

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

              {/* Quick Jump Cards to Leaderboard and Standards */}
              <View className="flex-col gap-2.5 pt-1">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                  Więcej sekcji rankingu
                </Text>

                <Pressable
                  testID="shortcut-to-leaderboard"
                  onPress={() => setActiveView("leaderboard")}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Przejdź do tabeli rankingu"
                  className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex-row items-center justify-between active:bg-[#1E1E22]"
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-2xl">🏆</Text>
                    <View className="flex-col">
                      <Text className="text-sm font-black text-white">
                        Tabela Rankingu Społeczności
                      </Text>
                      <Text className="text-xs text-[#71717A]">
                        Porównaj swoje punkty i zobacz podium
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm font-bold text-[#007AFF]">Przejdź →</Text>
                </Pressable>

                <Pressable
                  testID="shortcut-to-standards"
                  onPress={() => setActiveView("standards")}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Przejdź do standardów siłowych"
                  className="p-4 rounded-2xl bg-[#121214] border border-[#27272A] flex-row items-center justify-between active:bg-[#1E1E22]"
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-2xl">📜</Text>
                    <View className="flex-col">
                      <Text className="text-sm font-black text-white">
                        Wszystkie Standardy Siłowe
                      </Text>
                      <Text className="text-xs text-[#71717A]">
                        Progi wagowe dla wszystkich 7 partii ciała
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm font-bold text-[#007AFF]">Sprawdź →</Text>
                </Pressable>
              </View>
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

          {/* View 3: Standardy Lig (Strength Standards Overview) */}
          {activeView === "standards" && <RankingStandardsView />}
        </View>
      </ScrollView>

      {/* Standards Modal */}
      <LeagueStandardsModal
        visible={isStandardsModalOpen}
        onClose={closeStandardsModal}
      />
    </View>
  );
}

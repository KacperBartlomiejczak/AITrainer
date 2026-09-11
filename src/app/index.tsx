import React from "react";
import { ScrollView, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useHomeScreen } from "@/hooks/use-home-screen";
import {
  HomeHeader,
  AiCoachCard,
  TodayWorkoutCard,
  WeeklyProgressCard,
  QuickActionsGrid,
  RecentActivitySection,
} from "@/components/home";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading, refreshData } = useHomeScreen();

  const handleStartWorkout = (workoutId: string) => {
    // Navigate to active workout logger
    router.push(`/workout/${workoutId}` as never);
  };

  const handleQuickAction = (route: string) => {
    router.push(route as never);
  };

  const handleAskCoach = () => {
    router.push("/ai-coach" as never);
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 24) + 32,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      >
        <View className="flex-col gap-5">
          {/* Header with greeting, streak and user avatar */}
          <HomeHeader user={data.user} />

          {/* AI Coach interactive banner */}
          <AiCoachCard tip={data.aiCoachTip} onAskCoach={handleAskCoach} />

          {/* Featured next / today's workout */}
          <TodayWorkoutCard
            workout={data.todayWorkout}
            onStartWorkout={handleStartWorkout}
          />

          {/* 7-day weekly goal progress */}
          <WeeklyProgressCard
            completedCount={data.weeklyProgress.completedCount}
            targetCount={data.weeklyProgress.targetCount}
            days={data.weeklyProgress.days}
          />

          {/* Quick actions 2x2 grid */}
          <QuickActionsGrid
            actions={data.quickActions}
            onSelectAction={handleQuickAction}
          />

          {/* Previous workout recap with PRs */}
          <RecentActivitySection activity={data.recentActivity} />
        </View>
      </ScrollView>
    </View>
  );
}

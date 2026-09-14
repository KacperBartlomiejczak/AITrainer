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
  FriendsWorkoutFeed,
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
    router.push("/ai-mentor" as never);
  };

  const handleOpenProfile = () => {
    router.push("/profile" as never);
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 24) + 80,
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
          <HomeHeader user={data.user} onPressProfile={handleOpenProfile} />

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

          {/* Latest completed workout from the local database */}
          <RecentActivitySection activity={data.recentActivity} />

          {/* Friends' workouts (mock data until the friends feature exists) */}
          <FriendsWorkoutFeed items={data.friendsFeed} />
        </View>
      </ScrollView>
    </View>
  );
}

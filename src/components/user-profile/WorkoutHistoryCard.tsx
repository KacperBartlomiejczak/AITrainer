import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type LayoutChangeEvent,
} from "react-native";
import { WorkoutCoverSlide } from "./WorkoutCoverSlide";
import { WorkoutExercisesSlide } from "./WorkoutExercisesSlide";
import { WorkoutAchievementsSlide } from "./WorkoutAchievementsSlide";
import { WorkoutCardPagination } from "./WorkoutCardPagination";
import type { CompletedWorkoutDetail } from "@/schemas/user-profile-screen.schema";

interface WorkoutHistoryCardProps {
  workout: CompletedWorkoutDetail;
}

export function WorkoutHistoryCard({ workout }: WorkoutHistoryCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState<number>(Math.max(280, windowWidth - 32));
  const [activeSlide, setActiveSlide] = useState(0);

  const hasPhoto = Boolean(workout.imageAssetKey);
  const totalSlides = hasPhoto ? 3 : 2;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0) setCardWidth(w);
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      if (cardWidth > 0) {
        const nextIndex = Math.min(
          totalSlides - 1,
          Math.max(0, Math.round(offsetX / cardWidth))
        );
        setActiveSlide(nextIndex);
      }
    },
    [cardWidth, totalSlides]
  );

  return (
    <View
      testID={`completed-workout-${workout.id}`}
      onLayout={handleLayout}
      className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden shadow-xl"
    >
      <ScrollView
        testID={`workout-card-scroll-${workout.id}`}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScroll}
        style={{ width: cardWidth }}
      >
        {hasPhoto && (
          <WorkoutCoverSlide
            workout={workout}
            cardWidth={cardWidth}
            activeSlide={activeSlide}
            totalSlides={totalSlides}
          />
        )}

        <WorkoutExercisesSlide
          exercises={workout.exercises}
          workoutId={workout.id}
          cardWidth={cardWidth}
          showCoverMeta={!hasPhoto}
          workoutTitle={workout.title}
          completedMeta={`${workout.completedDate} • ${workout.durationMinutes} min`}
          activeSlide={activeSlide}
          totalSlides={totalSlides}
        />

        <WorkoutAchievementsSlide
          achievements={workout.achievements}
          workoutId={workout.id}
          cardWidth={cardWidth}
          activeSlide={activeSlide}
          totalSlides={totalSlides}
        />
      </ScrollView>

      <WorkoutCardPagination
        activeSlide={activeSlide}
        totalSlides={totalSlides}
      />
    </View>
  );
}

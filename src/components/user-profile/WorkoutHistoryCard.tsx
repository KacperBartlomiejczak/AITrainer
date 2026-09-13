import React from "react";
import { View, ScrollView } from "react-native";
import { useCardPager } from "@/hooks/use-card-pager";
import { WorkoutCoverSlide } from "./WorkoutCoverSlide";
import { WorkoutExercisesSlide } from "./WorkoutExercisesSlide";
import { WorkoutAchievementsSlide } from "./WorkoutAchievementsSlide";
import { WorkoutCardPagination } from "./WorkoutCardPagination";
import { WorkoutPhotoButton } from "./WorkoutPhotoButton";
import type { CompletedWorkoutDetail } from "@/schemas/user-profile-screen.schema";

interface WorkoutHistoryCardProps {
  workout: CompletedWorkoutDetail;
  /** Opens the camera/gallery sheet; the photo is optional and can be added later */
  onManagePhoto?: (workoutId: string) => void;
}

export function WorkoutHistoryCard({ workout, onManagePhoto }: WorkoutHistoryCardProps) {
  const hasPhoto = workout.photoUri !== null;
  const hasAchievements = workout.achievements.length > 0;
  const totalSlides = 1 + (hasPhoto ? 1 : 0) + (hasAchievements ? 1 : 0);

  const { cardWidth, activeSlide, handleLayout, handleScroll } = useCardPager(totalSlides);

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
          hasAchievementsSlide={hasAchievements}
        />

        {hasAchievements && (
          <WorkoutAchievementsSlide
            achievements={workout.achievements}
            workoutId={workout.id}
            cardWidth={cardWidth}
            activeSlide={activeSlide}
            totalSlides={totalSlides}
          />
        )}
      </ScrollView>

      {totalSlides > 1 && <WorkoutCardPagination activeSlide={activeSlide} totalSlides={totalSlides} />}

      {onManagePhoto && (
        <WorkoutPhotoButton workoutId={workout.id} hasPhoto={hasPhoto} onPress={onManagePhoto} />
      )}
    </View>
  );
}

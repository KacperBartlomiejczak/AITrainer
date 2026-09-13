import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings } from "lucide-react-native";
import { useUserProfileScreen } from "@/hooks/use-user-profile-screen";
import {
  RoutinePhotoCarousel,
  ProfileHeaderWithBadges,
  MonthlyIntensityChart,
  UserRoutinesList,
  RecentCompletedWorkouts,
  PastWorkoutModal,
} from "@/components/user-profile";
import { PillNavbar } from "@/components/navigation";
import { WorkoutPhotoSourceSheet } from "@/components/workout-photo";

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    stats,
    routinePhotos,
    monthlyIntensity,
    routines,
    recentWorkouts,
    selectedWorkoutPhoto,
    openWorkoutPhotoModal,
    closeWorkoutPhotoModal,
    managePhoto,
    photoSheet,
    openSettings,
    startRoutine,
  } = useUserProfileScreen();

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
          {/* Top Bar with Title and Settings Action */}
          <View className="flex-row items-center justify-between">
            <View className="flex-col gap-0.5">
              <Text className="text-2xl font-black text-white tracking-tight">
                Twój Profil 👤
              </Text>
              <Text className="text-xs text-[#71717A]">
                Postępy, intensywność i historia treningów
              </Text>
            </View>

            <Pressable
              testID="profile-settings-button"
              onPress={openSettings}
              accessibilityRole="button"
              accessibilityLabel="Ustawienia profilu"
              className="w-11 h-11 rounded-full bg-[#121214] border border-[#27272A] items-center justify-center active:bg-[#1E1E22]"
            >
              <Settings size={20} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* 1. Zdjęcia z ukończonych treningów (tylko te, które mają zdjęcie) */}
          <RoutinePhotoCarousel
            photos={routinePhotos}
            onSelectPhoto={openWorkoutPhotoModal}
          />

          {/* 2. Tagi pod profilem, seria 36 dni, ranga 100 kg Diamentowa Liga */}
          <ProfileHeaderWithBadges stats={stats} />

          {/* 3. Intensywność treningów w ciągu miesiąca (tydzień po tygodniu) */}
          <MonthlyIntensityChart intensity={monthlyIntensity} />

          {/* 4. Rutyny / treningi użytkownika (karty scrollowane poziomo) */}
          <UserRoutinesList routines={routines} onStartRoutine={startRoutine} />

          {/* 5. Ukończone treningi z bazy; zdjęcie można dodać/zmienić z karty */}
          <RecentCompletedWorkouts workouts={recentWorkouts} onManagePhoto={managePhoto} />
        </View>
      </ScrollView>

      {/* Modal ze szczegółami treningu i zdjęciami ćwiczeń po kliknięciu w zdjęcie */}
      <PastWorkoutModal
        workout={selectedWorkoutPhoto}
        visible={Boolean(selectedWorkoutPhoto)}
        onClose={closeWorkoutPhotoModal}
      />

      {/* Opcjonalne zdjęcie treningu: aparat lub galeria */}
      <WorkoutPhotoSourceSheet
        visible={photoSheet.isOpen}
        title="Zdjęcie z treningu"
        hasPhoto={photoSheet.hasPhoto}
        isSaving={photoSheet.isSaving}
        errorMessage={photoSheet.errorMessage}
        dismissLabel="Anuluj"
        onSelectSource={(source) => void photoSheet.selectSource(source)}
        onRemovePhoto={() => void photoSheet.removePhoto()}
        onDismiss={photoSheet.dismiss}
      />

      {/* Floating Pill Navigation */}
      <PillNavbar activeTab="profile" />
    </View>
  );
}

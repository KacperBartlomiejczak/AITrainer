import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { RoutinePhotoItem } from "@/schemas/user-profile-screen.schema";

interface RoutinePhotoCarouselProps {
  photos: RoutinePhotoItem[];
  onSelectPhoto: (photoId: string) => void;
}

export function RoutinePhotoCarousel({
  photos,
  onSelectPhoto,
}: RoutinePhotoCarouselProps) {
  return (
    <View className="flex-col gap-3">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">
          📸 Zdjęcia z Twoich Treningów
        </Text>
        <Text className="text-xs text-[#71717A]">Dotknij, aby zobaczyć trening →</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}
      >
        {photos.map((item) => {
          const media = getExerciseMedia(item.imageAssetKey);
          return (
            <Pressable
              key={item.id}
              testID={`routine-photo-${item.id}`}
              onPress={() => onSelectPhoto(item.id)}
              className="w-44 h-64 rounded-2xl overflow-hidden bg-[#121214] border border-[#27272A] active:opacity-85 shadow-xl"
            >
              {media?.image && (
                <Image
                  source={media.image}
                  className="w-full h-full absolute inset-0 rounded-2xl"
                  resizeMode="cover"
                />
              )}
              {/* Vertical gradient overlay */}
              <View className="flex-1 justify-between p-3.5 bg-gradient-to-t from-black/90 via-black/35 to-black/25">
                <View className="flex-row items-center gap-1.5 self-start bg-black/70 px-2 py-1 rounded-full border border-white/15">
                  <Text className="text-[10px] font-bold text-[#38BDF8]">
                    {item.completedDate || `${item.daysPerWeek}x w tyg`}
                  </Text>
                </View>

                <View className="flex-col gap-0.5">
                  <Text
                    className="text-sm font-black text-white leading-tight"
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="text-xs text-[#E4E4E7] font-medium"
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                  <Text className="text-[10px] text-[#38BDF8] font-bold mt-1">
                    Zobacz ćwiczenia →
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

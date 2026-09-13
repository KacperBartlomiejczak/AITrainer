import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import type { RoutinePhotoItem } from "@/schemas/user-profile-screen.schema";

interface RoutinePhotoCarouselProps {
  photos: RoutinePhotoItem[];
  onSelectPhoto: (photoId: string) => void;
}

function EmptyPhotos() {
  return (
    <View
      testID="routine-photos-empty"
      className="h-40 rounded-2xl border border-dashed border-[#27272A] bg-[#121214] items-center justify-center gap-1 px-6"
    >
      <Text className="text-2xl">📸</Text>
      <Text className="text-sm font-black text-white">Brak zdjęć z treningów</Text>
      <Text className="text-xs text-[#71717A] text-center">
        Dodaj zdjęcie po zakończeniu treningu albo z karty w historii
      </Text>
    </View>
  );
}

export function RoutinePhotoCarousel({ photos, onSelectPhoto }: RoutinePhotoCarouselProps) {
  return (
    <View className="flex-col gap-3">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">
          📸 Zdjęcia z Twoich Treningów
        </Text>
        {photos.length > 0 && (
          <Text className="text-xs text-[#71717A]">Dotknij, aby zobaczyć trening →</Text>
        )}
      </View>

      {photos.length === 0 ? (
        <EmptyPhotos />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 4 }}
        >
          {photos.map((item) => (
            <Pressable
              key={item.id}
              testID={`routine-photo-${item.id}`}
              onPress={() => onSelectPhoto(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Zobacz trening ${item.title}`}
              className="w-44 h-64 rounded-2xl overflow-hidden bg-[#121214] border border-[#27272A] active:opacity-85 shadow-xl"
            >
              <Image
                testID={`routine-photo-image-${item.id}`}
                source={{ uri: item.photoUri }}
                className="w-full h-full absolute inset-0 rounded-2xl"
                resizeMode="cover"
              />
              {/* Dark overlay keeps text readable (NativeWind has no gradient utilities) */}
              <View className="flex-1 justify-between p-3.5 bg-black/45">
                <View className="flex-row items-center gap-1.5 self-start bg-black/70 px-2 py-1 rounded-full border border-white/15">
                  <Text className="text-[10px] font-bold text-[#38BDF8]">{item.completedDate}</Text>
                </View>

                <View className="flex-col gap-0.5">
                  <Text className="text-sm font-black text-white leading-tight" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-xs text-[#E4E4E7] font-medium" numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                  <Text className="text-[10px] text-[#38BDF8] font-bold mt-1">Zobacz ćwiczenia →</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

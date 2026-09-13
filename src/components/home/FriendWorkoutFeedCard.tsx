import * as React from "react";
import { View, Text, Image } from "react-native";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { FriendWorkoutFeedItem } from "@/schemas/friends-feed.schema";

interface FriendWorkoutFeedCardProps {
  item: FriendWorkoutFeedItem;
}

export function FriendWorkoutFeedCard({ item }: FriendWorkoutFeedCardProps) {
  const photo = item.photoAssetKey ? getExerciseMedia(item.photoAssetKey) : null;

  return (
    <View
      testID={`friend-feed-card-${item.id}`}
      className="rounded-2xl bg-[#121214] border border-[#27272A] overflow-hidden"
    >
      <View className="flex-row items-center gap-3 p-3.5">
        <View
          style={{ backgroundColor: item.avatarColor }}
          className="w-9 h-9 rounded-full items-center justify-center"
        >
          <Text className="text-xs font-black text-white">{item.friendInitials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-white">{item.friendName}</Text>
          <Text className="text-[11px] text-[#71717A]">{item.completedAtLabel}</Text>
        </View>
      </View>

      {photo?.image && (
        <Image
          testID={`friend-feed-photo-${item.id}`}
          source={photo.image}
          accessibilityLabel={`Zdjęcie z treningu: ${item.friendName}`}
          className="w-full h-56 bg-[#18181B]"
          resizeMode="cover"
        />
      )}

      <View className="p-3.5 flex-col gap-1.5">
        <Text className="text-base font-black text-white" numberOfLines={1}>
          {item.workoutTitle}
        </Text>
        <Text className="text-xs font-semibold text-[#38BDF8]">
          {item.durationMinutes} min • {item.exerciseCount} ćwiczeń
        </Text>
        {item.highlight && <Text className="text-xs text-[#E4E4E7]">{item.highlight}</Text>}

        <View className="flex-row items-center gap-4 pt-1.5">
          <Text className="text-xs font-bold text-[#A1A1AA]">❤️ {item.likesCount}</Text>
          <Text className="text-xs font-bold text-[#A1A1AA]">💬 {item.commentsCount}</Text>
        </View>
      </View>
    </View>
  );
}

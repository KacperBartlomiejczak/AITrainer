import * as React from "react";
import { View, Text } from "react-native";
import type { FriendWorkoutFeedItem } from "@/schemas/friends-feed.schema";
import { FriendWorkoutFeedCard } from "./FriendWorkoutFeedCard";

interface FriendsWorkoutFeedProps {
  items: FriendWorkoutFeedItem[];
}

export function FriendsWorkoutFeed({ items }: FriendsWorkoutFeedProps) {
  if (items.length === 0) return null;

  return (
    <View className="flex-col gap-2.5">
      <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
        Treningi Znajomych
      </Text>
      <View className="flex-col gap-3">
        {items.map((item) => (
          <FriendWorkoutFeedCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

import React from "react";
import { Pressable, Text, View } from "react-native";
import { Home, Dumbbell, User, Trophy } from "lucide-react-native";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/schemas/navigation.schema";

interface PillNavItemProps {
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}

export function PillNavItem({ item, isActive, onPress }: PillNavItemProps) {
  const renderIcon = () => {
    const iconColor = isActive ? "#FFFFFF" : "#71717A";
    const iconSize = 20;

    switch (item.iconName) {
      case "Home":
        return <Home size={iconSize} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />;
      case "Dumbbell":
        return <Dumbbell size={iconSize} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />;
      case "Trophy":
        return <Trophy size={iconSize} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />;
      case "User":
        return <User size={iconSize} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />;
    }
  };

  return (
    <Pressable
      testID={item.testID}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={item.label}
      onPress={onPress}
      className={cn(
        "flex-1 flex-row items-center justify-center py-2 px-2 rounded-full gap-1.5 transition-all active:scale-95",
        isActive ? "bg-[#007AFF] shadow-md shadow-[#007AFF]/30" : "bg-transparent"
      )}
    >
      <View className="items-center justify-center">{renderIcon()}</View>
      <Text
        className={cn(
          "text-xs font-bold tracking-tight",
          isActive ? "text-white" : "text-[#71717A]"
        )}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

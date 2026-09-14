import React, { useCallback } from "react";
import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import * as Haptics from "expo-haptics";
import { Home, Dumbbell, Sparkles, User, Trophy } from "lucide-react-native";
import { cn } from "@/lib/utils";
import type { NavItem, NavItemLayout } from "@/schemas/navigation.schema";

interface PillNavItemProps {
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
  /** Reports this item's position/size within the navbar row, for the sliding indicator. */
  onMeasured?: (layout: NavItemLayout) => void;
}

export function PillNavItem({ item, isActive, onPress, onMeasured }: PillNavItemProps) {
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      onMeasured?.({ x, width });
    },
    [onMeasured]
  );

  const handlePress = useCallback(() => {
    void Haptics.selectionAsync();
    onPress();
  }, [onPress]);

  const renderIcon = () => {
    const iconColor = isActive ? "#FFFFFF" : "#71717A";
    const iconSize = 20;
    const strokeWidth = isActive ? 2.5 : 2;

    switch (item.iconName) {
      case "Home":
        return <Home size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case "Dumbbell":
        return <Dumbbell size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case "Sparkles":
        return <Sparkles size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case "Trophy":
        return <Trophy size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case "User":
        return <User size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <Pressable
      testID={item.testID}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={item.label}
      onLayout={handleLayout}
      onPress={handlePress}
      className="flex-1 flex-col items-center justify-center py-1.5 px-1 gap-0.5 rounded-full active:scale-[0.97] transition-transform duration-150"
    >
      <View className="items-center justify-center">{renderIcon()}</View>
      <Text
        numberOfLines={1}
        className={cn(
          "text-[10px] font-bold tracking-tight transition-colors duration-200",
          isActive ? "text-white" : "text-[#71717A]"
        )}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

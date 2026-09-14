import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePillNavigation } from "@/hooks/use-pill-navigation";
import { useTabIndicator } from "@/hooks/use-tab-indicator";
import { PillNavItem } from "./PillNavItem";
import { TabIndicator } from "./TabIndicator";
import type { NavTabId } from "@/schemas/navigation.schema";

interface PillNavbarProps {
  activeTab?: NavTabId;
}

export function PillNavbar({ activeTab: propActiveTab }: PillNavbarProps) {
  const insets = useSafeAreaInsets();
  const { activeTab, tabs, navigateToTab } = usePillNavigation(propActiveTab);
  const { indicatorStyle, reportLayout } = useTabIndicator(activeTab);

  return (
    <View
      testID="pill-navbar"
      pointerEvents="box-none"
      className="absolute left-0 right-0 items-center px-4"
      style={{ bottom: Math.max(insets.bottom, 12) + 6 }}
    >
      <View className="relative flex-row items-center justify-between w-full max-w-md bg-[#121214]/95 border border-[#27272A] rounded-full px-1.5 py-1.5 shadow-2xl backdrop-blur-md">
        <TabIndicator style={indicatorStyle} />
        {tabs.map((item) => (
          <PillNavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onPress={() => navigateToTab(item.id)}
            onMeasured={(layout) => reportLayout(item.id, layout)}
          />
        ))}
      </View>
    </View>
  );
}

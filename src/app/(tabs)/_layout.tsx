import React from "react";
import { Tabs } from "expo-router";
import { PillNavbar } from "@/components/navigation";

/**
 * A JS `Tabs` navigator (not `NativeTabs`) so `tabBar` can render our own
 * animated `PillNavbar` — `NativeTabs` only renders the platform tab bar.
 * The bar derives its active tab from the pathname itself (see
 * `usePillNavigation`), so the callback below ignores the navigator's props.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <PillNavbar />}
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="workouts" />
      <Tabs.Screen name="ai-mentor" />
      <Tabs.Screen name="ranking" />
      <Tabs.Screen name="user-profile" />
    </Tabs>
  );
}

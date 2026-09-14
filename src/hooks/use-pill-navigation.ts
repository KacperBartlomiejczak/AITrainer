import { useMemo, useCallback } from "react";
import { useRouter, usePathname } from "expo-router";
import {
  type NavTabId,
  type NavTabList,
  NavTabListSchema,
} from "@/schemas/navigation.schema";

export const DEFAULT_NAV_TABS: NavTabList = [
  {
    id: "home",
    label: "Home",
    iconName: "Home",
    route: "/",
    testID: "pill-nav-home",
  },
  {
    id: "workouts",
    label: "Treningi",
    iconName: "Dumbbell",
    route: "/workouts",
    testID: "pill-nav-workouts",
  },
  {
    id: "ai-mentor",
    label: "AI mentor",
    iconName: "Sparkles",
    route: "/ai-mentor",
    testID: "pill-nav-ai-mentor",
  },
  {
    id: "ranking",
    label: "Ranking",
    iconName: "Trophy",
    route: "/ranking",
    testID: "pill-nav-ranking",
  },
  {
    id: "profile",
    label: "Twój profil",
    iconName: "User",
    route: "/user-profile",
    testID: "pill-nav-profile",
  },
];

export function usePillNavigation(overrideTab?: NavTabId) {
  const router = useRouter();
  const pathname = usePathname();

  const validatedTabs = useMemo(() => {
    const parsed = NavTabListSchema.safeParse(DEFAULT_NAV_TABS);
    return parsed.success ? parsed.data : DEFAULT_NAV_TABS;
  }, []);

  const activeTab = useMemo<NavTabId>(() => {
    if (overrideTab) return overrideTab;
    if (pathname === "/workouts" || pathname.startsWith("/workout")) {
      return "workouts";
    }
    if (pathname === "/ai-mentor") {
      return "ai-mentor";
    }
    if (pathname === "/ranking") {
      return "ranking";
    }
    if (pathname === "/user-profile" || pathname === "/profile") {
      return "profile";
    }
    return "home";
  }, [overrideTab, pathname]);

  const navigateToTab = useCallback(
    (tabId: NavTabId) => {
      const target = validatedTabs.find((t) => t.id === tabId);
      if (target) {
        // `navigate` (not `push`) switches tabs without growing the Stack history.
        router.navigate(target.route as never);
      }
    },
    [router, validatedTabs]
  );

  return {
    activeTab,
    tabs: validatedTabs,
    navigateToTab,
  };
}

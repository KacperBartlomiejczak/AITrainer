import { act, renderHook } from "@testing-library/react-native";
import { usePathname, useRouter } from "expo-router";
import { usePillNavigation } from "../use-pill-navigation";

describe("usePillNavigation", () => {
  it("returns default active tab based on pathname '/'", async () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    const { result, unmount } = await renderHook(() => usePillNavigation());

    expect(result.current.activeTab).toBe("home");
    expect(result.current.tabs).toHaveLength(4);
    expect(result.current.tabs.map((t) => t.id)).toEqual([
      "home",
      "workouts",
      "ranking",
      "profile",
    ]);

    unmount();
  });

  it("detects 'workouts' tab when pathname is '/workouts'", async () => {
    (usePathname as jest.Mock).mockReturnValue("/workouts");
    const { result, unmount } = await renderHook(() => usePillNavigation());

    expect(result.current.activeTab).toBe("workouts");

    unmount();
  });

  it("detects 'ranking' tab when pathname is '/ranking'", async () => {
    (usePathname as jest.Mock).mockReturnValue("/ranking");
    const { result, unmount } = await renderHook(() => usePillNavigation());

    expect(result.current.activeTab).toBe("ranking");

    unmount();
  });

  it("detects 'profile' tab when pathname is '/user-profile'", async () => {
    (usePathname as jest.Mock).mockReturnValue("/user-profile");
    const { result, unmount } = await renderHook(() => usePillNavigation());

    expect(result.current.activeTab).toBe("profile");

    unmount();
  });

  it("allows explicit activeTab override", async () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    const { result, unmount } = await renderHook(() =>
      usePillNavigation("profile"),
    );

    expect(result.current.activeTab).toBe("profile");

    unmount();
  });

  it("navigates to target tab on navigateToTab call", async () => {
    const router = useRouter();
    const { result, unmount } = await renderHook(() => usePillNavigation());

    await act(async () => {
      result.current.navigateToTab("workouts");
    });
    expect(router.push).toHaveBeenCalledWith("/workouts");

    await act(async () => {
      result.current.navigateToTab("ranking");
    });
    expect(router.push).toHaveBeenCalledWith("/ranking");

    await act(async () => {
      result.current.navigateToTab("profile");
    });
    expect(router.push).toHaveBeenCalledWith("/user-profile");

    await act(async () => {
      result.current.navigateToTab("home");
    });
    expect(router.push).toHaveBeenCalledWith("/");

    unmount();
  });
});

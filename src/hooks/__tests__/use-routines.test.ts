import { renderHook, act } from "@testing-library/react-native";
import { useRoutines } from "../use-routines";
import { useRouter } from "expo-router";

describe("useRoutines", () => {
  it("returns initial list of routines validated by Zod", async () => {
    const { result, unmount } = await renderHook(() => useRoutines());

    expect(result.current.routines.length).toBeGreaterThanOrEqual(3);
    expect(result.current.filteredRoutines.length).toBe(
      result.current.routines.length
    );
    expect(result.current.filterLevel).toBe("all");

    unmount();
  });

  it("filters routines by level", async () => {
    const { result, unmount } = await renderHook(() => useRoutines());

    await act(async () => {
      result.current.setFilterLevel("beginner");
    });

    expect(result.current.filterLevel).toBe("beginner");
    expect(
      result.current.filteredRoutines.every((r) => r.level === "beginner")
    ).toBe(true);

    unmount();
  });

  it("navigates to workout when startRoutine is called", async () => {
    const router = useRouter();
    const { result, unmount } = await renderHook(() => useRoutines());

    await act(async () => {
      result.current.startRoutine("rtn_fbw_01");
    });

    expect(router.push).toHaveBeenCalledWith("/workout/rtn_fbw_01");

    unmount();
  });

  it("navigates to all exercises screen", async () => {
    const router = useRouter();
    const { result, unmount } = await renderHook(() => useRoutines());

    await act(async () => {
      result.current.openAllExercises();
    });

    expect(router.push).toHaveBeenCalledWith("/exercises");

    unmount();
  });
});

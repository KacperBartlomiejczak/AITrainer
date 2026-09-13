import { act, renderHook } from "@testing-library/react-native";
import { useElapsedSeconds } from "../use-elapsed-seconds";

describe("useElapsedSeconds", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-13T17:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 0 without a running workout", async () => {
    const { result, unmount } = await renderHook(() => useElapsedSeconds(null));
    expect(result.current).toBe(0);
    unmount();
  });

  it("counts seconds since the start and ticks every second", async () => {
    const startedAt = Date.now() - 65_000;
    const { result, unmount } = await renderHook(() => useElapsedSeconds(startedAt));
    expect(result.current).toBe(65);

    await act(async () => {
      jest.advanceTimersByTime(3_000);
    });
    expect(result.current).toBe(68);
    unmount();
  });

  it("stops the interval on unmount", async () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    const { unmount } = await renderHook(() => useElapsedSeconds(Date.now()));
    await unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

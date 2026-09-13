import { act, renderHook } from "@testing-library/react-native";
import type { LiveWorkoutSet } from "@/schemas/live-workout.schema";
import { useSetInputs } from "../use-set-inputs";

const emptySet: LiveWorkoutSet = { id: "s1", weightKg: null, reps: null, tag: null, isCompleted: false };

describe("useSetInputs", () => {
  it("shows stored values in Polish notation", async () => {
    const onUpdate = jest.fn();
    const { result, unmount } = await renderHook(() => useSetInputs({ ...emptySet, weightKg: 62.5, reps: 8 }, onUpdate));
    expect(result.current).toMatchObject({ weightText: "62,5", repsText: "8" });
    unmount();
  });

  it("saves valid typed values and clears them when the field is emptied", async () => {
    const onUpdate = jest.fn();
    const { result, unmount } = await renderHook(() => useSetInputs(emptySet, onUpdate));

    await act(async () => result.current.changeWeight("62,5"));
    await act(async () => result.current.changeReps("10"));
    expect(onUpdate).toHaveBeenNthCalledWith(1, { weightKg: 62.5 });
    expect(onUpdate).toHaveBeenNthCalledWith(2, { reps: 10 });

    await act(async () => result.current.changeReps(""));
    expect(onUpdate).toHaveBeenLastCalledWith({ reps: null });
    unmount();
  });

  it("keeps an unfinished or invalid value on screen without saving it", async () => {
    const onUpdate = jest.fn();
    const { result, unmount } = await renderHook(() => useSetInputs(emptySet, onUpdate));

    await act(async () => result.current.changeWeight("62,"));
    expect(result.current).toMatchObject({ weightText: "62,", isWeightInvalid: true });
    await act(async () => result.current.changeReps("0"));
    expect(result.current.isRepsInvalid).toBe(true);
    expect(onUpdate).not.toHaveBeenCalled();
    unmount();
  });

  it("shows a weight copied from another set, without overwriting text that is being typed", async () => {
    const onUpdate = jest.fn();
    const { result, rerender, unmount } = await renderHook(
      ({ current }: { current: LiveWorkoutSet }) => useSetInputs(current, onUpdate),
      { initialProps: { current: emptySet } },
    );

    await rerender({ current: { ...emptySet, weightKg: 60 } });
    expect(result.current.weightText).toBe("60");

    await act(async () => result.current.changeWeight("62,"));
    await rerender({ current: { ...emptySet, weightKg: 60 } });
    expect(result.current.weightText).toBe("62,");

    await act(async () => result.current.changeWeight("62,5"));
    await rerender({ current: { ...emptySet, weightKg: 62.5 } });
    expect(result.current.weightText).toBe("62,5");
    unmount();
  });
});

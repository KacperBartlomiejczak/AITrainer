import { act, renderHook } from "@testing-library/react-native";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useCardPager } from "../use-card-pager";

const layoutEvent = (width: number) => ({ nativeEvent: { layout: { width } } }) as LayoutChangeEvent;
const scrollEvent = (x: number) =>
  ({ nativeEvent: { contentOffset: { x, y: 0 } } }) as NativeSyntheticEvent<NativeScrollEvent>;

describe("useCardPager", () => {
  it("tracks the card width from layout and the active slide from scrolling", async () => {
    const { result } = await renderHook(() => useCardPager(3));

    await act(async () => result.current.handleLayout(layoutEvent(300)));
    expect(result.current.cardWidth).toBe(300);

    await act(async () => result.current.handleScroll(scrollEvent(310)));
    expect(result.current.activeSlide).toBe(1);
  });

  it("clamps the active slide to the available slides", async () => {
    const { result } = await renderHook(() => useCardPager(2));

    await act(async () => result.current.handleLayout(layoutEvent(300)));
    await act(async () => result.current.handleScroll(scrollEvent(5000)));
    expect(result.current.activeSlide).toBe(1);

    await act(async () => result.current.handleScroll(scrollEvent(-100)));
    expect(result.current.activeSlide).toBe(0);
  });

  it("ignores an empty layout width", async () => {
    const { result } = await renderHook(() => useCardPager(2));
    const initialWidth = result.current.cardWidth;

    await act(async () => result.current.handleLayout(layoutEvent(0)));
    expect(result.current.cardWidth).toBe(initialWidth);
  });
});

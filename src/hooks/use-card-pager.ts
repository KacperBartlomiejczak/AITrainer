import { useCallback, useState } from "react";
import {
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

const SCREEN_HORIZONTAL_PADDING = 32;
const MIN_CARD_WIDTH = 280;

/** Horizontal paging inside a card: measured card width + the slide currently in view. */
export function useCardPager(totalSlides: number) {
  const { width: windowWidth } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState<number>(
    Math.max(MIN_CARD_WIDTH, windowWidth - SCREEN_HORIZONTAL_PADDING),
  );
  const [activeSlide, setActiveSlide] = useState(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width > 0) setCardWidth(width);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (cardWidth <= 0) return;
      const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
      setActiveSlide(Math.min(totalSlides - 1, Math.max(0, index)));
    },
    [cardWidth, totalSlides],
  );

  return { cardWidth, activeSlide, handleLayout, handleScroll };
}

import type { ImageSourcePropType } from "react-native";

export interface ExerciseMediaItem {
  image: ImageSourcePropType;
  gif: ImageSourcePropType;
}

export const EXERCISE_ASSET_MAP: Record<string, ExerciseMediaItem> = {
  "0001": {
    image: require("@/assets/images/0001-2gPfomN.jpg"),
    gif: require("@/assets/videos/0001-2gPfomN.gif"),
  },
  "0003": {
    image: require("@/assets/images/0003-1ZFqTDN.jpg"),
    gif: require("@/assets/videos/0003-1ZFqTDN.gif"),
  },
  "0007": {
    image: require("@/assets/images/0007-4IKbhHV.jpg"),
    gif: require("@/assets/videos/0007-4IKbhHV.gif"),
  },
  "0025": {
    image: require("@/assets/images/0025-EIeI8Vf.jpg"),
    gif: require("@/assets/videos/0025-EIeI8Vf.gif"),
  },
  "0043": {
    image: require("@/assets/images/0043-qXTaZnJ.jpg"),
    gif: require("@/assets/videos/0043-qXTaZnJ.gif"),
  },
  "0047": {
    image: require("@/assets/images/0047-3TZduzM.jpg"),
    gif: require("@/assets/videos/0047-3TZduzM.gif"),
  },
  "0053": {
    image: require("@/assets/images/0053-1gFNTZV.jpg"),
    gif: require("@/assets/videos/0053-1gFNTZV.gif"),
  },
  "0070": {
    image: require("@/assets/images/0070-qOgPVf6.jpg"),
    gif: require("@/assets/videos/0070-qOgPVf6.gif"),
  },
  "0977": {
    image: require("@/assets/images/0977-sTg7iys.jpg"),
    gif: require("@/assets/videos/0977-sTg7iys.gif"),
  },
};

export function getExerciseMedia(id: string): ExerciseMediaItem | null {
  return EXERCISE_ASSET_MAP[id] ?? null;
}

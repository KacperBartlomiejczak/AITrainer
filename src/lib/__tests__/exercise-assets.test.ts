import fs from "fs";
import path from "path";
import { z } from "zod";
import { EXERCISE_ASSET_MAP, getExerciseMedia } from "../exercise-assets";
import { INITIAL_CATALOG_EXERCISES } from "@/hooks/use-exercise-catalog";

const DatasetExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  gif_url: z.string().min(1),
});

const DatasetSchema = z.array(DatasetExerciseSchema);

type DatasetExercise = z.infer<typeof DatasetExerciseSchema>;

// jest-expo transforms `require("*.jpg")` into `{ testUri: "<relative path>" }`
const TestAssetSchema = z.object({ testUri: z.string().min(1) });

const NON_EXERCISE_ASSET_KEYS = new Set(["example_past_photo"]);

/**
 * Regression guard: Polish catalog name → exercise name in the source dataset.
 * Keyed by name (not id) so assigning a wrong id to an exercise is caught.
 */
const EXPECTED_DATASET_NAMES: Record<string, string> = {
  "Wyciskanie sztangi na ławce poziomej": "barbell bench press",
  "Wyciskanie sztangi na ławce skośnej": "barbell incline bench press",
  "Pompki szerokim rozstawem rąk": "wide hand push up",
  "Wyciskanie hantli na ławce": "dumbbell bench press",
  "Dipy na poręczach (klatka)": "chest dip",
  "Rozpiętki z hantlami na ławce": "dumbbell fly",
  "Ściąganie drążka wyciągu pionowego": "cable pulldown",
  "Wiosłowanie sztangą w opadzie tułowia": "barbell bent over row",
  "Podciąganie szerokim chwytem (nachwytem)": "pull-up",
  "Wiosłowanie hantlem jednoręcznie": "dumbbell one arm bent-over row",
  "Ściąganie wyciągu dolnego do brzucha": "cable low seated row",
  "Martwy ciąg": "barbell deadlift",
  "Przysiad ze sztangą (Full Squat)": "barbell full squat",
  "Przysiad z wyskokiem": "jump squat",
  "Wykrok ze sztangą": "barbell lunge",
  "Prostowanie nóg na maszynie": "lever leg extension",
  "Uginanie nóg leżąc (maszyna)": "lever lying leg curl",
  "Glute bridge (uniesienie bioder)": "low glute bridge on floor",
  "Uginanie przedramion na modlitewniku": "barbell preacher curl",
  "Uginanie hantli ze skrętem nadgarstka": "dumbbell alternate biceps curl",
  "Triceps – prostowanie ramion na wyciągu": "cable pushdown",
  "Dipy na ławce (triceps)": "bench dip (knees bent)",
  "Wyciskanie wąskim chwytem (triceps)": "barbell close-grip bench press",
  "Młotki (hammer curl) z hantlami": "dumbbell hammer curl",
  "Wznosy ramion z taśmą oporową": "band front lateral raise",
  "Wznosy ramion do przodu (frontalnie)": "band front raise",
  "Odwrotne rozpiętki (rear delt fly)": "band reverse fly",
  "Wyciskanie barków z taśmą": "band shoulder press",
  "Wiosłowanie taśmą do tylnych barków": "band standing rear delt row",
  "Pallof press (stabilizacja rdzenia)": "band horizontal pallof press",
  "Brzuszki 3/4 (Sit-up)": "3/4 sit-up",
  "Skłony boczne (Side Bend)": "45° side bend",
  "Rowerek w leżeniu (Air Bike)": "air bike",
  "Dotykanie pięt w leżeniu": "alternate heel touchers",
  "Dipy na maszynie asystującej": "assisted chest dip (kneeling)",
  "Unoszenie kolan w zwisie (wyrzut nóg)": "assisted hanging knee raise with throw down",
  "Wiatrak z kettlebellem (Windmill)": "kettlebell advanced windmill",
  "Burpee": "burpee",
  "Burpee z hantlami": "dumbbell burpee",
};

function loadDataset(): Map<string, DatasetExercise> {
  const filePath = path.join(__dirname, "../../../assets/data/exercises.json");
  const raw: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const parsed = DatasetSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`exercises.json failed validation: ${parsed.error.message}`);
  }
  return new Map(parsed.data.map((exercise) => [exercise.id, exercise]));
}

function assetFileName(source: unknown): string {
  const parsed = TestAssetSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Unexpected asset shape: ${JSON.stringify(source)}`);
  }
  return path.basename(parsed.data.testUri);
}

describe("exercise media mapping", () => {
  const dataset = loadDataset();
  const catalogIds = INITIAL_CATALOG_EXERCISES.map((exercise) => exercise.id);

  it("has unique catalog ids", () => {
    expect(new Set(catalogIds).size).toBe(catalogIds.length);
  });

  it("covers every catalog exercise in the expected-name guard", () => {
    const catalogNames = INITIAL_CATALOG_EXERCISES.map((exercise) => exercise.name);
    expect([...catalogNames].sort()).toEqual(Object.keys(EXPECTED_DATASET_NAMES).sort());
  });

  it.each(INITIAL_CATALOG_EXERCISES.map((exercise) => [exercise.id, exercise.name, exercise] as const))(
    "%s (%s) points to the matching dataset exercise and media",
    (id, name, exercise) => {
      const datasetExercise = dataset.get(id);

      expect(datasetExercise?.name).toBe(EXPECTED_DATASET_NAMES[name]);
      expect(exercise.imageFile).toBe(datasetExercise?.image);
      expect(exercise.gifFile).toBe(datasetExercise?.gif_url);
    }
  );

  it("labels the preacher curl equipment as a straight barbell, matching its media", () => {
    const preacherCurl = INITIAL_CATALOG_EXERCISES.find((exercise) => exercise.id === "0070");
    expect(preacherCurl?.equipment).toBe("Sztanga");
  });

  it.each(catalogIds)("asset map entry %s requires files of the same exercise", (id) => {
    const exercise = INITIAL_CATALOG_EXERCISES.find((item) => item.id === id);
    const media = getExerciseMedia(id);

    expect(media).not.toBeNull();
    expect(assetFileName(media?.image)).toBe(path.basename(exercise?.imageFile ?? ""));
    expect(assetFileName(media?.gif)).toBe(path.basename(exercise?.gifFile ?? ""));
  });

  it("has no orphaned exercise entries in the asset map", () => {
    const exerciseKeys = Object.keys(EXERCISE_ASSET_MAP).filter(
      (key) => !NON_EXERCISE_ASSET_KEYS.has(key)
    );
    expect(exerciseKeys.sort()).toEqual([...catalogIds].sort());
  });

  it("returns null for unknown ids so the UI can render a placeholder", () => {
    expect(getExerciseMedia("does-not-exist")).toBeNull();
  });
});

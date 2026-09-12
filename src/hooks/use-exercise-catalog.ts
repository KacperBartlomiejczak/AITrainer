import { useState, useMemo, useCallback } from "react";
import {
  type CatalogExercise,
  type ExerciseCategoryFilter,
  type ExerciseCatalogList,
  ExerciseCatalogListSchema,
} from "@/schemas/exercise-catalog.schema";

export const INITIAL_CATALOG_EXERCISES: ExerciseCatalogList = [
  {
    id: "0025",
    name: "Wyciskanie sztangi na ławce poziomej",
    bodyPart: "chest",
    category: "chest",
    target: "Klatka piersiowa",
    equipment: "Sztanga",
    instructionsPl:
      "Połóż się płasko na ławce, stopy oprzyj na podłodze. Chwyć sztangę nachwytem, opuść powoli do klatki i dynamicznie wyciśnij w górę.",
    imageFile: "images/0025-EIeI8Vf.jpg",
    gifFile: "videos/0025-EIeI8Vf.gif",
  },
  {
    id: "0047",
    name: "Wyciskanie sztangi na ławce skośnej",
    bodyPart: "chest",
    category: "chest",
    target: "Górna część klatki",
    equipment: "Sztanga",
    instructionsPl:
      "Ustaw ławkę pod kątem 30-45 stopni. Opuść sztangę do górnej części mostka, kontrolując ciężar, a następnie wyciśnij.",
    imageFile: "images/0047-3TZduzM.jpg",
    gifFile: "videos/0047-3TZduzM.gif",
  },
  {
    id: "0007",
    name: "Ściąganie drążka wyciągu pionowego",
    bodyPart: "back",
    category: "back",
    target: "Mięsień najszerszy grzbietu",
    equipment: "Wyciąg",
    instructionsPl:
      "Chwyć drążek szerokim nachwytem. Ściągaj drążek w dół w kierunku górnej części klatki, napinając mocno łopatki.",
    imageFile: "images/0007-4IKbhHV.jpg",
    gifFile: "videos/0007-4IKbhHV.gif",
  },
  {
    id: "0043",
    name: "Przysiad głęboki ze sztangą (Full Squat)",
    bodyPart: "legs",
    category: "legs",
    target: "Czworogłowe i pośladki",
    equipment: "Sztanga",
    instructionsPl:
      "Stań na szerokość barków. Schodź płynnie w dół wypychając biodra w tył, kolana w linii stóp, plecy proste.",
    imageFile: "images/0043-qXTaZnJ.jpg",
    gifFile: "videos/0043-qXTaZnJ.gif",
  },
  {
    id: "0053",
    name: "Przysiad z wyskokiem ze sztangą",
    bodyPart: "legs",
    category: "legs",
    target: "Moc nóg i pośladki",
    equipment: "Sztanga",
    instructionsPl:
      "Wykonaj dynamiczny przysiad i wybij się w górę, amortyzując lądowanie na śródstopiu.",
    imageFile: "images/0053-1gFNTZV.jpg",
    gifFile: "videos/0053-1gFNTZV.gif",
  },
  {
    id: "0070",
    name: "Uginanie przedramion ze sztangą na modlitewniku",
    bodyPart: "arms",
    category: "arms",
    target: "Biceps",
    equipment: "Sztanga łamana",
    instructionsPl:
      "Oprzyj ramiona stabilnie na modlitewniku. Unieś sztangę zginając łokcie i zatrzymaj na sekundę w szczytowym napięciu.",
    imageFile: "images/0070-qOgPVf6.jpg",
    gifFile: "videos/0070-qOgPVf6.gif",
  },
  {
    id: "0977",
    name: "Wznosy ramion z gumą oporową",
    bodyPart: "shoulders",
    category: "shoulders",
    target: "Boczny akton barku",
    equipment: "Guma oporowa",
    instructionsPl:
      "Stań na środku gumy i unoś ramiona do wysokości barków, dbając o stałe napięcie mięśni.",
    imageFile: "images/0977-sTg7iys.jpg",
    gifFile: "videos/0977-sTg7iys.gif",
  },
  {
    id: "0001",
    name: "Brzuszki 3/4 (3/4 Sit-up)",
    bodyPart: "waist",
    category: "waist",
    target: "Mięśnie proste brzucha",
    equipment: "Masa własnego ciała",
    instructionsPl:
      "Połóż się płasko na plecach, ugnij kolana. Unoś tułów spinając mocno brzuch, nie odrywając odcinka lędźwiowego.",
    imageFile: "images/0001-2gPfomN.jpg",
    gifFile: "videos/0001-2gPfomN.gif",
  },
  {
    id: "0003",
    name: "Rowerek w leżeniu (Air Bike)",
    bodyPart: "waist",
    category: "waist",
    target: "Mięśnie skośne brzucha",
    equipment: "Masa własnego ciała",
    instructionsPl:
      "Dotykaj przeciwległym łokciem do kolana w płynnym, naprzemiennym ruchu przypominającym pedałowanie.",
    imageFile: "images/0003-1ZFqTDN.jpg",
    gifFile: "videos/0003-1ZFqTDN.gif",
  },
];

export function useExerciseCatalog() {
  const [categoryFilter, setCategoryFilter] =
    useState<ExerciseCategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedExercise, setSelectedExercise] =
    useState<CatalogExercise | null>(null);

  const validatedExercises = useMemo(() => {
    const parsed = ExerciseCatalogListSchema.safeParse(
      INITIAL_CATALOG_EXERCISES
    );
    return parsed.success ? parsed.data : INITIAL_CATALOG_EXERCISES;
  }, []);

  const filteredExercises = useMemo(() => {
    return validatedExercises.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.bodyPart === categoryFilter;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.target.toLowerCase().includes(normalizedQuery) ||
        item.equipment.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery, validatedExercises]);

  const openPreview = useCallback((exercise: CatalogExercise) => {
    setSelectedExercise(exercise);
  }, []);

  const closePreview = useCallback(() => {
    setSelectedExercise(null);
  }, []);

  return {
    exercises: validatedExercises,
    filteredExercises,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    selectedExercise,
    openPreview,
    closePreview,
  };
}

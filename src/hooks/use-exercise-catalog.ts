import { useState, useMemo, useCallback } from "react";
import {
  type CatalogExercise,
  type ExerciseCategoryFilter,
  type ExerciseCatalogList,
  ExerciseCatalogListSchema,
} from "@/schemas/exercise-catalog.schema";

// ---------------------------------------------------------------------------
// Full exercise catalog — 42 ćwiczenia pokrywające wszystkie partie mięśniowe
// ---------------------------------------------------------------------------
export const INITIAL_CATALOG_EXERCISES: ExerciseCatalogList = [
  // ── KLATKA PIERSIOWA ──────────────────────────────────────────────────────
  {
    id: "0025",
    name: "Wyciskanie sztangi na ławce poziomej",
    bodyPart: "chest",
    category: "chest",
    target: "Klatka piersiowa",
    equipment: "Sztanga",
    muscleGroup: "pectorals",
    secondaryMuscles: ["shoulders", "triceps"],
    instructionsPl:
      "Połóż się płasko na ławce, stopy oprzyj na podłodze. Chwyć sztangę nachwytem, opuść powoli do klatki i dynamicznie wyciśnij w górę. Zachowaj naturalne wygięcie kręgosłupa przez cały ruch.",
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
    muscleGroup: "pectorals",
    secondaryMuscles: ["shoulders", "triceps"],
    instructionsPl:
      "Ustaw ławkę pod kątem 30–45 stopni. Opuść sztangę do górnej części mostka, kontrolując ciężar, a następnie wyciśnij mocnym ruchem.",
    imageFile: "images/0047-3TZduzM.jpg",
    gifFile: "videos/0047-3TZduzM.gif",
  },
  {
    id: "0033",
    name: "Pompki szerokim rozstawem rąk",
    bodyPart: "chest",
    category: "chest",
    target: "Klatka piersiowa",
    equipment: "Masa własnego ciała",
    muscleGroup: "pectorals",
    secondaryMuscles: ["triceps", "shoulders"],
    instructionsPl:
      "Przyjmij pozycję podporu z rękoma rozstawionymi szerzej niż ramiona. Opuść ciało kontrolowanie aż klatka dotknie podłogi, a następnie wypchnij się w górę.",
    imageFile: "images/0033-GrO65fd.jpg",
    gifFile: "videos/0033-GrO65fd.gif",
  },
  {
    id: "0035",
    name: "Wyciskanie hantli na ławce",
    bodyPart: "chest",
    category: "chest",
    target: "Klatka piersiowa",
    equipment: "Hantle",
    muscleGroup: "pectorals",
    secondaryMuscles: ["shoulders", "triceps"],
    instructionsPl:
      "Połóż się na ławce z hantlami na wysokości klatki. Wyciśnij hantle w górę, a następnie kontrolowanie opuść z powrotem.",
    imageFile: "images/0035-LMGXZn8.jpg",
    gifFile: "videos/0035-LMGXZn8.gif",
  },
  {
    id: "0022",
    name: "Dipy na poręczach (klatka)",
    bodyPart: "chest",
    category: "chest",
    target: "Klatka piersiowa",
    equipment: "Poręcze",
    muscleGroup: "pectorals",
    secondaryMuscles: ["triceps", "shoulders"],
    instructionsPl:
      "Chwyć poręcze i wyprostuj ręce. Pochyl tułów lekko do przodu i opuść ciało uginając łokcie, następnie wypchnij się w górę.",
    imageFile: "images/0022-znLogoF.jpg",
    gifFile: "videos/0022-znLogoF.gif",
  },
  {
    id: "0036",
    name: "Rozpiętki z hantlami na ławce",
    bodyPart: "chest",
    category: "chest",
    target: "Klatka piersiowa",
    equipment: "Hantle",
    muscleGroup: "pectorals",
    secondaryMuscles: ["biceps", "shoulders"],
    instructionsPl:
      "Połóż się na ławce z hantlami nad klatką. Opuszczaj ręce na boki w łuku, trzymając lekkie ugięcie w łokciach, aż poczujesz rozciągnięcie mięśni.",
    imageFile: "images/0036-hl8DUh8.jpg",
    gifFile: "videos/0036-hl8DUh8.gif",
  },

  // ── PLECY ─────────────────────────────────────────────────────────────────
  {
    id: "0007",
    name: "Ściąganie drążka wyciągu pionowego",
    bodyPart: "back",
    category: "back",
    target: "Mięsień najszerszy grzbietu",
    equipment: "Wyciąg",
    muscleGroup: "lats",
    secondaryMuscles: ["biceps", "rear delts"],
    instructionsPl:
      "Chwyć drążek szerokim nachwytem. Ściągaj drążek w dół w kierunku górnej części klatki, napinając mocno łopatki. Wykonuj ruch kontrolowanie.",
    imageFile: "images/0007-4IKbhHV.jpg",
    gifFile: "videos/0007-4IKbhHV.gif",
  },
  {
    id: "0026",
    name: "Wiosłowanie sztangą w opadzie tułowia",
    bodyPart: "back",
    category: "back",
    target: "Środkowe plecy",
    equipment: "Sztanga",
    muscleGroup: "upper back",
    secondaryMuscles: ["biceps", "lats"],
    instructionsPl:
      "Pochyl się do przodu pod kątem ~45 stopni, plecy proste. Przyciągnij sztangę do brzucha, ściskając łopatki w górnej pozycji.",
    imageFile: "images/0026-W9pFVv1.jpg",
    gifFile: "videos/0026-W9pFVv1.gif",
  },
  {
    id: "0030",
    name: "Podciąganie szerokim chwytem (nachwytem)",
    bodyPart: "back",
    category: "back",
    target: "Mięsień najszerszy grzbietu",
    equipment: "Drążek",
    muscleGroup: "lats",
    secondaryMuscles: ["biceps", "rear delts"],
    instructionsPl:
      "Chwyć drążek szerokim nachwytem. Podciągnij się do momentu gdy broda przekroczy poziom drążka. Wykonuj ruch kontrolowanie.",
    imageFile: "images/0030-J6Dx1Mu.jpg",
    gifFile: "videos/0030-J6Dx1Mu.gif",
  },
  {
    id: "0031",
    name: "Wiosłowanie hantlem jednoręcznie",
    bodyPart: "back",
    category: "back",
    target: "Środkowe plecy",
    equipment: "Hantel",
    muscleGroup: "upper back",
    secondaryMuscles: ["biceps", "lats"],
    instructionsPl:
      "Oprzyj jedno kolano i rękę o ławkę. Chwyć hantel drugą ręką i przyciągnij go do biodra, ściskając łopatkę.",
    imageFile: "images/0031-25GPyDY.jpg",
    gifFile: "videos/0031-25GPyDY.gif",
  },
  {
    id: "0032",
    name: "Ściąganie wyciągu dolnego do brzucha",
    bodyPart: "back",
    category: "back",
    target: "Środkowe plecy",
    equipment: "Wyciąg",
    muscleGroup: "upper back",
    secondaryMuscles: ["biceps", "lats"],
    instructionsPl:
      "Usiądź przy wyciągu dolnym. Przyciągnij uchwyt do brzucha, ściskając łopatki, następnie kontrolowanie wróć do pozycji wyjściowej.",
    imageFile: "images/0032-ila4NZS.jpg",
    gifFile: "videos/0032-ila4NZS.gif",
  },
  {
    id: "0034",
    name: "Martwy ciąg",
    bodyPart: "back",
    category: "back",
    target: "Dolne plecy",
    equipment: "Sztanga",
    muscleGroup: "lower back",
    secondaryMuscles: ["glutes", "hamstrings", "lats"],
    instructionsPl:
      "Stań nad sztangą ze stopami na szerokość bioder. Zegnij kolana, chwyć sztangę nachwytem i unoś ją wyprostowanymi plecami aż do pełnego wyprostu bioder.",
    imageFile: "images/0034-hMEptv0.jpg",
    gifFile: "videos/0034-hMEptv0.gif",
  },

  // ── NOGI (GÓRNA CZĘŚĆ) ────────────────────────────────────────────────────
  {
    id: "0043",
    name: "Przysiad ze sztangą (Full Squat)",
    bodyPart: "upper legs",
    category: "upper legs",
    target: "Czworogłowe i pośladki",
    equipment: "Sztanga",
    muscleGroup: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "calves"],
    instructionsPl:
      "Stań na szerokość barków ze sztangą na karku. Schodź płynnie w dół wypychając biodra w tył, kolana w linii stóp, plecy proste. Wróć mocnym ruchem.",
    imageFile: "images/0043-qXTaZnJ.jpg",
    gifFile: "videos/0043-qXTaZnJ.gif",
  },
  {
    id: "0053",
    name: "Przysiad z wyskokiem",
    bodyPart: "upper legs",
    category: "upper legs",
    target: "Moc nóg i pośladki",
    equipment: "Masa własnego ciała",
    muscleGroup: "quadriceps",
    secondaryMuscles: ["glutes", "calves"],
    instructionsPl:
      "Wykonaj dynamiczny przysiad, a następnie wybij się mocno w górę. Amortyzuj lądowanie miękko na śródstopiu, natychmiast przechodząc w kolejny przysiad.",
    imageFile: "images/0053-1gFNTZV.jpg",
    gifFile: "videos/0053-1gFNTZV.gif",
  },
  {
    id: "0045",
    name: "Wykrok ze sztangą",
    bodyPart: "upper legs",
    category: "upper legs",
    target: "Czworogłowe",
    equipment: "Sztanga",
    muscleGroup: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings"],
    instructionsPl:
      "Stań z sztangą na karku. Zrób duży krok do przodu, opuść tylne kolano blisko podłogi, a następnie wróć do pozycji wyjściowej.",
    imageFile: "images/0045-GXoaSgn.jpg",
    gifFile: "videos/0045-GXoaSgn.gif",
  },
  {
    id: "0046",
    name: "Prostowanie nóg na maszynie",
    bodyPart: "upper legs",
    category: "upper legs",
    target: "Mięśnie czworogłowe",
    equipment: "Maszyna",
    muscleGroup: "quadriceps",
    secondaryMuscles: [],
    instructionsPl:
      "Usiądź na maszynie z nogami pod wałkiem. Prostuj nogi do pełnego wyprostu, napinając mocno czworogłowe, następnie kontrolowanie wróć.",
    imageFile: "images/0046-5VCj6iH.jpg",
    gifFile: "videos/0046-5VCj6iH.gif",
  },
  {
    id: "0048",
    name: "Uginanie nóg leżąc (maszyna)",
    bodyPart: "upper legs",
    category: "upper legs",
    target: "Dwugłowe uda",
    equipment: "Maszyna",
    muscleGroup: "hamstrings",
    secondaryMuscles: ["calves"],
    instructionsPl:
      "Połóż się na maszynie twarzą w dół. Ugnij nogi w kolanach, przyciągając wałek do pośladków. Powoli wróć do pozycji wyjściowej.",
    imageFile: "images/0048-641mIfk.jpg",
    gifFile: "videos/0048-641mIfk.gif",
  },
  {
    id: "0049",
    name: "Glute bridge (uniesienie bioder)",
    bodyPart: "upper legs",
    category: "upper legs",
    target: "Pośladki",
    equipment: "Masa własnego ciała",
    muscleGroup: "glutes",
    secondaryMuscles: ["hamstrings", "lower back"],
    instructionsPl:
      "Połóż się na plecach, ugnij kolana. Unieś biodra aż ciało tworzy prostą linię od kolan do barków, napinając mocno pośladki na szczycie.",
    imageFile: "images/0049-dmgMp3n.jpg",
    gifFile: "videos/0049-dmgMp3n.gif",
  },

  // ── RAMIONA (GÓRNA CZĘŚĆ) ─────────────────────────────────────────────────
  {
    id: "0070",
    name: "Uginanie przedramion na modlitewniku",
    bodyPart: "upper arms",
    category: "upper arms",
    target: "Biceps",
    equipment: "Sztanga łamana",
    muscleGroup: "biceps",
    secondaryMuscles: ["forearms"],
    instructionsPl:
      "Oprzyj ramiona stabilnie na modlitewniku. Unieś sztangę zginając łokcie i zatrzymaj na sekundę w szczytowym napięciu bicepsa.",
    imageFile: "images/0070-qOgPVf6.jpg",
    gifFile: "videos/0070-qOgPVf6.gif",
  },
  {
    id: "0072",
    name: "Uginanie hantli ze skrętem nadgarstka",
    bodyPart: "upper arms",
    category: "upper arms",
    target: "Biceps",
    equipment: "Hantle",
    muscleGroup: "biceps",
    secondaryMuscles: ["forearms"],
    instructionsPl:
      "Trzymaj hantle wzdłuż ciała. Uginaj łokcie unosząc hantle, obracając nadgarstki tak aby dłonie skierowane były ku górze w szczytowej pozycji.",
    imageFile: "images/0072-WLvTAv5.jpg",
    gifFile: "videos/0072-WLvTAv5.gif",
  },
  {
    id: "0073",
    name: "Triceps – prostowanie ramion na wyciągu",
    bodyPart: "upper arms",
    category: "upper arms",
    target: "Triceps",
    equipment: "Wyciąg",
    muscleGroup: "triceps",
    secondaryMuscles: [],
    instructionsPl:
      "Stań przy wyciągu i chwyć drążek. Trzymając łokcie przy ciele, wyprostuj ramiona w dół, mocno napinając triceps.",
    imageFile: "images/0073-i6LWjok.jpg",
    gifFile: "videos/0073-i6LWjok.gif",
  },
  {
    id: "0074",
    name: "Dipy na ławce (triceps)",
    bodyPart: "upper arms",
    category: "upper arms",
    target: "Triceps",
    equipment: "Ławka",
    muscleGroup: "triceps",
    secondaryMuscles: ["shoulders"],
    instructionsPl:
      "Oprzyj dłonie o krawędź ławki za plecami. Opuść ciało uginając łokcie, następnie wypchnij się z powrotem do pozycji wyjściowej.",
    imageFile: "images/0074-za9Ni4z.jpg",
    gifFile: "videos/0074-za9Ni4z.gif",
  },
  {
    id: "0075",
    name: "Wyciskanie wąskim chwytem (triceps)",
    bodyPart: "upper arms",
    category: "upper arms",
    target: "Triceps",
    equipment: "Sztanga",
    muscleGroup: "triceps",
    secondaryMuscles: ["chest", "shoulders"],
    instructionsPl:
      "Połóż się na ławce i chwyć sztangę wąskim chwytem. Wyciśnij sztangę trzymając łokcie blisko ciała, skupiając napięcie na tricepsie.",
    imageFile: "images/0075-Ln9iTbU.jpg",
    gifFile: "videos/0075-Ln9iTbU.gif",
  },
  {
    id: "0076",
    name: "Młotki (hammer curl) z hantlami",
    bodyPart: "upper arms",
    category: "upper arms",
    target: "Biceps",
    equipment: "Hantle",
    muscleGroup: "biceps",
    secondaryMuscles: ["forearms", "brachialis"],
    instructionsPl:
      "Trzymaj hantle z dłońmi skierowanymi ku sobie. Uginaj łokcie naprzemiennie lub oburącz, zachowując neutralny chwyt przez cały ruch.",
    imageFile: "images/0076-S9zHIvU.jpg",
    gifFile: "videos/0076-S9zHIvU.gif",
  },

  // ── BARKI ─────────────────────────────────────────────────────────────────
  {
    id: "0977",
    name: "Wznosy ramion z taśmą oporową",
    bodyPart: "shoulders",
    category: "shoulders",
    target: "Boczny akton barku",
    equipment: "Taśma oporowa",
    muscleGroup: "delts",
    secondaryMuscles: ["upper back"],
    instructionsPl:
      "Stań na środku taśmy. Unoś ramiona na boki do wysokości barków, dbając o stałe napięcie mięśni i kontrolując ruch w obie strony.",
    imageFile: "images/0977-sTg7iys.jpg",
    gifFile: "videos/0977-sTg7iys.gif",
  },
  {
    id: "0978",
    name: "Wznosy ramion do przodu (frontalnie)",
    bodyPart: "shoulders",
    category: "shoulders",
    target: "Przedni akton barku",
    equipment: "Taśma oporowa",
    muscleGroup: "delts",
    secondaryMuscles: ["triceps", "upper back"],
    instructionsPl:
      "Stań na taśmie i trzymaj ją przed udami. Unoś ramiona do przodu do wysokości barków, następnie powoli opuść.",
    imageFile: "images/0978-TFA88iB.jpg",
    gifFile: "videos/0978-TFA88iB.gif",
  },
  {
    id: "0993",
    name: "Odwrotne rozpiętki (rear delt fly)",
    bodyPart: "shoulders",
    category: "shoulders",
    target: "Tylny akton barku",
    equipment: "Taśma oporowa",
    muscleGroup: "delts",
    secondaryMuscles: ["upper back", "trapezius"],
    instructionsPl:
      "Przymocuj taśmę na wysokości klatki. Stań i chwyć taśmę obiema rękami. Unoś ramiona na boki ściskając łopatki w górnej pozycji.",
    imageFile: "images/0993-sTfvVsG.jpg",
    gifFile: "videos/0993-sTfvVsG.gif",
  },
  {
    id: "0997",
    name: "Wyciskanie barków z taśmą",
    bodyPart: "shoulders",
    category: "shoulders",
    target: "Deltoid",
    equipment: "Taśma oporowa",
    muscleGroup: "delts",
    secondaryMuscles: ["triceps", "upper back"],
    instructionsPl:
      "Stań na taśmie. Trzymaj uchwyty na wysokości barków i wypchnij nad głowę, pełni prostując ramiona, następnie powoli opuść.",
    imageFile: "images/0997-peAeMR3.jpg",
    gifFile: "videos/0997-peAeMR3.gif",
  },
  {
    id: "1022",
    name: "Wiosłowanie taśmą do tylnych barków",
    bodyPart: "shoulders",
    category: "shoulders",
    target: "Tylny akton barku",
    equipment: "Taśma oporowa",
    muscleGroup: "delts",
    secondaryMuscles: ["trapezius", "rhomboids", "biceps"],
    instructionsPl:
      "Stań na taśmie, pochyl się do przodu. Przyciągnij uchwyty ku tułowiowi z łokciami na zewnątrz, ściskając tylne barki.",
    imageFile: "images/1022-tc5dYrf.jpg",
    gifFile: "videos/1022-tc5dYrf.gif",
  },
  {
    id: "0979",
    name: "Pallof press (stabilizacja rdzenia)",
    bodyPart: "shoulders",
    category: "shoulders",
    target: "Brzuch i barki",
    equipment: "Taśma oporowa",
    muscleGroup: "obliques",
    secondaryMuscles: ["obliques", "glutes"],
    instructionsPl:
      "Przymocuj taśmę na wysokości talii. Stań prostopadle do punktu zaczepienia i wypychaj dłonie przed siebie, opierając się rotacji tułowia.",
    imageFile: "images/0979-9pa4H5m.jpg",
    gifFile: "videos/0979-9pa4H5m.gif",
  },

  // ── BRZUCH ────────────────────────────────────────────────────────────────
  {
    id: "0001",
    name: "Brzuszki 3/4 (Sit-up)",
    bodyPart: "waist",
    category: "waist",
    target: "Mięśnie proste brzucha",
    equipment: "Masa własnego ciała",
    muscleGroup: "abs",
    secondaryMuscles: ["hip flexors", "lower back"],
    instructionsPl:
      "Połóż się płasko na plecach, ugnij kolana. Unoś tułów spinając mocno brzuch, aż znajdziesz się pod kątem 45 stopni. Nie odrywaj odcinka lędźwiowego.",
    imageFile: "images/0001-2gPfomN.jpg",
    gifFile: "videos/0001-2gPfomN.gif",
  },
  {
    id: "0002",
    name: "Skłony boczne (Side Bend)",
    bodyPart: "waist",
    category: "waist",
    target: "Mięśnie skośne brzucha",
    equipment: "Masa własnego ciała",
    muscleGroup: "abs",
    secondaryMuscles: ["obliques"],
    instructionsPl:
      "Stań prosto. Utrzymując proste plecy, pochyl tułów powoli w bok, opuszczając dłoń w kierunku kolana. Wróć i powtórz po drugiej stronie.",
    imageFile: "images/0002-Hy9D21L.jpg",
    gifFile: "videos/0002-Hy9D21L.gif",
  },
  {
    id: "0003",
    name: "Rowerek w leżeniu (Air Bike)",
    bodyPart: "waist",
    category: "waist",
    target: "Mięśnie skośne brzucha",
    equipment: "Masa własnego ciała",
    muscleGroup: "abs",
    secondaryMuscles: ["hip flexors"],
    instructionsPl:
      "Dotykaj przeciwległym łokciem do kolana w płynnym, naprzemiennym ruchu przypominającym pedałowanie.",
    imageFile: "images/0003-1ZFqTDN.jpg",
    gifFile: "videos/0003-1ZFqTDN.gif",
  },
  {
    id: "0006",
    name: "Dotykanie pięt w leżeniu",
    bodyPart: "waist",
    category: "waist",
    target: "Mięśnie skośne brzucha",
    equipment: "Masa własnego ciała",
    muscleGroup: "abs",
    secondaryMuscles: ["obliques"],
    instructionsPl:
      "Połóż się na plecach z ugiętymi kolanami. Wyciągnij ramiona na boki. Unoś barki i naprzemiennie sięgaj do prawej i lewej pięty.",
    imageFile: "images/0006-qaZVsGk.jpg",
    gifFile: "videos/0006-qaZVsGk.gif",
  },
  {
    id: "0009",
    name: "Dipy na maszynie asystującej",
    bodyPart: "waist",
    category: "waist",
    target: "Triceps i klatka",
    equipment: "Maszyna",
    muscleGroup: "triceps",
    secondaryMuscles: ["triceps", "shoulders"],
    instructionsPl:
      "Oprzyj kolana na poduszce maszyny. Chwyć uchwyty i opuść ciało uginając łokcie, następnie wypchnij się z powrotem.",
    imageFile: "images/0009-PAgTVaK.jpg",
    gifFile: "videos/0009-PAgTVaK.gif",
  },
  {
    id: "0010",
    name: "Unoszenie kolan w zwisie (wyrzut nóg)",
    bodyPart: "waist",
    category: "waist",
    target: "Mięśnie proste brzucha",
    equipment: "Drążek",
    muscleGroup: "abs",
    secondaryMuscles: ["hip flexors", "lower back"],
    instructionsPl:
      "Zwiśnij na drążku. Unoś kolana do klatki spinając brzuch, następnie gwałtownie wyprostuj nogi w dół. Powtórz ruch kontrolowanie.",
    imageFile: "images/0010-8K0w2yA.jpg",
    gifFile: "videos/0010-8K0w2yA.gif",
  },

  // ── CARDIO ────────────────────────────────────────────────────────────────
  {
    id: "1160",
    name: "Burpee",
    bodyPart: "cardio",
    category: "cardio",
    target: "Pełne ciało (cardio)",
    equipment: "Masa własnego ciała",
    muscleGroup: "quadriceps",
    secondaryMuscles: ["hamstrings", "calves", "shoulders", "chest"],
    instructionsPl:
      "Z pozycji stojącej przejdź w przysiad, wykop nogi do tyłu w pozycję pompki, wykonaj pompkę, wróć do przysiadu i wyskocz mocno w górę z klaśnięciem nad głową.",
    imageFile: "images/1160-dK9394r.jpg",
    gifFile: "videos/1160-dK9394r.gif",
  },
  {
    id: "1201",
    name: "Burpee z hantlami",
    bodyPart: "cardio",
    category: "cardio",
    target: "Pełne ciało (cardio)",
    equipment: "Hantle",
    muscleGroup: "quadriceps",
    secondaryMuscles: ["hamstrings", "calves", "shoulders", "triceps", "core"],
    instructionsPl:
      "Wykonaj burpee trzymając hantle — zamiast skoku wyciśnij hantle nad głowę. Zwiększa to zaangażowanie mięśni górnych partii.",
    imageFile: "images/1201-0JtKWum.jpg",
    gifFile: "videos/1201-0JtKWum.gif",
  },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
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
    if (!parsed.success) {
      console.warn("[useExerciseCatalog] Validation failed:", parsed.error);
    }
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
        item.equipment.toLowerCase().includes(normalizedQuery) ||
        item.muscleGroup.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery, validatedExercises]);

  /** Ćwiczenia pogrupowane po partii mięśniowej */
  const exercisesByMuscleGroup = useMemo(() => {
    const groups: Record<string, CatalogExercise[]> = {};
    filteredExercises.forEach((ex) => {
      const key = ex.bodyPart;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ex);
    });
    return groups;
  }, [filteredExercises]);

  const openPreview = useCallback((exercise: CatalogExercise) => {
    setSelectedExercise(exercise);
  }, []);

  const closePreview = useCallback(() => {
    setSelectedExercise(null);
  }, []);

  return {
    exercises: validatedExercises,
    filteredExercises,
    exercisesByMuscleGroup,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    selectedExercise,
    openPreview,
    closePreview,
  };
}

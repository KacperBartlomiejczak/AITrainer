# Wybór ćwiczenia: filtry (partie ciała, sprzęt) + podgląd „jak zrobić ćwiczenie”

## Cel

1. W oknie **„Dodaj ćwiczenie”** (pusty trening) filtrowanie listy:
   - po **partii ciała**,
   - po **sprzęcie**: maszyna, masa własna, sztanga, hantle.
   Filtry łączą się z wyszukiwarką (AND).
2. **Podgląd ćwiczenia** (animacja GIF, mięśnie, instrukcja krok po kroku po polsku):
   - z listy „Dodaj ćwiczenie” → podgląd z przyciskiem **„Dodaj do treningu”**,
   - z karty ćwiczenia w trwającym treningu (tap w nazwę / miniaturę) → podgląd, żeby sprawdzić technikę w trakcie.

## Przeczytane pliki

- `src/app/exercises.tsx`, `src/hooks/use-exercise-catalog.ts` (`matchesEquipment`, katalog 42 ćwiczeń)
- `src/components/exercises/{ExercisePreviewModal,ExerciseMediaPreview,ExercisePreviewMuscles,ExercisePreviewSteps,
  ExerciseFilterChips,ExerciseEquipmentFilterSection,ExerciseMuscleFilterSection}.tsx` + testy
- `src/schemas/exercise-catalog.schema.ts` (`EQUIPMENT_FILTER_OPTIONS`)
- `src/hooks/use-exercise-picker.ts`, `src/components/live-workout/{ExercisePickerModal,ExercisePickerItem,LiveExerciseCard}.tsx`,
  `src/lib/catalog-muscles.ts`, `src/app/workout-session.tsx`

## Stan obecny

- Ekran `/exercises` ma już filtry (kategorie + sprzęt) i `ExercisePreviewModal` – **używam ich ponownie**, nie duplikuję.
- `matchesEquipment` już rozpoznaje: hantle („Hantel/Hantle”), sztangę, masę własną (też drążek/poręcze/ławka), maszyny (też wyciąg).
- Okno „Dodaj ćwiczenie” ma tylko wyszukiwarkę; tap w ćwiczenie od razu je dodaje.

## Model danych (krok 1)

`src/schemas/exercise-picker.schema.ts`

```ts
// 7 partii jak na szkielecie/rankingu (Klatka, Plecy, Nogi, Barki, Biceps, Triceps, Brzuch) + "all"
PickerMuscleFilterSchema = z.union([z.literal("all"), RankingMuscleGroupSchema])
// Tylko sprzęt, o który prosił użytkownik
PickerEquipmentFilterSchema = ExerciseEquipmentFilterSchema.extract(["all", "machine", "bodyweight", "barbell", "dumbbell"])
ExercisePickerFiltersSchema = { muscle: PickerMuscleFilter, equipment: PickerEquipmentFilter, query: string max 60 }
PICKER_MUSCLE_OPTIONS / PICKER_EQUIPMENT_OPTIONS: { id, label, emoji }[]
```

## Logika

- `src/lib/exercise-picker-filter.ts` (czyste funkcje): `filterPickerExercises(exercises, filters)`
  - partia: mięsień **główny** ćwiczenia (przez `mapCatalogExerciseMuscles`) – np. „Triceps” pokaże pompki na poręczach tylko,
    jeśli triceps jest mięśniem głównym,
  - sprzęt: istniejące `matchesEquipment`,
  - fraza: jak dziś (bez polskich znaków).
- `use-exercise-picker.ts`: + `muscleFilter`, `equipmentFilter`, `resetFilters`, `previewExercise`, `openPreview`, `closePreview`;
  zamknięcie okna czyści filtry i frazę.
- `use-exercise-preview.ts` (karta w treningu): `catalogExerciseId` → ćwiczenie z katalogu (`safeParse` katalogu, brak → nic nie otwiera).

## UI

- **`ExercisePickerModal`:** pod wyszukiwarką dwa poziome rzędy chipów – partia (7 + „Wszystkie”), sprzęt (4 + „Wszystkie”);
  licznik wyników + „Wyczyść filtry”, gdy lista pusta.
- **`ExercisePickerItem`:** tap w wiersz → podgląd; przycisk ➕ po prawej → dodaje od razu (szybka ścieżka zostaje).
- **`ExercisePreviewModal`** (istniejący): opcjonalne `actionLabel` + `onAction` → „Dodaj do treningu”;
  bez tych propsów działa jak dziś na `/exercises` (jego testy bez zmian). Renderowany **wewnątrz** modala listy (iOS: modal na modalu).
- **`LiveExerciseCard`:** nazwa ćwiczenia + ikonka ⓘ → podgląd (bez przycisku dodawania).
- Nowy generyczny `FilterChipRow<T>` (≤ 100 linii) dla obu rzędów.

## Kroki

- [x] 1. Zod `exercise-picker.schema.ts` + testy
- [x] 2. Testy `exercise-picker-filter.ts` (każda partia, każdy sprzęt, łączenie z frazą, katalog: każde ćwiczenie w ≥1 partii) → implementacja
- [x] 3. Testy + `use-exercise-picker` (filtry, podgląd, reset przy zamknięciu), `use-exercise-preview`
- [x] 4. Testy + `FilterChipRow`, `ExercisePickerModal`, `ExercisePickerItem`, `ExercisePreviewModal` (akcja), `LiveExerciseCard` (ⓘ)
- [x] 5. Test integracyjny ekranu: filtr „Nogi” + „Sztanga” → podgląd → „Dodaj do treningu”; ⓘ na karcie otwiera podgląd
- [x] 6. `npm test`, `npx tsc --noEmit`, `npm run lint`
- [x] 7. Podsumowanie

## Pytania (z domyślną odpowiedzią)

1. **Partie w filtrze** – 7 partii jak na szkielecie (Biceps i Triceps osobno) *(domyślnie)*, czy kategorie z ekranu `/exercises` („Ramiona”, „Cardio”…)?
2. **Kettlebell i taśmy** (7 ćwiczeń) – widoczne tylko przy „Wszystkie” *(domyślnie)*, czy dodać je jako filtry?

## Odpowiedzi użytkownika

1. Partie – 7 jak na szkielecie (domyślnie). 2. Kettlebell i taśmy – tylko przy „Wszystkie” (domyślnie).

## Realizacja – uwagi

- Nowe: `lib/exercise-picker-filter.ts`, `lib/pickable-exercises.ts` (walidacja katalogu raz, wspólna dla listy i podglądu),
  `hooks/use-exercise-preview.ts`, `live-workout/{FilterChipRow,ExercisePickerFilters,ExercisePickerEmpty,LiveExerciseHeader,LiveWorkoutFinishModal}.tsx`,
  `exercises/ExercisePreviewFooter.tsx`.
- `ExercisePreviewModal`: opcjonalne `actionLabel` / `onAction`; bez nich zachowanie na `/exercises` bez zmian.
- Wiersz listy: tap = podgląd, ➕ = dodaj od razu (zmiana zachowania – testy zaktualizowane).
- Katalog ma teraz 39 ćwiczeń; wszystkie ćwiczenia na barki są z taśmą, więc „Barki” + konkretny sprzęt daje pustą listę
  z przyciskiem „Wyczyść filtry”.
- `src/app/workout-session.tsx` ma 104 linie (same propsy komponentów; logika w hookach).

# Filtry w dolnym okienku + karta postępów ćwiczenia (wykres) + zdjęcie ćwiczenia na karcie

## Cel

1. **Filtry:** w oknie „Dodaj ćwiczenie” zamiast dwóch rzędów chipów – **przycisk „Filtry”** (z licznikiem aktywnych),
   który otwiera **okienko wysuwane od dołu** z wyborem partii ciała i sprzętu.
2. **Postępy ćwiczenia:** tap w kartę ćwiczenia → okienko z:
   - **wykresem** postępów z zapisanych treningów,
   - **„Ile mogę mieć maxa”** – szacowany 1RM,
   - **„Ile najwięcej zrobiłem”** – najcięższy ciężar (kg × powt.), rekordowa seria (kg), najwięcej powtórzeń.
3. **Zdjęcie ćwiczenia na karcie** (interpretacja do potwierdzenia – pytanie 3).

## Przeczytane pliki

- `src/components/exercises/{ExerciseFilterButton,ExerciseFilterModal,ExerciseFilterFooter,ExerciseMuscleFilterSection,
  ExerciseEquipmentFilterSection,ExercisePreviewModal,ExerciseMediaPreview}.tsx`, `src/app/exercises.tsx`
- `src/components/live-workout/{ExercisePickerModal,ExercisePickerFilters,FilterChipRow,LiveExerciseCard,LiveExerciseHeader}.tsx`
- `src/hooks/{use-exercise-picker,use-exercise-preview,use-live-workout}.ts`, `src/lib/{personal-records,pickable-exercises,exercise-assets}.ts`
- `src/db/repositories/workout-session.repository.ts`, `src/db/workout-history.ts`, `src/schemas/{live-workout,exercise-picker,workout-history}.schema.ts`
- `package.json` – brak biblioteki wykresów; jest `react-native-svg` (używa go już szkielet ciała)

## 1. Filtry w dolnym okienku

- **Używam ponownie** z `/exercises`: `ExerciseFilterButton` (ikonka + licznik) i `ExerciseFilterFooter` („Wyczyść” / „Pokaż ćwiczenia (N)”).
- Nowy `ExercisePickerFilterSheet` (wygląd jak `ExerciseFilterModal`): sekcje „Partia ciała” (7 + Wszystkie) i „Sprzęt” (4 + Wszystkie)
  jako siatka przycisków. Renderowany **wewnątrz** okna „Dodaj ćwiczenie” (modal na modalu, jak podgląd).
- Wybór działa od razu (licznik wyników w stopce na żywo), „Pokaż ćwiczenia” zamyka okienko.
- Pod wyszukiwarką zostaje tylko wiersz: [🔍 szukaj] [⚙️ Filtry (2)]. Usuwam `FilterChipRow` i `ExercisePickerFilters`.
- `use-exercise-picker`: + `isFilterSheetOpen`, `openFilterSheet`, `closeFilterSheet`, `activeFilterCount`.

## 2. Postępy ćwiczenia

### Model danych (Zod – `src/schemas/exercise-progress.schema.ts`)

```ts
ProgressMetricSchema = z.enum(["one_rep_max", "best_set_volume", "max_reps"])   // przełącznik wykresu
ExerciseProgressPointSchema = {
  sessionId, completedAt: Date,
  oneRepMaxKg: number | null,        // najlepszy szacowany 1RM w tym treningu
  bestSetVolumeKg: number | null,    // najlepsza seria kg × powt.
  maxReps: int | null,               // najwięcej powtórzeń (serie 0 kg)
}
ExerciseProgressSchema = {
  catalogExerciseId,
  points: ExerciseProgressPoint[],   // od najstarszego, max 12 ostatnich treningów
  summary: {
    oneRepMaxKg: number | null,                          // „Twój max (szacowany)”
    heaviestSet: { weightKg, reps } | null,              // „Najcięższy ciężar”
    bestSetVolume: { volumeKg, weightKg, reps } | null,  // „Rekordowa seria”
    maxReps: int | null,                                 // „Najwięcej powtórzeń”
    workoutCount: int,
  },
}
```

### Logika

- Repozytorium `getExerciseProgress(catalogExerciseId)` – serie użytkownika z bazy dla ćwiczenia (bez `R` i `NU`, jak rekordy),
  grupowane per trening; liczenie w `src/lib/exercise-progress.ts` (czyste funkcje, ta sama formuła 1RM co rekordy).
- Hook `use-exercise-progress(catalogExerciseId)` – ładuje z bazy przy otwarciu okienka; błąd → komunikat „Nie udało się wczytać postępów”.
- Brak zapisanych treningów z tym ćwiczeniem → pusty stan „Zapisz trening z tym ćwiczeniem, a pokażemy Twoje postępy”.

### UI – `ExerciseProgressSheet` (okienko od dołu)

```
┌────────────────────────────────────────┐
│ [zdjęcie] Wyciskanie sztangi…      ✕   │
│ ┌──────────┐┌──────────┐┌──────────┐   │
│ │ ≈ 96,5 kg││ 85 kg × 3││  700 kg  │   │   Twój max · Najcięższy · Rekordowa seria
│ └──────────┘└──────────┘└──────────┘   │   (+ Najwięcej powt. dla masy ciała)
│ [ Max 1RM ][ Seria ][ Powt. ]           │   przełącznik metryki
│   ╭─╮      ╭──●                          │   wykres liniowy (SVG), punkty = treningi
│ ──╯ ╰──●──╯                              │   oś X: daty, ostatni punkt podpisany
│ 12.09   15.09   18.09                    │
│ [ Zobacz technikę ]                      │   → istniejący podgląd (GIF + instrukcja)
└────────────────────────────────────────┘
```

- `ProgressLineChart` – własny komponent na `react-native-svg` (bez nowej zależności), ≤ 100 linii; skalowanie w `src/lib/progress-chart.ts` (testowalne).
- `ProgressStatTile`, `ProgressMetricSwitch` – małe komponenty.

## Odpowiedzi użytkownika

- Akceptacja z domyślnymi odpowiedziami: (1) postępy z karty ćwiczenia w treningu, ⓘ = technika; (2) wykres tylko z zapisanych treningów;
  (3) zdjęcie/miniatura ćwiczenia na karcie w trwającym treningu.
- **Dodatkowo:**
  4. Odhaczona seria (checkbox) – **cały wiersz na zielono**.
  5. Wpisywanie **ciężaru w normalnej serii** (bez R/D/NU) → ten sam ciężar trafia do **wszystkich nieodhaczonych normalnych serii** tego ćwiczenia.

### 4–5. Serie – decyzje

- Czysta funkcja `applySetPatch(exercise, setId, patch)` w `src/lib/live-workout-sets.ts` (używana przez store):
  gdy zmienia się `weightKg` serii bez znacznika → ten sam `weightKg` dla pozostałych serii **bez znacznika i nieodhaczonych**;
  rozgrzewki / drop sety / nieudane i serie odhaczone zostają bez zmian. Powtórzenia się nie kopiują.
- `use-set-inputs`: pole kg odświeża się, gdy ciężar zmieni się z zewnątrz (skopiowany z innej serii), ale nie nadpisuje tekstu w trakcie pisania („62,”).
- Wiersz odhaczony: zielone tło i obramowanie, zielone pola kg/powt. i numer serii.

## Kroki

- [x] 0. Testy + `lib/live-workout-sets.ts` (kopiowanie ciężaru), store, `use-set-inputs` (synchronizacja), zielony wiersz

- [x] 1. Zod `exercise-progress.schema.ts` + testy
- [x] 2. Testy + `lib/exercise-progress.ts` (punkty per trening, podsumowanie, R/NU pominięte, masa ciała) i `lib/progress-chart.ts` (skala, 1 punkt, płaska linia)
- [x] 3. Testy + repozytorium `getExerciseProgress` + `loadExerciseProgress`
- [x] 4. Testy + hooki: `use-exercise-progress`, `use-exercise-picker` (okienko filtrów)
- [x] 5. Testy + komponenty: `ExercisePickerFilterSheet`, `ExerciseProgressSheet`, `ProgressLineChart`, `ProgressStatTile`, `ProgressMetricSwitch`, karta ćwiczenia (zdjęcie)
- [x] 6. Test integracyjny ekranu: filtry z okienka; tap w kartę → wykres i max z bazy; pusty stan przy pierwszym razie
- [x] 7. `npm test`, `npx tsc --noEmit`, `npm run lint`
- [x] 8. Podsumowanie

## Pytania

1. **Która karta otwiera postępy?**
   (A) karta ćwiczenia w trwającym treningu (tap w nazwę/zdjęcie), ⓘ dalej pokazuje technikę *(domyślnie)*,
   (B) dodatkowo ćwiczenie na liście „Dodaj ćwiczenie” (podgląd pokaże technikę **i** postępy).
2. **Dzisiejsze serie na wykresie** – tylko zapisane treningi *(domyślnie)*, czy dorysować też „Dziś” z odhaczonych serii (przed zapisem)?
3. **„Zdjęcie na karcie”** – co masz na myśli?
   (A) po dodaniu ćwiczenia do treningu karta pokazuje **zdjęcie/animację ćwiczenia** (jak wygląda ruch) *(domyślnie)*,
   (B) po zapisaniu treningu **Twoje zdjęcie z treningu** widoczne na karcie treningu (np. w historii / na liście),
   (C) oba.

## Realizacja – uwagi

- `FilterChipRow` został (przełącznik metryki wykresu); usunięty `ExercisePickerFilters`. Nowe: `FilterOptionGrid`,
  `ExercisePickerFilterSheet`, `ExercisePickerSearchRow`, `ExerciseProgressSheet`, `ExerciseProgressBody`,
  `ExerciseProgressSummaryTiles`, `ProgressStatTile`, `ProgressLineChart`, `LiveWorkoutOverlays` (modale ekranu → ekran ma 83 linie).
- `formatEstimatedKg` (≈, zaokrąglenie 0,5 kg) wspólne dla profilu i okienka postępów.
- Karta w treningu: miniatura + nazwa → postępy; ⓘ → technika; w okienku postępów „Zobacz technikę” (modal w modalu).
- Po zamknięciu okienka postępów dane są czyszczone – kolejne otwarcie wczytuje świeże wyniki z bazy.
- Po jednym treningu „Najcięższy” i „Rekordowa seria” mogą pokazywać tę samą serię (np. 70 kg × 5).

# Plan Naprawczy na Podstawie Code Review: Ranking, Profil Użytkownika i Onboarding

## Przeczytane Pliki (Research)
- `AGENTS.md` — Wytyczne projektowe: TDD, reguła <100 linii na komponent, hooki w `./src/hooks`, Zod jako źródło prawdy, brak `any`, zakaz modyfikacji istniejących niepowiązanych testów, weryfikacja `npm test`, `npx tsc --noEmit`, `npm run lint`.
- `src/components/ranking/RankingLeaderboard.tsx` — Filtry ligowe w tabeli liderów (`FILTER_OPTIONS`).
- `src/components/user-profile/MonthlyIntensityChart.tsx` — Wykres intensywności z niewspieranym NativeWind `bg-gradient-to-r`.
- `src/components/user-profile/RoutinePhotoCarousel.tsx` — Karuzela zdjęć z niewspieranym NativeWind `bg-gradient-to-t`.
- `src/components/user-profile/PastWorkoutModal.tsx` — Przycisk zamykania modalu bez atrybutów dostępności (`accessibilityRole`, `accessibilityLabel`).
- `src/components/user-profile/WorkoutCoverSlide.tsx` — Formatowanie tonażu bez podania locale `"pl-PL"`.
- `src/hooks/use-ranking-screen.ts` — Konstrukcja `topRecordSummary` używająca błędnej ligi oraz brak sortowania tabeli liderów po przeliczeniu wyniku użytkownika.
- `src/schemas/ranking.schema.ts` — Reguła walidacji 7 unikalnych partii mięśniowych w `RankingScreenDataSchema` oraz błąd `dominantLeagueId` przy 6 brązowych i 1 srebrnym mięśniu.
- `src/schemas/user-profile-screen.schema.ts` — Ograniczenie `daysPerWeek` do maksymalnie 7 dni.
- `src/stores/onboarding.store.ts` & `src/db/bootstrap.ts` & `src/lib/onboarding-redirect.ts` — Weryfikacja mechanizmu hydratacji i trwałości onboardingu.
- `prompts/user-profile-workout-photos-and-routines-scroll.md` — Wymagania zaokrągleń w karuzeli zdjęć.

---

## Weryfikacja Zgłoszeń z Review

1. **`RankingLeaderboard.tsx`**:
   - **Status**: Do poprawy. Dodanie `titan` ("Tytan ⚡") i `bronze` ("Brąz 🥉") do `FILTER_OPTIONS`, zachowując pozostałe opcje.
2. **`MonthlyIntensityChart.tsx` & `RoutinePhotoCarousel.tsx`**:
   - **Status**: Do poprawy. Zastąpienie gradientów NativeWind natywnie wspieranym tłem (`bg-[#007AFF]` dla paska postępu oraz `bg-black/60` dla nakładki na zdjęcia).
3. **`PastWorkoutModal.tsx`**:
   - **Status**: Do poprawy. Dodanie `accessibilityRole="button"` oraz `accessibilityLabel="Zamknij podgląd treningu"`.
4. **`WorkoutCoverSlide.tsx`**:
   - **Status**: Do poprawy. Zmiana na `workout.totalVolumeKg.toLocaleString("pl-PL")`.
5. **`use-ranking-screen.ts`**:
   - **Status**: Do poprawy. Obliczenie ligi klatki piersiowej za pomocą `calculateMuscleLeague("chest", muscleRecords.chest)` dla `topRecordSummary` oraz sortowanie malejące po `totalScore` i ponowne przydzielenie `rank`.
6. **`ranking.schema.ts`**:
   - **Status**: Do poprawy.
     a) Dodanie walidacji unikalności 7 partii w `RankingScreenDataSchema` (`Set(items.map(i => i.muscle)).size === 7`).
     b) Inicjalizacja `dominantLeagueId: StrengthLeagueId | null = null`, aby dominacja brązu (np. 6 brązowych, 1 srebrny) nie odpalała błędnie fallbacku nadpisującego brąz na srebro.
     c) Dodanie testu regresyjnego.
7. **`user-profile-screen.schema.ts`**:
   - **Status**: Do poprawy. Dodanie `.max(7)` do `daysPerWeek` w `RoutinePhotoItemSchema` i `UserRoutineCardSchema`.
8. **`onboarding.store.ts`**:
   - **Status**: POMINIĘTE (już poprawnie zaimplementowane). Store posiada stan `isHydrated`, hydratacja odbywa się synchronicznie z bazy SQLite przez `bootstrapOnboardingPersistence` w `useDatabaseBootstrap`, a `resolveOnboardingRedirect` zwraca `null` dopóki `isHydrated` nie osiągnie `true`.
9. **`prompts/user-profile-workout-photos-and-routines-scroll.md`**:
   - **Status**: Do poprawy. Zaktualizowanie opisu na karty zaokrąglone (`rounded-2xl`).

---

## Kroki Implementacji (TDD)

1. **Krok 1: Testy dla schematów Zod**
   - Dodanie testów regresyjnych w `src/schemas/__tests__/ranking.schema.test.ts` (6 brąz vs 1 srebro -> brąz, duplikaty partii mięśniowych odrzucane).
   - Dodanie testów w `src/schemas/__tests__/user-profile-screen.schema.test.ts` (wartości `daysPerWeek` > 7 odrzucane).
2. **Krok 2: Poprawki schematów i logiki dziedzinowej**
   - `src/schemas/ranking.schema.ts`: `dominantLeagueId` z `null` i fallback `if (!dominantLeagueId)`, unikalność w `RankingScreenDataSchema`.
   - `src/schemas/user-profile-screen.schema.ts`: `.max(7)` w `daysPerWeek`.
3. **Krok 3: Testy dla hooka `useRankingScreen` i komponentów UI**
   - `src/hooks/__tests__/use-ranking-screen.test.ts`: weryfikacja poprawnego sortowania `leaderboard` i spójności `topRecordSummary`.
   - `src/components/ranking/__tests__/ranking-components.test.tsx`: test opcji filtra `titan` i `bronze`.
   - `src/components/user-profile/__tests__/user-profile-components.test.tsx`: test atrybutów dostępności w `PastWorkoutModal`.
4. **Krok 4: Implementacja zmian w hooku i komponentach**
   - `src/hooks/use-ranking-screen.ts`: sortowanie `leaderboard` po `totalScore`, liga klatki w `topRecordSummary`.
   - `src/components/ranking/RankingLeaderboard.tsx`: filtry `titan` i `bronze`.
   - `src/components/user-profile/MonthlyIntensityChart.tsx` & `RoutinePhotoCarousel.tsx`: usunięcie `bg-gradient-*`.
   - `src/components/user-profile/PastWorkoutModal.tsx`: dostępność przycisku zamknięcia.
   - `src/components/user-profile/WorkoutCoverSlide.tsx`: formatowanie `"pl-PL"`.
   - `prompts/user-profile-workout-photos-and-routines-scroll.md`: aktualizacja opisu.
5. **Krok 5: Weryfikacja końcowa**
   - `npm test` — wszystkie zestawy testów muszą przejść.
   - `npx tsc --noEmit` — brak błędów typowania.
   - `npm run lint` — brak błędów lintera.

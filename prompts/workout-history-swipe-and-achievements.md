# Karty Poprzednich Treningów: Przewijanie Ćwiczeń, Osiągnięć i Obsługa Braku Zdjęcia

## Przeczytane pliki (Research)
- `AGENTS.md` — Wytyczne projektowe: TDD, reguła <100 linii na komponent, hooki w `./src/hooks`, Zod jako jedyne źródło prawdy, brak `any`, weryfikacja `npm test`, `npx tsc --noEmit`, `npm run lint`.
- `src/schemas/user-profile-screen.schema.ts` — Schematy danych profilu i ostatnich treningów.
- `src/hooks/use-user-profile-screen.ts` — Hook z danymi ostatnich treningów.
- `src/components/user-profile/RecentCompletedWorkouts.tsx` — Komponent listy ostatnich treningów.
- `src/components/user-profile/ExerciseLogItem.tsx` — Mikrokomponent wiersza ćwiczenia.

---

## Nowe Wymagania Użytkownika

1. **Wyświetlanie wszystkich treningów**:
   - Rozszerzenie historii treningów o pełny zestaw wykonanych sesji treningowych (z datami, czasem, tonażem).
2. **Karty przewijane w lewo (slajdy poziome)**:
   - **Slajd 1 (gdy jest zdjęcie)**: Zdjęcie z treningu, tytuł, data, czas i tonaż.
   - **Slajd 2 (po przesunięciu w lewo)**: "Ile i jakie rzeczy zrobił" — szczegółowy wykaz wykonanych ćwiczeń (co, ile serii, ile powtórzeń, jaki ciężar).
   - **Slajd 3 (po kolejnym przesunięciu w lewo)**: "Jakie osiągnięcia zdobył" — lista zdobytych osiągnięć (pobite rekordy PR, osiągnięty tonaż, awans w lidze siłowej, seria treningowa).
3. **Obsługa treningu bez zdjęcia**:
   - Jeśli trening nie posiada zdjęcia (`!imageAssetKey`), jako **pierwszy** wyświetla się slajd: "ile razy co zrobił i co" (wykaz ćwiczeń i serii), a po przesunięciu w lewo — zdobyte osiągnięcia.

---

## Architektura i Podział Komponentów (< 100 linii per plik)

### 1. Rozszerzenie Schematu Zod (`src/schemas/user-profile-screen.schema.ts`)
- `CompletedWorkoutAchievementSchema`: id, title, description, icon, badgeColor.
- `CompletedWorkoutDetailSchema`: dodanie opcjonalności `imageAssetKey` (`z.string().optional().or(z.literal(""))`) oraz tablicy `achievements: z.array(CompletedWorkoutAchievementSchema)`.

### 2. Rozszerzenie Danych w Hooku (`src/hooks/use-user-profile-screen.ts`)
- Dodanie większej liczby treningów do `DEFAULT_RECENT_WORKOUTS` (w tym treningu bez zdjęcia `imageAssetKey: ""` dla weryfikacji warunku).
- Wzbogacenie każdego treningu o tablicę `achievements`.

### 3. Modułowe Komponenty UI w `src/components/user-profile/`
- `WorkoutAchievementsSlide.tsx` (~60 linii) — slajd prezentujący osiągnięcia zdobyte na danym treningu (PR, trofea, tonaż).
- `WorkoutExercisesSlide.tsx` (~65 linii) — slajd prezentujący "co i ile razy zrobił" z ćwiczeniami, liczbą serii i wagami.
- `WorkoutHistoryCard.tsx` (~85 linii) — pojedyncza karta treningu z poziomym `ScrollView` (`pagingEnabled` lub `horizontal`), wskaźnikiem slajdów (`1/3`, `2/3`, `3/3` lub `1/2`, `2/2`), obsługująca wariant ze zdjęciem oraz wariant bez zdjęcia.
- `RecentCompletedWorkouts.tsx` (~60 linii) — kontener renderujący nagłówek i listę kart `WorkoutHistoryCard`.
- `index.ts` — Barrel export.

---

## Plan Implementacji Krok po Kroku (TDD)

1. **Krok 1: Aktualizacja schematu Zod i testów schematu**
   - `src/schemas/user-profile-screen.schema.ts`
   - `src/schemas/__tests__/user-profile-screen.schema.test.ts`
2. **Krok 2: Testy i aktualizacja hooka `use-user-profile-screen.ts`**
   - `src/hooks/__tests__/use-user-profile-screen.test.ts`
   - `src/hooks/use-user-profile-screen.ts`
3. **Krok 3: Testy komponentów UI (`src/components/user-profile/__tests__/user-profile-components.test.tsx`)**
4. **Krok 4: Implementacja komponentów:**
   - `WorkoutAchievementsSlide.tsx`
   - `WorkoutExercisesSlide.tsx`
   - `WorkoutHistoryCard.tsx`
   - `RecentCompletedWorkouts.tsx`
5. **Krok 5: Weryfikacja końcowa:**
   - `npm test`
   - `npx tsc --noEmit`
   - `npm run lint`

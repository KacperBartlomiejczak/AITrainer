# Plan: Naprawa problemów PR #4 (Critical i Moderate)

## Pliki które przeczytałem

- `AGENTS.md` — reguły architektoniczne projektu (TDD, Zod schema first, <100 linii, Zustand dla aktywnego treningu, zero any, npm test)
- `package.json` — deklaracje zależności projektu (brak react-native-svg)
- `src/hooks/use-routines.ts` — routing startRoutine(`/workout/${routineId}`)
- `src/app/workouts.tsx` — ekran treningów z listą rutyn
- `src/components/navigation/PillNavItem.tsx` — ikony z lucide-react-native
- `src/schemas/exercise-catalog.schema.ts` — model ćwiczeń
- `src/components/exercises/ExerciseCard.tsx` — rozmiary miniatur (w-18, h-18)
- `src/components/exercises/ExerciseSearchBar.tsx` — przycisk czyszczenia wyszukiwania
- `src/components/exercises/ExercisePreviewModal.tsx` — modal z GIF i instrukcjami
- `src/hooks/use-public-profile.ts` — odczyt danych profilu z AsyncStorage
- `src/__mocks__/jest.setup.js` — konfiguracja mocków w testach

## Plan implementacji

### Krok 1: Instalacja `react-native-svg` (Critical #2)
- Zainstalować `react-native-svg@~15.15.4` zgodnie z Expo SDK 57 poprzez `npx expo install react-native-svg`.
- Zaktualizować `package.json` i lockfile.

### Krok 2: Data Model sesji treningu (Zod First)
- Utworzyć `src/schemas/workout-session.schema.ts` z walidacją dla:
  - Szczegółów rutyny treningowej (`RoutineDetail`)
  - Pojedynczego ćwiczenia w treningu (`WorkoutExercise`: nazwa, serie, powtórzenia, ciężar)
  - Stanu aktywnej sesji treningowej
- Utworzyć testy schematu: `src/schemas/__tests__/workout-session.schema.test.ts`.

### Krok 3: Testy jednostkowe dla ekranu treningu i hooka (TDD)
- Utworzyć `src/hooks/__tests__/use-workout-detail.test.ts`
- Utworzyć `src/app/__tests__/workout.test.tsx`

### Krok 4: Hook i komponenty widoku treningu (`<100 linii`)
- Hook `src/hooks/use-workout-detail.ts`
- Komponenty w `src/components/workout/`:
  - `WorkoutDetailHeader.tsx` (nagłówek z przyciskiem powrotu do `/workouts`)
  - `WorkoutExerciseItem.tsx` (karta ćwiczenia z seriami i powtórzeniami)
  - `WorkoutExercisesList.tsx` (lista ćwiczeń)
  - `WorkoutStartButton.tsx` (przycisk startu/pauzy/zakończenia)
  - `index.ts` (eksporty)
- Ekran trasy: `src/app/workout/[id].tsx`

### Krok 5: Poprawki jakościowe zgłoszone w PR
- `src/__mocks__/jest.setup.js`: czyszczenie mocków w `beforeEach`.
- `src/components/exercises/ExerciseCard.tsx`: zamiana `w-18 h-18` na `w-[72px] h-[72px]`.
- `src/components/exercises/ExerciseSearchBar.tsx`: `accessibilityRole="button"`, `accessibilityLabel="Wyczyść wyszukiwanie"`.
- `src/components/exercises/ExercisePreviewModal.tsx`: `accessibilityLabel="Zamknij podgląd"`, obsługa `instructionStepsPl`.
- `src/schemas/exercise-catalog.schema.ts`: kompatybilność wsteczna dla istniejących testów + obsługa `instructionStepsPl`.
- `src/hooks/use-public-profile.ts`: walidacja `OnboardingFormSchema.safeParse`.
- `src/app/exercises.tsx`: `accessibilityLabel="Wróć do treningów"`, powrót jawny do `/workouts`, zachowanie tytułu „Baza Ćwiczeń”.

### Krok 6: Weryfikacja
- `npm test`
- `npx tsc --noEmit`
- `npm run lint`

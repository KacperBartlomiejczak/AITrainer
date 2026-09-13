# Plan: Warunkowe wyświetlanie Splash Screen i obsługa stanu Onboardingu w RAM z Zustand

## Przeczytane pliki (Read Files)
1. `AGENTS.md` - zasady projektu (TDD, Zod, zakaz `any`, in-memory stan, checklisty w prompts).
2. `src/app/_layout.tsx` - główny layout aplikacji z `useLayoutEffect`, problematyczną zależnością `currentSegments` i nakładką splash.
3. `src/stores/onboarding.store.ts` - store Zustand z persystencją AsyncStorage.
4. `src/stores/onboarding-form.store.ts` - store Zustand dla formularza onboardingu (w pamięci RAM).
5. `src/hooks/use-onboarding.ts` - hook onboardingu.
6. `src/hooks/use-splash-screen.ts` - hook ekranu powitalnego.
7. `src/app/splash.tsx` - komponent ekranu powitalnego.
8. `src/app/__tests__/layout.test.tsx` - testy jednostkowe layoutu.
9. `src/app/__tests__/onboarding.test.tsx` - testy jednostkowe ekranów onboardingu.
10. `prompts/exercise-view-mode-accessibility.md` - wzór formatowania zadań checklisty `[ ]` / `[x]`.

---

## Analiza problemu i wytyczne użytkownika
- **Problem**: `Maximum update depth exceeded` podczas wejścia w onboarding. Wynikał z synchronicznego wywoływania `router.replace` wewnątrz `useLayoutEffect` w `_layout.tsx`, gdzie zależność `currentSegments` była nową referencją tablicy przy każdym renderze, co zapętlało aktualizacje routera i Reacta.
- **Wytyczne użytkownika**:
  1. Zmiana splash screen / image na **warunkowe wyświetlanie** (`showSplash && ...`).
  2. Użycie Zustand **w pamięci RAM** (in-memory) – na razie jednorazowo w RAM, bez persystencji w AsyncStorage / bazie danych.

---

## Plan implementacji

### Krok 1: Modyfikacja `src/stores/onboarding.store.ts` na store in-memory (RAM)
- [x] Usunięcie middleware `persist` i `AsyncStorage` z `src/stores/onboarding.store.ts`.
- [x] Przechowywanie stanu wyłącznie w pamięci RAM (`hasCompletedOnboarding`, `onboardingData`, `isHydrated: true`).
- [x] Zachowanie pełnej zgodności API metod (`completeOnboarding`, `updateProfile`, `resetOnboarding`, `setHydrated`).

### Krok 2: Naprawa `src/app/_layout.tsx` – warunkowe wyświetlanie Splash i eliminacja pętli
- [x] Zamiana `useLayoutEffect` na bezpieczny `useEffect`.
- [x] Usunięcie nowo tworzonej tablicy `currentSegments` z listy zależności hooka (użycie stabilnego prymitywu `segmentsKey`).
- [x] Zapewnienie, że gdy użytkownik jest w trasie onboardingu (`inOnboarding === true`), efekt nie wywołuje żadnych przekierowań.
- [x] Warunkowe renderowanie `SplashScreen`: `{showSplash && !onSplash && <SplashScreen ... />}`.
- [x] Prawidłowe zamykanie splasha przez `handleSplashFinish` (`setShowSplash(false)`).

### Krok 3: Oczyszczenie `src/hooks/use-splash-screen.ts`
- [x] Zapewnienie, że hook `useSplashScreen` nie wykonuje dublujących przekierowań, gdy przekazano callback `onFinish`.
- [x] Płynne zakończenie animacji i bezpieczne wywołanie `onFinish()`.

### Krok 4: Weryfikacja testów jednostkowych (TDD)
- [x] Uruchomienie `npm test` i upewnienie się, że wszystkie 44 suity testowe (w tym `layout.test.tsx`, `splash.test.tsx`, `onboarding.test.tsx`) przechodzą pomyślnie.
- [x] Sprawdzenie poprawności typów (`npx tsc --noEmit`).
- [x] Sprawdzenie lintera (`npm run lint`).
- [x] Oznaczenie wszystkich zadań checklisty jako ukończone `[x]`.


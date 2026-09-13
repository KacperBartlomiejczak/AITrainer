# Plan: Integracja `react-native-body-highlighter` & Podział na Biceps (przód) i Triceps (tył)

## Pliki, które przeczytałem

- `node_modules/react-native-body-highlighter/dist/index.d.ts` & `dist/index.js` — API biblioteki `react-native-body-highlighter` (`Body`, `Slug`, `ExtendedBodyPart`, `onBodyPartPress`, `side="front" | "back"`).
- `src/schemas/ranking.schema.ts` — definicja standardów siłowych, partii i kalkulatorów lig.
- `src/hooks/use-ranking-screen.ts` — hook zarządzający stanem widoku, partii mięśniowych i rekordów.
- `src/components/ranking/HumanBodyDiagram.tsx` — komponent prezentujący sylwetkę człowieka (do podmiany na `Body` z `react-native-body-highlighter`).
- `src/components/ranking/MuscleSelectorPills.tsx` & `MuscleRankCard.tsx` — selektor i karta szczegółów partii.
- `src/app/ranking.tsx` — główny ekran rankingu.

---

## Co chce użytkownik

1. Zainstalować i użyć biblioteki `react-native-body-highlighter` jako szkieletu / modelu sylwetki do systemu rang.
2. Zamiast ogólnej partii "ramiona":
   - **Biceps** z przodu (`slug: "biceps"`, ćwiczenie: Uginanie ramion ze sztangą).
   - **Triceps** z tyłu (`slug: "triceps"`, ćwiczenie: Wyciskanie francuskie / Dipsy).
3. Pozostałe partie: `chest`, `back`, `legs`, `shoulders`, `abs`.

---

## Plan Implementacji

### Krok 1: Aktualizacja Modelu Danych (`src/schemas/ranking.schema.ts`) [x]
- [x] Wprowadzenie `RankingMuscleGroupSchema` (`chest`, `back`, `legs`, `shoulders`, `biceps`, `triceps`, `abs`)
- [x] Zdefiniowanie standardów siłowych dla `biceps` i `triceps`
- [x] Funkcja `mapSlugToRankingMuscle` mapująca slugi z `react-native-body-highlighter`

### Krok 2: Testy jednostkowe dla Schematów (TDD) [x]
- [x] Testy `src/schemas/__tests__/ranking.schema.test.ts` (10/10 testów zaliczonych)

### Krok 3: Aktualizacja Hooka `useRankingScreen` [x]
- [x] Aktualizacja `INITIAL_MUSCLE_RECORDS` o `biceps: 35` i `triceps: 45`
- [x] Wsparcie dla 7 partii mięśniowych w `muscleRanks`
- [x] Automatyczne przełączanie perspektywy (`front` dla bicepsa, `back` dla tricepsa/pleców)
- [x] Testy `src/hooks/__tests__/use-ranking-screen.test.ts` (7/7 testów zaliczonych)

### Krok 4: Nowy `HumanBodyDiagram.tsx` z `react-native-body-highlighter` [x]
- [x] Zastosowanie `<Body />` z `react-native-body-highlighter`
- [x] Mapowanie partii na `ExtendedBodyPart[]` z dynamicznymi kolorami lig
- [x] Wyróżnienie aktywnej partii obrysem `#FFFFFF` i `strokeWidth: 2.5`
- [x] Obsługa kliknięcia `onBodyPartPress`
- [x] Przełącznik Przód (front: biceps) / Tył (back: triceps/plecy)

### Krok 5: Aktualizacja pozostałych komponentów i testów [x]
- [x] `MuscleRankCard.tsx` & `MuscleSelectorPills.tsx`
- [x] Testy komponentów `src/components/ranking/__tests__/ranking-components.test.tsx` (6/6 testów zaliczonych)
- [x] Testy ekranu `src/app/__tests__/ranking.test.tsx` (3/3 testów zaliczonych)

### Krok 6: Weryfikacja [x]
- [x] `npm test` — 44/44 suitów, 264/264 testów zaliczonych
- [x] `npx tsc --noEmit` — 0 błędów
- [x] `npm run lint` — 0 błędów, 0 ostrzeżeń

---

## Wynik
Pomyślnie zintegrowano bibliotekę `react-native-body-highlighter`, rozdzielono ramiona na Biceps (przód) oraz Triceps (tył) i zweryfikowano poprawność całości testami.

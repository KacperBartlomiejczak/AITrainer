# Plan: Dostępność selektora trybu widoku w Bazy Ćwiczeń (Grid / List Accessibility)

## Pliki, które przeczytałem

- `AGENTS.md` — reguły architektoniczne projektu (TDD, Zod-first, <100 linii na komponent, zero any, npm test, npx tsc, expo lint).
- `src/app/exercises.tsx` — ekran Bazy Ćwiczeń zawierający przełącznik trybu widoku `viewMode` ("grid" / "list") w liniach 94–115.
- `src/app/__tests__/exercises.test.tsx` — testy jednostkowe ekranu Bazy Ćwiczeń.
- `src/components/navigation/PillNavItem.tsx` — wzorzec semantyki dostępności (`accessibilityRole="button"`, `accessibilityState={{ selected }}`, `accessibilityLabel`).

---

## Weryfikacja zgłoszenia (Untrusted Review Data)

- **Zgłoszenie**: W `src/app/exercises.tsx` (około linii 96–97) kontrolki `Pressable` dla trybu siatki i listy nie posiadają semantyki przycisku, etykiet dostępności ani stanu zaznaczenia (`selected`).
- **Weryfikacja kodu**: Potwierdzona. W liniach 96–114 znajdują się elementy `<Pressable onPress={() => setViewMode("grid")}>` oraz `<Pressable onPress={() => setViewMode("list")}>`. Żaden z nich nie ma zdefiniowanych właściwości:
  - `accessibilityRole="button"`
  - `accessibilityLabel`
  - `accessibilityState={{ selected: ... }}`
  - `testID`

Problem jest w 100% aktualny i wymaga naprawy zgodnie z wytycznymi WCAG / React Native Accessibility.

---

## Plan implementacji

### Krok 1: Dodanie testów weryfikujących dostępność i przełączanie trybu widoku (TDD) [x]
- [x] W pliku `src/app/__tests__/exercises.test.tsx` dodać test jednostkowy sprawdzający:
  - [x] obecność przycisków widoku siatki i listy z rolą `button`,
  - [x] etykiety dostępności `Widok siatki` oraz `Widok listy`,
  - [x] początkowy stan: `selected: true` dla siatki, `selected: false` dla listy,
  - [x] po kliknięciu przycisku listy: zmiana stanu `selected: true` dla listy, `selected: false` dla siatki.

### Krok 2: Modyfikacja `src/app/exercises.tsx` [x]
- [x] Dodać do kontrolki siatki:
  - [x] `testID="view-mode-grid-button"`
  - [x] `accessibilityRole="button"`
  - [x] `accessibilityLabel="Widok siatki"`
  - [x] `accessibilityState={{ selected: viewMode === "grid" }}`
- [x] Dodać do kontrolki listy:
  - [x] `testID="view-mode-list-button"`
  - [x] `accessibilityRole="button"`
  - [x] `accessibilityLabel="Widok listy"`
  - [x] `accessibilityState={{ selected: viewMode === "list" }}`

### Krok 3: Weryfikacja [x]
- [x] Uruchomienie `npm test` i weryfikacja przejścia wszystkich testów.
- [x] Sprawdzenie poprawności typów (`npx tsc --noEmit`).
- [x] Sprawdzenie lintera (`npm run lint`).


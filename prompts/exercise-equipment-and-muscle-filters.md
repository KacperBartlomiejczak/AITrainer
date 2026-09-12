# Filtry Ćwiczeń: Grupy Mięśniowe i Sprzęt (Hantle, Sztanga, Masa Własna) — Feature Prompt

## Przeczytane pliki (Research)

1. `AGENTS.md` — Wytyczne projektowe:
   - Kolejność prac: 1) Zod schema + inferowany typ, 2) testy jednostkowe, 3) implementacja komponentów i widoków.
   - Zero typów `any` (wyłącznie `unknown` + Zod).
   - Rozbijanie komponentów powyżej ~100 linii na mniejsze moduły.
   - Separacja logiki od UI do dedykowanych custom hooks w `./src/hooks`.
   - Stan lokalny formularzy i modali w `useState` (Zustand tylko dla stanu globalnego/sesji).
   - `npm test`, `npx tsc --noEmit`, `npm run lint` bez błędów na zakończenie prac.
2. `src/schemas/exercise-catalog.schema.ts` — Istniejące schematy Zod: `ExerciseCategoryFilterSchema`, `CatalogExerciseSchema`, `ExerciseCatalogListSchema`.
3. `src/schemas/__tests__/exercise-catalog.schema.test.ts` — Testy schematów katalogu ćwiczeń.
4. `src/hooks/use-exercise-catalog.ts` — Hook zarządzający katalogiem 42 ćwiczeń, filtrowaniem partii (`categoryFilter`), wyszukiwarką (`searchQuery`) oraz podglądem (`selectedExercise`).
5. `src/hooks/__tests__/use-exercise-catalog.test.ts` — Testy hooka `useExerciseCatalog`.
6. `src/app/exercises.tsx` — Ekran Bazy Ćwiczeń z nagłówkiem, przełącznikiem siatka/lista, wyszukiwarką i sekcjami partii mięśniowych.
7. `src/app/__tests__/exercises.test.tsx` — Testy integracyjne ekranu ćwiczeń.
8. `src/components/exercises/` — Istniejący zestaw komponentów:
   - `ExerciseSearchBar.tsx`
   - `ExerciseFilterChips.tsx`
   - `ExerciseCard.tsx`
   - `ExerciseGridCard.tsx`
   - `ExerciseMuscleGroupSection.tsx`
   - `ExercisePreviewModal.tsx`
   - `index.ts`
9. `src/components/exercises/__tests__/exercises-components.test.tsx` & `exercise-grid-components.test.tsx` — Istniejące testy komponentów bazy ćwiczeń.

---

## Cel Zadania i Wymagania Użytkownika

Użytkownik chce:
1. Dodać do ekranu bazy ćwiczeń (`exercises.tsx`) filtry pozwalające wybrać:
   - **Grupę mięśniową** (np. Klatka, Plecy, Nogi, Ramiona, Barki, Brzuch, Cardio).
   - **Sprzęt treningowy**, w szczególności: **hantle**, **sztanga**, **własny ciężar** (oraz maszyny/wyciągi i taśmy oporowe).
2. Otwieranie filtrów za pomocą **przycisku**, który wysuwa **dialog z dolnej części ekranu (Bottom Sheet Modal)**.
3. W dialogu użytkownik może wygodnie zaznaczyć grupę mięśniową oraz na czym chce ćwiczyć, zresetować filtry lub zatwierdzić wybór.
4. Wyniki ćwiczeń na ekranie natychmiast uwzględniają wybrane kryteria (np. tylko ćwiczenia na klatkę z hantlami).
5. Przycisk filtrów na ekranie powinien informować o liczbie aktywnych filtrów (wskaźnik/badge).

---

## Architektura i Podział Modułów (< 100 linii per plik)

### 1. Zod Schemas & Typy (`src/schemas/exercise-catalog.schema.ts`)
- `ExerciseEquipmentFilterSchema`:
  - Wartości: `"all"`, `"dumbbell"` (hantle), `"barbell"` (sztanga), `"bodyweight"` (własny ciężar), `"machine"` (maszyny i wyciągi), `"band"` (taśmy).
- `ExerciseEquipmentFilter` (typ inferowany z Zod).
- `ExerciseFilterStateSchema` & `ExerciseFilterState`:
  - `{ category: ExerciseCategoryFilter, equipment: ExerciseEquipmentFilter, searchQuery: string }`.
- Stałe metadanych sprzętu (`EQUIPMENT_FILTER_META`) z polskimi etykietami i emoji:
  - `all`: "Wszystkie sprzęty" (🏋️)
  - `dumbbell`: "Hantle" (🔩)
  - `barbell`: "Sztanga" (🏋️‍♂️)
  - `bodyweight`: "Własny ciężar" (🤸)
  - `machine`: "Maszyny i wyciągi" (⚙️)
  - `band`: "Taśmy oporowe" (🎗️)

### 2. Custom Hook (`src/hooks/use-exercise-catalog.ts`)
- Dodanie stanu:
  - `equipmentFilter`: `ExerciseEquipmentFilter` (domyślnie `"all"`).
  - `setEquipmentFilter(filter: ExerciseEquipmentFilter): void`.
  - `resetFilters(): void` (resetuje `categoryFilter` i `equipmentFilter` do `"all"`).
  - `activeFilterCount`: liczba aktywnych filtrów (`categoryFilter !== "all"` + `equipmentFilter !== "all"`).
  - `hasActiveFilters`: boolean.
- Usprawnienie predykatu filtrowania ćwiczeń:
  - Funkcja pomocnicza dopasowania sprzętu `matchesEquipment(exerciseEquipment: string, filter: ExerciseEquipmentFilter): boolean`:
    - `"dumbbell"` -> sprawdza czy `equipment` zawiera "hant"
    - `"barbell"` -> sprawdza czy `equipment` zawiera "sztang"
    - `"bodyweight"` -> sprawdza czy `equipment` zawiera "własn", "drążek", "poręcz", "ławka"
    - `"machine"` -> sprawdza czy `equipment` zawiera "maszyn", "wyciąg"
    - `"band"` -> sprawdza czy `equipment` zawiera "taśm"

### 3. Komponenty UI (`src/components/exercises/`)
- `ExerciseFilterButton.tsx` (~65 linii):
  - Przycisk z ikoną `SlidersHorizontal`, opcjonalną odznaką (badge) z liczbą aktywnych filtrów (`activeFilterCount`).
  - Umieszczony obok paska wyszukiwania w estetycznym, ciemnym stylu `#121214`.
- `ExerciseEquipmentFilterSection.tsx` (~70 linii):
  - Kafelki/chipy wyboru sprzętu w układzie flex-wrap z emoji i polskimi nazwami.
- `ExerciseMuscleFilterSection.tsx` (~70 linii):
  - Kafelki/chipy wyboru grupy mięśniowej.
- `ExerciseFilterModal.tsx` (~95 linii):
  - Wysuwany z dołu ekranu modal (`Modal animationType="slide" transparent={true}`).
  - Półprzezroczysty backdrop z możliwością dotknięcia w celu zamknięcia.
  - Nagłówek z tytułem "Filtry ćwiczeń", opisem i przyciskiem zamknięcia (X).
  - Przewijana zawartość łącząca `ExerciseMuscleFilterSection` i `ExerciseEquipmentFilterSection`.
  - Przyklejony pasek dolny z przyciskiem "Wyczyść" oraz głównym przyciskiem akcji "Pokaż wyniki (X)".
- `src/components/exercises/index.ts`:
  - Eksport nowych komponentów (`ExerciseFilterModal`, `ExerciseFilterButton`).

### 4. Ekran Bazy Ćwiczeń (`src/app/exercises.tsx`)
- Integracja przycisku filtrów w wierszu z `ExerciseSearchBar`.
- Stan widoczności modala `isFilterModalOpen`.
- Przekazanie stanu filtrów i akcji do `ExerciseFilterModal`.
- Wyświetlanie aktywnego wskaźnika filtrów.

---

## Plan Implementacji Krok po Kroku (TDD)

1. **Krok 1: Schematy Zod i Typy** ✅
   - Rozszerzenie `src/schemas/exercise-catalog.schema.ts` o `ExerciseEquipmentFilterSchema` (z kettlebellem) i `ExerciseFilterStateSchema`.
   - Napisanie testów w `src/schemas/__tests__/exercise-catalog.schema.test.ts` (zaliczony).

2. **Krok 2: Logika w Hooku i Testy** ✅
   - Dodanie testów jednostkowych w `src/hooks/__tests__/use-exercise-catalog.test.ts` dla filtrowania po hantlach, sztandze, masie własnej i kettlebell oraz resetowania.
   - Implementacja logiki `matchesEquipment` i stanu w `src/hooks/use-exercise-catalog.ts`.

3. **Krok 3: Komponenty Modala Filtrów i Testy** ✅
   - Napisanie testów w `src/components/exercises/__tests__/exercise-filter-modal.test.tsx` (zaliczony).
   - Implementacja `ExerciseFilterButton.tsx`, `ExerciseEquipmentFilterSection.tsx`, `ExerciseMuscleFilterSection.tsx`, `ExerciseFilterFooter.tsx`, `ExerciseFilterModal.tsx`.

4. **Krok 4: Integracja na ekranie `src/app/exercises.tsx`** ✅
   - Dodanie przycisku obok wyszukiwarki, chipu aktywnego sprzętu i podpięcie modala.
   - Aktualizacja testów ekranu `src/app/__tests__/exercises.test.tsx` (zaliczony).

5. **Krok 5: Weryfikacja Jakościowa** ✅
   - `npm test` — 37 test suites, 212 passed.
   - `npx tsc --noEmit` — 0 błędów typowania.
   - `npm run lint` — 0 problemów lintera.
   - Raport końcowy i instrukcja testowania.


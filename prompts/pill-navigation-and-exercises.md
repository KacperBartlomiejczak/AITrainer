# Nawigacja w Kształcie Pigułki, Rutyny i Baza Ćwiczeń — Feature Prompt

## Przeczytane pliki (Research)

- `AGENTS.md` — Wytyczne projektowe: architektura TDD, kolejność 1) Zod schema, 2) testy, 3) implementacja; zasada <100 linii per komponent; logika w hookach w `./src/hooks`; brak `any`; stan współdzielony w Zustand, lokalny w stanie komponentu; polski język dla użytkownika, angielski dla kodu i typów; `npm test`, `npx tsc --noEmit`, `npm run lint`.
- `src/app/_layout.tsx` — Główny stack nawigacyjny aplikacji (Stack z `headerShown: false`, animacja fade, splash overlay, integracja ze store onboarding).
- `src/app/index.tsx` — Ekran główny `HomeScreen` (nagłówek, porada AI, trening dnia, progres tygodniowy, quick actions, ostatnia aktywność).
- `src/app/profile.tsx` — Istniejący ekran ustawień i edycji profilu użytkownika.
- `src/stores/onboarding.store.ts` — Store Zustand z danymi profilu (`name`, `fitnessGoal`, `focusMuscleGroups`).
- `src/schemas/home.schema.ts` — Schematy danych dla ekranu domowego (w tym `QuickActionItemSchema` odwołujący się m.in. do `/exercises`).
- `src/schemas/workout.schema.ts` — Schematy podglądu ćwiczeń i treningów (`ExercisePreviewSchema`, `WorkoutSummarySchema`).
- `assets/data/exercises.json` oraz `assets/data/exercises.schema.json` — Baza ćwiczeń z wielojęzycznymi instrukcjami (w tym `pl`), kategoriami, partiami ciała i referencjami do mediów.
- `assets/images/` oraz `assets/videos/` — Zbiór miniatur `.jpg` oraz animacji gif `.gif` dla poszczególnych ćwiczeń.
- `src/components/ui/` — Istniejący design system (Button, Card, Badge, Typography, Avatar).

---

## Cel Zadania

1. **Komponent nawigacji w kształcie pigułki (Pill Navbar / Floating Bottom Navigation)**:
   - Pływająca belka nawigacyjna o kształcie pigułki (`rounded-full`), zakotwiczona nad dolną krawędzią ekranu z obsługą Safe Area Insets.
   - Nowoczesny, ciemny styl ze szklistością (glassmorphism: półprzezroczyste tło, subtelna ramka, cienie).
   - 3 opcje z dummy data i aktywnym wskaźnikiem:
     1. **Home** — powrót do głównego ekranu (`/`).
     2. **Lista ćwiczeń & rutyny** — ekran treningów i rutyn (`/workouts`) z przyciskiem przejścia do pełnej bazy ćwiczeń (`/exercises`).
     3. **Profil** — widok publiczny profilu ("jak wyświetlasz się ludziom") z nazwą użytkownika pobieraną ze store (`/user-profile`).

2. **Ekran Treningów i Rutyn (`/workouts`)**:
   - Górny baner "Baza Ćwiczeń & Atlas":
     - Przycisk CTA: **"Pokaż wszystkie ćwiczenia"** (`testID="show-all-exercises-button"`).
     - Po kliknięciu przejście do dedykowanego ekranu `/exercises`.
   - Pod spodem sekcja rutyn treningowych (np. FBW Początkujący, Push, Pull, Nogi & Core) z czasem trwania, partiami mięśniowymi i poziomem trudności.
   - Pigułka nawigacyjna na dole ekranu z aktywną zakładką "workouts".

3. **Ekran Pełnej Bazy Ćwiczeń (`/exercises`)**:
   - Ekran otwierany po kliknięciu "Pokaż wszystkie ćwiczenia".
   - Przycisk powrotu do ekranu rutyn (`←`).
   - Wyszukiwarka ćwiczeń oraz filtry partii mięśniowych (Wszystkie, Klatka, Plecy, Nogi, Ramiona, Brzuch).
   - Lista kart ćwiczeń ze zdjęciami z `assets/images` i animacjami gif z `assets/videos` oraz polskimi nazwami/instrukcjami.
   - Podgląd animacji instruktażowej w modalu / rozwinięciu karty.

4. **Ekran Profilu Użytkownika (`/user-profile`)**:
   - Prezentacja profilu ("jak wyświetlasz się ludziom"):
     - Avatar z inicjałami,
     - Imię użytkownika (zsynchronizowane z `useOnboardingStore`),
     - Odznaka poziomu / członka społeczności,
     - Przycisk przejścia do pełnej edycji i ustawień konta (`/profile`).
   - Pigułka nawigacyjna na dole ekranu z aktywną zakładką "profile".

---

## Architektura i Podział Komponentów (< 100 linii per plik)

### 1. Zod Schemas & Typy (`src/schemas/`)
- `navigation.schema.ts`:
  - `NavTabIdSchema` (`"home" | "workouts" | "profile"`)
  - `NavItemSchema`, `NavTabConfig`
- `routine.schema.ts`:
  - `RoutineLevelSchema`, `RoutineItemSchema`, `RoutineListSchema`
- `exercise-catalog.schema.ts`:
  - `ExerciseCategoryFilterSchema`, `CatalogExerciseSchema`, `ExerciseCatalogListSchema`

### 2. Custom Hooks (`src/hooks/`)
- `use-pill-navigation.ts` — zarządzanie aktywnym tabem na podstawie ścieżki (`usePathname`) oraz funkcja nawigacji `navigateToTab`.
- `use-routines.ts` — dostarczanie danych rutyn treningowych z walidacją Zod i obsługą akcji.
- `use-exercise-catalog.ts` — zarządzanie bazą ćwiczeń, filtrowaniem partii mięśniowych, wyszukiwarką tekstową oraz wybranym ćwiczeniem do podglądu.
- `use-public-profile.ts` — odczyt danych użytkownika ze store (`useOnboardingStore`) do wizytówki publicznej.

### 3. Modułowe Komponenty UI (< 100 linii każdy)
- `src/components/navigation/`:
  - `PillNavbar.tsx` (~70 linii) — kontener pigułki z bezpiecznymi marginesami (Safe Area Insets) i stylizacją dark glass.
  - `PillNavItem.tsx` (~65 linii) — pojedynczy przycisk zakładek z ikoną, etykietą, wskaźnikiem aktywności i dostępnością.
  - `index.ts` — barrel export.
- `src/components/workouts/`:
  - `ExercisesHeroBanner.tsx` (~60 linii) — wyróżniony baner z przyciskiem "Pokaż wszystkie ćwiczenia".
  - `RoutineCard.tsx` (~75 linii) — karta rutyny z tagami partii mięśniowych, czasem i poziomem.
  - `RoutineListSection.tsx` (~60 linii) — lista gotowych rutyn z nagłówkiem sekcji.
  - `index.ts` — barrel export.
- `src/components/exercises/`:
  - `ExerciseSearchBar.tsx` (~50 linii) — pasek wyszukiwania ćwiczeń.
  - `ExerciseFilterChips.tsx` (~55 linii) — pozioma lista filtrów partii mięśniowych.
  - `ExerciseCard.tsx` (~80 linii) — karta ćwiczenia z miniaturką z `assets/images`, nazwą i tagami.
  - `ExercisePreviewModal.tsx` (~85 linii) — modal z animacją gif z `assets/videos` i polskimi krokami techniki.
  - `index.ts` — barrel export.
- `src/components/public-profile/`:
  - `PublicProfileCard.tsx` (~65 linii) — wizytówka z avatarem, imieniem i statusem.
  - `PublicProfileActions.tsx` (~50 linii) — przyciski akcji (przejście do edycji profilu `/profile`).
  - `index.ts` — barrel export.

### 4. Ekrany Aplikacji (`src/app/`)
- `src/app/index.tsx` (modyfikacja) — dodanie `<PillNavbar activeTab="home" />` i odpowiedni dolny padding.
- `src/app/workouts.tsx` (nowy) — ekran rutyn z banerem i przyciskiem do bazy ćwiczeń + `<PillNavbar activeTab="workouts" />`.
- `src/app/exercises.tsx` (nowy) — ekran bazy ćwiczeń z filtrami i listą ćwiczeń.
- `src/app/user-profile.tsx` (nowy) — ekran widoku profilu użytkownika + `<PillNavbar activeTab="profile" />`.

---

## Plan Implementacji Krok po Kroku (TDD)

1. **Krok 1: Schematy Zod i Testy**
   - Utworzenie `src/schemas/navigation.schema.ts`, `src/schemas/routine.schema.ts`, `src/schemas/exercise-catalog.schema.ts`.
   - Testy schematów w `src/schemas/__tests__/`.
2. **Krok 2: Hooki i Logika Biznesowa (TDD)**
   - Testy jednostkowe dla `use-pill-navigation.test.ts`, `use-routines.test.ts`, `use-exercise-catalog.test.ts`, `use-public-profile.test.ts`.
   - Implementacja hooków w `src/hooks/`.
3. **Krok 3: Komponenty Pigułki Nawigacji**
   - Testy `pill-navbar.test.tsx`.
   - Implementacja `PillNavbar.tsx` i `PillNavItem.tsx` (< 100 linii).
4. **Krok 4: Komponenty Ekranu Treningów i Rutyn**
   - Testy komponentów w `src/components/workouts/__tests__/`.
   - Implementacja `ExercisesHeroBanner`, `RoutineCard`, `RoutineListSection`.
5. **Krok 5: Komponenty Ekranu Bazy Ćwiczeń**
   - Testy komponentów w `src/components/exercises/__tests__/`.
   - Mapowanie zasobów mediów w `src/lib/exercise-assets.ts`.
   - Implementacja `ExerciseCard`, `ExerciseSearchBar`, `ExerciseFilterChips`, `ExercisePreviewModal`.
6. **Krok 6: Komponenty Ekranu Profilu Publicznego**
   - Testy w `src/components/public-profile/__tests__/`.
   - Implementacja `PublicProfileCard`, `PublicProfileActions`.
7. **Krok 7: Ekrany aplikacji Expo Router**
   - Integracja w `src/app/index.tsx`.
   - Utworzenie `src/app/workouts.tsx`.
   - Utworzenie `src/app/exercises.tsx`.
   - Utworzenie `src/app/user-profile.tsx`.
   - Testy integracyjne ekranów w `src/app/__tests__/`.
8. **Krok 8: Weryfikacja Jakości**
   - `npm test` — 100% testów musi przejść.
   - `npx tsc --noEmit` — 0 błędów TypeScript.
   - `npm run lint` — 0 błędów ESLint.

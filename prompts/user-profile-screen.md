# Ekran Profilu Użytkownika (User Profile Screen) — Feature Prompt

## Przeczytane pliki (Research)

- `AGENTS.md` — Wytyczne projektowe: architektura, TDD (1. Zod schema, 2. test, 3. implementacja), reguła <100 linii na komponent, hooki w `./src/hooks`, Zod jako jedyne źródło prawdy, brak `any`, Zustand tylko dla stanu współdzielonego, poufność danych, konwencje nazewnictwa (snake_case w DB, PascalCase w typach, camelCase w zmiennych), zakaz bezpośredniego łączenia z DB z klienta.
- `src/app/user-profile.tsx` — Aktualny zalążek ekranu profilu publicznego z `PublicProfileCard`, `PublicProfileActions` oraz `PillNavbar`.
- `src/app/profile.tsx` — Ekran edycji profilu i ustawień (zmiana imienia, celu, partii mięśniowych, eksport/reset).
- `src/app/index.tsx` — Ekran główny z `HomeHeader` (`onPressProfile`), kartami treningu i `PillNavbar`.
- `src/hooks/use-pill-navigation.ts` — Hook dolnego paska nawigacji (zakładki `home`, `workouts`, `profile` prowadząca do `/user-profile`).
- `src/schemas/navigation.schema.ts` — Schematy zakładek nawigacyjnych.
- `src/schemas/routine.schema.ts` — Schematy rutyn treningowych (`RoutineItemSchema`, `RoutineListSchema`).
- `src/schemas/workout.schema.ts` — Schematy podsumowań treningów (`WorkoutSummarySchema`, `RecentActivitySchema`).
- `src/schemas/user.schema.ts` — Schemat `UserProfileSchema`.
- `src/schemas/profile.schema.ts` — Schematy ustawień i formularza profilu.
- `src/lib/exercise-assets.ts` — Mapa assetów zdjęć i gifów (`EXERCISE_ASSET_MAP`, `getExerciseMedia`).
- `src/stores/onboarding.store.ts` — Globalny stan danych użytkownika (imię, cel, wybrane partie).

---

## Wymagania Użytkownika

1. **Zdjęcia z rutyn na samej górze**:
   - Karuzela / galeria zdjęć z rutyn użytkownika z miniaturami ćwiczeń i tytułami.
2. **Tagi pod profilem**:
   - Seria dni (np. "🔥 36 dni serii") zależna od danych użytkownika.
   - Rangi / ligi siłowe oparte o rekord wyciskania na ławce (bench press), np. 100 kg = Diamentowa Liga.
   - Dodatkowe tagi (cel treningowy, poziom).
3. **Wykres intensywności treningów w ciągu miesiąca**:
   - Rozbicie na poszczególne tygodnie miesiąca (np. "18 lip – 25 lip: 5.0h").
   - Wykres słupkowy / paski postępu godzin treningowych dla każdego tygodnia z sumą miesięczną.
4. **Rutyny / treningi użytkownika**:
   - Lista aktywnych rutyn użytkownika z informacją o partiach, częstotliwości i czasie trwania.
5. **Ostatnio wykonane treningi z rozwijanymi ćwiczeniami ("jak się zescrolluje palcem")**:
   - Karta ostatniego treningu ze zdjęciem.
   - Po przewinięciu / gestem: szczegółowa lista wykonanych ćwiczeń, serii, powtórzeń i ciężarów (np. Wyciskanie 4x100kg) oraz pobite rekordy.
6. **Integracja z nawigacją**:
   - Dostępność w `PillNavbar` (zakładka "Profil").
   - Dostępność z avatara w `HomeHeader` (`HomeScreen`).
   - Przejście do ustawień / edycji (`/profile`) z poziomu profilu.

---

## Architektura i Podział Komponentów (< 100 linii per plik)

### 1. Model Danych Zod (`src/schemas/user-profile-screen.schema.ts`)
- `StrengthLeagueSchema` i funkcja `calculateStrengthLeague(benchPressKg: number)`:
  - < 50 kg: Brązowa Liga 🥉
  - 50–69 kg: Srebrna Liga 🥈
  - 70–89 kg: Złota Liga 🥇
  - 90–99 kg: Platynowa Liga 🛡️
  - 100–119 kg: Diamentowa Liga 💎 (zgodnie z wytycznymi użytkownika: 100 kg na klatę = Diamentowa Liga)
  - 120–139 kg: Mistrzowska Liga 👑
  - 140+ kg: Tytanowa Liga ⚡
- `RoutinePhotoItemSchema`: id, title, subtitle, imageSource, routineId.
- `WeeklyIntensitySchema`: weekLabel (np. "18 lip - 25 lip"), hours: number, workoutCount: number, targetHours: number.
- `MonthlyIntensityDataSchema`: monthName, totalHours, weeks: array(WeeklyIntensitySchema).
- `CompletedWorkoutExerciseSchema`: exerciseName, setsSummary (np. "4 serie: 80kg x 10, 90kg x 8, 95kg x 6, 100kg x 4"), isPR: boolean.
- `CompletedWorkoutDetailSchema`: id, title, completedDate, durationMinutes, totalVolumeKg, photoAssetKey, exercises: array.
- `UserProfileScreenDataSchema`: złożony schemat z walidacją całości danych ekranu profilu.

### 2. Warstwa Logiki Biznesowej (`src/hooks/use-user-profile-screen.ts`)
- Pobiera dane z `useOnboardingStore` (imię, cel, partie).
- Generuje zwalidowane dane rutyn z miniaturami ze zdjęć (`src/lib/exercise-assets.ts`).
- Oblicza ligę siłową na podstawie rekordu wyciskania (np. 100 kg -> Diamentowa Liga).
- Oblicza tygodniowe intensywności (np. "18 lip - 25 lip: 5.0h").
- Przygotowuje listę ostatnich treningów wraz z ćwiczeniami wykonanymi na treningu.
- Zapewnia funkcje nawigacyjne (`navigateToRoutine`, `openSettings`, `startWorkout`).

### 3. Modułowe Komponenty UI (`src/components/user-profile/`)
- `RoutinePhotoCarousel.tsx` (~80 linii) — horyzontalna galeria / karuzela zdjęć rutyn z nakładkami tytułów i partii mięśniowych.
- `ProfileHeaderWithBadges.tsx` (~85 linii) — avatar użytkownika, imię, bio oraz tagi: seria (36 dni), liga siłowa (Diamentowa Liga 100 kg), cel sylwetkowy.
- `MonthlyIntensityChart.tsx` (~85 linii) — wykres słupkowy / zestawienie tygodniowe intensywności (np. "18 lip - 25 lip: 5.0h").
- `UserRoutinesList.tsx` (~80 linii) — lista treningów/rutyn użytkownika z przyciskiem startu.
- `RecentCompletedWorkouts.tsx` (~90 linii) — sekcja ostatnio wykonanych treningów ze zdjęciem oraz horyzontalnym scrollem ćwiczeń z ciężarami i powtórzeniami.
- `index.ts` — Barrel export komponentów.

### 4. Ekran Profilu (`src/app/user-profile.tsx`) (~85 linii)
- Złożenie komponentów w `ScrollView` z `useSafeAreaInsets` i paddingiem na `PillNavbar`.
- Pasek górny z przyciskiem przejścia do edycji/ustawień (`/profile`).
- Pływający `PillNavbar activeTab="profile"`.

### 5. Aktualizacja Nawigacji
- `src/app/index.tsx`: przekierowanie z avatara `HomeHeader` do `/user-profile`.
- `src/hooks/use-pill-navigation.ts`: upewnienie się o poprawnej trasie i aktywnym stanie.

---

## Plan Implementacji Krok po Kroku (TDD)

1. **Krok 1: Schematy Zod (`src/schemas/user-profile-screen.schema.ts`)**
   - Zdefiniowanie schematów dla ligi siłowej, intensywności tygodniowej, zdjęć rutyn, ostatnich treningów.
   - Testy jednostkowe: `src/schemas/__tests__/user-profile-screen.schema.test.ts`.

2. **Krok 2: Testy jednostkowe Hooka (`src/hooks/__tests__/use-user-profile-screen.test.ts`)**
   - Testowanie kalkulacji ligi (100 kg = Diamentowa Liga), formatowania godzin tygodniowych ("18 lip - 25 lip"), serializacji i bezpiecznego parsowania Zod.

3. **Krok 3: Implementacja Hooka (`src/hooks/use-user-profile-screen.ts`)**
   - Implementacja hooka z pełną zgodnością z typami Zod (zero `any`).

4. **Krok 4: Testy Komponentów UI (`src/components/user-profile/__tests__/user-profile-components.test.tsx`)**
   - Testy renderowania każdego modułu: karuzeli zdjęć rutyn, tagów i ligi siłowej, wykresu intensywności, rutyn i rozwijanych ostatnich treningów.

5. **Krok 5: Implementacja Komponentów UI w `src/components/user-profile/`**
   - `RoutinePhotoCarousel.tsx`
   - `ProfileHeaderWithBadges.tsx`
   - `MonthlyIntensityChart.tsx`
   - `UserRoutinesList.tsx`
   - `RecentCompletedWorkouts.tsx`
   - `index.ts`

6. **Krok 6: Aktualizacja Ekranu `src/app/user-profile.tsx` oraz testu integracyjnego `src/app/__tests__/user-profile.test.tsx`**
   - Sprawdzenie zgodności z regułą < 100 linii.

7. **Krok 7: Połączenie z `HomeScreen` (`src/app/index.tsx`)**
   - Aktualizacja `handleOpenProfile` -> `/user-profile`.
   - Aktualizacja testów `src/app/__tests__/index.test.tsx`.

8. **Krok 8: Weryfikacja końcowa**
   - `npm test` — wszystkie testy zdane (100%).
   - `npx tsc --noEmit` — 0 błędów typowania.
   - `npm run lint` — 0 ostrzeżeń/błędów.

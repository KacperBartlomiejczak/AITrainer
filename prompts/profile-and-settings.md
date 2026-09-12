# Profil Użytkownika i Ustawienia (Profile & Settings) — Feature Prompt

## Przeczytane pliki (Research)

- `AGENTS.md` — Wytyczne projektowe: architektura, TDD, reguła <100 linii na komponent, hooki w `./src/hooks`, Zod jako źródło prawdy, brak `any`, Zustand tylko dla stanu współdzielonego, poufność danych (eksport/usunięcie), konwencje nazewnictwa, brak integracji z Clerk na tym etapie.
- `src/app/index.tsx` — Główny ekran aplikacji (`HomeScreen`), integracja z `HomeHeader`.
- `src/components/home/HomeHeader.tsx` — Komponent nagłówka z avatarem użytkownika, integracja z nawigacją.
- `src/schemas/user.schema.ts` — Schemat `UserProfileSchema` i typ `UserProfile`.
- `src/schemas/onboarding.schema.ts` — Schematy `FitnessGoalSchema`, `MuscleGroupSchema`, `OnboardingFormSchema`, etykiety i opisy `FITNESS_GOAL_LABELS`, `MUSCLE_GROUP_LABELS`.
- `src/stores/onboarding.store.ts` — Persystowany store Zustand przechowujący `onboardingData` (imię, cel, partie mięśniowe).
- `src/hooks/use-home-screen.ts` — Hook ekranu głównego integrujący dane z `useOnboardingStore`.
- `src/app/_layout.tsx` — Główny stack nawigacji Expo Router.
- `package.json` — Wersje zależności (Expo SDK 57, React Native, Zod, Zustand, lucide-react-native).

---

## Cel Zadania

1. Stworzenie komponentu / ekranu profilu i ustawień (`/profile`).
2. Integracja ikony profilu (Avatar w `HomeHeader`) z nawigacją do ekranu profilu/ustawień.
3. Umożliwienie edycji i zapisu:
   - Imienia użytkownika (`name`),
   - Celu treningowego (`fitnessGoal`),
   - Priorytetowych partii mięśniowych (`focusMuscleGroups`).
4. Utrzymanie danych w persystowanym store (`useOnboardingStore`) z natychmiastową synchronizacją z `HomeScreen`.
5. Zgodność z wytycznymi bezpieczeństwa danych (eksport danych JSON oraz opcja resetu/ponownego przejścia onboardingu).
6. Bez integracji z Clerk na tym etapie (zgodnie z poleceniem użytkownika).

---

## Architektura i Podział Komponentów (< 100 linii per plik)

### 1. Model Danych i Walidacja (`src/schemas/profile.schema.ts`)
- Schemat `ProfileFormSchema` bazujący na Zod (walidacja imienia, wyboru celu i minimum jednej partii mięśniowej).
- Schemat `AppSettingsSchema` dla preferencji aplikacji.
- Eksportowane typy TypeScript: `ProfileFormData`, `AppSettings`.

### 2. Logika Biznesowa w Custom Hooku (`src/hooks/use-profile.ts`)
- Odczyt aktualnych danych z `useOnboardingStore`.
- Lokalny stan edycji formularza (oddzielony od globalnego store zgodnie z zasadą Zustand w AGENTS.md).
- Metody walidacji i zapisu (`saveProfile`, `setName`, `setFitnessGoal`, `toggleMuscleGroup`).
- Metoda eksportu danych użytkownika (`exportData`) oraz resetu (`resetProfileData`).

### 3. Rozszerzenie Store (`src/stores/onboarding.store.ts`)
- Dodanie akcji `updateProfile: (data: Partial<OnboardingFormData>) => void` dla bezpiecznej aktualizacji profilu bez nadpisywania całego stanu.

### 4. Modułowe Komponenty UI (`src/components/profile/`)
- `ProfileHeaderCard.tsx` (~60 linii) — Wizytówka użytkownika: avatar, inicjały, imię, poziom, badge ze streak'iem.
- `ProfileNameSection.tsx` (~55 linii) — Sekcja edycji imienia z polem `TextInput` i walidacją błędów.
- `ProfileGoalSection.tsx` (~75 linii) — Wybór głównego celu treningowego (karty z ikonami emoji i opisami).
- `ProfileMuscleGroupsSection.tsx` (~80 linii) — Siatka wyboru priorytetowych partii mięśniowych z multiselectem.
- `ProfileSettingsSection.tsx` (~80 linii) — Ustawienia aplikacji, eksport danych oraz strefa resetu danych.
- `index.ts` — Barrel export komponentów profilu.

### 5. Ekran Profilu (`src/app/profile.tsx`) (~85 linii)
- Złożenie komponentów profilu w ScrollView z Safe Area Insets.
- Pasek górny z przyciskiem powrotu do ekranu głównego.
- Przycisk zapisu zmian z informacją zwrotną o sukcesie / błędach walidacji.

### 6. Integracja Ikony Profilu w `HomeHeader` i `HomeScreen`
- Dodanie do `HomeHeader` obsługi `onPressProfile?: () => void`.
- Zamiana statycznego `Avatar` na interaktywny `Pressable` z dostępnością (`accessibilityRole="button"`, `testID="profile-button"`).
- W `src/app/index.tsx` przekazanie nawigacji: `router.push("/profile")`.

---

## Plan Implementacji Krok po Kroku (TDD)

1. **Krok 1: Schemat danych Zod**
   - Utworzenie `src/schemas/profile.schema.ts`.
   - Napisanie testów schematu w `src/schemas/__tests__/profile.schema.test.ts`.

2. **Krok 2: Akcja w store**
   - Dodanie metody `updateProfile` w `src/stores/onboarding.store.ts`.

3. **Krok 3: Testy jednostkowe hooka `useProfile`**
   - Utworzenie `src/hooks/__tests__/use-profile.test.ts`.

4. **Krok 4: Implementacja `src/hooks/use-profile.ts`**
   - Implementacja hooka spełniającego wszystkie asercje testowe.

5. **Krok 5: Testy komponentów profilu**
   - Utworzenie `src/components/profile/__tests__/profile-components.test.tsx`.

6. **Krok 6: Implementacja komponentów profilu**
   - Utworzenie `src/components/profile/*`.
   - Każdy plik ściśle poniżej 100 linii kodu.

7. **Krok 7: Ekran `src/app/profile.tsx` i testy integracyjne**
   - Utworzenie `src/app/__tests__/profile.test.tsx`.
   - Implementacja `src/app/profile.tsx`.

8. **Krok 8: Integracja z `HomeHeader` i `src/app/index.tsx`**
   - Dodanie `onPressProfile` w `HomeHeader.tsx`.
   - Aktualizacja testów `HomeHeader` i `index.test.tsx`.

9. **Krok 9: Weryfikacja końcowa**
   - `npm test` — wszystkie testy muszą przejść.
   - `npx tsc --noEmit` — 0 błędów typowania.
   - `npm run lint` — 0 błędów lintera.

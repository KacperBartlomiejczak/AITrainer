# Splash Screen + Onboarding — Feature Prompt

## Files Read (Research)

- `src/app/_layout.tsx` — Root layout (Stack navigator, dark bg, no headers)
- `src/app/index.tsx` — HomeScreen (current entry point)
- `src/app/global.css` — Design tokens (OLED dark theme)
- `src/schemas/user.schema.ts` — Existing `UserProfileSchema`
- `src/schemas/home.schema.ts` — `HomeScreenDataSchema`
- `src/schemas/workout.schema.ts` — `WorkoutSummarySchema`
- `src/schemas/ai-coach.schema.ts` — `AiCoachTipSchema`
- `src/types/index.ts` — Re-exports from schemas
- `src/hooks/use-home-screen.ts` — Home data hook with mock data
- `src/components/ui/*.tsx` — Button, Card, Typography, Avatar, Badge, Progress, Separator
- `src/lib/utils.ts` — `cn()` utility
- `tailwind.config.js` — NativeWind theme config
- `package.json` — Dependencies (has Reanimated, NativeWind, Zod, no Zustand/AsyncStorage)
- `app.json` — Expo config (expo-splash-screen plugin configured)
- `jest.config.js` — Jest + jest-expo setup
- `tsconfig.json` — Path aliases `@/*` → `./src/*`

## Co budujemy

1. **Splash Screen** — Animowany ekran ładowania z pulsującym logo, fade-in tekstu, premium feel (Reanimated)
2. **Onboarding Flow** — Multi-step formularz dla nowego użytkownika:
   - Krok 1: Imię
   - Krok 2: Cel treningowy (schudnąć, przytyć/masa, utrzymanie formy, siła, ogólna kondycja)
   - Krok 3: Preferowana partia ciała (Klatka piersiowa, Plecy, Nogi, Barki, Ramiona, Brzuch) — multi-select
   - Krok 4: Podsumowanie + start

## Plan implementacji

### Step 1: Zod Schemas + Typy
- `src/schemas/onboarding.schema.ts` — `OnboardingFormSchema` (Zod)
- Typy: `FitnessGoal`, `MuscleGroup`, `OnboardingFormData`
- Re-export w `src/types/index.ts`

### Step 2: Testy dla schematów + komponentów
- `src/schemas/__tests__/onboarding.schema.test.ts`
- `src/app/__tests__/splash.test.tsx`
- `src/app/__tests__/onboarding.test.tsx`
- `src/hooks/__tests__/use-onboarding.test.ts`

### Step 3: Zustand Store + AsyncStorage
- Install: `zustand`, `@react-native-async-storage/async-storage`
- `src/stores/onboarding.store.ts` — persisted store (hasCompletedOnboarding, userData)

### Step 4: Custom Hook
- `src/hooks/use-onboarding.ts` — stepper logic, form validation, navigation

### Step 5: Splash Screen (route)
- `src/app/splash.tsx` — animowany splash z Reanimated
- Modyfikacja `_layout.tsx` — conditional routing splash → onboarding / home

### Step 6: Onboarding Screen (route)
- `src/app/onboarding.tsx` — multi-step form
- `src/components/onboarding/` — sub-components:
  - `StepName.tsx`
  - `StepGoal.tsx`
  - `StepMuscleGroups.tsx`
  - `StepSummary.tsx`
  - `OnboardingProgress.tsx`

### Step 7: Routing Logic
- `_layout.tsx` — check onboarding state → redirect

### Step 8: Weryfikacja
- `npm test`
- `npx tsc --noEmit`
- `npm run lint`

## Partie ciała (opcje)
- Klatka piersiowa
- Plecy
- Nogi
- Barki
- Ramiona (Biceps + Triceps)
- Brzuch

## Cele treningowe (opcje)
- Schudnąć (redukcja)
- Masa mięśniowa (budowa)
- Siła (powerlifting)
- Ogólna kondycja
- Utrzymanie formy

# Połączenie Splash Screena z Main Screenem (Home) — Feature Prompt

## Przeczytane pliki (Research)

- `src/app/_layout.tsx` — Root layout z Expo Router, zarządzanie stanem hydratacji i nawigacją
- `src/app/splash.tsx` — Animowany ekran Splash z Reanimated (logo, tekst, loader)
- `src/app/index.tsx` — Główny ekran aplikacji (HomeScreen)
- `src/app/(onboarding)/_layout.tsx` — Layout stacku onboardingu
- `src/app/(onboarding)/index.tsx` — Przekierowanie do step-name
- `src/stores/onboarding.store.ts` — Store Zustand z persystencją w AsyncStorage (`hasCompletedOnboarding`, `isHydrated`, `onboardingData`)
- `src/hooks/use-home-screen.ts` — Hook dostarczający dane dla HomeScreen
- `src/hooks/use-onboarding.ts` — Hook zarządzający formularzem onboardingu i nawigacją
- `src/schemas/onboarding.schema.ts` — Schematy Zod dla onboardingu
- `src/schemas/home.schema.ts` — Schemat Zod dla danych HomeScreen
- `src/app/__tests__/splash.test.tsx` — Istniejące testy jednostkowe dla Splash Screen
- `src/app/__tests__/index.test.tsx` — Istniejące testy jednostkowe dla HomeScreen
- `package.json` & `app.json` — Konfiguracja zależności, Expo i expo-splash-screen

## Zidentyfikowane problemy i ostrzeżenia

1. **Naruszenie architektury Expo Router w `_layout.tsx`**:
   - `RootLayout` warunkowo zwracał `<View><SplashScreen /></View>` gdy `!isHydrated`.
   - W Expo Router każdy `_layout` MUSI bezwzględnie renderować nawigator (`<Stack />`, `<Slot />`). Warunkowe renderowanie zwykłego `<View>` wywołuje ostrzeżenia/błędy Expo Router ("Layout children must be a Navigator or Slot") oraz problemy z remountem drzewa nawigacji.
2. **Brak płynnego przejścia i wygaszania Splasha**:
   - Store Zustand rehydratuje się z `AsyncStorage` w kilka milisekund, przez co `SplashScreen` znikał natychmiast lub mrugał, zanim animacje Reanimated zdążyły się w ogóle uruchomić (loader miał fade-in po 1200ms!).
   - Komponent `src/app/splash.tsx` nie posiadał logiki przejścia do ekranu głównego ani wywołania callbacku zakończenia animacji.
3. **Potencjalne nieobsłużone wyjątki natywnego Splash Screena**:
   - `SplashScreenModule.preventAutoHideAsync()` oraz `SplashScreenModule.hideAsync()` mogą rzucić wyjątek przy wielokrotnym wywołaniu / hot reloadzie. Wymagają bezpiecznego `.catch(() => {})`.
4. **Ostrzeżenie o niekompatybilnej paczce w Expo**:
   - `npx expo install --check` raportuje: `@types/jest@30.0.0 - expected version: 29.5.14`. Wyrównanie wersji usunie to ostrzeżenie.
5. **Połączenie danych ze Splasha i Onboardingu do Main Screena**:
   - Po przejściu do `index.tsx`, `useHomeScreen` powinien uwzględniać dane z `useOnboardingStore` (np. faktyczne imię użytkownika podane w onboardingu).

## Plan Implementacji (Krok po kroku)

### Krok 1: Wyrównanie zależności (@types/jest)
- Zaktualizowanie `@types/jest` do `29.5.14`, aby `npx expo install --check` przechodził ze statusem 0 i bez ostrzeżeń.

### Krok 2: Przygotowanie testów
- Rozszerzenie testów `src/app/__tests__/splash.test.tsx` o obsługę callbacku `onFinish` / auto-nawigacji po upływie czasu animacji.
- Dodanie testów weryfikujących, że timery są czyszczone przy unmount (brak wycieków pamięci / ostrzeżeń o update na unmounted component).
- Dodanie testu integracji `useHomeScreen` z `onboardingData`.

### Krok 3: Refaktoryzacja `src/app/splash.tsx`
- Dodanie obsługi propów `onFinish?: () => void`, `durationMs?: number`, `isOverlay?: boolean`.
- Dodanie płynnej animacji fade-out przy kończeniu wyświetlania splash screena.
- Jeśli `splash.tsx` jest otwarty jako samodzielna trasa (`/splash`), automatyczne przekierowanie po animacji za pomocą `router.replace("/")` (jeśli użytkownik jest po onboardingu) lub `router.replace("/(onboarding)/step-name")`.
- Bezpieczne czyszczenie timerów w cleanupie `useEffect`.

### Krok 4: Refaktoryzacja `src/app/_layout.tsx`
- Zapewnienie, że `<Stack>` jest ZAWSZE renderowany jako główny element widoku (zgodność z Expo Router).
- Prezentacja `SplashScreen` jako płynnego overlay'a na poziomie roota, dopóki:
  1. Store nie zostanie zhydratowany (`isHydrated === true`),
  2. Animacja powitalna nie dobiegnie końca (np. ~1600-1800ms).
- Bezpieczne wywołanie `SplashScreenModule.hideAsync().catch(() => {})`.
- Płynny fade-out overlay'a ujawniający ekran główny (`/`) lub onboarding.

### Krok 5: Połączenie danych z Main Screenem (`use-home-screen.ts`)
- Odczyt `onboardingData` z `useOnboardingStore`.
- Wyświetlanie prawdziwego imienia użytkownika w powitaniu na HomeScreen (`data.user.name = onboardingData.name`).

### Krok 6: Pełna weryfikacja
- Uruchomienie `npx expo install --check` — weryfikacja 0 ostrzeżeń zależności.
- Uruchomienie `npm test` — weryfikacja przejścia wszystkich testów.
- Uruchomienie `npx tsc --noEmit` — weryfikacja 0 błędów TypeScript.
- Uruchomienie `npm run lint` — weryfikacja 0 błędów i ostrzeżeń ESLint.

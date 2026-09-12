# Plan Naprawy Ostrzeżeń GitHub Copilot (Branch: feat/connect-splash-and-main-screen)

## Przeczytane pliki (Research & Audyt)

1. `src/app/_layout.tsx` — Główny layout aplikacji, obsługa nawigacji, hydratacji Zustand i nakładki Splash Screen.
2. `src/app/splash.tsx` — Komponent ekranu powitalnego z animacjami Reanimated, timerem i nawigacją.
3. `src/hooks/use-home-screen.ts` — Hook zarządzający danymi ekranu głównego (personalizacja imieniem użytkownika).
4. `src/schemas/splash.schema.ts` — Schemat Zod konfiguracji `SplashScreenConfig`.
5. `src/schemas/onboarding.schema.ts` — Schematy Zod onboardingu (`OnboardingFormSchema`).
6. `src/schemas/home.schema.ts` — Schematy Zod ekranu domowego.
7. `src/stores/onboarding.store.ts` — Store Zustand z persystencją w AsyncStorage (`isHydrated`, `hasCompletedOnboarding`, `onboardingData`).
8. `src/app/__tests__/layout.test.tsx` — Testy jednostkowe layoutu roota.
9. `src/app/__tests__/splash.test.tsx` — Testy jednostkowe ekranu powitalnego.
10. `src/hooks/__tests__/use-home-screen.test.ts` — Testy jednostkowe hooka `useHomeScreen`.
11. Komentarze z review GitHub Copilot na PR #2 (`gh pr view 2 --comments` oraz GitHub REST API).

---

## Zidentyfikowane ostrzeżenia i uwagi z GitHub Copilot

W ramach Code Review dla Pull Requesta #2, GitHub Copilot zgłosił następujące uwagi:

1. **Globalna mutacja loggera Reanimated w module widoku (`src/app/splash.tsx:21-24`)**:
   - `configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false })` wywołany na poziomie modułu wyłączał ostrzeżenia trybu strict w całej aplikacji, maskując potencjalne regresje.
   - **Rozwiązanie**: Usunąć `configureReanimatedLogger` z `splash.tsx`. Poprawić dostęp do wartości współdzielonych, aby kod był w pełni zgodny ze strict mode.

2. **Zbyt duża złożoność komponentu `src/app/splash.tsx` (> 190 linii)**:
   - Komponent łączył renderowanie widoku, harmonogramowanie wielu animacji Reanimated, zarządzanie timerami, sprawdzanie stanu hydratacji i decyzje o przekierowaniach w routerze.
   - Zgodnie z wytycznymi projektu (`AGENTS.md`): komponenty > 100 linii rozbijamy, a logikę biznesową wydzielamy do dedykowanych hooków w `src/hooks`.
   - **Rozwiązanie**: Utworzyć custom hook `src/hooks/use-splash-screen.ts` i odchudzić `src/app/splash.tsx` do czytelnego komponentu prezentacyjnego (< 80 linii).

3. **Brak animacji wygaszania tła (`containerOpacity`) przed unmountem (`src/app/splash.tsx:67`)**:
   - Zmienna `containerOpacity` była zainicjalizowana do `1`, ale nigdy nie animowana do `0`. Nakładka znikała nagle po zakończeniu timera (twarde cięcie).
   - **Rozwiązanie**: Dodać płynny fade-out kontenera (300ms) pod koniec czasu trwania animacji, a `onFinish` wywołać po zakończeniu wygaszania.

4. **Brak wsparcia dla preferencji dostępności Reduce Motion (`src/app/splash.tsx:81`)**:
   - Pulsująca w nieskończoność animacja logo (`logoScale`) ignorowała systemowe ustawienie ograniczenia ruchu.
   - **Rozwiązanie**: Użyć hooka `useReducedMotion()` z `react-native-reanimated` i wyłączyć zapętlony puls dla użytkowników preferujących zredukowany ruch.

5. **Podwójny montaż Splasha i wyścig rehydratacji (`src/app/_layout.tsx:74` i `src/app/splash.tsx:115`)**:
   - Przy wejściu bezpośrednio na trasę `/splash` montowane były dwie instancje `SplashScreen` (nakładka w root layout oraz ekran trasy), co prowadziło do duplikacji animacji i konfliktów timerów `router.replace`.
   - Jeśli `/splash` otwarto bezpośrednio na zimnym starcie, a rehydratacja AsyncStorage trwała dłużej niż timer, użytkownik mógł zostać błędnie przekierowany do onboardingu przed odczytaniem zapisanego stanu.
   - **Rozwiązanie**: W `_layout.tsx` nie renderować nakładki, jeśli bieżącym segmentem jest `/splash`. W logice auto-nawigacji splasha uzależnić przekierowanie od `isHydrated === true`.

6. **Brak pokrycia testowego dla gałęzi przekierowań w `src/app/__tests__/layout.test.tsx`**:
   - Testy layoutu miały zahardkodowane `isHydrated: true`, `hasCompletedOnboarding: true` i pustą tablicę segmentów, nie sprawdzając w ogóle ścieżek `router.replace` ani ochrony kroków onboardingu.
   - **Rozwiązanie**: Rozbudować `layout.test.tsx` o scenariusze z różnymi stanami store'a i segmentami URL, weryfikując poprawne przekierowania i brak niepotrzebnych redirectów podczas przechodzenia przez onboarding.

7. **Brak walidacji Zod dla rehydratowanych danych profilu w `src/hooks/use-home-screen.ts`**:
   - Hook ufał obiektowi z `AsyncStorage` jako poprawnemu typowi TypeScript bez walidacji runtime. Uszkodzony lub niepełny JSON mógł doprowadzić do błędu wykonania (np. brak pola `name` lub niepoprawny typ rzucający błąd w `user.name.split()`).
   - **Rozwiązanie**: Walidować `onboardingData` przy użyciu `OnboardingFormSchema.safeParse` (lub schematu cząstkowego) i w razie błędu bezpiecznie zachować dane domyślne. Dodać testy jednostkowe weryfikujące tę odporność.

---

## Plan Implementacji (Krok po kroku)

### Krok 1: Walidacja danych Zod w `use-home-screen.ts` (Zgodnie z Zod-first w AGENTS.md)
1. Zastosować `OnboardingFormSchema.safeParse(onboardingData)` przed wyciągnięciem `name`.
2. Dodać test w `src/hooks/__tests__/use-home-screen.test.ts` sprawdzający odporność na uszkodzone dane w store (np. `name: 123` lub brak wymaganych pól).

### Krok 2: Utworzenie custom hooka `useSplashScreen` i testów
1. Zdefiniować interfejs i zachowanie w `src/hooks/use-splash-screen.ts`:
   - Walidacja Zod opcji wejściowych (`SplashScreenConfigSchema.safeParse`).
   - Wsparcie dla `useReducedMotion()`.
   - Płynny fade-out kontenera (`containerOpacity -> 0`).
   - Bramkowanie nawigacji stanem `isHydrated`.
   - Pełne czyszczenie timerów przy unmount.
2. Napisać testy jednostkowe w `src/hooks/__tests__/use-splash-screen.test.ts`.

### Krok 3: Refaktoryzacja `src/app/splash.tsx`
1. Usunąć `configureReanimatedLogger`.
2. Podpiąć `useSplashScreen`.
3. Zredukować plik do czystego komponentu prezentacyjnego (< 80 linii).
4. Zaktualizować testy w `src/app/__tests__/splash.test.tsx`.

### Krok 4: Poprawki w `src/app/_layout.tsx` i pełne testy przekierowań
1. Warunkowe wyłączenie nakładki splash, gdy aktywny segment to `splash`.
2. Rozbudowa `src/app/__tests__/layout.test.tsx`:
   - Przekierowanie nowego użytkownika do `/(onboarding)/step-name`.
   - Zatrzymanie użytkownika w krokach onboardingu (np. `step-goal`).
   - Przekierowanie ukończonego onboardingu z `/splash` i `/(onboarding)` do `/`.
   - Ukrywanie native splash i poprawne renderowanie stacka.

### Krok 5: Weryfikacja jakości kodu
1. `npm test` — weryfikacja 100% zdanych testów jednostkowych.
2. `npx tsc --noEmit` — weryfikacja typów TypeScript (zero błędów, zero `any`).
3. `npm run lint` — weryfikacja ESLint (zero ostrzeżeń).
4. Sprawdzenie zgodności z regułami `AGENTS.md`.

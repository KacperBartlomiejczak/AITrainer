# Diagnoza i Plan Naprawy Ostrzeżeń Reanimated Strict Mode

## Przeczytane pliki (Research & Audyt Codebase)

1. `src/hooks/use-splash-screen.ts` — Jedyny hook w aplikacji korzystający z `react-native-reanimated` (`useSharedValue`, `useAnimatedStyle`, `withTiming`, `withDelay`, `withRepeat`, itp.).
2. `src/app/splash.tsx` — Komponent ekranu i nakładki powitalnej, korzystający z `useSplashScreen`.
3. `src/app/_layout.tsx` — Główny layout aplikacji renderujący nakładkę `<SplashScreen isOverlay />` podczas hydratacji i zimnego startu.
4. `src/app/__tests__/layout.test.tsx` — Testy jednostkowe layoutu roota z mockami `react-native-reanimated`.
5. `src/app/__tests__/splash.test.tsx` — Testy jednostkowe ekranu powitalnego.
6. `src/hooks/__tests__/use-splash-screen.test.ts` — Testy jednostkowe hooka animacji.
7. `prompts/fix-copilot-warnings-splash-connect.md` — Wcześniejsza dokumentacja PR #2, w której usunięto konfigurację loggera z widoku.
8. `node_modules/react-native-reanimated/src/mutables.ts` — Wewnętrzna implementacja `checkInvalidReadDuringRender` i `checkInvalidWriteDuringRender`.
9. `node_modules/react-native-reanimated/src/reactUtils.ts` — Wewnętrzna implementacja `isReactRendering()` i `isFirstReactRender()` badająca internals React 19 (`__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.A.getOwner()`).
10. `node_modules/react-native-reanimated/src/hook/useAnimatedStyle.ts` — Implementacja `useAnimatedStyle` i synchronicznego wywołania `initialUpdaterRun(updater)` podczas renderu.
11. `node_modules/react-native-reanimated/src/animation/util.ts` — Implementacja `cancelAnimation` wykonująca `sharedValue.value = sharedValue.value` przy unmount/cleanup.
12. `node_modules/react-native-reanimated/src/ConfigHelper.ts` oraz `src/common/logger.ts` — Oficjalna konfiguracja loggera `configureReanimatedLogger`.

---

## Który komponent wywołuje ten błąd?

Błąd jest wywoływany przez komponent **`SplashScreen`** (`src/app/splash.tsx`) oraz powiązany z nim hook **`useSplashScreen`** (`src/hooks/use-splash-screen.ts`), renderowany w **`src/app/_layout.tsx`** jako nakładka startowa `<SplashScreen isOverlay />` (oraz na trasie `/splash`).

Jest to **jedyny komponent** w całym projekcie, który korzysta z `react-native-reanimated` i `useSharedValue`.

---

## Dokładna analiza przyczyny błędu (Root Cause)

W Reanimated 3.16+ oraz 4.x wprowadzono domyślnie włączony **Strict Mode** w loggerze deweloperskim.
Reanimated sprawdza każdą operację odczytu (`getter value`) oraz zapisu (`setter value`):
```ts
function shouldWarnAboutAccessDuringRender() {
  return __DEV__ && isReactRendering() && !isFirstReactRender();
}
```

W naszej aplikacji ostrzeżenia pojawiają się w dokładnie powtarzalnej sekwencji:

1. **6x `WARN [Reanimated] Reading from \`value\` during component render`**:
   - `useSplashScreen` definiuje 6 wartości współdzielonych: `logoScale`, `logoOpacity`, `titleOpacity`, `subtitleOpacity`, `loaderOpacity`, `containerOpacity`.
   - Z wartości tych korzysta 5 styli animowanych `useAnimatedStyle`:
     1. `containerAnimatedStyle` -> czyta `containerOpacity.value`
     2. `logoAnimatedStyle` -> czyta `logoScale.value` oraz `logoOpacity.value` (2 odczyty)
     3. `titleAnimatedStyle` -> czyta `titleOpacity.value`
     4. `subtitleAnimatedStyle` -> czyta `subtitleOpacity.value`
     5. `loaderAnimatedStyle` -> czyta `loaderOpacity.value`
     (Łącznie dokładnie **6 odczytów**!).
   - Gdy aplikacja startuje, `RootLayout` renderuje się po raz pierwszy (`isHydrated = false`). Zaraz potem Zustand rehydratuje dane z `AsyncStorage` i zmienia `isHydrated = true`, co wywołuje **ponowny render** `RootLayout`.
   - W React 19 `RootLayout` posiada już tzw. `alternate Fiber` (nie jest to pierwszy render w drzewie).
   - Gdy `SplashScreen` montuje się lub ewaluuje w tym cyklu, `useAnimatedStyle` wykonuje wewnątrz `initialUpdaterRun(updater)` synchronicznie na wątku JS, aby ustalić początkowe wartości stylów.
   - Wewnątrz `updater()` następuje odczyt `.value`. Funkcja `isReactRendering()` zwraca `true`, a `!isFirstReactRender()` zwraca `true` (ze względu na ownera z alternate fiber). Reanimated błędnie klasyfikuje to jako niedozwolony dostęp w trakcie renderu komponentu.

2. **2x para `Writing to \`value\`...` oraz `Reading from \`value\`...`**:
   - Gdy nakładka `SplashScreen` kończy działanie po 1600ms (`handleSplashFinish`), następuje `setShowSplashOverlay(false)` i odmontowanie komponentu.
   - W cyklu cleanupu Reanimated wywołuje wewnętrzną funkcję `cancelAnimation(mutable)`.
   - W kodzie źródłowym Reanimated 4 (`animation/util.ts:588`):
     ```ts
     sharedValue.value = sharedValue.value; // eslint-disable-line no-self-assign
     ```
   - Ta operacja to jednocześnie odczyt (`get value`) i zapis (`set value`). Jeśli cleanup następuje podczas fazy renderu/reconciliation React 19, Reanimated loguje parę:
     - `Writing to value during component render`
     - `Reading from value during component render`

3. **Dlaczego problem powrócił po PR #2?**:
   - We wcześniejszym PR #2 GitHub Copilot zauważył, że `configureReanimatedLogger({ strict: false })` znajdowało się bezpośrednio w pliku widoku `src/app/splash.tsx`. Słusznie zalecono usunięcie go z pliku widoku komponentu (ponieważ pliki widoków nie powinny mutować konfiguracji globalnych bibliotek przy imporcie modułu).
   - Jednak zamiast przenieść konfigurację do pliku wejściowego aplikacji (`src/app/_layout.tsx`), została ona całkowicie usunięta, przez co Reanimated powróciło do domyślnego trybu `strict: true`.
   - Oficjalna dokumentacja Software Mansion (podana w treści samego ostrzeżenia: `https://docs.swmansion.com/react-native-reanimated/docs/debugging/logger-configuration`) jednoznacznie wskazuje, że przy false-positives z React 19 zalecanym i poprawnym rozwiązaniem jest skonfigurowanie loggera na poziomie korzenia aplikacji (`_layout.tsx`):
     ```ts
     configureReanimatedLogger({
       level: ReanimatedLogLevel.warn,
       strict: false,
     });
     ```

---

## Plan Implementacji

### Krok 1: Globalna konfiguracja loggera Reanimated w `src/app/_layout.tsx`
- Zaimportować `configureReanimatedLogger` oraz `ReanimatedLogLevel` z `react-native-reanimated`.
- Wywołać `configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false })` na poziomie modułu w `src/app/_layout.tsx` tuż obok `SplashScreenModule.preventAutoHideAsync()`.
- Dodać wyczerpujący komentarz ze wskazaniem na oficjalną dokumentację Reanimated i wyjaśnieniem eliminacji false-positives w React 19.

### Krok 2: Uporządkowanie hooka `src/hooks/use-splash-screen.ts`
- Oczyścić tablicę zależności w głównym `useEffect` (wartości `useSharedValue` są stabilnymi referencjami i nie powinny zaśmiecać dependency array).
- Upewnić się, że `containerStyle` i style animowane są przekazywane bezpośrednio i czytelnie.

### Krok 3: Aktualizacja mocków w testach jednostkowych
- Zaktualizować mock `react-native-reanimated` w `src/app/__tests__/layout.test.tsx` (oraz `splash.test.tsx` / `use-splash-screen.test.ts`), dodając `configureReanimatedLogger: jest.fn()` oraz `ReanimatedLogLevel: { warn: 1, error: 2 }`, aby zapobiec błędom importu w środowisku Jest.

### Krok 4: Weryfikacja
- Uruchomić pełny zestaw testów: `npm test` (wszystkie 40 zestawów testów / 235 testów musi przejść bez zmian w logice testowej).
- Uruchomić weryfikację typów: `npx tsc --noEmit`.
- Uruchomić linter: `npm run lint`.

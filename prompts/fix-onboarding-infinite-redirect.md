# Fix: "Maximum update depth exceeded" w OnboardingLayout

## Przeczytane pliki

- `src/app/_layout.tsx` – RootLayout, efekt przekierowań onboarding ↔ home
- `src/app/(onboarding)/_layout.tsx` – Stack grupy onboarding (miejsce z call stacku)
- `src/app/(onboarding)/index.tsx` – `<Redirect href="/(onboarding)/step-name" />`
- `src/app/(onboarding)/step-name.tsx`, `step-goal.tsx`, `step-muscle-groups.tsx`, `step-summary.tsx`
- `src/app/index.tsx` – ekran główny (URL `/`)
- `src/app/splash.tsx`, `src/hooks/use-splash-screen.ts`
- `src/hooks/use-onboarding.ts` – `submitOnboarding()` robi `router.replace("/")`
- `src/stores/onboarding.store.ts`, `src/stores/onboarding-form.store.ts`
- `src/app/__tests__/layout.test.tsx`, `src/app/__tests__/onboarding.test.tsx`
- `node_modules/expo-router/build/fork/getStateFromPath-forks.js` (v57.0.21) – sortowanie dopasowań ścieżek

## Diagnoza

### Przyczyna główna – dwa pliki na ten sam URL `/`

Grupy `(nazwa)` nie dodają segmentu do URL, więc:

| Plik                            | URL |
| ------------------------------- | --- |
| `src/app/index.tsx`             | `/` |
| `src/app/(onboarding)/index.tsx`| `/` |

expo-router nie rzuca tu błędu (to różne katalogi), tylko rozstrzyga remis
**podobieństwem grup do aktualnych segmentów** (`similarToPreviousA/B`
w `getStateFromPath-forks.js`). Czyli: gdy użytkownik jest wewnątrz
`(onboarding)`, `router.replace("/")` trafia w `(onboarding)/index.tsx`, a nie w home.

### Pętla krok po kroku

1. `step-summary` → „Zaczynamy! 🚀” → `completeOnboarding()` → `hasCompletedOnboarding = true`
2. `submitOnboarding` → `router.replace("/")` → dopasowane do `(onboarding)/index.tsx`
3. `<Redirect>` → `/(onboarding)/step-name` → segmenty nadal `["(onboarding)", ...]`
4. Efekt w `RootLayout`: `hasCompletedOnboarding && inOnboarding` → `router.replace("/")`
5. Wracamy do kroku 2 → nieskończona seria aktualizacji stanu Stacka w `OnboardingLayout`
   → React przerywa: *Maximum update depth exceeded*.

### Przyczyny poboczne (wzmacniają problem)

- **Podwójna nawigacja** – po zakończeniu onboardingu `replace("/")` wołają jednocześnie
  `useOnboarding.submitOnboarding` i efekt w `RootLayout`. Dwa źródła prawdy dla tej samej decyzji.
- **Imperatywny guard w `useEffect`** zależny od `segmentsKey` – każda zmiana segmentów
  odpala go ponownie; nie ma warunku „jestem już u celu”, więc łatwo o pętlę.
- `src/app/splash.tsx` jest jednocześnie **routem** i **komponentem overlay** importowanym w
  `_layout.tsx`; `useSplashScreen` w trybie standalone też robi `router.replace(...)` – trzecie
  źródło nawigacji. Nie powoduje tego błędu, ale to ta sama klasa ryzyka.

> Uwaga: diagnoza wynika z analizy kodu i źródeł expo-router, nie z uruchomienia aplikacji
> na urządzeniu. Weryfikacja na symulatorze jest częścią planu (krok 6).

## Plan naprawy

### Opcja A – minimalna (rekomendowana na teraz)

1. **Model/typy** – `src/schemas/navigation.schema.ts`:
   - `OnboardingGuardInputSchema` (`isHydrated`, `isSplashActive`, `hasCompletedOnboarding`,
     `segments: string[]`) + `type OnboardingGuardInput`
   - `type OnboardingRedirect = "/" | "/(onboarding)/step-name" | null`
2. **Testy (najpierw, mają failować)**:
   - `src/lib/__tests__/onboarding-redirect.test.ts` – czysta funkcja
     `resolveOnboardingRedirect(input)`:
     - nie ukończony + poza onboardingiem → `"/(onboarding)/step-name"`
     - nie ukończony + w onboardingu → `null`
     - ukończony + w onboardingu → `"/"`
     - ukończony + na home (`[]`) → `null` (idempotencja – brak pętli)
     - `!isHydrated` lub splash aktywny → `null`
   - `src/app/__tests__/routes-structure.test.ts` – skanuje `src/app`, usuwa segmenty grup
     i sprawdza, że **żadne dwa pliki nie mapują się na ten sam URL** (regresja na przyszłość).
   - `src/app/__tests__/layout.test.tsx` – dopisać przypadek: po zmianie
     `hasCompletedOnboarding` na `true` w segmentach onboardingu `replace` wołany **dokładnie raz**.
   - `src/hooks/__tests__/use-onboarding.test.ts` – `submitOnboarding` zapisuje dane i
     **nie** wywołuje `router.replace` (nawigacją zarządza tylko guard).
3. **Implementacja**:
   - Usunąć `src/app/(onboarding)/index.tsx` (jedyny konflikt na `/`; nic w kodzie nie
     nawiguje do `/(onboarding)` bez kroku).
   - Dodać `src/lib/onboarding-redirect.ts` z `resolveOnboardingRedirect` i użyć jej w efekcie
     `RootLayout` – jedno miejsce decyzji.
   - Usunąć `router.replace("/")` z `submitOnboarding` w `use-onboarding.ts`.
4. `npm test` – wszystkie testy zielone. Jedyna zmieniona istniejąca asercja: `use-onboarding.test.ts`
   (`submitOnboarding` → `replace("/")`), bo opisywała usuwane podwójne przekierowanie.
5. `npx tsc --noEmit` oraz `npm run lint` – czysto.
6. Weryfikacja ręczna na symulatorze iOS: splash → onboarding (4 kroki) → „Zaczynamy!” →
   home bez błędu; restart; przejście „Wstecz” na każdym kroku.

### Opcja B – docelowa (większa zmiana)

Zamiast imperatywnego `useEffect` użyć deklaratywnego guarda expo-router
`Stack.Protected` (`guard={!hasCompletedOnboarding}` dla `(onboarding)`,
`guard={hasCompletedOnboarding}` dla reszty ekranów). Router sam przekierowuje, efekt w
`RootLayout` znika całkowicie. Wymaga sprawdzenia dokumentacji v57, przepisania
`layout.test.tsx` pod nowy mock `Stack.Protected` i przemyślenia współpracy z overlayem splash.
Kroki 1 (usunięcie `(onboarding)/index.tsx`) i usunięcie `replace` z `submitOnboarding`
są wspólne dla obu opcji.

### Poza zakresem (do osobnego zadania)

- Przeniesienie komponentu splash z `src/app/splash.tsx` do `src/components/splash/`
  i rozdzielenie go od routa, żeby overlay nie niósł logiki nawigacji.

## Pytanie przed startem

Którą opcję wybierasz – **A** (minimalna, szybka, niskie ryzyko) czy **B** (`Stack.Protected`)?

## Status (wybrana opcja A)

- [x] 1. Schemat + typy nawigacji (`OnboardingRedirectRouteSchema`, `OnboardingGuardInputSchema`)
- [x] 2. Testy: `onboarding-redirect.test.ts`, `routes-structure.test.ts`, nowy przypadek w
      `layout.test.tsx`, `use-onboarding.test.ts`, `navigation.schema.test.ts`
- [x] 3. Implementacja: usunięty `(onboarding)/index.tsx`, `src/lib/onboarding-redirect.ts`,
      guard w `_layout.tsx`, bez `replace` w `submitOnboarding`
- [x] 4. `npm test` – 46 suites / 279 testów zielone
- [x] 5. `npx tsc --noEmit` + `npm run lint` – czysto
- [x] 6. Symulator (iPhone 16 Plus, Expo Go): splash → 4 kroki → „Zaczynamy!” → home, bez błędu.
      Nie sprawdzono ręcznie „Wstecz” na każdym kroku.

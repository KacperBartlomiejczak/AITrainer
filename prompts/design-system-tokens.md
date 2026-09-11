# Design System & Tokeny CSS / Tailwind (Hevy Dark Theme)

## Pliki przeczytane i zanalizowane (Read Files)
1. `AGENTS.md` – Zasady projektowe, wytyczne architektury, kolejność wdrażania (Zod schema -> Typy -> Testy -> Implementacja), wymogi NativeWind/TypeScript.
2. `package.json` – Zależności (NativeWind v4, Tailwind CSS v3.4, Expo v57, React Native 0.86).
3. `tailwind.config.js` – Obecna konfiguracja Tailwind (ścieżki content i theme).
4. `metro.config.js` – Konfiguracja Metro bundlera z NativeWind.
5. `babel.config.js` – Presety Babel dla NativeWind.
6. `src/app/global.css` – Globalne style CSS i definicje `@tailwind`.
7. `src/app/_layout.tsx` – Główny layout aplikacji.
8. `example/src/constants/theme.ts` & `example/src/global.css` – Dotychczasowe tokeny referencyjne.

---

## Plan Implementacji (Implementation Plan)

### 1. Model Danych i Walidacja Zod (`src/schemas/theme.schema.ts` oraz `src/theme/types.ts`)
- Definicja kompletnych schematów Zod dla całego systemu designu:
  - `ColorTokensSchema` (Backgrounds, Surfaces, Primary/Hevy Blue, PR/Success Green, RPE Amber, Danger Red, Info Purple, Text Hierarchy, Border Hierarchy).
  - `SpacingTokensSchema` (Siatka 4px/8px: none, 3xs, 2xs, xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl).
  - `RadiusTokensSchema` (none, xs, sm, md, lg, xl, 2xl, 3xl, full).
  - `TypographyTokensSchema` (fontSizes, fontWeights, lineHeights).
  - `ThemeSchema` (połączony schemat motywu).
- Wyeksportowanie inferowanych typów TypeScript (`ThemeTokens`, `ColorTokens`, `SpacingTokens`, `RadiusTokens`, `TypographyTokens`).

### 2. Zestaw Testów Jednostkowych (`src/theme/__tests__/theme.test.ts`)
- Test walidacji obiektu tokenów przez Zod `safeParse()`.
- Test poprawności wszystkich wartości hex kolorów, jednostek spacingu i radiusów.
- Test dostępności kluczowych tokenów wykorzystywanych w widokach treningowych klona Hevy (np. kolory serii PR, tła OLED black, kolory kart, statusy RPE).

### 3. Implementacja Tokenów i Stałych (`src/theme/tokens.ts` oraz `src/constants/theme.ts`)
- Zbudowanie kompletnego słownika tokenów w TypeScript zgodnego ze schematem Zod.
- Walidacja `safeParse()` przy eksporcie tokenów z `src/theme/tokens.ts`.

### 4. Zmienne CSS w `src/app/global.css`
- Definicja zmiennych CSS w bloku `:root` / `.dark` dla natywnego wsparcia NativeWind i przeglądarki:
  - `--color-bg-app`, `--color-surface-card`, `--color-surface-elevated`, `--color-primary`, `--color-pr`, `--color-danger`, itd.
  - `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`, itd.
  - `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`, itd.

### 5. Konfiguracja Tailwind (`tailwind.config.js`)
- Rozszerzenie motywu (`theme.extend`):
  - Mapowanie kolorów semantycznych (np. `bg-surface-card`, `text-primary-blue`, `border-border-subtle`, `bg-pr-emerald`).
  - Rozszerzenie paddingów/marginów (`spacing`).
  - Rozszerzenie zaokrągleń (`borderRadius`).
- Aktualizacja `content` do: `["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"]`.

### 6. Synchronizacja i Weryfikacja (`metro.config.js`, `_layout.tsx`)
- Upewnienie się, że `metro.config.js` wskazuje poprawny plik wejściowy CSS (`./src/app/global.css`).
- Import `global.css` w `src/app/_layout.tsx`.
- Weryfikacja `npx tsc --noEmit` i `npm run lint`.

---

## Szczegółowa specyfikacja kolorów (Hevy Dark Theme):

| Nazwa tokenu | Wartość Hex / CSS | Przeznaczenie |
|---|---|---|
| `background.app` | `#000000` (Pure OLED Black) | Główne tło ekranów i logera treningowego |
| `surface.card` | `#121214` / `#161618` | Karty ćwiczeń, wiersze serii, kafelki statystyk |
| `surface.elevated` | `#1E1E22` | Modale, bottom sheety, selektory |
| `surface.highlight` | `#28282E` | Stan wciśnięcia (press/hover) kart i elementów |
| `primary.default` | `#007AFF` (Hevy Electric Blue) | Główne akcje: "Zakończ trening", "Dodaj ćwiczenie", aktywne taby |
| `primary.hover` | `#258CFF` | Podświetlenie głównego przycisku |
| `primary.muted` | `rgba(0, 122, 255, 0.15)` | Tła tagów/odznak ćwiczeń |
| `accent.pr` | `#22C55E` (Emerald/Green) | Rekordy personalne (PR), zaliczone serie |
| `accent.warmup` | `#F59E0B` (Amber) | Serie rozgrzewkowe, powiadomienia RPE |
| `accent.drop` | `#EF4444` (Crimson Red) | Drop-sety, serie do upadku, usuwanie |
| `accent.rest` | `#8B5CF6` (Purple) | Timer odpoczynku, wykresy objętości |
| `text.primary` | `#FFFFFF` | Nazwy ćwiczeń, ciężar, powtórzenia |
| `text.secondary` | `#A1A1AA` (Zinc 400) | Podpisy partii mięśniowych, daty |
| `text.muted` | `#71717A` (Zinc 500) | Jednostki (kg/lbs), placeholder |
| `border.subtle` | `#27272A` | Separatory serii w tabeli ćwiczeń |
| `border.medium` | `#3F3F46` | Ramki inputów (ciężar, powtórzenia) |
| `border.focus` | `#007AFF` | Aktywne pole wprowadzania danych |

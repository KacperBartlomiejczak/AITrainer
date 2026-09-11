# Inicjalizacja Shadcn UI oraz Ekran Główny Aplikacji (Home Screen)

## 1. Przeczytane i zanalizowane pliki (Read Files)
1. `AGENTS.md` – Zasady projektowe, wytyczne architektury, kolejność wdrażania (Zod schema -> Typy -> Testy -> Implementacja), wymóg braku typów `any`, język polski w interfejsie użytkownika, podział komponentów powyżej 100 linii, logika w `./src/hooks`, czarne motywy OLED (Hevy Dark Theme).
2. `package.json` – Zależności (NativeWind v4, Tailwind CSS v3.4, Expo v57, React 19, React Native 0.86, Zod 4.6).
3. `tailwind.config.js` – Skonfigurowane tokeny kolorów OLED, akcentów Hevy Electric Blue, stanów serii, spacingu i zaokrągleń.
4. `src/app/global.css` – Zmienne CSS design systemu.
5. `src/app/_layout.tsx` & `src/app/index.tsx` – Główny layout i dotychczasowy punkt wejścia.
6. `tsconfig.json` – Aliasy ścieżek `@/*` i `@/assets/*`.
7. `prompts/design-system-tokens.md` – Wcześniejsze założenia tokenów motywu.
8. `.agents/skills/frontend-design/SKILL.md` – Zasady nowoczesnego projektowania UI, hierarchia typograficzna, responsywność i mikrointerakcje.

---

## 2. Plan Implementacji i Status Wykonania (Status: ZREALIZOWANO ✅)

- [x] **Krok 1: Instalacja niezbędnych zależności**
  - Pakiety narzędziowe Shadcn: `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react-native`.
  - Konfiguracja środowiska testowego (`jest`, `jest-expo`, `test-renderer`, `@testing-library/react-native`, `@types/jest`) i skryptu `npm test`.

- [x] **Krok 2: Modele danych i schematy Zod (`src/schemas/` i `src/types/`)**
  - `src/schemas/user.schema.ts` & `src/types/user.ts`: `UserProfileSchema`.
  - `src/schemas/workout.schema.ts` & `src/types/workout.ts`: `WorkoutSummarySchema`, `RecentActivitySchema`.
  - `src/schemas/ai-coach.schema.ts` & `src/types/ai-coach.ts`: `AiCoachTipSchema`.
  - `src/schemas/home.schema.ts` & `src/types/home.ts`: `HomeScreenDataSchema`.

- [x] **Krok 3: Inicjalizacja biblioteki komponentów Shadcn UI (`src/lib/` & `src/components/ui/`)**
  - `src/lib/utils.ts`: Funkcja pomocnicza `cn(...)` (clsx + tailwind-merge).
  - `src/components/ui/button.tsx`: Przycisk CVA (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `pr`).
  - `src/components/ui/card.tsx`: Komponenty `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
  - `src/components/ui/badge.tsx`: Odznaki dla statusów (`default`, `secondary`, `pr`, `warmup`, `rest`, `destructive`, `outline`).
  - `src/components/ui/progress.tsx`: Pasek postępu z płynnym wypełnieniem.
  - `src/components/ui/avatar.tsx`: Avatar użytkownika z fallbackiem inicjałów.
  - `src/components/ui/separator.tsx`: Dyskretny separator wierszy.
  - `src/components/ui/typography.tsx`: Semantyczne komponenty typograficzne (`H1`, `H2`, `H3`, `TextMuted`, `TextLead`, itp.).

- [x] **Krok 4: Zestaw Testów Jednostkowych (`src/__tests__/` & `src/schemas/__tests__/`)**
  - Testy schematów Zod (`src/schemas/__tests__/schemas.test.ts`).
  - Testy funkcji pomocniczej `cn(...)` (`src/lib/__tests__/utils.test.ts`).
  - Testy komponentów Shadcn (`src/components/ui/__tests__/ui.test.tsx`).
  - Testy hooka `useHomeScreen` (`src/hooks/__tests__/use-home-screen.test.ts`).
  - Test integracyjny ekranu głównego (`src/app/__tests__/index.test.tsx`).

- [x] **Krok 5: Logika i Custom Hook (`src/hooks/use-home-screen.ts`)**
  - Odseparowanie logiki biznesowej i stanu ekranu głównego od warstwy prezentacyjnej.
  - Walidacja danych wejściowych za pomocą `HomeScreenDataSchema.safeParse()`.

- [x] **Krok 6: Podział komponentów ekranu głównego (`src/components/home/`)**
  - `HomeHeader.tsx`: Przywitanie ("Cześć, Kacper! 👋"), avatar i odznaka passy dni treningowych ("🔥 4 dni").
  - `AiCoachCard.tsx`: Karta Mentora AI z dynamiczną poradą i przyciskiem dialogu.
  - `TodayWorkoutCard.tsx`: Wyróżniony dzisiejszy trening (np. "Klatka + Triceps", czas, liczba ćwiczeń, CTA "Rozpocznij Trening 🔥").
  - `WeeklyProgressCard.tsx`: Tygodniowy cel treningowy (np. 3/4 treningi, miniatury dni tygodnia, pasek postępu).
  - `QuickActionsGrid.tsx`: Szybkie skróty akcji (Pusty trening, Baza ćwiczeń, Plan AI, Historia & Statystyki).
  - `RecentActivitySection.tsx`: Ostatni trening z osiągniętymi rekordami osobistymi (PR).

- [x] **Krok 7: Złożenie ekranu głównego (`src/app/index.tsx` & `src/app/_layout.tsx`)**
  - Integracja komponentów w czystym widoku przewijanym z obsługą `SafeAreaView`, `RefreshControl` i czarnym tłem OLED (`#000000`).

- [x] **Krok 8: Weryfikacja jakości**
  - `npm test`: 26/26 testów przeszło pomyślnie.
  - `npx tsc --noEmit`: 0 błędów typowania.
  - `npm run lint`: 0 błędów i ostrzeżeń.

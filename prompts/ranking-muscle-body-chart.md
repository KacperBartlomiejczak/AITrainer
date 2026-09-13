# Plan: System Rankingowy & Wykres Ciała z Podziałem na Partie Mięśniowe

## Pliki, które przeczytałem

- `src/schemas/user-profile-screen.schema.ts` — istniejąca definicja `StrengthLeagueIdSchema`, `STRENGTH_LEAGUES` (brązowa, srebrna, złota, platynowa, diamentowa [100kg], mistrzowska, tytanowa) oraz `calculateStrengthLeague(benchPressKg)`.
- `src/schemas/navigation.schema.ts` — schemat zakładek nawigacji `NavTabIdSchema` (home, workouts, profile), `NavItemSchema`, `NavTabListSchema`.
- `src/schemas/onboarding.schema.ts` — kanoniczne partie mięśniowe w aplikacji `MuscleGroupSchema` (`chest`, `back`, `legs`, `shoulders`, `arms`, `abs`) oraz etykiety `MUSCLE_GROUP_LABELS`.
- `src/components/navigation/PillNavbar.tsx` & `PillNavItem.tsx` — pływający dolny pasek nawigacji i obsługa ikon Lucide (`Home`, `Dumbbell`, `User`).
- `src/hooks/use-pill-navigation.ts` — hook zarządzający aktywną zakładką i trasami nawigacji.
- `src/hooks/use-user-profile-screen.ts` — dane profilu, rekordy siłowe (100 kg na klatę = Diamentowa Liga) oraz statystyki.
- `src/app/user-profile.tsx` & `src/components/user-profile/ProfileHeaderWithBadges.tsx` — dotychczasowa prezentacja rang i odznak ligowych.
- `package.json` — potwierdzenie zainstalowanej biblioteki `react-native-svg: 15.15.4` do renderowania wektorowego modelu ciała, `lucide-react-native`, `zod` i `nativewind`.

---

## Co chce użytkownik

1. **Nowa zakładka w nawigacji**:
   - Dodanie zakładki **Ranking** / **Rangi** (ikona np. `Trophy`) do pływającego paska `PillNavbar`.
   - Nowy ekran `/ranking` (`src/app/ranking.tsx`).
2. **System rankingowy ("kto ma jaką rangę")**:
   - Tabela ligowa / ranking użytkowników z podziałem na ligi (Diamentowa, Złota, Srebrna, itd.), pozycją, avatarem, punktacją i najlepszą partią mięśniową.
   - Wyraźne oznaczenie pozycji aktualnego użytkownika ("Kacper (Ty)").
3. **Wykres / model sylwetki człowieka (Anatomical Body Chart)**:
   - Wektorowa sylwetka człowieka (SVG) z podziałem na kluczowe partie mięśniowe (`chest`, `back`, `legs`, `shoulders`, `arms`, `abs`).
   - Przełącznik widoku: **Przód (Front)** / **Tył (Back)**.
   - Każda partia mięśniowa świeci / jest pokolorowana kolorem odpowiadającym jej randze (np. 100 kg na klatę = kolor Diamentowej Ligi `#818CF8`).
   - Interaktywność: kliknięcie w partię ciała (lub chip) zaznacza ją i wyświetla szczegółową kartę rangi danej partii.
4. **Karta i symulator siły danej partii**:
   - Wyświetla aktualną wagę (PR kg), aktualną ligę z ikoną, ćwiczenie bazowe (np. Wyciskanie sztangi: 100 kg).
   - Pasek postępu do kolejnej ligi (np. ile kg brakuje do Mistrzowskiej Ligi).
   - Proste przyciski do symulacji ciężaru (-5kg / +5kg / input), aby użytkownik mógł przetestować na żywo: "jeśli wpiszę 100 kg na klatę -> wskakuje Diamentowa Liga i klatka na modelu zmienia kolor!".

---

## Plan Implementacji

### Krok 1: Model Danych i Zod Schema (`src/schemas/ranking.schema.ts`) [x]
- [x] Zdefiniowanie standardów siłowych dla każdej partii mięśniowej (`chest`, `back`, `legs`, `shoulders`, `arms`, `abs`)
- [x] Funkcje kalkulacji: `calculateMuscleLeague`, `calculateNextLeagueProgress`, `calculateOverallRank`
- [x] Schematy Zod: `MuscleRankItemSchema`, `LeaderboardUserSchema`, `RankingScreenDataSchema`

### Krok 2: Testy jednostkowe dla Schematów i Kalkulatorów [x]
- [x] Utworzenie `src/schemas/__tests__/ranking.schema.test.ts` (13/13 testów zaliczonych)
- [x] Potwierdzenie reguły: 100 kg na klatę = Diamentowa Liga (`diamond`, `#818CF8`)

### Krok 3: Aktualizacja Schematu Nawigacji i Paska PillNavbar [x]
- [x] `src/schemas/navigation.schema.ts`: dodanie `"ranking"`, `"Trophy"` i `min(3).max(5)`
- [x] `src/components/navigation/PillNavItem.tsx`: obsługa ikony `Trophy`
- [x] `src/hooks/use-pill-navigation.ts`: dodanie zakładki Ranking do `DEFAULT_NAV_TABS`
- [x] Zaktualizowanie testów nawigacji (13/13 testów zaliczonych)

### Krok 4: Hook Stanu i Logiki (`src/hooks/use-ranking-screen.ts`) [x]
- [x] Utworzenie hooka zarządzającego widokami, modelem ciała SVG, partiami i symulacją PR
- [x] Utworzenie testów jednostkowych `src/hooks/__tests__/use-ranking-screen.test.ts` (7/7 testów zaliczonych)

### Krok 5: Komponenty UI (<100 linii na komponent) w `src/components/ranking/` [x]
- [x] `HumanBodyDiagram.tsx` — wektorowy model człowieka SVG z podświetlaniem partii kolorem ligi i przełącznikiem przód/tył
- [x] `MuscleRankCard.tsx` — karta wybranej partii z symulatorem wagowym (-5kg / +5kg) i paskiem do kolejnej ligi
- [x] `MuscleSelectorPills.tsx` — poziome chipy z partiami i kropkami kolorów lig
- [x] `RankingLeaderboard.tsx` — tabela ligowa użytkowników i filtry lig
- [x] `RankingHeader.tsx` — nagłówek z rangą globalną i 3-stopniowym przełącznikiem
- [x] `LeagueStandardsModal.tsx` — modal z opisem wszystkich 7 lig i wymaganiami
- [x] `index.ts` — czysty eksport komponentów
- [x] Testy komponentów `src/components/ranking/__tests__/ranking-components.test.tsx` (6/6 testów zaliczonych)

### Krok 6: Ekran `/ranking` (`src/app/ranking.tsx`) [x]
- [x] Integracja komponentów z `useRankingScreen`
- [x] Dołączenie `<PillNavbar activeTab="ranking" />`
- [x] Testy ekranu `src/app/__tests__/ranking.test.tsx` (3/3 testów zaliczonych)

### Krok 7: Weryfikacja i Walidacja [x]
- [x] `npm test` — 44/44 suitów, 266/266 testów zaliczonych
- [x] `npx tsc --noEmit` — 0 błędów typowania
- [x] `npm run lint` — 0 błędów, 0 ostrzeżeń

---

## Wynik
Wszystkie zadania zostały w pełni zrealizowane zgodnie z założeniami i zasadami projektu.

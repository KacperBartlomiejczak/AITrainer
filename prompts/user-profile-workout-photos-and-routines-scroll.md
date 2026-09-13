# Refaktor Profilu: Zdjęcia Treningów bez Zaokrągleń & Poziomy Scroll Rutyn

## Przeczytane pliki (Research)
- `AGENTS.md` — Wytyczne projektowe: TDD, reguła <100 linii na komponent, hooki w `./src/hooks`, Zod jako źródło prawdy, brak `any`, zakaz modyfikacji istniejących niepowiązanych testów, weryfikacja `npm test`, `npx tsc --noEmit`, `npm run lint`.
- `src/components/user-profile/RecentCompletedWorkouts.tsx` — Aktualna implementacja ostatnich treningów z ciemnym tłem o niskiej przezroczystości (opacity-35) zamiast wyraźnego zdjęcia na samej górze.
- `src/components/user-profile/UserRoutinesList.tsx` — Aktualny pionowy stos kart rutyn wymagający zamiany na poziomo przewijaną listę kart.
- `src/components/user-profile/RoutinePhotoCarousel.tsx` — Górna karuzela zdjęć z rutyn/treningów wymagająca `rounded-none` (zero zaokrągleń).
- `src/components/user-profile/__tests__/user-profile-components.test.tsx` — Testy komponentów UI profilu.
- `src/app/user-profile.tsx` — Ekran profilu integrujący komponenty.

---

## Zidentyfikowane Problemy i Wymagania Użytkownika

1. **Ostatnie wykonane treningi (`RecentCompletedWorkouts`)**:
   - Poprzednio zdjęcie było półprzezroczystą nakładką (`opacity-35`) pod tekstem w małym boksie `h-28`, co wyglądało nieestetycznie i nie pasowało do karty.
   - **Wymaganie**: Zdjęcie z treningu ma być na samej górze karty z **zerem zaokrągleń** (`rounded-none`), w pełnej jakości i wyrazistości (czysty kontener obrazu o odpowiednich proporcjach, bez zamazanego tekstu na zdjęciu). Poniżej zdjęcia znajdują się szczegóły treningu oraz poziomy scroll ćwiczeń.
2. **Rutyny treningowe (`UserRoutinesList`)**:
   - Poprzednio był to pionowy stos kart.
   - **Wymaganie**: Rutyny treningowe mają być kartami przewijanymi poziomo (`ScrollView horizontal`), z zachowaniem tytułów, partii mięśniowych, czasu i przycisku startu.
3. **Zdjęcia na samej górze (`RoutinePhotoCarousel`)**:
   - Zero zaokrągleń (`rounded-none`) dla surowej, nowoczesnej estetyki.

---

## Plan Implementacji Krok po Kroku

1. **Krok 1: Aktualizacja testów komponentów UI (`src/components/user-profile/__tests__/user-profile-components.test.tsx`)**
   - Dodanie asercji sprawdzających horyzontalny scroll rutyn (`testID="routines-horizontal-scroll"`).
   - Sprawdzenie poprawnego renderowania zdjęcia na górze karty z `rounded-none` i czystą prezentacją.
2. **Krok 2: Refaktoring `UserRoutinesList.tsx` (< 100 linii)**
   - Wdrożenie `ScrollView horizontal showsHorizontalScrollIndicator={false}` z kartami o stałej szerokości `w-64`.
3. **Krok 3: Refaktoring `RecentCompletedWorkouts.tsx` (< 100 linii)**
   - Umieszczenie pełnowymiarowego, ostrego zdjęcia ćwiczenia/treningu na samej górze karty z `rounded-none`.
   - Czysty podział: Góra -> Zdjęcie (`rounded-none`, `h-44`), Środek -> Nagłówek i data, Dół -> Przewijana palcem lista wykonanych serii.
4. **Krok 4: Refaktoring `RoutinePhotoCarousel.tsx` (< 100 linii)**
   - Zdjęcia z `rounded-none` (zero zaokrągleń).
5. **Krok 5: Weryfikacja jakościowa**
   - `npm test` — wszystkie 40 zestawów testów musi przejść.
   - `npx tsc --noEmit` — zero błędów typowania.
   - `npm run lint` — zero błędów i ostrzeżeń.

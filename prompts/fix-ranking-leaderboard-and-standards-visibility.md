# Plan: Poprawa Widoczności i Dostępności Tabeli Rankingu oraz Standardów Siłowych

## Pliki, które przeczytałem

- `src/app/ranking.tsx` — główny ekran rankingu i warunki renderowania widoków (`chart`, `leaderboard`, `standards`).
- `src/components/ranking/RankingHeader.tsx` — segmented switcher zakładek, w którym `transition-all` oraz umiejscowienie mogły utrudniać przełączanie na urządzeniach mobilnych/webie.
- `src/components/ranking/RankingLeaderboard.tsx` — tabela liderów; użycie `toLocaleString("pl-PL")` mogło powodować błędy w silniku Hermes.
- `src/components/ranking/LeagueStandardsModal.tsx` — modal standardów.
- `src/schemas/ranking.schema.ts` — pełna konfiguracja `MUSCLE_BENCHMARK_CONFIGS` ze wszystkimi progami dla 7 partii.

---

## Co zgłosił użytkownik

"Dobra spojrz jeszcze porosze na Tabela rankingi oraz Standardy bo nie mozna tego zobaczyc"

---

## Rozwiązane problemy

1. **Przełącznik widoków (Segmented Switcher)**:
   - [x] Przeniesiono pasek przełącznika widoków na samą górę `RankingHeader` (tuż pod tytułem ekranu).
   - [x] Usunięto problematyczną klasę `transition-all` blokującą zdarzenia dotyku w React Native / Nativewind.
   - [x] Dodano `hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}` oraz wyraźny feedback `active:opacity-90`.

2. **Bezpieczne formatowanie liczb i filtr w Tabeli Rankingu**:
   - [x] Zastąpiono `toLocaleString("pl-PL")` odpornym na silnik Hermes regexem formatowania tysięcy `totalScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")`.
   - [x] Dodano nagłówek "🏆 Oficjalna Tabela Rankingu Społeczności" z opisem.
   - [x] Usunięto `transition-all` z filtrów ligowych w tabeli i dodano `hitSlop`.

3. **Dedykowany widok Pełnych Standardów Siłowych (`RankingStandardsView.tsx`)**:
   - [x] Stworzono `MuscleStandardCard.tsx` prezentujący progi wagowe dla wszystkich 7 lig w danym ćwiczeniu bazowym z wyróżnieniem Diamentowej Ligi (≥ 100 kg na klatę).
   - [x] Stworzono `RankingStandardsView.tsx` z filtrami poziomymi dla wszystkich 7 partii mięśniowych (Klatka, Plecy, Nogi, Barki, Biceps, Triceps, Brzuch) i banerem informacyjnym.

4. **Szybkie skróty w widoku wykresu sylwetki (`chart`)**:
   - [x] Dodano pod kartą mięśnia dwie duże, wyraziste karty nawigacyjne:
     - "🏆 Tabela Rankingu Społeczności" -> przełącza na tabelę liderów.
     - "📜 Wszystkie Standardy Siłowe" -> przełącza na pełny wykaz progów wagowych.

---

## Status Zadań Implementacyjnych

- [x] **Krok 1**: Nowy komponent `MuscleStandardCard.tsx` i `RankingStandardsView.tsx` (oba <100 linii).
- [x] **Krok 2**: Usprawnienie `RankingHeader.tsx` (pasek na samej górze, usunięcie `transition-all`, powiększone touch targets).
- [x] **Krok 3**: Poprawa `RankingLeaderboard.tsx` (bezpieczne formatowanie, brak `transition-all`, baner).
- [x] **Krok 4**: Aktualizacja `src/app/ranking.tsx` (renderowanie `RankingStandardsView` i dodanie kart-skrótów).
- [x] **Krok 5**: Testy jednostkowe komponentów (`ranking-components.test.tsx` - 8 testów, `ranking.test.tsx` - 5 testów: 13/13 passed).
- [x] **Krok 6**: Weryfikacja projektu (`npx tsc --noEmit` - 0 błędów, `npm run lint` - 0 błędów).

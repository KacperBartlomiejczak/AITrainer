# Poprawa Przewijania Kart i Pełnej Szerokości Zdjęcia w Kartach Treningów

## Przeczytane pliki (Research)
- `AGENTS.md` — Zasady architektury: TDD, pliki komponentów poniżej 100 linii kodu, `useWindowDimensions`, brak `any`, weryfikacja `npm test`, `npx tsc --noEmit`, `npm run lint`.
- `src/components/user-profile/WorkoutHistoryCard.tsx` (128 linii — wymaga podziału < 100 linii).
- `src/components/user-profile/WorkoutExercisesSlide.tsx` (46 linii).
- `src/components/user-profile/WorkoutAchievementsSlide.tsx` (52 linii).
- `src/components/user-profile/RecentCompletedWorkouts.tsx` (30 linii).
- `src/components/user-profile/__tests__/user-profile-components.test.tsx` (278 linii).

---

## Analiza Problemu (Dlaczego nie scrollowało i zdjęcie miało ~80% szerokości)

1. **Szerokość zdjęcia (~80% szerokości karty):**
   - Poprzednio zdefiniowano stałą `SLIDE_WIDTH = 320`.
   - Na nowoczesnych ekranach (np. 390px - 430px) po odjęciu marginesów karta ma ~360-400px szerokości. 320px stanowiło dokładnie ~80% szerokości karty, pozostawiając 20% pustej przestrzeni po prawej stronie.
   - Wymaga to dynamicznego dopasowania: slajdy i zdjęcia muszą mieć dokładnie `width: cardWidth` (100% szerokości wewnętrznej karty).

2. **Złe przewijanie ("nie scrollują się tak jak trzeba"):**
   - W React Native na iOS jednoczesne użycie `pagingEnabled={true}` oraz `snapToInterval={cardWidth}` powoduje konflikt w natywnym silniku przewijania `UIScrollView` (szarpanie, podwójne zatrzymywanie).
   - Na Androidzie brak `nestedScrollEnabled={true}` w poziomym `ScrollView` umieszczonym wewnątrz pionowego `ScrollView` powodował przechwytywanie gestów przewijania poziomego przez pionowy kontener.
   - Paginacja w kartach działa znacznie płynniej z `pagingEnabled={true}`, `nestedScrollEnabled={true}`, bez konfliktującego `snapToInterval`.
   - Dodanie wskaźnika kropek (`● ○ ○`) na dole karty daje natychmiastowy feedback, na którym slajdzie jest użytkownik.

---

## Plan Implementacji Krok po Kroku

### 1. Rozbicie komponentu `WorkoutHistoryCard.tsx` na podkomponenty (< 100 linii)
- Utworzenie `WorkoutCoverSlide.tsx` (~50 linii):
  - Przyjmuje `workout`, `cardWidth`, `activeSlide`, `totalSlides`.
  - Zdjęcie i kontener mają precyzyjne `style={{ width: cardWidth, height: 192 }}` (100% szerokości karty, bez żadnych ucięć).
  - Tagi z czasem trwania, datą oraz tonażem (`totalVolumeKg`).
- Uporządkowanie `WorkoutHistoryCard.tsx` (~70 linii):
  - `nestedScrollEnabled={true}` dla stabilnego przewijania w zagnieżdżonym ScrollView na Androidzie.
  - Czyste `pagingEnabled={true}` na poziomie ScrollView dopasowane do szerokości `cardWidth`.
  - Szerokość ScrollView i każdego ze slajdów ustalona na `cardWidth`.
  - Wskaźnik paginacji kropek na dole karty.

### 2. Rozszerzenie testów w `src/components/user-profile/__tests__/user-profile-components.test.tsx`
- Test weryfikujący pełną szerokość i reakcję na zmianę slajdu (scroll event).

### 3. Weryfikacja
- `npm test`
- `npx tsc --noEmit`
- `npm run lint`

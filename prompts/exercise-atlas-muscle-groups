# Plan: Karty ćwiczeń z podziałem na partie mięśniowe

## Pliki które przeczytałem

- `src/components/exercises/ExerciseCard.tsx` — istniejąca karta (lista pozioma)
- `src/components/exercises/ExercisePreviewModal.tsx` — modal podglądu z GIF
- `src/components/exercises/ExerciseFilterChips.tsx` — chipy filtrowania
- `src/components/exercises/__tests__/exercises-components.test.tsx` — testy
- `src/schemas/exercise-catalog.schema.ts` — Zod schemat CatalogExercise
- `src/hooks/use-exercise-catalog.ts` — hook z 9 ćwiczeniami + logika filtrowania
- `src/lib/exercise-assets.ts` — mapa asset ID → require()
- `src/app/exercises.tsx` — ekran "Baza Ćwiczeń"
- `src/app/workouts.tsx` — ekran "Treningi"
- `assets/data/exercises.schema.json` — schema JSON (body_part, gif_url, image, instructions.pl...)
- `assets/data/exercises.json` — ~17MB baza (placeholder - za duże do wczytania)

## Co chce użytkownik

1. Karty ćwiczeń z **obrazkiem** (thumbnail .jpg)
2. Po kliknięciu - podgląd **jak ćwiczenie wygląda** (GIF animacja)
3. Możliwość **podziału na partie mięśniowe**
4. Widoczne w sekcji **Trening** (workouts.tsx) ORAZ **Baza Ćwiczeń** (exercises.tsx)

## Analiza obecnego stanu

- ExerciseCard już wyświetla thumbnail i GIF w modalu ✓
- Filtrowanie przez ExerciseFilterChips istnieje ✓
- Ale: tylko 9 ćwiczeń w katalogu
- Potrzeba: **więcej ćwiczeń + lepszy UI kart w stylu siatki**

## Plan implementacji

### Krok 1: Rozszerzyć katalog ćwiczeń (Zod schema + typy) 

Powiększyć `INITIAL_CATALOG_EXERCISES` w hooku o ~30+ ćwiczeń 
pokrywających wszystkie partie: chest, back, legs, arms (upper/lower), 
shoulders, waist, cardio. Jednocześnie dodać asset mapy.

### Krok 2: Nowy komponent `ExerciseMuscleGroupSection`

Wyświetla sekcję partii mięśniowej z:
- Nagłówkiem (emoji + nazwa partii)
- Siatką 2-kolumnową kart ćwiczeń

### Krok 3: Nowy komponent `ExerciseGridCard`

Karta w układzie pionowym (grid):
- Duży thumbnail image (górna część)
- Overlay z play button
- Nazwa ćwiczenia
- Badge z targetem/kategorią
- Sprzęt

### Krok 4: Rozbudowa `ExercisePreviewModal`

- Dodać sekcję "Partie mięśniowe" (primary + secondary muscles)
- Dodać kroki instrukcji jako numbered list
- Pozostawić GIF jako główny element

### Krok 5: Zaktualizować `ExerciseFilterChips`

- Zmienić na wariant z emoji i grupowaniem partii:
  - 🏋️ Wszystkie
  - 💪 Klatka 
  - 🔙 Plecy
  - 🦵 Nogi
  - 💪 Ramiona
  - 🏃 Barki
  - 🎯 Brzuch
  - ❤️ Cardio

### Krok 6: Aktualizacja ekranu `exercises.tsx`

- Przełącznik widoku: Lista vs Siatka (GroupedByMuscle)
- W trybie "partii": ExerciseMuscleGroupSection × każda partia
- W trybie "lista": istniejący widok

### Krok 7: Dodać skrót w workouts.tsx

- Dodać sekcję "Atlas ćwiczeń" z siatką wybranych popularnych ćwiczeń
- 2x2 grid z 4 kategoriami, każda prowadzi do exercises.tsx z pre-set filtrem

### Krok 8: Testy

Napisać testy dla:
- ExerciseGridCard
- ExerciseMuscleGroupSection

## Kroki implementacji

1. ✅ Odczyt i analiza plików (done above)
2. ✅ Rozszerzyć asset map (`exercise-assets.ts`) o 30+ ćwiczeń
3. ✅ Rozszerzyć katalog ćwiczeń w hooku (`use-exercise-catalog.ts`)
4. ✅ Napisać testy dla nowych komponentów (`exercise-grid-components.test.tsx`)
5. ✅ Stworzyć `ExerciseGridCard.tsx`
6. ✅ Stworzyć `ExerciseMuscleGroupSection.tsx`
7. ✅ Zaktualizować `ExercisePreviewModal.tsx` (sekcja mięśni, kroki)
8. ✅ Zaktualizować `ExerciseFilterChips.tsx` (emoji, cardio)
9. ✅ Zaktualizować `exercises.tsx` (grid view + group by muscle)
10. ✅ Zaktualizować `workouts.tsx` (atlas sekcja z podglądem i modalem)
11. ✅ Eksportować nowe komponenty w `index.ts`
12. ✅ Uruchomić `npm test` i naprawić błędy (36/36 suitów, 200/200 testów zaliczonych)
13. ✅ Uruchomić `npx tsc --noEmit` i `npm run lint` (0 błędów, 0 ostrzeżeń)

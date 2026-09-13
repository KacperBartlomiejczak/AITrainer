# Fix: dopasowanie zdjęć/GIF-ów ćwiczeń do nazw

## Przeczytane pliki

- `src/hooks/use-exercise-catalog.ts` — katalog 39 ćwiczeń (`id`, `name`, `imageFile`, `gifFile`)
- `src/lib/exercise-assets.ts` — `EXERCISE_ASSET_MAP` (id → `require()` jpg/gif) + `getExerciseMedia`
- `src/schemas/exercise-catalog.schema.ts` — Zod schema katalogu
- `assets/data/exercises.json` + `exercises.schema.json` — źródłowy dataset (1324 ćwiczeń, `id` → `name` → `image`/`gif_url`)
- `src/components/exercises/ExerciseCard.tsx`, `ExerciseGridCard.tsx`, `ExercisePreviewModal.tsx`
- `src/components/home/FriendWorkoutFeedCard.tsx`, `src/lib/mock-friends-feed.ts` (`photoAssetKey: "0007"`)
- `src/db/seeds/builtin-routines.ts` — rutyny odwołują się do ćwiczeń po **nazwie**, nie po ID katalogu → zmiana ID jest bezpieczna dla SQLite
- testy: `src/schemas/__tests__/exercise-catalog.schema.test.ts`, `src/components/exercises/__tests__/*`

## Diagnoza (przyczyna)

Katalog został zbudowany tak, że polskim nazwom przypisano **kolejne ID z datasetu** (0022, 0026, 0030…),
a nie ID faktycznego ćwiczenia. Dataset jest spójny (zweryfikowane wizualnie: 0251 = dipy, 0586 = uginanie nóg leżąc,
0033 = wyciskanie na ławce ujemnej), więc błąd leży wyłącznie w naszym katalogu.

**20 z 39 ćwiczeń ma złe zdjęcie.** Każde z nich ma poprawny odpowiednik w datasecie (jpg + gif istnieją w `assets/`),
więc placeholder nie będzie potrzebny dla żadnego obecnego ćwiczenia — ale dodam go w modalu na przyszłość.

| Nazwa w aplikacji | Obecne ID → co pokazuje | Nowe ID → ćwiczenie w datasecie |
|---|---|---|
| Pompki szerokim rozstawem rąk | 0033 barbell decline bench press | **1311** wide hand push up |
| Wyciskanie hantli na ławce | 0035 barbell decline close grip to skull press | **0289** dumbbell bench press |
| Dipy na poręczach (klatka) | 0022 barbell pullover to press | **0251** chest dip |
| Rozpiętki z hantlami na ławce | 0036 barbell decline wide-grip press | **0308** dumbbell fly |
| Ściąganie drążka wyciągu pionowego | 0007 alternate lateral pulldown | **0198** cable pulldown |
| Wiosłowanie sztangą w opadzie tułowia | 0026 barbell bench squat | **0027** barbell bent over row |
| Podciąganie szerokim chwytem (nachwytem) | 0030 barbell close-grip bench press | **0652** pull-up |
| Wiosłowanie hantlem jednoręcznie | 0031 barbell curl | **0292** dumbbell one arm bent-over row |
| Ściąganie wyciągu dolnego do brzucha | 0032 barbell deadlift | **0180** cable low seated row |
| Martwy ciąg | 0034 barbell decline bent arm pullover | **0032** barbell deadlift |
| Przysiad z wyskokiem (masa własna) | 0053 barbell jump squat | **0514** jump squat |
| Wykrok ze sztangą | 0045 barbell guillotine bench press | **0054** barbell lunge |
| Prostowanie nóg na maszynie | 0046 barbell hack squat | **0585** lever leg extension |
| Uginanie nóg leżąc (maszyna) | 0048 barbell incline reverse-grip press | **0586** lever lying leg curl |
| Glute bridge (masa własna) | 0049 barbell incline row | **3013** low glute bridge on floor |
| Uginanie hantli ze skrętem nadgarstka | 0072 barbell prone incline curl | **0285** dumbbell alternate biceps curl |
| Triceps – prostowanie ramion na wyciągu | 0073 barbell pullover | **0201** cable pushdown |
| Dipy na ławce (triceps) | 0074 barbell rack pull | **0129** bench dip (knees bent) |
| Wyciskanie wąskim chwytem (triceps) | 0075 barbell rear delt raise | **0030** barbell close-grip bench press |
| Młotki (hammer curl) z hantlami | 0076 barbell rear delt row | **0313** dumbbell hammer curl |

Poprawne (bez zmian): 0025, 0047, 0043, 0070, 0977, 0978, 0993, 0997, 1022, 0979, 0001, 0002, 0003, 0006, 0009, 0010, 0517, 1160, 1201.

## Plan implementacji

### 1) Model danych (Zod)
- Brak zmian w `ExerciseCatalogSchema` — kształt danych jest dobry, złe są wartości.
- Dodaję w teście minimalny Zod schema `DatasetExerciseSchema` (`id`, `name`, `image`, `gif_url`) do walidacji
  `exercises.json` jako `unknown` → `safeParse` (bez `any`).

### 2) Testy (najpierw, mają failować na obecnym kodzie)
Nowy plik `src/lib/__tests__/exercise-assets.test.ts`:
- każde ćwiczenie z `INITIAL_CATALOG_EXERCISES` istnieje w `exercises.json` pod swoim `id`
- `imageFile` / `gifFile` katalogu == `image` / `gif_url` z datasetu dla tego `id`
- regresja nazw: mapa `id → oczekiwana angielska nazwa z datasetu` (tabela powyżej) — łapie ponowne pomieszanie
- `EXERCISE_ASSET_MAP` ma wpis dla każdego ID katalogu (poza kluczami nie-ćwiczeń, np. `example_past_photo`)
  i nie zawiera osieroconych ID ćwiczeń
- `getExerciseMedia("nieistniejace")` zwraca `null`
- test komponentu: `ExercisePreviewModal` renderuje placeholder, gdy brak mediów

### 3) Implementacja
- `use-exercise-catalog.ts`: podmiana `id`, `imageFile`, `gifFile` dla 20 ćwiczeń z tabeli; poprawa komentarza „42 ćwiczenia” → faktyczna liczba
- `exercise-assets.ts`: podmiana kluczy i ścieżek `require()` na nowe ID
- `mock-friends-feed.ts`: `photoAssetKey: "0007"` → `"0198"` (inaczej zdjęcie w feedzie zniknie)
- `ExercisePreviewModal.tsx`: placeholder (ikona + „Brak podglądu ćwiczenia”), gdy `media === null`
  (karty `ExerciseCard`/`ExerciseGridCard` już mają placeholder 🏋️)

### 4) Weryfikacja
- `npm test`, `npx tsc --noEmit`, `npm run lint`

## Kroki
- [x] Zod schema datasetu w teście + testy mapowania (failing)
- [x] Test placeholdera w modalu (failing)
- [x] Poprawa ID i ścieżek w katalogu
- [x] Poprawa `EXERCISE_ASSET_MAP`
- [x] Poprawa `mock-friends-feed.ts`
- [x] Placeholder w `ExercisePreviewModal` (wydzielony `ExerciseMediaPreview`)
- [x] Sprzęt 0070 → „Sztanga”
- [x] `npm test` / `tsc` / `lint` zielone
- [x] Commit `fix(exercises): match exercise media to catalog names`

## Decyzje użytkownika
1. „Uginanie przedramion na modlitewniku”: sprzęt „Sztanga łamana” → **„Sztanga”** (zgodnie z GIF 0070).
2. „Glute bridge”: wersja **z masą własną** (3013).
3. „Podciąganie szerokim chwytem”: **pull-up** (0652).

Dodatkowo: `ExercisePreviewModal.tsx` ma 188 linii → wydzielam podgląd mediów (GIF / placeholder) do `ExerciseMediaPreview.tsx`.

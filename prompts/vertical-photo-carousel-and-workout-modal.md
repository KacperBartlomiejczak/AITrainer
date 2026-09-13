# Karuzela Pionowych Zdjęć Treningów & Modal Szczegółów Treningu

## Przeczytane pliki (Research)
- `AGENTS.md` — Wytyczne projektowe: TDD, reguła <100 linii na komponent, hooki w `./src/hooks`, Zod jako jedyne źródło prawdy, brak `any`, zakaz modyfikacji niespójnych testów, weryfikacja `npm test`, `npx tsc --noEmit`, `npm run lint`.
- `assets/Example_past_training_photo.jpg` — Nowo dodane przez użytkownika przykładowe zdjęcie treningu.
- `src/lib/exercise-assets.ts` — Baza miniatur zdjęć ćwiczeń w `assets/images/*` (`getExerciseMedia`, `EXERCISE_ASSET_MAP`).
- `src/schemas/user-profile-screen.schema.ts` — Schematy danych ekranu profilu.
- `src/hooks/use-user-profile-screen.ts` — Hook zarządzający stanem profilu i akcjami.
- `src/components/user-profile/RoutinePhotoCarousel.tsx` — Aktualna karuzela zdjęć z rutyn.
- `src/components/user-profile/RecentCompletedWorkouts.tsx` — Sekcja ostatnich treningów.
- `src/app/user-profile.tsx` — Ekran profilu integrujący komponenty.

---

## Nowe Wymagania Użytkownika

1. **Pionowe prostokąty z zaokrąglonymi rogami w karuzeli zdjęć**:
   - Dłuższy bok ma być pionowy (proporcje pionowe np. `w-44 h-64` / format portretowy).
   - Zaokrąglone rogi (`rounded-2xl` / `rounded-3xl`).
   - Uwzględnienie przykładowego zdjęcia dodanego przez użytkownika: `assets/Example_past_training_photo.jpg`.
2. **Interakcja po kliknięciu — co użytkownik zrobił na treningu**:
   - Po kliknięciu w kartę ze zdjęciem otwiera się widok/modal (`PastWorkoutModal`) pokazujący:
     - Szczegóły wykonanego treningu (nazwa, data, czas, tonaż).
     - Zdjęcia ćwiczeń z folderu `assets/images/*`.
     - Wykonane serie, powtórzenia i obciążenia (oraz rekordy PR).

---

## Architektura i Podział Komponentów (< 100 linii per plik)

### 1. Rozszerzenie Schematu Zod (`src/schemas/user-profile-screen.schema.ts`)
- `PastWorkoutPhotoItemSchema`:
  - `id`: string,
  - `title`: string,
  - `date`: string,
  - `imageType`: enum(["local_example", "asset_key"]),
  - `imageKey`: string (np. "example" lub klucz z `EXERCISE_ASSET_MAP`),
  - `durationMinutes`: number,
  - `totalVolumeKg`: number,
  - `exercises`: array(`CompletedWorkoutExerciseWithMediaSchema` - z nazwą, zdjęciem z assetów `imageAssetKey`, seriami i PR).

### 2. Aktualizacja Hooka (`src/hooks/use-user-profile-screen.ts`)
- Dodanie `selectedPastWorkout`: obiekt lub `null`.
- Dodanie metod `openPastWorkoutModal(id: string)` oraz `closePastWorkoutModal()`.
- Włączenie `assets/Example_past_training_photo.jpg` do listy pionowych kart w karuzeli.

### 3. Komponenty UI (`src/components/user-profile/`)
- `RoutinePhotoCarousel.tsx` (~75 linii):
  - Karty o pionowych proporcjach (`w-44 h-64`, `rounded-3xl`, `overflow-hidden`),
  - Zdjęcie w tle z gradientem, tytuł treningu, data i etykieta,
  - Kliknięcie wywołuje `onSelectPhoto(item.id)`.
- `PastWorkoutModal.tsx` (~85 linii):
  - Elegancki Modal z Safe Area,
  - Wyświetlenie dużego zdjęcia treningu,
  - Szczegóły tonażu i czasu,
  - Przewijana lista ćwiczeń ze zdjęciami z `assets/images/*` (`getExerciseMedia`).
- `index.ts`: Barrel export.

### 4. Ekran Profilu (`src/app/user-profile.tsx`)
- Integracja `PastWorkoutModal` kontrolowanego stanem z hooka `useUserProfileScreen`.

---

## Plan Implementacji Krok po Kroku (TDD)

1. **Krok 1: Aktualizacja schematu Zod i testów schematu**
   - `src/schemas/user-profile-screen.schema.ts`
   - `src/schemas/__tests__/user-profile-screen.schema.test.ts`
2. **Krok 2: Testy i implementacja w hooku `use-user-profile-screen.ts`**
   - `src/hooks/__tests__/use-user-profile-screen.test.ts`
   - `src/hooks/use-user-profile-screen.ts`
3. **Krok 3: Testy i implementacja `PastWorkoutModal.tsx` oraz `RoutinePhotoCarousel.tsx`**
   - `src/components/user-profile/__tests__/user-profile-components.test.tsx`
   - `src/components/user-profile/PastWorkoutModal.tsx`
   - `src/components/user-profile/RoutinePhotoCarousel.tsx`
4. **Krok 4: Integracja w `src/app/user-profile.tsx` i testy integracyjne**
   - `src/app/__tests__/user-profile.test.tsx`
   - `src/app/user-profile.tsx`
5. **Krok 5: Weryfikacja końcowa**
   - `npm test`
   - `npx tsc --noEmit`
   - `npm run lint`

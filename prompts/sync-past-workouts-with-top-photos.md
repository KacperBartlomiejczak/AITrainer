# Synchronizacja Poprzednich Treningów ze Zdjęciami na Górze Profilu

## Przeczytane pliki (Research)
- `AGENTS.md` — Wytyczne: Zod jako źródło prawdy, kolejność (1. Schemat Zod, 2. Testy, 3. Implementacja), pliki < 100 linii kodu, `npm test`, `npx tsc --noEmit`, `npm run lint`.
- `src/schemas/user-profile-screen.schema.ts` — Schematy danych profilu (`RoutinePhotoItemSchema`, `CompletedWorkoutDetailSchema`).
- `src/hooks/use-user-profile-screen.ts` — Źródło danych dla zdjęć z treningów na górze (`DEFAULT_ROUTINE_PHOTOS`) oraz kart na dole (`DEFAULT_RECENT_WORKOUTS`).
- `src/components/user-profile/RecentCompletedWorkouts.tsx` — Lista kart poprzednich treningów na dole.
- `src/components/user-profile/RoutinePhotoCarousel.tsx` — Karuzela pionowych zdjęć na samej górze.
- `src/components/user-profile/PastWorkoutModal.tsx` — Modal szczegółów treningu po kliknięciu w zdjęcie.
- `src/hooks/__tests__/use-user-profile-screen.test.ts` — Testy hooka profilu.
- `src/schemas/__tests__/user-profile-screen.schema.test.ts` — Testy schematów.

---

## Analiza Rozbieżności Danych

Obecnie w `src/hooks/use-user-profile-screen.ts`:
1. **Zdjęcia na górze (`DEFAULT_ROUTINE_PHOTOS`)**:
   - `rp_example_01`: "Ostatni Trening na Siłowni 🔥" (`example_past_photo`, Wczoraj 18:30, 6,450 kg, 4 ćwiczenia: Wyciskanie 100kg PR, Skos hantlami, Wznosy bokiem, Dipsy)
   - `rp_01`: "Push Day — Klatka & Barki" (`0025`, 3 dni temu 19:15, 5,820 kg, 2 ćwiczenia)
   - `rp_02`: "FBW Siła & Stabilizacja" (`0047`, 5 dni temu 17:45, 7,200 kg, 2 ćwiczenia)
   - `rp_03`: "Pull Day — Plecy & Ramiona" (`0007`, Tydzień temu 18:00, 6,100 kg, 2 ćwiczenia)

2. **Karty na dole (`DEFAULT_RECENT_WORKOUTS`)**:
   - `cw_01`: "Sesja Pchająca: Klatka & Barki" (`0025`) — zupełnie inne zdjęcie, inny tytuł niż pierwsze zdjęcie na górze!
   - `cw_02`: "Trening Pleców i Bicepsa" (`0007`) — brak spójności z kolejnością i tytułami zdjęć na górze.
   - `cw_03`: "Nogi & Brzuch (Ekspres)" (`""`) — trening bez zdjęcia.

Użytkownik zgłosił:
> *"Chcialbym abys synchronizowal poprzednie treningi to z tymi zdjeciami na gorze ktore sa zeby bylo tak samo"*

Oznacza to, że karty poprzednich treningów na dole i zdjęcia treningów na górze muszą prezentować **te same treningi w tej samej kolejności**:
1. **Trening 1**: "Ostatni Trening na Siłowni 🔥" ze zdjęciem `example_past_photo` (Wczoraj, 18:30, tonaż 6,450 kg, te same ćwiczenia z PR 100kg).
2. **Trening 2**: "Push Day — Klatka & Barki" ze zdjęciem `0025` (3 dni temu, 19:15, tonaż 5,820 kg, ćwiczenia Push).
3. **Trening 3**: "FBW Siła & Stabilizacja" ze zdjęciem `0047` (5 dni temu, 17:45, tonaż 7,200 kg, ćwiczenia FBW z PR 120kg w przysiadzie).
4. **Trening 4**: "Pull Day — Plecy & Ramiona" ze zdjęciem `0007` (Tydzień temu, 18:00, tonaż 6,100 kg, ćwiczenia Pull).
5. **Trening 5**: "Kondycja & Brzuch (Bez zdjęcia)" z pustym `imageAssetKey: ""` (jako weryfikacja wariantu karty bez zdjęcia, która jako pierwszą kartę pokazuje ćwiczenia).

---

## Architektura i Plan Implementacji Krok po Kroku

### Krok 1: Wzbogacenie Schematu Zod (`src/schemas/user-profile-screen.schema.ts`)
- Dodanie `subtitle?: string` do `CompletedWorkoutDetailSchema`.
- Dodanie opcjonalnego `imageAssetKey?: string` do `CompletedWorkoutExerciseSchema`.
- Walidacja synchronizacji: zapewnienie, że schemat dopuszcza pełną spójność pól między obiema reprezentacjami.

### Krok 2: Testy jednostkowe (TDD)
- Aktualizacja `src/schemas/__tests__/user-profile-screen.schema.test.ts`.
- Aktualizacja `src/hooks/__tests__/use-user-profile-screen.test.ts` w celu weryfikacji synchronizacji:
  - Sprawdzenie, że pierwszy trening w `recentWorkouts` ma ten sam tytuł, zdjęcie (`example_past_photo`), datę i ćwiczenia co pierwsze zdjęcie w `routinePhotos`.
  - Sprawdzenie spójności kolejnych treningów (`Push Day`, `FBW`, `Pull Day`).

### Krok 3: Implementacja w `src/hooks/use-user-profile-screen.ts`
- Zsynchronizowanie `DEFAULT_RECENT_WORKOUTS` z `DEFAULT_ROUTINE_PHOTOS` tak, aby dane treningów, zdjęcia, daty, tonaże, ćwiczenia i osiągnięcia były w 100% spójne.

### Krok 4: Weryfikacja UI i Testy Komponentów
- Uruchomienie `npm test`.
- Weryfikacja typów `npx tsc --noEmit`.
- Weryfikacja lintera `npm run lint`.

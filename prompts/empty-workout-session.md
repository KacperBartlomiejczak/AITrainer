# Pusty trening (live session) + zapis serii do bazy + przycisk „Stwórz nową rutynę”

## Cel

1. Na ekranie `/workouts` dwa nowe przyciski obok siebie:
   - **„Rozpocznij pusty trening”** → nowy ekran sesji na żywo,
   - **„Stwórz nową rutynę”** → tylko UI, **bez logiki**.
2. Ekran pustego treningu:
   - **Góra:** timer, liczba serii (= wszystkie odhaczone), tonaż (kg).
   - **Szkielet ciała** (`react-native-body-highlighter`, jak w rankingu): mięśnie główne – pełny kolor, pomocnicze – przygaszony.
   - **„Dodaj ćwiczenie”** → wybór z bazy ćwiczeń (katalog z `use-exercise-catalog.ts`), **„+ Dodaj serię”**.
   - Seria: kg, powtórzenia, ✓. **Tap w numer serii (np. „1”) po lewej → dialog**: Normalna / Rozgrzewka `R` / Drop set `D` / Nieudana `NU` / Usuń serię.
   - **`PR` liczony automatycznie** na podstawie danych użytkownika w bazie (nie jest ręcznym znacznikiem).
3. **„Zakończ trening” → sekcja potwierdzenia:** podsumowanie, nazwa treningu (opcjonalna), zdjęcie (aparat / galeria, opcjonalne),
   przełącznik „Zapisz jako rutynę”, przycisk „Zapisz trening”.
4. Zapis do SQLite (z seriami) i **wyświetlanie na profilu** (`/user-profile`) – historia, karty, modal, PR.

## Przeczytane pliki

- `AGENTS.md`, pamięć (plan → akceptacja → kod)
- `prompts/workout-history-and-routines-persistence.md`, `prompts/body-highlighter-ranking-integration.md`
- Ekrany: `app/workouts.tsx`, `app/workout/[id].tsx`, `app/ranking.tsx`, `app/_layout.tsx`
- Komponenty: `components/workouts/*`, `components/workout/*`, `components/ranking/HumanBodyDiagram.tsx`,
  `components/workout-photo/WorkoutPhotoSourceSheet.tsx`, `components/user-profile/{WorkoutExercisesSlide,ExerciseLogItem,WorkoutAchievementsSlide}.tsx`
- Hooki / store: `use-routines`, `use-routine-library`, `use-workout-detail`, `use-workout-photo`, `use-workout-history`,
  `use-user-profile-screen`, `use-exercise-catalog`, `use-ranking-screen`, `stores/active-workout.store.ts`
- Schematy: `workout-session`, `workout`, `workout-history`, `ranking`, `exercise-catalog`, `user-profile-screen`, `routine`, `onboarding`
- DB: `db/schema.ts`, `db/client.ts`, `db/workout-history.ts`, `db/repositories/{workout-session,routine}.repository.ts`,
  `db/seed.ts`, `db/testing/create-test-database.ts`, `drizzle/0002_*.sql`, `drizzle/migrations.js`
- Lib: `routine-mappers.ts`, `workout-history-mappers.ts`, `workout-photo-service.ts`, `exercise-assets.ts`
- Testy: `app/__tests__/workouts.test.tsx`, `app/__tests__/routes-structure.test.ts`, `components/workouts/__tests__/*`

## Stan obecny (ważne)

- Sesja w bazie zapisuje tylko **odhaczone ćwiczenia** (`sets`, `targetReps` jako tekst) – **brak serii, ciężarów, PR**.
- `CompletedWorkoutExercise` na profilu ma już pola `isPersonalRecord`, `recordNote`, a karta ma slajd „Osiągnięcia” –
  dziś zawsze puste (`isPersonalRecord: false`, `achievements: []`). Podepnę je pod prawdziwe dane.
- Zdjęcie: istnieje `pickWorkoutPhoto` + `attachPhotoToWorkout` (kopiowanie z cache do `Paths.document`) – użyję ponownie.
- Routine repository ma tylko `list/getById/seed` – brak `create` dla rutyn użytkownika.
- `HumanBodyDiagram` jest „rankingowy” – wspólne jest tylko `Body` i mapowanie slugów ↔ 7 grup.

## Model danych (krok 1 – Zod + typy)

### Baza – migracja `0003_workout_session_sets` (drizzle-kit generate)

```
workout_session_exercises  + catalog_exercise_id TEXT NULL   -- do liczenia PR po ćwiczeniu (stare sesje/rutyny = NULL)

workout_session_sets (NOWA)
  id                    TEXT PK
  session_exercise_id   TEXT NOT NULL → workout_session_exercises.id ON DELETE CASCADE
  position              INTEGER NOT NULL          (unique z session_exercise_id)
  weight_kg             REAL NOT NULL             (0–1000, 0 = masa ciała)
  reps                  INTEGER NOT NULL          (1–500)
  tag                   TEXT NULL                 (warmup | drop_set | failed)
  is_personal_record    INTEGER(boolean) NOT NULL (snapshot – rekord w chwili zapisu)
  index: (session_exercise_id)
```

Zapisujemy **tylko odhaczone serie**. „Usuń moje dane” działa bez zmian (CASCADE).

### Zod – `src/schemas/live-workout.schema.ts` (stan sesji na żywo)

```ts
SetTagSchema = z.enum(["warmup", "drop_set", "failed"])
SET_TAG_META: Record<SetTag, { short: "R" | "D" | "NU"; label: string; color: string }>

LiveWorkoutSetSchema      = { id, weightKg: number|null, reps: int|null, tag: SetTag|null, isCompleted: boolean }
LiveWorkoutExerciseSchema = { id, catalogExerciseId, name, targetMuscle,
                              primaryMuscles: RankingMuscleGroup[] (min 1), secondaryMuscles: RankingMuscleGroup[],
                              sets: LiveWorkoutSet[] (1–20) }
LiveWorkoutSessionSchema  = { startedAt: epoch ms, exercises: LiveWorkoutExercise[] (max 30) }
SetInputSchema            = parsowanie TextInput: "62,5" → 62.5 kg, "8" → 8 powt. (ta sama schema klient/zapis)
PersonalBestSchema        = { catalogExerciseId, weightKg, reps }
LiveWorkoutStats          = { completedSetCount, totalVolumeKg, trainedMuscles: { muscle, intensity: "primary"|"secondary" }[] }

FinishWorkoutFormSchema   = {
  title: string trim max 120 (puste → domyślne „Trening – {dzień tygodnia}”),
  saveAsRoutine: boolean,
  photoUri: string | null,              // tymczasowe URI z pickera, kopiowane dopiero przy zapisie
}
```

### Zod – `src/schemas/workout-history.schema.ts` (rozszerzenie)

- `WorkoutSessionSetRowSchema` (1:1 z tabelą) + `WorkoutSessionExerciseRowSchema.catalogExerciseId: string | null`.
- `WorkoutSessionSchema.exercises[].sets: WorkoutSessionSet[]` (stare sesje → `[]`).
- `NewWorkoutSessionSchema.exercises[]` + opcjonalne `catalogExerciseId`, `sets` (domyślnie `[]` – flow rutyn bez zmian).
- `NewUserRoutineSchema` – rutyna utworzona z treningu.
- `WorkoutSessionExportSchema` – eksport danych zawiera też serie (dane wrażliwe → użytkownik może je wyeksportować/usunąć).

## Logika i decyzje

- **PR (automatyczny):** dla każdego ćwiczenia z katalogu pobieram z bazy najlepszą serię (bez `R` i `NU`).
  Seria na żywo = PR, gdy jest odhaczona, nie jest `R`/`NU` i bije rekord: **większy ciężar**, albo ten sam ciężar i **więcej powtórzeń**.
  Maksymalnie **1 PR na ćwiczenie w treningu** (najlepsza seria). Badge `PR 🔥` pojawia się od razu po odhaczeniu serii
  i aktualizuje się przy zmianie kg/powt./znacznika.
- **Tonaż:** Σ kg × powt. z odhaczonych serii **bez rozgrzewek `R`** (nieudane `NU` liczone). ← do potwierdzenia
- **Numeracja serii:** normalne/drop/nieudane numerowane 1, 2, 3…; rozgrzewka pokazuje `R` zamiast numeru, drop `D`, nieudana `NU`.
- **Szkielet:** partia „zrobiona” = ≥1 odhaczona seria. Przód + tył obok siebie. Mapowanie katalog → ranking:
  pectorals→chest, lats/upper back/lower back→back, quadriceps/hamstrings/glutes→legs, delts→shoulders, biceps, triceps, abs/obliques→abs.
  Wspólna mapa `RankingMuscleGroup → slugi` w `src/lib/body-highlighter-slugs.ts` (użyta też w `HumanBodyDiagram`, bez zmiany zachowania).
- **Stan sesji w Zustand** (`src/stores/live-workout.store.ts`) – timer i serie przetrwają wyjście z ekranu;
  ponowne „Rozpocznij pusty trening” wraca do trwającej sesji. W headerze też **„Odrzuć trening”** (z potwierdzeniem),
  żeby dało się porzucić sesję bez zapisu.
- **Zapis (`finishLiveWorkout` w `src/db/workout-history.ts`):**
  1. walidacja `safeParse` (min. 1 odhaczona seria z kg i powt.; błąd → komunikat po polsku, bez crasha),
  2. transakcja: sesja + ćwiczenia + serie (+ rutyna, gdy „Zapisz jako rutynę”),
  3. zdjęcie przez istniejące `attachPhotoToWorkout` – jeśli się nie uda, trening **zostaje zapisany**, a użytkownik widzi komunikat,
  4. reset store → `/user-profile`.
- **Rutyna z treningu:** tytuł = nazwa treningu, `userId = LOCAL_USER_ID`, poziom z onboardingu (experience → level),
  `durationMinutes` = czas treningu, `daysPerWeek = 1` ← do potwierdzenia; ćwiczenie: `sets` = liczba serii roboczych (bez `R`),
  `targetReps` = zakres powtórzeń np. „8–10”, `restSeconds = 90`. Pojawi się w „Rutynach” na `/workouts` i na profilu.
- **Profil:** `toCompletedWorkoutDetail` dla sesji z seriami: `setsSummary` = „3 serie • maks. 80 kg × 8”,
  `isPersonalRecord` + `recordNote` („Nowy rekord: 80 kg × 8”), slajd osiągnięć = lista PR-ów + tonaż. Stare sesje wyglądają jak dziś.
- **Route:** `src/app/workout-session.tsx` → `/workout-session`. Sekcja potwierdzenia = osobny widok w tym samym ekranie
  (krok „trening” → „podsumowanie”), bez nowej trasy.

## Nowe / zmienione pliki

| Plik | Co |
|---|---|
| `src/schemas/live-workout.schema.ts` | NOWY – schematy sesji na żywo i formularza zakończenia |
| `src/schemas/workout-history.schema.ts` | serie, `catalogExerciseId`, rutyna użytkownika, eksport |
| `src/db/schema.ts` + `drizzle/0003_*` (generowane) | tabela `workout_session_sets`, kolumna `catalog_exercise_id` |
| `src/db/repositories/workout-session.repository.ts` | zapis/odczyt serii, `getPersonalBests(catalogIds)` |
| `src/db/repositories/routine.repository.ts` | `create(routine)` |
| `src/db/workout-history.ts` | `loadPersonalBests`, `finishLiveWorkout` |
| `src/lib/live-workout-stats.ts` | statystyki, PR, numeracja serii, `formatElapsed` |
| `src/lib/live-workout-mappers.ts` | katalog → ćwiczenie sesji, sesja → `NewWorkoutSession` / `NewUserRoutine` |
| `src/lib/body-highlighter-slugs.ts` | wspólna mapa slugów |
| `src/lib/workout-history-mappers.ts` | podsumowanie serii, PR, osiągnięcia na profilu |
| `src/stores/live-workout.store.ts` | start / addExercise / removeExercise / addSet / updateSet / toggleSet / setTag / removeSet / discard |
| `src/hooks/use-live-workout.ts` | akcje + statystyki + rekordy z bazy |
| `src/hooks/use-elapsed-seconds.ts` | timer 1 s |
| `src/hooks/use-exercise-picker.ts` | wyszukiwarka |
| `src/hooks/use-finish-live-workout.ts` | formularz zakończenia, zdjęcie, zapis |
| `src/components/workouts/WorkoutQuickActions.tsx` | 2 przyciski na `/workouts` |
| `src/components/live-workout/LiveWorkoutHeader.tsx` | wstecz, tytuł, „Odrzuć”, „Zakończ” |
| `src/components/live-workout/LiveWorkoutStatsBar.tsx` | timer / serie / tonaż |
| `src/components/live-workout/WorkoutMuscleMap.tsx` | szkielet przód + tył |
| `src/components/live-workout/LiveExerciseCard.tsx` | ćwiczenie + serie + „Dodaj serię” |
| `src/components/live-workout/LiveSetRow.tsx` | numer/znacznik, kg, powt., ✓, badge PR |
| `src/components/live-workout/SetTagDialog.tsx` | dialog R / D / NU / normalna / usuń |
| `src/components/live-workout/ExercisePickerModal.tsx` | wyszukiwarka + lista |
| `src/components/live-workout/LiveWorkoutEmptyState.tsx` | „Dodaj pierwsze ćwiczenie” |
| `src/components/live-workout/FinishWorkoutSection.tsx` (+ `FinishPhotoPicker.tsx`, `SaveAsRoutineToggle.tsx`) | potwierdzenie |
| `src/app/workout-session.tsx` | ekran |
| `src/app/workouts.tsx`, `src/hooks/use-routines.ts` | przyciski + `startEmptyWorkout` |
| `src/components/ranking/HumanBodyDiagram.tsx` | import wspólnej mapy slugów |

## Kroki

- [x] 0. Docs Expo v57 (expo-router, expo-sqlite/Drizzle migracje, `Modal`, `TextInput`, `Switch`) + skill `expo-router`
- [x] 1. Zod: `live-workout.schema.ts` + rozszerzenie `workout-history.schema.ts` + testy schematów
- [x] 2. Test migracji/tabel → `db/schema.ts` + `npm run db:generate` (0003)
- [x] 3. Testy repozytoriów (zapis/odczyt serii, `getPersonalBests`, `routine.create`, eksport, kasowanie) → implementacja
- [x] 4. Testy `live-workout-stats` / `live-workout-mappers` / `body-highlighter-slugs` → implementacja
- [x] 5. Test + implementacja `live-workout.store.ts`
- [x] 6. Testy + implementacja hooków (`use-live-workout`, `use-elapsed-seconds` z fake timers, `use-exercise-picker`, `use-finish-live-workout`)
- [x] 7. Testy + implementacja komponentów `live-workout/*` (każdy < 100 linii)
- [x] 8. `WorkoutQuickActions` + `/workouts` (dopisanie asercji w `workouts.test.tsx`)
- [x] 9. Ekran `workout-session.tsx` + test integracyjny (dodaj ćwiczenie → seria → zakończ → zapis w bazie in-memory)
- [x] 10. Profil: mappers (serie, PR, osiągnięcia) + testy
- [x] 11. Refaktor `HumanBodyDiagram` na wspólną mapę (testy rankingu bez zmian)
- [x] 12. `npm test`, `npx tsc --noEmit`, `npm run lint` – zielone
- [x] 13. Podsumowanie + jak sprawdzić

## Odpowiedzi użytkownika

1. Zapis do bazy + widoczne na profilu. Po „Zakończ” sekcja potwierdzenia: zdjęcie (aparat/galeria), nazwa, „dodaj jako rutynę”.
2. `R`, `D`, `NU` wybierane w dialogu po kliknięciu w numer serii; `PR` automatycznie z danych w bazie.
3. Liczba serii = wszystkie odhaczone.
4. Mięśnie pomocnicze – przygaszony kolor.

## Otwarte pytania (mają domyślną odpowiedź – jeśli OK, piszesz „go”)

1. **Tonaż** – bez rozgrzewek `R`, z nieudanymi `NU`? *(domyślnie tak)*
2. **Pierwszy raz dane ćwiczenie** (brak historii w bazie) – czy najlepsza seria to już `PR`? *(domyślnie **nie**, dopiero gdy jest co pobić)*
3. **Rutyna z treningu** – `dni w tygodniu = 1`, przerwa 90 s, poziom z onboardingu? *(domyślnie tak)*
4. **Ranking** – czy nowe rekordy mają już teraz zasilać kafelki/ligi w `/ranking` (dziś mock)? *(domyślnie **nie** – osobne zadanie)*

## Realizacja – odstępstwa od planu

- Tablica serii w domenie nazywa się `loggedSets` (pole `sets` w `workout_session_exercises` to już liczba serii).
- Zapis: sesja + ćwiczenia + serie w jednej transakcji. Rutyna i zdjęcie zapisywane **po** sesji (best effort) –
  gdy się nie uda, trening zostaje zapisany, a użytkownik dostaje `Alert` z informacją.
- Dodatkowo: `use-set-inputs.ts` (tekst „62,” w polu kg nie jest błędem – do store trafiają tylko wartości przepuszczone przez Zod),
  `confirmDiscard` (Alert przed odrzuceniem treningu), `catalog-muscles.ts`, `personal-records.ts`, `AddExerciseButton`,
  `LiveWorkoutExerciseList`, `FinishSummaryHeader`, `ExercisePickerItem`.
- Serię można odhaczyć dopiero po wpisaniu powtórzeń; pusty ciężar = 0 kg (masa ciała).
- Nie wykonano ręcznego testu na symulatorze (brak uruchomionego symulatora / buildu) – tylko testy, `tsc`, lint.

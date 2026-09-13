# Rutyny i historia treningów w SQLite (+ opcjonalne zdjęcie treningu)

## Cel

1. Nowe tabele w lokalnej bazie (Expo SQLite + Drizzle): **rutyny** użytkownika oraz **poprzednie treningi** (sesje).
2. Ekran główny (`/`) i profil użytkownika (`/user-profile`) czytają dane z bazy zamiast z zahardkodowanych mocków.
3. Każdy zakończony trening może mieć **opcjonalne zdjęcie** (dodane przy zakończeniu lub później z historii).

## Przeczytane pliki

- `AGENTS.md`, pamięć: plan → akceptacja → kod
- `prompts/sqlite-onboarding-persistence.md`, `prompts/sync-past-workouts-with-top-photos.md`
- DB: `src/db/schema.ts`, `src/db/client.ts`, `src/db/types.ts`, `src/db/bootstrap.ts`,
  `src/db/repositories/onboarding.repository.ts`, `src/db/testing/create-test-database.ts`,
  `drizzle/0001_experience_level_and_muscle_focus.sql`, `drizzle/migrations.js`, `drizzle.config.ts`
- Schematy: `database.schema.ts`, `routine.schema.ts`, `workout.schema.ts`, `workout-session.schema.ts`,
  `home.schema.ts`, `user-profile-screen.schema.ts`
- Hooki/store: `use-home-screen.ts`, `use-user-profile-screen.ts`, `use-routines.ts`, `use-workout-detail.ts`,
  `use-database-bootstrap.ts`, `use-profile.ts` (eksport/reset), `stores/active-workout.store.ts`
- Ekrany/komponenty: `app/index.tsx`, `app/user-profile.tsx`, `app/profile.tsx`, `app/workout/[id].tsx`,
  `app/_layout.tsx`, `components/home/RecentActivitySection.tsx`, `components/user-profile/*`
  (`RoutinePhotoCarousel`, `RecentCompletedWorkouts`, `UserRoutinesList`, `WorkoutCoverSlide`)
- `lib/workout-routines-data.ts` (statyczne rutyny), `app.json`, `package.json`
- Testy: `use-user-profile-screen.test.ts`, `use-home-screen.test.ts`, `app/__tests__/*`
- Docs Expo v57: `sdk/imagepicker` (URI z pickera jest **tymczasowy** – cache), `sdk/filesystem` (`File`, `Directory`, `Paths.document`)

## Stan obecny (ważne)

- Wszystkie treningi, zdjęcia, rutyny na profilu i „Ostatnia aktywność” na home to **mocki** w hookach.
- `finishWorkout()` w `active-workout.store` tylko czyści stan – **nic nie jest zapisywane**.
  Nie ma też logowania ciężaru/powtórzeń – jedynie „odhacz ćwiczenie”.
- Brak `expo-image-picker` w zależnościach (`expo-file-system` jest już w `node_modules`).

## Odpowiedzi użytkownika (zaakceptowane)

1. Testy oparte o mocki → **aktualizuję** je pod dane z bazy.
2. Logowanie ciężaru/powtórzeń → **wstrzymane**. Zapisujemy tylko to, co potrzebne teraz: odhaczone ćwiczenia + czas.
3. Na start **2 podstawowe rutyny** (seed) – FBW A i FBW B.
4. Zdjęcie: **galeria albo aparat** – użytkownik wybiera (przy zakończeniu treningu i później z karty w historii).
5. Ekran główny: **feed treningów znajomych na mockach**, poza bazą danych. „Ostatnia aktywność” = ostatni trening z bazy.

## Decyzje architektoniczne

- **Zdjęcie jako plik**, nie BLOB: kopia z cache pickera do `Paths.document/workout-photos/{sessionId}-{ts}.jpg`.
  W bazie tylko **nazwa pliku** (walidowana regexem – brak `../`), bo absolutny URI na iOS zmienia się po aktualizacji aplikacji.
- **Sesja przechowuje snapshot** (tytuł + ćwiczenia) – zmiana rutyny nie zmienia historii (`routine_id` → `ON DELETE SET NULL`).
- **Rutyny wbudowane** mają `user_id = NULL` (nie należą do profilu, więc „Usuń dane” ich nie kasuje, a seed działa przed onboardingiem).
  Seed idempotentny (`ON CONFLICT DO NOTHING`) po migracjach w `initializeDatabase()`.
- `/workouts`, `/workout/[id]` i rutyny na profilu czytają rutyny z bazy (stałe dane w `lib/workout-routines-data.ts` i `INITIAL_ROUTINES` usunięte),
  bo sesja ma FK do `routines`.
- Repozytoria jak w onboardingu: zapis i odczyt przez Zod `safeParse`; uszkodzony wiersz = log + pominięcie.
- Odczyt w hookach przez generyczny `useAsyncResource` + odświeżenie przy wejściu na ekran (`useFocusEffect`).
  Historia nie trafia do Zustand (baza = źródło prawdy). `active-workout.store` dostaje tylko `startedAt`.
- Nie da się zapisać treningu bez odhaczonego ćwiczenia (Zod `refine`) → komunikat po polsku.
- Prywatność: „Usuń dane” czyści sesje w DB **i cały katalog zdjęć**; eksport JSON zawiera historię treningów (`hasPhoto`, bez pliku).
- Puste stany zamiast mocków: brak treningów / brak zdjęć.
- Tonaż, PR i osiągnięcia: brak źródła danych (logowanie serii wstrzymane) → tonaż zastąpiony „X/Y ćwiczeń”,
  slajd osiągnięć pokazuje się tylko gdy są osiągnięcia. Seria dni / 100 kg / intensywność miesięczna zostają mockami (poza zakresem).

## Model danych (snake_case w DB, Zod = źródło prawdy)

`routines`: `id` PK, `user_id` NULL FK → `user_profiles` CASCADE (NULL = wbudowana), `title`, `description`,
`level` (enum `RoutineLevelSchema`), `days_per_week` (1–7), `duration_minutes`, `created_at`, `updated_at`

`routine_exercises`: `id` PK, `routine_id` FK CASCADE, `position` (UNIQUE z `routine_id`), `name`, `target_muscle`,
`sets`, `target_reps`, `rest_seconds`

`workout_sessions`: `id` PK, `user_id` FK → `user_profiles` CASCADE, `routine_id` NULL FK SET NULL, `title`,
`started_at`, `completed_at` (index z `user_id`), `duration_seconds`, **`photo_file_name` NULL (opcjonalne zdjęcie)**, `created_at`

`workout_session_exercises`: `id` PK, `session_id` FK CASCADE, `position` (UNIQUE z `session_id`), `name`,
`target_muscle`, `sets`, `target_reps`, `completed` (boolean)

## Kroki

- [x] 1. `npx expo install expo-image-picker expo-file-system` + plugin `expo-image-picker` w `app.json` (polskie opisy uprawnień)
- [x] 2. Zod + typy: `src/schemas/workout-history.schema.ts`, `src/schemas/friends-feed.schema.ts`; aktualizacja
      `user-profile-screen.schema.ts`, `workout.schema.ts` (`RecentActivity`), `home.schema.ts`, `profile.schema.ts` (eksport)
- [x] 3. Tabele Drizzle w `src/db/schema.ts` → `npm run db:generate` → migracja `0002`
- [x] 4. Testy (przed implementacją): schematy, parytet Drizzle↔Zod, migracja, `routine.repository`, `workout-session.repository`,
      `workout-photo-storage`, `workout-photo-picker`, `workout-photo-service`, mappery widoku, hooki, komponenty
- [x] 5. DB: repozytoria, seed 2 rutyn, `client.ts`, `src/db/testing/in-memory-client.ts` (dla testów)
- [x] 6. Zdjęcia: `lib/workout-photo-storage.ts`, `lib/workout-photo-picker.ts`, `lib/workout-photo-service.ts`,
      hook `use-workout-photo.ts`, komponent `WorkoutPhotoSourceSheet` (Aparat / Galeria / Usuń / Pomiń)
- [x] 7. Zapis treningu: `use-workout-detail` → zapis sesji → arkusz „Dodaj zdjęcie” → profil
- [x] 8. `/workouts` i `/workout/[id]` z bazy (`use-routine-library.ts`)
- [x] 9. Home: „Ostatnia aktywność” z bazy (miniatura zdjęcia, pusty stan) + `FriendsWorkoutFeed` na mockach
- [x] 10. Profil: karuzela = treningi ze zdjęciem, historia z bazy + przycisk zdjęcia, rutyny z bazy, puste stany
- [x] 11. Prywatność: `resetAllData` + `exportData` (async) z historią
- [x] 12. Aktualizacja testów opartych na mockach, podział komponentów > 100 linii
- [x] 13. `npm test`, `npx tsc --noEmit`, `npm run lint`

## Zmiany względem planu / uwagi z realizacji

- `src/db/workout-history.ts` — jedyny punkt wejścia dla hooków (rutyny, historia, zdjęcia, eksport, usuwanie);
  hooki nie znają repozytoriów, SQLite ani systemu plików.
- `src/db/testing/in-memory-client.ts` — zamiennik `src/db/client.ts` w testach (prawdziwe migracje + seed na SQLite w pamięci),
  `src/__mocks__/expo-file-system.js` — fake systemu plików, globalny mock `expo-image-picker` i `useFocusEffect` w `jest.setup.js`.
- `parseOrThrow` wydzielony z repozytorium onboardingu do `src/db/repositories/parse-or-throw.ts` (współdzielony).
- Usunięty nieużywany `src/lib/workout-routines-data.ts` (rutyny są w bazie).
- Logika przewijania karty historii wydzielona do `src/hooks/use-card-pager.ts` (komponent < 100 linii).
- Konflikt z równoległą sesją (code review): po jej zatrzymaniu scalone — zostawione zgodne poprawki
  (`accessibilityLabel` zamykania modala, brak `bg-gradient-*`, `daysPerWeek ≤ 7` w `UserRoutineCardSchema`, zmiany w rankingu),
  przywrócone moje wersje `user-profile-screen.schema.ts`, `WorkoutCoverSlide.tsx`, testów profilu; przywrócony `CLAUDE.md`.
- Wynik: `npm test` 524/524, `npx tsc --noEmit` OK, `npm run lint` 0 błędów (1 ostrzeżenie w `use-ranking-screen.ts` z sesji code review).

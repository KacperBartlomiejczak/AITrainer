# Baza danych (Expo SQLite + Drizzle) – trwały zapis onboardingu

## Cel

Po zakończeniu onboardingu dane (imię, cel, partie mięśni) oraz fakt ukończenia
zapisują się lokalnie w SQLite. Po ponownym uruchomieniu aplikacji użytkownik
trafia od razu na ekran główny – bez ponownego przechodzenia onboardingu.

## Przeczytane pliki

- `AGENTS.md` – stack zmieniony z Neon na **Expo SQLite** + Drizzle
- `package.json`, `jest.config.js`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `app.json`
- `src/stores/onboarding.store.ts` – dane onboardingu trzymane tylko w RAM (`isHydrated: true` na sztywno)
- `src/stores/onboarding-form.store.ts` – tymczasowy stan formularza (bez zmian)
- `src/schemas/onboarding.schema.ts` – `OnboardingFormSchema`, `FitnessGoalSchema`, `MuscleGroupSchema`
- `src/hooks/use-onboarding.ts`, `src/hooks/use-profile.ts`, `src/hooks/use-splash-screen.ts`
- `src/lib/onboarding-redirect.ts`, `src/schemas/navigation.schema.ts`
- `src/app/_layout.tsx` – guard przekierowań (czeka na `isHydrated`)
- testy: `layout.test.tsx`, `use-onboarding.test.ts`, `use-profile.test.ts`, `src/__mocks__/jest.setup.js`
- Docs: https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/ oraz Drizzle „Get started with Expo SQLite”

## Decyzje architektoniczne

- **Baza lokalna na urządzeniu** (Expo SQLite). Reguła „klient nie łączy się z Neon” dotyczy
  zdalnej bazy – lokalny plik SQLite to storage urządzenia, bez sekretów.
- **Zustand pozostaje źródłem prawdy dla UI**, SQLite jest trwałą kopią:
  1. start aplikacji → migracje → odczyt z DB → `hydrate()` w store → `isHydrated = true`
  2. zmiany w store (ukończenie onboardingu, edycja profilu, reset/usunięcie danych)
     są automatycznie zapisywane do DB przez jedną subskrypcję (`bindOnboardingPersistence`).
  Dzięki temu `useOnboarding` / `useProfile` nie muszą znać bazy i nie da się „zapomnieć” zapisu.
- **Dane z DB traktowane jako dane z zewnątrz** → walidacja `safeParse` tym samym
  `OnboardingFormSchema`. Uszkodzony rekord = log + traktujemy jak brak onboardingu (graceful fallback).
- **Błąd bazy nie blokuje aplikacji** – logujemy, hydratujemy pustym stanem, aplikacja działa w RAM.
- Użytkownik lokalny ma stałe id `local` (do podmiany na id z Clerk, gdy auth zostanie podpięty).
- Zapisy serializowane w kolejce (brak wyścigów przy szybkich zmianach).

## Model danych (snake_case w DB)

`user_profiles`
| kolumna | typ | uwagi |
| --- | --- | --- |
| `id` | TEXT PK | `local` |
| `name` | TEXT NOT NULL | |
| `fitness_goal` | TEXT NOT NULL | enum z `FitnessGoalSchema` |
| `onboarding_completed_at` | INTEGER (timestamp) NOT NULL | |
| `created_at` / `updated_at` | INTEGER (timestamp) NOT NULL | |

`user_focus_muscle_groups`
| kolumna | typ | uwagi |
| --- | --- | --- |
| `user_id` | TEXT FK → `user_profiles.id` ON DELETE CASCADE | |
| `muscle_group` | TEXT NOT NULL | enum z `MuscleGroupSchema` |
| PK | (`user_id`, `muscle_group`) | |

## Kroki

- [x] 1. Instalacja: `expo-sqlite` (npx expo install), `drizzle-orm`; dev: `drizzle-kit`,
      `babel-plugin-inline-import`, sterownik SQLite dla testów w Node
- [x] 2. Konfiguracja: `drizzle.config.ts`, babel `inline-import` (.sql), metro `sourceExts += sql`,
      plugin `expo-sqlite` w `app.json`, skrypt `db:generate`
- [x] 3. Zod + typy: `src/schemas/database.schema.ts` (`UserProfileRowSchema`, `UserFocusMuscleGroupRowSchema`,
      `DatabaseBootstrapStatus`), `src/db/schema.ts` (tabele Drizzle)
- [x] 4. Migracja: `npx drizzle-kit generate` → `drizzle/`
- [x] 5. Testy (przed implementacją):
  - repozytorium na prawdziwej bazie in-memory z migracjami (save / load / update / delete / uszkodzone dane)
  - `bindOnboardingPersistence` (store → repozytorium)
  - store: `hydrate()`
  - `useDatabaseBootstrap` (sukces / błąd → fallback)
- [x] 6. Implementacja: `src/db/repositories/onboarding.repository.ts`, `src/db/client.ts`,
      `src/db/onboarding-persistence.ts`, `src/hooks/use-database-bootstrap.ts`, store `hydrate`
- [x] 7. Podpięcie w `src/app/_layout.tsx`
- [x] 8. `npm test`, `npx tsc --noEmit`, `npm run lint`

## Zmiany względem planu (po akceptacji)

- „Zod jedynym źródłem prawdy” (uwaga użytkownika): enumy kolumn Drizzle są brane z
  `FitnessGoalSchema` / `MuscleGroupSchema`, a `src/db/__tests__/schema.test.ts` sprawdza
  w `tsc` i w runtime, że typy wierszy Drizzle są **identyczne** z typami z Zod.
  Zapis też przechodzi przez `safeParse` (dane + wiersze), nie tylko odczyt.
- Pytania z planu rozstrzygnięte domyślnie: tylko ukończony onboarding (bez szkicu),
  `better-sqlite3` jako devDependency do testów, `id = "local"`.
- `src/app/__tests__/layout.test.tsx`: dodany mock nowego hooka + 1 nowy test
  (istniejące asercje bez zmian).

## Poza zakresem (propozycje na później)

- Zapisywanie **szkicu** onboardingu w trakcie (powrót do przerwanego kroku)
- Eksport danych z DB (obecnie eksport bazuje na store)
- Synchronizacja z backendem / Clerk user id

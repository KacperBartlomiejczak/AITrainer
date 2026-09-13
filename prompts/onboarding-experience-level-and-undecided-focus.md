# Onboarding: staż treningowy + opcja „Jeszcze nie wiem” w priorytetach

## Cel

1. Nowy ekran onboardingu: **jak długo trenujesz** (nowy / kilka miesięcy / zaawansowany).
2. Ekran priorytetów (partie mięśni): nowa opcja **„Jeszcze nie wiem”**, która
   **wyklucza** pozostałe. Zaznaczenie jej odznacza partie, a wybranie partii odznacza ją.
3. Obie informacje zapisują się w bazie (SQLite + Drizzle) i są walidowane przez Zod.

## Przeczytane pliki

- `AGENTS.md`, `prompts/sqlite-onboarding-persistence.md`
- `src/app/(onboarding)/_layout.tsx`, `step-name.tsx` (67 l.), `step-goal.tsx` (114 l.),
  `step-muscle-groups.tsx` (113 l.), `step-summary.tsx` (115 l.)
- `src/components/onboarding/OnboardingProgress.tsx`
- `src/hooks/use-onboarding.ts`, `src/stores/onboarding-form.store.ts`, `src/stores/onboarding.store.ts`
- `src/schemas/onboarding.schema.ts`, `src/schemas/profile.schema.ts`, `src/schemas/user.schema.ts`
  (ma już `experienceLevel: beginner | intermediate | advanced`)
- `src/hooks/use-profile.ts`, `src/components/profile/ProfileMuscleGroupsSection.tsx`
  (wymaga min. 1 partii, co koliduje z „Jeszcze nie wiem”)
- `src/hooks/use-home-screen.ts` (`experienceLevel: "beginner"` wpisane na sztywno)
- `src/db/schema.ts`, `src/db/repositories/onboarding.repository.ts`, `src/schemas/database.schema.ts`
- testy: `src/app/__tests__/onboarding.test.tsx`, `src/hooks/__tests__/use-onboarding.test.ts`,
  `src/schemas/__tests__/onboarding.schema.test.ts`, `src/db/__tests__/*`

## Proponowany przebieg onboardingu (5 kroków)

`step-name` → **`step-experience` (nowy)** → `step-goal` → `step-muscle-groups` → `step-summary`

## Model danych (Zod = źródło prawdy)

### Staż treningowy
```ts
ExperienceLevelSchema = z.enum(["beginner", "intermediate", "advanced"]) // spójne z user.schema.ts
EXPERIENCE_LEVEL_LABELS // PL: label, emoji, opis zakresu czasu
```
Proponowane etykiety (do potwierdzenia):
| wartość | etykieta | opis |
| --- | --- | --- |
| `beginner` | Dopiero zaczynam | Mniej niż 5 miesięcy treningów |
| `intermediate` | Trenuję już trochę | Około 5–12 miesięcy |
| `advanced` | Zaawansowany | Ponad rok regularnych treningów |

### Priorytety: unia dyskryminowana (niemożliwe do pomieszania stany)
```ts
MuscleFocusSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("undecided") }),
  z.object({ mode: z.literal("selected"), muscleGroups: z.array(MuscleGroupSchema).min(1) }),
])
```
- `OnboardingFormSchema`: `focusMuscleGroups` zamieniam na `muscleFocus: MuscleFocus` i dodaję `experienceLevel`.
- Na poziomie typów nie da się zapisać „Jeszcze nie wiem” razem z partiami.
- `"undecided"` **nie** trafia do `MuscleGroupSchema`, bo to nie jest partia ciała.

### Baza
`user_profiles` dostaje dwie kolumny:
| kolumna | typ | źródło |
| --- | --- | --- |
| `experience_level` | TEXT NOT NULL | enum z `ExperienceLevelSchema` |
| `muscle_focus_mode` | TEXT NOT NULL | enum `"undecided" \| "selected"` |

`user_focus_muscle_groups` bez zmian: przy `undecided` tabela nie ma wierszy.
Przy odczycie Zod pilnuje spójności: `selected` bez wierszy albo `undecided` z wierszami
oznacza uszkodzony rekord, więc jest log i fallback.

Migracja: `drizzle-kit generate` (nowa migracja `0001_...`) + test parytetu Drizzle ↔ Zod.

## Kroki

- [x] 1. **Zod + typy**: `ExperienceLevelSchema`, `EXPERIENCE_LEVEL_LABELS`, `MuscleFocusSchema`,
      `MuscleFocusModeSchema`, nowy `OnboardingFormSchema`; wiersze w `database.schema.ts`
- [x] 2. **Drizzle**: kolumny w `src/db/schema.ts` + migracja `0001`
- [x] 3. **Testy (przed implementacją)**:
  - schematy: unia, wykluczanie, etykiety PL dla każdej wartości
  - store formularza: `setExperienceLevel`, `toggleMuscleGroup` odznacza „nie wiem”, `setUndecidedFocus` czyści partie
  - `useOnboarding`: walidacja 5 kroków, nawigacja, submit z nowymi polami
  - ekrany: `step-experience` (render, wybór, przycisk Dalej), `step-muscle-groups` (opcja „Jeszcze nie wiem”), `step-summary`
  - repozytorium na prawdziwym SQLite: round-trip `undecided` i `selected`, niespójne rekordy
- [x] 4. **Implementacja**:
  - `onboarding-form.store.ts`: `experienceLevel`, `muscleFocus` + akcje
  - `use-onboarding.ts`: `TOTAL_STEPS = 5`, nowa trasa
  - `src/app/(onboarding)/step-experience.tsx`
  - wspólny komponent `OnboardingOptionCard` (ekrany goal/experience mają ~110 l., zgodnie z zasadą ~100 l.)
  - `step-muscle-groups.tsx`: opcja „Jeszcze nie wiem” + podział na mniejsze komponenty
  - `step-summary.tsx`: karta stażu + „Jeszcze nie wiem” zamiast listy partii
  - repozytorium: zapis i odczyt nowych pól w jednej transakcji
- [x] 5. **Dostosowanie miejsc używających `focusMuscleGroups`** (zależne od odpowiedzi na pytanie 3)
- [x] 6. `npm test`, `npx tsc --noEmit`, `npm run lint`

## Odpowiedzi (akceptacja planu)

Użytkownik zaakceptował plan w całości: ekran po imieniu, przedziały `< 5 mies.` / `5–12 mies.` / `> 1 rok`,
„Jeszcze nie wiem” + staż również w profilu, migracja usuwa stare profile.

## Zmiany względem planu

- Migracja `0001` napisana ręcznie (DROP + CREATE). Wygenerowany `ALTER TABLE ADD ... NOT NULL`
  bez wartości domyślnej nie działa w SQLite. `drizzle-kit check` potwierdza zgodność ze snapshotem,
  a `src/db/__tests__/migrations.test.ts` sprawdza upgrade bazy ze starym profilem.
- Zmiana kształtu danych (`focusMuscleGroups` → `muscleFocus` + `experienceLevel`) wymagała aktualizacji
  **danych testowych** w istniejących testach (profil, home, public-profile, user-profile, db).
  `use-onboarding.test.ts` i `onboarding.test.tsx` przepisane pod 5 kroków; zamiast mocka używają
  prawdziwego store formularza, który ma teraz własne testy.
- Logika wykluczania wydzielona do `src/lib/muscle-focus.ts`, wspólna dla onboardingu, profilu i repozytorium.
- `ProfileHeaderCard` pokazuje etykietę stażu zamiast stałego „Poziom początkujący”.

## Pytania (rozstrzygnięte)

1. **Kolejność:** czy nowy ekran ma być zaraz po imieniu (propozycja powyżej)?
2. **Zakresy stażu:** czy etykiety i przedziały z tabeli pasują? Wspomniałeś „5–7 miesięcy”;
   czy to ma być osobny próg, np. `< 5 mies.` / `5–12 mies.` / `> 1 rok`?
3. **Ekran profilu:** teraz wymaga min. 1 partii. Czy w profilu też dodać „Jeszcze nie wiem”
   i edycję stażu? (Rekomendacja: tak, inaczej osoba z „nie wiem” nie zapisze zmian w profilu.)
4. **Istniejące dane w bazie testowej:** wcześniej zapisane profile nie mają stażu.
   Rekomendacja: migracja usuwa stare profile, testerzy przechodzą onboarding jeszcze raz,
   więc nie powstają zmyślone dane w stylu domyślnego „beginner”. OK?

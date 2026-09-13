# Rekordy: 1RM, rekordowa seria (tonaż) i najwięcej powtórzeń

## Cel

Zamiast jednego `PR` liczymy **trzy niezależne rekordy** dla każdego ćwiczenia z bazy:

| Typ | Odznaka | Co porównujemy | Dla jakich serii |
|---|---|---|---|
| **Max (1RM)** `one_rep_max` | `MAX` | szacowany ciężar na 1 powtórzenie: `kg × (1 + powt./30)` (Epley; 1 powt. = dokładny ciężar) | z obciążeniem (kg > 0) |
| **Rekordowa seria** `best_set_volume` | `SERIA` | tonaż jednej serii = kg × powt. | z obciążeniem (kg > 0) |
| **Najwięcej powtórzeń** `max_reps` | `POWT.` | liczba powtórzeń | na masie ciała (0 kg) |

Użytkownik **bez wcześniejszych wyników** dla danego ćwiczenia (pierwszy raz / nowy użytkownik) **nie widzi żadnego rekordu**.

## Przeczytane pliki

- `AGENTS.md`, pamięć, `prompts/empty-workout-session.md`
- `src/lib/{personal-records,live-workout-mappers,workout-history-mappers,live-workout-stats}.ts`
- `src/schemas/{live-workout,workout-history,user-profile-screen}.schema.ts`
- `src/db/schema.ts`, `src/db/repositories/workout-session.repository.ts`, `src/db/workout-history.ts`,
  `drizzle/0003_workout_session_sets.sql`, `src/db/__tests__/migrations.test.ts`
- `src/hooks/{use-live-workout,use-finish-live-workout}.ts`
- `src/components/live-workout/{LiveSetRow,LiveExerciseCard,FinishSummaryHeader,FinishWorkoutSection}.tsx`,
  `src/components/user-profile/{ExerciseLogItem,WorkoutExercisesSlide}.tsx`, `src/app/workout-session.tsx`

## Odpowiedzi użytkownika

1. Aplikacja była już uruchomiona na telefonie z migracją `0003` → **nowa migracja `0004`** (baza na telefonie zaktualizuje się sama, nic nie trzeba usuwać).
2. Odznaki: `MAX` i `SERIA` (+ `POWT.` dla masy ciała).
3. Dla ćwiczeń na masie ciała – rekord **najwięcej powtórzeń**.
4. Max = **szacowany 1RM**.

## Model danych (krok 1)

### Zod

```ts
// src/schemas/workout-history.schema.ts
PersonalRecordTypeSchema = z.enum(["one_rep_max", "best_set_volume", "max_reps"])

WorkoutSessionSetRowSchema:
-  isPersonalRecord: boolean
+  isOneRepMaxRecord: boolean
+  isBestSetVolumeRecord: boolean
+  isMaxRepsRecord: boolean

// src/schemas/live-workout.schema.ts
PersonalBestSchema = {
  catalogExerciseId,
  oneRepMaxKg: number ≥ 0 | null,      // null = brak serii z obciążeniem w historii
  bestSetVolumeKg: number ≥ 0 | null,
  maxReps: int ≥ 1 | null,             // null = brak serii na masie ciała
}
PERSONAL_RECORD_META: Record<PersonalRecordType, { short: "MAX" | "SERIA" | "POWT."; label: string; color: string }>
PersonalRecordHits = ReadonlyMap<setId, readonly PersonalRecordType[]>
```

### Baza – migracja `0004_personal_record_types`

```
workout_session_sets
+ is_one_rep_max_record       INTEGER NOT NULL DEFAULT 0
+ is_best_set_volume_record   INTEGER NOT NULL DEFAULT 0
+ is_max_reps_record          INTEGER NOT NULL DEFAULT 0
  UPDATE: stare is_personal_record = 1 → is_one_rep_max_record = 1 (najbliższe znaczenie: „najcięższa seria”)
- is_personal_record          (ALTER TABLE DROP COLUMN)
```

SQL generuję `drizzle-kit generate`, a przeniesienie wartości dopisuję ręcznie; test migracji na bazie z `0003` z danymi.

## Logika (`src/lib/personal-records.ts` – jedno źródło prawdy, używane też przez repozytorium)

- `estimateOneRepMaxKg(kg, reps)` = `reps === 1 ? kg : kg × (1 + reps / 30)`.
- **Punkt odniesienia** = historia z bazy sprzed tego treningu, **bez rozgrzewek `R` i nieudanych `NU`**:
  najlepszy 1RM i tonaż serii z serii kg > 0, najwięcej powtórzeń z serii 0 kg.
- **Rekord** = odhaczona seria robocza (drop set się liczy), której wynik jest **ściśle większy** niż w historii.
- Na trening: max **1 seria na typ rekordu na ćwiczenie** (najlepsza; remis → pierwsza).
- Brak wartości w historii dla danego typu (`null`) → **brak rekordu tego typu**
  (np. pierwszy raz, albo ktoś wcześniej robił pompki tylko z obciążeniem, a teraz bez).
- Zaokrąglanie przy wyświetlaniu: 1RM do 0,5 kg (np. „≈ 106,5 kg”), tonaż do 0,1 kg.

## UI

- **Wiersz serii (`SetRecordBadges`):** małe odznaki `MAX` / `SERIA` / `POWT.` obok ✓ (max 2 naraz – typy wagowe i masa ciała się wykluczają).
- **Podsumowanie:** „3 nowe rekordy 🔥” (każdy typ liczony osobno).
- **Profil:** `recordNote` np. „Max ≈ 106,5 kg • Rekordowa seria: 800 kg”; slajd „Osiągnięcia”: osobny wpis na każdy rekord
  („Nowy max – Wyciskanie: ≈ 106,5 kg (80 kg × 10)”, „Rekordowa seria – Wyciskanie: 800 kg”, „Najwięcej powtórzeń – Pompki: 30”).
- Eksport danych – trzy flagi.

## Kroki

- [x] 1. Zod (typy rekordów, 3 flagi, `PersonalBest`) + testy schematów
- [x] 2. Test migracji `0004` (baza z `0003` + dane) → `db/schema.ts` + migracja
- [x] 3. Testy `personal-records.ts` (1RM, 3 typy, ściśle większy, remis, R/NU, pierwszy raz, nowy użytkownik, masa ciała) → implementacja
- [x] 4. Testy repozytorium `getPersonalBests` → implementacja
- [x] 5. Testy + mappery (zapis sesji, profil, osiągnięcia, eksport)
- [x] 6. Testy + hooki (`personalRecordHits`)
- [x] 7. Testy + komponenty (`SetRecordBadges`, `LiveSetRow`, podsumowanie)
- [x] 8. Test integracyjny ekranu: 1. trening bez odznak, 2. trening bije `MAX` i `SERIA`, pompki → `POWT.`
- [x] 9. `npm test`, `npx tsc --noEmit`, `npm run lint`
- [x] 10. Podsumowanie

## Realizacja – uwagi

- `drizzle-kit generate` pyta interaktywnie (rename vs. nowa kolumna) → wygenerowano 2 migracje (dodanie / usunięcie kolumny)
  i złączono je w jedną `0004` + ręczny `UPDATE` przenoszący stare `is_personal_record` → `is_one_rep_max_record`;
  `drizzle-kit generate` po złączeniu: „No schema changes” (snapshot zgodny).
- Porównania rekordów zaokrąglane do 0,01 (błędy zmiennoprzecinkowe: 70 × 10 vs 80 × 5 dają ten sam 1RM).
- Profil: `recordNote` wyświetlany też na karcie historii (`WorkoutExercisesSlide`).
- Katalog ma nowe id ćwiczeń od commitu `457f29b` (inna sesja, np. pompki `1311`) – test integracyjny szuka ćwiczeń po nazwie,
  żeby nie zależeć od id.

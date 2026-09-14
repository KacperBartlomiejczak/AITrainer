# Plan: Training screen upgrades

Request (from chat, PL): rozbudowa ekranu treningów o dodawanie/usuwanie rutyn, kapsułka
aktywnego treningu nad nawigacją, naprawa klawiatury zasłaniającej input w karcie startu
treningu, oraz przebudowa karty ćwiczenia na zakładki wideo/statystyki/ranking znajomych.

This plan covers **4 sub-features**. Each follows the required order: (1) Zod schema /
type model, (2) test against that model, (3) implementation. Nothing gets built until
this plan is approved.

## Files read during research

- `src/app/workouts.tsx`, `src/components/workouts/{RoutineCard,RoutineListSection,WorkoutQuickActions}.tsx`
- `src/hooks/{use-routines,use-routine-library}.ts`, `src/lib/routine-mappers.ts`
- `src/db/repositories/routine.repository.ts`, `src/db/schema.ts` (cascade rules), `src/schemas/{routine,workout-history}.schema.ts`
- `src/app/workout-session.tsx`, `src/app/workout/[id].tsx`, `src/hooks/use-live-workout.ts`, `src/hooks/use-workout-detail.ts`
- `src/stores/{live-workout.store,active-workout.store}.ts`
- `src/components/live-workout/{LiveWorkoutHeader,FinishWorkoutSection,ExercisePickerModal,ExercisePickerSearchRow,LiveSetRow}.tsx`
- `src/app/_layout.tsx`, `src/components/navigation/PillNavbar.tsx`, `src/hooks/use-pill-navigation.ts`, `src/schemas/navigation.schema.ts`
- `src/components/exercises/{ExercisePreviewModal,ExerciseMediaPreview,ExercisePreviewMuscles,ExercisePreviewSteps,ExercisePreviewFooter}.tsx`
- `src/components/live-workout/{ExerciseProgressSheet,ExerciseProgressBody,ExerciseProgressSummaryTiles,ProgressLineChart,ProgressStatTile}.tsx`
- `src/lib/exercise-assets.ts`, `src/schemas/exercise-catalog.schema.ts`, `src/schemas/exercise-progress.schema.ts`
- `src/app/ranking.tsx`, `src/components/ranking/RankingLeaderboard.tsx`, `src/schemas/ranking.schema.ts`, `src/lib/mock-friends-feed.ts`, `src/schemas/friends-feed.schema.ts`
- `.agents/skills` listing (expo-router, expo-animation, expo-ui, frontend-design relevant)

## Decisions confirmed with you

1. **Delete routine**: long-press on a routine card → small action menu → destructive
   confirmation modal. Only user-created routines (`userId === "local"`) are deletable;
   built-in routines (`userId === null`) never show the delete affordance.
2. **Capsule scope**: reflects **both** the empty-workout flow (`live-workout.store`) and
   the routine-based flow (`active-workout.store`) — whichever is active. Shows a live
   ticking timer (updates every second).
3. **Exercise detail card**: one modal, **3 tabs**:
   - **Statystyki** (first/default tab) — user's progress/personal records, numeric
     stat tiles shown before the chart.
   - **Jak wykonać** — video (gif) + step-by-step instructions.
   - **Ranking znajomych** — mocked friends leaderboard for that exercise, reusing the
     🥇🥈🥉 medal convention already in `RankingLeaderboard.tsx`. Explicitly mock data,
     same as the existing `MOCK_FRIENDS_FEED` — there is no real friends/backend system
     in this app yet, so this is consistent with current app conventions, not new scope.
4. **Keyboard fix**: apply `KeyboardAvoidingView` (+ safe-area insets), matching the
   working pattern already used in `src/app/(onboarding)/step-name.tsx`, to every
   text-input entry point currently missing it.

---

## Feature A — Routine create & delete

### A1. Data model
- Extend `src/schemas/routine.schema.ts` `RoutineItemSchema` with `isUserCreated: boolean`
  (derived from `userId !== null` in `routine-mappers.ts`) so the UI knows which cards
  may be deleted, without leaking raw `userId` into the display shape.
- Add `DeleteRoutineInputSchema` (`{ routineId: RoutineIdSchema }`) in
  `workout-history.schema.ts` for the new repository method's input validation.
- No change needed to `NewUserRoutineSchema` — routine **creation** already has a full
  schema + working `routineRepository.create()`; only the UI to drive it is missing.
- New small schema for the create-routine form draft (title, description, level,
  daysPerWeek, durationMinutes, exercises: `{ catalogExerciseId, name, targetMuscle,
  sets, targetReps, restSeconds }[]`) — lives alongside `NewUserRoutineSchema` reuse,
  likely as a form-state type in `src/schemas/routine-form.schema.ts`.

### A2. Tests (written first)
- `routine.repository.test.ts`: add case for new `delete(routineId)` — deletes a
  user-owned routine and its `routineExercises` (cascade), throws/no-ops on a built-in
  routine id, no-ops on unknown id.
- `use-routines.test.ts`: exposes `deleteRoutine`, `createRoutine`; `isUserCreated` flag
  flows through `toRoutineItem` mapper.
- `RoutineCard.test.tsx`: delete affordance only rendered/triggerable when
  `routine.isUserCreated`; long-press fires the provided callback.
- New `CreateRoutineScreen` test: validates required fields, calls repository create with
  a payload matching `NewUserRoutineSchema`, navigates back to `/workouts` on success.

### A3. Implementation
- `routine.repository.ts`: add `delete(routineId): Promise<void>` (guard: only rows with
  non-null `userId` matching the current user get deleted; silently ignore otherwise).
- `routine-mappers.ts`: set `isUserCreated` on `toRoutineItem`.
- `RoutineCard.tsx`: `onLongPress` → confirmation flow (native `Alert.alert` with a
  destructive "Usuń" action — matches iOS/Android action-sheet conventions without
  building a bespoke popover component).
- `use-routines.ts` / `use-routine-library.ts`: add `deleteRoutine`, refresh list after
  delete.
- `WorkoutQuickActions.tsx`: wire the "Stwórz nową rutynę" button (currently an
  intentional no-op) to navigate to a new `src/app/routine/new.tsx` screen.
- New screen `src/app/routine/new.tsx` + `useCreateRoutine` hook (`src/hooks/`): form for
  title/description/level/daysPerWeek/durationMinutes, then reuses the existing
  `ExercisePickerModal` (already used in live workout) to add exercises, with a small new
  per-exercise config row (sets/targetReps/restSeconds) — modeled after `LiveSetRow`'s
  layout but for target config instead of logging. Submits via
  `routineRepository.create`.

---

## Feature B — Persistent "active workout" capsule above navigation

### B1. Data model
- No new persisted schema. Add a small pure selector/hook `useActiveWorkoutIndicator()`
  in `src/hooks/` that reads both `live-workout.store` and `active-workout.store` and
  returns one normalized shape: `{ kind: "empty" | "routine"; startedAt: number;
  label: string } | null`. This typed shape is the "data model" for this feature.

### B2. Tests
- `use-active-workout-indicator.test.ts`: returns `null` when both stores are empty;
  returns the empty-workout shape when `live-workout.store.session` is set; returns the
  routine shape when `active-workout.store.isActive`; if (hypothetically) both were set,
  documents which one wins (empty-workout takes priority, since it's the newer/richer flow).
- `ActiveWorkoutCapsule.test.tsx`: renders nothing when indicator is `null`; renders
  ticking elapsed time; tapping navigates to `/workout-session` or `/workout/[id]`
  depending on `kind`; not rendered while already on `workout-session` or `workout/[id]`.

### B3. Implementation
- New `src/components/navigation/ActiveWorkoutCapsule.tsx`: floating pill positioned
  `absolute`, directly above `PillNavbar`'s bottom offset (reuse
  `useSafeAreaInsets()` + a fixed capsule height + gap), live timer via existing
  `use-elapsed-seconds.ts` pattern, `Pressable` navigates to the right screen.
- Mount it once in `src/app/_layout.tsx` (same pattern as the existing `SplashScreen`
  overlay), gated on `useSegments()` so it hides on `workout-session` and `workout/[id]`.
- Reuse `expo-animation` skill guidance for enter/exit animation (Reanimated
  layout/fade) so it doesn't just pop in/out abruptly.

---

## Feature C — Fix keyboard covering inputs

### C1. Data model
- None — pure UI fix.

### C2. Tests
- Since RN's `KeyboardAvoidingView` behavior isn't meaningfully unit-testable (no real
  keyboard in Jest), tests only assert structure: the modal's root wraps its scrollable
  content in `KeyboardAvoidingView` with the expected `behavior` prop per platform. Manual
  verification is done in the iOS Simulator (typing into each fixed field, confirming
  it's visible above the keyboard) — noted explicitly, not claimed as automated coverage.

### C3. Implementation
- `FinishWorkoutSection.tsx`: wrap the `ScrollView` in
  `KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}` with
  `keyboardVerticalOffset` tuned for the `pageSheet` modal (no native header there, so a
  small fixed offset), matching `step-name.tsx`'s pattern.
- `ExercisePickerModal.tsx` (+ `ExercisePickerSearchRow.tsx`): same wrap so the search
  input never gets covered, and the list resizes instead of the input floating over it.
- `workout-session.tsx` main `ScrollView` (hosts `LiveSetRow` weight/reps inputs): wrap in
  `KeyboardAvoidingView` too, so rows near the bottom of a long exercise list stay visible
  when the numeric keyboard opens.

---

## Feature D — Exercise detail card: Stats / Jak wykonać / Ranking znajomych tabs

### D1. Data model
- New `src/schemas/exercise-detail-tabs.schema.ts`: `ExerciseDetailTabSchema =
  z.enum(["stats", "how_to", "leaderboard"])`.
- New `ExerciseLeaderboardEntrySchema` (mock, mirrors `LeaderboardUserSchema` shape but
  scoped to one exercise: `id, rank, displayName, isCurrentUser, bestWeightKg,
  bestRepsAtWeight`), plus `MAX_EXERCISE_LEADERBOARD_ENTRIES` cap — lives in
  `src/schemas/exercise-progress.schema.ts` next to the existing progress schemas.
- New generic `src/components/ui/segmented-tabs.tsx` primitive (role="tablist" pattern),
  since none exists — modeled on the manual `Pressable` row already in
  `RankingHeader.tsx`, but reusable (props: tabs, activeId, onChange).

### D2. Tests
- `segmented-tabs.test.tsx`: renders all tabs, marks the active one via
  `accessibilityState.selected`, calls `onChange` on press.
- `mock-exercise-leaderboard.test.ts`: validates the mock generator's output against
  `ExerciseLeaderboardEntrySchema`, exactly one `isCurrentUser`, ranks are 1..N unique.
- `ExerciseDetailModal.test.tsx` (new, replacing/wrapping current
  `ExercisePreviewModal` + `ExerciseProgressSheet` tests): defaults to "stats" tab,
  switching tabs shows the right content, "Jak wykonać" shows both media and steps
  together, closing/opening preserves entry point behavior used by
  `ExercisePickerModal` and `LiveWorkoutExerciseList`.

### D3. Implementation
- Merge `ExercisePreviewModal` (media + muscles + steps) and `ExerciseProgressSheet`
  (stats chart) into one `ExerciseDetailModal` using `segmented-tabs`:
  - **Statystyki** tab (default): existing `ExerciseProgressSummaryTiles` moved above
    `ProgressLineChart` (tiles-first, per your emphasis), reusing `ExerciseProgressBody`.
  - **Jak wykonać** tab: existing `ExerciseMediaPreview` + `ExercisePreviewSteps`
    (+ `ExercisePreviewMuscles` chips) together on one screen, per your instruction that
    video and instructions appear together on that tab.
  - **Ranking znajomych** tab: new `ExerciseLeaderboardList` using the mocked entries,
    reusing the medal-emoji convention (🥇🥈🥉) from `RankingLeaderboard.tsx`
    (factor `getRankBadge` out into a small shared helper instead of duplicating it).
- Update the two call sites (`ExercisePickerModal`'s preview action and
  `LiveWorkoutExerciseList`'s `onShowExercise`/`onShowProgress`) to both open the same
  `ExerciseDetailModal`, just with a different initial tab.
- Keep `ExercisePreviewFooter`'s "Dodaj do treningu" action only relevant/visible from
  the picker entry point (routine-building/leaderboard-browsing entry points don't need
  an "add" button).

---

## Suggested build order

C (quick, isolated fix) → A (routine create/delete) → B (capsule) → D (exercise modal
merge, largest UI change). Each feature gets its own commit.

## Final checks before reporting done (per every feature)

- `npm test` — all tests green, existing tests not modified to "make them pass"
- `npx tsc --noEmit` — no type errors, zero `any`
- `npm run lint` — no violations
- Manual pass in the iOS Simulator for C (keyboard) and B/D (visual/animation) since
  those aren't meaningfully covered by Jest

---

Let me know if this matches what you want, or if anything above should change, before I
start on Feature C.

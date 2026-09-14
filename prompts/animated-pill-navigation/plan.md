# Plan: Animated pill navigation (5 tabs + AI mentor placeholder)

Request (from chat, PL): rozbudowa dolnej nawigacji do 5 zakładek — **Home, Treningi,
AI mentor, Ranking, Twój profil** — z płynną animacją aktywnego koloru (wskaźnik
przesuwa się z lewej do prawej / z prawej do lewej). Ekran AI mentor na razie jako
placeholder.

Order per AGENTS.md: (1) Zod schema + typy, (2) testy, (3) implementacja.
Nothing is built until this plan is approved.

## Files read during research

- `AGENTS.md`, memory `wait-for-plan-approval`
- `src/app/_layout.tsx` — root `Stack` (`animation: "fade"`), splash overlay, onboarding guard
- `src/app/{index,workouts,ranking,user-profile}.tsx` — every tab screen renders its **own** `<PillNavbar />`
- `src/components/navigation/{PillNavbar,PillNavItem,index}.tsx`
- `src/hooks/use-pill-navigation.ts` — `DEFAULT_NAV_TABS`, pathname → active tab, `router.push`
- `src/schemas/navigation.schema.ts` — `NavTabIdSchema`, `NavItemSchema`, `NavTabListSchema`
- `src/components/navigation/__tests__/pill-navbar.test.tsx`, `src/hooks/__tests__/use-pill-navigation.test.ts`
- `src/app/__tests__/{layout,routes-structure,index,workouts,ranking,user-profile}.test.tsx`
- `jest.config.js`, `src/__mocks__/lucide-react-native.js`
- `.agents/skills/expo-animation/{SKILL,RECIPES}.md` (recipe "Tab / segmented indicator")
- `.agents/skills/expo-router/SKILL.md`, `references/tabs.md`
- `prompts/training-screen-upgrades/plan.md` (uncommitted work on this branch — floating
  "active workout" capsule above the navbar)

## Root problem — why a sliding indicator is impossible today

Each tab screen mounts its own `PillNavbar`, and tab presses call `router.push` onto the
root Stack. Switching tabs = a **new navbar instance** is created on the new screen, so
there is no "previous position" to animate from. On top of that, every tab press grows
the navigation history (Home → Treningi → Home → … all stacked).

## Proposed architecture (recommended)

Move the 5 tab screens into a route group `src/app/(tabs)/` with an Expo Router
`Tabs` layout and a **custom `tabBar`** that renders our `PillNavbar` **once**:

```
src/app/
  _layout.tsx            Stack (unchanged: splash, onboarding, workout/[id], exercises…)
  (tabs)/
    _layout.tsx          <Tabs tabBar={(props) => <PillNavbar {...} />} screenOptions={{ headerShown:false, animation:"none" }} />
    index.tsx            Home          → "/"
    workouts.tsx         Treningi      → "/workouts"
    ai-mentor.tsx        AI mentor     → "/ai-mentor"   (NEW placeholder)
    ranking.tsx          Ranking       → "/ranking"
    user-profile.tsx     Twój profil   → "/user-profile"
```

- URLs stay identical (groups add no URL segment) → deep links / `router.push("/workouts")` keep working.
- The navbar is persistent → the active pill **slides** between tabs (Reanimated shared values).
- Tabs don't stack history; screen switch has no slide (expo-animation rule: tabs are peers,
  only the indicator moves).
- Screens drop their own `<PillNavbar />` render.

## Animation design (expo-animation skill)

- Gate: tab switch = high-frequency → **screens don't animate**; the **indicator** does
  (purpose: *state indication / spatial consistency*). Duration kept short: 250 ms.
- Recipe "Tab / segmented indicator": one absolutely positioned, childless `Animated.View`
  (the blue `#007AFF` pill) behind the items. Each item reports `x`/`width` via `onLayout`
  (measured once, not per frame); on `activeTab` change → `withTiming(x)` +
  `withTiming(width)`, easing `Easing.bezier(0.77, 0, 0.175, 1)` (ease-in-out, on-screen movement).
- Icon/label color: Reanimated CSS transition (`transitionProperty: "color"`, 200 ms) or
  simple interpolation, white on active, `#71717A` inactive.
- Press feedback: `scale 0.97`, 120 ms.
- `useReducedMotion()` → indicator jumps (duration 0), colors still change.
- Everything on the UI thread — no `setState` per frame.
- (Optional, see question 3) `expo-haptics` `selectionAsync()` on press.

## Steps

1. [x] **Schema** `src/schemas/navigation.schema.ts`
   - `NavTabIdSchema`: `["home","workouts","ai-mentor","ranking","profile"]`
   - `iconName` enum + `"Sparkles"` (lucide) for AI mentor
   - New `NavItemLayoutSchema` `{ x: number ≥ 0, width: number > 0 }` + `NavItemLayout` type
   - Schema tests in `src/schemas/__tests__/`
2. [x] **Tests first**
   - `use-pill-navigation.test.ts`: 5 tabs in order, `/ai-mentor` → `"ai-mentor"`,
     tab navigation uses `router.navigate` (no stacking) — **existing assertions
     (4 tabs, labels "Start/Trening/Profil", `router.push`) must change** → see question 4
   - `pill-navbar.test.tsx`: 5 testIDs + Polish labels, active state, indicator rendered
     (`testID="pill-nav-indicator"`)
   - New `src/app/__tests__/ai-mentor.test.tsx`: placeholder renders title + "wkrótce"
   - New `src/app/__tests__/tabs-layout.test.tsx`: `(tabs)/_layout` renders `Tabs` with custom tab bar
   - `routes-structure.test.ts` must still pass (no URL collisions)
   - New `src/hooks/__tests__/use-tab-indicator.test.ts` (not in the original list, needed
     once the indicator hook was split out)
3. [x] **Hook** `src/hooks/use-pill-navigation.ts` — 5 tabs, labels, `ai-mentor` path detection
4. [x] **Hook** `src/hooks/use-tab-indicator.ts` — layouts map, shared values, animated style,
   reduced motion (logic out of component per AGENTS.md)
5. [x] **Components** (< 100 lines each)
   - `PillNavbar.tsx` — container + `<TabIndicator />` + items; accepts `activeTab` + `onTabPress`
   - `TabIndicator.tsx` — the sliding pill (new)
   - `PillNavItem.tsx` — transparent bg, reports `onLayout`, animated color, a11y (`tab` role, `selected`)
6. [x] **Routes** — move 4 screens into `src/app/(tabs)/`, add `(tabs)/_layout.tsx`
   and `(tabs)/ai-mentor.tsx` placeholder (ikona, "AI Mentor", "Wkrótce…", dark style),
   remove per-screen `<PillNavbar />`; update root `_layout.tsx` if needed
   (`initialRouteName`)
7. [x] Home "Zapytaj trenera" (`router.push("/ai-coach")` → dead route today) → `/ai-mentor`
8. [x] `npm test`, `npx tsc --noEmit`, `npm run lint` — all green
9. [x] Summary + how to verify on device

## Deviations from the original plan

- Added `expo-haptics` as a real dependency (`npx expo install expo-haptics`, SDK-matched
  `~57.0.3`) — it wasn't in package.json yet.
- Icon/label color: implemented as an nativewind CSS transition
  (`transition-colors duration-200`) rather than a hand-written Reanimated interpolation —
  the plan explicitly allowed "or simple interpolation" as a fallback; lucide icons take a
  `color` prop (not a style), so the icon's own color switch is instant/synchronous while the
  label text fades via the transition class.
- `jest.config.js` gained `modulePathIgnorePatterns`/`watchPathIgnorePatterns` for
  `.claude/worktrees/` — an unrelated stray git worktree in the repo was causing Jest
  haste-map collisions and a phantom failing test suite on every run.
- Mid-implementation, another concurrent session committed unrelated in-progress work
  (`feat(workouts): add routine creation and deletion`) onto `feat/live-workout-session`
  and briefly switched this shared working directory to a different branch
  (`feat/training-screen-upgrades`). Flagged to the user and checked back out to
  `feat/animated-pill-navigation` before continuing — see chat for details.

## Decisions (answered in chat, 2026-09-14)

1. **Architecture** — approved: move the tab screens into `src/app/(tabs)/` with an
   Expo Router `Tabs` layout + custom `tabBar` rendering `PillNavbar` once.
2. **Labels & fit** — approved: icon on top, small label under it, for all 5 tabs
   (option a). Labels: "Home", "Treningi", "AI mentor", "Ranking", "Twój profil".
3. **Haptics** — approved: add `expo-haptics` (new dependency), `selectionAsync()` on
   tab press.
4. **Existing tests** — approved: update the existing navbar/hook test assertions
   (tab count, labels) and import paths to match the new 5-tab structure.
5. **Branch** — approved: create a new branch `feat/animated-pill-navigation` from the
   current state; leave the uncommitted `feat/live-workout-session` work untouched.

# CLAUDE.md

Guidance for Claude Code when working in this repository. This is a real operational tool, not a demo — keep the mission front and center.

## Mission

A React Native / Expo **iPad app for Spiced Academy** that replaces the paper sign-out sheet used when students forget their campus access card. Students borrow a numbered day-pass and return it; staff get live visibility and automated overdue email reminders.

The paper system fails because students forget to sign out/in, leave with the pass, and there is no reliable digital history or follow-up. This app fixes that with a fast, shared front-desk workflow.

**Design priorities, in order:** speed for student flows → clarity for staff flows → automation that cuts admin work → keeping student-facing and staff-facing concerns separate.

## Current Focus (read this first)

The app is past proof-of-concept. The current goal is **reliability for real front-desk use** — harden what exists rather than add features. See [Next Steps](#next-steps) for the prioritized list. The biggest open risks are the overdue-marking reliability and the fact that the entire email/automation backend lives only in the Supabase dashboard, not in this repo.

## Tech Stack

- **React Native 0.81 + Expo SDK 54** (new architecture enabled, React Compiler experiment on, typed routes on)
- **Expo Router 6** — file-based routing, plain `Stack` navigator (no tabs)
- **TypeScript** (strict)
- **Supabase** (`@supabase/supabase-js`) — Postgres, RLS, Edge Functions, `pg_cron`
- **Resend** — transactional reminder emails, sending domain `passes.aidanherstik.com` (registered via Namecheap)
- Styling: **plain `StyleSheet` + a `COLORS` token object** in `lib/theme.ts`. **Not** NativeWind/Tailwind. Visual direction references `https://www.spiced-academy.com/en` (purple-forward).

### Why this stack

- **Expo** — the target is a single shared front-desk iPad, so a full custom native setup is overkill. Expo gives fast iteration, easy on-device testing, and a low-maintenance path to a tablet build. Expo Router keeps navigation file-based: add a file under `app/` to add a screen.
- **Supabase** — one service covers everything this app needs: hosted Postgres, a React Native client SDK, Row Level Security, server-side Edge Functions, and cron scheduling. That lets a solo/small team run the full borrow→return→reminder workflow without standing up separate backend infrastructure.
- **Resend + own domain** — reliable transactional email from a verified sending subdomain, driven from the Edge Function rather than the client (see [Reminder System](#reminder--automation-system)).

## Setup & Commands

```bash
npm install          # install deps
npm start            # expo start (dev server / QR)
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # web (static output)
npm run lint         # expo lint (eslint-config-expo)
```

There is no test suite and no CI.

### Environment variables

Create `.env` in the project root (see `.env.example`). **Exact names matter** — `lib/supabase.ts` reads them with non-null assertions, so a missing value crashes the client at runtime:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

`PUBLISHABLE_KEY` is Supabase's newer name for the **anon/public key** — it is safe to ship in the client because Row Level Security protects the data. (Do **not** assume an `ANON_KEY` name; the code uses `PUBLISHABLE_KEY`.)

> `.env` is currently **tracked in git**. The publishable key is client-safe so this is low risk, but to stop tracking it: `git rm --cached .env` then commit. `.gitignore` already lists `.env` so it will be ignored once untracked.

## Architecture

### Data flow

```
Screen (app/*.tsx)
  → context method (context/PassContext.tsx)
    → API helper (lib/passRecordsApi.ts)
      → Supabase client (lib/supabase.ts) → pass_records table
```

Screens never call Supabase directly. All DB reads/writes go through `passRecordsApi`, which is consumed by `PassContext`, which screens consume via `usePassContext()`. Keep this layering.

### Providers

`app/_layout.tsx` nests: `StaffAuthProvider` → `PassProvider` → `Stack`.

- **`PassContext`** — holds `passRecords` in state, exposes `borrowPass`, `borrowPassWithExistingEmail`, `returnPass`, `markPassOverdue`, `checkForOverduePasses`. Fetches all records on mount and re-fetches after every mutation.
- **`StaffAuthContext`** — single `isStaffAuthenticated` boolean, **in-memory only** (`useState(false)`). Resets on app reload and is cleared when leaving the staff screen.

### snake_case (DB) ↔ camelCase (app)

The DB uses snake_case columns; the app uses camelCase. Mapping happens manually in `PassContext.fetchPassRecords` and in the `passRecordsApi` insert payloads. This is intentional — keep SQL idiomatic and React idiomatic. When adding a column, update both the mapping and `types/pass.ts`.

### Files

```
app/
  _layout.tsx          # providers + Stack
  index.tsx            # Home: Borrow / Return / Staff
  borrow-options.tsx   # "new" vs "returning" borrower fork
  borrow.tsx           # new borrower: name + email + pass number
  borrow-existing.tsx  # returning borrower: email + pass number (looks up name)
  return.tsx           # return by pass number only
  staff-login.tsx      # 4-digit passcode keypad
  staff.tsx            # borrowed / returned / overdue + reminder timestamps
  full-history.tsx     # full activity history with date filtering
components/            # AppButton, FormInput, LoadingIndicator, ScreenWrapper
context/               # PassContext, StaffAuthContext
lib/                   # supabase (client), passRecordsApi (DB helpers), theme (COLORS)
types/pass.ts          # PassRecord type
```

## Data Model

Single table: **`pass_records`** (schema lives in Supabase, not in repo — there is no `supabase/migrations/` here).

| Column | Notes |
|---|---|
| `id` | uuid PK |
| `student_name` | text |
| `email` | text — the identity key for returning borrowers |
| `pass_number` | text |
| `borrowed_at` | text — local **time** string (`toLocaleTimeString`) |
| `borrowed_date` | text — local **date** string (`toLocaleDateString`) |
| `returned_at` | text — local time string, null until returned |
| `status` | `borrowed` \| `returned` \| `overdue` |
| `created_at` | timestamptz — used for ordering |
| `first_reminder_sent_at` | timestamptz, written by the Edge Function |
| `second_reminder_sent_at` | timestamptz, written by the Edge Function |

`PassRecord` (camelCase) is in `types/pass.ts`.

> **Timestamp debt:** `borrowed_at` / `borrowed_date` / `returned_at` are free-text local strings, not real timestamps. This makes cross-day overdue logic and reliable sorting harder. A future cleanup is to move to proper `timestamptz` columns. `created_at` is the only trustworthy ordering field today.

There is a **partial unique index** enforcing one active (`borrowed`) row per `pass_number`, plus an app-level guard (`isPassCurrentlyInUse` / `hasActivePassForStudent`) so a student can't hold two active passes and a pass can't be double-issued.

## Screens & Flows

### Home (`index.tsx`)
Three buttons → Borrow / Return / Staff.

### Borrow (forked for speed)
`borrow-options.tsx` asks "never borrowed before" vs "borrowed before":
- **New** (`borrow.tsx`): enter name + email + pass number → insert.
- **Returning** (`borrow-existing.tsx`): enter email + pass number → `findLatestPassRecordByEmail` pulls the prior `student_name` → insert without re-typing the name.

**Why email, not name, for lookup:** names aren't unique enough and produced wrong matches. Email is a safer identifier while still cutting friction for repeat users.

### Return (`return.tsx`)
Pass number only → `markPassReturnedInDb` flips the active `borrowed` row to `returned`. Kept minimal because the physical pass number is the natural identifier when handing it back.

### Staff (`staff-login.tsx` → `staff.tsx`)
Passcode gate, then three sections (Currently Borrowed / Returned / Overdue) plus per-record reminder timestamps and a **Full History** button. On mount it runs `checkForOverduePasses()`; each borrowed card has a manual **Mark Overdue** action.

### Full History (`full-history.tsx`)
Complete activity history with date filtering. Works, but slated for further improvement (search, richer filtering).

## Staff Access Model (deliberate decision)

Staff authenticate with a **shared passcode, not individual accounts.** No usernames, no email/password, no onboarding — it's a shared front-desk iPad and speed matters. **Preserve this philosophy.** Do not introduce per-staff auth.

Current implementation caveats (both are hardening targets, not the intended end state):
- The passcode is a **hardcoded constant** `STAFF_PASSCODE = "7842"` in `app/staff-login.tsx` — it ships in the client bundle and is committed to git.
- `StaffAuthContext` is **in-memory only**, so a reload drops you back to unauthenticated, and there's no auto-lock timer. Route protection is "front-door": `staff.tsx` redirects to `staff-login` if not authenticated, but the gate isn't enforced server-side.

## Reminder / Automation System

Overdue reminder emails are **server-side**, not in the app:

- A **Supabase Edge Function** reads unresolved `pass_records`, calls **Resend** to email students, and writes back `first_reminder_sent_at` / `second_reminder_sent_at` so the same reminder isn't sent twice.
- **First reminder:** pass still borrowed/overdue and no first reminder yet. **Second reminder:** first was sent on a prior day and the pass is still unresolved.
- A **`pg_cron` job runs daily at 18:30**, using `pg_net` to POST to the Edge Function URL, with the function URL + auth pulled from Vault/stored secrets. Function secrets include `RESEND_API_KEY` and `FROM_EMAIL`.

**Why server-side:** emails must fire even when the iPad app is closed, secrets must stay off the client, and scheduled jobs belong in the backend.

> ⚠️ **This entire backend (Edge Function code, cron job, secrets, RLS policies, table schema) exists only in the Supabase dashboard. None of it is in this repo.** A fresh session cannot see or change it from the code. Version-controlling it (`supabase/functions/`, migrations) is a high-priority next step — see below.

## Overdue Logic — Two Separate Systems

1. **Client-side** (`PassContext.checkForOverduePasses`, run on staff-screen mount): if local time is **past 18:30**, flips still-`borrowed` rows with no `returned_at` to `overdue`. Plus a manual **Mark Overdue** button per card (`markPassOverdue`, bypasses the cutoff).
2. **Backend** (Edge Function + cron): the email reminders above. This path is reported working.

### Known issue: client-side overdue marking is unreliable

The code path **is** wired (`staff.tsx` → `checkForOverduePasses` / `markPassOverdue` → `markPassOverdueInDb`) and looks correct, but overdue marking has been unreliable in practice. Investigate in this order before changing logic:

1. **RLS UPDATE policy on `pass_records`** for the publishable/anon role. If UPDATE is blocked, the update returns **no rows and often no error** — `markPassOverdueInDb` / `markPassReturnedInDb` would silently no-op. (If returns work but overdue doesn't, RLS is less likely the sole cause.) Verify the role can UPDATE `status`.
2. **The 18:30 local-time cutoff.** `checkForOverduePasses` silently no-ops before 18:30, so testing earlier in the day looks "broken." The manual Mark Overdue button is the cutoff-free way to test the UPDATE path in isolation.
3. **No user feedback on failure.** Mutations log to console but don't surface errors in the UI, so silent failures look like nothing happened. Adding visible success/error feedback will make the real cause obvious.

## What's Built

Home, borrow-options fork, new/returning borrow, return, staff (3 sections + reminder timestamps), full history with date filtering, staff passcode gate. Shared state via two contexts. Supabase `pass_records` with indexes + partial unique index + RLS. DB access isolated in `passRecordsApi`. Manual + cutoff-based overdue. Reminder Edge Function + Resend + daily 18:30 cron, manually tested. Loading indicator, button-disable-on-submit, scrollable staff screen.

## Known Issues & Gaps

- Client-side overdue marking unreliable (see above) — **top priority**.
- Backend (Edge Function / cron / secrets / schema / RLS) is **not version-controlled**.
- Staff passcode is hardcoded in the client; staff auth is in-memory with no auto-lock; no server-side route protection.
- Free-text date/time columns instead of real `timestamptz` (timestamp debt).
- No mutation error feedback in the UI.
- `expo-sqlite` is a dependency + plugin but appears **unused** (likely template leftover — candidate for removal).
- No tests, no CI.

## Git Workflow

- Default branch is **`master`** (there is no `main`). Work has been happening on `codex/explore-codex-capabilities-in-campus-pass-repo-azh33y`.
- **Intended going forward:** consolidate the codex branch into `master`, treat `master` as the trunk, and use short-lived feature branches off it (`feature/`, `fix/`, `chore/`, `refactor/`).
- **Conventional commits:** `feat:`, `fix:`, `chore:`, `refactor:`.
- This file (`CLAUDE.md`), `.env.example`, and the `.gitignore` change may be uncommitted when you arrive — commit them.

## Next Steps

Ordered for **reliability for real front-desk use** (the current goal). Everything below the line is backlog.

**P0 — make it trustworthy**
1. Fix client-side overdue marking. Verify the RLS UPDATE policy on `pass_records` first, then the 18:30 cutoff, then add UI error feedback (see [Known issue](#known-issue-client-side-overdue-marking-is-unreliable)).
2. Bring the backend into version control: create `supabase/functions/` for the reminder Edge Function and `supabase/migrations/` for the schema/RLS. Document the cron job and required secrets (`RESEND_API_KEY`, `FROM_EMAIL`) in this repo.
3. Confirm reminder emails actually fire on the 18:30 cron in production (not just manual invocation), and that first/second reminder gating works across days.

**P1 — harden + operate**
4. Move the staff passcode out of a client constant (env/Supabase-checked), persist staff auth across reload, and add auto-lock on inactivity.
5. Add visible success/error feedback on borrow/return/overdue mutations.
6. Migrate the free-text date/time fields to proper `timestamptz` columns and simplify overdue/sorting logic on top of them.

**Backlog (only after the above)**
- Staff page search/filter; richer full-history filtering.
- Dedicated `students` table for stronger identity modelling.
- Dashboard-style staff summaries/stats.
- Stronger (server-enforced) staff route protection.
- First-time borrower email confirmation.
- Deeper reminder send-history logging.
- Visual polish aligned with Spiced Academy branding; remove unused `expo-sqlite`.

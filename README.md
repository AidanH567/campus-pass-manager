# Campus Pass Manager

Campus Pass Manager is a mobile-first application for managing the lifecycle of campus passes used by students and staff. The app supports borrowing, returning, and staff-side monitoring of active and overdue passes, with data persisted in Supabase.

## Overview

Many campuses rely on physical passes for temporary access to facilities, events, or resources. This project provides a streamlined workflow to:

- Record when a pass is borrowed.
- Record when a pass is returned.
- Reuse known borrower details for faster checkout.
- Give staff a live operational view of borrowed, returned, and overdue passes.

The goal is to improve accountability, reduce manual tracking overhead, and provide a clear record of pass movement throughout the day.

## Core Features

- **Borrow pass (new borrower):** Capture student name, email, and pass number.
- **Borrow pass (returning borrower):** Look up a previous borrower by email and issue a new pass quickly.
- **Return pass:** Mark a pass as returned by pass number.
- **Staff dashboard:** View currently borrowed, returned, and overdue passes.
- **Overdue handling:** Staff can manually mark records overdue, and the app includes an overdue check routine based on cutoff time.

## User Roles and Workflows

### Students / General Users
- Borrow a pass using the standard form.
- Return a pass when finished.

### Staff
- Access the staff area through the staff login screen.
- Monitor pass status across all records.
- Mark borrowed passes as overdue when required.

## Technical Architecture

- **Frontend:** React Native with Expo.
- **Routing:** `expo-router` with file-based routes.
- **Language:** TypeScript.
- **State Management:** React Context (`PassProvider`) for app-wide pass state and actions.
- **Backend/Data:** Supabase (`@supabase/supabase-js`) using a `pass_records` table.

### High-level Data Flow
1. UI screens trigger actions (borrow, return, overdue updates).
2. Context methods call API helpers in `lib/passRecordsApi.ts`.
3. Supabase reads/writes are performed against `pass_records`.
4. Updated records are fetched and mapped back into app state.

## Project Structure

- `app/` – Route-based screens (home, borrow, return, staff).
- `context/PassContext.tsx` – Global pass state and business logic.
- `lib/supabase.ts` – Supabase client setup.
- `lib/passRecordsApi.ts` – Database operation helpers.
- `types/pass.ts` – Core pass record type definitions.
- `components/` – Reusable UI components.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI runtime via project dependencies
- A Supabase project with the required `pass_records` schema

### Installation

```bash
npm install
```

### Environment Variables

Create an `.env` file (or equivalent Expo env configuration) with:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key
```

### Run the App

```bash
npm run start
```

Optional platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

## Quality and Validation

Run lint checks:

```bash
npm run lint
```

## Security Notes

This repository currently includes a local staff passcode flow for access to the staff view. For production environments, replace client-side passcode checks with a secure server-backed authentication and authorization model.

## Roadmap Ideas

- Add role-based authentication for staff accounts.
- Implement server-side scheduled overdue processing.
- Add reminder notification delivery tracking and retry logic.
- Add automated tests for borrow/return/overdue workflows.
- Add analytics for pass utilization trends.

## License

This project is currently unlicensed. Add a license file before public distribution.

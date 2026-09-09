# kwits

A collaborative travel expense-splitting mobile app. A host creates a trip, invites peers, and expenses are logged with receipts (OCR or manual entry). Each expense is split either equally or with custom per-person amounts, and repayment is tracked through a proof-upload-and-confirm loop. No real money moves through the app — all amounts are Philippine Peso (PHP) only, and settlement happens off-app (e.g. GCash, bank transfer) with a photo of the payment as proof.

This repo is the **mobile client only**. It talks to exactly one backend:

```
kwits-mobile  ->  kwits-api  ->  Supabase (Auth + Postgres)
```

The app never calls Supabase directly — not for auth, not for storage, not for data. Everything goes through [kwits-api](../kwits-api), which is the only service holding Supabase credentials. The two repos are cloned as siblings under one folder; see [HOW_TO_SETUP.md](./docs/HOW_TO_SETUP.md).

## Tech stack

| Layer | Technology |
| --- | --- |
| App framework | React Native (`0.86.2`) + Expo (`~57.0.14`), file-based routing via Expo Router |
| Dev/runtime target | Expo **development build** via `expo-dev-client` (`~57.0.18`) — not Expo Go |
| Backend | [kwits-api](../kwits-api) (Spring Boot), reached over HTTP via `src/lib/api.ts` |
| Client state | Zustand (`zustand`) + AsyncStorage for the persisted auth token |
| Styling | NativeWind (Tailwind for React Native) |
| Forms & validation | React Hook Form + Zod |
| Maps | MapLibre (`@maplibre/maplibre-react-native`) + MapTiler tiles |
| Receipt capture | `expo-camera` + `expo-image-picker` |
| Language | TypeScript (strict mode) |

Two dependencies are installed but not yet wired into anything: `@tanstack/react-query` (no `QueryClientProvider` exists yet — the current screens fetch with plain `useEffect`) and receipt OCR, which is modeled in the data layer (`EntryMethod: "ocr" | "manual"` in `src/types/expense.ts`) with no OCR library attached.

## Project structure

```
app/                                  Expo Router routes (file-based)
├── _layout.tsx                       Root stack; restores the stored session on launch
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx                     Email/password form, posts to kwits-api
│   └── register.tsx                  Placeholder
├── (tabs)/                           Bottom tab navigator
│   ├── _layout.tsx
│   ├── index.tsx                     Dashboard tab; fetches GET /plans
│   ├── trips.tsx                     Trips tab
│   └── profile.tsx                   Profile tab
├── onboarding/                       First-run flow (index + 3 steps)
├── plans/
│   ├── create/index.tsx              Create a travel plan
│   └── [planId]/
│       ├── index.tsx                 Plan detail
│       ├── invite/index.tsx          Invite peers to a plan
│       └── expenses/
│           ├── create/index.tsx      Log a new expense
│           └── [expenseId]/
│               ├── index.tsx         Expense detail
│               └── pay.tsx           Upload payment proof
└── profile/
    └── qr-codes/index.tsx            Manage payment QR codes

src/
├── lib/
│   ├── api.ts                        kwits-api client; the app's only network boundary
│   ├── auth.ts                       Auth store: token + user, persisted to AsyncStorage
│   └── onboarding.ts                 Onboarding-completed flag
├── features/                         Per-feature components/hooks (scaffolded, empty)
│   ├── auth/  dashboard/  expenses/  payments/  plans/
├── components/
│   ├── steppers/StepDots.tsx         Onboarding step indicator
│   └── ui/                           (empty)
├── hooks/                            (empty)
├── types/                            Domain types: User, TravelPlan, Expense, OwerBalance, PaymentProof, UserPaymentQR
└── utils/
    └── split.ts                      Equal/custom expense-split calculations
```

The database schema and the Supabase CLI project live in [kwits-api](../kwits-api), which owns them. There is no `supabase/` folder here and no database tooling in `package.json`.

## Running it

This app **cannot run in Expo Go.** MapLibre, `expo-camera`, and `expo-image-picker` are native modules Expo Go does not bundle, so the app runs as an Expo development build: a native binary of this app with `expo-dev-client` embedded, installed on an emulator or a real phone and driven by a Metro dev server. The first build is local Gradle (10-20 minutes); after that the day-to-day loop is `npm run start:dev` plus opening the app.

iOS builds are not possible on Windows and go through EAS Build's cloud service instead. See [docs/HOW_TO_RUN.md](./docs/HOW_TO_RUN.md) for both paths.

## Configuration

One variable does the work: `API_BASE_URL` in `.env`, surfaced to the app through `app.config.ts` as `Constants.expoConfig.extra.apiBaseUrl`. See `.env.example` for the full list and for why the Android emulator needs `10.0.2.2` instead of `localhost`.

## Branching model

PRs only — no direct pushes to `dev`, `staging`, or `prod`. The flow between branches is enforced by a GitHub Action (`.github/workflows/enforce-branch-flow.yml`), not just convention:

- **`dev`** — active development. Feature branches PR into `dev`.
- **`staging`** — a batch of `dev` changes promoted for QA. Only PRs from `dev` are accepted here.
- **`prod`** — a verified `staging` build promoted to production. Only PRs from `staging` are accepted here.

## Documentation

| Doc | What it covers |
| --- | --- |
| [docs/HOW_TO_SETUP.md](./docs/HOW_TO_SETUP.md) | Fresh machine to a working build: Node, Android SDK, cloning both repos, `.env` |
| [docs/HOW_TO_RUN.md](./docs/HOW_TO_RUN.md) | The day-to-day dev loop, native rebuilds, running on a physical device over wireless adb, EAS builds, CI checks, PR flow |
| [docs/HOW_TO_DEBUG.md](./docs/HOW_TO_DEBUG.md) | Troubleshooting runbook: Android native build failures on Windows, kwits-api connectivity, and physical-device/wireless-debugging problems |

Backend setup and running lives in [kwits-api/docs](../kwits-api/docs).

## Getting started

- New to the project? Follow [docs/HOW_TO_SETUP.md](./docs/HOW_TO_SETUP.md) to configure your machine.
- Already set up? See [docs/HOW_TO_RUN.md](./docs/HOW_TO_RUN.md) for the day-to-day dev loop, builds, and PR flow.
- Expecting to scan a QR code with Expo Go? You can't — see "Running it" above.

# kwits

A collaborative travel expense-splitting mobile app. A host creates a trip, invites peers, and expenses are logged with receipts (OCR or manual entry). Each expense is split either equally or with custom per-person amounts, and repayment is tracked through a proof-upload-and-confirm loop. No real money moves through the app — all amounts are Philippine Peso (PHP) only, and settlement happens off-app (e.g. GCash, bank transfer) with a photo of the payment as proof.

## Tech stack

| Layer | Technology |
| --- | --- |
| App framework | React Native (`0.86.2`) + Expo (`~57.0.14`), file-based routing via Expo Router |
| Data fetching / cache | TanStack Query (`@tanstack/react-query`) |
| Forms & validation | React Hook Form + Zod |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Maps | MapLibre (`@maplibre/maplibre-react-native`) + MapTiler tiles |
| Receipt capture | `expo-camera` + `expo-image-picker` |
| Language | TypeScript (strict mode) |

Note: receipt OCR is modeled in the data layer (`EntryMethod: "ocr" | "manual"` in `src/types/expense.ts`), but no OCR library (e.g. Google ML Kit) is wired into the codebase yet — see the summary at the end of setup for details.

## Project structure

```
app/                                  Expo Router routes (file-based)
├── _layout.tsx                       Root stack: (auth), (tabs), plans, profile
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                           Bottom tab navigator
│   ├── _layout.tsx
│   ├── index.tsx                     Dashboard tab
│   ├── trips.tsx                     Trips tab
│   └── profile.tsx                   Profile tab
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
│   └── supabase.ts                   Supabase client (reads config from app.config.ts extra)
├── types/                            Domain types: User, TravelPlan, Expense, OwerBalance, PaymentProof, UserPaymentQR
└── utils/
    └── split.ts                      Equal/custom expense-split calculations

supabase/
├── config.toml                       Local Supabase CLI config
└── migrations/                       Database schema migrations
```

## Branching model

PRs only — no direct pushes to `dev`, `staging`, or `prod`. The flow between branches is enforced by a GitHub Action (`.github/workflows/enforce-branch-flow.yml`), not just convention:

- **`dev`** — active development. Feature branches PR into `dev`.
- **`staging`** — a batch of `dev` changes promoted for QA. Only PRs from `dev` are accepted here.
- **`prod`** — a verified `staging` build promoted to production. Only PRs from `staging` are accepted here.

## Getting started

- New to the project? Follow [HOW_TO_SETUP.md](./HOW_TO_SETUP.md) to configure your machine.
- Already set up? See [HOW_TO_RUN.md](./HOW_TO_RUN.md) for the day-to-day dev loop, builds, and PR flow.

# How to run kwits

This guide assumes you've already completed [HOW_TO_SETUP.md](./HOW_TO_SETUP.md) — Node, the Android SDK, dependencies, `.env`, and Supabase are all in place.

> **Last reconciled against the repo:** `package.json` scripts, `eas.json`, and the CI/branch-flow workflows were checked against their current file contents as of this revision. Where something had drifted since this doc was first written, it's called out inline rather than silently corrected.

## 1. First native build

```bash
npx expo run:android
```

(equivalently, `npm run android` — see the note under "Other available scripts" below)

This compiles a native Android build locally using your Android Studio SDK — it does **not** consume any EAS cloud build quota. Expect this to take **10-20 minutes** on the first run (it needs to build the native project from scratch). Subsequent runs reuse Gradle's incremental build cache, so they're faster, but see section 4 for what "faster" actually means here.

## 2. Day-to-day development

Once the native build is installed on a device/emulator, start the dev server:

```bash
npx expo start --dev-client
```

This connects to the already-installed development build and gives you fast refresh for all JS/TS changes.

Other available scripts (`package.json`):

```bash
npm run start   # expo start
npm run android # expo run:android — full native build + install + launch, same as step 1
npm run ios     # expo run:ios     — same, for iOS (not runnable locally on Windows; see EAS builds below)
npm run web     # expo start --web
```

> **Doc drift note:** `npm run android` and `npm run ios` used to map to `expo start --android` / `expo start --ios` (dev-server-only, no native build) when this doc was first written. As of the current `package.json`, they've been changed to `expo run:android` / `expo run:ios` — the same full native build command as step 1, not a fast day-to-day command. If your muscle memory is "run `npm run android` for daily dev," switch to `npx expo start --dev-client` instead (step 2) — that's the command that now fills that role.

## 3. Running local Supabase (Docker)

### What this is and why

`supabase start` spins up a full local Supabase stack in Docker — Postgres, Auth, Storage, Realtime, and a Studio UI — running entirely on your own machine, completely separate from the cloud `staging`/`prod` projects. You can create, drop, and break tables and RLS policies freely without touching real data or needing an invite to the Supabase organization. This is the default way to work day-to-day on `dev`.

### Prerequisite: Docker Desktop

Docker Desktop must be installed and **running** (not just installed — the daemon has to actually be up) before `supabase start` will work. Confirm it's available:

```bash
docker --version
```

### Starting the stack

```bash
supabase start
```

The first run downloads the Docker images for every service, so it's noticeably slower than every run after that. Once it finishes, it prints connection details for the local stack — the exact ports come from this repo's `supabase/config.toml`:

```
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
JWT secret: <shown in your terminal>
anon key: <shown in your terminal>
service_role key: <shown in your terminal>
```

| Line | What it's for |
| --- | --- |
| `API URL` | The Supabase REST/Auth/Storage endpoint — this is what the app connects to. |
| `DB URL` | Direct Postgres connection string, for `psql` or a DB client. |
| `Studio URL` | Local web UI for browsing tables, running SQL, and checking RLS — see below. |
| `Inbucket URL` | Catches emails the local Auth service "sends" (confirmation, magic link) so you can read them without a real mail provider. |
| `anon key` | What the app uses as `SUPABASE_ANON_KEY` when pointed at local Supabase (see below). |
| `service_role key` | Full-access key — never put this in the app or `.env`; it bypasses RLS entirely. |

> The JWT/anon/service_role keys are printed fresh each time and are specific to your terminal output — copy them from there, don't reuse an example value.

### Applying migrations locally

```bash
npm run db:migrate:local
```

This maps to `supabase db reset` (see the `db:migrate:local` script in `package.json`): it wipes the local database and replays every file in `supabase/migrations/`, in order, from scratch. This is the correct way to verify a migration actually works from a clean state, rather than testing against a database that's already been migrated (which can hide a migration that only works because of manual patches you made by hand in Studio).

Don't confuse this with `npm run db:migrate` (`supabase db push`) — that targets a remote **linked** cloud project (staging/prod), not your local stack. `supabase db push` is covered under [Supabase project setup](./HOW_TO_SETUP.md#5-supabase-project-setup) in `HOW_TO_SETUP.md` and in the PR flow section below; this section is about the local Docker stack only.

Two related scripts, if you need them: `npm run db:migrate:status` (`supabase migration list`) shows which migrations have been applied where, and `npm run db:migrate:new` (`supabase migration new <name>`) scaffolds a new migration file.

### Pointing the app at local Supabase

Update `.env` (the same two variables from `.env.example`) with the values from the `supabase start` output above:

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<the anon key printed by supabase start>
```

### The Android emulator networking gotcha

This is the part most likely to cost you time if you miss it: **`127.0.0.1` / `localhost` inside an Android emulator refers to the emulator's own virtual device, not your host machine running Docker.** The emulator cannot reach `127.0.0.1:54321` no matter how correct that address looks in `.env` — Docker is listening on your host, and the emulator is its own isolated network namespace.

Use the special alias Android's emulator provides for the host machine instead:

```
SUPABASE_URL=http://10.0.2.2:54321
```

**Failure mode if you miss this:** the app doesn't show a clear "wrong Supabase URL" error — it just fails with a generic network/connection error (a fetch failure, a timeout, or Supabase's client throwing a vague network exception). That's easy to misdiagnose as a Supabase configuration problem, a CORS issue, or Docker not actually running, when the real issue is that `127.0.0.1` is pointing at the wrong machine. If local Supabase network calls fail only on the emulator (and `curl http://127.0.0.1:54321` works fine from your host terminal), check `10.0.2.2` before anything else.

A **physical device** needs a third, different address again: your host machine's actual LAN IP (e.g. `http://192.168.1.23:54321`), since the device is a separate machine on your network, not a VM Android provides an alias for. Same class of gotcha as the emulator case, just a different fix — there's no single address that works for host, emulator, and physical device simultaneously.

### Restarting Metro after changing `.env`

Environment variable changes aren't picked up by a hot reload. Restart Metro with the cache cleared:

```bash
npx expo start --dev-client --clear
```

### Viewing and inspecting data

Supabase Studio is available locally at the Studio URL from the `supabase start` output (`http://127.0.0.1:54323` per this repo's config) — the same interface as the cloud dashboard. Use it to browse tables, run SQL directly, and check RLS policies without touching a cloud project.

### Stopping the stack

```bash
supabase stop
```

This stops the containers but **preserves your data** — running `supabase start` again picks up where you left off.

For a genuinely clean slate, either:

```bash
supabase stop --no-backup   # stops and discards all local data
```

or, if the stack is still running and you just want the database wiped and migrations replayed:

```bash
npm run db:migrate:local    # supabase db reset
```

### Local vs. cloud Supabase — when to use which

Use **local** for everyday feature work on `dev` — it's faster, free, and safe to break. The cloud `staging` and `prod` projects should only be touched during the actual promotion step (see [section 8, The PR flow](#8-the-pr-flow)), via `npm run db:migrate` (`supabase db push`) against the linked remote project — not as part of day-to-day development.

## 4. When do you need to rebuild?

**Rebuild (`npx expo run:android` / `npm run android` again) only when:**
- You add or update a native module (e.g. a new package with native code, like `expo-camera` or `@maplibre/maplibre-react-native`).
- You change native config in `app.config.ts` (plugins, permissions, icons, package name, etc.).

**Otherwise, just restart Metro** (`npx expo start --dev-client`) — plain JS/TS/React changes hot-reload without a rebuild.

Since `npm run android` now runs `expo run:android` (not `expo start --android`), it's worth being precise about what re-running it actually costs: it always goes through the full Gradle assemble + install + launch pipeline — it does not skip straight to a dev-server-only start the way the old script did. If nothing native has changed, Gradle's own incremental build cache marks most compile tasks `UP-TO-DATE`, so the command finishes well under the original 10-20 minutes — but it's still doing more work per run than `expo start --dev-client`, which never touches Gradle at all. For plain JS/TS iteration, `expo start --dev-client` remains the faster loop; reach for `npm run android` only when one of the two conditions above is actually true.

## 5. Running on a device vs. an emulator

**Physical Android device:**
1. Enable Developer Options and USB debugging on the device.
2. Connect via USB (or set up wireless debugging).
3. Run `npx expo run:android` (or `npm run android`) — Expo will detect and target the connected device.

**Android emulator (Android Studio Device Manager):**
1. Open Android Studio > **More Actions > Virtual Device Manager**.
2. Create a device (or start an existing one).
3. With the emulator running, run `npx expo run:android` (or `npm run android`) — Expo will target the running emulator.

Either path is valid; use whichever is convenient.

## 6. EAS cloud builds

Use EAS when a local build isn't possible or isn't the right fit:

- **iOS builds** — local iOS builds aren't possible on Windows, so use EAS for any iOS build.
- **Preview builds for testers** — anyone without a full dev environment can install a preview build directly.

This repo already defines build profiles in `eas.json`: `development`, `preview`, and `production`.

```bash
# iOS build (any platform without a local Mac toolchain)
eas build --platform ios --profile preview

# Android preview build to share with testers
eas build --platform android --profile preview

# Production build (auto-incremented version)
eas build --platform android --profile production
eas build --platform ios --profile production
```

> Free tier limit: **15 Android + 15 iOS builds per month**. Prefer local builds (`expo run:android`) for your own day-to-day Android development, and reserve EAS for iOS and tester-facing builds.

## 7. Running CI checks locally before pushing

The CI workflow (`.github/workflows/ci.yml`) runs the following on every PR into `dev`, `staging`, or `prod`. Run them yourself first so you catch failures before opening a PR:

```bash
npx tsc --noEmit
npm run lint --if-present
npm test --if-present
```

> The last two currently no-op: this repo has no `lint` or `test` script defined in `package.json` yet, so CI (and the commands above) will pass trivially until those are added.

## 8. The PR flow

- Branch off **`dev`** for new feature/fix work.
- Branch-flow is enforced by CI (`.github/workflows/enforce-branch-flow.yml`), not just convention: PRs into `staging` must come from `dev`, and PRs into `prod` must come from `staging`. Any other source/target combination fails the check.
- PR titles must match `<type>: <description>` (checked by `.github/workflows/pr-title-check.yml`), e.g. `feat: add expense creation form`.
- PRs into `staging` and `prod` have dedicated templates with required checklists (QA sign-off, migrations, rollback plan) — see `.github/PULL_REQUEST_TEMPLATE/staging.md` and `.github/PULL_REQUEST_TEMPLATE/prod.md`. Fill these out; don't skip the checklist items.

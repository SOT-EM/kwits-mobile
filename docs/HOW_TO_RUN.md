# How to run kwits

This guide assumes you've already completed [HOW_TO_SETUP.md](./HOW_TO_SETUP.md) — Node, the Android SDK, dependencies, `.env`, and Supabase are all in place.

> **Last reconciled against the repo:** `package.json` scripts, `eas.json`, and the CI/branch-flow workflows were checked against their current file contents as of this revision. Where something had drifted since this doc was first written, it's called out inline rather than silently corrected.

## 1. First native build

```bash
npx expo run:android
```

(equivalently, `npm run android` — see the note under "Other available scripts" below)

This compiles a native Android build locally using your Android Studio SDK — it does **not** consume any EAS cloud build quota. Expect this to take **10-20 minutes** on the first run (it needs to build the native project from scratch). Subsequent runs reuse Gradle's incremental build cache, so they're faster, but see section 3 for what "faster" actually means here.

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

## 3. When do you need to rebuild?

**Rebuild (`npx expo run:android` / `npm run android` again) only when:**
- You add or update a native module (e.g. a new package with native code, like `expo-camera` or `@maplibre/maplibre-react-native`).
- You change native config in `app.config.ts` (plugins, permissions, icons, package name, etc.).

**Otherwise, just restart Metro** (`npx expo start --dev-client`) — plain JS/TS/React changes hot-reload without a rebuild.

Since `npm run android` now runs `expo run:android` (not `expo start --android`), it's worth being precise about what re-running it actually costs: it always goes through the full Gradle assemble + install + launch pipeline — it does not skip straight to a dev-server-only start the way the old script did. If nothing native has changed, Gradle's own incremental build cache marks most compile tasks `UP-TO-DATE`, so the command finishes well under the original 10-20 minutes — but it's still doing more work per run than `expo start --dev-client`, which never touches Gradle at all. For plain JS/TS iteration, `expo start --dev-client` remains the faster loop; reach for `npm run android` only when one of the two conditions above is actually true.

## 4. Running on a device vs. an emulator

**Physical Android device:**
1. Enable Developer Options and USB debugging on the device.
2. Connect via USB (or set up wireless debugging).
3. Run `npx expo run:android` (or `npm run android`) — Expo will detect and target the connected device.

**Android emulator (Android Studio Device Manager):**
1. Open Android Studio > **More Actions > Virtual Device Manager**.
2. Create a device (or start an existing one).
3. With the emulator running, run `npx expo run:android` (or `npm run android`) — Expo will target the running emulator.

Either path is valid; use whichever is convenient.

## 5. EAS cloud builds

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

## 6. Running CI checks locally before pushing

The CI workflow (`.github/workflows/ci.yml`) runs the following on every PR into `dev`, `staging`, or `prod`. Run them yourself first so you catch failures before opening a PR:

```bash
npx tsc --noEmit
npm run lint --if-present
npm test --if-present
```

> The last two currently no-op: this repo has no `lint` or `test` script defined in `package.json` yet, so CI (and the commands above) will pass trivially until those are added.

## 7. The PR flow

- Branch off **`dev`** for new feature/fix work.
- Branch-flow is enforced by CI (`.github/workflows/enforce-branch-flow.yml`), not just convention: PRs into `staging` must come from `dev`, and PRs into `prod` must come from `staging`. Any other source/target combination fails the check.
- PR titles must match `<type>: <description>` (checked by `.github/workflows/pr-title-check.yml`), e.g. `feat: add expense creation form`.
- PRs into `staging` and `prod` have dedicated templates with required checklists (QA sign-off, migrations, rollback plan) — see `.github/PULL_REQUEST_TEMPLATE/staging.md` and `.github/PULL_REQUEST_TEMPLATE/prod.md`. Fill these out; don't skip the checklist items.

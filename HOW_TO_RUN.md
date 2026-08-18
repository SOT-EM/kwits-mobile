# How to run kwits

This guide assumes you've already completed [HOW_TO_SETUP.md](./HOW_TO_SETUP.md) — Node, the Android SDK, dependencies, `.env`, and Supabase are all in place.

## 1. First native build

```bash
npx expo run:android
```

This compiles a native Android build locally using your Android Studio SDK — it does **not** consume any EAS cloud build quota. Expect this to take **10-20 minutes** on the first run (it needs to build the native project from scratch). Subsequent native builds are much faster.

## 2. Day-to-day development

Once the native build is installed on a device/emulator, start the dev server:

```bash
npx expo start --dev-client
```

This connects to the already-installed development build and gives you fast refresh for all JS/TS changes.

Other available scripts (`package.json`):

```bash
npm run start   # expo start
npm run android # expo start --android
npm run ios     # expo start --ios
npm run web     # expo start --web
```

## 3. When do you need to rebuild?

**Rebuild (`npx expo run:android` again) only when:**
- You add or update a native module (e.g. a new package with native code, like `expo-camera` or `@maplibre/maplibre-react-native`).
- You change native config in `app.config.ts` (plugins, permissions, icons, package name, etc.).

**Otherwise, just restart Metro** (`npx expo start --dev-client`) — plain JS/TS/React changes hot-reload without a rebuild.

## 4. Running on a device vs. an emulator

**Physical Android device:**
1. Enable Developer Options and USB debugging on the device.
2. Connect via USB (or set up wireless debugging).
3. Run `npx expo run:android` — Expo will detect and target the connected device.

**Android emulator (Android Studio Device Manager):**
1. Open Android Studio > **More Actions > Virtual Device Manager**.
2. Create a device (or start an existing one).
3. With the emulator running, run `npx expo run:android` — Expo will target the running emulator.

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

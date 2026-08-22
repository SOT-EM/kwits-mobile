# How to run kwits (mobile)

This guide assumes you've already completed [HOW_TO_SETUP.md](./HOW_TO_SETUP.md) — Node, the Android SDK, dependencies, and `.env` are all in place.

> **Last reconciled against the repo:** `package.json` scripts, `app.config.ts`, `eas.json`, and the CI/branch-flow workflows were checked against their current file contents as of this revision. Where something had drifted since this doc was first written, it's called out inline rather than silently corrected.

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

Available scripts (`package.json`):

```bash
npm run start        # expo start
npm run android      # expo run:android — full native build + install + launch, same as step 1
npm run android:dev  # expo start --dev-client --clear --android
npm run ios          # expo run:ios     — same, for iOS (not runnable locally on Windows; see EAS builds below)
npm run ios:dev      # expo start --dev-client --clear --ios
npm run web          # expo start --web
```

> **Doc drift note:** `npm run android` and `npm run ios` used to map to `expo start --android` / `expo start --ios` (dev-server-only, no native build). They now map to `expo run:android` / `expo run:ios` — the same full native build command as step 1, not a fast day-to-day command. If your muscle memory is "run `npm run android` for daily dev," use `npm run android:dev` (or `npx expo start --dev-client`) instead.
>
> The four `db:migrate*` scripts that used to be in this list are gone. Database migrations are kwits-api's job now — see [kwits-api/docs/HOW_TO_RUN.md](../../kwits-api/docs/HOW_TO_RUN.md).

## 3. Running the backend the app talks to

The app is useless on its own past the onboarding screens: login and the Dashboard's plans list both call kwits-api. Nothing in this repo starts a backend.

Full instructions live in [kwits-api/docs/HOW_TO_RUN.md](../../kwits-api/docs/HOW_TO_RUN.md) and are not duplicated here so they can't drift. The short version, run from the `kwits-api` directory:

```bash
supabase start          # Postgres + Auth in Docker
./mvnw spring-boot:run  # the API itself, on port 8080
```

Confirm it's up from your **host** terminal before blaming the app:

```bash
curl -i http://localhost:8080/plans
```

A `401` is the correct, healthy answer — it means the API is running and the route is protected. A connection refused means the API isn't up. Note that `/plans` with no token is the useful health probe here; there is no public health endpoint.

### What talks to Supabase

Only kwits-api. This repo holds no Supabase URL, key, CLI, or migration. If you catch yourself adding a Supabase dependency here, that's the architecture being violated — the data belongs behind an endpoint in kwits-api instead.

### The Android emulator networking gotcha

This is the part most likely to cost you time: **`127.0.0.1` / `localhost` inside an Android emulator refers to the emulator's own virtual device, not your host machine.** The emulator cannot reach `localhost:8080` no matter how correct that looks in `.env`, because the API is listening on your host and the emulator is its own isolated network namespace.

Use the alias Android's emulator provides for the host machine:

```
API_BASE_URL=http://10.0.2.2:8080
```

A **physical device** needs a third address again: your machine's actual LAN IP (e.g. `http://192.168.1.23:8080`), since the device is a separate machine on your network, not a VM Android provides an alias for. There is no single address that works for host, emulator, and physical device simultaneously.

**Failure mode if you miss this:** `src/lib/api.ts` catches the `fetch` rejection and surfaces `Could not reach kwits-api at <url>`, so the URL it actually tried is in the message — read it before assuming the backend is down. If the URL says `localhost` and you're on an emulator, that's your bug.

### Plain HTTP requires a native rebuild

Android blocks cleartext (non-HTTPS) traffic by default on recent API levels, which would silently break every call to `http://10.0.2.2:8080`. `app.config.ts` sets `usesCleartextTraffic: true` under the `expo-build-properties` plugin to allow it.

That is **native** config. A Metro restart will not apply it:

```bash
npx expo prebuild --clean
npx expo run:android
```

This is local-development-only. A deployed API should be HTTPS, and a shipped build should not depend on that flag.

### Restarting Metro after changing `.env`

Environment variable changes aren't picked up by a hot reload, because `app.config.ts` reads them at config-resolution time. Restart with the cache cleared:

```bash
npx expo start --dev-client --clear
```

## 4. When do you need to rebuild?

**Rebuild (`npx expo run:android`) only when:**
- You add or update a native module (e.g. a new package with native code, like `expo-camera` or `@maplibre/maplibre-react-native`).
- You change native config in `app.config.ts` — plugins, permissions, icons, package name, `usesCleartextTraffic`.

**Otherwise, just restart Metro** (`npx expo start --dev-client`) — plain JS/TS/React changes hot-reload without a rebuild.

Since `npm run android` runs `expo run:android` (not `expo start --android`), it's worth being precise about what re-running it costs: it always goes through the full Gradle assemble + install + launch pipeline. If nothing native has changed, Gradle's incremental cache marks most compile tasks `UP-TO-DATE`, so it finishes well under the original 10-20 minutes — but it's still doing more work per run than `expo start --dev-client`, which never touches Gradle at all.

## 5. Running on a device vs. an emulator

**Physical Android device:**
1. Enable Developer Options and USB debugging on the device.
2. Connect via USB (or set up wireless debugging).
3. Run `npx expo run:android` — Expo will detect and target the connected device.
4. Set `API_BASE_URL` to your machine's LAN IP, and make sure your firewall allows inbound 8080.

**Android emulator (Android Studio Device Manager):**
1. Open Android Studio > **More Actions > Virtual Device Manager**.
2. Create a device (or start an existing one).
3. With the emulator running, run `npx expo run:android` — Expo will target it.
4. Set `API_BASE_URL` to `http://10.0.2.2:8080`.

## 6. EAS cloud builds

Use EAS when a local build isn't possible or isn't the right fit:

- **iOS builds** — local iOS builds aren't possible on Windows, so use EAS for any iOS build.
- **Preview builds for testers** — anyone without a full dev environment can install a preview build directly.

This repo defines build profiles in `eas.json`: `development`, `preview`, and `production`.

```bash
# iOS build (any platform without a local Mac toolchain)
eas build --platform ios --profile preview

# Android preview build to share with testers
eas build --platform android --profile preview

# Production build (auto-incremented version)
eas build --platform android --profile production
eas build --platform ios --profile production
```

> Free tier limit: **15 Android + 15 iOS builds per month**. Prefer local builds for day-to-day Android development, and reserve EAS for iOS and tester-facing builds.

A build for anyone other than you needs an `API_BASE_URL` they can actually reach. `10.0.2.2` and `localhost` are both meaningless on a tester's device — a tester-facing build needs a deployed kwits-api, not your laptop.

## 7. Running CI checks locally before pushing

The CI workflow (`.github/workflows/ci.yml`) runs the following on every PR into `dev`, `staging`, or `prod`. Run them yourself first:

```bash
npx tsc --noEmit
npm run lint --if-present
npm test --if-present
```

> The last two currently no-op: this repo has no `lint` or `test` script in `package.json`, so CI (and the commands above) pass trivially until those are added. `npx tsc --noEmit` is the only check with teeth right now.

CI does not build the app natively and does not touch kwits-api, so a green CI run does not prove the round trip works. Verify that by hand per section 3.

## 8. The PR flow

- Branch off **`dev`** for new feature/fix work.
- Branch-flow is enforced by CI (`.github/workflows/enforce-branch-flow.yml`), not just convention: PRs into `staging` must come from `dev`, and PRs into `prod` must come from `staging`. Any other source/target combination fails the check.
- PR titles must match `<type>: <description>` (checked by `.github/workflows/pr-title-check.yml`), e.g. `feat: add expense creation form`.
- PRs into `staging` and `prod` have dedicated templates with required checklists (QA sign-off, migrations, rollback plan) — see `.github/PULL_REQUEST_TEMPLATE/staging.md` and `.github/PULL_REQUEST_TEMPLATE/prod.md`. Fill these out; don't skip the checklist items.

A change that needs a matching kwits-api change is now two PRs in two repos with no shared CI. Merge and deploy the API side first: the app calling an endpoint that doesn't exist yet fails at runtime, while an unused endpoint harms nothing.

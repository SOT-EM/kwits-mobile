# How to debug kwits (mobile)

A troubleshooting runbook, in two parts:

- **Part 1 (Problems 1-9)** — getting a native Android build to compile on Windows (`npx expo run:android` and the underlying Gradle/CMake toolchain). Each entry is a real failure encountered while getting this project building natively, in the order they tend to appear on a fresh Windows setup.
- **Part 2 (Problems 10-13)** — the app runs, but can't talk to [kwits-api](../../kwits-api). These all look like a broken network and none of them are.

**How to use this:** Ctrl+F the exact error text you're seeing, jump to that section, apply the fix. Root causes and fixes are verified against this repo's actual config as of this revision — if something has since changed (see the "Current repo state" notes inline), trust the repo over this doc.

Backend-side failures — the API not starting, database mismatches, token validation — are in [kwits-api/docs/HOW_TO_DEBUG.md](../../kwits-api/docs/HOW_TO_DEBUG.md).

---

# Part 1: Android native builds on Windows

## Problem 1: `create-expo-app` fails with "Could not parse JSON returned from npm.cmd pack"

**Symptom:**
```
Could not parse JSON returned from npm.cmd pack --dry-run --json ...
```

**Cause:** npm 12.x changed the JSON output format of `npm pack --dry-run --json`, and `create-expo-app`'s parser (as of the version available at the time) doesn't handle the new format. npm 10.x and 11.x are unaffected.

**Fix:** downgrade npm globally:

```bash
npm install -g npm@10.9.2
```

or route around the affected code path by scaffolding via Yarn instead:

```bash
npx create-expo-app@latest <name> --template blank-typescript --yarn
```

> Only relevant when scaffolding a **new** Expo project on a machine with npm 12.x — not something you'll hit cloning this existing repo, but worth knowing if you ever spin up a sibling project the same way.

## Problem 2: `npm install` fails with an ERESOLVE peer dependency conflict (`react-dom`, `@radix-ui/*`, `vaul`)

**Symptom:**
```
npm error code ERESOLVE
npm error ERESOLVE could not resolve
...
npm error Could not resolve dependency:
npm error peer react-dom@"^18.2.0 || ^19.0.0" from @radix-ui/...
```

**Cause:** `expo-router` bundles web-only dev-tools dependencies (`vaul`, `@radix-ui/*`) with stricter React peer requirements than this project's React Native version actually needs. It's cosmetic — it doesn't affect the mobile app at runtime — but it blocks a plain `npm install`.

**Fix:** add a project-level `.npmrc` so every install (including ones the Expo CLI shells out to internally, like `expo install`) applies the flag automatically:

```
legacy-peer-deps=true
```

```bash
echo "legacy-peer-deps=true" > .npmrc
```

> **Current repo state:** no `.npmrc` exists in this repo yet. Until it's added, pass `--legacy-peer-deps` explicitly on every `npm install` (this is what `HOW_TO_SETUP.md` currently instructs). Add the file above to stop needing the flag.

## Problem 3: `npx expo run:android` exits silently — no error, just env-loading lines, then returns

**Symptom:**
```
env: load .env
env: export MAPTILER_API_KEY EAS_PROJECT_ID API_BASE_URL
```
...then the process just exits, no stack trace, no error message.

This has two distinct causes — treat it as a two-step diagnostic, not a single fix:

**(a) Empty/unset `extra.eas.projectId`.** `app.config.ts` reads `process.env.EAS_PROJECT_ID` directly into `extra.eas.projectId`. If the env var is unset, some Expo CLI versions produce a malformed config during resolution and exit early with no visible error.

Recommended fix — only include the `eas` key when the env var is actually set:

```ts
extra: {
  mapTilerApiKey: process.env.MAPTILER_API_KEY,
  apiBaseUrl: process.env.API_BASE_URL,
  ...(process.env.EAS_PROJECT_ID
    ? { eas: { projectId: process.env.EAS_PROJECT_ID } }
    : {}),
},
```

> **Current repo state:** `app.config.ts` still sets `extra.eas.projectId` unconditionally from `process.env.EAS_PROJECT_ID` (no guard). This hasn't been applied yet — if this symptom resurfaces, apply the guard above first.

**(b) A genuinely silent CLI failure (exit code 1, no text).** Even with `(a)` ruled out, this traces to Expo's automatic Play Store package-name availability check hanging or crashing without surfacing an error.

Fix: re-run with debug output to see the real failure point:

```bash
EXPO_DEBUG=true npx expo run:android
```

> The specific underlying cause behind case (b) in this project turned out to be Problem 4 below. Regardless of root cause, **`EXPO_DEBUG=true` is the correct first diagnostic step** any time `expo run:android` exits silently with no visible error — don't jump to assuming the emulator/device isn't detected.

## Problem 4: "Cannot automatically write to dynamic config at: app.config.ts"

**Symptom:**
```
Cannot automatically write to dynamic config at: app.config.ts
Please add the following to your Expo config:
{
  "android": { "package": "..." },
  "ios": { "bundleIdentifier": "..." }
}
```

**Cause:** Expo tries to auto-validate Play Store package-name availability and auto-write the resolved Android package / iOS bundle identifier into the Expo config. It can safely rewrite a plain `app.json`, but not a dynamic, TypeScript `app.config.ts` — so it stops and asks you to add the fields yourself.

**Fix:** add `package` under `android` and `bundleIdentifier` under `ios` manually, using reverse-domain format. This value becomes permanent once published to an app store — choose it deliberately, not as a placeholder.

**Current repo state:** already applied. `app.config.ts` has:

```ts
android: { package: "com.kwits.sotm", ... },
ios: { ..., bundleIdentifier: "com.kwits.sotm" },
```

> These were `com.suden.kwits` when this doc was written and were renamed to `com.kwits.sotm`. A package rename is native config, so it needs a `prebuild --clean` + rebuild to take effect, and it changes the app's identity on the device — the old build does not upgrade in place, it installs alongside as a separate app.

If you fork this project or rename it, you'll need to pick your own reverse-domain identifier here — don't just copy `com.kwits.sotm`.

## Problem 5: Gradle daemon crashes with a JVM fatal error (`EXCEPTION_ACCESS_VIOLATION`) during Kotlin compilation

**Symptom:** a `hs_err_pid*.log` file appears alongside a Gradle build failure, referencing something like:
```
# A fatal error has been detected by the Java Runtime Environment:
#
#  EXCEPTION_ACCESS_VIOLATION
...
# Problematic frame:
# J ... org.jetbrains.kotlin.ir.expressions.IrContainerExpression ...
```

**Cause:** a known class of JIT (C2 compiler) bug in certain JDK 17 builds, triggered when the JIT tries to optimize the Kotlin compiler's own bytecode during heavy native module compilation.

**Fix:** two changes to `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:TieredStopAtLevel=1
org.gradle.java.home=<path to Android Studio's bundled JBR>
```

Find the JBR path under your Android Studio install directory (on this machine it was `D:\Android Studio\jbr` — this varies per machine/install location; look for a `jbr` folder next to Android Studio's own binaries).

> **Current repo state:** `android/gradle.properties` currently has neither of these — `org.gradle.jvmargs` is the unmodified Expo default (`-Xmx2048m -XX:MaxMetaspaceSize=512m`, no `TieredStopAtLevel`), and there's no `org.gradle.java.home` override. This is expected: `android/` is gitignored (`/android` in `.gitignore`) and gets fully regenerated by `expo prebuild`, so these settings are never persisted — they must be **reapplied manually** to `android/gradle.properties` if this crash recurs. See "Gradle properties: crisis-mode vs. defaults" at the end of this doc.

## Problem 6: Gradle build fails with a clang++/`ld.lld` linker crash (`Exception Code 0xC0000005`)

**Symptom:**
```
ld.lld: error: ...
clang++.exe: error: linker command failed with exit code ... (use -v to see invocation)
FAILURE: Build failed with an exception.
* What went wrong:
Execution failed for task ':expo-modules-core:...' (or ':react-native-reanimated:...')
... Exception Code: 0xC0000005 ...
```

**Cause:** most likely Windows Defender real-time scanning interfering with the NDK toolchain's intensive file I/O during compilation, compounded by insufficient available RAM when the emulator, Gradle daemon, Kotlin daemon, and multiple parallel native compiler processes are all running at once.

**Fix**, apply together:

1. Add Windows Defender folder exclusions for:
   - the project directory
   - `~/.gradle`
   - the Android SDK directory
   - the Android Studio install directory
2. Reduce Gradle parallelism in `android/gradle.properties`:
   ```properties
   org.gradle.workers.max=1
   org.gradle.parallel=false
   ```
3. Close the emulator and other memory-heavy applications before building. Confirm available RAM is actually the constraint with:
   ```powershell
   systeminfo
   ```

> **Current repo state:** `android/gradle.properties` currently has `org.gradle.parallel=true` and no `org.gradle.workers.max` override — i.e. full parallelism, the opposite of the crisis-mode setting above. That's the intended *ongoing* default once the environment is stable; only drop back to `workers.max=1` / `parallel=false` if this specific linker crash reappears. Same caveat as Problem 5: this file is gitignored and regenerated, so the change doesn't persist across a `prebuild --clean`.

## Problem 7: `expo prebuild` / build fails with a CMake error like "add_subdirectory given source `[...]/codegen/jni/` which is not an existing directory"

**Symptom:**
```
CMake Error at CMakeLists.txt:...
  add_subdirectory given source "...\node_modules\...\android\build\generated\source\codegen\jni\"
  which is not an existing directory.
```

**Cause:** a partial or interrupted native build left `android/` in an inconsistent state, where CMake configuration references codegen output directories that don't actually exist yet — codegen generation and CMake configuration got out of order. This is commonly caused by deleting only part of the build cache (e.g. just `android/.gradle`) instead of the whole `android/` folder.

**Fix:** delete the entire `android/` folder and regenerate fully, rather than trying to patch the partial state:

```bash
npx expo prebuild --platform android --clean
```

Re-apply any custom `android/gradle.properties` settings afterward — `--clean` regenerates that file from the default template every time (see the crisis-mode vs. defaults note at the end of this doc).

## Problem 8: `expo install <package>` fails with `EPERM: operation not permitted, rename package.json.<hash> -> package.json`

**Symptom:**
```
EPERM: operation not permitted, rename 'package.json.1234567890.tmp' -> 'package.json'
```

**Cause:** a Windows file-locking issue — something (an editor with the file open, a lingering process from an interrupted build, or antivirus scanning) held a lock on `package.json` at the exact moment Expo's atomic-write-then-rename install step tried to finalize.

**Fix:**

1. Close any editor tabs with `package.json` open.
2. Kill lingering Node processes:
   ```bash
   taskkill //F //IM node.exe //T
   ```
3. Retry the install.

## Problem 9: App builds successfully but crashes on launch with `NoClassDefFoundError: Failed resolution of: Lkotlin/jvm/functions/Function0`

**Symptom:**
```
java.lang.NoClassDefFoundError: Failed resolution of: Lkotlin/jvm/functions/Function0;
Caused by: java.lang.ClassNotFoundException: Didn't find class "kotlin.jvm.functions.Function0"
```

**Cause:** in this case, **not** a genuine multidex limit — the project's `minSdkVersion` (resolved via the React Native Gradle Plugin's default for this RN version, 24) already supports multiple dex files natively, so `multiDexEnabled` was a red herring. The actual root cause was corrupted incremental build/cache state left behind by the earlier JVM crash in Problem 5 — a project-level `gradlew clean`, or even deleting the whole `android/` folder, did **not** clear deeper Gradle global transform caches or Kotlin's incremental compilation state. Subsequent "successful" builds were quietly built on top of corrupted intermediate artifacts.

**Fix:** a full cache wipe beyond the usual clean — needed as an escalation step specifically after an earlier JVM/native crash in the same session:

```bash
# stop all Gradle daemons
cd android && ./gradlew --stop && cd ..

# kill lingering processes
taskkill //F //IM java.exe //T
taskkill //F //IM node.exe //T

# wipe all build state — not just the project's own output
rm -rf android
rm -rf node_modules/.cache
rm -rf ~/.gradle/caches
find node_modules -type d -name ".cxx" -prune -exec rm -rf {} +

# regenerate and rebuild from scratch
npx expo prebuild --platform android --clean
npx expo run:android
```

> **Current repo state:** `app.config.ts`'s `expo-build-properties` plugin still sets `android.multiDexEnabled: true`. It wasn't the actual fix for this crash (see cause above), but it's harmless to leave in place and hasn't been removed — don't spend time chasing multidex config if you hit this error again; go straight to the cache wipe.
>
> That same plugin block now also sets `android.usesCleartextTraffic: true` for local kwits-api calls (Problem 11). Both are native config, so a cache wipe followed by `prebuild --clean` re-applies them from `app.config.ts` — you never need to hand-edit anything under `android/`.

---

# Part 2: talking to kwits-api

The problems above are about getting a native Android build to compile at all. The ones below only appear once the app is running and trying to reach the backend. All of them look like "the network is broken" and none of them are.

Read the error text first: `src/lib/api.ts` deliberately puts the URL it actually tried into the message, and distinguishes "could not reach" (the request never completed) from a real HTTP status.

## Problem 10: "Could not reach kwits-api at http://localhost:8080" on an Android emulator

**Symptom:** login and the Dashboard both fail immediately. The message names `localhost` or `127.0.0.1`.

**Cause:** inside an Android emulator, `localhost` is the emulator's own virtual device, not your host machine. The API is listening on the host, so the emulator is dialling itself and finding nothing.

**Fix:** in `.env`, use the emulator's host alias, then restart Metro with the cache cleared (config is read at resolution time, not hot-reloaded):

```
API_BASE_URL=http://10.0.2.2:8080
```

```bash
npx expo start --dev-client --clear
```

`10.0.2.2` is a fixed alias, not a real IP. A physical device needs your machine's LAN IP instead — it is a separate machine on your network and has no such alias.

**Confirm the API itself is fine before changing anything**, from your host terminal:

```bash
curl -i http://localhost:8080/plans
```

A `401` means the API is up and the route is protected — that is the healthy answer. Connection refused means the backend isn't running; go to [kwits-api/docs/HOW_TO_RUN.md](../../kwits-api/docs/HOW_TO_RUN.md).

## Problem 11: "Could not reach kwits-api" even though the URL is right and curl works

**Symptom:** `curl http://localhost:8080/plans` returns 401 from your host, `API_BASE_URL` is correctly `http://10.0.2.2:8080`, and the app still cannot connect. No useful error beyond the reachability message.

**Cause:** Android blocks cleartext (non-HTTPS) traffic by default on recent API levels. The request is being dropped by the platform before it leaves the device. `http://10.0.2.2:8080` has no TLS, so it is exactly what that policy blocks.

**Fix:** `app.config.ts` already sets this under the `expo-build-properties` plugin:

```ts
android: {
  multiDexEnabled: true,
  usesCleartextTraffic: true,
},
```

The catch is that this is **native** config. If your installed build predates that setting, the flag is not in the APK on your device and a Metro restart will not put it there:

```bash
npx expo prebuild --clean
npx expo run:android
```

**How to tell this apart from Problem 10:** Problem 10 fails for a bad address, so fixing `.env` fixes it. This one fails with a correct address, and only a rebuild fixes it. If you have changed `.env` correctly and cleared the Metro cache and it still fails, stop editing `.env` and rebuild.

This is a local-development concession only. A deployed API should use HTTPS; a shipped build must not depend on this flag.

## Problem 12: login succeeds, then the Dashboard says the session expired

**Symptom:** signing in works and navigates to the Dashboard, but the plans list immediately reports an expired session and you are effectively signed out.

**Cause:** the token was accepted by `/auth/login` (which is public and just proxies to Supabase) but rejected by `/plans` (which validates it). The app is behaving correctly — `src/lib/auth.ts` clears a token the API answered `401` for, rather than keeping a token that doesn't work. The fault is almost always on the API side: `SUPABASE_JWT_SECRET` in kwits-api's `.env` doesn't match the secret Supabase actually signed with.

**Fix:** this is diagnosed in kwits-api, not here. See Problem 3 in [kwits-api/docs/HOW_TO_DEBUG.md](../../kwits-api/docs/HOW_TO_DEBUG.md). The quick check, from your host:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login   -H 'Content-Type: application/json'   -d '{"email":"you@example.com","password":"yourpassword"}' | jq -r .accessToken)

curl -i http://localhost:8080/plans -H "Authorization: Bearer $TOKEN"
```

If that also returns 401 outside the app, the app is not the problem.

## Problem 13: "API_BASE_URL is not set. Copy .env.example to .env and restart Expo."

**Symptom:** that exact message, thrown before any request goes out.

**Cause:** `Constants.expoConfig.extra.apiBaseUrl` resolved to empty. Either `.env` is missing, it lacks `API_BASE_URL`, or Metro is serving a config resolved before you added it.

**Fix:** confirm what Expo actually resolved, rather than trusting the file:

```bash
npx expo config --type public
```

Check `extra.apiBaseUrl` in the output. If it's empty there, the problem is `.env` (it must be at the repo root — `app.config.ts` loads it via `dotenv/config`). If it's correct there but the app still throws, Metro is stale:

```bash
npx expo start --dev-client --clear
```

---

## Gradle properties: crisis-mode vs. ongoing defaults

`android/gradle.properties` is **gitignored** (`/android` in `.gitignore`) and fully regenerated every time you run `expo prebuild`. Nothing in it persists across a `--clean` prebuild — so the settings below are two different modes, not one "final" config to commit:

| Setting | Ongoing default (current repo state) | Crisis mode (Problems 5 & 6 only) |
| --- | --- | --- |
| `org.gradle.jvmargs` | `-Xmx2048m -XX:MaxMetaspaceSize=512m` | add `-XX:TieredStopAtLevel=1` |
| `org.gradle.java.home` | unset (uses whatever JDK Gradle finds) | point at Android Studio's bundled JBR |
| `org.gradle.parallel` | `true` | `false` |
| `org.gradle.workers.max` | unset (full parallelism) | `1` |

Only switch to the crisis-mode column when you're actively hitting the specific JVM (Problem 5) or linker (Problem 6) crash. Since this file regenerates from scratch, keep this table as the reference rather than assuming a past fix is still sitting in your local `android/gradle.properties` — check it directly if a build starts crashing again.

## General lessons

- On Windows, prefer Android Studio's bundled JBR over a standalone system JDK for Gradle builds.
- Never interrupt a native build partway through (e.g. Ctrl+C) to run another command — this was directly responsible for at least one file-lock error (Problem 8) in this project's debugging history. Let a build reach success or failure before running anything else.
- When `expo run:android` fails or exits silently, always retry with `EXPO_DEBUG=true` before assuming the emulator/device isn't detected — the real cause is very often hidden by the CLI's default quiet output.
- After any native-level crash (JVM, linker, daemon), don't trust a subsequent "successful" build at face value if the app then fails at runtime — do the full cache wipe in Problem 9 rather than assuming a clean build actually started from a clean state.
- `android/` is regenerated and gitignored — any fix that lives only in `android/gradle.properties` will vanish on the next `prebuild --clean`. Keep this doc's crisis-mode table as the source of truth to reapply, rather than relying on the file itself as a record.

# How to debug kwits: Android native build issues on Windows

A troubleshooting runbook for local Android native builds on Windows (`npx expo run:android` and the underlying Gradle/CMake toolchain). Each entry below is a real failure encountered while getting this project building natively on Windows, in the order they tend to appear on a fresh Windows setup.

**How to use this:** Ctrl+F the exact error text you're seeing, jump to that section, apply the fix. Root causes and fixes are verified against this repo's actual config as of the time this doc was written — if something has since changed (see the "Current repo state" notes inline), trust the repo over this doc.

---

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
env: export SUPABASE_URL SUPABASE_ANON_KEY MAPTILER_API_KEY
```
...then the process just exits, no stack trace, no error message.

This has two distinct causes — treat it as a two-step diagnostic, not a single fix:

**(a) Empty/unset `extra.eas.projectId`.** `app.config.ts` reads `process.env.EAS_PROJECT_ID` directly into `extra.eas.projectId`. If the env var is unset, some Expo CLI versions produce a malformed config during resolution and exit early with no visible error.

Recommended fix — only include the `eas` key when the env var is actually set:

```ts
extra: {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  mapTilerApiKey: process.env.MAPTILER_API_KEY,
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
android: { package: "com.suden.kwits", ... },
ios: { ..., bundleIdentifier: "com.suden.kwits" },
```

If you fork this project or rename it, you'll need to pick your own reverse-domain identifier here — don't just copy `com.suden.kwits`.

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

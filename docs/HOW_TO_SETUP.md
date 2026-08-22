# How to set up kwits (mobile)

This guide takes you from a fresh machine to a working local build of the mobile app. It assumes zero prior context about the project.

**Scope:** this repo is the mobile client. It does not talk to Supabase and does not need the Supabase CLI, Docker, or a Supabase account. If you also need to run the backend locally, do this guide first, then [kwits-api/docs/HOW_TO_SETUP.md](../../kwits-api/docs/HOW_TO_SETUP.md).

## 1. Prerequisites

### Node.js

This project is pinned to **Node 20.18.1** (`.nvmrc`), and requires Node `>=20.18.0 <21.0.0` (`package.json` `engines`).

Using [nvm](https://github.com/nvm-sh/nvm) (or [nvm-windows](https://github.com/coreybutler/nvm-windows)):

```bash
nvm install 20.18.1
nvm use
```

### Android SDK (Android Studio, SDK only)

You don't need the full Android Studio IDE workflow — just its SDK, so you can build and run the app locally without consuming EAS cloud build quota.

1. Install [Android Studio](https://developer.android.com/studio) (this also installs the SDK manager).
2. In Android Studio > **More Actions > SDK Manager**, install:
   - **SDK Platform** matching the target Android version
   - **Android SDK Platform-Tools**
   - **Android Emulator**
   - **Android SDK Command-line Tools (latest)**
3. Set the required environment variables (adjust the base path to where the SDK was installed):

   **Windows (PowerShell, persist with `setx`):**
   ```powershell
   setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
   setx PATH "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\emulator;$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin"
   ```
   Open a new terminal afterwards so the updated `PATH` takes effect.

   **macOS/Linux (add to `~/.zshrc` / `~/.bashrc`):**
   ```bash
   export ANDROID_HOME="$HOME/Library/Android/sdk"   # macOS; ~/Android/Sdk on Linux
   export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin"
   ```

4. Accept the SDK licenses (required before the first native build):

   ```bash
   sdkmanager --licenses
   ```

## 2. Clone both repos as siblings

kwits is two independent repos with separate histories and remotes. They are not a monorepo — there is no git repo at the parent level. Cloning them side by side is purely a local convenience so both codebases are open in one editor window, and it makes the relative links in these docs (`../kwits-api`) resolve:

```bash
mkdir kwits && cd kwits
git clone <KWITS_MOBILE_REPO_URL> kwits-mobile
git clone <KWITS_API_REPO_URL>    kwits-api
```

Resulting layout:

```
kwits/
├── kwits-mobile/    this repo
└── kwits-api/       Spring Boot backend
```

Nothing breaks if you name the parent folder something else or put the repos elsewhere — only the relative doc links assume this shape.

## 3. Install dependencies

```bash
cd kwits-mobile
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required because Expo Router's bundled web tooling (Radix UI packages) has peer dependency ranges that conflict with this project's React version.

To avoid needing to remember the flag on every install, create a `.npmrc` at the repo root:

```bash
echo "legacy-peer-deps=true" > .npmrc
```

> **Current repo state:** no `.npmrc` is committed. Until one is, pass `--legacy-peer-deps` explicitly on every `npm install`.

## 4. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Where to get it | Required? |
| --- | --- | --- |
| `API_BASE_URL` | The address of your running kwits-api. `http://10.0.2.2:8080` for an Android emulator — see below. | Yes |
| `MAPTILER_API_KEY` | [MapTiler Cloud](https://cloud.maptiler.com/) > Account > Keys (free tier, no card required) | Only once map screens are built |
| `EAS_PROJECT_ID` | Expo dashboard > your project > project ID | Only for EAS builds |

These reach the app through `app.config.ts`, which exposes them as `Constants.expoConfig.extra.apiBaseUrl` / `.mapTilerApiKey`. Nothing else in the app reads `process.env` directly.

There are **no Supabase variables here.** `SUPABASE_URL` and `SUPABASE_ANON_KEY` used to live in this file; they moved to kwits-api when the backend split out. If you find them in an old `.env`, delete them — nothing reads them.

### Which address to use for `API_BASE_URL`

There is no single value that works everywhere, because "localhost" means something different on each target:

| Running the app on | Value |
| --- | --- |
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator, or Expo web | `http://localhost:8080` |
| A physical phone | `http://<your machine's LAN IP>:8080` |

`10.0.2.2` is not a real IP address. It is a fixed alias the Android emulator provides for the host machine, because inside the emulator `localhost` refers to the emulator's own virtual device. This is the single most common source of lost time on this project — see [HOW_TO_RUN.md](./HOW_TO_RUN.md#the-android-emulator-networking-gotcha).

`.env` is gitignored. Never commit it.

## 5. GitHub access (multiple accounts)

If you manage more than one GitHub account (e.g. personal and work) on the same machine, use a dedicated SSH key and host alias instead of the default `github.com` host:

```bash
ssh-keygen -t ed25519 -C "you@example.com" -f ~/.ssh/id_ed25519_work
```

Add the public key (`~/.ssh/id_ed25519_work.pub`) to your GitHub account under **Settings > SSH and GPG keys**.

Add an alias host in `~/.ssh/config`:

```
Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work
```

Clone or set the remote using the alias host instead of `github.com`:

```bash
git remote set-url origin git@github.com-work:<ORG_OR_USER>/kwits-mobile.git
```

The alias must match a `Host` entry in your SSH config, or git will fall back to your default key and fail with a permissions error against the repo you actually have access to.

## 6. Verify the setup

Before attempting a native build, confirm the JS side is sound:

```bash
npx tsc --noEmit          # should exit 0 with no output
npx expo config --type public   # should print resolved config including extra.apiBaseUrl
```

If `extra.apiBaseUrl` comes back empty, `.env` is missing or wasn't picked up — `app.config.ts` loads it via `dotenv/config`, so it must exist at the repo root.

---

Setup complete. Continue to [HOW_TO_RUN.md](./HOW_TO_RUN.md) to build and run the app. If the app needs a live backend, start it first via [kwits-api/docs/HOW_TO_RUN.md](../../kwits-api/docs/HOW_TO_RUN.md).

# How to set up kwits

This guide takes you from a fresh machine to a working local build. It assumes zero prior context about the project.

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

## 2. Windows-specific: install the Supabase CLI via Scoop, not npm

On Windows, do **not** install the Supabase CLI as an npm package. The npm-distributed build bundles a Bun runtime that segfaults on many Windows machines. Use [Scoop](https://scoop.sh/) instead:

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Verify it works:

```powershell
supabase --version
```

On **macOS**, install via Homebrew:

```bash
brew install supabase/tap/supabase
```

On **Linux**, or on macOS/Linux generally, you can also add it as a dev dependency via npm:

```bash
npm install supabase --save-dev
```

> Note: `package.json` currently lists `supabase` (`^2.115.0`) as an npm devDependency. On Windows, prefer the Scoop-installed binary over `npx supabase` for the reason above.

## 3. Clone and install dependencies

```bash
git clone <YOUR_FORK_OR_REPO_URL>
cd kwits
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required because Expo Router's bundled web tooling (Radix UI packages) has peer dependency ranges that conflict with this project's React version.

To avoid needing to remember the flag on every install, create a `.npmrc` at the project root:

```
legacy-peer-deps=true
```

```bash
echo "legacy-peer-deps=true" > .npmrc
```

## 4. Environment variables

Copy the example file:

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Where to get it |
| --- | --- |
| `SUPABASE_URL` | Supabase dashboard > your project > **Settings > API** > Project URL |
| `SUPABASE_ANON_KEY` | Supabase dashboard > your project > **Settings > API** > Project API keys > **publishable** (`anon`) key |
| `MAPTILER_API_KEY` | [MapTiler Cloud](https://cloud.maptiler.com/) > Account > Keys (free tier, no card required) |

**Never put the Supabase `service_role` / secret key in `.env`.** Only use the publishable (`anon`) key — this file ends up bundled into a client app.

> `.env.example` in this repo currently only lists `SUPABASE_URL` and `SUPABASE_ANON_KEY`. `MAPTILER_API_KEY` is read by `app.config.ts` but is not yet in `.env.example` — add it yourself as shown above.

## 5. Supabase project setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard) (or use an existing one).
2. Log in and link the CLI to your project:

   ```bash
   supabase login
   supabase link --project-ref <YOUR_SUPABASE_PROJECT_REF>
   ```

3. Apply the database migrations in `supabase/migrations/`:

   ```bash
   supabase db push
   ```

   > The current migration file (`supabase/migrations/20260818202046_initial_schema.sql`) is empty — there's no schema defined yet. Once the schema exists, this is the command that applies it.

4. Enable **Realtime** on any tables that need live updates (e.g. balances or payment proofs, once those tables exist) — Supabase dashboard > **Table Editor** > select the table > **Realtime** toggle, or add the table to the `supabase_realtime` publication in a migration.

5. Set up **Storage** buckets for receipt images and payment QR codes — Supabase dashboard > **Storage** > **New bucket**:

   - `receipts` — private bucket; add a policy allowing `INSERT`/`SELECT` for `authenticated` users on their own uploads.
   - `payment-qr-codes` — private bucket; add a policy allowing `INSERT`/`SELECT` for `authenticated` users on their own uploads.

   > These bucket names are a suggestion based on the app's data model (`receiptImageUrl` on `Expense`/`PaymentProof`, `qrImageUrl` on `UserPaymentQR`) — they are not yet codified in a migration, so confirm naming with the team before relying on it elsewhere.

## 6. GitHub access (multiple accounts)

If you manage more than one GitHub account (e.g. personal and work) on the same machine, use a dedicated SSH key and host alias instead of the default `github.com` host:

```bash
ssh-keygen -t ed25519 -C "cj@hirolabz.com" -f ~/.ssh/id_ed25519_personal
```

Add the public key (`~/.ssh/id_ed25519_personal.pub`) to your GitHub account under **Settings > SSH and GPG keys**.

Add an alias host in `~/.ssh/config`:

```
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
```

Clone/set the remote using the alias host instead of `github.com`:

```bash
git remote set-url origin git@github.com-personal:<YOUR_GITHUB_USERNAME>/kwits.git
```

---

Setup complete. Continue to [HOW_TO_RUN.md](./HOW_TO_RUN.md) to build and run the app.

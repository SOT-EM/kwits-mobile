<!--
   Fill every section. Delete a section only if it truly does not apply.
  Keep the PR title in Conventional Commits form, e.g. "feat: add expense split validation".
-->

## Summary

<!-- What does this PR do, and why? 1-3 sentences. -->

## Type of change

<!-- Check all that apply. -->

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor (no behaviour change)
- [ ] Performance
- [ ] Tests
- [ ] Docs
- [ ] Chore / tooling / CI
- [ ] Breaking change

## Changes

## <!-- Bullet the key changes so reviewers know where to look. -->

## Screens / UI affected

## <!-- Which screens or components changed? Include a screenshot or screen recording for visual changes. Delete if this is a non-UI change. -->

## Supabase changes

<!-- New/changed tables, columns, RLS policies, Storage buckets, or Edge Functions. Delete if none. -->

- [ ] SQL migration included and run against a dev/staging Supabase project
- [ ] RLS policies added/updated for any new or changed table
- [ ] Migration is safe on existing data (no destructive change without a backfill plan)
- [ ] Realtime enabled on new tables that need it (see `alter publication supabase_realtime add table ...`)

## Config / environment

<!-- New or changed env vars, secrets, or native config. -->

- [ ] New env vars added to `.env.example` (never commit real values)
- [ ] No secrets or credentials committed
- [ ] `app.config.ts` updated if a new native plugin or permission was added
- [ ] New native module added — noted below so reviewers know a rebuild (`expo run:android`) is required, not just `expo start`

## How to test

<!-- Steps for the reviewer: setup, commands, expected result, edge cases. -->

1.

## Checklist

- [ ] Self-reviewed the diff
- [ ] Type check passes locally (`npx tsc --noEmit`)
- [ ] Lint passes locally (`npm run lint --if-present`)
- [ ] Tests pass / added or updated where relevant (`npm test --if-present`)
- [ ] PR title follows Conventional Commits
- [ ] Updated docs / README if behaviour or setup changed

## Notes for reviewer / deploy

<!-- Deploy ordering, migration timing, feature flags, rollback plan, follow-ups, anything risky. -->

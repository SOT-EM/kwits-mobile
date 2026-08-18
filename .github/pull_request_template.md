<!--
   Fill every section. Delete a section only if it truly does not apply.
  Keep the PR title in Conventional Commits form, e.g. "feat: add pusher webhook endpoint".
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

## API changes

<!-- New/changed endpoints, request/response shape, status codes. Delete if none. -->

- Endpoints affected:
- Backward compatible? [ ] yes [ ] no - if no, describe the migration path for clients:

## Database migrations

<!-- Delete if no schema change. -->

- [ ] Sequelize migration included (`backend/migrations/*.cjs`)
- [ ] Migration is reversible (`down` implemented and tested)
- [ ] Safe on existing data (no destructive change without a backfill plan)

## Config / environment

<!-- New or changed env vars, secrets, or infra. -->

- [ ] New env vars documented in the relevant `.env.example`
- [ ] No secrets or credentials committed

## How to test

<!-- Steps for the reviewer: setup, requests/commands, expected result, edge cases. -->

1.

## Checklist

- [ ] Self-reviewed the diff
- [ ] Lint & type checks pass locally (`npm run lint`, `npm run typecheck`)
- [ ] `npm test` passes / tests added or updated where relevant
- [ ] PR title follows Conventional Commits
- [ ] Updated docs / README if behaviour or setup changed

## Notes for reviewer / deploy

<!-- Deploy ordering, migration timing, feature flags, rollback plan, follow-ups, anything risky. -->

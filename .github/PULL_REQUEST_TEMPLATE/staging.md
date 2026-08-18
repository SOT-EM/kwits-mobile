<!--
  This PR promotes accumulated changes from dev into staging.
  The person merging this PR fills out the "Approved for this release" section —
  list exactly which features/fixes from dev are intended to go out in this batch.
-->

## Release batch summary

<!-- 1-3 sentences: what is this staging promotion, overall? -->

## Approved for this release

<!-- List every feature/fix included, one line each, with the original PR # from dev. -->

| #   | Feature / Fix | Original PR | Author |
| --- | ------------- | ----------- | ------ |
|     |               |             |        |

## Excluded from this release

## <!-- Anything merged into dev but deliberately NOT included in this promotion (e.g. behind a flag, not ready). -->

## Database migrations in this batch

- [ ] All migrations from included PRs are listed here:
- [ ] Migrations tested against a staging-like dataset
- [ ] Rollback plan confirmed for each migration

## Config / environment changes in this batch

- [ ] All new env vars for this batch are documented and set in staging
- [ ] No secrets committed

## Regression risk

## <!-- What existing functionality could this batch affect, beyond the new features themselves? -->

## How to verify on staging

<!-- Steps for whoever tests this promotion once merged. -->

1.

## Checklist

- [ ] All included PRs passed CI on `dev`
- [ ] No unmerged/incomplete features accidentally included
- [ ] Staging environment variables reviewed and up to date
- [ ] Merger has manually verified the diff between `staging` and `dev` before opening this PR

## Notes for QA / deploy

<!-- Anything QA should focus on, known issues, deploy ordering. -->

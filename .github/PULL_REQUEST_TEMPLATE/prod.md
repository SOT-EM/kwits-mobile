<!--
  This PR promotes a verified staging build to production.
  Do not open this PR until QA has signed off on staging — this template
  requires that sign-off to be documented below, not just implied.
-->

## Release summary

<!-- What is going to production in this release? 1-3 sentences. -->

## QA sign-off

<!-- Required. This PR should not be opened without this filled in. -->

- QA tester:
- Staging build/commit tested:
- Date tested:
- [ ] All acceptance criteria met for every feature/fix in this release
- [ ] No open Sev1/Sev2 bugs found during staging testing
- [ ] ## Regression pass completed on core flows (list which flows were checked):

## Success criteria for this release

## <!-- Defined by QA — what must be true after this ships for it to be considered successful? -->

## Included changes

<!-- Pull from the staging promotion PR(s) that led here. -->

| #   | Feature / Fix | Staging PR |
| --- | ------------- | ---------- |
|     |               |            |

## Database migrations

- [ ] All migrations verified on staging with production-like data volume
- [ ] Rollback plan documented and tested
- [ ] Migration timing agreed with team (e.g. run before/after deploy, maintenance window needed?)

## Rollback plan

## <!-- If this release causes a problem in production, what's the exact rollback procedure? -->

## Deploy checklist

- [ ] Config/env vars confirmed set in production
- [ ] Feature flags (if any) confirmed in correct state for this release
- [ ] Team notified of deploy window
- [ ] Monitoring/alerts reviewed post-deploy (who's watching, for how long?)

## Post-deploy verification

<!-- Steps to confirm the release actually succeeded in production. -->

1.

# Automation Framework — Implementation Plan

> **Project:** Playwright + TypeScript E2E suite for the Cognizant QE Agentic Hub (Defect Triaging agent)
> **Baseline:** Two working starter scripts — `login-valid.spec.ts` and `defect-triaging-run.spec.ts`
> **Goal:** Evolve the skeleton into a production-ready, maintainable framework in five phases.

---

## Phase 1 — Page Object Models

**Goal:** Move all raw locators out of the test files and into dedicated page classes under `pages/`. Tests should read like plain English; no selector strings should appear inside a `spec.ts` file.

### Deliverables

| File | Responsibility |
|---|---|
| `pages/LoginPage.ts` | `goto()`, `fillEmail()`, `fillPassword()`, `submit()`, `assertLoggedIn()` |
| `pages/DefectTriagingPage.ts` | `openWorkspace()`, `clickNeo4jLookup()`, `fillDefectForm()`, `startRun()`, `answerAssignmentPrompt()`, `assertTriageSummary()` |

### Acceptance criteria
- Both existing spec files refactored to use the new page classes with zero raw locator strings remaining in the spec.
- `npx tsc --noEmit` passes with no errors.
- Both tests still pass end-to-end against the live hub.

---

## Phase 2 — Reusable Component Flows

**Goal:** Extract multi-step sequences that will repeat across future tests into composable helper functions under `reusable-components/`. Pages know *what* a page contains; flows know *how* to accomplish a task.

### Deliverables

| File | Responsibility |
|---|---|
| `reusable-components/AuthFlows.ts` | `loginAs(page, email, password)`, `logout(page)` |
| `reusable-components/AgentFlows.ts` | `submitDefect(page, defect)`, `waitForAgentRunning(page)`, `approveAssignment(page)`, `assertRunCompleted(page)` |

### Acceptance criteria
- Both spec files import only from `pages/` and `reusable-components/` — no inline multi-step logic.
- A new test can complete a full defect triage run in under 10 lines by composing flows.
- All tests still pass.

---

## Phase 3 — Expanded Test Coverage

**Goal:** Cover negative paths, boundary cases, and any additional agents or UI areas identified during walkthrough. Organised by area with clear naming.

### Planned test cases

#### Auth (`tests/auth/`)
| Spec file | Scenario |
|---|---|
| `login-valid.spec.ts` | *(existing)* Happy path sign-in |
| `login-invalid.spec.ts` | Wrong password — error message shown, user stays on `/login` |
| `login-empty-fields.spec.ts` | Submit with blank fields — inline validation errors appear |

#### Defect Triaging (`tests/agent/`)
| Spec file | Scenario |
|---|---|
| `defect-triaging-run.spec.ts` | *(existing)* Neo4j Lookup — full happy path, owner assigned |
| `defect-triaging-decline-assign.spec.ts` | Human-in-the-loop: answer **NO** — run ends without owner assignment |
| `defect-triaging-empty-id.spec.ts` | Submit form with blank Defect ID — validation error shown |
| `defect-triaging-duplicate.spec.ts` | Re-submit same defect ID — confirm system handles gracefully |

### Acceptance criteria
- All new specs are independent (no shared state between tests).
- Every spec has a matching entry in `testcases/` (see Phase 4).
- Full suite passes in a single `npm test` run.

---

## Phase 4 — Test Data, Fixtures & Utilities

**Goal:** Centralise test data, add Playwright fixtures for common setup/teardown, and build helper scripts under `tools/` for resetting state between runs.

### Deliverables

| Path | Purpose |
|---|---|
| `tools/test-data.ts` | Typed constants for defects, users, project slugs — single source of truth |
| `tools/fixtures.ts` | Playwright `test.extend()` fixture that auto-logs in and provides a ready `page` to every test |
| `tools/reset-run-state.ts` | Script to clear previous agent run history via API so tests always start clean |
| `testcases/defect-triaging.md` | Human-readable test case register mapping spec names → expected behaviour |
| `testcases/auth.md` | Human-readable test case register for auth specs |

### Acceptance criteria
- All spec files import defect/user constants from `tools/test-data.ts`; no magic strings in tests.
- The logged-in fixture eliminates the duplicated login steps in every spec.
- `tools/reset-run-state.ts` can be run as a standalone script before a full suite execution.
- `testcases/` docs match every spec in `tests/`.

---

## Phase 5 — CI/CD Integration & Reporting

**Goal:** Run the suite automatically on every push, surface results as a published HTML report, and add just enough parallelism to keep total runtime under 5 minutes.

### Deliverables

| Item | Detail |
|---|---|
| `.github/workflows/e2e.yml` (or equivalent pipeline file) | Triggered on push/PR; installs deps, runs `npm test`, uploads report as artefact |
| Parallel worker config | Increase `workers` in `playwright.config.ts` from 1 to `os.cpus().length / 2` for independent specs |
| Retry on failure | Set `retries: 1` in config so a single flaky network call doesn't fail the build |
| Slack / email notification | Post pass/fail summary with report link on completion |
| `README.md` update | Add CI badge, updated run instructions, and link to latest published report |

### Acceptance criteria
- A green pipeline run on the main branch with all tests passing.
- HTML report accessible as a downloadable artefact from the pipeline.
- Total suite runtime under 5 minutes on the CI runner.
- `README.md` reflects the final project structure accurately.

---

## Phase Summary

| # | Phase | Key output | Depends on |
|---|---|---|---|
| 1 | Page Object Models | `pages/LoginPage.ts`, `pages/DefectTriagingPage.ts` | Baseline scripts |
| 2 | Reusable Flows | `reusable-components/AuthFlows.ts`, `AgentFlows.ts` | Phase 1 |
| 3 | Expanded Coverage | 6+ new spec files across auth & agent | Phase 2 |
| 4 | Data & Fixtures | `tools/`, `testcases/`, typed fixtures | Phase 3 |
| 5 | CI/CD & Reporting | Pipeline, parallelism, notifications | Phase 4 |

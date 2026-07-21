# Architecture

The framework is built in four layers. Each layer only knows about the one below
it, which keeps locators in one place and test bodies readable.

```
tests/  ──────────────►  reusable-components/  ──────────►  pages/  ──────────►  Playwright
(what to verify)         (how to accomplish a task)         (what's on screen)   (the browser)
        │
        └──────────────►  tools/  (data, fixtures, utilities)
```

## Layer 1 — Page Objects (`pages/`)

**Own every locator. No test logic.** A page object exposes the elements of one
screen and small actions on them.

| File | Screen | Key members |
|------|--------|-------------|
| [../pages/LoginPage.ts](../pages/LoginPage.ts) | Sign-in | `login()`, `assertLoggedIn()`, `assertLoginFailed()` |
| [../pages/DefectTriagingPage.ts](../pages/DefectTriagingPage.ts) | Defect Triaging workspace | `openWorkspace()`, `clickNeo4jLookup()`, the 5 HITL methods, `assertTriageSummary()` |

**Rules**
- Locators are declared once in the constructor and reused.
- No spec file contains a raw selector — enforced by convention (grep `tests/`
  for `getBy`/`locator(` should return nothing).
- Locator choices are documented inline where they were confirmed against the
  live DOM (see the `// confirmed live` comments).

## Layer 2 — Reusable flows (`reusable-components/`)

**Compose page objects into multi-step tasks.** Pages know *what*; flows know
*how*.

| File | Provides |
|------|----------|
| [../reusable-components/AuthFlows.ts](../reusable-components/AuthFlows.ts) | `loginAs()`, `logout()` |
| [../reusable-components/AgentFlows.ts](../reusable-components/AgentFlows.ts) | `submitDefect()`, the per-HITL helpers, and `triageDefectEndToEnd()` |

`triageDefectEndToEnd()` is the whole happy path in one call:

```
submitDefect → publishLogs → approveAnalyzer → publishResolution
             → approveAssignment → selectContributor → assertRunCompleted
```

## Layer 3 — Tools (`tools/`)

| File | Purpose |
|------|---------|
| [../tools/test-data.ts](../tools/test-data.ts) | Single source of truth: `USERS`, `PROJECTS`, `DEFECTS`, `CONTRIBUTORS`. No magic strings in specs. |
| [../tools/fixtures.ts](../tools/fixtures.ts) | `authedPage` fixture — auto-logs in and hands specs a signed-in page. |
| [../tools/reset-run-state.ts](../tools/reset-run-state.ts) | Scaffold to clear prior run history before a suite (needs the hub reset endpoint wired up). |

## Layer 4 — Specs (`tests/`)

Thin and declarative. An agent spec that uses the fixture + flow is ~2 lines:

```ts
test('...', async ({ authedPage }) => {
  await triageDefectEndToEnd(authedPage, DEFECTS.sample.id);
});
```

```
tests/
├── auth/     login-valid · login-invalid · login-empty-fields
└── agent/    defect-triaging-run · -decline-assign · -empty-id · -duplicate
```

## Design decisions worth knowing

- **Real Chrome, not Chromium** — the hub renders/serves for Chrome; the config
  pins `channel: 'chrome'`.
- **`ignoreHTTPSErrors: true`** — the internal host uses a self-signed cert.
- **SPA-aware waits** — login and tab switches are client-side; the code polls
  in-page state (`waitForFunction`, `expect(...).toBeVisible()`) rather than
  waiting on `load` events, and never uses `networkidle` (the agent holds a
  websocket open, so the network never goes idle).
- **`waitForAwaitingInput()` before each HITL step** — confirms the agent has
  actually paused before we hunt for a prompt button, avoiding races with the
  streaming run.
- **Locators discovered from DOM snapshots** — see
  [TROUBLESHOOTING.md](TROUBLESHOOTING.md#fixing-a-broken-locator).

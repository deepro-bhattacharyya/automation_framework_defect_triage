# Automation Framework — Defect Triage

Playwright + TypeScript E2E framework for the Cognizant **QE Agentic Hub**
(`https://10.120.101.154`), covering sign-in and the **Defect Triaging** agent
(Neo4j Lookup flow).

The framework is built in five layers (see [docs/PLAN.md](docs/PLAN.md)): page
objects, reusable flows, test specs, shared data/fixtures, and CI.

```
automation-framework-defect-triage/
├── pages/                          Page Objects (locators live here only)
│   ├── LoginPage.ts
│   └── DefectTriagingPage.ts
├── reusable-components/            Composable multi-step flows
│   ├── AuthFlows.ts
│   └── AgentFlows.ts
├── tools/                          Shared data, fixtures, utilities
│   ├── test-data.ts                single source of truth for users/defects
│   ├── fixtures.ts                 `authedPage` fixture (auto-login)
│   └── reset-run-state.ts          pre-suite run-history reset (scaffold)
├── tests/
│   ├── auth/                       login-valid / login-invalid / login-empty-fields
│   └── agent/                      defect-triaging run / decline / empty-id / duplicate
├── testcases/                      human-readable test-case registers (auth, defect-triaging)
├── docs/                           PLAN.md + TEST-WALKTHROUGH.md
├── .github/workflows/e2e.yml       CI pipeline (self-hosted runner)
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Setup

```powershell
npm install
npx playwright install chrome
```

## Credentials (no secrets committed)

Credentials default to the walkthrough demo values in
[tools/test-data.ts](tools/test-data.ts) and can be overridden:

```powershell
$env:HUB_EMAIL = "your.name@cognizant.com"
$env:HUB_PASSWORD = "your-password"
```

## Run

```powershell
npm test                 # whole suite, headless
npm run test:headed      # watch it drive a real Chrome window
npm run test:ui          # interactive UI mode
npm run report           # open the HTML report
npm run typecheck        # tsc --noEmit (no test run)

# run one spec
npx playwright test tests/agent/defect-triaging-run.spec.ts
```

## Test coverage

| Area | Specs |
|------|-------|
| Auth | valid login, wrong password, empty fields |
| Defect Triaging | happy-path run, decline-at-prompt, empty Defect ID, duplicate re-submit |

Each spec is catalogued in [testcases/](testcases/) (`auth.md`,
`defect-triaging.md`). The exact live flow each test drives is documented in
[docs/TEST-WALKTHROUGH.md](docs/TEST-WALKTHROUGH.md).

## CI

[.github/workflows/e2e.yml](.github/workflows/e2e.yml) runs the suite on push /
PR to `main` and uploads the HTML report as an artifact (14-day retention).

> **The hub is an internal host** — GitHub-hosted runners cannot reach
> `10.120.101.154`. The workflow runs on a **self-hosted runner** on the
> corporate network. Register one labelled `self-hosted` and add the
> `HUB_EMAIL` / `HUB_PASSWORD` (and optional `SLACK_WEBHOOK_URL`, `HUB_TOKEN`)
> repository secrets before enabling.

On CI the suite runs with `retries: 1` and a small worker pool (`50%` of cores).
The four agent specs share live backend state (same Defect ID, ADO writes), so
if they prove flaky in parallel, set `workers: 1` in
[playwright.config.ts](playwright.config.ts).

## Confirming real selectors

Some negative-path locators (login error, NO button, validation messages) are
best-effort — those paths weren't in the walkthrough recording. If a locator
doesn't match the live DOM:

```powershell
npx playwright codegen https://10.120.101.154
```

Click an element and it prints the exact locator to paste in.

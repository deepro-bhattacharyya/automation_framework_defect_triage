# CI / CD

Pipeline: [../.github/workflows/e2e.yml](../.github/workflows/e2e.yml)

## What it does

On every push / PR to `main` (and manual `workflow_dispatch`):

1. Checkout + set up Node 22 (with npm cache)
2. `npm ci`
3. Install the Chrome channel (`npx playwright install --with-deps chrome`)
4. Best-effort reset of prior agent run state (`continue-on-error`)
5. `npm test` (with `CI=true` → `retries: 1`, `workers: 50%`)
6. Upload the HTML report as an artifact (`playwright-report/`, 14-day retention) — always, even on failure
7. Optional Slack notification of pass/fail

## Runner requirement — must be self-hosted

The hub (`https://10.120.101.154`) is an **internal host** and is **not reachable
from GitHub-hosted runners**. The job declares `runs-on: [self-hosted]`. Before
the pipeline can go green you must:

1. Register a self-hosted runner on the corporate network
   (GitHub → Settings → Actions → Runners) and label it `self-hosted`.
2. Ensure that machine has Chrome available (the install step handles the
   Playwright side).

## Secrets & variables

| Name | Type | Purpose |
|------|------|---------|
| `HUB_EMAIL` | secret | test account email |
| `HUB_PASSWORD` | secret | test account password |
| `SLACK_WEBHOOK_URL` | secret (optional) | Slack Incoming Webhook for the notify step |
| `HUB_TOKEN` | secret (optional) | auth for the run-state reset endpoint |
| `HUB_RESET_ENDPOINT` | variable (optional) | path for the run-state reset call |

## Parallelism & retries on CI

Set in [../playwright.config.ts](../playwright.config.ts):

```ts
workers: process.env.CI ? '50%' : 1,   // half the cores on CI
retries: process.env.CI ? 1 : 0,        // absorb one flaky/hub-down run
```

> **Caveat:** the four agent specs triage the **same** Defect ID against the
> shared live hub and write to ADO. If they prove flaky when run concurrently,
> drop CI to `workers: 1`. The auth specs are independent and safe to parallelize.

## Caveats to be aware of

- **Not yet verified green on a real runner** — no self-hosted runner is
  registered from this environment. The workflow is correct but unproven until
  one is connected and the secrets are added.
- **`reset-run-state.ts` is a scaffold** — it no-ops with a warning unless
  `HUB_RESET_ENDPOINT` is set, so the reset step won't fail the build.
- **Runtime** — a full happy-path agent run can take minutes; the job timeout is
  30 min. The "under 5 minutes" goal from the original plan is unrealistic given
  the live agent streaming time.

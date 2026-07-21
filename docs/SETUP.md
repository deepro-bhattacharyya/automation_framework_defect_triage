# Setup & Running

## Prerequisites

- **Node.js 22+** (the project types against `@types/node@22`)
- **Google Chrome** (tests use the real Chrome channel, not bundled Chromium)
- Network access to the internal hub **`https://10.120.101.154`** (VPN / corporate
  network — the host is not reachable from the public internet)

## Install

```powershell
npm install
npx playwright install chrome
```

## Credentials

Credentials default to the demo account in
[../tools/test-data.ts](../tools/test-data.ts) and can be overridden with
environment variables (nothing secret is committed):

```powershell
$env:HUB_EMAIL = "your.name@cognizant.com"
$env:HUB_PASSWORD = "your-password"
```

## Running

```powershell
npm test                 # whole suite, headless
npm run test:headed      # watch it drive a real Chrome window
npm run test:ui          # Playwright interactive UI mode
npm run report           # open the last HTML report
npm run typecheck        # tsc --noEmit, no test run

# a single spec
npx playwright test tests/agent/defect-triaging-run.spec.ts

# a single spec, watching the browser
npm run test:headed -- tests/agent/defect-triaging-run.spec.ts
```

## Timeouts (important)

Agent runs are **long** — the Defect Triaging happy path streams many steps and
pauses at five human-in-the-loop prompts, taking roughly **45s–3min** per run.
The config reflects this ([../playwright.config.ts](../playwright.config.ts)):

| Setting | Value | Why |
|---------|-------|-----|
| `timeout` | 420 s (7 min) | a full agent run + 5 HITL waits |
| `expect.timeout` | 90 s | a single HITL wait can take a minute+ |
| `workers` | 1 locally | agent specs share live backend state (see below) |

## Important constraints

- **The agent writes to real systems.** Each happy-path run publishes logs and a
  resolution to **ADO** and assigns a real contributor. These are genuine side
  effects, not mocks.
- **Do not parallelize the agent specs against the live hub.** They all triage
  the same Defect ID (`80`) and mutate shared backend state. Keep `workers: 1`
  for agent specs. (Auth specs are independent and safe.)
- **The hub can be flaky.** Intermittent `502 Bad Gateway` and backend agent
  errors occur — see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Fixing a locator when the UI changes

```powershell
npx playwright codegen https://10.120.101.154
```

Click an element and it prints the exact locator. See
[TROUBLESHOOTING.md](TROUBLESHOOTING.md#fixing-a-broken-locator) for the
DOM-snapshot method used to build this suite.

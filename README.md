# Automation Framework — Defect Triage

Playwright E2E framework for the Cognizant **QE Agentic Hub**
(`https://10.120.101.154`), covering sign-in and the **Defect Triaging** agent.

This is the **starter skeleton**: the full folder structure is in place, but only
the **two starter scripts** are written (per the plan: build 1–2 scripts, get them
reviewed, then fill in the rest).

```
automation-framework-defect-triage/
├── pages/                  (empty — Page Objects go here later)
├── reusable-components/    (empty — shared flows go here later)
├── tools/                  (empty — helpers / data reset scripts later)
├── testcases/              (empty — test-case notes later, if needed)
├── tests/
│   ├── auth/
│   │   └── login-valid.spec.ts          ← SCRIPT 1
│   └── agent/
│       └── defect-triaging-run.spec.ts  ← SCRIPT 2
├── playwright.config.ts    baseURL + ignoreHTTPSErrors + long timeouts
├── package.json
├── tsconfig.json
└── .gitignore
```

> The empty folders contain a `.gitkeep` only so they survive in git. Delete it
> once you add real files.

## Setup

```powershell
npm install
npx playwright install chrome
```

## Credentials (no secrets committed)

```powershell
$env:HUB_EMAIL = "your.name@cognizant.com"
$env:HUB_PASSWORD = "your-password"
```

## Run

```powershell
npm test                 # both scripts, headless
npm run test:headed      # watch it drive a real Chrome window
npm run report           # open the HTML report

# run one script
npx playwright test tests/auth/login-valid.spec.ts
npx playwright test tests/agent/defect-triaging-run.spec.ts
```

## The two scripts

1. **`tests/auth/login-valid.spec.ts`** — signs in with valid credentials and
   confirms the app loads. Foundation for everything else.
2. **`tests/agent/defect-triaging-run.spec.ts`** — submits a defect via Manual
   Input, lets the agent run, answers the human-in-the-loop assignment prompt
   (**YES**), and verifies the Triage Summary (resolution published to ADO +
   owner assigned).

Both are **self-contained** for this first review. Once approved, the locators
move into `pages/` and the steps into `reusable-components/` — that's what the
empty folders are reserved for.

## Confirming real selectors

The locators are based on the walkthrough recording. If any don't match the live
DOM, the fastest fix:

```powershell
npx playwright codegen https://10.120.101.154
```

Click an element and it prints the exact locator to paste in.

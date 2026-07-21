# Troubleshooting

## Known intermittent issues (server-side, not test bugs)

These originate on the hub, not in the test code. When they occur, the run
fails; the fix is to **re-run once the hub recovers**, not to change locators.

| Symptom in the report | Cause | What to do |
|-----------------------|-------|------------|
| Page snapshot shows `502 Bad Gateway` (nginx) at login | The hub is down/restarting | Wait, re-run. Confirm with `npx playwright test tests/auth/login-valid.spec.ts` |
| Conversation shows `Agent error: Failed to write data to connection ... :443` | Backend service (ADO/Kibana) dropped mid-run | Re-run — this is transient |
| Conversation shows `Neo.ClientError.Security.Unauthorized` | Neo4j credentials on the hub invalid/expired | Backend fix required; not a test change |
| A run stalls with no prompt then times out | Agent crashed early (see conversation panel for an "Agent error") | Read the error-context snapshot to confirm it's server-side |

Because these are real, CI runs with `retries: 1` to absorb a single flaky run.

## How the HITL waits are made robust

Each of the five HITL steps calls `waitForAwaitingInput()` first — it waits for
the status pill to read **"Awaiting Input"** before looking for the prompt
button. This prevents racing the streaming agent. Individual `expect` waits use
the 90 s `expect.timeout` because a single agent step can take that long.

If a HITL step times out **and** the conversation shows no agent error, the
prompt wording likely changed — update the matching locator in
[../pages/DefectTriagingPage.ts](../pages/DefectTriagingPage.ts) using the method
below.

## Fixing a broken locator

The whole suite's locators were built by reading Playwright's **DOM snapshot**
captured on failure — the most reliable way to see exactly what the live page
renders.

1. Run the failing spec. On failure Playwright writes
   `test-results/<spec>/error-context.md` containing a YAML accessibility
   snapshot of the page at the moment of failure.
2. Open that file and find the real text / role / button label.
3. Update the locator in the relevant page object.
4. Re-run.

Quick extraction of the snapshot (PowerShell):

```powershell
Get-Content "test-results\<spec-folder>\error-context.md"
```

For interactive discovery on a page that isn't failing:

```powershell
npx playwright codegen https://10.120.101.154
```

### Locator gotchas discovered in this app

- **Login inputs have no label/id/name** → matched by `input[type="email"]` /
  `input[type="password"]`, not `getByLabel`.
- **Login & tab switches are SPA route changes** → don't wait on `load`; poll
  in-page state. Never use `networkidle` (the agent holds a websocket open).
- **Neo4j Lookup tab** can register a click as focus-only before hydration →
  `clickNeo4jLookup()` verifies the panel switched and retries once.
- **"Triage Defect" is disabled** when the Defect ID is blank — that is the
  validation; assert `toBeDisabled()` rather than clicking and expecting an error.
- **Contributor list (HITL #5)** — each candidate is a `button`; match by a name
  fragment (`CONTRIBUTORS.sunil`) so minor formatting changes don't break it.
- **There is no "Triage Summary" heading** — completion is confirmed by
  "Resolution added to ADO successfully!" plus the assignment message.

## Test discovery / type errors

```powershell
npm run typecheck        # tsc --noEmit — catches locator/method rename mismatches
npx playwright test --list   # confirms all 7 specs are discovered
```

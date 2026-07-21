# Test Walkthrough — The Live Defect Triaging Flow

> This document describes the **actual** end-to-end flow as confirmed against the
> live hub (`https://10.120.101.154`) — every navigation step, every locator, and
> all **five** human-in-the-loop (HITL) prompts. It is the source of truth the
> automation mirrors. If the live UI changes, update this file and the matching
> locators in [../pages/DefectTriagingPage.ts](../pages/DefectTriagingPage.ts).
>
> Base URL (from `playwright.config.ts`): **`https://10.120.101.154`**

---

## Script 1 — Login (`tests/auth/login-valid.spec.ts`)

| # | Action | Locator | Notes |
|---|--------|---------|-------|
| 1 | Navigate to `/login` | `page.goto('/login')` | |
| 2 | Fill email | `input[type="email"]` | Fields have **no** label/id/name — matched by type |
| 3 | Fill password | `input[type="password"]` | |
| 4 | Click **Sign in** | `getByRole('button', { name: 'Sign in' })` | |
| 5 | Verify | left `/login` + "QE Agentic Hub" visible | Login is a client-side SPA route change |

**Negative auth cases:**
- **Wrong password** → stays on `/login`, shows an error → `login-invalid.spec.ts`
- **Blank fields** → stays on `/login`, shows **"Email is required" / "Password is required"** → `login-empty-fields.spec.ts`

---

## Script 2 — Defect Triaging happy path (`tests/agent/defect-triaging-run.spec.ts`)

### Part A — Navigate to the workspace (via the real UI)

| # | Action | Locator |
|---|--------|---------|
| 1 | Log in | (as Script 1; handled by the `authedPage` fixture) |
| 2 | Click **Projects** | `getByRole('link', { name: 'Projects' })` |
| 3 | Click **HCM Project** card | `getByRole('heading', { name: 'HCM Project' })` |
| 4 | Click the Defect Triaging **Run** link | `a[href="/workspace?agent=defect-triaging&project=proj-rbac-test"]` |
| 5 | Verify | "Defect Triaging" heading visible |

> **Why match the Run link by exact href?** The HCM Project lists ~24 agents,
> all with a generic "Run" link — including a `defect-triaging-crewai` variant.
> The exact `agent=defect-triaging` href disambiguates. HCM Project's slug is
> `proj-rbac-test` (seen in its settings URL).

### Part B — Submit the defect (Neo4j Lookup)

| # | Action | Locator |
|---|--------|---------|
| 6 | Click **Neo4j Lookup** tab | `getByRole('button', { name: 'Neo4j Lookup' })` |
| 7 | Enter Defect ID `80` | `getByPlaceholder(/DEF-123.*BANK-389/i)` |
| 8 | Click **Triage Defect** | `getByRole('button', { name: 'Triage Defect' })` |
| 9 | Verify status → **Running** | `getByText(/Running/i)` |

> **Hydration note:** the tab click can register as focus-only before React
> attaches its handler, leaving the panel on "Manual Input". `clickNeo4jLookup`
> confirms the switch by waiting for the Neo4j Defect ID field (unique
> `BANK-389` placeholder) and retries the click once if needed.
>
> **Blank ID:** the **Triage Defect** button is **disabled** while the ID field
> is empty — that *is* the validation (no inline error text). See
> `defect-triaging-empty-id.spec.ts`.

### Part C — The five human-in-the-loop prompts

The agent runs (`Fetching defect → Extracting identifiers → Searching logs →
Filtering logs → Finding similar → Root cause analysis → Identifying owner`) and
pauses **five** times. Before each, the status pill shows **"Awaiting Input"**
(the automation waits for that first via `waitForAwaitingInput()`).

| # | Prompt text on screen | Action taken (happy path) | Buttons |
|---|-----------------------|---------------------------|---------|
| **1** | "Please find below N fetched logs. Select the ones to publish to ADO." | **Use all filtered logs** | `Use all filtered logs` / `Skip log publishing` |
| **2** | "Do you want to continue with Defect Analyzer? [1] YES [2] NO" | **YES** | `YES` / `NO` |
| **3** | "Do you want to publish the defect resolution to ADO? [1] YES [2] NO" | **YES** | `YES` / `NO` |
| **4** | "Do you want to proceed with assigning the analyzed defect? [1] YES [2] NO" | **YES** | `YES` / `NO` |
| **5** | "Please select and assign new contributor" | Click a contributor (name contains **"Sunil"**) | one button per candidate |

> **Prompt 5 nuance:** when the agent finds no auto-match for the root-cause
> category ("No contributor found related to Test Data Issue.") it lists
> candidate contributors as buttons, e.g. *"KURUBA VIRUPAKSHAPPA, Sunil BHUSHAN
> (Cognizant)"*, *"Hiray, Anuj (Cognizant)"*, … The automation clicks the first
> button whose label contains the configured fragment (`CONTRIBUTORS.sunil`).

### Part D — Completion

| Check | Locator |
|-------|---------|
| Resolution published | `getByText(/Resolution added to ADO successfully/i)` |
| Defect assigned (final confirmation) | `getByText(/assigned\|assignment complete\|thank you/i)` |

---

## The defect used (ID `80`)

In the Neo4j Lookup flow you only supply the **Defect ID**; the agent fetches the
rest from ADO/Neo4j:

| Field | Value |
|-------|-------|
| Defect ID | `80` |
| Description | `Tried created a new project "alpha" but failed to create` |
| Root cause (agent-derived) | **Test Data Issue** — `Project with name alpha already exists` |

---

## Quick reference — the whole happy path, in order

`loginAs` → **Projects** → **HCM Project** → **Defect Triaging Run** →
**Neo4j Lookup** → Defect ID `80` → **Triage Defect** → *Running* →
HITL1 **Use all filtered logs** → HITL2 **YES** → HITL3 **YES** →
HITL4 **YES** → HITL5 **click contributor** → verify *Resolution added to ADO* +
assignment confirmation.

This is implemented as the single call
`triageDefectEndToEnd(page, DEFECTS.sample.id)` in
[../reusable-components/AgentFlows.ts](../reusable-components/AgentFlows.ts).

---

## Watch it run live

```powershell
npm run test:headed -- tests/agent/defect-triaging-run.spec.ts
```

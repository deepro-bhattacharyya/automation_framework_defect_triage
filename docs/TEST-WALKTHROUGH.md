# Test Walkthrough — What Each Script Actually Does

> Updated to match the recorded run (`defect_triage_agent_without_audio.mp4`).
> This run uses the **Neo4j Lookup** flow: you enter only a Defect ID, and the
> agent fetches the description, steps, and logs itself. There are **two**
> human-in-the-loop prompts in this flow.
>
> Base URL (from `playwright.config.ts`): **`https://10.120.101.154`**

---

## Script 1 — Login (`tests/auth/login-valid.spec.ts`)

**Test name:** *user can sign in to the QE Agentic Hub with valid credentials*

| # | Action | What it targets on the page | Source line |
|---|--------|------------------------------|-------------|
| 1 | Navigate | Opens `https://10.120.101.154/login` | `page.goto('/login')` |
| 2 | Type email | Field labelled **"Email"** → fills `deepro.bhattacharyya@cognizant.com` (or `$env:HUB_EMAIL`) | `getByLabel('Email')` |
| 3 | Type password | Field labelled **"Password"** → fills the password | `getByLabel('Password')` |
| 4 | Click | Button named **"Sign in"** | `getByRole('button', { name: 'Sign in' })` |

### What it then checks (must be true or the test fails)
- ✅ URL is **no longer** `.../login`
- ✅ The text **"QE Agentic Hub"** is visible somewhere on the page

---

## Script 2 — Defect Triaging (`tests/agent/defect-triaging-run.spec.ts`)

**Test name:** *defect triaging agent runs a defect end-to-end and assigns an owner*

> **Flow used:** Neo4j Lookup (enter Defect ID only — the agent fetches the
> rest). The run pauses **twice** for human input: once to continue with the
> Defect Analyzer, and once to choose the assignee from a list.

### Step group 1 — Log in (same as Script 1)
| # | Action | Target | Source line |
|---|--------|--------|-------------|
| 1 | Navigate | `/login` | `page.goto('/login')` |
| 2 | Type email | Field **"Email"** | `getByLabel('Email')` |
| 3 | Type password | Field **"Password"** | `getByLabel('Password')` |
| 4 | Click | Button **"Sign in"** | `getByRole('button', { name: 'Sign in' })` |
| 5 | Check | URL is no longer `/login` | — |

### Step group 2 — Open the Defect Triaging workspace
| # | Action | Target | Source line |
|---|--------|--------|-------------|
| 6 | Navigate | `/workspace?agent=defect-triaging&project=proj-rbac-test` | `page.goto(...)` |
| 7 | Check | Text **"Defect Triaging"** is visible | `getByText('Defect Triaging')` |

### Step group 3 — Enter the Defect ID (Neo4j Lookup)
| # | Action | Target | Value filled | Source line |
|---|--------|--------|--------------|-------------|
| 8 | Click | Tab/button **"Neo4j Lookup"** | — | `getByRole('button', { name: 'Neo4j Lookup' })` |
| 9 | Type | The single **"DEFECT ID"** field (placeholder `e.g. "DEF-123" or "BANK-389"`) | `80` | `getByPlaceholder(/DEF-123.*BANK-389/i)` |

> **Note:** In the Neo4j Lookup flow there is **only one input field — the
> Defect ID.** The description, steps to reproduce, and logs are fetched
> automatically by the agent from Neo4j/ADO — they are **not** typed in. (The
> three-field form belongs to the *Manual Input* tab, which this run does not
> use.)

### Step group 4 — Start the run
| # | Action | Target | Source line |
|---|--------|--------|-------------|
| 10 | Click | Button **"Triage Defect"** (or press Enter — "Tip: Enter to submit") | `getByRole('button', { name: 'Triage Defect' })` |
| 11 | Check | Status pill shows **"Running"** | `getByText(/Running/i)` |

### Step group 5 — Human-in-the-loop prompt #1 (Defect Analyzer)
| # | Action | Target | Source line |
|---|--------|--------|-------------|
| 12 | Check | Text **"Do you want to continue with Defect Analyzer? [1] YES [2] NO"** appears | `getByText(/Do you want to continue with Defect Analyzer/i)` |
| 13 | Click | Button **"YES"** | `getByRole('button', { name: 'YES' })` |

> This first prompt fires after the agent fetches the defect, adds logs to ADO,
> and is about to run root-cause analysis. It must be answered before the
> analysis (and the second prompt) happens.

### Step group 6 — Human-in-the-loop prompt #2 (pick the assignee)
| # | Action | Target | Source line |
|---|--------|--------|-------------|
| 14 | Check | A list of candidate assignees appears in the conversation panel (names like *"Arul Amuthan, Ahill Savio (Cognizant)"*, *"Diksha, Kumari (Cognizant)"*, …) | `getByText(/Arul Amuthan, Ahill Savio/i)` |
| 15 | Click | The chosen assignee's name in the list | `getByText('Arul Amuthan, Ahill Savio (Cognizant)').click()` |

> **This is a list pick, not a YES/NO button.** After root-cause analysis the
> status returns to **"Awaiting Input"** and the agent lists possible owners;
> you click one to assign the defect.

### Step group 7 — Verify completion
The run is considered successful only if **all three** are visible:
| # | Expected text on screen | Source line |
|---|--------------------------|-------------|
| 16 | **"Triage Summary"** | `getByText('Triage Summary')` |
| 17 | **"Resolution published to ADO"** | `getByText(/Resolution published to ADO/i)` |
| 18 | **"Flow ended"** OR **"Successfully assigned defect"** | `getByText(/Flow ended\|Successfully assigned defect/i)` |

> The final **Triage Summary** panel shows: **Defect 80**, **Resolution
> published to ADO**, **Assigned to: Arul Amuthan, Ahill Savio (Cognizant)**.
> The conversation ends with *"Successfully assigned defect to Arul Amuthan,
> Ahill Savio (Cognizant) in ADO! Flow ended. Thank you for using the Defect
> Triage!"*

---

## The defect being triaged

In the Neo4j Lookup flow you only supply the **Defect ID (`80`)**. For reference,
the details the agent fetches for it are:

| Field | Value (fetched by the agent) |
|-------|------------------------------|
| Defect ID | `80` |
| Description | `Tried created a new project "alpha" but failed to create` |
| Steps | `Launch the URL https://10.120.101.147/Login. Log in (Username: test@cts.com, Password: Pass@123). Select project "Test1". Navigate to Manage Projects. Click "Add Project", name it "alpha", save. Expected: alpha created. Actual: error "Application offline".` |
| Root cause | Test Data Issue — a project named "alpha" already exists (uniqueness constraint) |

---

## Quick reference — everything the test clicks/types, in order

**Script 1:** `/login` → Email → Password → **Sign in** → (verify left /login + "QE Agentic Hub")

**Script 2:** `/login` → Email → Password → **Sign in** → go to `/workspace?...` → **Neo4j Lookup** → Defect ID **`80`** → **Triage Defect** → wait **"Running"** → prompt #1 **"continue with Defect Analyzer?" → YES** → prompt #2 **pick assignee from list → click the name** → verify **"Triage Summary"** + **"Resolution published to ADO"** + **"Flow ended" / "Successfully assigned defect"**

---

## Changes from the previous version of this doc

1. **Form fields corrected.** Neo4j Lookup has **one** field (Defect ID), not three. Removed the Description and Steps-to-Reproduce typing steps (those belong to the Manual Input tab).
2. **Submit button corrected.** It is labelled exactly **"Triage Defect"** (was a loose `send|submit|triage` match).
3. **Added the missing first HITL prompt** — *"Do you want to continue with Defect Analyzer? [1] YES [2] NO"* — **YES**. This was not in the old doc.
4. **Assignment step corrected.** It is a **list of candidate names you click**, not a single **YES** button.
5. Completion checks (Triage Summary / Resolution published to ADO / Flow ended) were already correct and are unchanged.

---

## How to watch it run live (to verify visually)

```powershell
npm run test:headed     # opens a real Chrome window so you can watch every step
```

Run a single script while verifying:
```powershell
npx playwright test tests/agent/defect-triaging-run.spec.ts --headed
```

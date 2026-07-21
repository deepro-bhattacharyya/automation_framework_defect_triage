# Project Overview — In Simple Words

## What is this project?

This is a set of **automated tests** for the **Cognizant QE Agentic Hub** — an
internal web app at `https://10.120.101.154`. Instead of a person clicking
through the website by hand to check it still works, these tests use a robot
browser (Chrome) to do it automatically.

We test two things:

1. **Logging in** — can a user sign in? What happens with a wrong password or
   empty fields?
2. **The Defect Triaging agent** — an AI feature that takes a bug ("defect"),
   figures out what went wrong, and assigns it to the right person. We check the
   whole journey works end to end.

## Why bother automating it?

- **Speed** — the robot checks everything in a few minutes; a human would take
  much longer.
- **Consistency** — it does the exact same steps every time, so nothing gets
  missed.
- **Confidence** — before anyone ships a change, we can run these tests and know
  the important features still work.

## What does a test actually do?

Think of it like a recorded to-do list the robot follows. For the main test:

1. Open the website and **log in**.
2. Go to **Projects → HCM Project → Defect Triaging**.
3. Pick the **"Neo4j Lookup"** option and type in a bug number (`80`).
4. Click **"Triage Defect"** to start the AI agent.
5. The AI works through the bug, and **pauses 5 times to ask a question**. The
   robot answers each one (like a human would):
   - "Publish these logs?" → **Yes, use all logs**
   - "Continue analysing?" → **Yes**
   - "Publish the fix to ADO?" → **Yes**
   - "Go ahead and assign this bug?" → **Yes**
   - "Pick a person to assign it to" → **clicks a name**
6. Finally, the robot **checks the bug was published and assigned** correctly.

If every step works, the test **passes** (green). If something is broken or
different from expected, it **fails** (red) and tells us exactly where.

## How the project is organised (the simple version)

We keep things tidy by splitting the code into layers, so it's easy to fix when
the website changes:

| Folder | In plain words | Example |
|--------|----------------|---------|
| `pages/` | Knows **where the buttons are** on each screen | "the Email box", "the Sign in button" |
| `reusable-components/` | Knows **how to do a task** by using the buttons | "log in", "triage a defect" |
| `tools/` | Holds **shared info & helpers** | the test login/password, the bug number |
| `tests/` | The **actual checks** we run | "user can sign in", "defect gets assigned" |
| `docs/` | **Explanations** (like this file) | how to set up, how it works |

Why the layers? If a button moves on the website, we only fix it in **one place**
(`pages/`) and every test keeps working. The tests themselves stay short and
easy to read.

## What we test (7 checks in total)

**Login (3 checks)**
- Correct email + password → you get in ✅
- Wrong password → you're kept out with an error ✅
- Empty boxes → it says "required" and won't let you in ✅

**Defect Triaging (4 checks)**
- The full journey works and the bug gets assigned ✅
- Choosing "skip publishing logs" is accepted ✅
- Leaving the bug number empty → the "Triage" button stays greyed out ✅
- Running the same bug again still works ✅

All 7 currently **pass** against the live site.

## Things that are good to know

- **These tests do real things.** When the test runs, it genuinely publishes to
  Azure DevOps (ADO) and assigns a real person — it's not a pretend/practice
  version.
- **The AI runs are slow.** One full defect test can take up to a few minutes
  because the AI is actually thinking and streaming its work.
- **The website is sometimes down.** Occasionally the server shows an error
  ("502") or the AI hiccups. That's a problem on the server's side, not a problem
  with our tests — usually running it again works.

## How do I run it?

The short version (full details in [SETUP.md](SETUP.md)):

```powershell
npm install                 # one-time: get everything needed
npx playwright install chrome

npm test                    # run all the checks
npm run test:headed         # run them while watching the browser
```

## Where to read more

- **Want to run it?** → [SETUP.md](SETUP.md)
- **Want the exact step-by-step of the live flow?** → [TEST-WALKTHROUGH.md](TEST-WALKTHROUGH.md)
- **Want to understand the code structure?** → [ARCHITECTURE.md](ARCHITECTURE.md)
- **Something broke?** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **How it runs automatically on a schedule/pipeline?** → [CI.md](CI.md)

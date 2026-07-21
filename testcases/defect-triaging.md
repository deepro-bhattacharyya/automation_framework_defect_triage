# Test Case Register — Defect Triaging

Maps every spec under `tests/agent/` to its scenario and expected behaviour.
Keep this in sync whenever a defect-triaging spec is added or changed. The full
step-by-step flow (all five HITL prompts) is in
[../docs/TEST-WALKTHROUGH.md](../docs/TEST-WALKTHROUGH.md).

| ID | Spec file | Scenario | Steps | Expected result |
|----|-----------|----------|-------|-----------------|
| DT-01 | `defect-triaging-run.spec.ts` | Full happy path, defect assigned | Log in → Projects → HCM Project → Defect Triaging → Neo4j Lookup → Defect ID `80` → **Triage Defect** → HITL1 **Use all filtered logs** → HITL2 **YES** → HITL3 **YES** → HITL4 **YES** → HITL5 **pick contributor** | "Resolution added to ADO successfully!" + assignment confirmation |
| DT-02 | `defect-triaging-decline-assign.spec.ts` | Skip log publishing at HITL #1 | Submit defect → at first prompt click **Skip log publishing** | The skip is accepted (run continues without publishing logs) |
| DT-03 | `defect-triaging-empty-id.spec.ts` | Blank Defect ID | Open Neo4j Lookup with no ID | **Triage Defect** button is **disabled** (blank-ID validation) |
| DT-04 | `defect-triaging-duplicate.spec.ts` | Re-triage same Defect ID | Run the full happy path for `80` again | Completes gracefully to the same completion state |

## Data source

Defect IDs and contributors come from `tools/test-data.ts`
(`DEFECTS.sample.id`, `CONTRIBUTORS.sunil`, `PROJECTS.rbacTest`). Login is handled
by the `authedPage` fixture in `tools/fixtures.ts`.

## The five HITL prompts (happy path, DT-01)

1. "Select the ones to publish to ADO" → **Use all filtered logs**
2. "Do you want to continue with Defect Analyzer?" → **YES**
3. "Do you want to publish the defect resolution to ADO?" → **YES**
4. "Do you want to proceed with assigning the analyzed defect?" → **YES**
5. "Please select and assign new contributor" → **click a contributor** (name contains "Sunil")

## Notes / caveats

- **Status:** DT-01…DT-04 all pass against the live hub.
- DT-02's assertion is intentionally minimal — it confirms the skip is accepted;
  it does not yet assert the agent's subsequent behaviour after skipping.
- DT-03: the live site disables the submit button for a blank ID rather than
  showing inline error text — the test asserts `toBeDisabled()`.
- These tests trigger **real** agent runs and publish to ADO / assign a real
  contributor. Run `tools/reset-run-state.ts` first once its endpoint is wired up.
- The hub is occasionally down (`502`) or the agent errors mid-run
  (transient backend) — see [../docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md).

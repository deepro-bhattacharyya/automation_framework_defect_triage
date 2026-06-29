# Test Case Register — Defect Triaging

Maps every spec under `tests/agent/` to its scenario and expected behaviour.
Keep this in sync whenever a defect-triaging spec is added or changed. The full
step-by-step flow the live site must match is in `docs/TEST-WALKTHROUGH.md`.

| ID | Spec file | Scenario | Steps | Expected result |
|----|-----------|----------|-------|-----------------|
| DT-01 | `defect-triaging-run.spec.ts` | Happy path, owner assigned | Log in → open workspace → Neo4j Lookup → Defect ID `80` → **Triage Defect** → prompt #1 **YES** → prompt #2 pick assignee | Triage Summary shown; "Resolution published to ADO"; owner assigned |
| DT-02 | `defect-triaging-decline-assign.spec.ts` | Decline at HITL prompt | Submit defect → answer analyzer prompt **NO** | Run ends; NO owner assigned ("Successfully assigned defect" absent) |
| DT-03 | `defect-triaging-empty-id.spec.ts` | Blank Defect ID | Open Neo4j Lookup → click **Triage Defect** with no ID | Validation error shown; run does not start |
| DT-04 | `defect-triaging-duplicate.spec.ts` | Re-submit same Defect ID | Triage Defect ID `80` again, full happy path | Completes gracefully to a Triage Summary |

## Data source
Defect IDs and assignees come from `tools/test-data.ts` (`DEFECTS.sample.id`,
`ASSIGNEES.arul`, `PROJECTS.rbacTest`). Login is handled by the `authedPage`
fixture in `tools/fixtures.ts`.

## Notes / caveats
- DT-02, DT-03 use **best-effort** locators (NO button, validation error,
  "no assignment" check) — none of these paths were in the walkthrough
  recording. Verify against the live site.
- DT-04 assumes a re-run follows the same happy-path flow. If the live system
  shows an "already triaged" notice instead, give DT-04 its own assertion.
- These tests trigger **real** agent runs against the internal hub and publish
  to ADO. Run `tools/reset-run-state.ts` first once that endpoint is wired up.

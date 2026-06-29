import { test } from '../../tools/fixtures';
import { submitDefectWithoutId } from '../../reusable-components/AgentFlows';

/**
 * SCRIPT 6 — Defect Triaging (empty Defect ID)
 * ------------------------------------------------------------------
 * Opens the Neo4j Lookup flow and clicks "Triage Defect" with no Defect ID,
 * confirming a validation error is shown and the run does not start.
 * See docs/PLAN.md → Phase 3.
 *
 * NOTE: the validation-error locator (DefectTriagingPage.validationError) is
 * best-effort — this path was not in the walkthrough recording. Verify it live.
 */

test('submitting with a blank Defect ID shows a validation error', async ({ authedPage }) => {
  await submitDefectWithoutId(authedPage);
});

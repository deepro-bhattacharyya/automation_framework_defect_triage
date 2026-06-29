import { test } from '../../tools/fixtures';
import { triageDefectEndToEnd } from '../../reusable-components/AgentFlows';
import { DEFECTS, ASSIGNEES } from '../../tools/test-data';

/**
 * SCRIPT 7 — Defect Triaging (re-submit the same Defect ID)
 * ------------------------------------------------------------------
 * Triages the same Defect ID that was already triaged, confirming the system
 * handles a duplicate gracefully and still reaches a Triage Summary.
 * See docs/PLAN.md → Phase 3.
 *
 * NOTE: this assumes a re-run of an already-triaged defect follows the same
 * happy-path flow. If the live system instead shows a "already triaged" notice,
 * this spec will need its own assertion — verify live and adjust.
 */

test('re-submitting an already-triaged defect completes gracefully', async ({ authedPage }) => {
  await triageDefectEndToEnd(authedPage, DEFECTS.sample.id, ASSIGNEES.arul);
});

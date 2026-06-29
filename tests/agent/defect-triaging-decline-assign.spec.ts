import { test } from '../../tools/fixtures';
import { submitDefect, declineAnalyzer, assertNoAssignment } from '../../reusable-components/AgentFlows';
import { DEFECTS } from '../../tools/test-data';

/**
 * SCRIPT 5 — Defect Triaging (decline at the human-in-the-loop prompt)
 * ------------------------------------------------------------------
 * Submits a defect, then answers the "continue with Defect Analyzer?" prompt
 * with NO, and confirms the run ends WITHOUT an owner being assigned.
 * See docs/PLAN.md → Phase 3.
 *
 * NOTE: the NO button and the "no assignment" assertion are best-effort — the
 * decline path was not in the walkthrough recording. Verify them live.
 */

test('declining the analyzer prompt ends the run without assigning an owner', async ({
  authedPage,
}) => {
  await submitDefect(authedPage, DEFECTS.sample.id);
  await declineAnalyzer(authedPage);
  await assertNoAssignment(authedPage);
});

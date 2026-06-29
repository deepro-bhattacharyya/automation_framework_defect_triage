import { test } from '@playwright/test';
import { loginAs } from '../../reusable-components/AuthFlows';
import { submitDefect, declineAnalyzer, assertNoAssignment } from '../../reusable-components/AgentFlows';

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

const HUB_EMAIL = process.env.HUB_EMAIL ?? 'deepro.bhattacharyya@cognizant.com';
const HUB_PASSWORD = process.env.HUB_PASSWORD ?? '2513927';
const DEFECT_ID = '80';

test('declining the analyzer prompt ends the run without assigning an owner', async ({
  page,
}) => {
  await loginAs(page, HUB_EMAIL, HUB_PASSWORD);
  await submitDefect(page, DEFECT_ID);
  await declineAnalyzer(page);
  await assertNoAssignment(page);
});

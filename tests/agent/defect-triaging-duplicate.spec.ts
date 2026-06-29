import { test } from '@playwright/test';
import { loginAs } from '../../reusable-components/AuthFlows';
import { triageDefectEndToEnd } from '../../reusable-components/AgentFlows';

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

const HUB_EMAIL = process.env.HUB_EMAIL ?? 'deepro.bhattacharyya@cognizant.com';
const HUB_PASSWORD = process.env.HUB_PASSWORD ?? '2513927';
const DEFECT_ID = '80';
const ASSIGNEE = 'Arul Amuthan, Ahill Savio (Cognizant)';

test('re-submitting an already-triaged defect completes gracefully', async ({ page }) => {
  await loginAs(page, HUB_EMAIL, HUB_PASSWORD);
  await triageDefectEndToEnd(page, DEFECT_ID, ASSIGNEE);
});

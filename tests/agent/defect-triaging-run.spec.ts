import { test } from '@playwright/test';
import { loginAs } from '../../reusable-components/AuthFlows';
import { triageDefectEndToEnd } from '../../reusable-components/AgentFlows';

/**
 * SCRIPT 2 — Defect Triaging agent (end-to-end happy path)
 * ------------------------------------------------------------------
 * Logs in, opens the Defect Triaging workspace, and triages a defect via the
 * Neo4j Lookup flow: you enter ONLY a Defect ID and the agent fetches the
 * description, steps, and logs itself. The run pauses for TWO human-in-the-loop
 * prompts — first to continue with the Defect Analyzer (YES), then to pick the
 * assignee from a list — and verifies the run finishes with a Triage Summary
 * (resolution published to ADO + an owner assigned).
 *
 * Phase 1: locators live in pages/. Phase 2: the steps live in
 * reusable-components/AuthFlows.ts + AgentFlows.ts, so this whole run is two
 * declarative calls.
 */

const HUB_EMAIL = process.env.HUB_EMAIL ?? 'deepro.bhattacharyya@cognizant.com';
const HUB_PASSWORD = process.env.HUB_PASSWORD ?? '2513927';

// In the Neo4j Lookup flow we only supply the Defect ID; the agent fetches the
// rest. The assignee is picked from the list the agent surfaces.
const DEFECT_ID = '80';
const ASSIGNEE = 'Arul Amuthan, Ahill Savio (Cognizant)';

test('defect triaging agent runs a defect end-to-end and assigns an owner', async ({
  page,
}) => {
  await loginAs(page, HUB_EMAIL, HUB_PASSWORD);
  await triageDefectEndToEnd(page, DEFECT_ID, ASSIGNEE);
});

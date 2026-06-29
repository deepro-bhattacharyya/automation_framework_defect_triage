import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DefectTriagingPage } from '../../pages/DefectTriagingPage';

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
 * Refactored in Phase 1: all locators now live in pages/LoginPage.ts and
 * pages/DefectTriagingPage.ts. The STEPS move into
 * reusable-components/AgentFlows.ts in Phase 2.
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
  const loginPage = new LoginPage(page);
  const defectPage = new DefectTriagingPage(page);

  // ---- 1. Log in ----
  await loginPage.login(HUB_EMAIL, HUB_PASSWORD);
  await loginPage.assertLoggedIn();

  // ---- 2. Open the Defect Triaging workspace ----
  await defectPage.openWorkspace();

  // ---- 3. Enter the Defect ID (Neo4j Lookup — single field) ----
  await defectPage.clickNeo4jLookup();
  await defectPage.enterDefectId(DEFECT_ID);

  // ---- 4. Start the run ----
  await defectPage.startRun();

  // ---- 5. HITL prompt #1 — continue with the Defect Analyzer ----
  await defectPage.continueWithAnalyzer();

  // ---- 6. HITL prompt #2 — pick the assignee from the list ----
  await defectPage.selectAssignee(ASSIGNEE);

  // ---- 7. Verify the run finished ----
  await defectPage.assertTriageSummary();
});

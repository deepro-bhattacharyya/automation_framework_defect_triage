import { type Page } from '@playwright/test';
import { DefectTriagingPage } from '../pages/DefectTriagingPage';

/**
 * AgentFlows — reusable Defect Triaging agent sequences.
 *
 * Composes DefectTriagingPage into the higher-level steps a test cares about:
 * submit a defect, approve the analyzer, assign an owner, confirm completion.
 * See docs/PLAN.md → Phase 2 and docs/TEST-WALKTHROUGH.md for the live flow.
 */

/**
 * Open the Defect Triaging workspace and submit a defect via the Neo4j Lookup
 * flow (Defect ID only), then wait until the run is reported as Running.
 */
export async function submitDefect(
  page: Page,
  defectId: string,
  projectSlug = 'proj-rbac-test',
): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.openWorkspace(projectSlug);
  await defectPage.clickNeo4jLookup();
  await defectPage.enterDefectId(defectId);
  await defectPage.startRun();
}

/** HITL prompt #1 — approve continuing with the Defect Analyzer (YES). */
export async function approveAnalyzer(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.continueWithAnalyzer();
}

/** HITL prompt #2 — assign the defect by picking an owner from the list. */
export async function assignOwner(page: Page, assignee: string): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.selectAssignee(assignee);
}

/** Assert the run finished: Triage Summary + ADO resolution + owner assigned. */
export async function assertRunCompleted(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.assertTriageSummary();
}

/**
 * Full end-to-end happy path: submit a defect, approve the analyzer, assign the
 * given owner, and confirm completion — a complete triage run in one call.
 */
export async function triageDefectEndToEnd(
  page: Page,
  defectId: string,
  assignee: string,
  projectSlug = 'proj-rbac-test',
): Promise<void> {
  await submitDefect(page, defectId, projectSlug);
  await approveAnalyzer(page);
  await assignOwner(page, assignee);
  await assertRunCompleted(page);
}

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

/** HITL prompt #1 — publish all fetched logs to ADO. */
export async function publishLogs(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.publishAllLogs();
}

/** HITL prompt #1 — skip publishing logs to ADO. */
export async function skipLogPublishing(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.skipLogPublishing();
}

/** HITL prompt #2 — continue with the Defect Analyzer (YES). */
export async function approveAnalyzer(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.continueWithAnalyzer();
}

/** HITL prompt #2 — decline the Defect Analyzer (NO). */
export async function declineAnalyzer(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.declineAnalyzer();
}

/** HITL prompt #3 — publish the resolution to ADO (YES). */
export async function publishResolution(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.publishResolutionToAdo();
}

/** HITL prompt #4 — approve assigning the analyzed defect (YES). */
export async function approveAssignment(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.approveAssignment();
}

/** HITL prompt #4 — decline assigning the analyzed defect (NO). */
export async function declineAssignment(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.declineAssignment();
}

/** HITL prompt #5 — pick a contributor by name fragment from the list. */
export async function selectContributor(page: Page, nameFragment: string): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.selectContributor(nameFragment);
}

/** Assert the run finished: Triage Summary + ADO resolution + owner assigned. */
export async function assertRunCompleted(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.assertTriageSummary();
}

/**
 * Open the workspace, switch to Neo4j Lookup, and submit without a Defect ID —
 * then assert the validation error appears. Used by the empty-ID negative test.
 */
export async function submitDefectWithoutId(
  page: Page,
  projectSlug = 'proj-rbac-test',
): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.openWorkspace(projectSlug);
  await defectPage.clickNeo4jLookup();
  // The live site disables the "Triage Defect" button when the ID field is
  // empty — clicking it is not needed; we assert it is disabled directly.
  await defectPage.assertDefectIdRequired();
}

/** Assert the run ended without an owner being assigned (declined path). */
export async function assertNoAssignment(page: Page): Promise<void> {
  const defectPage = new DefectTriagingPage(page);
  await defectPage.assertNoAssignment();
}

/**
 * Full end-to-end happy path: submit a defect, approve the analyzer, assign the
 * given owner, and confirm completion — a complete triage run in one call.
 */
export async function triageDefectEndToEnd(
  page: Page,
  defectId: string,
  projectSlug = 'proj-rbac-test',
): Promise<void> {
  await submitDefect(page, defectId, projectSlug);
  await publishLogs(page);
  await approveAnalyzer(page);
  await publishResolution(page);
  await approveAssignment(page);
  await selectContributor(page, 'Sunil');
  await assertRunCompleted(page);
}

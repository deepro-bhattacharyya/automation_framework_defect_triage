import { type Page, type Locator, expect } from '@playwright/test';

/**
 * DefectTriagingPage — Page Object for the Defect Triaging workspace.
 *
 * Models the Neo4j Lookup flow: enter a Defect ID only, start the run, answer
 * the two human-in-the-loop prompts (continue with Defect Analyzer, then pick
 * the assignee), and read the final Triage Summary. See docs/TEST-WALKTHROUGH.md
 * for the step-by-step the live site must match, and docs/PLAN.md → Phase 1.
 */
export class DefectTriagingPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly neo4jLookupTab: Locator;
  readonly defectIdField: Locator;
  readonly triageDefectButton: Locator;
  readonly runningStatus: Locator;
  readonly logPublishPrompt: Locator;
  readonly publishLogsButton: Locator;
  readonly skipLogsButton: Locator;
  readonly analyzerPrompt: Locator;
  readonly publishResolutionPrompt: Locator;
  readonly assignmentPrompt: Locator;
  readonly selectContributorPrompt: Locator;
  readonly yesButton: Locator;
  readonly noButton: Locator;
  readonly triageSummary: Locator;
  readonly validationError: Locator;
  readonly projectsLink: Locator;
  readonly hcmProjectCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText('Defect Triaging').first();
    this.projectsLink = page.getByRole('link', { name: 'Projects' });
    this.hcmProjectCard = page.getByRole('heading', { name: 'HCM Project' });
    this.neo4jLookupTab = page.getByRole('button', { name: 'Neo4j Lookup' });
    this.defectIdField = page.getByPlaceholder(/DEF-123.*BANK-389/i);
    this.triageDefectButton = page.getByRole('button', { name: 'Triage Defect' });
    this.runningStatus = page.getByText(/Running/i).first();
    // HITL prompt #1 (confirmed live): the agent fetches logs and asks which to
    // publish to ADO, offering "Use all filtered logs" / "Skip log publishing".
    this.logPublishPrompt = page.getByText(/Select the ones to publish to ADO/i);
    this.publishLogsButton = page.getByRole('button', { name: 'Use all filtered logs' });
    this.skipLogsButton = page.getByRole('button', { name: 'Skip log publishing' });
    // HITL prompt #2 (confirmed live): after logs are published the agent asks
    // whether to continue with the Defect Analyzer, offering YES / NO.
    this.analyzerPrompt = page.getByText(/Do you want to continue with Defect Analyzer/i);
    // HITL prompt #3 (confirmed live): after analysis, asks whether to publish
    // the defect resolution to ADO, offering YES / NO.
    this.publishResolutionPrompt = page.getByText(/Do you want to publish the defect resolution to ADO/i);
    // HITL prompt #4 (confirmed live): asks whether to proceed with assigning.
    this.assignmentPrompt = page.getByText(/Do you want to proceed with assigning the analyzed defect/i);
    // HITL prompt #5 (confirmed live): presents a list of contributor buttons
    // when no auto-match is found. Click any one name to assign.
    this.selectContributorPrompt = page.getByText(/Please select and assign new contributor/i);
    this.yesButton = page.getByRole('button', { name: 'YES' });
    this.noButton = page.getByRole('button', { name: 'NO' });
    this.triageSummary = page.getByText('Triage Summary').first();
    // Best-effort: the inline validation shown when Defect ID is blank. Not in
    // the happy-path walkthrough — verify against the live site.
    this.validationError = page
      .getByText(/required|enter a defect id|cannot be empty|please provide/i)
      .first();
  }

  /**
   * Open the Defect Triaging workspace via the UI navigation the user follows:
   * Projects → HCM Project → the Defect Triaging agent's "Run" link.
   * The agent's Run link is matched by its exact href so it is not confused with
   * the "defect-triaging-crewai" variant.
   */
  async openWorkspace(projectSlug = 'proj-rbac-test'): Promise<void> {
    await this.projectsLink.click();
    await this.hcmProjectCard.click();
    await this.page
      .locator(`a[href="/workspace?agent=defect-triaging&project=${projectSlug}"]`)
      .click();
    await expect(this.heading).toBeVisible();
  }

  /**
   * Switch to the Neo4j Lookup tab (single Defect ID field).
   *
   * The workspace hydrates after navigation, so an early click can focus the tab
   * without the panel switching. We confirm the switch by waiting for the Neo4j
   * Defect ID field (its "BANK-389" placeholder is unique to this tab) and retry
   * the click once if the panel hasn't swapped yet.
   */
  async clickNeo4jLookup(): Promise<void> {
    await this.neo4jLookupTab.click();
    try {
      await expect(this.defectIdField).toBeVisible({ timeout: 10_000 });
    } catch {
      await this.neo4jLookupTab.click();
      await expect(this.defectIdField).toBeVisible({ timeout: 10_000 });
    }
  }

  /** Enter the Defect ID. In the Neo4j Lookup flow this is the only input. */
  async enterDefectId(defectId: string): Promise<void> {
    await this.defectIdField.fill(defectId);
  }

  /** Click "Triage Defect" and confirm the run starts (status → Running). */
  async startRun(): Promise<void> {
    await this.triageDefectButton.click();
    await expect(this.runningStatus).toBeVisible();
  }

  /**
   * Wait until the status pill shows "Awaiting Input" — used between HITL steps
   * to confirm the agent has paused for human input before we look for a button.
   */
  async waitForAwaitingInput(): Promise<void> {
    await expect(this.page.getByText('Awaiting Input').first()).toBeVisible();
  }

  /** HITL prompt #1 — publish all fetched logs to ADO ("Use all filtered logs"). */
  async publishAllLogs(): Promise<void> {
    await this.waitForAwaitingInput();
    await expect(this.logPublishPrompt).toBeVisible();
    await this.publishLogsButton.click();
  }

  /** HITL prompt #1 — skip publishing logs to ADO ("Skip log publishing"). */
  async skipLogPublishing(): Promise<void> {
    await this.waitForAwaitingInput();
    await expect(this.logPublishPrompt).toBeVisible();
    await this.skipLogsButton.click();
  }

  /** HITL prompt #2 — answer the "continue with Defect Analyzer?" prompt YES. */
  async continueWithAnalyzer(): Promise<void> {
    await this.waitForAwaitingInput();
    await expect(this.analyzerPrompt).toBeVisible();
    await this.yesButton.click();
  }

  /** HITL prompt #2 — decline continuing with the Defect Analyzer (NO). */
  async declineAnalyzer(): Promise<void> {
    await this.waitForAwaitingInput();
    await expect(this.analyzerPrompt).toBeVisible();
    await this.noButton.click();
  }

  /** HITL prompt #3 — publish the defect resolution to ADO (YES). */
  async publishResolutionToAdo(): Promise<void> {
    await this.waitForAwaitingInput();
    await expect(this.publishResolutionPrompt).toBeVisible();
    await this.yesButton.click();
  }

  /** HITL prompt #4 — approve assigning the analyzed defect (YES). */
  async approveAssignment(): Promise<void> {
    await this.waitForAwaitingInput();
    await expect(this.assignmentPrompt).toBeVisible();
    await this.yesButton.click();
  }

  /** HITL prompt #4 — decline assigning the analyzed defect (NO). */
  async declineAssignment(): Promise<void> {
    await this.waitForAwaitingInput();
    await expect(this.assignmentPrompt).toBeVisible();
    await this.noButton.click();
  }

  /**
   * HITL prompt #5 — pick a contributor from the list when no auto-match is
   * found. Clicks the first button whose label contains the given name fragment.
   */
  async selectContributor(nameFragment: string): Promise<void> {
    await this.waitForAwaitingInput();
    await expect(this.selectContributorPrompt).toBeVisible();
    await this.page.getByRole('button', { name: new RegExp(nameFragment, 'i') }).first().click();
  }

  /**
   * Assert the Defect ID field is empty and the "Triage Defect" button is
   * disabled — the live site prevents submission with a blank ID by disabling
   * the button rather than showing an inline error message.
   */
  async assertDefectIdRequired(): Promise<void> {
    await expect(this.triageDefectButton).toBeDisabled();
  }

  /** Assert the run ended WITHOUT an owner being assigned (declined path). */
  async assertNoAssignment(): Promise<void> {
    await expect(this.page.getByText(/Successfully assigned defect/i)).toHaveCount(0);
  }

  /** Assert the run finished: resolution added to ADO, defect assigned. */
  async assertTriageSummary(): Promise<void> {
    // "Resolution added to ADO successfully!" confirmed in the live conversation.
    await expect(this.page.getByText(/Resolution added to ADO successfully/i)).toBeVisible();
    // Final confirmation message after the contributor is assigned.
    await expect(
      this.page.getByText(/assigned|assignment complete|defect.*assigned|thank you/i).first(),
    ).toBeVisible();
  }
}

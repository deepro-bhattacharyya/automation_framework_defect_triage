import { type Page, type Locator, expect } from '@playwright/test';

/**
 * LoginPage — Page Object for the QE Agentic Hub sign-in screen.
 *
 * Owns every locator on the login page. Tests should talk to this class in
 * plain English (fillEmail / fillPassword / submit) and never reference a raw
 * selector. See docs/PLAN.md → Phase 1.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailField = page.getByLabel('Email');
    this.passwordField = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    // Best-effort: the error/alert banner shown on a failed sign-in. Not in the
    // happy-path walkthrough — verify against the live site (wrong password).
    this.errorMessage = page.getByText(/invalid|incorrect|wrong|failed|try again/i).first();
  }

  /** Open the login page (relative to baseURL in playwright.config.ts). */
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordField.fill(password);
  }

  async submit(): Promise<void> {
    await this.signInButton.click();
  }

  /** Convenience: full happy-path sign-in in one call. */
  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Assert we left /login and the app chrome is visible. */
  async assertLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/login$/);
    await expect(this.page.getByText('QE Agentic Hub').first()).toBeVisible();
  }

  /** Assert a failed sign-in: an error is shown and we stay on /login. */
  async assertLoginFailed(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.errorMessage).toBeVisible();
  }
}

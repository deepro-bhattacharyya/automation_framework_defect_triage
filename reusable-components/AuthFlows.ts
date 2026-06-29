import { type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * AuthFlows — reusable authentication sequences.
 *
 * Pages know WHAT is on a screen; flows know HOW to accomplish a task by
 * composing page objects. These are the multi-step sequences that repeat across
 * many tests. See docs/PLAN.md → Phase 2.
 */

/** Sign in with the given credentials and confirm we landed inside the app. */
export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);
  await loginPage.assertLoggedIn();
}

/**
 * Sign out of the QE Agentic Hub.
 *
 * NOTE: the logout control was not exercised in the walkthrough recording, so
 * this locator is a best-effort guess. Verify it against the live site (open the
 * account menu, click "Sign out") before relying on it in a test.
 */
export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: /account|profile|menu/i }).first().click();
  await page.getByRole('menuitem', { name: /sign out|log ?out/i }).click();
}

import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

/**
 * SCRIPT 3 — Login (wrong password)
 * ------------------------------------------------------------------
 * Signs in with a valid email but the WRONG password and confirms the app shows
 * an error and keeps us on /login. See docs/PLAN.md → Phase 3.
 *
 * NOTE: the error-message locator is best-effort (LoginPage.errorMessage) since
 * the failure path was not in the walkthrough recording. Verify it live.
 */

const HUB_EMAIL = process.env.HUB_EMAIL ?? 'deepro.bhattacharyya@cognizant.com';
const WRONG_PASSWORD = 'definitely-not-the-right-password';

test('sign-in with a wrong password shows an error and stays on /login', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.login(HUB_EMAIL, WRONG_PASSWORD);
  await loginPage.assertLoginFailed();
});

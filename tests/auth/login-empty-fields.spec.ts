import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

/**
 * SCRIPT 4 — Login (empty fields)
 * ------------------------------------------------------------------
 * Submits the sign-in form with both fields blank and confirms we stay on
 * /login with an error/validation shown. See docs/PLAN.md → Phase 3.
 *
 * NOTE: relies on the same best-effort error locator as login-invalid; the
 * blank-submit path was not in the walkthrough recording. Verify it live.
 */

test('sign-in with empty fields does not log in', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.submit();
  await loginPage.assertLoginFailed();
});

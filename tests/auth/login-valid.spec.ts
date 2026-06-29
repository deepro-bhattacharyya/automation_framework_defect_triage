import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

/**
 * SCRIPT 1 — Login (happy path)
 * ------------------------------------------------------------------
 * Signs in to the Cognizant QE Agentic Hub with valid credentials and
 * confirms we land inside the app (no longer on /login).
 *
 * Refactored in Phase 1: all locators now live in pages/LoginPage.ts. The
 * login STEPS move into reusable-components/AuthFlows.ts in Phase 2.
 *
 * Credentials come from environment variables so nothing secret is committed.
 * Set them before running (PowerShell):
 *     $env:HUB_EMAIL="you@cognizant.com"; $env:HUB_PASSWORD="..."
 * They fall back to the demo values from the walkthrough recording.
 */

const HUB_EMAIL = process.env.HUB_EMAIL ?? 'deepro.bhattacharyya@cognizant.com';
const HUB_PASSWORD = process.env.HUB_PASSWORD ?? '2513927';

test('user can sign in to the QE Agentic Hub with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.login(HUB_EMAIL, HUB_PASSWORD);
  await loginPage.assertLoggedIn();
});

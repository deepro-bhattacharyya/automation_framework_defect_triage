import { test } from '@playwright/test';
import { loginAs } from '../../reusable-components/AuthFlows';
import { USERS } from '../../tools/test-data';

/**
 * SCRIPT 1 — Login (happy path)
 * ------------------------------------------------------------------
 * Signs in to the Cognizant QE Agentic Hub with valid credentials and
 * confirms we land inside the app (no longer on /login).
 *
 * Phase 1: locators in pages/. Phase 2: steps in reusable-components/.
 * Phase 4: credentials come from tools/test-data.ts (env-overridable).
 */

test('user can sign in to the QE Agentic Hub with valid credentials', async ({ page }) => {
  await loginAs(page, USERS.valid.email, USERS.valid.password);
});

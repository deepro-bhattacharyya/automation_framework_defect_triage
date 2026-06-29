import { test } from '@playwright/test';
import { loginAs } from '../../reusable-components/AuthFlows';

/**
 * SCRIPT 1 — Login (happy path)
 * ------------------------------------------------------------------
 * Signs in to the Cognizant QE Agentic Hub with valid credentials and
 * confirms we land inside the app (no longer on /login).
 *
 * Phase 1: locators live in pages/LoginPage.ts.
 * Phase 2: the login steps now live in reusable-components/AuthFlows.ts, so this
 * spec is a single declarative call.
 *
 * Credentials come from environment variables so nothing secret is committed.
 * Set them before running (PowerShell):
 *     $env:HUB_EMAIL="you@cognizant.com"; $env:HUB_PASSWORD="..."
 * They fall back to the demo values from the walkthrough recording.
 */

const HUB_EMAIL = process.env.HUB_EMAIL ?? 'deepro.bhattacharyya@cognizant.com';
const HUB_PASSWORD = process.env.HUB_PASSWORD ?? '2513927';

test('user can sign in to the QE Agentic Hub with valid credentials', async ({ page }) => {
  await loginAs(page, HUB_EMAIL, HUB_PASSWORD);
});

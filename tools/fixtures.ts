import { test as base, type Page } from '@playwright/test';
import { loginAs } from '../reusable-components/AuthFlows';
import { USERS } from './test-data';

/**
 * fixtures.ts — custom Playwright fixtures.
 *
 * Provides `authedPage`: a Page that is already signed in with the valid demo
 * user, so tests that start from inside the app don't repeat the login steps.
 * See docs/PLAN.md → Phase 4.
 *
 * Usage:
 *     import { test, expect } from '../../tools/fixtures';
 *     test('...', async ({ authedPage }) => { ... });
 *
 * Login-focused specs that need to drive the sign-in form themselves should
 * keep using the stock `page` fixture from '@playwright/test'.
 */
type Fixtures = {
  authedPage: Page;
};

export const test = base.extend<Fixtures>({
  authedPage: async ({ page }, use) => {
    await loginAs(page, USERS.valid.email, USERS.valid.password);
    await use(page);
  },
});

export { expect } from '@playwright/test';

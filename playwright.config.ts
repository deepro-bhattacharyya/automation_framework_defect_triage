import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the QE Agentic Hub - Defect Triaging suite.
 *
 * baseURL is the internal marketplace host. The site is served over a
 * self-signed / "Not secure" certificate, so `ignoreHTTPSErrors` is on —
 * otherwise every navigation would fail with a certificate error.
 *
 * The agent run is long (it streams many steps over a websocket and pauses for
 * human input), so the per-test and expect timeouts are generous.
 */
export default defineConfig({
  testDir: './tests',
  // NOTE on parallelism: the 4 agent specs all triage the SAME defect (id 80)
  // against the shared live hub and publish to ADO, so they are NOT safe to run
  // concurrently. We keep cross-file parallelism conservative. On CI we allow a
  // small worker pool (the auth specs are independent); if the agent specs prove
  // flaky in parallel, drop CI back to `workers: 1`.
  fullyParallel: false,
  workers: process.env.CI ? '50%' : 1, // ~half the cores on CI (plan: cpus / 2)
  retries: process.env.CI ? 1 : 0,     // one retry on CI to absorb a flaky run
  timeout: 180_000,            // 3 min — agent runs are long
  expect: { timeout: 60_000 }, // a single wait (e.g. for a run to finish) can be slow
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://10.120.101.154',
    ignoreHTTPSErrors: true,   // internal host uses a self-signed cert
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});

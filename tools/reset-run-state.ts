/**
 * reset-run-state.ts — clear previous agent run history so tests start clean.
 *
 * Run as a standalone script BEFORE a full suite execution:
 *     npx tsx tools/reset-run-state.ts
 *     # or compile + node, depending on your runner
 *
 * STATUS: scaffold. The QE Agentic Hub's reset/clear-history API endpoint was
 * not captured in the walkthrough, so the actual request is left as a clearly
 * marked TODO. Fill in HUB_BASE_URL + the endpoint once known; until then this
 * script no-ops with a warning instead of failing a pipeline.
 *
 * It deliberately uses only Node built-ins (no Playwright) so it can run as a
 * lightweight pre-step.
 */

const HUB_BASE_URL = process.env.HUB_BASE_URL ?? 'https://10.120.101.154';

async function resetRunState(): Promise<void> {
  // TODO: replace with the real reset endpoint once known, e.g.:
  //   await fetch(`${HUB_BASE_URL}/api/defect-triaging/runs`, {
  //     method: 'DELETE',
  //     headers: { Authorization: `Bearer ${process.env.HUB_TOKEN}` },
  //   });
  const endpoint = process.env.HUB_RESET_ENDPOINT;

  if (!endpoint) {
    console.warn(
      '[reset-run-state] No HUB_RESET_ENDPOINT configured — skipping reset. ' +
        'Set HUB_RESET_ENDPOINT (and HUB_TOKEN if needed) once the API is known.',
    );
    return;
  }

  // Node 18+ has global fetch. The internal host uses a self-signed cert; in CI
  // set NODE_TLS_REJECT_UNAUTHORIZED=0 for this pre-step if necessary.
  const res = await fetch(`${HUB_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: process.env.HUB_TOKEN
      ? { Authorization: `Bearer ${process.env.HUB_TOKEN}` }
      : undefined,
  });

  if (!res.ok) {
    throw new Error(`[reset-run-state] reset failed: ${res.status} ${res.statusText}`);
  }
  console.log('[reset-run-state] run history cleared.');
}

resetRunState().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

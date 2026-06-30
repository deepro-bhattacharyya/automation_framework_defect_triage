import { test } from '../../tools/fixtures';
import { submitDefect, skipLogPublishing } from '../../reusable-components/AgentFlows';
import { DEFECTS } from '../../tools/test-data';

/**
 * SCRIPT 5 — Defect Triaging (skip log publishing at the HITL prompt)
 * ------------------------------------------------------------------
 * Submits a defect, then at the first human-in-the-loop prompt chooses
 * "Skip log publishing" instead of publishing the fetched logs to ADO.
 * See docs/PLAN.md → Phase 3.
 *
 * NOTE: what the agent does AFTER skipping (whether it still assigns an owner)
 * has not yet been validated end-to-end. The assertion below is intentionally
 * minimal — extend it once the skip path is observed live.
 */

test('skipping log publishing at the HITL prompt is accepted', async ({ authedPage }) => {
  await submitDefect(authedPage, DEFECTS.sample.id);
  await skipLogPublishing(authedPage);
});

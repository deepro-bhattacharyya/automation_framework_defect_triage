import { test } from '../../tools/fixtures';
import { triageDefectEndToEnd } from '../../reusable-components/AgentFlows';
import { DEFECTS } from '../../tools/test-data';

/**
 * SCRIPT 2 — Defect Triaging agent (end-to-end happy path)
 * ------------------------------------------------------------------
 * Triages a defect via the Neo4j Lookup flow: enter ONLY a Defect ID and the
 * agent fetches the description, steps, and logs itself. The run pauses for TWO
 * human-in-the-loop prompts — continue with the Defect Analyzer (YES), then
 * pick the assignee — and finishes with a Triage Summary (resolution published
 * to ADO + an owner assigned).
 *
 * Phase 4: login is handled by the `authedPage` fixture, and the defect/assignee
 * come from tools/test-data.ts — so the test body is a single declarative call.
 */

test('defect triaging agent runs a defect end-to-end and assigns an owner', async ({
  authedPage,
}) => {
  await triageDefectEndToEnd(authedPage, DEFECTS.sample.id);
});

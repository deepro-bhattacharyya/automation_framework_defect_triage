/**
 * test-data.ts — single source of truth for all test data.
 *
 * Every spec imports its users, defects, project slugs, and expected text from
 * here so there are no magic strings scattered across the suite. Credentials
 * fall back to the walkthrough demo values but can be overridden with the
 * HUB_EMAIL / HUB_PASSWORD environment variables. See docs/PLAN.md → Phase 4.
 */

/** Accounts used across the suite. */
export const USERS = {
  /** Valid demo account (overridable via env vars). */
  valid: {
    email: process.env.HUB_EMAIL ?? 'deepro.bhattacharyya@cognizant.com',
    password: process.env.HUB_PASSWORD ?? '2513927',
  },
  /** Valid email but deliberately wrong password — for the failed-login test. */
  wrongPassword: {
    email: process.env.HUB_EMAIL ?? 'deepro.bhattacharyya@cognizant.com',
    password: 'definitely-not-the-right-password',
  },
} as const;

/** Project slugs used in the /workspace URL. */
export const PROJECTS = {
  rbacTest: 'proj-rbac-test',
} as const;

/** The sample defect from the recorded walkthrough (Neo4j Lookup flow). */
export const DEFECTS = {
  sample: {
    id: '80',
    // Details below are fetched by the agent, not typed in — kept for reference.
    description: 'Tried created a new project "alpha" but failed to create',
    rootCause: 'Test Data Issue — a project named "alpha" already exists',
  },
} as const;

/** Candidate assignees the agent surfaces at the assignment prompt. */
export const ASSIGNEES = {
  arul: 'Arul Amuthan, Ahill Savio (Cognizant)',
} as const;

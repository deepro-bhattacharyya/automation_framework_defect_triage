# Test Case Register — Authentication

Maps every auth spec under `tests/auth/` to its scenario and expected behaviour.
Keep this in sync whenever an auth spec is added or changed.

| ID | Spec file | Scenario | Steps | Expected result |
|----|-----------|----------|-------|-----------------|
| AUTH-01 | `login-valid.spec.ts` | Sign in with valid credentials | Open `/login`, enter valid email + password, click **Sign in** | Leaves `/login`; "QE Agentic Hub" chrome visible |
| AUTH-02 | `login-invalid.spec.ts` | Sign in with wrong password | Open `/login`, enter valid email + **wrong** password, click **Sign in** | Stays on `/login`; error message shown |
| AUTH-03 | `login-empty-fields.spec.ts` | Submit with blank fields | Open `/login`, click **Sign in** with both fields empty | Does not log in; stays on `/login` |

## Data source
All credentials come from `tools/test-data.ts` (`USERS.valid`, `USERS.wrongPassword`),
overridable via `HUB_EMAIL` / `HUB_PASSWORD` environment variables.

## Notes / caveats
- AUTH-02 and AUTH-03 rely on a **best-effort** error locator
  (`LoginPage.errorMessage`); the failure paths were not in the walkthrough
  recording. Verify against the live site and adjust the locator if needed.

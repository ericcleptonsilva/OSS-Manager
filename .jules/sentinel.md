## 2024-05-24 - Hardcoded Admin Backdoor
**Vulnerability:** Hardcoded admin backdoor credentials ('admin@oss.com' with password 'admin') were present in the `performCustomLogin` fallback logic in `services/parseService.ts`, allowing complete authentication bypass and admin access.
**Learning:** Developers sometimes leave hardcoded fallback credentials for debugging or "user requests" (as commented) that end up in production, bypassing the standard and custom authentication layers (Parse User, Team, and Academy authentication).
**Prevention:** Never commit hardcoded credentials or backdoor accounts. Enforce authentication exclusively through the database (Parse Server) and validate that the codebase strictly removes any 'mock' admin logins before deployment.

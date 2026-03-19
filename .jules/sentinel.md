## 2024-05-15 - [CRITICAL] Removed Hardcoded Admin Backdoor

**Vulnerability:** A hardcoded authentication backdoor (`admin@oss.com` / `admin`) was present in `services/parseService.ts` within the `performCustomLogin` function, allowing unauthorized global admin access. The same credentials were also populated by default in `constants.ts` and forced via an implicit assignment in `App.tsx` when editing a team.
**Learning:** Hardcoded fallback credentials, even if requested or used for initial setup, can easily be forgotten and left in production code, creating a critical vulnerability (CWE-798). The `adminEmail` assignment in `App.tsx` also highlighted a dangerous anti-pattern where UI state implicitly overrides security configurations.
**Prevention:**
1. Never commit hardcoded authentication credentials (emails or passwords) directly into source code (`parseService.ts`, `constants.ts`).
2. Ensure initialization data is devoid of actual access credentials.
3. Remove implicit logic in UI components (`App.tsx`) that forces specific credential values.
4. Ensure all password fields use `type="password"` in the UI to prevent shoulder surfing.

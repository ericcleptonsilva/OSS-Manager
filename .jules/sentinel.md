## 2025-03-08 - [Remove Hardcoded Admin Credentials]
**Vulnerability:** A hardcoded admin backdoor existed in `services/parseService.ts` and UI files that allowed unauthenticated access using admin@oss.com and password "admin".
**Learning:** Hardcoded credentials represent a critical authentication bypass. In some cases, default values are improperly used for fallback assignments even when intended for testing.
**Prevention:** Remove all hardcoded credentials from the source code, fallback UI assignments, and initial configuration states. Authentication should rely entirely on dynamic checking against a persistent user store.

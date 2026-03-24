## 2025-03-12 - Hardcoded Backdoor Credentials Removal
**Vulnerability:** A hardcoded backdoor for `admin@oss.com` with password `admin` existed in `services/parseService.ts`, `App.tsx`, and `constants.ts`.
**Learning:** Hardcoded credentials serve as an easily exploitable backdoor bypass and were reintroduced via UI assignments and initial state configuration.
**Prevention:** Remove all hardcoded credentials from the authentication flow, default states, and UI fallbacks. Ensure that users must rely on dynamic, securely stored, and validated credentials.

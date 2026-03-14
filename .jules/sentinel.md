## 2024-05-24 - [Critical] Hardcoded Admin Backdoor in Authentication Logic
**Vulnerability:** A hardcoded authentication bypass was present in `services/parseService.ts` (`performCustomLogin`), allowing any user to log in as a global administrator using the credentials `admin@oss.com` and `admin`.
**Learning:** Development backdoors requested by users for convenience can easily slip into production code, completely compromising the application's authentication mechanisms and granting unauthorized access.
**Prevention:** Strictly prohibit and remove hardcoded credentials in authentication flows. Implement database-driven administrative accounts or distinct environment-specific configurations instead of hardcoding fallback user bypasses.


## 2024-05-27 - [Critical] Hardcoded Backdoor Credentials
**Vulnerability:** A hardcoded backdoor admin credential (`admin@oss.com` / `admin`) existed in the custom login logic (`services/parseService.ts`), as well as forced assignment defaults in the UI (`App.tsx`) and initial data config (`constants.ts`).
**Learning:** Hardcoded credentials completely bypass database and regular user authentication checks. This was likely added for convenience during development but remained in production logic, leading to critical risk of unauthorized access.
**Prevention:** Never hardcode credentials in code. Ensure fallback logic uses robust methods and initial setups rely on user-driven configurations or secure environmental injection, not raw strings in source.

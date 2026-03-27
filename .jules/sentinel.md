## 2024-05-30 - [Hardcoded Admin Credentials Bypass]
**Vulnerability:** A hardcoded backdoor for `admin@oss.com` with password `admin` existed in `services/parseService.ts` within the `performCustomLogin` function, allowing unauthorized global admin access regardless of the actual database state.
**Learning:** Hardcoded credentials are a critical security vulnerability that can bypass all other authentication mechanisms.
**Prevention:** Never hardcode credentials in source code. Rely exclusively on secure authentication mechanisms (like checking against hashed passwords in the database or using secure identity providers) and environment variables for configuration secrets.

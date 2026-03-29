## 2024-05-24 - [Hardcoded Admin Credentials]
**Vulnerability:** A hardcoded admin credential (`admin@oss.com` / `admin`) was present in `services/parseService.ts` within the `performCustomLogin` fallback logic, allowing complete administrative access bypass without querying the database or verifying proper authentication.
**Learning:** Hardcoded backdoor credentials are a critical security risk and a common vulnerability pattern when developers leave "testing" credentials in production code, allowing unauthenticated attackers full administrative access to sensitive data and functionality.
**Prevention:** Never include hardcoded credentials in production code. Rely strictly on database-driven authentication logic and environment variables for any required bootstrapping or initial setup.

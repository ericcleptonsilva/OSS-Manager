
## 2024-04-02 - Prevent Empty-String Auth Bypass & Hardcoded Secrets
**Vulnerability:** Critical authentication bypass and hardcoded secrets. The fallback custom login logic allowed `admin@oss.com`/`admin` directly in code. Furthermore, if environment variables fallback defaults evaluate to empty strings, the login function could technically be bypassed using empty strings for credentials, granting admin or user access without a password.
**Learning:** Never rely on fallback default values without performing basic validations (such as `trim() !== ''`) and never keep hardcoded credentials in production code, even for mock admins, as this leads to easy backdoor exploitation.
**Prevention:** Implement strict length and type checks on all authentication inputs (e.g. rejecting empty strings). Exclusively use environment variables for default seeded credentials. Remove logic that automatically patches `adminEmail`/`adminPassword` to hardcoded values.

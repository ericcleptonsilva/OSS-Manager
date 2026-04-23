## 2024-04-23 - Hardcoded Admin Credentials
**Vulnerability:** Hardcoded fallback admin credentials (e.g., admin@oss.com, admin) in source code that bypass standard authentication, allowing privilege escalation.
**Learning:** Default fallback logic, when left in production code without proper verification, provides attackers with a predictable backdoor.
**Prevention:** Remove hardcoded credentials entirely. Rely exclusively on secure database queries and explicit user role mapping rather than overriding roles based on string comparisons with known emails. Ensure fallback queries do not use empty strings as credentials.

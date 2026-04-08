## 2026-04-08 - Remove hardcoded admin backdoor credentials
**Vulnerability:** The application contained hardcoded admin backdoor credentials ('ericlobobr.01@gmail.com', 'admin@oss.com', and 'admin' password) that bypassed normal authentication controls, allowing unauthorized privilege escalation and access.
**Learning:** Hardcoded credentials should never be present in the application's authentication flow or client-side logic, especially not as a global fallback mechanism.
**Prevention:** Rely strictly on established identity providers (like Back4App/Parse standard User login) and role-based access control (RBAC). Remove all hardcoded administrative fallbacks from frontend authentication assignment logic.

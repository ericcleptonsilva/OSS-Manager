## 2025-02-28 - [CRITICAL] Fix default user role and fallback role privilege escalation
**Vulnerability:** Initial userRole state, fallback login role, and missing Parse user role defaults all assigned users the 'admin' role, leading to serious privilege escalation.
**Learning:** Default authorization and authentication fallbacks should always implement the principle of least privilege ('student'), not maximum access.
**Prevention:** Start authorization states explicitly denying access, use the least-privileged role as the fallback, and ensure variables defaulting to a role assign the safe limit (e.g., 'student').

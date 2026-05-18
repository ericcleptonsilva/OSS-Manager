## 2026-03-24 - Default Admin Privilege Escalation
**Vulnerability:** Users without an explicit role default to 'admin' in `App.tsx` during authentication initialization and login flow.
**Learning:** Hardcoding a highly privileged role ('admin') as a fallback for missing data violates the principle of least privilege, allowing any unassigned user to gain full administrative access to the system.
**Prevention:** Always default missing or unverified roles to the least privileged option (e.g., 'student' or a 'guest' equivalent).

## 2026-07-08 - Privilege Escalation via Insecure Default Role Fallback
**Vulnerability:** In frontend session logic (`App.tsx`), standard Parse users missing an explicit `role` field were defaulting to the `admin` role, granting them full system access.
**Learning:** Hardcoding high-privilege defaults in conditional fallbacks (`if (!role) role = 'admin'`) creates an immediate privilege escalation path for any standard user without a role, violating the principle of least privilege.
**Prevention:** All role-based fallbacks, both on the frontend and backend, must default to the least privileged role (e.g., `student` or `guest`). Explicit role assignment is strictly required for administrative access.

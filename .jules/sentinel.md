## 2024-05-15 - [Privilege Escalation via Default Role Assignment]
**Vulnerability:** A missing or undefined user role in `App.tsx` incorrectly defaulted to the 'admin' role, granting highest privileges.
**Learning:** Defaulting undefined states to administrative privileges violates the principle of least privilege and introduces a severe privilege escalation vector.
**Prevention:** All frontend state initializations and fallback role assignments must explicitly default to the least privileged role (e.g., 'student').
## 2024-05-24 - Privilege Escalation via Fallback Role
**Vulnerability:** The application defaults to the 'admin' role when a user's role is not explicitly defined or when role checks fail in `App.tsx`. This creates a privilege escalation vulnerability where any authenticated user without a specific role could gain administrative access.
**Learning:** Defaulting to a high-privilege role for missing data or error states violates the principle of least privilege. The fallback role should always be the least privileged role (e.g., 'student').
**Prevention:** Always default to the least privileged role in state initialization, catch blocks, and conditional fallbacks. Enforce this convention across the codebase.

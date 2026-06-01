## 2026-05-15 - Default Privilege Escalation to Admin

**Vulnerability:** The `userRole` state in `App.tsx` defaulted to `'admin'` on initialization, on fallback during authentication if no student was found, and upon logout. This constitutes a privilege escalation vulnerability where an unauthenticated or unknown user could potentially gain administrative access to the client UI.

**Learning:** When defining user roles and states, the system should always default to the principle of least privilege. In an RBAC system, failing to match a specific role should result in the lowest possible privilege level (e.g., `'student'`), not the highest (`'admin'`). This insecure default was widespread across state initialization and error/fallback handling.

**Prevention:** Always initialize and fallback to the lowest privilege role. Explicitly check for `'admin'` or `'professor'` roles, and if those checks fail, default to `'student'`. Review all state resets (like `handleLogout`) to ensure they revert to a safe baseline state.
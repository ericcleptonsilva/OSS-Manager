## 2024-05-18 - Fix Insecure Default Role
**Vulnerability:** Privilege escalation due to insecure default role fallback in `App.tsx`. When a user role failed to load or when no user was found, the app incorrectly fell back to granting `admin` privileges.
**Learning:** Defaulting to a high-privilege role upon missing state or authentication failure violates the Principle of Least Privilege and directly leads to a fail-open scenario where users get administrative capabilities unintentionally.
**Prevention:** Always enforce the Principle of Least Privilege by defaulting state variables and authentication fallbacks to the lowest possible privilege level (e.g., `student`). Use explicit validation for granting elevated roles.

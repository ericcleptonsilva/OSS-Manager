## 2024-06-11 - Privilege Escalation via Insecure Default Roles
**Vulnerability:** The initial and fallback state for user roles in `App.tsx` defaulted to `'admin'` instead of `'student'`. Unrecognized Parse users and users hitting fallback catch-blocks would be automatically granted `admin` privileges across the entire frontend application, creating an authorization bypass.
**Learning:** Defaulting system state variables (like roles) to the highest-privilege tier instead of the lowest-privilege tier (`student`) leads to silent, critical privilege escalations when edge cases in authentication data fail to resolve properly.
**Prevention:** Always default states and variables representing user access roles or authorization levels to the tier of least privilege.

## 2024-05-30 - Insecure Default Role Fallback to Admin
**Vulnerability:** The application was assigning the highest privilege role (`admin`) by default in the initial state and as a fallback when a Parse User lacked a defined role or during logout.
**Learning:** Defaulting to a high-privilege role is a severe security risk that violates the principle of least privilege and can easily lead to privilege escalation if role assignment fails or is bypassed.
**Prevention:** Always default to the least privilege role (`student` in this case) during initial state, fallback scenarios, and catch blocks. Ensure authorization checks explicitly verify expected roles instead of relying on default high privileges.

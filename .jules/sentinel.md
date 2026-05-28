
## 2024-05-24 - Privilege Escalation in Default Role Assignment
**Vulnerability:** The application was defaulting to the 'admin' role in multiple places (`useState` initialization, fallback login checks, and logout resets), which leads to privilege escalation if a user logs in but isn't explicitly recognized.
**Learning:** Always fail securely by defaulting to the principle of least privilege. In this context, any unknown or fallback state should result in the 'student' role, never 'admin'.
**Prevention:** Enforce strict role checking and ensure all fallback conditions and initial UI states assign the lowest possible privilege level.

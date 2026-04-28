## 2024-05-24 - Privilege Escalation via Hardcoded Backdoors
**Vulnerability:** The application contained hardcoded backdoor credentials (`admin@oss.com` and `ericlobobr.01@gmail.com`) that automatically bypassed authentication checks and granted full `admin` privileges. In addition, fallback logic assigned `admin` roles by default when parsing failed, and custom login routines could be bypassed if database credentials were an empty string.
**Learning:** Legacy hardcoded "override" accounts and default-admin fallbacks represent critical security flaws. Relying on hardcoded string matches for admin escalation bypasses all database and token-based security measures. Empty string matching in legacy logic could also lead to auth bypasses.
**Prevention:**
1. Always use default-deny or least-privilege approaches (e.g., fallback to `student` instead of `admin`).
2. Never hardcode superuser or admin emails in the frontend source code. All authorization must depend on dynamically fetched, cryptographically sound roles or validated credentials.
3. Explicitly check that stored credentials fetched from the database are non-empty before validating them against user inputs.

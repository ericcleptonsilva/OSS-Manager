## 2024-05-24 - [CRITICAL] Hardcoded Admin Backdoor Removed
**Vulnerability:** A hardcoded credentials backdoor check (`admin@oss.com` / `admin`) was present in `services/parseService.ts` (`performCustomLogin`), allowing global administrative access bypassing the database completely. This issue represents a severe security risk.
**Learning:** Hardcoded backdoors, even if added for debugging or "user request", introduce a critical vulnerability where any user who discovers or guesses the credentials has full system access.
**Prevention:** Never hardcode credentials in source code. Rely entirely on the underlying authentication system and database to store and validate credentials. Remove fallback checks that circumvent proper credential validation.

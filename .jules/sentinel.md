## 2024-05-15 - Hardcoded Admin Backdoor in Authentication
**Vulnerability:** Hardcoded fallback backdoor credentials ('admin@oss.com' / 'admin') bypassing normal authentication in performCustomLogin.
**Learning:** Hardcoded credentials even for ease of setup create critical unauthenticated access paths in production environments.
**Prevention:** Do not hardcode authentication credentials anywhere in source code. Enforce the use of environment variables or secure database initializations for administrative setups.

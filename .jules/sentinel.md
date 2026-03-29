## 2024-05-18 - [Fix hardcoded backdoor credentials]
**Vulnerability:** A hardcoded backdoor for `admin@oss.com` with the password `admin` was present in the authentication flow (`services/parseService.ts`).
**Learning:** Hardcoded credentials allow unauthorized authentication bypass and full administrative access, overriding any dynamic security controls or database state.
**Prevention:** Never commit static credentials to source code. Rely solely on database-backed authentication and role-based access control, even for administrative fallback accounts.

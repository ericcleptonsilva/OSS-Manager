## 2024-05-24 - [Critical] Reintroduction of Hardcoded Backdoor Credentials
**Vulnerability:** A backdoor set of credentials (`admin@oss.com` / `admin`) was hardcoded into the custom login logic in `services/parseService.ts`, injected directly in the UI as defaults in `App.tsx`, and set as the initial state in `constants.ts`. This allows attackers or unauthorized users to easily bypass authentication and gain full administrative access.
**Learning:** Developers might insert "easy" testing or default credentials and forget to remove them, or purposefully reintroduce them across multiple areas of the codebase to facilitate local testing, which severely compromises production security.
**Prevention:**
- Enforce strict reviews preventing any hardcoded credentials in logic, constants, or form defaults.
- Use distinct environments for testing and production; seed test environments dynamically without checking static credentials into the repository.
- Ensure custom authentication logic strictly evaluates against stored/hashed credentials rather than static strings.

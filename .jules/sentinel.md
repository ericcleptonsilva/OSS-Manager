## 2026-02-12 - [Exposed Secrets in Client Bundle]
**Vulnerability:** The application was exposing `GEMINI_API_KEY` in the client bundle via Vite's `define` configuration.
**Learning:** Vite's `define` replaces global variables with string literals during the build process. If sensitive environment variables are included here, they become hardcoded strings in the public JavaScript files, accessible to anyone.
**Prevention:** Never inject secrets into the client bundle using `define` or `VITE_` prefix. Always keep secrets on the server (or Cloud Code) and access them via secure API endpoints.
**Note:** Instead of removing the `define` entry entirely (which might cause `ReferenceError` if the code relies on the global variable), it is safer to replace the value with an empty string or placeholder.

## 2026-02-13 - [Fail-Open RBAC & Insecure Defaults]
**Vulnerability:** The application's data fetching logic ('fetchFullData') relied on client-side filtering and defaulted users without a role to 'admin'. Additionally, the initial fix implementation was "Fail-Open", meaning if a student's email was missing, the filter was skipped and they received full access.
**Learning:** Security logic must always "Fail-Closed". If a condition for restricted access isn't met (e.g., missing email), access should be denied, not granted. Furthermore, defaulting undefined roles to the highest privilege ('admin') is a critical design flaw.
**Prevention:** Always implement an explicit "Deny All" or "Fetch Nothing" else block. Never default to 'admin' for undefined roles; default to 'guest' or 'student' (least privilege). Validate inputs for RBAC filters before executing queries.

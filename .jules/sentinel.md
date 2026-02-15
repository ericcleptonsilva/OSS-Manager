## 2026-02-12 - [Exposed Secrets in Client Bundle]
**Vulnerability:** The application was exposing `GEMINI_API_KEY` in the client bundle via Vite's `define` configuration.
**Learning:** Vite's `define` replaces global variables with string literals during the build process. If sensitive environment variables are included here, they become hardcoded strings in the public JavaScript files, accessible to anyone.
**Prevention:** Never inject secrets into the client bundle using `define` or `VITE_` prefix. Always keep secrets on the server (or Cloud Code) and access them via secure API endpoints.
**Note:** Instead of removing the `define` entry entirely (which might cause `ReferenceError` if the code relies on the global variable), it is safer to replace the value with an empty string or placeholder.

## 2026-02-12 - [Excessive Data Exposure in Service Layer]
**Vulnerability:** The `fetchFullData` service function was retrieving the entire database (Students, Academies, Financials) regardless of the authenticated user's role, relying solely on the frontend to hide sensitive data.
**Learning:** In "Backend-as-a-Service" architectures (like Parse/Firebase) wrapped in a custom service layer, it is easy to accidentally implement "fetch all" patterns that violate the Principle of Least Privilege if access controls are not strictly enforced at the query level.
**Prevention:** Always pass the user context (role/ID) to data fetching services and apply server-side filtering (or query constraints) to return *only* the data the user is authorized to see.

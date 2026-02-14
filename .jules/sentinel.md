## 2026-02-12 - [Exposed Secrets in Client Bundle]
**Vulnerability:** The application was exposing `GEMINI_API_KEY` in the client bundle via Vite's `define` configuration.
**Learning:** Vite's `define` replaces global variables with string literals during the build process. If sensitive environment variables are included here, they become hardcoded strings in the public JavaScript files, accessible to anyone.
**Prevention:** Never inject secrets into the client bundle using `define` or `VITE_` prefix. Always keep secrets on the server (or Cloud Code) and access them via secure API endpoints.
**Note:** Instead of removing the `define` entry entirely (which might cause `ReferenceError` if the code relies on the global variable), it is safer to replace the value with an empty string or placeholder.

## 2026-02-12 - [Excessive Data Exposure in Service Layer]
**Vulnerability:** The `fetchFullData` service function was retrieving the entire database (all Students, Academies, Financials) regardless of the user's role, relying on the frontend to filter what was displayed. This allowed any authenticated user (e.g., a Student) to inspect network responses or application state and access other users' PII and financial records.
**Learning:** Client-side filtering is NOT a security control. Authentication does not equal Authorization. Single Page Applications (SPAs) must request only the data the user is permitted to see.
**Prevention:** Implement role-based data filtering logic directly in the data fetching service or backend query construction. Ensure the API or Service function accepts the user context (Role/ID) and applies `equalTo` or similar database constraints before executing the query.

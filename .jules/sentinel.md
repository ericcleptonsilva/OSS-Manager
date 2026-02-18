## 2026-02-12 - [Exposed Secrets in Client Bundle]
**Vulnerability:** The application was exposing `GEMINI_API_KEY` in the client bundle via Vite's `define` configuration.
**Learning:** Vite's `define` replaces global variables with string literals during the build process. If sensitive environment variables are included here, they become hardcoded strings in the public JavaScript files, accessible to anyone.
**Prevention:** Never inject secrets into the client bundle using `define` or `VITE_` prefix. Always keep secrets on the server (or Cloud Code) and access them via secure API endpoints.
**Note:** Instead of removing the `define` entry entirely (which might cause `ReferenceError` if the code relies on the global variable), it is safer to replace the value with an empty string or placeholder.

## 2026-02-18 - [Insecure Data Fetching Architecture]
**Vulnerability:** The `fetchFullData` service function retrieves all records (Students, Trainings, Financials) without server-side filtering arguments, relying on client-side logic to filter data for the user.
**Learning:** This "fetch everything, show some" pattern (Security by Obscurity) is dangerous. If backend permissions (ACLs/CLPs) are not strictly configured, any authenticated user (or public user if permissions are open) can access the entire database by inspecting network traffic or using the JS console.
**Prevention:** Always implement server-side filtering (e.g., Cloud Functions or constrained Queries) where the query explicitly limits data to the current user's scope (e.g., `query.equalTo('owner', user)`). Never rely on the client to filter sensitive data.

## 2026-02-12 - [Exposed Secrets in Client Bundle]
**Vulnerability:** The application was exposing `GEMINI_API_KEY` in the client bundle via Vite's `define` configuration.
**Learning:** Vite's `define` replaces global variables with string literals during the build process. If sensitive environment variables are included here, they become hardcoded strings in the public JavaScript files, accessible to anyone.
**Prevention:** Never inject secrets into the client bundle using `define` or `VITE_` prefix. Always keep secrets on the server (or Cloud Code) and access them via secure API endpoints.
**Note:** Instead of removing the `define` entry entirely (which might cause `ReferenceError` if the code relies on the global variable), it is safer to replace the value with an empty string or placeholder.

## 2026-02-14 - [Excessive Data Exposure in Client-Side Data Loading]
**Vulnerability:** The application was fetching the entire database (all students, financials, trainings) to the client and relying on frontend logic to filter the view based on user roles. This allowed any authenticated user to inspect the network response or application state and access sensitive data of other users and academies.
**Learning:** Single Page Applications often load "initial state" in bulk for performance. Without strict server-side filtering based on the current user's context (Role-Based Access Control at the query level), this pattern inherently leaks data.
**Prevention:** Always implement data fetching functions that accept the current user context (ID, Role) and apply strict filters to database queries before executing them. Never rely solely on client-side filtering for security.

## 2026-02-12 - [Exposed Secrets in Client Bundle]
**Vulnerability:** The application was exposing `GEMINI_API_KEY` in the client bundle via Vite's `define` configuration.
**Learning:** Vite's `define` replaces global variables with string literals during the build process. If sensitive environment variables are included here, they become hardcoded strings in the public JavaScript files, accessible to anyone.
**Prevention:** Never inject secrets into the client bundle using `define` or `VITE_` prefix. Always keep secrets on the server (or Cloud Code) and access them via secure API endpoints.
**Note:** Instead of removing the `define` entry entirely (which might cause `ReferenceError` if the code relies on the global variable), it is safer to replace the value with an empty string or placeholder.

## 2026-02-17 - [Express 5 Routing Regression]
**Vulnerability:** Application crash on startup due to deprecated wildcard route syntax `*` in Express 5.
**Learning:** This codebase uses Express 5 (`^5.2.1`), where `path-to-regexp` is stricter. The classic `app.get('*', ...)` throws a `TypeError: Missing parameter name at index 1`.
**Prevention:** Use regex `app.get(/.*/, ...)` for catch-all routes in Express 5, or ensure wildcards are named (e.g., `/:splat*`).

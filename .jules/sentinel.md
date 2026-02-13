## 2026-02-12 - [Exposed Secrets in Client Bundle]
**Vulnerability:** The application was exposing `GEMINI_API_KEY` in the client bundle via Vite's `define` configuration.
**Learning:** Vite's `define` replaces global variables with string literals during the build process. If sensitive environment variables are included here, they become hardcoded strings in the public JavaScript files, accessible to anyone.
**Prevention:** Never inject secrets into the client bundle using `define` or `VITE_` prefix. Always keep secrets on the server (or Cloud Code) and access them via secure API endpoints.
**Note:** Instead of removing the `define` entry entirely (which might cause `ReferenceError` if the code relies on the global variable), it is safer to replace the value with an empty string or placeholder.

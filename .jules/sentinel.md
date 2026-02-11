## 2025-02-12 - [Vite Define Injection Leak]
**Vulnerability:** Found `vite.config.ts` using `define` to inject `process.env.GEMINI_API_KEY` into the client bundle.
**Learning:** Vite's `define` option replaces global constants with string literals during the build. If this is used for secrets (like API keys) that are present in the build environment, it hardcodes the secret into the public JavaScript files, exposing it to anyone who inspects the code.
**Prevention:** Never use `define` in Vite (or `DefinePlugin` in Webpack) for sensitive environment variables. Only expose public configuration values. Ensure secrets are only accessed on the server-side or via secure backend proxies.

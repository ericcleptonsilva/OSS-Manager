## 2026-04-30 - Fix Hardcoded Admin Credentials Auth Bypass
**Vulnerability:** The application contained hardcoded admin credentials ('admin@oss.com' and 'admin') that bypassed role-based authorization in `App.tsx` and `performCustomLogin` inside `services/parseService.ts`. This allowed arbitrary privilege escalation if those credentials were used or if fallback states were hit.
**Learning:** Hardcoded credentials should never be committed, nor should they be used as 'fallbacks' in production code. Empty string credential handling must also be robust.
**Prevention:** Rely strictly on explicit role assignment (`explicitRole === 'admin'`) for authorization and ensure database queries for credentials reject empty strings before comparison.

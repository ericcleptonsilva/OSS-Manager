## 2023-10-27 - Hardcoded Admin Credentials
**Vulnerability:** The application has hardcoded fallback credentials (`admin@oss.com` and `ericlobobr.01@gmail.com`) that grant administrative privileges in `App.tsx`, `constants.ts` and `services/parseService.ts`. This allows anyone to login as admin even if they don't have standard database credentials.
**Learning:** Hardcoded backdoor credentials should never be committed to source code or act as fallbacks on the client side or backend authentication logic.
**Prevention:** Remove all hardcoded references to these admin emails and passwords. Require all admin users to authenticate correctly through Parse Server, and only grant roles based on the actual roles in the database.

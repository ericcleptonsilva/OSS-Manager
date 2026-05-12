
## 2024-05-24 - Hardcoded Role Checks and Credentials
**Vulnerability:** Found hardcoded fallback credentials (`admin@oss.com` and `admin`) inside `services/parseService.ts` and `App.tsx`, paired with hardcoded `isAdminEmail` bypass checks.
**Learning:** These values exposed sensitive credentials and allowed unintended role elevation or bypassed authentication completely if the user inputs were empty and the database fields were also unset.
**Prevention:** Avoid defining secrets or hardcoded administrator emails in client/frontend application code. Implement strict truthy checks for credential validation during custom login routines.


## 2024-05-24 - Hardcoded Authentication Backdoors
**Vulnerability:** The application contained hardcoded administrative credentials (`admin@oss.com`, `ericlobobr.01@gmail.com`) and passwords (`admin`) that bypassed normal authentication flows in both the UI and the backend Parse service logic. An unconfigured database state could also lead to a login bypass using empty strings.
**Learning:** Development convenience features (like hardcoding a known admin email for testing) were shipped to production and tied deeply into the custom role-resolution logic (`checkUserRoleAndLoadData`) and legacy login fallbacks. The empty string bypass risk highlights the danger of relying on default falsy values (`|| ''`) in authentication checks without strict validation.
**Prevention:**
1. Never hardcode credentials in source code. Use environment variables or database configurations.
2. When implementing fallback authentication, ensure strict validation to reject empty credentials.
3. Remove development bypasses before merging to production.

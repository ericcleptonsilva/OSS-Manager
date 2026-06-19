## 2024-05-24 - Network Data Exposure via Parse Object Serialization
**Vulnerability:** Even though sensitive fields like `adminPassword`, `adminEmail`, and `allowedEmails` were excluded from the frontend state mapping functions (e.g., `mapAcademy`), the raw Parse Server payload fetched via `new Parse.Query` still transmitted these fields over the network.
**Learning:** Client-side filtering is insufficient for security; attackers can intercept the raw network responses.
**Prevention:** Always use `Query.exclude('sensitiveField')` directly on Parse Queries to ensure sensitive data never leaves the server, enforcing a "fail-closed" network serialization policy.

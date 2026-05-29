## 2024-05-24 - Exposed Credentials in Client Payloads
**Vulnerability:** The application fetches sensitive backend data like `adminPassword` without explicit `.exclude()` on Parse queries in `fetchFullData` and `fetchPublicData`. Even though the mappings filter it out from the returned app object, the original payload sent over the network contains the password!
**Learning:** Returning all fields from a backend query to the frontend simply relies on client-side mapping to hide credentials, which exposes them to interceptors or developer tools.
**Prevention:** Always use `.exclude('field')` at the database query level to ensure sensitive fields never reach the client over the network.

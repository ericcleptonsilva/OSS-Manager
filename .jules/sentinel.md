## 2024-11-20 - [Fix Credential Leak in Parse Queries]
**Vulnerability:** The data access functions `fetchFullData` and `fetchPublicData` were querying `Team` and `Academy` records and pulling the entire payload over the network. Although client-side mapping functions removed the `adminPassword` and `adminEmail` before caching, these sensitive fields were still present in the initial API response from the backend to the client.
**Learning:** Client-side filtering is insufficient for security; if a payload containing sensitive information hits the browser, it should be considered exposed.
**Prevention:** Always restrict data queries at the source via `.exclude()` (for fields) or server-side logic before it is sent over the network.

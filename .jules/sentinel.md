## 2025-03-03 - Prevent Parse Credential Exposure in Payload
**Vulnerability:** Parse queries in `fetchFullData` and `fetchPublicData` for `Team` and `Academy` objects returned the entire object, exposing `adminPassword` and `adminEmail` in the network payload, even though the frontend mapping functions scrubbed them.
**Learning:** Frontend mapping/scrubbing is insufficient for security; raw payloads over the network can be intercepted. Parse queries must explicitly use `.exclude()` to prevent sensitive fields from leaving the server.
**Prevention:** Always use `.exclude()` on Parse queries to omit known sensitive fields at the database/server level, rather than relying on client-side mapping.

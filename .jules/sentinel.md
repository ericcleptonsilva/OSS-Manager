## 2024-05-24 - [Data Exposure] Parse query excludes
**Vulnerability:** Sensitive fields like `adminPassword` are exposed in Parse object payloads if they are not explicitly excluded using `.exclude()` on the query, even if they are mapped away in the frontend.
**Learning:** Removing sensitive fields in client-side mapper functions (e.g., `mapAcademy`) does not prevent data exposure over the network since the raw payload is still sent.
**Prevention:** Always apply `.exclude()` directly to the `Parse.Query` to prevent sensitive credentials from being transmitted.

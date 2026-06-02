## 2024-05-24 - Data Exposure Vulnerability in Parse Queries
**Vulnerability:** Sensitive fields like `adminPassword` were exposed in client-side payloads because they were not explicitly excluded from `Parse.Query` executions (e.g., `Team` and `Academy` queries).
**Learning:** Client-side mapping functions do not prevent the raw sensitive payload from being transmitted over the network. Parse Server defaults to sending all fields unless explicitly restricted.
**Prevention:** Always use `.exclude('sensitiveFieldName')` on `Parse.Query` before executing `.find()` or `.first()` to ensure sensitive data is removed at the server level before transmission.

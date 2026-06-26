## 2024-05-18 - Prevent sensitive credential leaks in Parse queries
**Vulnerability:** The `adminPassword` and `adminEmail` fields were being transmitted to the client for local validation during login fallbacks, causing a massive credential exposure over the network.
**Learning:** Client-side mapper functions (like `mapAcademy`) DO NOT prevent data leakage because the raw Parse payload is already transmitted to the browser.
**Prevention:** Always apply `.exclude("adminPassword")` directly to the `Parse.Query` object on the client to ensure the server never sends these sensitive fields over the wire.

## 2024-05-18 - Prevent sensitive credentials over-fetching
**Vulnerability:** The application was fetching the `adminPassword` field from the `Team` and `Academy` collections during data initialization and sending it over the network to the client.
**Learning:** Removing sensitive fields in client-side mapper functions (e.g., `mapAcademy`) does not prevent data exposure, as the raw payload is still sent over the network.
**Prevention:** Always apply `.exclude()` directly to the `Parse.Query` (e.g., `teamQuery.exclude("adminPassword")`) to prevent sensitive credentials from being transmitted over the network.

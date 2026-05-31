## 2024-05-31 - Admin Password Exposure in Parse Queries
**Vulnerability:** The application was fetching `Team` and `Academy` records in `fetchFullData` and `fetchPublicData` without excluding the `adminPassword` field, exposing it to the client.
**Learning:** Even if the mapper functions drop sensitive fields before setting application state, the Parse network payload still transmits those fields.
**Prevention:** Always use `.exclude()` on sensitive fields (like passwords, keys) directly in the `Parse.Query` to prevent transmission over the network, ensuring a defense-in-depth approach.

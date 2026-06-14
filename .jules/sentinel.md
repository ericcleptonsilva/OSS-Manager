## 2025-03-09 - Stop credentials exposure in over-fetched Parse queries
**Vulnerability:** The `fetchFullData` and `fetchPublicData` services were fetching `Team` and `Academy` records using standard `Parse.Query` without excluding sensitive credentials, potentially exposing `adminPassword` and `adminEmail` fields to all users via network interception, even if they were omitted in client-side mapping.
**Learning:** Client-side mappers (like `mapAcademy`) only hide data from the UI layer; the full document is still transmitted over the network from the server.
**Prevention:** Always use `query.exclude('sensitiveField')` server-side/in the Parse query builder before `find()` or `first()` to ensure sensitive properties are stripped before the response leaves the database server.

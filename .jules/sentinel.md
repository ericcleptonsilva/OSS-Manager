## 2024-05-18 - Client-Side Query Field Exclusion
**Vulnerability:** Admin passwords were theoretically excluded on the client side using a mapping function (`mapAcademy`), but the actual data payload returned from the Parse server via the network still contained this sensitive information.
**Learning:** Client-side filtering is insufficient for protecting sensitive fields when using tools like Parse because the raw database payload traverses the network.
**Prevention:** Always use query-level exclusion such as `.exclude('adminPassword')` on `Parse.Query` directly before invoking `.find()` or `.first()` so that the database engine never sends the sensitive fields to the client in the first place.

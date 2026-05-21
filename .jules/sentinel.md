
## 2024-05-24 - Data Exposure via Parse.Query

**Vulnerability:** The application was fetching `Team` and `Academy` objects from Parse Server without explicitly excluding sensitive fields like `adminPassword`, resulting in these credentials being transmitted over the network and potentially exposed in the client's network tab, even if they were scrubbed before rendering.
**Learning:** In a BaaS like Parse, fetching an entire object retrieves all fields by default unless Field-Level Permissions (FLPs) are strictly configured on the backend. Client-side mapping is not sufficient for security as the data has already crossed the network boundary.
**Prevention:** Always use `.exclude('sensitiveFieldName')` on `Parse.Query` instances for any collections known to contain sensitive data, or better yet, enforce strict Read permissions at the schema level.

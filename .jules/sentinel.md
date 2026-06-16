## 2024-06-16 - Prevent Excessive Data Exposure of adminPassword
**Vulnerability:** The Parse SDK fetched all fields of the `Team` and `Academy` objects during generic queries (`fetchFullData` and `fetchPublicData`), which meant the `adminPassword` was sent to the client over the network, even though frontend mapper functions later omitted it from the UI.
**Learning:** Client-side mappers do not protect against excessive data exposure over the network. The data has already been transmitted by the time the mapper executes.
**Prevention:** Always use `.exclude('fieldName')` directly on Parse Query instances to instruct the Parse Server to omit sensitive credentials at the network boundary, ensuring they never reach the client's browser.

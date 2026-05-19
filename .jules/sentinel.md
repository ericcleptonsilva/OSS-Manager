## 2024-05-24 - Data Exposure in Client API Requests
**Vulnerability:** The application was fetching `Team` and `Academy` objects using Parse `find()` without omitting fields, causing `adminPassword` to be included in the raw API response to all users.
**Learning:** Even if the client-side mapping function (e.g., `mapAcademy`) ignores a field, the Parse server will send the full object over the network. Anyone inspecting network traffic can see the raw fields, including plaintext passwords or secrets.
**Prevention:** Always use `.exclude()` on Parse queries for sensitive fields (e.g., `adminPassword`) to prevent them from being returned from the server.

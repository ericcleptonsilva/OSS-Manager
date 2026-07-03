## 2024-05-24 - Fix client-side data exposure
**Vulnerability:** Sensitive fields (like `adminPassword`, `adminEmail`) were not excluded at the query level, meaning they could be transmitted to the client even if hidden by mapper functions.
**Learning:** Removing sensitive fields in client-side mapper functions (e.g., mapAcademy) does not prevent data exposure over the network. The raw payload is still sent from the server.
**Prevention:** Always apply `.exclude()` directly to the `Parse.Query` to prevent sensitive credentials from ever leaving the server.

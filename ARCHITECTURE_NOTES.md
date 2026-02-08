# Architecture & Authentication Notes

## 1. User Storage & Roles
This application uses a hybrid authentication model to support both global administration and academy-specific management.

### **Types of Users**

1.  **Global Admin (Team Admin)**
    *   **Scope:** Full access to all academies, settings, and students.
    *   **Storage:** Stored in the `Team` object (singleton) in fields `adminEmail` and `adminPassword`.
    *   **Default Behavior:** Standard Parse Users (created via Parse Dashboard) are also treated as Admins by default.

2.  **Academy Professor (Manager)**
    *   **Scope:** Access *only* to their specific Academy. Can manage students, trainings, and academy details.
    *   **Storage:** Stored in the `Academy` object in fields `allowedEmails` (Array) and `adminPassword`.
    *   **Important:** These users are **NOT** stored in the standard `_User` table of Back4App. They are "virtual" users configured directly inside the Academy settings.

3.  **Student**
    *   **Scope:** Read-only access to their own profile and history.
    *   **Storage:** Stored in the `Student` table.

## 2. Security Trade-offs (Important)
Since this application uses database objects (`Academy`, `Team`) to store credentials for simplified management:
*   **Public Data:** The public API endpoint (`fetchPublicData`) explicitly **hides** these password fields to prevent leakage.
*   **Authentication:** When a user logs in, the application performs a specific query to validate the credentials against the database. This validation happens logically within the secure context of the application's service layer.
*   **Recommendation:** For high-security environments, migrate "Academy Users" to standard Parse Users with Cloud Code ACLs. This current architecture is optimized for ease of configuration by the Team Admin.

## 3. Troubleshooting Access Issues

### **Why did the Admin not have access?**
**Issue:** Previously, if a user was logged in via the standard Parse flow but the `role` field was missing, the system defaulted to a restricted view.
**Fix:** The logic now defaults standard Parse Users to `'admin'`.

### **Why couldn't the Academy User access their academy?**
**Issue:** Strict case-sensitivity in emails.
**Fix:** The system now normalizes all emails (trims spaces and converts to lowercase).

### **Permissions Summary**
| Role | Can View Dashboard? | Can Edit Team? | Can Edit Academy? | Can Delete Academy? |
| :--- | :---: | :---: | :---: | :---: |
| **Admin** | ✅ (All) | ✅ | ✅ | ✅ |
| **Professor** | ✅ (Own Only) | ❌ | ✅ (Own Only) | ❌ |
| **Student** | ❌ | ❌ | ❌ | ❌ |

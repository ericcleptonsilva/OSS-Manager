# Architecture & Authentication Notes

## 1. User Storage & Roles
This application uses a hybrid authentication model to support both global administration and academy-specific management without complex server-side code.

### **Types of Users**

1.  **Global Admin (Team Admin)**
    *   **Scope:** Full access to all academies, settings, and students.
    *   **Storage:** Stored in the `Team` object (singleton) in fields `adminEmail` and `adminPassword`.
    *   **Default Behavior:** Standard Parse Users (created via Parse Dashboard) are also treated as Admins by default if they lack a specific `role` field.

2.  **Academy Professor (Manager)**
    *   **Scope:** Access *only* to their specific Academy. Can manage students, trainings, and academy details.
    *   **Storage:** Stored in the `Academy` object in fields `allowedEmails` (Array) and `adminPassword`.
    *   **Important:** These users are **NOT** stored in the standard `_User` table of Back4App. They are "virtual" users configured directly inside the Academy settings. This simplifies configuration as requested.

3.  **Student**
    *   **Scope:** Read-only access to their own profile and history.
    *   **Storage:** Stored in the `Student` table.

## 2. Troubleshooting Access Issues

### **Why did the Admin not have access?**
**Issue:** Previously, if a user was logged in via the standard Parse flow but the `role` field was missing on their object, the system defaulted them to a restricted 'student' view.
**Fix:** The logic has been updated to default standard Parse Users to the `'admin'` role, ensuring they have full access.

### **Why couldn't the Academy User access their academy?**
**Issue:** The email comparison logic was strict (case-sensitive). If the saved email was `User@email.com` but the user typed `user@email.com`, login might fail or access would be denied.
**Fix:** The system now normalizes all emails (trims spaces and converts to lowercase) before checking permissions.

### **Permissions Summary**
| Role | Can View Dashboard? | Can Edit Team? | Can Edit Academy? | Can Delete Academy? |
| :--- | :---: | :---: | :---: | :---: |
| **Admin** | ✅ (All) | ✅ | ✅ | ✅ |
| **Professor** | ✅ (Own Only) | ❌ | ✅ (Own Only) | ❌ |
| **Student** | ❌ | ❌ | ❌ | ❌ |

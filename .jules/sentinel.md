## 2025-03-12 - [Hardcoded Admin Backdoor]
**Vulnerability:** A hardcoded admin backdoor existed in `performCustomLogin` within `services/parseService.ts`. If the login email was `admin@oss.com` and the password was `admin`, it bypassed standard authentication and granted full 'admin' privileges via a mock Parse.User object.
**Learning:** Hardcoded credentials for testing or initial setup represent a critical vulnerability if left in production code. Attackers can easily discover these through source code analysis or brute force.
**Prevention:** Never commit hardcoded credentials or backdoors to source control. Always rely on a database, environment variables, or a secure secrets manager for authentication data and initial seeding.

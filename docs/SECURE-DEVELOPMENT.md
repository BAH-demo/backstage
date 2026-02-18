# Secure Development Guidelines

> Security best practices for TypeScript development in the Backstage project, aligned with NIST SP 800-53 and DISA STIG requirements.

## Input Validation (STIG V-220631, NIST SI-10)

### File Path Validation

Always use `resolveSafeChildPath` from `@backstage/backend-plugin-api` to resolve user-controlled file paths:

```typescript
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';

function writeTemporaryFile(tmpDir: string, name: string, content: string) {
  const filePath = resolveSafeChildPath(tmpDir, name);
  await fs.writeFile(filePath, content);
}
```

Use `isChildPath` to validate paths without resolving:

```typescript
import { isChildPath } from '@backstage/backend-plugin-api';

if (!isChildPath(baseDir, requestedPath)) {
  throw new InputError('Invalid file path');
}
```

### General Input Validation

```typescript
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const MAX_INPUT_LENGTH = 255;

function validateEmail(email: string): boolean {
  if (!email || email.length > MAX_INPUT_LENGTH) return false;
  return EMAIL_PATTERN.test(email);
}

function sanitizeString(input: string, maxLength = MAX_INPUT_LENGTH): string | null {
  if (!input || input.length > maxLength) return null;
  const sanitized = input.trim().replace(/[<>"';&|`$()]/g, '');
  return sanitized || null;
}
```

## Express Response Safety (STIG V-220632, NIST SI-10)

Always use `.json()` for responses. Never use `.send()` with user input:

```typescript
res.send(`Invalid id: '${req.params.id}'`); // BAD - XSS risk

throw new InputError(`Invalid id: '${req.params.id}'`); // GOOD

res.json({ message: `Invalid id: '${req.params.id}'` }); // ACCEPTABLE
```

For non-JSON responses, set explicit content type:

```typescript
res.send(`message=${message}`); // BAD

res.contentType('text/plain').send(`message=${message}`); // GOOD
```

## Authentication (STIG V-220629, NIST IA-2, IA-5)

### Password Requirements (when applicable)

- Minimum 14 characters
- Must include: uppercase, lowercase, digit, special character
- Hash with bcrypt (12 rounds minimum)
- Never store plaintext passwords

### Account Lockout

- Lock account after 5 failed login attempts
- 15-minute lockout duration
- Log all failed attempts with IP address

### Backstage Auth

Use Backstage identity providers for authentication:

```typescript
import { createRouter } from '@backstage/plugin-auth-backend';

// Configure identity provider with appropriate security settings
```

## Session Management (STIG V-220630, NIST AC-12)

- Session timeout: 15 minutes of inactivity
- Bind sessions to originating IP address
- Regenerate session ID after authentication
- Secure cookie flags: `Secure`, `HttpOnly`, `SameSite=Strict`

## Encryption (STIG V-220633, V-220634, NIST SC-8, SC-28)

- **At rest**: AES-256 for all sensitive data
- **In transit**: TLS 1.2+ required for all communications
- **Key management**: Store encryption keys securely, never in code
- **Disabled protocols**: SSLv2, SSLv3, TLS 1.0, TLS 1.1

## Audit Logging (STIG V-220635, NIST AU-2, AU-3)

Log the following events in structured JSON format:

| Event | When to Log |
|-------|------------|
| `authentication_success` | User successfully authenticates |
| `authentication_failure` | Authentication attempt fails |
| `account_lockout` | Account locked due to failed attempts |
| `authorization_failure` | Access denied to resource |
| `catalog_change` | Entity created, updated, or deleted |
| `admin_action` | Privileged operation performed |

### Structured Logging

```typescript
interface AuditLogEntry {
  timestamp: string;
  event_type: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  user_id: string;
  ip_address: string;
  outcome: 'success' | 'failure';
  details: Record<string, unknown>;
}

function auditLog(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const log: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  console.log(JSON.stringify(log));
}
```

## Error Handling (STIG V-220641, NIST SI-11)

Use `@backstage/errors` for all error responses:

```typescript
import { NotFoundError, InputError } from '@backstage/errors';

// Throws 404 with safe message
throw new NotFoundError('Resource not found');

// Throws 400 with safe message
throw new InputError('Invalid input provided');
```

Never expose internal errors to users. The built-in error middleware converts errors to safe JSON responses.

## Security Headers (STIG V-220641)

Ensure all HTTP responses include:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Content-Security-Policy` | `default-src 'self'` | Restrict resource loading |

## Secrets Management

- Never hardcode secrets, API keys, or credentials in source code
- Use environment variables or Backstage config with `visibility: secret`
- Add sensitive files to `.gitignore`
- Use `.snyk` policy files for vulnerability ignore rules with description, path, and time limit

## References

- [NIST SP 800-53 Rev 5](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [NIST SP 800-207 Zero Trust Architecture](https://csrc.nist.gov/publications/detail/sp/800-207/final)
- [DISA STIGs](https://public.cyber.mil/stigs/)
- [Backstage Security Policy](../SECURITY.md)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [Federal Security Compliance Framework](https://github.com/COG-GTM/fedreral_security_comliance)

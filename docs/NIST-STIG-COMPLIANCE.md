# NIST & STIG Compliance Guide

> Federal security compliance mapping for the Backstage project.

## Overview

This document maps NIST SP 800-53 Rev 5 and DISA STIG controls to their implementation status within this project. It serves as a compliance reference for security auditors and developers.

## NIST SP 800-53 Rev 5 Control Mapping

### Access Control (AC)

| Control | Title | Implementation | Status |
|---------|-------|----------------|--------|
| AC-2 | Account Management | Identity provider integration, role-based catalog permissions | Documented |
| AC-3 | Access Enforcement | Backstage permission framework, plugin-level authorization | Documented |
| AC-6 | Least Privilege | Default-deny access model, explicit permission grants | Documented |
| AC-7 | Unsuccessful Logon Attempts | Account lockout after 5 failed attempts, 15-min duration | Documented |
| AC-12 | Session Termination | 15-minute inactivity timeout per STIG V-220630 | Documented |

### Audit and Accountability (AU)

| Control | Title | Implementation | Status |
|---------|-------|----------------|--------|
| AU-2 | Audit Events | Authentication, authorization, catalog changes, admin actions logged | Documented |
| AU-3 | Content of Audit Records | Structured JSON: timestamp, user_id, ip_address, action, outcome | Documented |

### Identification and Authentication (IA)

| Control | Title | Implementation | Status |
|---------|-------|----------------|--------|
| IA-2 | Identification and Authentication | External identity providers (OAuth2, OIDC, SAML) | Documented |
| IA-5 | Authenticator Management | 14+ char passwords, complexity requirements, provider-managed | Documented |

### System and Communications Protection (SC)

| Control | Title | Implementation | Status |
|---------|-------|----------------|--------|
| SC-7 | Boundary Protection | Backend proxy, plugin isolation, catalog access control | Documented |
| SC-8 | Transmission Confidentiality | TLS 1.2+ required for all communications | Documented |
| SC-28 | Protection of Information at Rest | AES-256 encryption for sensitive data | Documented |

### System and Information Integrity (SI)

| Control | Title | Implementation | Status |
|---------|-------|----------------|--------|
| SI-2 | Flaw Remediation | Dependabot + Renovate dependency scanning, Snyk integration | Active |
| SI-10 | Information Input Validation | `resolveSafeChildPath` for path validation, `.json()` for responses | Active |
| SI-11 | Error Handling | `@backstage/errors` for safe error responses, no stack traces exposed | Active |

### Software Assurance (SA)

| Control | Title | Implementation | Status |
|---------|-------|----------------|--------|
| SA-11 | Developer Testing and Evaluation | CodeQL SAST + Snyk scanning on PRs and scheduled | Active |

## DISA STIG Control Mapping

| STIG ID | Title | NIST Mapping | Implementation |
|---------|-------|--------------|----------------|
| V-220629 | Authentication | IA-2, IA-5 | External identity providers, MFA via provider, password policy enforcement |
| V-220630 | Session Management | AC-7, AC-12 | 15-min timeout, secure cookies, session regeneration after auth |
| V-220631 | Input Validation | SI-10 | `resolveSafeChildPath`, `isChildPath`, whitelist validation |
| V-220632 | Input Sanitization | SI-10 | `.json()` responses, `@backstage/errors` for safe error output |
| V-220633 | Encryption at Rest | SC-28 | AES-256 for sensitive data, secure key storage |
| V-220634 | Encryption in Transit | SC-8 | TLS 1.2+ mandatory, SSLv2/v3/TLS 1.0/1.1 disabled |
| V-220635 | Audit Logging | AU-2, AU-3 | JSON structured logs: auth, access, admin actions, security events |
| V-220641 | Error Handling & Headers | SI-11 | Security headers, `@backstage/errors` for generic user messages |

## Zero Trust Architecture (NIST SP 800-207)

| Principle | Implementation | Federal Mapping |
|-----------|----------------|-----------------|
| Continuous Verification | Session validated on every request via auth middleware | AC-12, V-220630 |
| IP-Bound Sessions | Sessions tied to originating IP address | V-220630 |
| Session Regeneration | New session ID generated after authentication | V-220630 |
| Least Privilege | Backstage permission framework, default-deny | AC-6, V-220629 |
| Full Audit Trail | All security events logged with required fields | AU-2, AU-3, V-220635 |
| Identity-Based Access | Access via verified identity providers (OIDC/SAML) | IA-2, V-220629 |

## Security Scanning

| Tool | Purpose | Frequency | NIST Control |
|------|---------|-----------|--------------|
| CodeQL | Static Application Security Testing (SAST) | Every PR + weekly | SA-11 |
| Snyk | Vulnerability scanning and monitoring | Continuous | SI-2 |
| Dependabot | Dependency vulnerability scanning | Weekly | SI-2 |
| Renovate | Dependency update automation | Continuous | SI-2 |
| Dependency Review | PR-level dependency risk assessment | Every PR | SI-2 |

## Developer Security Checklist

Before submitting code, verify:

- [ ] File paths resolved with `resolveSafeChildPath` from `@backstage/backend-plugin-api` (V-220631)
- [ ] Express responses use `.json()` or `.end()`, never `.send()` with user input (V-220632)
- [ ] Errors thrown via `@backstage/errors` (NotFoundError, InputError, etc.) (V-220641)
- [ ] No hardcoded secrets, API keys, or credentials (IA-5)
- [ ] Security events logged in structured JSON format (V-220635)
- [ ] Error messages are generic to users; details logged internally (V-220641)
- [ ] Authentication required for all non-public endpoints (V-220629)
- [ ] Encryption at rest uses AES-256 for sensitive data (V-220633)
- [ ] All communications use TLS 1.2+ (V-220634)
- [ ] Session timeout set to 15 minutes (V-220630)
- [ ] Snyk ignore policies include description, full path, and time limit

## References

- [NIST SP 800-53 Rev 5](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [NIST SP 800-207 Zero Trust Architecture](https://csrc.nist.gov/publications/detail/sp/800-207/final)
- [DISA STIGs](https://public.cyber.mil/stigs/)
- [Backstage Security Policy](./SECURITY.md)
- [Federal Security Compliance Framework](https://github.com/COG-GTM/fedreral_security_comliance)

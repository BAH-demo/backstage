# Security Compliance Backend Plugin

A Backstage backend plugin that provides API endpoints for the Security Compliance Dashboard. It serves mock data that simulates vulnerability scan results, STIG compliance status, CVE information, and change request history.

## API Endpoints

All endpoints are prefixed with `/api/security-compliance`.

### Health Check

```
GET /health
```

Returns `{ "status": "ok" }`. Accessible without authentication.

### Full Security Compliance Data

```
GET /entity/:namespace/:kind/:name
```

Returns the complete security compliance data for an entity, including vulnerability summary, STIG controls, scan info, CVEs, and change requests.

### Vulnerability Summary

```
GET /entity/:namespace/:kind/:name/vulnerabilities
```

Returns only the vulnerability scan summary (critical/high/medium/low counts with trends).

### STIG Compliance

```
GET /entity/:namespace/:kind/:name/stig
```

Returns STIG compliance status per control family (AC, AU, IA, SC, SI).

### CVEs

```
GET /entity/:namespace/:kind/:name/cves
```

Returns the list of CVE entries with severity, package, status, and assigned team.

### Change Requests

```
GET /entity/:namespace/:kind/:name/change-requests
```

Returns the change request history with deployment dates, versions, and body-of-evidence status.

## Installation

1. Add the plugin to your backend:

```bash
yarn --cwd packages/backend add @internal/plugin-security-compliance-backend
```

2. Register in your backend `index.ts`:

```ts
backend.add(import('@internal/plugin-security-compliance-backend'));
```

## Mock Data

The plugin generates realistic mock data for any entity. The mock data includes:

- Vulnerability counts across four severity levels with trend indicators
- STIG compliance controls for five NIST families (AC, AU, IA, SC, SI)
- Eight sample CVEs with varying severities and statuses
- Five change request records with different body-of-evidence statuses
- Scan metadata (timestamp and scanner name)

In a production deployment, the mock data provider would be replaced with integrations to actual security scanning tools (Grype, Trivy, Anchore, SonarQube) and change management systems.

## Development

```bash
cd plugins/security-compliance-backend
yarn start
```

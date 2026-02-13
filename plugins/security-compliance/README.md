# Security Compliance Plugin

A Backstage frontend plugin that adds a **Security Compliance** tab to each entity in the service catalog. This tab provides a one-stop view for teams to see the security posture of their services.

## Features

### Scan Info Bar

Displays at the top of the Security Compliance tab:

- **Last Scan Timestamp** - When the most recent vulnerability scan was performed
- **Scanner Used** - Which scanner produced the results (Grype, Trivy, Anchore, or SonarQube)
- **Compliance Level** - Read from the `security.example.com/compliance-level` annotation (e.g., IL2, IL4, IL5)

### Vulnerability Scan Summary

A color-coded summary of vulnerability counts by severity:

- **Critical** (red), **High** (orange), **Medium** (yellow), **Low** (green)
- Each severity includes a trend arrow indicating whether the count is trending up, down, or stable compared to the previous scan

### STIG Compliance Status

A table showing compliance status per NIST control family:

| Family | Description | Status |
|--------|-------------|--------|
| AC | Access Control | Pass/Fail/Not Assessed |
| AU | Audit and Accountability | Pass/Fail/Not Assessed |
| IA | Identification and Authentication | Pass/Fail/Not Assessed |
| SC | System and Communications Protection | Pass/Fail/Not Assessed |
| SI | System and Information Integrity | Pass/Fail/Not Assessed |

Each row shows passed/failed/not-assessed counts and an overall status chip.

### Open CVE Table

A searchable, paginated table of CVEs with columns:

- **CVE ID** - The CVE identifier
- **Severity** - Critical/High/Medium/Low with color-coded chips
- **Package** - The affected package and version
- **Status** - Open (red), Allowlisted (blue), or Remediated (green)
- **Assigned Team** - The team responsible for remediation
- **Published Date** - When the CVE was published

### Change Request History

A table of recent deployments and their body-of-evidence status:

- **CR ID** - Change request identifier
- **Deployment Date** - When the deployment occurred
- **Version** - The deployed version
- **Environment** - Target environment (production, staging, etc.)
- **Description** - What was deployed
- **BoE Status** - Complete (green), Incomplete (red), or Pending Review (orange)
- **Approver** - Who approved the change request

## Custom Annotations

This plugin reads the following annotations from `catalog-info.yaml`:

```yaml
metadata:
  annotations:
    security.example.com/scanner: Grype        # Scanner used (Grype, Trivy, Anchore, SonarQube)
    security.example.com/compliance-level: IL4  # Compliance level (IL2, IL4, IL5, etc.)
    security.example.com/last-scan: "2025-04-01T14:30:00Z"  # Last scan timestamp
```

## Installation

### Frontend Plugin

1. Add the plugin package to your Backstage app:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @internal/plugin-security-compliance
```

2. **New Frontend System (recommended):** Add to your `App.tsx`:

```tsx
import securityCompliancePlugin from '@internal/plugin-security-compliance/alpha';

const app = createApp({
  features: [
    // ... other plugins
    securityCompliancePlugin,
  ],
});
```

3. **Legacy Frontend System:** Add to your `EntityPage.tsx`:

```tsx
import { EntitySecurityComplianceContent } from '@internal/plugin-security-compliance';

// Inside your EntityLayout:
<EntityLayout.Route path="/security-compliance" title="Security Compliance">
  <EntitySecurityComplianceContent />
</EntityLayout.Route>
```

### Backend Plugin

1. Add the backend plugin package:

```bash
yarn --cwd packages/backend add @internal/plugin-security-compliance-backend
```

2. Register in your backend `index.ts`:

```ts
backend.add(import('@internal/plugin-security-compliance-backend'));
```

## Example Catalog Entities

Example catalog entity YAML files are provided in the `examples/` directory:

- `secure-api-service.yaml` - API service with Grype scanning and IL4 compliance
- `frontend-app.yaml` - Frontend app with Trivy scanning and IL2 compliance
- `data-pipeline.yaml` - Data pipeline with SonarQube scanning and IL5 compliance

## Development

To start the plugin in development mode:

```bash
cd plugins/security-compliance
yarn start
```

To run tests:

```bash
yarn test
```

To lint:

```bash
yarn lint
```

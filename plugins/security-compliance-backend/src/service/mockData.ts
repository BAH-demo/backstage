/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface VulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  criticalTrend: 'up' | 'down' | 'stable';
  highTrend: 'up' | 'down' | 'stable';
  mediumTrend: 'up' | 'down' | 'stable';
  lowTrend: 'up' | 'down' | 'stable';
}

export interface StigControl {
  family: string;
  familyName: string;
  passed: number;
  failed: number;
  notAssessed: number;
  total: number;
  status: 'pass' | 'fail' | 'not-assessed';
}

export interface CveEntry {
  cveId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  package: string;
  status: 'open' | 'allowlisted' | 'remediated';
  assignedTeam: string;
  publishedDate: string;
}

export interface ScanInfo {
  lastScanTimestamp: string;
  scannerUsed: string;
}

export interface ChangeRequest {
  id: string;
  deploymentDate: string;
  version: string;
  environment: string;
  bodyOfEvidenceStatus: 'complete' | 'incomplete' | 'pending-review';
  approver: string;
  description: string;
}

export interface SecurityComplianceData {
  vulnerabilitySummary: VulnerabilitySummary;
  stigControls: StigControl[];
  scanInfo: ScanInfo;
  cves: CveEntry[];
  changeRequests: ChangeRequest[];
}

const mockDataByEntity: Record<string, SecurityComplianceData> = {};

function generateMockData(entityRef: string): SecurityComplianceData {
  const seed = entityRef.length;
  return {
    vulnerabilitySummary: {
      critical: (seed % 3) + 1,
      high: (seed % 5) + 3,
      medium: (seed % 8) + 7,
      low: (seed % 12) + 15,
      criticalTrend: 'down',
      highTrend: 'stable',
      mediumTrend: 'up',
      lowTrend: 'down',
    },
    stigControls: [
      {
        family: 'AC',
        familyName: 'Access Control',
        passed: 18,
        failed: 2,
        notAssessed: 1,
        total: 21,
        status: 'fail',
      },
      {
        family: 'AU',
        familyName: 'Audit and Accountability',
        passed: 14,
        failed: 0,
        notAssessed: 0,
        total: 14,
        status: 'pass',
      },
      {
        family: 'IA',
        familyName: 'Identification and Authentication',
        passed: 10,
        failed: 1,
        notAssessed: 2,
        total: 13,
        status: 'fail',
      },
      {
        family: 'SC',
        familyName: 'System and Communications Protection',
        passed: 22,
        failed: 0,
        notAssessed: 3,
        total: 25,
        status: 'not-assessed',
      },
      {
        family: 'SI',
        familyName: 'System and Information Integrity',
        passed: 11,
        failed: 3,
        notAssessed: 0,
        total: 14,
        status: 'fail',
      },
    ],
    scanInfo: {
      lastScanTimestamp: new Date(
        Date.now() - (seed % 48) * 3600000,
      ).toISOString(),
      scannerUsed: ['Grype', 'Trivy', 'Anchore', 'SonarQube'][seed % 4],
    },
    cves: [
      {
        cveId: 'CVE-2025-29017',
        severity: 'critical',
        package: 'openssl@3.0.8',
        status: 'open',
        assignedTeam: 'Platform Security',
        publishedDate: '2025-03-15',
      },
      {
        cveId: 'CVE-2025-28104',
        severity: 'high',
        package: 'curl@7.88.0',
        status: 'open',
        assignedTeam: 'Platform Security',
        publishedDate: '2025-02-28',
      },
      {
        cveId: 'CVE-2025-27331',
        severity: 'high',
        package: 'nginx@1.24.0',
        status: 'allowlisted',
        assignedTeam: 'Infrastructure',
        publishedDate: '2025-02-10',
      },
      {
        cveId: 'CVE-2025-26912',
        severity: 'medium',
        package: 'lodash@4.17.20',
        status: 'remediated',
        assignedTeam: 'App Dev',
        publishedDate: '2025-01-22',
      },
      {
        cveId: 'CVE-2025-25844',
        severity: 'medium',
        package: 'express@4.18.2',
        status: 'open',
        assignedTeam: 'App Dev',
        publishedDate: '2025-01-15',
      },
      {
        cveId: 'CVE-2025-24501',
        severity: 'low',
        package: 'tar@6.1.13',
        status: 'open',
        assignedTeam: 'Build & Release',
        publishedDate: '2025-01-05',
      },
      {
        cveId: 'CVE-2024-51203',
        severity: 'medium',
        package: 'jackson-databind@2.14.1',
        status: 'allowlisted',
        assignedTeam: 'App Dev',
        publishedDate: '2024-12-20',
      },
      {
        cveId: 'CVE-2024-49877',
        severity: 'high',
        package: 'spring-core@6.0.11',
        status: 'remediated',
        assignedTeam: 'Platform Security',
        publishedDate: '2024-12-01',
      },
    ],
    changeRequests: [
      {
        id: 'CR-2025-0142',
        deploymentDate: '2025-04-01T14:30:00Z',
        version: 'v2.8.1',
        environment: 'production',
        bodyOfEvidenceStatus: 'complete',
        approver: 'J. Smith (ISSO)',
        description: 'Patched critical OpenSSL vulnerability',
      },
      {
        id: 'CR-2025-0138',
        deploymentDate: '2025-03-25T10:00:00Z',
        version: 'v2.8.0',
        environment: 'production',
        bodyOfEvidenceStatus: 'complete',
        approver: 'M. Johnson (ISSM)',
        description: 'Quarterly security hardening release',
      },
      {
        id: 'CR-2025-0135',
        deploymentDate: '2025-03-18T16:45:00Z',
        version: 'v2.8.0-rc1',
        environment: 'staging',
        bodyOfEvidenceStatus: 'pending-review',
        approver: 'Pending',
        description: 'Pre-release validation for security hardening',
      },
      {
        id: 'CR-2025-0129',
        deploymentDate: '2025-03-10T09:15:00Z',
        version: 'v2.7.5',
        environment: 'production',
        bodyOfEvidenceStatus: 'complete',
        approver: 'A. Williams (ISSO)',
        description: 'Emergency patch for CVE-2025-28104',
      },
      {
        id: 'CR-2025-0121',
        deploymentDate: '2025-02-28T11:00:00Z',
        version: 'v2.7.4',
        environment: 'production',
        bodyOfEvidenceStatus: 'incomplete',
        approver: 'J. Smith (ISSO)',
        description: 'Routine dependency updates',
      },
    ],
  };
}

export function getSecurityComplianceData(
  entityRef: string,
): SecurityComplianceData {
  if (!mockDataByEntity[entityRef]) {
    mockDataByEntity[entityRef] = generateMockData(entityRef);
  }
  return mockDataByEntity[entityRef];
}

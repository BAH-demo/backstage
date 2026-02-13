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

export interface SecurityComplianceApi {
  getSecurityComplianceData(entityRef: string): Promise<SecurityComplianceData>;
}

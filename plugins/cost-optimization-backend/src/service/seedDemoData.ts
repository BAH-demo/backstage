/*
 * Copyright 2024 The Backstage Authors
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

import { CostDataStore } from './CostDataStore';
import { CostRecord, Recommendation } from '@backstage/plugin-cost-optimization-common';

export async function seedDemoData(store: CostDataStore): Promise<void> {
  const records: CostRecord[] = [];
  const now = new Date();

  const awsServices = [
    { service: 'Amazon EC2', base: 45 },
    { service: 'Amazon S3', base: 12 },
    { service: 'Amazon RDS', base: 28 },
    { service: 'AWS Lambda', base: 8 },
    { service: 'Amazon CloudFront', base: 6 },
    { service: 'Amazon EKS', base: 18 },
    { service: 'Amazon DynamoDB', base: 9 },
  ];

  const gcpServices = [
    { service: 'Compute Engine', base: 32 },
    { service: 'Cloud Storage', base: 8 },
    { service: 'BigQuery', base: 15 },
    { service: 'Cloud Run', base: 5 },
    { service: 'GKE', base: 14 },
  ];

  const azureServices = [
    { service: 'Virtual Machines', base: 25 },
    { service: 'Azure SQL', base: 18 },
    { service: 'Blob Storage', base: 7 },
    { service: 'Azure Functions', base: 4 },
  ];

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    const variance = () => 0.8 + Math.random() * 0.4;

    for (const svc of awsServices) {
      records.push({
        provider: 'aws',
        service: svc.service,
        account: '123456789012',
        region: 'us-east-1',
        date: dateStr,
        amount: Math.round(svc.base * variance() * 100) / 100,
        currency: 'USD',
      });
    }

    for (const svc of gcpServices) {
      records.push({
        provider: 'gcp',
        service: svc.service,
        account: 'my-gcp-project',
        region: 'us-central1',
        date: dateStr,
        amount: Math.round(svc.base * variance() * 100) / 100,
        currency: 'USD',
      });
    }

    for (const svc of azureServices) {
      records.push({
        provider: 'azure',
        service: svc.service,
        account: 'sub-abc-123',
        region: 'eastus',
        date: dateStr,
        amount: Math.round(svc.base * variance() * 100) / 100,
        currency: 'USD',
      });
    }
  }

  await store.upsertRecords(records);

  const recommendations: Recommendation[] = [
    {
      id: 'rec-1',
      provider: 'aws',
      type: 'rightsizing',
      title: 'Rightsize EC2 instance i-0abc123',
      description:
        'Instance i-0abc123 (m5.2xlarge) has average CPU utilization of 12%. Consider downsizing to m5.large to save approximately $180/month.',
      estimatedMonthlySavings: 180,
      currency: 'USD',
    },
    {
      id: 'rec-2',
      provider: 'aws',
      type: 'unused-resource',
      title: 'Delete unused EBS volume vol-0def456',
      description:
        'EBS volume vol-0def456 (500GB gp3) has been detached for 45 days with no read/write activity.',
      estimatedMonthlySavings: 40,
      currency: 'USD',
    },
    {
      id: 'rec-3',
      provider: 'aws',
      type: 'reserved-instance',
      title: 'Purchase Reserved Instances for RDS',
      description:
        'Your RDS db.r5.xlarge instance has been running on-demand for 6 months. A 1-year reserved instance would save 35%.',
      estimatedMonthlySavings: 294,
      currency: 'USD',
    },
    {
      id: 'rec-4',
      provider: 'gcp',
      type: 'rightsizing',
      title: 'Rightsize GKE node pool',
      description:
        'GKE node pool "default-pool" has 8 n2-standard-4 nodes but average utilization is 25%. Consider reducing to 4 nodes.',
      estimatedMonthlySavings: 210,
      currency: 'USD',
    },
    {
      id: 'rec-5',
      provider: 'gcp',
      type: 'storage-optimization',
      title: 'Move infrequently accessed Cloud Storage data to Nearline',
      description:
        '2.3TB of data in bucket "analytics-raw" has not been accessed in 90 days. Moving to Nearline storage class would reduce costs.',
      estimatedMonthlySavings: 35,
      currency: 'USD',
    },
    {
      id: 'rec-6',
      provider: 'azure',
      type: 'unused-resource',
      title: 'Remove unused Azure SQL elastic pool',
      description:
        'Elastic pool "legacy-pool" has 0 databases assigned but is still provisioned at 200 eDTUs.',
      estimatedMonthlySavings: 150,
      currency: 'USD',
    },
    {
      id: 'rec-7',
      provider: 'aws',
      type: 'spot-instance',
      title: 'Use Spot Instances for batch processing',
      description:
        'EKS workload "batch-processor" runs daily batch jobs that are fault-tolerant. Moving to Spot Instances could save up to 70%.',
      estimatedMonthlySavings: 320,
      currency: 'USD',
    },
  ];

  await store.upsertRecommendations(recommendations);
}

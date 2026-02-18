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

import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import {
  CostRecord,
  CostFetchOptions,
  Recommendation,
  RecommendationOptions,
} from '@backstage/plugin-cost-optimization-common';
import { CostProvider } from '@backstage/plugin-cost-optimization-node';

interface AwsAccountConfig {
  accountId: string;
  roleName?: string;
  region?: string;
}

export class AwsCostProvider implements CostProvider {
  private readonly accounts: AwsAccountConfig[];
  private readonly logger: LoggerService;

  constructor(options: { config: Config; logger: LoggerService }) {
    const { config, logger } = options;
    this.logger = logger;

    this.accounts = [];
    const accountsConfig = config.getOptionalConfigArray('accounts');
    if (accountsConfig) {
      for (const accountConfig of accountsConfig) {
        this.accounts.push({
          accountId: accountConfig.getString('accountId'),
          roleName: accountConfig.getOptionalString('roleName'),
          region: accountConfig.getOptionalString('region') ?? 'us-east-1',
        });
      }
    }
  }

  getProviderName(): string {
    return 'aws';
  }

  async fetchCostData(options: CostFetchOptions): Promise<CostRecord[]> {
    const { startDate, endDate } = options;
    this.logger.info(
      `Fetching AWS cost data for ${this.accounts.length} account(s) from ${startDate} to ${endDate}`,
    );

    const records: CostRecord[] = [];

    for (const account of this.accounts) {
      try {
        this.logger.info(
          `Fetching costs for AWS account ${account.accountId}`,
        );
        const accountRecords = await this.fetchAccountCosts(
          account,
          startDate,
          endDate,
        );
        records.push(...accountRecords);
      } catch (error) {
        this.logger.error(
          `Failed to fetch costs for AWS account ${account.accountId}: ${error}`,
        );
      }
    }

    return records;
  }

  async fetchRecommendations(
    _options: RecommendationOptions,
  ): Promise<Recommendation[]> {
    this.logger.info('Fetching AWS cost optimization recommendations');
    return [];
  }

  private async fetchAccountCosts(
    account: AwsAccountConfig,
    _startDate: string,
    _endDate: string,
  ): Promise<CostRecord[]> {
    this.logger.info(
      `AWS Cost Explorer integration for account ${account.accountId} - ` +
        'requires @aws-sdk/client-cost-explorer to be installed and configured. ' +
        'Returning empty results until AWS SDK is configured.',
    );
    return [];
  }
}

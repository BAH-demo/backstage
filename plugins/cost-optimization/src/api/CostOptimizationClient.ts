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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import {
  CostSummary,
  CostTrend,
  CostEntitySummary,
  Recommendation,
  TopSpender,
} from '@backstage/plugin-cost-optimization-common';
import { CostOptimizationApi } from './CostOptimizationApi';

export class CostOptimizationClient implements CostOptimizationApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async getBaseUrl(): Promise<string> {
    return await this.discoveryApi.getBaseUrl('cost-optimization');
  }

  async getSummary(startDate?: string, endDate?: string): Promise<CostSummary> {
    const baseUrl = await this.getBaseUrl();
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const response = await this.fetchApi.fetch(
      `${baseUrl}/costs/summary?${params.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch cost summary: ${response.statusText}`);
    }
    return response.json();
  }

  async getTrends(
    startDate?: string,
    endDate?: string,
    granularity?: 'daily' | 'monthly',
  ): Promise<CostTrend[]> {
    const baseUrl = await this.getBaseUrl();
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (granularity) params.set('granularity', granularity);

    const response = await this.fetchApi.fetch(
      `${baseUrl}/costs/trends?${params.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch cost trends: ${response.statusText}`);
    }
    return response.json();
  }

  async getEntityCosts(
    namespace: string,
    kind: string,
    name: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CostEntitySummary> {
    const baseUrl = await this.getBaseUrl();
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const response = await this.fetchApi.fetch(
      `${baseUrl}/costs/entity/${encodeURIComponent(namespace)}/${encodeURIComponent(kind)}/${encodeURIComponent(name)}?${params.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch entity costs: ${response.statusText}`);
    }
    return response.json();
  }

  async getEntityRecommendations(
    namespace: string,
    kind: string,
    name: string,
  ): Promise<Recommendation[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(
      `${baseUrl}/costs/entity/${encodeURIComponent(namespace)}/${encodeURIComponent(kind)}/${encodeURIComponent(name)}/recommendations`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch entity recommendations: ${response.statusText}`,
      );
    }
    return response.json();
  }

  async getTopSpenders(
    startDate?: string,
    endDate?: string,
    limit?: number,
  ): Promise<TopSpender[]> {
    const baseUrl = await this.getBaseUrl();
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (limit) params.set('limit', String(limit));

    const response = await this.fetchApi.fetch(
      `${baseUrl}/costs/top-spenders?${params.toString()}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch top spenders: ${response.statusText}`,
      );
    }
    return response.json();
  }

  async getRecommendations(): Promise<Recommendation[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(
      `${baseUrl}/costs/recommendations`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch recommendations: ${response.statusText}`,
      );
    }
    return response.json();
  }
}

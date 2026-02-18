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

import { createApiRef } from '@backstage/core-plugin-api';
import {
  CostSummary,
  CostTrend,
  CostEntitySummary,
  Recommendation,
  TopSpender,
} from '@backstage/plugin-cost-optimization-common';

export interface CostOptimizationApi {
  getSummary(startDate?: string, endDate?: string): Promise<CostSummary>;
  getTrends(
    startDate?: string,
    endDate?: string,
    granularity?: 'daily' | 'monthly',
  ): Promise<CostTrend[]>;
  getEntityCosts(
    namespace: string,
    kind: string,
    name: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CostEntitySummary>;
  getEntityRecommendations(
    namespace: string,
    kind: string,
    name: string,
  ): Promise<Recommendation[]>;
  getTopSpenders(
    startDate?: string,
    endDate?: string,
    limit?: number,
  ): Promise<TopSpender[]>;
  getRecommendations(): Promise<Recommendation[]>;
}

export const costApiRef = createApiRef<CostOptimizationApi>({
  id: 'plugin.cost-optimization.api',
});

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

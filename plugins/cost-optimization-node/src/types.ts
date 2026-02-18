import {
  CostRecord,
  CostFetchOptions,
  Recommendation,
  RecommendationOptions,
} from '@backstage/plugin-cost-optimization-common';

export interface CostProvider {
  getProviderName(): string;
  fetchCostData(options: CostFetchOptions): Promise<CostRecord[]>;
  fetchRecommendations?(
    options: RecommendationOptions,
  ): Promise<Recommendation[]>;
}

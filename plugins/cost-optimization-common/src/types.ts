export const COST_OPTIMIZATION_ANNOTATION_RESOURCE_TAGS =
  'cost-optimization/resource-tags';
export const COST_OPTIMIZATION_ANNOTATION_AWS_ACCOUNT =
  'cost-optimization/aws-account';
export const COST_OPTIMIZATION_ANNOTATION_GCP_PROJECT =
  'cost-optimization/gcp-project';
export const COST_OPTIMIZATION_ANNOTATION_AZURE_SUBSCRIPTION =
  'cost-optimization/azure-subscription';

export interface CostRecord {
  provider: string;
  service: string;
  account?: string;
  region?: string;
  resourceTags?: Record<string, string>;
  date: string;
  amount: number;
  currency: string;
}

export interface CostSummary {
  totalCost: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  costByProvider: CostByCategory[];
  costByService: CostByCategory[];
}

export interface CostByCategory {
  category: string;
  amount: number;
  currency: string;
}

export interface CostTrend {
  date: string;
  amount: number;
  currency: string;
  provider?: string;
}

export interface CostEntitySummary {
  entityRef: string;
  totalCost: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  costByProvider: CostByCategory[];
  costByService: CostByCategory[];
  trends: CostTrend[];
}

export interface Recommendation {
  id: string;
  provider: string;
  entityRef?: string;
  type: RecommendationType;
  title: string;
  description: string;
  estimatedMonthlySavings: number;
  currency: string;
  metadata?: Record<string, string>;
}

export type RecommendationType =
  | 'rightsizing'
  | 'unused-resource'
  | 'reserved-instance'
  | 'spot-instance'
  | 'storage-optimization'
  | 'network-optimization'
  | 'other';

export interface CostFetchOptions {
  startDate: string;
  endDate: string;
  granularity: 'daily' | 'monthly';
  groupBy?: CostGroupBy[];
  filters?: CostFilter[];
}

export type CostGroupBy = 'service' | 'account' | 'region' | 'provider';

export interface CostFilter {
  field: string;
  values: string[];
}

export interface RecommendationOptions {
  providers?: string[];
  types?: RecommendationType[];
}

export interface TopSpender {
  entityRef: string;
  entityName: string;
  totalCost: number;
  currency: string;
  trend: number;
}

export interface ProviderStatus {
  name: string;
  connected: boolean;
  lastSync?: string;
  error?: string;
}

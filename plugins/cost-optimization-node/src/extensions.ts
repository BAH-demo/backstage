import { createExtensionPoint } from '@backstage/backend-plugin-api';
import { CostProvider } from './types';

export interface CostProviderExtensionPoint {
  addProvider(provider: CostProvider): void;
}

export const costProviderExtensionPoint =
  createExtensionPoint<CostProviderExtensionPoint>({
    id: 'cost-optimization.provider',
  });

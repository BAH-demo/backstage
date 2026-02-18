import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { costApiRef } from './api/CostOptimizationApi';
import { CostOptimizationClient } from './api/CostOptimizationClient';
import { rootRouteRef, entityCostRouteRef } from './routes';

export const costOptimizationPlugin = createPlugin({
  id: 'cost-optimization',
  apis: [
    createApiFactory({
      api: costApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CostOptimizationClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
    entityContent: entityCostRouteRef,
  },
});

export const CostDashboardPage = costOptimizationPlugin.provide(
  createRoutableExtension({
    name: 'CostDashboardPage',
    component: () =>
      import('./components/CostDashboardPage').then(m => m.CostDashboardPage),
    mountPoint: rootRouteRef,
  }),
);

export const EntityCostCard = costOptimizationPlugin.provide(
  createComponentExtension({
    name: 'EntityCostCard',
    component: {
      lazy: () =>
        import('./components/EntityCostCard').then(m => m.EntityCostCard),
    },
  }),
);

export const EntityCostContent = costOptimizationPlugin.provide(
  createRoutableExtension({
    name: 'EntityCostContent',
    component: () =>
      import('./components/EntityCostContent').then(m => m.EntityCostContent),
    mountPoint: entityCostRouteRef,
  }),
);

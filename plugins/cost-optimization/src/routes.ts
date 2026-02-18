import { createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'cost-optimization',
});

export const entityCostRouteRef = createRouteRef({
  id: 'cost-optimization-entity',
});

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

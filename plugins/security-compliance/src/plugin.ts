/*
 * Copyright 2025 The Backstage Authors
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
import { rootRouteRef } from './routes';
import {
  securityComplianceApiRef,
  SecurityComplianceClient,
} from './api';

export const securityCompliancePlugin = createPlugin({
  id: 'security-compliance',
  apis: [
    createApiFactory({
      api: securityComplianceApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new SecurityComplianceClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const SecurityCompliancePage = securityCompliancePlugin.provide(
  createRoutableExtension({
    name: 'SecurityCompliancePage',
    component: () =>
      import('./components/SecurityCompliancePage').then(
        m => m.SecurityCompliancePage,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const EntitySecurityComplianceContent = securityCompliancePlugin.provide(
  createComponentExtension({
    name: 'EntitySecurityComplianceContent',
    component: {
      lazy: () =>
        import('./components/SecurityCompliancePage').then(
          m => m.SecurityCompliancePage,
        ),
    },
  }),
);

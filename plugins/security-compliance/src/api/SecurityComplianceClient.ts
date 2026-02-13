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

import { createApiRef, DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { SecurityComplianceApi, SecurityComplianceData } from './types';

export const securityComplianceApiRef = createApiRef<SecurityComplianceApi>({
  id: 'plugin.security-compliance.api',
});

export class SecurityComplianceClient implements SecurityComplianceApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getSecurityComplianceData(
    entityRef: string,
  ): Promise<SecurityComplianceData> {
    const baseUrl = await this.discoveryApi.getBaseUrl('security-compliance');
    const [kind, namespacedName] = entityRef.split(':');
    const [namespace, name] = (namespacedName || 'default/unknown').split('/');
    const response = await this.fetchApi.fetch(
      `${baseUrl}/entity/${namespace}/${kind}/${name}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch security compliance data: ${response.statusText}`,
      );
    }
    return response.json();
  }
}

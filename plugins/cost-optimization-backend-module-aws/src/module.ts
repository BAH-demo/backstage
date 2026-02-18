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
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { costProviderExtensionPoint } from '@backstage/plugin-cost-optimization-node';
import { AwsCostProvider } from './AwsCostProvider';

export const costOptimizationModuleAws = createBackendModule({
  pluginId: 'cost-optimization',
  moduleId: 'aws',
  register(env) {
    env.registerInit({
      deps: {
        provider: costProviderExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ provider, config, logger }) {
        const awsConfig = config.getOptionalConfig(
          'costOptimization.providers.aws',
        );
        if (!awsConfig) {
          logger.warn(
            'No AWS configuration found at costOptimization.providers.aws, skipping AWS cost provider',
          );
          return;
        }

        logger.info('Registering AWS cost provider');
        provider.addProvider(
          new AwsCostProvider({ config: awsConfig, logger }),
        );
      },
    });
  },
});

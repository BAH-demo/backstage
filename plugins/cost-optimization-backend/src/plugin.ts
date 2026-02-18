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
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import {
  CostProviderExtensionPoint,
  costProviderExtensionPoint,
  CostProvider,
} from '@backstage/plugin-cost-optimization-node';
import { CostDataStore } from './service/CostDataStore';
import { createRouter } from './service/router';
import { stringifyEntityRef } from '@backstage/catalog-model';

class CostProviderRegistry implements CostProviderExtensionPoint {
  private providers: CostProvider[] = [];

  addProvider(provider: CostProvider): void {
    this.providers.push(provider);
  }

  getProviders(): CostProvider[] {
    return this.providers;
  }
}

export const costOptimizationPlugin = createBackendPlugin({
  pluginId: 'cost-optimization',
  register(env) {
    const providerRegistry = new CostProviderRegistry();

    env.registerExtensionPoint(
      costProviderExtensionPoint,
      providerRegistry,
    );

    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        database: coreServices.database,
        cache: coreServices.cache,
        scheduler: coreServices.scheduler,
        catalog: catalogServiceRef,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
      },
      async init({
        http,
        logger,
        config,
        database,
        cache: _cache,
        scheduler,
        catalog,
        auth,
        httpAuth,
      }) {
        const db = await database.getClient();
        const costDataStore = new CostDataStore(db);

        await costDataStore.runMigrations();

        const scheduleConfig = config.getOptionalConfig(
          'costOptimization.schedule',
        );
        const frequencyHours =
          scheduleConfig?.getOptionalNumber('frequency.hours') ?? 6;
        const timeoutMinutes =
          scheduleConfig?.getOptionalNumber('timeout.minutes') ?? 30;
        const initialDelayMinutes =
          scheduleConfig?.getOptionalNumber('initialDelay.minutes') ?? 1;

        await scheduler.scheduleTask({
          id: 'cost-optimization-ingestion',
          frequency: { hours: frequencyHours },
          timeout: { minutes: timeoutMinutes },
          initialDelay: { minutes: initialDelayMinutes },
          scope: 'global',
          fn: async () => {
            const providers = providerRegistry.getProviders();
            if (providers.length === 0) {
              logger.info(
                'No cost providers registered, skipping ingestion',
              );
              return;
            }

            logger.info(
              `Starting cost data ingestion from ${providers.length} provider(s)`,
            );

            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .split('T')[0];

            for (const provider of providers) {
              const providerName = provider.getProviderName();
              try {
                logger.info(
                  `Fetching cost data from provider: ${providerName}`,
                );

                await costDataStore.clearRecordsForProvider(providerName);
                const records = await provider.fetchCostData({
                  startDate,
                  endDate,
                  granularity: 'daily',
                });
                await costDataStore.upsertRecords(records);
                logger.info(
                  `Ingested ${records.length} cost records from ${providerName}`,
                );

                if (provider.fetchRecommendations) {
                  await costDataStore.clearRecommendationsForProvider(
                    providerName,
                  );
                  const recommendations =
                    await provider.fetchRecommendations({});
                  await costDataStore.upsertRecommendations(recommendations);
                  logger.info(
                    `Ingested ${recommendations.length} recommendations from ${providerName}`,
                  );
                }
              } catch (error) {
                logger.error(
                  `Failed to ingest cost data from ${providerName}: ${error}`,
                );
              }
            }

            try {
              const { token } = await auth.getPluginRequestToken({
                onBehalfOf: await auth.getOwnServiceCredentials(),
                targetPluginId: 'catalog',
              });
              const entitiesResponse = await catalog.getEntities(
                {
                  filter: { kind: ['Component', 'System', 'Resource'] },
                  fields: [
                    'metadata.name',
                    'metadata.namespace',
                    'metadata.annotations',
                    'kind',
                  ],
                },
                { token },
              );

              const entityMappings = entitiesResponse.items
                .filter(
                  entity =>
                    entity.metadata.annotations?.[
                      'cost-optimization/aws-account'
                    ] ||
                    entity.metadata.annotations?.[
                      'cost-optimization/gcp-project'
                    ] ||
                    entity.metadata.annotations?.[
                      'cost-optimization/azure-subscription'
                    ],
                )
                .map(entity => ({
                  entityRef: stringifyEntityRef(entity),
                  annotations: entity.metadata.annotations || {},
                }));

              await costDataStore.refreshEntityMappings(entityMappings);
              logger.info(
                `Refreshed entity mappings for ${entityMappings.length} entities`,
              );
            } catch (error) {
              logger.error(
                `Failed to refresh entity mappings: ${error}`,
              );
            }
          },
        });

        const router = await createRouter({
          logger,
          costDataStore,
          httpAuth,
        });

        http.use(router);
      },
    });
  },
});

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

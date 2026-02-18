import { createPermission } from '@backstage/plugin-permission-common';

export const costOptimizationReadPermission = createPermission({
  name: 'cost-optimization.read',
  attributes: { action: 'read' },
});

export const costOptimizationRecommendationsReadPermission = createPermission({
  name: 'cost-optimization.recommendations.read',
  attributes: { action: 'read' },
});

export const costOptimizationPermissions = [
  costOptimizationReadPermission,
  costOptimizationRecommendationsReadPermission,
];

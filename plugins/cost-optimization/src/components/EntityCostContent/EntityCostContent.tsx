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

import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { costApiRef } from '../../api/CostOptimizationApi';
import {
  CostEntitySummary,
  Recommendation,
} from '@backstage/plugin-cost-optimization-common';
import { CostTrendChart } from '../CostTrendChart';
import { CostBreakdownTable } from '../CostBreakdownTable';
import { OptimizationRecommendations } from '../OptimizationRecommendations';

export const EntityCostContent = () => {
  const { entity } = useEntity();
  const costApi = useApi(costApiRef);
  const [costData, setCostData] = useState<CostEntitySummary | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        setLoading(true);
        const entityRef = stringifyEntityRef(entity);
        const parts = entityRef.split(':');
        const kind = parts[0];
        const rest = parts[1] || 'default/unknown';
        const [namespace, name] = rest.includes('/')
          ? rest.split('/')
          : ['default', rest];

        const [data, recs] = await Promise.all([
          costApi.getEntityCosts(namespace, kind, name),
          costApi.getEntityRecommendations(namespace, kind, name),
        ]);
        setCostData(data);
        setRecommendations(recs);
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Failed to load cost data',
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCosts();
  }, [entity, costApi]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <WarningPanel title="Cost data unavailable" message={error} />;
  }

  if (!costData || costData.totalCost === 0) {
    return (
      <WarningPanel
        title="No cost data"
        message="No cost data available for this entity. Add cost-optimization annotations to enable cost tracking."
        severity="info"
      />
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CostTrendChart trends={costData.trends} title="Cost Over Time" />
      </Grid>

      <Grid item xs={12} md={6}>
        <CostBreakdownTable
          data={costData.costByProvider}
          title="Cost by Provider"
          categoryLabel="Provider"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CostBreakdownTable
          data={costData.costByService}
          title="Cost by Service"
          categoryLabel="Service"
        />
      </Grid>

      <Grid item xs={12}>
        <OptimizationRecommendations recommendations={recommendations} />
      </Grid>
    </Grid>
  );
};

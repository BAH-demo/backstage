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
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  makeStyles,
} from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { costApiRef } from '../../api/CostOptimizationApi';
import { CostEntitySummary } from '@backstage/plugin-cost-optimization-common';

const useStyles = makeStyles(theme => ({
  costValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  trendUp: {
    color: theme.palette.error?.main || '#f44336',
  },
  trendDown: {
    color: theme.palette.success?.main || '#4caf50',
  },
  trendFlat: {
    color: theme.palette.text.secondary,
  },
  trendContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  topServices: {
    marginTop: theme.spacing(2),
  },
  serviceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0.5, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

export const EntityCostCard = () => {
  const { entity } = useEntity();
  const costApi = useApi(costApiRef);
  const classes = useStyles();
  const [costData, setCostData] = useState<CostEntitySummary | null>(null);
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

        const data = await costApi.getEntityCosts(namespace, kind, name);
        setCostData(data);
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
    return (
      <Card>
        <CardHeader title="Cost Insights" />
        <CardContent>
          <Progress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Cost Insights" />
        <CardContent>
          <WarningPanel title="Cost data unavailable" message={error} />
        </CardContent>
      </Card>
    );
  }

  if (!costData || costData.totalCost === 0) {
    return (
      <Card>
        <CardHeader title="Cost Insights" />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            No cost data available for this entity. Add cost-optimization
            annotations to enable cost tracking.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const trendDirection =
    costData.trends.length >= 2
      ? costData.trends[costData.trends.length - 1].amount -
        costData.trends[Math.max(0, costData.trends.length - 8)].amount
      : 0;

  let TrendIcon = TrendingFlatIcon;
  let trendClass = classes.trendFlat;
  if (trendDirection > 0) {
    TrendIcon = TrendingUpIcon;
    trendClass = classes.trendUp;
  } else if (trendDirection < 0) {
    TrendIcon = TrendingDownIcon;
    trendClass = classes.trendDown;
  }

  return (
    <Card>
      <CardHeader title="Cost Insights" subheader="Last 30 days" />
      <CardContent>
        <Typography className={classes.costValue}>
          $
          {costData.totalCost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Typography>
        <div className={classes.trendContainer}>
          <TrendIcon className={trendClass} />
          <Typography variant="body2" className={trendClass}>
            {trendDirection > 0 && 'Increasing'}
            {trendDirection < 0 && 'Decreasing'}
            {trendDirection === 0 && 'Stable'}
          </Typography>
        </div>

        {costData.costByService.length > 0 && (
          <div className={classes.topServices}>
            <Typography variant="subtitle2">Top Services</Typography>
            {costData.costByService.slice(0, 3).map(service => (
              <div key={service.category} className={classes.serviceItem}>
                <Typography variant="body2">{service.category}</Typography>
                <Typography variant="body2">
                  ${service.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

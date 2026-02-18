import React, { useEffect, useState } from 'react';
import {
  Content,
  Header,
  HeaderLabel,
  Page,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { costApiRef } from '../../api/CostOptimizationApi';
import {
  CostSummary,
  CostTrend,
  Recommendation,
  TopSpender,
} from '@backstage/plugin-cost-optimization-common';
import { CostTrendChart } from '../CostTrendChart';
import { CostBreakdownTable } from '../CostBreakdownTable';
import { OptimizationRecommendations } from '../OptimizationRecommendations';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  makeStyles,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  totalCostCard: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
  },
  totalCostValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
  },
  spenderAmount: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
}));

export const CostDashboardPage = () => {
  const costApi = useApi(costApiRef);
  const classes = useStyles();
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [trends, setTrends] = useState<CostTrend[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [topSpenders, setTopSpenders] = useState<TopSpender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, trendsData, recsData, spendersData] =
          await Promise.all([
            costApi.getSummary(),
            costApi.getTrends(),
            costApi.getRecommendations(),
            costApi.getTopSpenders(),
          ]);
        setSummary(summaryData);
        setTrends(trendsData);
        setRecommendations(recsData);
        setTopSpenders(spendersData);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load cost data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [costApi]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <Page themeId="tool">
        <Header title="Cost Optimization Dashboard" />
        <Content>
          <WarningPanel title="Failed to load cost data" message={error} />
        </Content>
      </Page>
    );
  }

  return (
    <Page themeId="tool">
      <Header title="Cost Optimization Dashboard">
        <HeaderLabel label="Period" value={`${summary?.periodStart ?? ''} to ${summary?.periodEnd ?? ''}`} />
      </Header>
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card className={classes.totalCostCard}>
              <CardHeader title="Total Cloud Spend" />
              <CardContent>
                <Typography className={classes.totalCostValue}>
                  ${summary?.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                </Typography>
                <Typography variant="body2">
                  {summary?.currency ?? 'USD'} | Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <CostTrendChart trends={trends} title="Daily Cost Trends" />
          </Grid>

          <Grid item xs={12} md={6}>
            <CostBreakdownTable
              data={summary?.costByProvider ?? []}
              title="Cost by Provider"
              categoryLabel="Provider"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CostBreakdownTable
              data={summary?.costByService ?? []}
              title="Cost by Service"
              categoryLabel="Service"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Top Spenders" />
              <CardContent>
                {topSpenders.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No entity cost mappings found
                  </Typography>
                ) : (
                  <List>
                    {topSpenders.map(spender => (
                      <ListItem key={spender.entityRef}>
                        <ListItemText
                          primary={spender.entityName}
                          secondary={spender.entityRef}
                        />
                        <Typography className={classes.spenderAmount}>
                          ${spender.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <OptimizationRecommendations recommendations={recommendations} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

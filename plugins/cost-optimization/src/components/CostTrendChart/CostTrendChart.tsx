import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { CostTrend } from '@backstage/plugin-cost-optimization-common';

const useStyles = makeStyles(theme => ({
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    height: 200,
    gap: 2,
    padding: theme.spacing(1, 0),
  },
  bar: {
    flex: 1,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px 2px 0 0',
    minWidth: 4,
    transition: 'height 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0.5, 0),
  },
  label: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
  },
  noData: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    color: theme.palette.text.secondary,
  },
}));

interface CostTrendChartProps {
  trends: CostTrend[];
  title?: string;
}

export const CostTrendChart = (props: CostTrendChartProps) => {
  const { trends, title = 'Cost Trends' } = props;
  const classes = useStyles();

  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <div className={classes.noData}>
            <Typography variant="body2">No trend data available</Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxAmount = Math.max(...trends.map(t => t.amount));

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <div className={classes.chart}>
          {trends.map((trend, index) => (
            <div
              key={index}
              className={classes.bar}
              style={{
                height: `${maxAmount > 0 ? (trend.amount / maxAmount) * 100 : 0}%`,
              }}
              title={`${trend.date}: $${trend.amount.toFixed(2)}`}
            />
          ))}
        </div>
        <div className={classes.labels}>
          <Typography className={classes.label}>
            {trends[0]?.date ?? ''}
          </Typography>
          <Typography className={classes.label}>
            {trends[trends.length - 1]?.date ?? ''}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

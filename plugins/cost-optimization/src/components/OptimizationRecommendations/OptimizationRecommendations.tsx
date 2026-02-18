import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  makeStyles,
  Typography,
  Chip,
} from '@material-ui/core';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import { Recommendation } from '@backstage/plugin-cost-optimization-common';

const useStyles = makeStyles(theme => ({
  savings: {
    color: theme.palette.success?.main || '#4caf50',
    fontWeight: 'bold',
  },
  chip: {
    marginLeft: theme.spacing(1),
    fontSize: '0.7rem',
  },
  noData: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  listItem: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

interface OptimizationRecommendationsProps {
  recommendations: Recommendation[];
  title?: string;
}

export const OptimizationRecommendations = (
  props: OptimizationRecommendationsProps,
) => {
  const { recommendations, title = 'Optimization Recommendations' } = props;
  const classes = useStyles();

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography className={classes.noData} variant="body2">
            No optimization recommendations available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const totalSavings = recommendations.reduce(
    (sum, rec) => sum + rec.estimatedMonthlySavings,
    0,
  );

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={`Potential monthly savings: $${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
      <CardContent>
        <List>
          {recommendations.map(rec => (
            <ListItem key={rec.id} className={classes.listItem}>
              <ListItemIcon>
                <TrendingDownIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <>
                    {rec.title}
                    <Chip
                      label={rec.type}
                      size="small"
                      className={classes.chip}
                      variant="outlined"
                    />
                    <Chip
                      label={rec.provider}
                      size="small"
                      className={classes.chip}
                      color="primary"
                      variant="outlined"
                    />
                  </>
                }
                secondary={
                  <>
                    {rec.description}
                    <br />
                    <span className={classes.savings}>
                      Est. savings: $
                      {rec.estimatedMonthlySavings.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      /mo
                    </span>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

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

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { ScanInfo } from '../../api';

const useStyles = makeStyles(theme => ({
  card: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  value: {
    fontWeight: 500,
    fontSize: '0.95rem',
  },
}));

interface ScanInfoBarProps {
  scanInfo: ScanInfo;
  complianceLevel?: string;
}

export const ScanInfoBar = ({ scanInfo, complianceLevel }: ScanInfoBarProps) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography className={classes.label}>Last Scan</Typography>
            <Typography className={classes.value}>
              {new Date(scanInfo.lastScanTimestamp).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography className={classes.label}>Scanner Used</Typography>
            <Typography className={classes.value}>
              {scanInfo.scannerUsed}
            </Typography>
          </Grid>
          {complianceLevel && (
            <Grid item xs={12} sm={4}>
              <Typography className={classes.label}>
                Compliance Level
              </Typography>
              <Typography className={classes.value}>
                {complianceLevel}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

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

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { securityComplianceApiRef } from '../../api';
import { VulnerabilitySummaryCard } from '../VulnerabilitySummaryCard';
import { StigComplianceTable } from '../StigComplianceTable';
import { CveTable } from '../CveTable';
import { ChangeRequestHistory } from '../ChangeRequestHistory';
import { ScanInfoBar } from '../ScanInfoBar';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}));

export const SecurityCompliancePage = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const securityApi = useApi(securityComplianceApiRef);

  const entityRef = `${entity.kind}:${entity.metadata.namespace || 'default'}/${entity.metadata.name}`;
  const complianceLevel =
    entity.metadata.annotations?.['security.example.com/compliance-level'];

  const {
    value: data,
    loading,
    error,
  } = useAsync(() => securityApi.getSecurityComplianceData(entityRef), [
    entityRef,
  ]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ScanInfoBar
            scanInfo={data.scanInfo}
            complianceLevel={complianceLevel}
          />
        </Grid>
        <Grid item xs={12}>
          <VulnerabilitySummaryCard summary={data.vulnerabilitySummary} />
        </Grid>
        <Grid item xs={12}>
          <StigComplianceTable controls={data.stigControls} />
        </Grid>
        <Grid item xs={12}>
          <CveTable cves={data.cves} />
        </Grid>
        <Grid item xs={12}>
          <ChangeRequestHistory changeRequests={data.changeRequests} />
        </Grid>
      </Grid>
    </div>
  );
};

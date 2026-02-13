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
import CardHeader from '@material-ui/core/CardHeader';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableColumn } from '@backstage/core-components';
import { StigControl } from '../../api';

const useStyles = makeStyles(() => ({
  card: {
    height: '100%',
  },
  pass: {
    backgroundColor: '#388e3c',
    color: '#fff',
  },
  fail: {
    backgroundColor: '#d32f2f',
    color: '#fff',
  },
  notAssessed: {
    backgroundColor: '#757575',
    color: '#fff',
  },
}));

interface StigComplianceTableProps {
  controls: StigControl[];
}

export const StigComplianceTable = ({ controls }: StigComplianceTableProps) => {
  const classes = useStyles();

  const columns: TableColumn<StigControl>[] = [
    {
      title: 'Family',
      field: 'family',
      width: '80px',
    },
    {
      title: 'Control Family Name',
      field: 'familyName',
    },
    {
      title: 'Passed',
      field: 'passed',
      type: 'numeric',
      width: '80px',
    },
    {
      title: 'Failed',
      field: 'failed',
      type: 'numeric',
      width: '80px',
    },
    {
      title: 'Not Assessed',
      field: 'notAssessed',
      type: 'numeric',
      width: '110px',
    },
    {
      title: 'Total',
      field: 'total',
      type: 'numeric',
      width: '70px',
    },
    {
      title: 'Status',
      field: 'status',
      render: (row: StigControl) => {
        const statusMap: Record<string, { label: string; className: string }> = {
          pass: { label: 'PASS', className: classes.pass },
          fail: { label: 'FAIL', className: classes.fail },
          'not-assessed': { label: 'NOT ASSESSED', className: classes.notAssessed },
        };
        const s = statusMap[row.status] || statusMap['not-assessed'];
        return <Chip label={s.label} className={s.className} size="small" />;
      },
      width: '140px',
    },
  ];

  return (
    <Card className={classes.card}>
      <CardHeader title="STIG Compliance Status" />
      <CardContent>
        <Table
          options={{
            search: false,
            paging: false,
            toolbar: false,
            padding: 'dense',
          }}
          columns={columns}
          data={controls}
        />
      </CardContent>
    </Card>
  );
};

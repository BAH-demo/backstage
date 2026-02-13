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
import { ChangeRequest } from '../../api';

const useStyles = makeStyles(() => ({
  card: {
    height: '100%',
  },
  complete: { backgroundColor: '#388e3c', color: '#fff' },
  incomplete: { backgroundColor: '#d32f2f', color: '#fff' },
  pendingReview: { backgroundColor: '#f57c00', color: '#fff' },
}));

interface ChangeRequestHistoryProps {
  changeRequests: ChangeRequest[];
}

export const ChangeRequestHistory = ({
  changeRequests,
}: ChangeRequestHistoryProps) => {
  const classes = useStyles();

  const statusClass = (status: string): string => {
    const map: Record<string, string> = {
      complete: classes.complete,
      incomplete: classes.incomplete,
      'pending-review': classes.pendingReview,
    };
    return map[status] || '';
  };

  const columns: TableColumn<ChangeRequest>[] = [
    {
      title: 'CR ID',
      field: 'id',
      width: '140px',
    },
    {
      title: 'Deployment Date',
      field: 'deploymentDate',
      render: (row: ChangeRequest) =>
        new Date(row.deploymentDate).toLocaleString(),
      width: '180px',
    },
    {
      title: 'Version',
      field: 'version',
      width: '100px',
    },
    {
      title: 'Environment',
      field: 'environment',
      width: '120px',
    },
    {
      title: 'Description',
      field: 'description',
    },
    {
      title: 'BoE Status',
      field: 'bodyOfEvidenceStatus',
      render: (row: ChangeRequest) => (
        <Chip
          label={row.bodyOfEvidenceStatus.toUpperCase().replace('-', ' ')}
          className={statusClass(row.bodyOfEvidenceStatus)}
          size="small"
        />
      ),
      width: '160px',
    },
    {
      title: 'Approver',
      field: 'approver',
      width: '160px',
    },
  ];

  return (
    <Card className={classes.card}>
      <CardHeader title="Change Request History" />
      <CardContent>
        <Table
          options={{
            search: false,
            paging: true,
            pageSize: 5,
            padding: 'dense',
          }}
          columns={columns}
          data={changeRequests}
        />
      </CardContent>
    </Card>
  );
};

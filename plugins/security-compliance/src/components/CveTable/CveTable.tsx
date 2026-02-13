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
import { CveEntry } from '../../api';

const useStyles = makeStyles(() => ({
  card: {
    height: '100%',
  },
  critical: { backgroundColor: '#d32f2f', color: '#fff' },
  high: { backgroundColor: '#f57c00', color: '#fff' },
  medium: { backgroundColor: '#fbc02d', color: '#000' },
  low: { backgroundColor: '#388e3c', color: '#fff' },
  open: { backgroundColor: '#d32f2f', color: '#fff' },
  allowlisted: { backgroundColor: '#1976d2', color: '#fff' },
  remediated: { backgroundColor: '#388e3c', color: '#fff' },
}));

interface CveTableProps {
  cves: CveEntry[];
}

export const CveTable = ({ cves }: CveTableProps) => {
  const classes = useStyles();

  const severityClass = (severity: string): string => {
    const map: Record<string, string> = {
      critical: classes.critical,
      high: classes.high,
      medium: classes.medium,
      low: classes.low,
    };
    return map[severity] || '';
  };

  const statusClass = (status: string): string => {
    const map: Record<string, string> = {
      open: classes.open,
      allowlisted: classes.allowlisted,
      remediated: classes.remediated,
    };
    return map[status] || '';
  };

  const columns: TableColumn<CveEntry>[] = [
    {
      title: 'CVE ID',
      field: 'cveId',
      width: '160px',
    },
    {
      title: 'Severity',
      field: 'severity',
      render: (row: CveEntry) => (
        <Chip
          label={row.severity.toUpperCase()}
          className={severityClass(row.severity)}
          size="small"
        />
      ),
      width: '120px',
    },
    {
      title: 'Package',
      field: 'package',
    },
    {
      title: 'Status',
      field: 'status',
      render: (row: CveEntry) => (
        <Chip
          label={row.status.toUpperCase()}
          className={statusClass(row.status)}
          size="small"
        />
      ),
      width: '140px',
    },
    {
      title: 'Assigned Team',
      field: 'assignedTeam',
    },
    {
      title: 'Published',
      field: 'publishedDate',
      width: '120px',
    },
  ];

  return (
    <Card className={classes.card}>
      <CardHeader title="Open CVEs" />
      <CardContent>
        <Table
          options={{
            search: true,
            paging: true,
            pageSize: 5,
            padding: 'dense',
          }}
          columns={columns}
          data={cves}
        />
      </CardContent>
    </Card>
  );
};

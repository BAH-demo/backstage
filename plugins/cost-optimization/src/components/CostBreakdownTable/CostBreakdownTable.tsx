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

import React from 'react';
import { Table, TableColumn } from '@backstage/core-components';
import { CostByCategory } from '@backstage/plugin-cost-optimization-common';

interface CostBreakdownTableProps {
  data: CostByCategory[];
  title?: string;
  categoryLabel?: string;
}

export const CostBreakdownTable = (props: CostBreakdownTableProps) => {
  const { data, title = 'Cost Breakdown', categoryLabel = 'Category' } = props;

  const columns: TableColumn<CostByCategory>[] = [
    {
      title: categoryLabel,
      field: 'category',
      width: '60%',
    },
    {
      title: 'Cost',
      field: 'amount',
      width: '30%',
      render: (row: CostByCategory) =>
        `$${row.amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: 'Currency',
      field: 'currency',
      width: '10%',
    },
  ];

  return (
    <Table
      title={title}
      options={{
        search: false,
        paging: data.length > 10,
        pageSize: 10,
        padding: 'dense',
      }}
      columns={columns}
      data={data}
    />
  );
};

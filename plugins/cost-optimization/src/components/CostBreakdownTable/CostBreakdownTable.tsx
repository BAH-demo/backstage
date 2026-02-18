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

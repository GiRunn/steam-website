import { FC } from 'react';

interface TableProps {
  columns: Array<{
    title: string;
    dataIndex: string;
    key: string;
    render?: (text: any, record: any) => React.ReactNode;
  }>;
  dataSource: Array<any>;
  loading?: boolean;
}

declare const Table: FC<TableProps>;
export default Table; 
import React from 'react';

// 定义列配置
export interface ColumnType<T> {
    title: string;
    dataIndex: keyof T;
    key: string;
    render?: (value: any, record: T) => React.ReactNode;
}

// 定义 Table 组件的 Props
export interface TableProps<T> {
    columns: ColumnType<T>[];
    dataSource: T[];
    rowKey?: string | ((record: T) => string);
    loading?: boolean;
    pagination?: boolean | {
        current?: number;
        pageSize?: number;
        total?: number;
    };
}

// Table 组件实现
export const Table = <T extends object>({
    columns,
    dataSource,
    rowKey,
    loading = false,
    pagination = false
}: TableProps<T>) => {
    const getRowKey = (record: T, index: number) => {
        if (typeof rowKey === 'function') {
            return rowKey(record);
        }
        if (typeof rowKey === 'string') {
            return (record as any)[rowKey];
        }
        return index.toString();
    };

    return (
        <div className="table-container">
            {loading ? (
                <div>加载中...</div>
            ) : (
                <table className="custom-table">
                    <thead>
                        <tr>
                            {columns.map(column => (
                                <th key={column.key}>{column.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataSource.map((record, index) => (
                            <tr key={getRowKey(record, index)}>
                                {columns.map(column => (
                                    <td key={column.key}>
                                        {column.render 
                                            ? column.render((record as any)[column.dataIndex], record)
                                            : (record as any)[column.dataIndex]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}; 
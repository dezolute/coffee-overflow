import { Table, Button, Tag } from 'antd';

export default function StockTable({ stock, onRemove }) {
  const columns = [
    { title: 'Название', dataIndex: 'name' },
    { title: 'Количество', dataIndex: 'quantity', width: 140 },
    { title: 'Единица', dataIndex: 'unit', width: 120, render: (u) => <Tag color="blue">{u}</Tag> },
    {
      title: 'Действия',
      render: (_, row) => <Button danger size="small" onClick={() => onRemove(row.id)}>Удалить</Button>,
      width: 120,
    },
  ];
  return (
    <div className="card" style={{ padding: 8 }}>
      <Table dataSource={stock} columns={columns} rowKey="id" pagination={false} />
    </div>
  );
}

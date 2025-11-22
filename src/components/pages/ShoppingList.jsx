import { useContext } from 'react';
import { Table, Checkbox, Button } from 'antd';
import { ShoppingContext } from '../../context/ShoppingContext';

export default function ShoppingList() {
  const {
    shoppingItems,
    checkedItems,
    toggleChecked,
    clearChecked,
    clearList,
  } = useContext(ShoppingContext);

  const exportList = (format) => {
    const content = shoppingItems
      .map(item => `${item.name} — ${item.quantity} ${item.unit}`)
      .join('\n');

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shopping-list.txt';
      a.click();
      URL.revokeObjectURL(url);
    }

    if (format === 'pdf') {
      alert('Экспорт в PDF: можно подключить jspdf (npm i jspdf)');
    }
  };

  const columns = [
    {
      title: 'Куплено',
      dataIndex: 'id',
      render: (id) => (
        <Checkbox
          checked={checkedItems.includes(id)}
          onChange={() => toggleChecked(id)}
        />
      ),
      width: 100,
    },
    {
      title: 'Название',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
      width: 140,
    },
    {
      title: 'Единица',
      dataIndex: 'unit',
      width: 120,
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 ring-1 ring-slate-200">
      <h2 className="text-xl font-bold mb-4">🛒 Список покупок</h2>

      <Table
        dataSource={shoppingItems}
        columns={columns}
        rowKey={(r) => `${r.name}__${r.unit}`}
        pagination={false}
        sticky
      />

      <div className="flex flex-wrap gap-3 mt-4">
        <Button onClick={clearChecked}>Сбросить отметки</Button>
        <Button onClick={clearList}>Очистить список</Button>
        <Button onClick={() => exportList('txt')}>Экспорт TXT</Button>
        <Button onClick={() => exportList('pdf')}>Экспорт PDF</Button>
      </div>
    </div>
  );
}

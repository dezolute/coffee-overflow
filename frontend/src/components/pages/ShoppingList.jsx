import { useContext, useEffect, useState } from 'react';
import Navbar from '../layout/Navbar';
import { Table, Checkbox, Button, Tag, Empty } from 'antd';
import { ShoppingContext } from '../../context/ShoppingContext';
import { RecipesContext } from '../../context/RecipesContext';
import ExportButtons from '../shopping/ExportButtons';
import { apiFetch } from '../../services/apiClient';
import { endpoints } from '../../services/endpoints';

export default function ShoppingList() {
  const { menuPlan, stock, checkedItems, toggleChecked, clearChecked, mergeByNameUnit } = useContext(ShoppingContext);
  const { recipes } = useContext(RecipesContext);

  const [shoppingItems, setShoppingItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {

        let from = null;
        let to = null;
        if (menuPlan && menuPlan.length > 0) {
          const dates = menuPlan.map(e => e.date).filter(Boolean).sort();
          from = dates[0];
          to = dates[dates.length - 1];
        } else {
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          from = `${y}-${m}-${d}`;
          const future = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          const yf = future.getFullYear();
          const mf = String(future.getMonth() + 1).padStart(2, '0');
          const df = String(future.getDate()).padStart(2, '0');
          to = `${yf}-${mf}-${df}`;
        }

        const res = await apiFetch(endpoints.shopping.generate(), { method: 'POST', body: { from, to } });
        const list = (res && (res.shopping_list || res)) ? (res.shopping_list || res) : [];
        if (!cancelled) setShoppingItems(list.map((it, idx) => {

          let quantity = it.amount || '';
          let unit = '';
          if (it.amount) {
            const parts = String(it.amount).trim().split(/\s+/);
            const num = parseFloat(parts[0]);
            if (!isNaN(num)) {
              quantity = num;
              unit = parts.slice(1).join(' ');
            } else {
              quantity = it.amount;
              unit = '';
            }
          }
          return { id: it.name + '__' + idx, name: it.name, quantity, unit, rawAmount: it.amount };
        }));
      } catch (e) {
        console.warn('Failed to load shopping list from API:', e.message || e);
      }
    }
    load();
    return () => { cancelled = true };
  }, [menuPlan, recipes, stock, mergeByNameUnit]);

  const columns = [
    {
      title: 'Куплено',
      dataIndex: 'id',
      width: 90,
      render: (id) => (
        <Checkbox
          checked={checkedItems.includes(id)}
          onChange={() => toggleChecked(id)}
        />
      ),
    },
    { title: 'Название', dataIndex: 'name' },
    {
      title: 'Кол-во',
      dataIndex: 'quantity',
      width: 140,
      sorter: (a,b) => Number(a.quantity) - Number(b.quantity),
      render: (q) => <Tag color="green">{q}</Tag>,
    },
    { title: 'Единица', dataIndex: 'unit', width: 120, render: (u) => <Tag color="blue">{u}</Tag> },
  ];

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2 className="page-title">🛒 Список покупок</h2>

        <div className="card" style={{ padding: 8 }}>
          {shoppingItems && shoppingItems.length > 0 ? (
            <Table dataSource={shoppingItems} columns={columns} rowKey="id" pagination={false} />
          ) : (
            <Empty description="Список покупок пуст" />
          )}
        </div>

        <div className="section-gap" style={{ display: 'flex', gap: 10 }}>
          <Button onClick={clearChecked}>Сбросить отметки</Button>
          <ExportButtons items={shoppingItems} />
        </div>
      </div>
    </div>
  );
}

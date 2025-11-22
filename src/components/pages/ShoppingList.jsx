import { useContext, useMemo } from 'react';
import Navbar from '../layout/Navbar';
import { Table, Checkbox, Button, Tag } from 'antd';
import { ShoppingContext } from '../../context/ShoppingContext';
import { RecipesContext } from '../../context/RecipesContext';
import ExportButtons from '../shopping/ExportButtons';

export default function ShoppingList() {
  const { menuPlan, stock, checkedItems, toggleChecked, clearChecked, mergeByNameUnit } = useContext(ShoppingContext);
  const { recipes } = useContext(RecipesContext);

  const shoppingItems = useMemo(() => {
    const acc = [];
    for (const e of menuPlan) {
      const recipe = recipes.find(r => r.id === e.recipeId);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        acc.push({
          name: ing.name,
          unit: ing.unit,
          quantity: Number(ing.quantity) * Number(e.portions),
        });
      }
    }
    let merged = mergeByNameUnit(acc);

    const stockMap = new Map();
    stock.forEach(s => stockMap.set(`${s.name.toLowerCase()}__${(s.unit || '').toLowerCase()}`, Number(s.quantity)));
    merged = merged.map(m => {
      const key = `${m.name.toLowerCase()}__${(m.unit || '').toLowerCase()}`;
      const have = stockMap.get(key) || 0;
      return { ...m, quantity: Number(m.quantity) - have };
    }).filter(m => m.quantity > 0);

    return merged.map(m => ({ ...m, id: `${m.name}__${(m.unit || '').toLowerCase()}` }));
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
          <Table dataSource={shoppingItems} columns={columns} rowKey="id" pagination={false} />
        </div>

        <div className="section-gap" style={{ display: 'flex', gap: 10 }}>
          <Button onClick={clearChecked}>Сбросить отметки</Button>
          <ExportButtons items={shoppingItems} />
        </div>
      </div>
    </div>
  );
}

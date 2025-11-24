import { useContext, useMemo, useState } from 'react';
import moment from 'moment';
import Navbar from '../layout/Navbar';
import { RecipesContext } from '../../context/RecipesContext';
import { ShoppingContext } from '../../context/ShoppingContext';
import { Button, Modal, Select, InputNumber, List, Tag, Empty, Popconfirm } from 'antd';

const mealTypes = [
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
  { value: 'dinner', label: 'Ужин' },
  { value: 'snack', label: 'Перекус' },
];

export default function MenuPlannerPage() {
  const { recipes } = useContext(RecipesContext);
  const { menuPlan, addMenuEntry, removeMenuEntry } = useContext(ShoppingContext);
  const [period, setPeriod] = useState(7); // по умолчанию неделя
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ recipeId: null, mealType: 'lunch', portions: 1 });


  const start = moment();
  const days = Array.from({ length: period }, (_, i) => start.clone().add(i, 'days').format('YYYY-MM-DD'));


  const handleAdd = () => {
    if (!form.recipeId) return;
    addMenuEntry({
      recipeId: form.recipeId,
      date: selectedDate,
      mealType: form.mealType,
      portions: form.portions,
    });
    setModalOpen(false);
    setForm({ recipeId: null, mealType: 'lunch', portions: 1 });
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2 className="page-title">📅 Планирование меню</h2>
        <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>Период:</span>
          <select value={period} onChange={e => setPeriod(Number(e.target.value))} style={{ width: 80 }}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'день' : n < 5 ? 'дня' : 'дней'}</option>
            ))}
          </select>
        </div>
        {days.map(day => {
          const entries = menuPlan.filter(e => e.date === day);
          return (
            <div className="card" style={{ padding: 16, marginBottom: 18 }} key={day}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className="subheading">{moment(day).format('DD.MM.YYYY')}</h3>
                <Button type="primary" onClick={() => { setSelectedDate(day); setModalOpen(true); }}>+ Добавить блюдо</Button>
              </div>
              {entries.length === 0 ? (
                <Empty description="Нет блюд на этот день" />
              ) : (
                <List
                  dataSource={entries}
                  renderItem={e => {
                    const recipe = recipes.find(r => r.id === e.recipeId) || {};
                    const title = recipe.title || recipe.name || 'Блюдо';
                    return (
                      <List.Item
                        actions={[
                          <Popconfirm
                            title={`Удалить ${title}?`}
                            onConfirm={() => removeMenuEntry(e.id)}
                            okText="Да"
                            cancelText="Нет"
                          >
                            <Button danger size="small">Удалить</Button>
                          </Popconfirm>
                        ]}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{title}</span>
                          <Tag color="blue">{mealTypes.find(m => m.value === e.mealType)?.label || e.mealType}</Tag>
                          <span className="badge">Порций: {e.portions}</span>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              )}
            </div>
          );
        })}
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleAdd}
          title="Добавить блюдо в меню"
          okText="Добавить"
          cancelText="Отмена"
        >
          <div style={{ marginBottom: 12 }}>
            <div className="subheading">Блюдо</div>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Выберите блюдо"
              value={form.recipeId}
              onChange={v => setForm(f => ({ ...f, recipeId: v }))}
              optionFilterProp="children"
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {recipes.map(r => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="subheading">Тип приёма пищи</div>
            <Select
              style={{ width: '100%' }}
              value={form.mealType}
              onChange={v => setForm(f => ({ ...f, mealType: v }))}
            >
              {mealTypes.map(m => (
                <Select.Option key={m.value} value={m.value}>{m.label}</Select.Option>
              ))}
            </Select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="subheading">Порции</div>
            <InputNumber min={1} max={20} value={form.portions} onChange={v => setForm(f => ({ ...f, portions: v }))} />
          </div>
        </Modal>
      </div>
    </div>
  );
}

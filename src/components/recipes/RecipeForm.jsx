import { Form, Input, Button, InputNumber } from 'antd';
import { useState } from 'react';

export default function RecipeForm({ onAdd }) {
  const [ingredients, setIngredients] = useState([{ name: '', quantity: 1, unit: '' }]);
  const [steps, setSteps] = useState(['']);

  const addIngredientRow = () => setIngredients(prev => [...prev, { name: '', quantity: 1, unit: '' }]);
  const addStepRow = () => setSteps(prev => [...prev, '' ]);

  const onFinish = (values) => {
    const recipe = {
      name: values.name.trim(),
      ingredients: ingredients.filter(i => i.name.trim()),
      steps: steps.filter(s => s.trim()),
    };
    onAdd(recipe);
  };

  return (
    <div>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Название рецепта" name="name" rules={[{ required: true }]}>
          <Input placeholder="Например: Паста с соусом" />
        </Form.Item>

        <div className="subheading">Ингредиенты</div>
        {ingredients.map((ing, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 160px', gap: 8, marginBottom: 8 }}>
            <Input
              placeholder="Название"
              value={ing.name}
              onChange={(e) => {
                const v = e.target.value;
                setIngredients(prev => prev.map((p,i) => i===idx ? { ...p, name: v } : p));
              }}
            />
            <InputNumber
              min={0}
              value={ing.quantity}
              onChange={(v) => setIngredients(prev => prev.map((p,i) => i===idx ? { ...p, quantity: v || 0 } : p))}
            />
            <Input
              placeholder="Единица (г, мл, шт)"
              value={ing.unit}
              onChange={(e) => {
                const v = e.target.value;
                setIngredients(prev => prev.map((p,i) => i===idx ? { ...p, unit: v } : p));
              }}
            />
          </div>
        ))}
        <Button size="small" className="btn-accent" onClick={addIngredientRow}>
          + Ингредиент
        </Button>

        <div className="subheading" style={{ marginTop: 16 }}>Шаги приготовления</div>
        {steps.map((st, idx) => (
          <Input
            key={idx}
            placeholder={`Шаг ${idx+1}`}
            style={{ marginBottom: 8 }}
            value={st}
            onChange={(e) => {
              const v = e.target.value;
              setSteps(prev => prev.map((p,i) => i===idx ? v : p));
            }}
          />
        ))}
        <Button size="small" className="btn-accent" onClick={addStepRow}>
          + Шаг
        </Button>

        <div style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" className="btn-primary w-full">
            Добавить рецепт
          </Button>
        </div>
      </Form>
    </div>
  );
}

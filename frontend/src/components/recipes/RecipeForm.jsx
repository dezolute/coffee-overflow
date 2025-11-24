import { Form, Input, Button, InputNumber, message } from 'antd';
import { useState } from 'react';

export default function RecipeForm({ onSuccess }) {
  const [form] = Form.useForm();
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState(['']);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateIngredient = (index, field, value) => {
    setIngredients(ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ));
  };

  const updateStep = (index, value) => {
    setSteps(steps.map((s, i) => i === index ? value : s));
  };

  const onFinish = async (values) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Сначала войдите в аккаунт');
      return;
    }

    const filteredIngredients = ingredients
      .filter(ing => ing.name && ing.name.trim() && ing.amount && ing.amount.trim())
      .map(ing => ({ name: ing.name.trim(), amount: ing.amount.trim() }));

    const payload = {
      title: values.title.trim(),
      portions: values.portions || 1,
      steps: steps.filter(s => s.trim()),
      ingredients: filteredIngredients,
    };

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success(`Рецепт "${values.title}" создан!`);
        form.resetFields();
        setIngredients([{ name: '', amount: '' }]);
        setSteps(['']);
        onSuccess?.();
      } else {
        const err = await res.json();
        message.error(err.error || 'Ошибка создания рецепта');
      }
    } catch (err) {
      message.error('Нет связи с сервером');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 my-10">
      <h2 className="text-3xl font-bold text-indigo-700 mb-8 text-center">
        Добавить новый рецепт
      </h2>

      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="title"
          label="Название рецепта"
          rules={[{ required: true, message: 'Введите название рецепта' }]}
        >
          <Input size="large" placeholder="Например: Борщ классический" />
        </Form.Item>

        <Form.Item
          name="portions"
          label="Порции"
          initialValue={1}
        >
          <InputNumber min={1} />
        </Form.Item>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Ингредиенты</h3>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-3 mb-3">
              <Input
                placeholder="Название (мука, курица...)"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Кол-во (100 г, 2 шт)"
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
              />
            </div>
          ))}
          <Button onClick={addIngredient} type="dashed" block>
            + Добавить ингредиент
          </Button>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Шаги приготовления</h3>
          {steps.map((step, idx) => (
            <Input.TextArea
              key={idx}
              value={step}
              onChange={(e) => updateStep(idx, e.target.value)}
              placeholder={`Шаг ${idx + 1}`}
              rows={2}
              className="mb-3"
            />
          ))}
          <Button onClick={addStep} type="dashed" block>
            + Добавить шаг
          </Button>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          className="bg-indigo-600 hover:bg-indigo-700 text-xl font-bold py-6"
        >
          Создать рецепт
        </Button>
      </Form>
    </div>
  );
}
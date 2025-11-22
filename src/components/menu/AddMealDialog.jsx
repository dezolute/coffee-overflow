import { Modal, Form, Select, InputNumber, DatePicker } from 'antd';
import moment from 'moment';

const MEAL_TYPES = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

export default function AddMealDialog({ open, onClose, onSave, date, recipes }) {
  return (
    <Modal
      title="Добавить блюдо в меню"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form
        layout="vertical"
        onFinish={(values) => {
          const recipe = recipes.find(r => r.id === values.recipeId);
          onSave({
            recipe,
            mealType: values.mealType,
            portions: values.portions,
            date: values.date ? values.date.toDate() : date,
          });
        }}
        initialValues={{ date: date ? moment(date) : null, portions: 1 }}
      >
        <Form.Item label="Рецепт" name="recipeId" rules={[{ required: true }]}>
          <Select placeholder="Выберите рецепт">
            {recipes.map(r => (
              <Select.Option key={r.id} value={r.id}>
                {r.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Приём пищи" name="mealType" rules={[{ required: true }]}>
          <Select placeholder="Выберите приём пищи">
            {MEAL_TYPES.map(m => (
              <Select.Option key={m} value={m}>{m}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Количество порций" name="portions" rules={[{ required: true }]}>
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item label="Дата" name="date">
          <DatePicker />
        </Form.Item>

        <Form.Item>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Сохранить
          </button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

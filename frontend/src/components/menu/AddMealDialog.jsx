import { Modal, Form, Select, InputNumber, DatePicker } from 'antd';
import dayjs from 'dayjs';

const MEAL_TYPES = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

export default function AddMealDialog({ open, onClose, onSave, date, recipes }) {
  return (
    <Modal title="Добавить блюдо" open={open} onCancel={onClose} footer={null} centered>
      <Form
        layout="vertical"
        onFinish={(values) => {
          onSave({
            recipeId: values.recipeId,
            mealType: values.mealType,
            portions: values.portions,
            date: values.date ? values.date.toDate() : date,
          });
        }}
        initialValues={{ date: date ? dayjs(date) : null, portions: 1 }}
      >
        <Form.Item label="Рецепт" name="recipeId" rules={[{ required: true }]}>
          <Select placeholder="Выберите рецепт">
            {recipes.map(r => <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item label="Приём пищи" name="mealType" rules={[{ required: true }]}>
          <Select placeholder="Выберите приём пищи">
            {MEAL_TYPES.map(m => <Select.Option key={m} value={m}>{m}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item label="Порции" name="portions" rules={[{ required: true }]}>
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item label="Дата" name="date">
          <DatePicker />
        </Form.Item>
        <Form.Item>
          <button type="submit" className="btn-primary" style={{ padding: '8px 16px', borderRadius: 8 }}>
            Сохранить
          </button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

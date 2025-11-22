import { Modal, Form, Input, Select, Button } from 'antd';
import { CATEGORIES, DIFFICULTIES } from '../../utils/constants';

export default function RecipeFormModal({ open, onClose, onSave }) {
  return (
    <Modal
      title="Добавить рецепт"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form
        layout="vertical"
        onFinish={(values) => onSave(values)}
        initialValues={{ category: CATEGORIES[0], difficulty: DIFFICULTIES[0] }}
      >
        <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Введите название' }]}>
          <Input placeholder="Например: Паста с соусом" />
        </Form.Item>

        <Form.Item label="Фото (URL)" name="image">
          <Input placeholder="https://..." />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item label="Категория" name="category">
            <Select>
              {CATEGORIES.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item label="Время приготовления (мин)" name="time" rules={[{ required: true, message: 'Укажите время' }]}>
            <Input type="number" min={1} placeholder="Напр.: 20" />
          </Form.Item>
        </div>

        <Form.Item label="Сложность" name="difficulty">
          <Select>
            {DIFFICULTIES.map(d => <Select.Option key={d} value={d}>{d}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item label="Ингредиенты" name="ingredients">
          <Input.TextArea rows={3} placeholder="Каждый ингредиент с новой строки" />
        </Form.Item>

        <Form.Item label="Шаги приготовления" name="steps">
          <Input.TextArea rows={4} placeholder="Опишите шаги по порядку" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="bg-indigo-600 hover:bg-indigo-700">
            Сохранить
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

import { Form, Input, InputNumber, Button } from 'antd';

export default function StockForm({ onAdd }) {
  const onFinish = (v) => onAdd({ name: v.name.trim(), quantity: Number(v.quantity || 0), unit: v.unit.trim() });

  return (
    <div className="card" style={{ padding: 16 }}>
      <Form layout="inline" onFinish={onFinish}>
        <Form.Item name="name" rules={[{ required: true }]}>
          <Input placeholder="Продукт" />
        </Form.Item>
        <Form.Item name="quantity" rules={[{ required: true }]}>
          <InputNumber min={0} placeholder="Кол-во" />
        </Form.Item>
        <Form.Item name="unit" rules={[{ required: true }]}>
          <Input placeholder="Единица" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="btn-primary">Добавить в запасы</Button>
        </Form.Item>
      </Form>
    </div>
  );
}

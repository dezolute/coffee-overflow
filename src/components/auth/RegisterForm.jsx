
import { Form, Input, Button } from 'antd';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = (values) => {
    register(values.email, values.password);
    navigate('/recipes'); 
  };

  return (
    <Form layout="vertical" onFinish={onFinish} className="max-w-sm mx-auto">
      <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
        <Input placeholder="Введите email" />
      </Form.Item>
      <Form.Item label="Пароль" name="password" rules={[{ required: true }]}>
        <Input.Password placeholder="Введите пароль" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="w-full">
          Зарегистрироваться
        </Button>
      </Form.Item>
    </Form>
  );
}

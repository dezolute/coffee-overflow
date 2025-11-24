import { useContext } from 'react';
import { Tabs, Form, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const { login, register } = useContext(AuthContext);
  const nav = useNavigate();

  const onLogin = async (v) => {
    await login(v.email, v.password);
    nav('/recipes');
  };
  const onRegister = async (v) => {
    await register(v.email, v.password);
    nav('/recipes');
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2 className="auth-title">🔐 Добро пожаловать</h2>
        <p className="auth-subtitle">
          Войдите в аккаунт или создайте новый, чтобы начать планирование меню.
        </p>

        <Tabs centered defaultActiveKey="login">
          <Tabs.TabPane tab="Вход" key="login">
            <Form layout="vertical" onFinish={onLogin}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: 'email', message: 'Введите корректный email' }]}
              >
                <Input placeholder="example@mail.com" />
              </Form.Item>
              <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: 'Введите пароль' }]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>
              <Button type="primary" htmlType="submit" className="auth-btn">
                Войти
              </Button>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Регистрация" key="register">
            <Form layout="vertical" onFinish={onRegister}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: 'email', message: 'Введите корректный email' }]}
              >
                <Input placeholder="example@mail.com" />
              </Form.Item>
              <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: 'Введите пароль' }]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>
              <Button type="primary" htmlType="submit" className="auth-btn">
                Зарегистрироваться
              </Button>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
}

import { Tabs } from 'antd';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';

export default function AuthPage() {
  return (
    <div className="bg-white shadow-xl rounded-xl p-6 max-w-lg mx-auto mt-10">
      <Tabs defaultActiveKey="login" centered>
        <Tabs.TabPane tab="Вход" key="login">
          <LoginForm />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Регистрация" key="register">
          <RegisterForm />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

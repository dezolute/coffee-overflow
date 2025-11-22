import { Layout, Typography } from 'antd';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Button } from 'antd';


const { Header } = Layout;
const { Title } = Typography;

export default function HeaderNav() {
  return (
    <Header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <Title level={3} className="!m-0 !text-slate-800">
          🍲 Рецепты
        </Title>
      </div>
    </Header>
  );
}

export default function LogoutButton() {
  const { logout } = useContext(AuthContext);

  return <Button onClick={logout}>Выйти</Button>;
}

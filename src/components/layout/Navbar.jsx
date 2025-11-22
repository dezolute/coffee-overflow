import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  const loc = useLocation();

  const tabs = [
    { to: '/recipes', label: 'Рецепты' },
    { to: '/stock', label: 'Запасы' },
    { to: '/menu', label: 'Меню' },
    { to: '/suggest', label: 'Подбор' },
    { to: '/shopping', label: 'Покупки' },
  ];

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="nav-tabs">
          {tabs.map(t => (
            <Link key={t.to} to={t.to}>
              <Button type={loc.pathname === t.to ? 'primary' : 'default'}>
                {t.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="nav-user">
          <span>{user?.email}</span>
          <Button onClick={() => nav('/auth')}>Аккаунт</Button>
          <Button danger onClick={logout}>Выйти</Button>
        </div>
      </div>
    </div>
  );
}

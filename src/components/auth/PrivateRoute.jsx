import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null; // или можно показать <Loading /> компонент
  }

  if (!user || !user.email) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

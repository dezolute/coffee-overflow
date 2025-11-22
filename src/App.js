import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Контексты
import { AuthProvider } from './context/AuthContext';
import { RecipesProvider } from './context/RecipesContext';
import { ShoppingProvider } from './context/ShoppingContext';

// Страницы
import AuthPage from './components/pages/AuthPage';
import RecipesPage from './components/pages/RecipesPage';
import MenuPlanner from './components/pages/MenuPlanner';
import ShoppingList from './components/pages/ShoppingList';

// Защита маршрутов
import PrivateRoute from './components/auth/PrivateRoute';

export default function App() {
  return (
    <AuthProvider>
      <RecipesProvider>
        <ShoppingProvider>
          <BrowserRouter>
            <Routes>
              {/* редирект с корня на каталог */}
              <Route path="/" element={<Navigate to="/recipes" replace />} />

              {/* авторизация */}
              <Route path="/auth" element={<AuthPage />} />

              {/* каталог рецептов */}
              <Route
                path="/recipes"
                element={
                  <PrivateRoute>
                    <RecipesPage />
                  </PrivateRoute>
                }
              />

              {/* планировщик меню */}
              <Route
                path="/menu"
                element={
                  <PrivateRoute>
                    <MenuPlanner />
                  </PrivateRoute>
                }
              />

              {/* список покупок */}
              <Route
                path="/shopping"
                element={
                  <PrivateRoute>
                    <ShoppingList />
                  </PrivateRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ShoppingProvider>
      </RecipesProvider>
    </AuthProvider>
  );
}

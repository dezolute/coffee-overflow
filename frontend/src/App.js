import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RecipesProvider } from './context/RecipesContext';
import { ShoppingProvider } from './context/ShoppingContext';

import AuthPage from './components/pages/AuthPage';
import RecipesPage from './components/pages/RecipesPage';
import StockPage from './components/pages/StockPage';
import MenuPlannerPage from './components/pages/MenuPlannerPage';
import SuggestPage from './components/pages/SuggestPage';
import ShoppingList from './components/pages/ShoppingList';
import PrivateRoute from './components/layout/PrivateRoute';

export default function App() {
  return (
    <AuthProvider>
      <RecipesProvider>
        <ShoppingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/recipes" replace />} />
              <Route path="/auth" element={<AuthPage />} />

              <Route path="/recipes" element={<PrivateRoute><RecipesPage /></PrivateRoute>} />
              <Route path="/stock" element={<PrivateRoute><StockPage /></PrivateRoute>} />
              <Route path="/menu" element={<PrivateRoute><MenuPlannerPage /></PrivateRoute>} />
              <Route path="/suggest" element={<PrivateRoute><SuggestPage /></PrivateRoute>} />
              <Route path="/shopping" element={<PrivateRoute><ShoppingList /></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </ShoppingProvider>
      </RecipesProvider>
    </AuthProvider>
  );
}

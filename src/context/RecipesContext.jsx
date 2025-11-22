import { createContext, useEffect, useState } from 'react';

export const RecipesContext = createContext();

export function RecipesProvider({ children }) {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('recipes');
    if (saved) setRecipes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  const addRecipe = (recipe) => {
    setRecipes(prev => [...prev, { ...recipe, id: Date.now() }]);
  };

  const updateRecipe = (id, patch) => {
    setRecipes(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const deleteRecipe = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <RecipesContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe }}>
      {children}
    </RecipesContext.Provider>
  );
}

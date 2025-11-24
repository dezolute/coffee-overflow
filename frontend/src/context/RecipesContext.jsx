import { createContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/apiClient';
import { endpoints } from '../services/endpoints';

export const RecipesContext = createContext();

export function RecipesProvider({ children }) {
  const [recipes, setRecipes] = useState([]);


  useEffect(() => {
    let cancelled = false;

    async function load() {

      const saved = localStorage.getItem('recipes');
      if (saved) setRecipes(JSON.parse(saved));

      try {
        const res = await apiFetch(endpoints.recipes.list());
        if (res && Array.isArray(res.recipes || res)) {
          const list = (res.recipes || res).map(r => ({
            id: r.id,
            name: r.title || r.name || '',

            ingredients: (r.ingredients || []).map(i => {
              let quantity = '';
              let unit = '';
              if (i.amount) {
                const parts = String(i.amount).trim().split(/\s+/);
                const num = parseFloat(parts[0]);
                if (!isNaN(num)) {
                  quantity = num;
                  unit = parts.slice(1).join(' ');
                } else {
                  unit = String(i.amount);
                }
              }
              return { id: i.id, name: i.name, quantity, unit };
            }),
            description: r.description || '',

            steps: Array.isArray(r.steps) ? r.steps : [],
            cookingTime: r.cooking_time || r.cookingTime || 0,
            portions: r.portions || 1,
          }));
          if (!cancelled) setRecipes(list);
        }
      } catch (e) {

        console.warn('Failed to load recipes from API:', e.message || e);
      }
    }

    load();
    return () => { cancelled = true };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('recipes', JSON.stringify(recipes)); } catch (e) { }
  }, [recipes]);

  const addRecipe = async (recipe) => {

    const tempId = Date.now();
    const toAdd = { ...recipe, id: tempId };
    setRecipes(prev => [...prev, toAdd]);


    try {
      const body = {
        title: recipe.name,
        description: (recipe.steps || []).join('\n'),
        cooking_time: recipe.cookingTime || 0,
        portions: recipe.portions || 1,
      };
      const res = await apiFetch(endpoints.recipes.create(), { method: 'POST', body });

      if (res && res.id) {
        setRecipes(prev => prev.map(r => r.id === tempId ? { ...r, id: res.id } : r));
      }
    } catch (e) {
      console.warn('Failed to persist recipe to API:', e.message || e);

    }
  };

  const updateRecipe = async (id, patch) => {
    setRecipes(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));

    try {
      const body = {};
      if (patch.name) body.title = patch.name;
      if (patch.steps) body.description = (patch.steps || []).join('\n');
      if (patch.cookingTime !== undefined) body.cooking_time = patch.cookingTime;
      if (patch.portions !== undefined) body.portions = patch.portions;
      await apiFetch(endpoints.recipes.update(id), { method: 'PUT', body });
    } catch (e) {
      console.warn('Failed to update recipe in API:', e.message || e);
    }
  };

  return (
    <RecipesContext.Provider value={{ recipes, addRecipe, updateRecipe }}>
      {children}
    </RecipesContext.Provider>
  );
}

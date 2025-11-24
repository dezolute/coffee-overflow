import { createContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/apiClient';
import { endpoints } from '../services/endpoints';
import moment from 'moment';

export const ShoppingContext = createContext();

export function ShoppingProvider({ children }) {
  const [stock, setStock] = useState([]);
  const [menuPlan, setMenuPlan] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);

  useEffect(() => {
    const s = localStorage.getItem('stock');
    const m = localStorage.getItem('menuPlan');
    const c = localStorage.getItem('checkedItems');
    if (s) setStock(JSON.parse(s));
    if (m) setMenuPlan(JSON.parse(m));
    if (c) setCheckedItems(JSON.parse(c));

    let cancelled = false;
    async function loadFromApi() {
      try {
        const res = await apiFetch(endpoints.stock.list());

        const items = res && (res.pantry || res) ? (res.pantry || res) : [];
        const mapped = items.map(i => {

          let quantity = 0;
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
        });
        if (!cancelled) setStock(mapped);
      } catch (e) {
        console.warn('Failed to load pantry from API:', e.message || e);
      }

      try {
        const mres = await apiFetch(endpoints.menu.list());

        const days = Array.isArray(mres) ? mres : (mres.days || mres || []);
        const flat = [];
        function normalizeDate(dstr) {
          if (!dstr) return null;

          if (typeof dstr === 'string' && dstr.length >= 10) return dstr.slice(0, 10);
          return String(dstr);
        }
        for (const d of days) {
          const dateStr = d.date || d.Date || null;
          const meals = d.meals || d.Meals || {};
          for (const mt of Object.keys(meals)) {
            const arr = meals[mt] || [];
            for (const mi of arr) {
              const recipeId = mi.recipe?.id || mi.recipe_id || (mi.recipe && mi.recipe.id);
              const portions = mi.portions || mi.Portions || mi.menu_portions || 1;
              const normalized = normalizeDate(dateStr);

              const id = mi.id ? String(mi.id) : `${normalized}__${mt}__${recipeId}`;
              flat.push({ id, recipeId, date: normalized, mealType: mt, portions });
            }
          }
        }
        if (!cancelled) setMenuPlan(flat);
      } catch (e) {
        console.warn('Failed to load menu from API:', e.message || e);
      }
    }
    loadFromApi();
    return () => { cancelled = true };
  }, []);

  useEffect(() => localStorage.setItem('stock', JSON.stringify(stock)), [stock]);
  useEffect(() => localStorage.setItem('menuPlan', JSON.stringify(menuPlan)), [menuPlan]);
  useEffect(() => localStorage.setItem('checkedItems', JSON.stringify(checkedItems)), [checkedItems]);

  const addStockItem = async (item) => {

    setStock(prev => mergeByNameUnit([...prev, { ...item, id: Date.now() }]));
    try {
      const amount = `${item.quantity || 0} ${item.unit || ''}`.trim();
      await apiFetch(endpoints.stock.create(), { method: 'POST', body: { name: item.name, amount } });

      const res = await apiFetch(endpoints.stock.list());
      const items = res && (res.pantry || res) ? (res.pantry || res) : [];
      setStock(items.map(i => {
        let quantity = 0; let unit = '';
        if (i.amount) {
          const parts = String(i.amount).trim().split(/\s+/);
          const num = parseFloat(parts[0]);
          if (!isNaN(num)) { quantity = num; unit = parts.slice(1).join(' '); } else { unit = String(i.amount); }
        }
        return { id: i.id, name: i.name, quantity, unit };
      }));
    } catch (e) {
      console.warn('Failed to persist pantry item to API:', e.message || e);
    }
  };

  const removeStockItem = async (id) => {
    setStock(prev => prev.filter(i => i.id !== id));
    try {
      await apiFetch(endpoints.stock.delete(id), { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete pantry item in API:', e.message || e);
    }
  };

  const clearStock = async () => {

    try {
      const res = await apiFetch(endpoints.stock.list());
      const items = res && (res.pantry || res) ? (res.pantry || res) : [];
      for (const it of items) {
        try { await apiFetch(endpoints.stock.delete(it.id), { method: 'DELETE' }); } catch (_) { }
      }
    } catch (e) {

    }
    setStock([]);
  };

  const addMenuEntry = async (entry) => {

    const tempId = `${entry.date}__${entry.mealType}__${entry.recipeId}__${Date.now()}`;
    setMenuPlan(prev => [...prev, { ...entry, id: tempId }]);
    try {


      const dateStr = entry.date; // already in YYYY-MM-DD format from UI
      const body = { recipe_id: entry.recipeId, date: dateStr, meal_type: entry.mealType, portions: entry.portions };
      const postRes = await apiFetch(endpoints.menu.create(), { method: 'POST', body });


      if (postRes && postRes.id) {
        const realId = String(postRes.id);
        setMenuPlan(prev => prev.map(it => it.id === tempId ? { ...it, id: realId } : it));
      }

      const mres = await apiFetch(endpoints.menu.list());
      const days = Array.isArray(mres) ? mres : (mres.days || mres || []);
      const flat = [];
      function normalizeDate(dstr) {
        if (!dstr) return null;
        if (typeof dstr === 'string' && dstr.length >= 10) return dstr.slice(0, 10);
        return String(dstr);
      }
      for (const d of days) {
        const dateStr = d.date || d.Date || null;
        const meals = d.meals || d.Meals || {};
        for (const mt of Object.keys(meals)) {
          const arr = meals[mt] || [];
          for (const mi of arr) {
            const recipeId = mi.recipe?.id || mi.recipe_id || (mi.recipe && mi.recipe.id);
            const portions = mi.portions || mi.Portions || mi.menu_portions || 1;
            const normalized = normalizeDate(dateStr);
            const id = `${normalized}__${mt}__${recipeId}`;
            flat.push({ id, recipeId, date: normalized, mealType: mt, portions });
          }
        }
      }
      setMenuPlan(flat);
    } catch (e) {
      console.warn('Failed to add menu entry to API:', e.message || e);
    }
  };

  const removeMenuEntry = async (id) => {

    setMenuPlan(prev => prev.filter(e => e.id !== id));


    try {

      await apiFetch(endpoints.menu.delete(id), { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete menu entry in API:', e.message || e);

      try {
        const mres = await apiFetch(endpoints.menu.list());
        const days = Array.isArray(mres) ? mres : (mres.days || mres || []);
        const flat = [];
        function normalizeDate(dstr) {
          if (!dstr) return null;
          if (typeof dstr === 'string' && dstr.length >= 10) return dstr.slice(0, 10);
          return String(dstr);
        }
        for (const d of days) {
          const dateStr = d.date || d.Date || null;
          const meals = d.meals || d.Meals || {};
          for (const mt of Object.keys(meals)) {
            const arr = meals[mt] || [];
            for (const mi of arr) {
              const recipeId = mi.recipe?.id || mi.recipe_id || (mi.recipe && mi.recipe.id);
              const portions = mi.portions || mi.Portions || mi.menu_portions || 1;
              const normalized = normalizeDate(dateStr);
              const id2 = `${normalized}__${mt}__${recipeId}`;
              flat.push({ id: id2, recipeId, date: normalized, mealType: mt, portions });
            }
          }
        }
        setMenuPlan(flat);
      } catch (err) {
        console.warn('Failed to reload menu after delete failure:', err.message || err);
      }
    }
  };

  const toggleChecked = (key) => {
    setCheckedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };
  const clearChecked = () => setCheckedItems([]);

  function mergeByNameUnit(items) {
    const map = new Map();
    for (const it of items) {
      const key = `${it.name}__${(it.unit || '').toLowerCase()}`;
      if (!map.has(key)) map.set(key, { ...it });
      else map.set(key, { ...map.get(key), quantity: Number(map.get(key).quantity) + Number(it.quantity) });
    }
    return Array.from(map.values()).map((v, idx) => ({ ...v, id: v.id || Date.now() + idx }));
  }

  const value = {
    stock,
    addStockItem,
    removeStockItem,
    clearStock,
    menuPlan,
    addMenuEntry,
    removeMenuEntry,
    checkedItems,
    toggleChecked,
    clearChecked,
    mergeByNameUnit,
  };

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>;
}

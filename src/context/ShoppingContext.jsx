import { createContext, useEffect, useState } from 'react';

export const ShoppingContext = createContext();

/*
  Структуры:
  - stock: [{ id, name, quantity, unit }]
  - menuPlan: [{ id, recipeId, date, mealType, portions }]
  - shoppingItems: вычисляемые из menuPlan + recipes с учетом stock
*/

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
  }, []);

  useEffect(() => localStorage.setItem('stock', JSON.stringify(stock)), [stock]);
  useEffect(() => localStorage.setItem('menuPlan', JSON.stringify(menuPlan)), [menuPlan]);
  useEffect(() => localStorage.setItem('checkedItems', JSON.stringify(checkedItems)), [checkedItems]);

  const addStockItem = (item) => {
    setStock(prev => mergeByNameUnit([...prev, { ...item, id: Date.now() }]));
  };
  const removeStockItem = (id) => setStock(prev => prev.filter(i => i.id !== id));
  const clearStock = () => setStock([]);

  const addMenuEntry = (entry) => {
    setMenuPlan(prev => [...prev, { ...entry, id: Date.now() }]);
  };
  const removeMenuEntry = (id) => setMenuPlan(prev => prev.filter(e => e.id !== id));

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

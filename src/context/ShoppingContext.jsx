import { createContext, useState } from 'react';

export const ShoppingContext = createContext();

export function ShoppingProvider({ children }) {
  const [shoppingItems, setShoppingItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);

  // Парсинг ингредиентов из текста рецепта
  // Ожидаемый формат строк: "Помидоры — 3 шт" или "Молоко — 1 л"
  const addIngredients = (ingredientsText) => {
    if (!ingredientsText) return;

    const lines = ingredientsText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const newItems = lines.map((line, index) => {
      // Разделитель — длинное тире (em dash). Если у тебя дефисы, замени на '-'
      const [namePart, restPart] = line.split('—').map(s => s?.trim());
      const name = namePart || line;

      let quantity = 1;
      let unit = 'шт';

      if (restPart) {
        const tokens = restPart.split(' ').filter(Boolean);
        // Первый токен пытаемся распарсить как число
        const q = Number(tokens[0]);
        if (!Number.isNaN(q)) {
          quantity = q;
          unit = tokens.slice(1).join(' ').trim() || unit;
        } else {
          // Если не число, считаем, что указана только единица измерения
          unit = restPart;
        }
      }

      return {
        id: Date.now() + index,
        name,
        quantity,
        unit,
      };
    });

    // Мержим одинаковые продукты: суммируем количество по названию и единице
    setShoppingItems(prev => {
      const map = new Map();

      const all = [...prev, ...newItems];
      for (const item of all) {
        const key = `${item.name}__${item.unit}`.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          map.set(key, {
            ...existing,
            quantity: Number(existing.quantity) + Number(item.quantity),
          });
        } else {
          map.set(key, { ...item });
        }
      }

      return Array.from(map.values());
    });
  };

  const toggleChecked = (id) => {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const clearChecked = () => setCheckedItems([]);

  const clearList = () => {
    setShoppingItems([]);
    setCheckedItems([]);
  };

  return (
    <ShoppingContext.Provider
      value={{
        shoppingItems,
        checkedItems,
        setShoppingItems,
        addIngredients,
        toggleChecked,
        clearChecked,
        clearList,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

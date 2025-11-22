import { useContext, useMemo, useState } from 'react';
import Navbar from '../layout/Navbar';
import { RecipesContext } from '../../context/RecipesContext';
import { ShoppingContext } from '../../context/ShoppingContext';
import { Card, Switch } from 'antd';

export default function SuggestPage() {
  const { recipes } = useContext(RecipesContext);
  const { stock } = useContext(ShoppingContext);
  const [partial, setPartial] = useState(false);

  const stockMap = useMemo(() => {
    const m = new Map();
    stock.forEach(s => m.set(`${s.name.toLowerCase()}__${(s.unit || '').toLowerCase()}`, Number(s.quantity)));
    return m;
  }, [stock]);

  const suggestions = useMemo(() => {
    return recipes.filter(r => {
      const checks = r.ingredients.map(i => {
        const key = `${i.name.toLowerCase()}__${(i.unit || '').toLowerCase()}`;
        const have = stockMap.get(key) || 0;
        return have >= Number(i.quantity);
      });
      const all = checks.every(Boolean);
      const some = checks.some(Boolean);
      return partial ? (all || some) : all;
    });
  }, [recipes, stockMap, partial]);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-title">🍳 Подбор рецептов</div>
        <div className="card" style={{ padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="subheading">Рецепты, которые можно приготовить из текущих запасов</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="list-item-muted">Разрешить частичные совпадения</span>
            <Switch checked={partial} onChange={setPartial} />
          </div>
        </div>

        <div className="cards-grid">
          {suggestions.map(r => (
            <Card key={r.id} className="card" title={<span style={{ color: 'var(--primary)', fontWeight: 700 }}>{r.name}</span>}>
              <div className="subheading">Ингредиенты</div>
              <ul style={{ paddingLeft: 18 }}>
                {r.ingredients.map((i, idx) => (
                  <li key={idx} className="list-item-muted">
                    {i.name} — {i.quantity} {i.unit}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {!suggestions.length && (
          <div className="card" style={{ padding: 16, marginTop: 16 }}>
            Нет подходящих рецептов под текущие запасы
          </div>
        )}
      </div>
    </div>
  );
}

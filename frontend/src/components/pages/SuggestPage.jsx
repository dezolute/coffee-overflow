import { useContext, useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import { RecipesContext } from '../../context/RecipesContext';
import { ShoppingContext } from '../../context/ShoppingContext';
import { Card, Switch, Spin } from 'antd';
import { apiFetch } from '../../services/apiClient';
import { endpoints } from '../../services/endpoints';

export default function SuggestPage() {


  useContext(RecipesContext);
  useContext(ShoppingContext);
  const [partial, setPartial] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch(endpoints.suggest.recipes());




        let list = [];
        if (res) {
          if (Array.isArray(res)) {
            list = res;
          } else if (Array.isArray(res.suggestions)) {
            list = res.suggestions;
          } else if (res.suggestions && typeof res.suggestions === 'object') {

            list = Object.values(res.suggestions);
          } else if (typeof res === 'object') {

            list = [res];
          } else {

            console.warn('Unexpected /api/suggest-recipes response format:', res);
            list = [];
          }
        }

        if (!cancelled) setSuggestions(list);
      } catch (e) {
        console.warn('Failed to load suggestions from API:', e.message || e);
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

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
          {loading ? <Spin /> : (
            suggestions
              .filter(s => partial ? true : s.can_cook || s.CanCook || s.canCook)
              .map(s => {
                const r = s.recipe || s.Recipe || {};
                const title = r.title || r.name || 'Рецепт';
                const missing = s.missing_ingredients || s.MissingIngredients || s.Missing || [];
                return (
                  <Card key={r.id} className="card" title={<span style={{ color: 'var(--primary)', fontWeight: 700 }}>{title}</span>}>
                    <div className="subheading">Ингредиенты</div>
                    <ul style={{ paddingLeft: 18 }}>
                      {(r.ingredients || r.Ingredients) ? (r.ingredients || r.Ingredients).map((i, idx) => (
                        <li key={idx} className="list-item-muted">{i.name} — {i.amount || i.quantity || ''}</li>
                      )) : null}
                    </ul>
                    {missing && missing.length > 0 && (
                      <div style={{ marginTop: 8 }} className="list-item-muted">Недостаёт: {missing.join(', ')}</div>
                    )}
                  </Card>
                );
              })
          )}
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

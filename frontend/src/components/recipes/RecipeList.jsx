import { Card, List } from 'antd';
import { useState } from 'react';
import RecipeModal from './RecipeModal';

export default function RecipeList({ recipes }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  if (!recipes.length) {
    return (
      <div className="card" style={{ padding: 16 }}>
        Пока рецептов нет. Добавьте первый рецепт, чтобы начать планирование меню.
      </div>
    );
  }

  return (
    <>
      <div className="cards-grid">
        {recipes.map(r => (
          <Card
            key={r.id}
            title={<span style={{ color: 'var(--primary)', fontWeight: 700 }}>{r.name}</span>}
            className="card"
            styles={{ body: { paddingTop: 8 } }}
            hoverable
            onClick={() => { setSelected(r); setModalOpen(true); }}
            style={{ cursor: 'pointer' }}
          >
            <div className="subheading">Ингредиенты</div>
            <List
              size="small"
              dataSource={r.ingredients}
              renderItem={(i) => (
                <List.Item className="list-item-muted">
                  {i.name} { (i.quantity || i.unit) ? (<span>— {i.quantity}{i.quantity ? ' ' : ''}{i.unit}</span>) : (<span>—</span>) }
                </List.Item>
              )}
            />
            {r.description ? (
              <>
                <div className="subheading" style={{ marginTop: 12 }}>Описание</div>
                <div className="muted" style={{ paddingTop: 6, paddingBottom: 6 }}>{r.description}</div>
              </>
            ) : null}
            {r.steps?.length ? (
              <>
                <div className="subheading" style={{ marginTop: 12 }}>Шаги</div>
                <List
                  size="small"
                  dataSource={r.steps}
                  renderItem={(s, idx) => (
                    <List.Item className="list-item-muted">
                      {idx + 1}. {s}
                    </List.Item>
                  )}
                />
              </>
            ) : null}
          </Card>
        ))}
      </div>
      <RecipeModal open={modalOpen} onClose={() => setModalOpen(false)} recipe={selected} />
    </>
  );
}

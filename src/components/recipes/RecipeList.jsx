import { Card, Button, List } from 'antd';

export default function RecipeList({ recipes, onDelete }) {
  if (!recipes.length) {
    return (
      <div className="card" style={{ padding: 16 }}>
        Пока рецептов нет. Добавьте первый рецепт, чтобы начать планирование меню.
      </div>
    );
  }

  return (
    <div className="cards-grid">
      {recipes.map(r => (
        <Card
          key={r.id}
          title={<span style={{ color: 'var(--primary)', fontWeight: 700 }}>{r.name}</span>}
          className="card"
          extra={<Button danger size="small" onClick={() => onDelete(r.id)}>Удалить</Button>}
          styles={{ body: { paddingTop: 8 } }}
        >
          <div className="subheading">Ингредиенты</div>
          <List
            size="small"
            dataSource={r.ingredients}
            renderItem={(i) => (
              <List.Item className="list-item-muted">
                {i.name} — {i.quantity} {i.unit}
              </List.Item>
            )}
          />
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
  );
}

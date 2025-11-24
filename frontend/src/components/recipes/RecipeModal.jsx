import { Modal, List } from 'antd';

export default function RecipeModal({ open, onClose, recipe }) {
  if (!recipe) return null;
  return (
    <Modal open={open} onCancel={onClose} footer={null} title={recipe.name}>
      <div>
        <div className="subheading">Ингредиенты</div>
        <List
          size="small"
          dataSource={recipe.ingredients}
          renderItem={(i) => (
            <List.Item className="list-item-muted">
              {i.name} {(i.quantity || i.unit) ? (<span>— {i.quantity}{i.quantity ? ' ' : ''}{i.unit}</span>) : (<span>—</span>)}
            </List.Item>
          )}
        />
        {recipe.description ? (
          <>
            <div className="subheading" style={{ marginTop: 12 }}>Описание</div>
            <div className="muted" style={{ paddingTop: 6, paddingBottom: 6 }}>{recipe.description}</div>
          </>
        ) : null}
        {recipe.steps?.length ? (
          <>
            <div className="subheading" style={{ marginTop: 12 }}>Шаги</div>
            <List
              size="small"
              dataSource={recipe.steps}
              renderItem={(s, idx) => (
                <List.Item className="list-item-muted">
                  {idx + 1}. {s}
                </List.Item>
              )}
            />
          </>
        ) : null}
      </div>
    </Modal>
  );
}

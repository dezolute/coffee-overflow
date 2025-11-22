import { Modal, Typography, Divider } from 'antd';

const { Title, Paragraph } = Typography;

export default function RecipeDetailModal({ recipe, onClose }) {
  return (
    <Modal
      title={recipe?.name}
      open={!!recipe}
      onCancel={onClose}
      footer={null}
      centered
    >
      {recipe && (
        <>
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-64 object-cover rounded-xl mb-4 shadow"
          />

          <div className="grid grid-cols-2 gap-2 mb-2">
            <Paragraph className="!mb-0"><b>Категория:</b> {recipe.category}</Paragraph>
            <Paragraph className="!mb-0"><b>Время:</b> {recipe.time} мин</Paragraph>
            <Paragraph className="!mb-0"><b>Сложность:</b> {recipe.difficulty}</Paragraph>
          </div>

          <Divider className="my-4" />

          <Title level={5} className="!mb-2">Ингредиенты</Title>
          <Paragraph className="whitespace-pre-line">{recipe.ingredients}</Paragraph>

          <Title level={5} className="!mb-2">Шаги приготовления</Title>
          <Paragraph className="whitespace-pre-line">{recipe.steps}</Paragraph>
        </>
      )}
    </Modal>
  );
}

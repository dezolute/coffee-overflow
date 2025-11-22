import { Card, Tag, Button, Typography } from 'antd';

const { Title } = Typography;

export default function RecipeCard({ recipe, onOpen }) {
  return (
    <Card
      hoverable
      cover={
        <img
          alt={recipe.name}
          src={recipe.image}
          className="h-52 w-full object-cover rounded-t-2xl"
        />
      }
      className="shadow-sm rounded-2xl transition-transform hover:scale-[1.01]"
    >
      <Title level={4} className="!mb-2 !text-slate-800">{recipe.name}</Title>

      <div className="flex flex-wrap gap-2 mb-3">
        <Tag color="blue" className="!text-sm !px-2 !py-[2px]">{recipe.category}</Tag>
        <Tag color="green" className="!text-sm !px-2 !py-[2px]">{recipe.time} мин</Tag>
        <Tag color="orange" className="!text-sm !px-2 !py-[2px]">{recipe.difficulty}</Tag>
      </div>

      <Button type="link" onClick={onOpen} className="!px-0">
        Подробнее
      </Button>
    </Card>
  );
}

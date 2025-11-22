import { Tag } from 'antd';

export default function MealSlot({ meal }) {
  return (
    <div className="flex items-center gap-2">
      <Tag color="blue">{meal.mealType}</Tag>
      <span>{meal.recipe.name} — {meal.portions} пор.</span>
    </div>
  );
}

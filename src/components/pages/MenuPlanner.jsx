import { useState, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Empty } from 'antd';
import AddMealDialog from '../menu/AddMealDialog';
import { RecipesContext } from '../../context/RecipesContext';
import { ShoppingContext } from '../../context/ShoppingContext';

const localizer = momentLocalizer(moment);

export default function MenuPlanner() {
  const { recipes } = useContext(RecipesContext);
  const { addIngredients } = useContext(ShoppingContext);

  // [{id, recipe, date, mealType, portions}]
  const [menuPlan, setMenuPlan] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);

  const events = menuPlan.map(item => ({
    id: item.id,
    title: `${item.recipe.name} (${item.portions} пор.) — ${item.mealType}`,
    start: new Date(item.date),
    end: new Date(item.date),
    resource: item,
  }));

  return (
    <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 ring-1 ring-slate-200">
      <h2 className="text-xl font-bold mb-4">📅 Планирование меню</h2>

      {recipes.length === 0 ? (
        <Empty description="Сначала добавьте рецепты в каталоге" />
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          selectable
          onSelectSlot={(slotInfo) => {
            setSelectedDate(slotInfo.start);
            setMealDialogOpen(true);
          }}
          onSelectEvent={(event) => {
            setSelectedDate(event.start);
            setMealDialogOpen(true);
          }}
        />
      )}

      <AddMealDialog
        open={mealDialogOpen}
        onClose={() => setMealDialogOpen(false)}
        date={selectedDate}
        recipes={recipes}
        onSave={(meal) => {
          const entry = { id: Date.now(), ...meal };
          setMenuPlan(prev => [...prev, entry]);

          // Добавляем ингредиенты выбранного рецепта в список покупок
          addIngredients(meal.recipe.ingredients);

          setMealDialogOpen(false);
        }}
      />
    </div>
  );
}

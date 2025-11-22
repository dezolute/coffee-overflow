import { useContext, useMemo, useState } from 'react';
import Navbar from '../layout/Navbar';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AddMealDialog from '../menu/AddMealDialog';
import { RecipesContext } from '../../context/RecipesContext';
import { ShoppingContext } from '../../context/ShoppingContext';
import { Button, List, Tag } from 'antd';

const localizer = momentLocalizer(moment);

export default function MenuPlanner() {
  const { recipes } = useContext(RecipesContext);
  const { menuPlan, addMenuEntry, removeMenuEntry } = useContext(ShoppingContext);

  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(null);
  const [open, setOpen] = useState(false);

  const events = useMemo(() => {
    return menuPlan.map(item => {
      const recipe = recipes.find(r => r.id === item.recipeId);
      return {
        id: item.id,
        title: `${recipe?.name || 'Рецепт'} (${item.portions}) — ${item.mealType}`,
        start: new Date(item.date),
        end: new Date(item.date),
        resource: item,
      };
    });
  }, [menuPlan, recipes]);

  const dayEntries = useMemo(() => {
    const today = selectedDate ? moment(selectedDate).startOf('day').valueOf() : null;
    if (!today) return [];
    return menuPlan.filter(e => moment(e.date).startOf('day').valueOf() === today);
  }, [menuPlan, selectedDate]);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2 className="page-title">📅 Планирование меню</h2>

        <div className="card" style={{ padding: 8 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            selectable
            view={view}
            date={date}
            onView={(newView) => setView(newView)}
            onNavigate={(newDate) => setDate(newDate)}
            onSelectSlot={(slot) => { setSelectedDate(slot.start); setOpen(true); }}
            onSelectEvent={(ev) => { setSelectedDate(ev.start); }}
          />
        </div>

        <AddMealDialog
          open={open}
          onClose={() => setOpen(false)}
          date={selectedDate}
          recipes={recipes}
          onSave={(entry) => { addMenuEntry(entry); setOpen(false); }}
        />

        {selectedDate && (
          <div className="section-gap">
            <div className="card" style={{ padding: 16 }}>
              <h3 className="subheading">Блюда на выбранный день</h3>
              <List
                dataSource={dayEntries}
                renderItem={(e) => {
                  const recipe = recipes.find(r => r.id === e.recipeId);
                  return (
                    <List.Item
                      actions={[
                        <Button danger size="small" onClick={() => removeMenuEntry(e.id)}>Удалить</Button>
                      ]}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>{recipe?.name}</span>
                        <Tag color="blue">{e.mealType}</Tag>
                        <span className="badge">Порций: {e.portions}</span>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

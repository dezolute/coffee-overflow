import { useState } from 'react';
import { Button, Card, Empty } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import FilterPanel from '../filters/FilterPanel';
import SearchBar from '../filters/SearchBar';
import RecipeCard from '../recipe/RecipeCard';
import RecipeFormModal from '../recipe/RecipeFormModal';
import RecipeDetailModal from '../recipe/RecipeDetailModal';
import { DIFFICULTY_ORDER } from '../../utils/constants';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [filters, setFilters] = useState({ category: '', time: '', difficulty: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [sortOption, setSortOption] = useState('');

  const filteredRecipes = recipes
    .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(r => !filters.category || r.category === filters.category)
    .filter(r => {
      if (!filters.time) return true;
      const limit = Number(filters.time);
      return Number(r.time) <= limit;
    })
    .filter(r => !filters.difficulty || r.difficulty === filters.difficulty)
    .sort((a, b) => {
      if (sortOption === 'time') return Number(a.time) - Number(b.time);
      if (sortOption === 'difficulty') return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      return 0;
    });

  return (
    <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 ring-1 ring-slate-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="flex items-center gap-3">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setFormOpen(true)}
          >
            Добавить рецепт
          </Button>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="py-16">
          <Empty description="Пока нет рецептов. Добавь первый — он задаст тон!" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOpen={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      )}

      <RecipeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(values) => {
          const newRecipe = { id: Date.now(), ...values };
          setRecipes(prev => [newRecipe, ...prev]);
          setFormOpen(false);
        }}
      />

      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}

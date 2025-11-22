import { useContext } from 'react';
import Navbar from '../layout/Navbar';
import { RecipesContext } from '../../context/RecipesContext';
import RecipeForm from '../recipes/RecipeForm';
import RecipeList from '../recipes/RecipeList';

export default function RecipesPage() {
  const { recipes, addRecipe, deleteRecipe } = useContext(RecipesContext);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2 className="page-title">📖 Каталог рецептов</h2>

        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <RecipeForm onAdd={addRecipe} />
        </div>

        <RecipeList recipes={recipes} onDelete={deleteRecipe} />
      </div>
    </div>
  );
}

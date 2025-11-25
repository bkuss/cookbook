import { Header } from '@/components/layout/header';
import { RecipeForm } from '@/components/recipes/recipe-form';

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Neues Rezept" showBack />
      <main className="p-4">
        <RecipeForm />
      </main>
    </div>
  );
}

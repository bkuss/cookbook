import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { RecipeForm } from '@/components/recipes/recipe-form';

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Neues Rezept" showBack />
      <main className="p-4">
        <RecipeForm />
      </main>
      <BottomNav />
    </div>
  );
}
